const mongoose = require("mongoose");
const { TimeZones, Currencies } = require("../constants/enum");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        dialCode: { type: String },
        phone: { type: String },
        emailVerified: { type: Boolean, default: false },
        phoneVerified: { type: Boolean, default: false },
        timezone: {
            type: String,
            default: "Asia/Kolkata", // IANA timezone
            enum: TimeZones,
        },
        currency: {
            type: String,
            default: "INR",
            enum: Currencies.map((c) => c.label),
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
