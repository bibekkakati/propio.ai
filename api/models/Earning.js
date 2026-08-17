const mongoose = require("mongoose");
const { BookingSources } = require("../constants/enum");

const earningSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Property",
            index: true,
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
        },
        recordDate: { type: Number, required: true },
        earningSource: { type: String, enum: Object.values(BookingSources) },
        tdsValue: { type: Number, min: 0 },
        tcsValue: { type: Number, min: 0 },
        grossAmount: { type: Number, required: true, min: 1 }, // Pre-tax deduction. Amount blocked in taxes.
        netAmount: { type: Number, required: true, min: 1 }, // Post-tax decution. Net cash received.
        transactionRef: { type: String }, // UTR or Bank ref number
        note: { type: String },
        attachments: [
            {
                _id: false,
                type: mongoose.Schema.Types.ObjectId,
                ref: "Attachment",
            },
        ],
    },
    { timestamps: true },
);

module.exports = mongoose.model("Earning", earningSchema);
