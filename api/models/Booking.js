const mongoose = require("mongoose");
const { BookingPaymentModes, BookingSources } = require("../constants/enum");

const bookingSchema = new mongoose.Schema(
    {
        ref: {
            type: String,
            required: true,
            unique: true,
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Property",
            index: true,
        },
        unitId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "PropertyUnit",
            index: true,
        },
        guestName: { type: String, required: true },
        guestCount: { type: Number, required: true },
        checkIn: { type: Number, required: true },
        checkOut: { type: Number, required: true },
        ratePerNight: { type: Number, required: true, min: 1 },
        amount: { type: Number, required: true, min: 1 },
        bookingSource: {
            type: String,
            enum: Object.values(BookingSources),
            required: true,
        },
        paymentMode: {
            type: String,
            enum: Object.values(BookingPaymentModes),
            required: true,
        },
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

module.exports = mongoose.model("Booking", bookingSchema);
