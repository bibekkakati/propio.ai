const mongoose = require("mongoose");
const { PropertyTypes } = require("../constants/enum");

const propertySchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Organization",
            index: true,
        },
        name: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        type: {
            type: String,
            required: true,
            enum: PropertyTypes,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Property", propertySchema);
