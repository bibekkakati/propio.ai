const mongoose = require("mongoose");

const organizationAccessSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
            index: true,
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Organization",
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("OrganizationAccess", organizationAccessSchema);
