const mongoose = require("mongoose");

const authsessionSchema = new mongoose.Schema(
    {
        email: { type: String, lowercase: true },
        code: { type: String, required: true },
        expiryAt: { type: Number, required: true },
        isValidated: { type: Boolean, default: false },
    },
    { timestamps: true },
);

module.exports = mongoose.model("AuthSession", authsessionSchema);
