const {
    S3Client,
    GetObjectCommand,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const R2Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
    },
});

/**
 * @param {string} bucket
 * @param {string} key
 * @param {any} body
 * @param {string} contentType
 * @param {boolean} [private]
 */
const uploadStream = async (
    bucket,
    key,
    body,
    contentType,
    private = false
) => {
    const upload = new Upload({
        client: R2Client,
        params: {
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
            ACL: private ? "private" : "public-read",
        },
    });

    await upload.done();
};

/**
 * @param {string} bucket
 * @param {string} key
 * @param {number} expiresIn
 */
const getObjectDownloadUrl = async (bucket, key, expiresIn) => {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(R2Client, cmd, { expiresIn });
};

/**
 * @param {string} bucket
 * @param {string} key
 */
const deleteObject = async (bucket, key) => {
    const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await R2Client.send(cmd);
};

const R2 = {
    uploadStream,
    getObjectDownloadUrl,
    deleteObject,
};

module.exports = R2;
