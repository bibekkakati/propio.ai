const BookingService = require("./booking.service");
const MonthlySummary = require("../models/MonthlySummary");
const EarningService = require("./earning.service");
const ExpenseService = require("./expense.service");
const PropertyService = require("./property.service");
const Emitter = require("../utils/event.util");
const dayjs = require("dayjs");
const { withRetry } = require("../utils/common.util");

Emitter.on(
    "booking.modified",
    withRetry(async ({ propertyId, userId, previousDate, updatedDate }) => {
        try {
            await invalidateAndRecalculate(
                propertyId,
                updatedDate,
                previousDate,
                "booking",
                userId,
            );
        } catch (err) {
            console.error(
                `Failed to invalidate/recalculate summary for booking modification on property ${propertyId}:`,
                err,
            );
            throw err;
        }
    })
);

Emitter.on(
    "earning.modified",
    withRetry(async ({ propertyId, userId, previousDate, updatedDate }) => {
        try {
            await invalidateAndRecalculate(
                propertyId,
                updatedDate,
                previousDate,
                "earning",
                userId,
            );
        } catch (err) {
            console.error(
                `Failed to invalidate/recalculate summary for earning modification on property ${propertyId}:`,
                err,
            );
            throw err;
        }
    })
);

Emitter.on(
    "expense.modified",
    withRetry(async ({ propertyId, userId, previousDate, updatedDate }) => {
        try {
            await invalidateAndRecalculate(
                propertyId,
                updatedDate,
                previousDate,
                "expense",
                userId,
            );
        } catch (err) {
            console.error(
                `Failed to invalidate/recalculate summary for expense modification on property ${propertyId}:`,
                err,
            );
            throw err;
        }
    })
);

/**
 * Recalculate and update booking summary for a specific month
 */
const updateBookingSummary = async (propertyId, year, month, userId) => {
    const from = new Date(year, month - 1, 1).getTime();
    const to = new Date(year, month, 1).getTime() - 1;

    const {
        totalBookingValue,
        totalRecords,
        bookingValueBySource,
        bookingCountBySource,
    } = await BookingService.getBookingStats(propertyId, userId, from, to);

    // Prepare summary data
    const summaryData = {
        propertyId: propertyId,
        year,
        month,
        totalBookingsCount: totalRecords || 0,
        totalBookingsValue: totalBookingValue || 0,
        bookingsCountBySource: new Map(
            Object.entries(bookingCountBySource || {}),
        ),
        bookingsValueBySource: new Map(
            Object.entries(bookingValueBySource || {}),
        ),
    };

    // Upsert summary
    await MonthlySummary.updateOne(
        { propertyId: propertyId, year, month },
        {
            $set: summaryData,
        },
        { upsert: true, new: true },
    );
};

/**
 * Recalculate and update earning summary for a specific month
 */
const updateEarningSummary = async (propertyId, year, month, userId) => {
    const from = new Date(year, month - 1, 1).getTime();
    const to = new Date(year, month, 1).getTime() - 1;

    const { totalEarnings, netEarnings, earningsBySource } =
        await EarningService.getEarningStats(propertyId, userId, from, to);

    // Prepare summary data
    const summaryData = {
        propertyId: propertyId,
        year,
        month,
        totalEarnings: totalEarnings || 0,
        netEarnings: netEarnings || 0,
        earningsBySource: new Map(Object.entries(earningsBySource || {})),
    };

    // Upsert summary
    await MonthlySummary.updateOne(
        { propertyId: propertyId, year, month },
        {
            $set: summaryData,
        },
        { upsert: true, new: true },
    );
};

/**
 * Recalculate and update expense summary for a specific month
 */
const updateExpenseSummary = async (propertyId, year, month, userId) => {
    const from = new Date(year, month - 1, 1).getTime();
    const to = new Date(year, month, 1).getTime() - 1;

    const { totalExpenses, expensesByCategory } =
        await ExpenseService.getExpenseStats(propertyId, userId, from, to);

    // Prepare summary data
    const summaryData = {
        propertyId: propertyId,
        year,
        month,
        totalExpenses: totalExpenses || 0,
        expensesByCategory: new Map(Object.entries(expensesByCategory || {})),
    };

    // Upsert summary
    await MonthlySummary.updateOne(
        { propertyId: propertyId, year, month },
        {
            $set: summaryData,
        },
        { upsert: true, new: true },
    );
};

/**
 * Invalidate and recalculate summary when a record changes
 * Call this after create/update/delete operations
 * @param {string} propertyId
 * @param {number} newRecordDate
 * @param {number} oldRecordDate
 * @param {"expense" | "earning" | "booking"} type
 */
const invalidateAndRecalculate = async (
    propertyId,
    newRecordDate,
    oldRecordDate,
    type,
    userId,
) => {
    const dates = [newRecordDate];

    // If date changed (update operation), recalculate both months
    if (oldRecordDate && !dayjs(oldRecordDate).isSame(newRecordDate, "day")) {
        dates.push(oldRecordDate);
    }

    let updateFn = null;
    if (type === "booking") {
        updateFn = updateBookingSummary;
    } else if (type === "expense") {
        updateFn = updateExpenseSummary;
    } else if (type === "earning") {
        updateFn = updateEarningSummary;
    }

    const updates = [];
    for (const date of dates) {
        const djs = dayjs(date);
        updates.push(updateFn(propertyId, djs.year(), djs.month() + 1, userId));
    }

    await Promise.all(updates);
};

/**
 * Get summary for specific month
 */
const getMonthlySummary = async (propertyId, year, month, userId) => {
    // Validate access
    await PropertyService.hasPropertyAccess(propertyId, userId);

    const filter = {
        propertyId: propertyId,
        year,
        month,
    };

    let summary = await MonthlySummary.findOne(filter).lean();

    // If not found, calculate
    if (!summary) {
        await Promise.all([
            updateBookingSummary(propertyId, year, month, userId),
            updateEarningSummary(propertyId, year, month, userId),
            updateExpenseSummary(propertyId, year, month, userId),
        ]);

        summary = await MonthlySummary.findOne(filter).lean();
    }

    return summary || null;
};

const SummaryService = {
    getMonthlySummary,
};

module.exports = SummaryService;
