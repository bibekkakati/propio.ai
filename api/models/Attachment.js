const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },
        filename: {
            type: String,
            required: true,
        },
        mimetype: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Attachment", attachmentSchema);
