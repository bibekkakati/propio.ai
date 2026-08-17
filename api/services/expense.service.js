const { default: mongoose } = require("mongoose");
const Expense = require("../models/Expense");
const PropertyService = require("../services/property.service");
const {
    isExpenseCategoryValid,
    isExpensePaymentModeValid,
} = require("../utils/common.util");
const { ValidationError, NotFoundError } = require("../utils/error.util");
const AttachmentService = require("./attachment.service");
const Emitter = require("../utils/event.util");

/**
 * Validates that an expense entry exists and the user has access to it through the linked property
 * @param {string} expenseId - The expense ID to validate
 * @param {string} userId - The user ID requesting access
 * @throws {NotFoundError} If the expense entry is not found
 * @throws {ValidationError} If the user doesn't have access to the property
 * @returns {Promise<void>}
 */
const validateExpenseIdWithAccess = async (expenseId, userId) => {
    const expense = await Expense.findById(expenseId, {
        propertyId: 1,
    }).lean();

    // Validate expense ID
    if (!expense) {
        throw new NotFoundError("Expense entry not found!");
    }

    // Validate expense ID access through linked property ID
    await PropertyService.hasPropertyAccess(
        expense.propertyId.toString(),
        userId,
    );
};

/**
 * Creates a new expense entry or updates an existing one
 * @param {Object} expenseData - The expense data
 * @param {string} [expenseData.expenseId] - The expense ID (for updates)
 * @param {string} expenseData.propertyId - The property ID
 * @param {number} expenseData.recordDate - The date of the expense record
 * @param {string} expenseData.category - Expense category
 * @param {number} expenseData.amount - Expense amount
 * @param {string} expenseData.paymentMode - Payment mode used for the expense
 * @param {string} [expenseData.vendorName] - Name of the vendor
 * @param {string} [expenseData.note] - Optional expense note (max 2000 chars)
 * @param {string[]} [expenseData.attachmentIds] - Optional array of attachment IDs
 * @param {string} userId - The user ID creating/updating the expense
 * @throws {ValidationError} If any validation fails
 * @returns {Promise<string>} The expense ID (created or updated)
 */
const upsertExpense = async (
    {
        expenseId,
        propertyId,
        recordDate,
        category,
        amount,
        paymentMode,
        vendorName,
        note,
        attachmentIds,
    },
    userId,
) => {
    if (!propertyId) {
        throw new ValidationError("Property ID is missing!");
    }

    if (!recordDate) {
        throw new ValidationError("Provide a record date.");
    }

    if (!amount) {
        throw new ValidationError("Provide the gross amount.");
    }

    if (!isExpenseCategoryValid(category)) {
        throw new ValidationError("Provide a valid expense category.");
    }

    if (!isExpensePaymentModeValid(paymentMode)) {
        throw new ValidationError("Provide a valid payment mode.");
    }

    if (note && note.length > 2000) {
        throw new ValidationError("Note is too long!");
    }

    amount = Number(amount);

    const doc = {
        propertyId,
        recordDate,
        category,
        amount,
        paymentMode,
        vendorName,
        note,
        attachments: attachmentIds || [],
    };

    // Validate property ID access
    await PropertyService.hasPropertyAccess(propertyId, userId);

    /**
     * UPDATE FLOW
     */
    if (expenseId) {
        await validateExpenseIdWithAccess(expenseId, userId);

        const expense = await Expense.findById(expenseId, {
            recordDate: 1,
            attachments: 1,
        }).lean();

        // Check if any attachment is deleted
        // Compare the attachments to be updated with existing attachments
        for (let i = 0; i < expense.attachments.length; i++) {
            const id = expense.attachments[i];

            if (attachmentIds?.indexOf(id.toString()) === -1) {
                await AttachmentService.deleteAttachment(id, userId);
            }
        }

        await Expense.updateOne(
            { _id: expenseId },
            {
                $set: doc,
            },
            { runValidators: true },
        ).lean();

        Emitter.emit("expense.modified", {
            propertyId: propertyId,
            userId,
            expenseId: expenseId,
            previousDate: expense.recordDate,
            updatedDate: recordDate,
        });

        // Exit update flow and caller
        return expenseId;
    }

    /**
     * INSERTION FLOW
     */
    const insertedDoc = await new Expense(doc).save();

    Emitter.emit("expense.modified", {
        propertyId: propertyId,
        userId,
        expenseId: insertedDoc._id,
        updatedDate: recordDate,
    });

    // Exit insert flow and caller
    return insertedDoc._id;
};

/**
 * Delete expense for a specific property
 * @param {string} expenseId - The expense ID to delete
 * @param {string} propertyId - The property ID to delete expense for
 * @param {string} userId - The user ID deleting the expense
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<void>}
 */
const deleteExpense = async (expenseId, propertyId, userId) => {
    if (!propertyId || !expenseId || !userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    const expense = await getExpenseDetails(expenseId, propertyId, userId);
    if (!expense) {
        throw new NotFoundError("Expense not found");
    }

    await Expense.deleteOne({
        _id: expenseId,
        propertyId: propertyId,
    }).lean();

    Emitter.emit("expense.modified", {
        propertyId,
        userId,
        expenseId,
        updatedDate: expense.recordDate,
    });

    expense.attachments?.forEach((id) => {
        AttachmentService.deleteAttachment(id, userId).catch((e) =>
            console.error(e),
        );
    });
};

/**
 * Retrieves all expense entries for a specific property with optional date filtering
 * @param {string} propertyId - The property ID to get expenses for
 * @param {string} userId - The user ID requesting the expenses
 * @param {Object} [filters={}] - Optional filters for the query
 * @param {number} [filters.recordDateFrom] - Start date for recordDate filter
 * @param {number} [filters.recordDateTo] - End date for recordDate filter
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<Array<Object>>} Array of expense objects with selected fields
 */
const getExpensesByProperty = async (propertyId, userId, filters = {}) => {
    if (!propertyId || !userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    await PropertyService.hasPropertyAccess(propertyId, userId);

    // Build query
    const query = { propertyId: propertyId };

    // Add recordDate date filters if provided
    if (filters.recordDateFrom && filters.recordDateTo) {
        query.recordDate = {
            $gte: filters.recordDateFrom,
            $lte: filters.recordDateTo,
        };
    }

    return await Expense.find(query, {
        recordDate: 1,
        category: 1,
        amount: 1,
        vendorName: 1,
        paymentMode: 1,
        note: 1,
    })
        .sort({ recordDate: "desc" })
        .lean();
};

/**
 * Retrieves detailed information for a specific expense entry
 * @param {string} expenseId - The expense ID
 * @param {string} propertyId - The property ID
 * @param {string} userId - The user ID requesting the expense details
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<Object|null>} Expense details object or null if not found
 */
const getExpenseDetails = async (expenseId, propertyId, userId) => {
    if (!expenseId || !propertyId || !userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    await PropertyService.hasPropertyAccess(propertyId, userId);

    return await Expense.findOne(
        { _id: expenseId, propertyId: propertyId },
        {
            propertyId: 1,
            recordDate: 1,
            category: 1,
            amount: 1,
            paymentMode: 1,
            vendorName: 1,
            note: 1,
            attachments: 1,
        },
    ).lean();
};

/**
 * Retrieves expense statistics for properties within a date range
 * @param {string} propertyId - Property ID to get stats for
 * @param {string} userId - The user ID requesting the stats
 * @param {number} recordDateFrom - Start date for recordDate filter
 * @param {number} recordDateTo - End date for recordDate filter
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<Object>} Expense statistics
 */
const getExpenseStats = async (
    propertyId,
    userId,
    recordDateFrom,
    recordDateTo,
) => {
    // Validation
    if (!propertyId || !userId || !recordDateFrom || !recordDateTo) {
        throw new ValidationError("Required arguments are missing!");
    }

    await PropertyService.hasPropertyAccess(propertyId, userId);

    const filter = {
        propertyId: new mongoose.Types.ObjectId(propertyId),
        recordDate: {
            $gte: recordDateFrom,
            $lte: recordDateTo,
        },
    };

    const byCategory = await Expense.aggregate([
        { $match: filter },
        {
            $group: {
                _id: "$category",
                amount: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                category: "$_id",
                amount: 1,
                count: 1,
            },
        },
        { $sort: { amount: -1 } },
    ]);

    // Calculate totals
    let totalAmount = 0;
    let totalRecords = 0;

    const expensesByCategory = {};

    byCategory.forEach((c) => {
        totalAmount = totalAmount + c.amount;
        totalRecords = totalRecords + c.count;

        expensesByCategory[c.category] = c.amount;
    });

    return {
        totalExpenses: totalAmount,
        totalRecords,
        expensesByCategory,
    };
};

/**
 * Expense Service
 * Handles all expense-related operations including creation, updates, and retrieval
 * @namespace ExpenseService
 */
const ExpenseService = {
    upsertExpense,
    deleteExpense,
    getExpensesByProperty,
    getExpenseDetails,
    getExpenseStats,
};

module.exports = ExpenseService;
