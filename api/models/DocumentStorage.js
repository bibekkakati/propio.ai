const mongoose = require("mongoose");
const { DocumentTypes } = require("../constants/enum");

const documentStorageSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Property",
            index: true,
        },
        attachmentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Attachment",
        },
        documentTitle: {
            type: String,
            required: true,
        },
        documentType: {
            type: String,
            required: true,
            enum: Object.values(DocumentTypes),
        },
        effectiveDate: {
            type: Number,
            required: true,
        },
        expiryDate: {
            type: Number,
        },
        agentTaskIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "AgentTask",
            },
        ],
    },
    { timestamps: true },
);

module.exports = mongoose.model("DocumentStorage", documentStorageSchema);
