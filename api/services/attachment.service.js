const Busboy = require("busboy");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { promisify } = require("util");
const { pipeline } = require("stream");
const { customAlphabet } = require("nanoid");
const { ValidationError, AppError, NotFoundError } = require("../utils/error.util");
const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
);
const R2 = require("../infrastructure/r2.client");
const {
    generateFilename,
    ensureUploadDir,
    deleteLocalFile,
} = require("../utils/attachment.util");
const Attachment = require("../models/Attachment");
const PropertyService = require("./property.service");

const R2_BUCKET_DOCS = process.env.R2_BUCKET_DOCS;

const pipelineAsync = promisify(pipeline);

const ALLOWED_MIMES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/heic",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * Loads a file from given url/path and uploads it to R2 storage.
 * Uses streaming to efficiently handle large files.
 *
 * @param {string} filepath - The path of file could be a remote URL or local directory
 * @param {string} filename - The filename to use when uploading to R2
 * @param {string} mimetype - The mime type of the file
 * @returns {Promise<boolean>} Returns true if upload succeeds, false otherwise.
 */
const uploadFile = async (filepath, filename, mimetype) => {
    let fileStream = null;

    try {
        // Determine if this is a remote URL or local file
        if (/^https?:\/\//i.test(filepath)) {
            const response = await axios.get(filepath, {
                responseType: "stream",
            });

            fileStream = response.data; // this is a readable stream
        } else {
            // Local file
            fileStream = fs.createReadStream(filepath);
        }

        await R2.uploadStream(
            R2_BUCKET_DOCS,
            filename,
            fileStream,
            mimetype,
            true,
        );
        console.log(`${filename} uploaded successfully.`);

        return true;
    } catch (error) {
        console.error("Error uploading:", error?.message);
        return false;
    } finally {
        // Destroy stream after upload
        if (fileStream && !fileStream.destroyed) {
            fileStream.destroy();
        }
    }
};

const handleFileUpload = (req, propertyId) => {
    return new Promise(async (resolve, reject) => {
        const uploadDir = await ensureUploadDir();

        const fileInfo = {
            uploadedLocal: false,
            attachmentId: "",
            filename: "",
            label: "",
            extension: "",
            mimetype: "",
            localpath: "",
        };

        let fileStream;
        let writeStream;
        let aborted = false;

        const busboy = Busboy({
            headers: req.headers,
            limits: {
                fileSize: MAX_FILE_SIZE,
                files: 1,
                fields: 20,
                fieldSize: 1024 * 1024,
            },
        });

        let filePromise = null;

        busboy.on("file", (_, file, info) => {
            fileStream = file;

            filePromise = (async () => {
                try {
                    const { filename, mimeType } = info;

                    if (!filename || !ALLOWED_MIMES.includes(mimeType)) {
                        aborted = true;
                        file.destroy();
                        busboy.destroy();
                        throw new ValidationError(
                            "File is corrupted or not supported",
                        );
                    }

                    let extension = path.extname(filename);

                    fileInfo.extension = extension;
                    fileInfo.label = filename;

                    fileInfo.localpath = path.join(
                        uploadDir,
                        `${nanoid(10)}${extension}`,
                    );
                    writeStream = fs.createWriteStream(fileInfo.localpath);

                    let fileSize = 0;

                    file.on("data", (data) => {
                        fileSize += data.length;

                        if (fileSize > MAX_FILE_SIZE && !aborted) {
                            aborted = true;
                            file.destroy();
                            writeStream.destroy();
                            busboy.destroy(
                                new ValidationError(
                                    `File size exceeds ${MAX_FILE_SIZE}MB limit`,
                                ),
                            );
                        }
                    });

                    await pipelineAsync(file, writeStream);

                    if (aborted) return;

                    fileInfo.mimetype = mimeType;
                    fileInfo.uploadedLocal = true;
                } catch (err) {
                    if (fileInfo.localpath) {
                        await fs.promises
                            .unlink(fileInfo.localpath)
                            .catch(() => { });
                    }
                    throw err;
                }
            })();
        });

        busboy.on("finish", async () => {
            try {
                if (filePromise) {
                    await filePromise;
                }

                if (!fileInfo.uploadedLocal) {
                    throw new ValidationError("No file uploaded");
                }

                fileInfo.filename = generateFilename(
                    fileInfo.extension,
                    propertyId,
                );

                const uploadedR2 = await uploadFile(
                    fileInfo.localpath,
                    fileInfo.filename,
                    fileInfo.mimetype,
                );

                if (!uploadedR2) {
                    throw new AppError("File upload failed");
                }

                deleteLocalFile(fileInfo.localpath);
                resolve(fileInfo);
            } catch (err) {
                reject(err);
            }
        });

        busboy.on("error", async (err) => {
            if (fileStream && !fileStream.destroyed) {
                fileStream.destroy();
            }

            if (writeStream && !writeStream.destroyed) {
                writeStream.destroy();
            }

            if (fileInfo.localpath) {
                await fs.promises.unlink(fileInfo.localpath).catch(() => { });
            }

            reject(err);
        });

        req.on("error", (err) => {
            busboy.destroy(err);
        });

        req.pipe(busboy);
    });
};

/**
 * Inserts the attachment details in database
 *
 * @param {string} propertyId - The ID of the property to which attachment belongs
 * @param {string} filename - The filename as stored in object storage
 * @param {string} mimetype - The mime type of the file
 * @param {string} label - The original filename of the file
 * @returns {Promise<ObjectID>} A Promise that resolves with attachment ID when details are saved
 */
const insertAttachment = async (propertyId, filename, mimetype, label) => {
    const attachment = await new Attachment({
        propertyId: propertyId,
        filename,
        mimetype,
        label,
    }).save();

    return attachment._id;
};

/**
 * Fetch multiple attachments for given IDs
 *
 * @param {string[]} attachmentIds - The ID of the attachment(s)
 * @returns {Promise<{_id: string, label: string}[]>} A Promise that resolves with attachment details
 */
const fetchMultipleAttachments = async (attachmentIds) => {
    if (!attachmentIds.length) {
        return [];
    }

    const attachments = await Attachment.find(
        {
            _id: { $in: attachmentIds },
        },
        {
            _id: 1,
            label: 1,
            filename: 1,
        },
    ).lean();

    return attachments;
};

/**
 * Fetch a single attachment object for given ID
 *
 * @param {string} attachmentId - The ID of the attachment
 * @returns {Promise<Object>} A Promise that resolves with attachment details
 */
const fetchAttachment = async (attachmentId, userId) => {
    const attachment = await Attachment.findById(attachmentId, {
        _id: 1,
        propertyId: 1,
        filename: 1,
        mimetype: 1,
        label: 1,
    });

    if (!attachment) {
        throw new NotFoundError("Attachment not found");
    }

    await PropertyService.hasPropertyAccess(attachment.propertyId, userId);

    return attachment;
};

/**
 * Delete the attachment for given ID
 *
 * @param {string} attachmentId - The ID of the attachment
 * @returns {Promise<void>} A void Promise
 */
const deleteAttachment = async (attachmentId, userId) => {
    // It will fetch and validate the access
    const attachment = await fetchAttachment(attachmentId, userId);

    // Remove from database
    await Attachment.deleteOne({ _id: attachmentId });

    // Remove from object storage
    R2.deleteObject(R2_BUCKET_DOCS, attachment.filename)
        .then(() => console.log(`${attachment.filename} deleted successfully.`))
        .catch((e) => console.error(e));
};

/**
 * Generates a pre-signed URL for downloading a document from object storage.
 * The URL expires after 5 minutes.
 *
 * @param {string} attachmentId - The attachment ID to download
 * @returns {Promise<{url: string, mimetype: string}>} A pre-signed URL valid for 5 minutes and mimetype of the file.
 */
const getAttachmentURL = async (attachmentId, userId) => {
    // It will fetch and also validate the access
    const attachment = await fetchAttachment(attachmentId, userId);
    const url = await R2.getObjectDownloadUrl(
        R2_BUCKET_DOCS,
        attachment.filename,
        60 * 5,
    );

    return { url, mimetype: attachment.mimetype };
};

const AttachmentService = Object.freeze({
    handleFileUpload,
    insertAttachment,
    fetchAttachment,
    fetchMultipleAttachments,
    deleteAttachment,
    getAttachmentURL,
});

module.exports = AttachmentService;
