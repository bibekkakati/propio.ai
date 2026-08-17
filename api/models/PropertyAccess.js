const mongoose = require("mongoose");
const { UserRoles } = require("../constants/enum");

const propertyAccessSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
            index: true,
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Property",
        },
        role: {
            type: String,
            required: true,
            enum: Object.values(UserRoles),
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("PropertyAccess", propertyAccessSchema);
