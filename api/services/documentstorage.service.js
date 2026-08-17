const mongoose = require("mongoose");
const DocumentStorage = require("../models/DocumentStorage");
const { AppError, ValidationError, NotFoundError } = require("../utils/error.util");
const PropertyService = require("./property.service");
const { isDocumentTypeValid } = require("../utils/common.util");
const AttachmentService = require("./attachment.service");

const upsertDocument = async (
    {
        documentId,
        propertyId,
        attachmentId,
        title,
        type,
        effectiveDate,
        expiryDate,
    },
    userId,
) => {
    if (!propertyId || !userId || !title || !type || !effectiveDate) {
        throw new ValidationError("Missing required parameters");
    }

    // Validate property access
    await PropertyService.hasPropertyAccess(propertyId, userId);

    // Validate document type
    if (!isDocumentTypeValid(type)) {
        throw new ValidationError("Invalid document type");
    }

    const payload = {
        propertyId: propertyId,
        attachmentId: attachmentId,
        documentTitle: title,
        documentType: type,
        effectiveDate: effectiveDate,
        expiryDate: expiryDate || null,
    };

    // for insert operation attachmentId is required
    // for update operation, if attachmentId is provided then throw error saying attachment update is not allowed
    if (documentId && attachmentId) {
        throw new ValidationError("Attachment update is not allowed");
    }

    const document = await DocumentStorage.findOneAndUpdate(
        { _id: documentId || new mongoose.Types.ObjectId() },
        payload,
        {
            upsert: true,
            returnDocument: true,
            setDefaultsOnInsert: true,
            projection: "_id",
        },
    ).lean();

    if (!document) {
        throw new AppError("Failed to upsert document entry");
    }

    return document._id;
};

const fetchDocumentsByProperty = async (propertyId, userId) => {
    if (!propertyId || !userId) {
        throw new ValidationError("Missing required parameters");
    }

    // Validate property access
    await PropertyService.hasPropertyAccess(propertyId, userId);

    const docs = await DocumentStorage.find(
        { propertyId: propertyId },
        {
            propertyId: 1,
            attachmentId: 1,
            documentTitle: 1,
            documentType: 1,
            effectiveDate: 1,
            expiryDate: 1,
            agentTaskIds: 1,
        },
    ).lean();

    docs.forEach((doc) => {
        doc.isEvaluated = doc.agentTaskIds && doc.agentTaskIds.length > 0;
    });

    return docs;
};

const fetchDocumentById = async (documentId, userId) => {
    if (!documentId || !userId) {
        throw new ValidationError("Missing required parameters");
    }

    const document = await DocumentStorage.findById(documentId).lean();
    if (!document) {
        throw new NotFoundError("Document not found");
    }

    // Validate property access
    await PropertyService.hasPropertyAccess(document.propertyId, userId);

    // Add evaluation status & latest agent task ID
    if (document.agentTaskIds && document.agentTaskIds.length > 0) {
        document.isEvaluated = true;
        document.agentTaskId =
            document.agentTaskIds[document.agentTaskIds.length - 1];

        delete document.agentTaskIds; // Remove the array of agent task IDs from the response
    } else {
        document.isEvaluated = false;
    }

    return document;
};

const deleteDocument = async (documentId, userId) => {
    if (!documentId || !userId) {
        throw new ValidationError("Missing required parameters");
    }

    const document = await DocumentStorage.findById(documentId).lean();
    if (!document) {
        throw new NotFoundError("Document not found");
    }

    // Validate property access
    await PropertyService.hasPropertyAccess(document.propertyId, userId);

    await DocumentStorage.deleteOne({ _id: documentId });

    AttachmentService.deleteAttachment(document.attachmentId, userId).catch(
        (e) => console.error(e),
    );
};

const DocumentStorageService = {
    upsertDocument,
    fetchDocumentsByProperty,
    fetchDocumentById,
    deleteDocument,
};

module.exports = DocumentStorageService;
