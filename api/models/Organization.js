const mongoose = require("mongoose");
const { TaxSystems } = require("../constants/enum");

const organizationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        registrationNumber: {
            type: String,
        },
        taxConfig: {
            enabled: {
                type: Boolean,
                default: false,
            },
            system: {
                type: String,
                enum: Object.values(TaxSystems),
                default: null, // if tax module is disabled
            },
            identification: {
                type: String,
            },
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Organization", organizationSchema);
