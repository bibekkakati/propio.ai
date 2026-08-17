const mongoose = require("mongoose");

const monthlySummarySchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        index: true,
    },
    year: { type: Number, index: true },
    month: { type: Number, index: true }, // 1-12

    // Pre-calculated totals
    totalBookingsCount: { type: Number, default: 0 },
    totalBookingsValue: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    netEarnings: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },

    bookingsCountBySource: {
        type: Map,
        of: Number,
        default: () => new Map(),
    },

    bookingsValueBySource: {
        type: Map,
        of: Number,
        default: () => new Map(),
    },

    earningsBySource: {
        type: Map,
        of: Number,
        default: () => new Map(),
    },

    expensesByCategory: {
        type: Map,
        of: Number,
        default: () => new Map(),
    },
});

// Compound index
monthlySummarySchema.index(
    { propertyId: 1, year: 1, month: 1 },
    { unique: true },
);

module.exports = mongoose.model("MonthlySummary", monthlySummarySchema);
