const mongoose = require("mongoose");
const { ExpensePaymentModes, ExpenseCategories } = require("../constants/enum");

const expenseSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Property",
        },
        recordDate: { type: Number, required: true },
        category: {
            type: String,
            required: true,
            enum: ExpenseCategories,
        },
        amount: { type: Number, required: true, min: 1 },
        paymentMode: {
            type: String,
            enum: Object.values(ExpensePaymentModes),
            required: true,
        },
        vendorName: {
            type: String,
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

module.exports = mongoose.model("Expense", expenseSchema);
