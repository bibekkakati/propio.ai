const AttachmentService = require("../services/attachment.service");
const { ValidationError } = require("../utils/error.util");
const { ErrorResponse, SuccessResponse } = require("../utils/response.util");

const uploadFile = async (req, res) => {
    try {
        const { pid: propertyId } = req.query;

        if (!propertyId) {
            throw new ValidationError("Property ID is required!");
        }

        req.setTimeout(5 * 60 * 1000); // 5 minutes per request
        res.setTimeout(5 * 60 * 1000); // 5 minutes per response

        const { filename, label, mimetype } =
            await AttachmentService.handleFileUpload(req, propertyId);

        const attachmentId = await AttachmentService.insertAttachment(
            propertyId,
            filename,
            mimetype,
            label,
        );

        // Send success message
        return SuccessResponse(res, {
            data: {
                _id: attachmentId,
                label,
            },
        });
    } catch (error) {
        /**
         * In case of file upload event
         * It is possible that request is closed by concurrent process
         */
        if (res.headersSent) {
            return;
        }

        return ErrorResponse(error, req, res);
    }
};

const deleteFile = async (req, res) => {
    const { userId } = req.user;
    const { aid: attachmentId } = req.query;

    if (!attachmentId) {
        throw new ValidationError("Attachment ID is required");
    }

    await AttachmentService.deleteAttachment(attachmentId, userId);

    return SuccessResponse(res, {
        message: "Deleted successfully",
    });
};

const downloadFile = async (req, res) => {
    const { userId } = req.user;
    const { aid: attachmentId } = req.query;

    if (!attachmentId) {
        throw new ValidationError("Attachment ID is required");
    }

    const { url } = await AttachmentService.getAttachmentURL(
        attachmentId,
        userId,
    );

    return SuccessResponse(res, {
        data: url,
    });
};

module.exports = {
    uploadFile,
    deleteFile,
    downloadFile,
};
