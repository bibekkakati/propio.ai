const mongoose = require("mongoose");
const { UnitTypes } = require("../constants/enum");

const propertyUnitSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Property",
        },
        name: { type: String, required: true },
        ntypee: { type: String, required: true, enum: UnitTypes },
        maxOccupancy: {
            type: Number,
        },
        // Inclusive of taxes
        ratePerNight: {
            type: Number,
        },
        note: {
            type: String,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

module.exports = mongoose.model("PropertyUnit", propertyUnitSchema);
