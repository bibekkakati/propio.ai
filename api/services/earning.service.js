const mongoose = require("mongoose");
const Earning = require("../models/Earning");
const { isEarningSourceValid } = require("../utils/common.util");
const { ValidationError, NotFoundError } = require("../utils/error.util");
const AttachmentService = require("./attachment.service");
const PropertyService = require("./property.service");
const Emitter = require("../utils/event.util");

/**
 * Validates that an earning entry exists and the user has access to it through the linked property
 * @param {string} earningId - The earning ID to validate
 * @param {string} userId - The user ID requesting access
 * @throws {NotFoundError} If the earning entry is not found
 * @throws {ValidationError} If the user doesn't have access to the property
 * @returns {Promise<void>}
 */
const validateEarningIdWithAccess = async (earningId, userId) => {
    const earning = await Earning.findById(earningId, {
        propertyId: 1,
    }).lean();

    // Validate earning ID
    if (!earning) {
        throw new NotFoundError("Earning entry not found!");
    }

    // Validate earning ID access through linked property ID
    await PropertyService.hasPropertyAccess(
        earning.propertyId.toString(),
        userId,
    );
};

/**
 * Creates a new earning entry or updates an existing one
 * @param {Object} earningData - The earning data
 * @param {string} [earningData.earningId] - The earning ID (for updates)
 * @param {string} earningData.propertyId - The property ID
 * @param {number} earningData.recordDate - The date of the earning record
 * @param {string} earningData.earningSource - Source of the earning
 * @param {number} earningData.tdsValue - Tax deducted at source value
 * @param {number} earningData.tcsValue - Tax collected at source value
 * @param {number} earningData.grossAmount - Gross earning amount
 * @param {string} [earningData.transactionRef] - Optional transaction reference
 * @param {string} [earningData.note] - Optional earning note (max 2000 chars)
 * @param {string[]} [earningData.attachmentIds] - Optional array of attachment IDs
 * @param {string} userId - The user ID creating/updating the earning
 * @throws {ValidationError} If any validation fails
 * @returns {Promise<string>} The earning ID (created or updated)
 */
const upsertEarning = async (
    {
        earningId,
        propertyId,
        recordDate,
        earningSource,
        tdsValue,
        tcsValue,
        grossAmount,
        transactionRef,
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

    if (!grossAmount) {
        throw new ValidationError("Provide the gross amount.");
    }

    if (!isEarningSourceValid(earningSource)) {
        throw new ValidationError("Provide a valid earning source.");
    }

    if (note && note.length > 2000) {
        throw new ValidationError("Note is too long!");
    }

    tdsValue = Number(tdsValue || 0);
    tcsValue = Number(tcsValue || 0);
    grossAmount = Number(grossAmount);

    const netAmount = grossAmount - tdsValue - tcsValue;

    const doc = {
        propertyId,
        recordDate,
        earningSource,
        tdsValue,
        tcsValue,
        grossAmount,
        netAmount,
        transactionRef,
        note,
        attachments: attachmentIds || [],
    };

    // Validate property ID access
    await PropertyService.hasPropertyAccess(propertyId, userId);

    /**
     * UPDATE FLOW
     */
    if (earningId) {
        await validateEarningIdWithAccess(earningId, userId);

        const earning = await Earning.findById(earningId, {
            recordDate: 1,
            attachments: 1,
        }).lean();

        // Check if any attachment is deleted
        // Compare the attachments to be updated with existing attachments
        for (let i = 0; i < earning.attachments.length; i++) {
            const id = earning.attachments[i];

            if (attachmentIds?.indexOf(id.toString()) === -1) {
                await AttachmentService.deleteAttachment(id, userId);
            }
        }

        await Earning.updateOne(
            { _id: earningId },
            {
                $set: doc,
            },
            { runValidators: true },
        ).lean();

        Emitter.emit("earning.modified", {
            propertyId: propertyId,
            userId,
            earningId: earningId,
            previousDate: earning.recordDate,
            updatedDate: recordDate,
        });

        // Exit update flow and caller
        return earningId;
    }

    /**
     * INSERTION FLOW
     */
    const insertedDoc = await new Earning(doc).save();

    Emitter.emit("earning.modified", {
        propertyId: propertyId,
        userId,
        earningId: insertedDoc._id,
        updatedDate: recordDate,
    });

    // Exit insert flow and caller
    return insertedDoc._id;
};

/**
 * Delete earning for a specific property
 * @param {string} earningId - The earning ID to delete
 * @param {string} propertyId - The property ID to delete earning for
 * @param {string} userId - The user ID deleting the earning
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<void>}
 */
const deleteEarning = async (earningId, propertyId, userId) => {
    if (!propertyId || !earningId || !userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    const earning = await getEarningDetails(earningId, propertyId, userId);
    if (!earning) {
        throw new NotFoundError("Earning not found");
    }

    await Earning.deleteOne({
        _id: earningId,
        propertyId: propertyId,
    }).lean();

    Emitter.emit("earning.modified", {
        propertyId,
        userId,
        earningId,
        updatedDate: earning.recordDate,
    });

    earning.attachments?.forEach((id) => {
        AttachmentService.deleteAttachment(id, userId).catch((e) =>
            console.error(e),
        );
    });
};

/**
 * Retrieves all earning entries for a specific property with optional date filtering
 * @param {string} propertyId - The property ID to get earnings for
 * @param {string} userId - The user ID requesting the earnings
 * @param {Object} [filters={}] - Optional filters for the query
 * @param {number} [filters.recordDateFrom] - Start date for recordDate filter
 * @param {number} [filters.recordDateTo] - End date for recordDate filter
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<Array<Object>>} Array of earning objects with selected fields
 */
const getEarningsByProperty = async (propertyId, userId, filters = {}) => {
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

    return await Earning.find(query, {
        recordDate: 1,
        earningSource: 1,
        tdsValue: 1,
        tcsValue: 1,
        grossAmount: 1,
        netAmount: 1,
        transactionRef: 1,
        note: 1,
    })
        .sort({ recordDate: "desc" })
        .lean();
};

/**
 * Retrieves detailed information for a specific earning entry
 * @param {string} earningId - The earning ID
 * @param {string} propertyId - The property ID
 * @param {string} userId - The user ID requesting the earning details
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<Object|null>} Earning details object or null if not found
 */
const getEarningDetails = async (earningId, propertyId, userId) => {
    if (!earningId || !propertyId || !userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    await PropertyService.hasPropertyAccess(propertyId, userId);

    return await Earning.findOne(
        { _id: earningId, propertyId: propertyId },
        {
            propertyId: 1,
            recordDate: 1,
            earningSource: 1,
            tdsValue: 1,
            tcsValue: 1,
            grossAmount: 1,
            netAmount: 1,
            transactionRef: 1,
            note: 1,
            attachments: 1,
        },
    ).lean();
};

/**
 * Retrieves earnings statistics for properties within a date range
 * @param {string} propertyId - Property ID to get stats for
 * @param {string} userId - The user ID requesting the stats
 * @param {number} recordDateFrom - Start date for recordDate filter
 * @param {number} recordDateTo - End date for recordDate filter
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<Object>} Earnings statistics
 */
const getEarningStats = async (
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

    const bySource = await Earning.aggregate([
        { $match: filter },
        {
            $group: {
                _id: "$earningSource",
                grossAmount: { $sum: "$grossAmount" },
                netAmount: { $sum: "$netAmount" },
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                source: "$_id",
                grossAmount: 1,
                netAmount: 1,
                count: 1,
            },
        },
    ]);

    // Calculate totals
    let totalGrossAmount = 0;
    let totalNetAmount = 0;
    let totalRecords = 0;

    const earningsBySource = {};

    bySource.forEach((c) => {
        totalGrossAmount = totalGrossAmount + c.grossAmount;
        totalNetAmount = totalNetAmount + c.netAmount;
        totalRecords = totalRecords + c.count;

        earningsBySource[c.source] = c.grossAmount;
    });

    return {
        totalEarnings: totalGrossAmount,
        netEarnings: totalNetAmount,
        totalRecords,
        earningsBySource,
    };
};

/**
 * Earning Service
 * Handles all earning-related operations including creation, updates, and retrieval
 * @namespace EarningService
 */
const EarningService = {
    upsertEarning,
    deleteEarning,
    getEarningsByProperty,
    getEarningDetails,
    getEarningStats,
};

module.exports = EarningService;
