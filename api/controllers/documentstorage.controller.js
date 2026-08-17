const AttachmentService = require("../services/attachment.service");
const DocumentStorageService = require("../services/documentstorage.service");
const { SuccessResponse } = require("../utils/response.util");

module.exports = {
    addDocument: async (req, res) => {
        const { userId } = req.user;
        const {
            propertyId,
            attachmentId,
            title,
            type,
            effectiveDate,
            expiryDate,
        } = req.body;

        const documentId = await DocumentStorageService.upsertDocument(
            {
                propertyId,
                attachmentId,
                title,
                type,
                effectiveDate: new Date(effectiveDate).getTime(),
                expiryDate: expiryDate ? new Date(expiryDate).getTime() : "",
            },
            userId,
        );

        return SuccessResponse(res, {
            data: documentId,
        });
    },
    updateDocument: async (req, res) => {
        const { userId } = req.user;
        const {
            documentId,
            propertyId,
            attachmentId,
            title,
            type,
            effectiveDate,
            expiryDate,
        } = req.body;

        await DocumentStorageService.upsertDocument(
            {
                documentId,
                propertyId,
                attachmentId,
                title,
                type,
                effectiveDate: new Date(effectiveDate).getTime(),
                expiryDate: expiryDate ? new Date(expiryDate).getTime() : "",
            },
            userId,
        );

        return SuccessResponse(res, {
            data: documentId,
        });
    },
    deleteDocument: async (req, res) => {
        const { userId } = req.user;
        const { did: documentId } = req.query;

        await DocumentStorageService.deleteDocument(documentId, userId);

        return SuccessResponse(res, {
            data: documentId,
        });
    },
    getDocumentsByProperty: async (req, res) => {
        const { userId } = req.user;
        const { pid: propertyId } = req.query;

        const documents = await DocumentStorageService.fetchDocumentsByProperty(
            propertyId,
            userId,
        );

        return SuccessResponse(res, {
            data: documents,
        });
    },
    getDocumentDetails: async (req, res) => {
        const { userId } = req.user;
        const { did: documentId } = req.query;

        const document = await DocumentStorageService.fetchDocumentById(
            documentId,
            userId,
        );

        const attachment = await AttachmentService.fetchAttachment(
            document.attachmentId,
            userId,
        );

        document.attachment = {
            _id: attachment._id,
            label: attachment.label,
        };

        delete document.attachmentId;

        return SuccessResponse(res, {
            data: document,
        });
    },
};
