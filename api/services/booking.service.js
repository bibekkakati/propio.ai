const { default: mongoose } = require("mongoose");
const Booking = require("../models/Booking");
const {
    isBookingSourceValid,
    isBookingPaymentModeValid,
} = require("../utils/common.util");
const { ValidationError, NotFoundError } = require("../utils/error.util");
const AttachmentService = require("./attachment.service");
const PropertyService = require("./property.service");
const Emitter = require("../utils/event.util");
const dayjs = require("dayjs");
const nanoid = require("nanoid").customAlphabet(
    "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
);

/**
 * Validates that a booking exists and the user has access to it through the linked property
 * @param {string} bookingId - The booking ID to validate
 * @param {string} userId - The user ID requesting access
 * @throws {NotFoundError} If the booking is not found
 * @throws {ValidationError} If the user doesn't have access to the property
 * @returns {Promise<void>}
 */
const validateBookingIdWithAccess = async (bookingId, userId) => {
    const booking = await Booking.findById(bookingId, {
        propertyId: 1,
    }).lean();

    // Validate booking ID
    if (!booking) {
        throw new NotFoundError("Booking not found!");
    }

    // Validate booking ID access through linked property ID
    await PropertyService.hasPropertyAccess(
        booking.propertyId.toString(),
        userId,
    );
};

/**
 * Creates a new booking or updates an existing one
 * @param {Object} bookingData - The booking data
 * @param {string} [bookingData.bookingId] - The booking ID (for updates)
 * @param {string} bookingData.propertyId - The property ID
 * @param {string} bookingData.unitId - The property unit ID
 * @param {string} bookingData.guestName - The guest's name
 * @param {number} bookingData.guestCount - Number of guests
 * @param {string} bookingData.checkIn - Check-in date
 * @param {string} bookingData.checkOut - Check-out date
 * @param {number} bookingData.ratePerNight - Room rate per night
 * @param {string} bookingData.bookingSource - Source of the booking
 * @param {string} [bookingData.paymentMode] - Payment mode
 * @param {string} [bookingData.note] - Optional booking note (max 2000 chars)
 * @param {string[]} [bookingData.attachmentIds] - Optional array of attachment IDs
 * @param {string} userId - The user ID creating/updating the booking
 * @throws {ValidationError} If any validation fails
 * @returns {Promise<string>} The booking ID (created or updated)
 */
const upsertBooking = async (
    {
        bookingId,
        propertyId,
        unitId,
        guestName,
        guestCount,
        checkIn,
        checkOut,
        ratePerNight,
        bookingSource,
        paymentMode,
        note,
        attachmentIds,
    },
    userId,
) => {
    if (!propertyId) {
        throw new ValidationError("Property ID is missing!");
    }

    if (!unitId) {
        throw new ValidationError("Property Unit ID is missing!");
    }

    guestCount = Number(guestCount);
    ratePerNight = Number(ratePerNight);

    if (!guestName) {
        throw new ValidationError("Provide a guest name.");
    }

    if (!guestCount || guestCount <= 0) {
        throw new ValidationError("Number of guests is required.");
    }

    if (!ratePerNight || ratePerNight < 1) {
        throw new ValidationError("Provide a valid room rate.");
    }

    if (!checkIn || !checkOut) {
        throw new ValidationError("Select check-in and check-out date.");
    }

    checkIn = new Date(checkIn).getTime();
    checkOut = new Date(checkOut).getTime();

    if (
        dayjs(checkIn).isAfter(checkOut, "day") ||
        dayjs(checkIn).isSame(checkOut, "day")
    ) {
        throw new ValidationError("Check-out must be after Check-in");
    }

    const isAvailable = await checkAvailability(
        propertyId,
        unitId,
        checkIn,
        checkOut,
        userId,
        bookingId,
    );
    if (!isAvailable) {
        throw new ValidationError("Booking already exists for the dates.");
    }

    if (!isBookingSourceValid(bookingSource)) {
        throw new ValidationError("Booking source is not valid!");
    }

    if (paymentMode && !isBookingPaymentModeValid(paymentMode)) {
        throw new ValidationError("Payment mode is not valid!");
    }

    if (note && note.length > 2000) {
        throw new ValidationError("Note is too long!");
    }

    if (attachmentIds?.length > 5) {
        throw new ValidationError("Maximum 5 attachments are allowed!");
    }

    const nights = dayjs(checkIn).isSame(checkOut, "days")
        ? 1
        : dayjs(checkOut).diff(dayjs(checkIn), "day");

    const amount = ratePerNight * nights;

    const doc = {
        propertyId,
        unitId,
        guestName,
        guestCount,
        checkIn,
        checkOut,
        ratePerNight,
        amount,
        bookingSource,
        paymentMode,
        note,
        attachments: attachmentIds || [],
    };

    // Validate property ID access
    await PropertyService.hasPropertyAccess(propertyId, userId);

    /**
     * UPDATE FLOW
     */
    if (bookingId) {
        await validateBookingIdWithAccess(bookingId, userId);

        const booking = await Booking.findById(bookingId, {
            checkIn: 1,
            attachments: 1,
        }).lean();

        // Check if any attachment is deleted
        // Compare the attachments to be updated with existing attachments
        for (let i = 0; i < booking.attachments.length; i++) {
            const id = booking.attachments[i];

            if (attachmentIds?.indexOf(id.toString()) === -1) {
                await AttachmentService.deleteAttachment(id, userId);
            }
        }

        await Booking.updateOne(
            { _id: bookingId },
            {
                $set: doc,
            },
            { runValidators: true },
        ).lean();

        Emitter.emit("booking.modified", {
            propertyId: propertyId,
            userId,
            bookingId: bookingId,
            previousDate: booking.checkIn,
            updatedDate: checkIn,
        });

        // Exit update flow and caller
        return bookingId;
    }

    /**
     * INSERTION FLOW
     */
    // Generate ref id
    doc.ref = nanoid(8).toUpperCase();

    const insertedDoc = await new Booking(doc).save();

    Emitter.emit("booking.modified", {
        propertyId: propertyId,
        userId,
        bookingId: insertedDoc._id,
        updatedDate: checkIn,
    });

    // Exit insert flow and caller
    return insertedDoc._id;
};

/**
 * Delete booking for a specific property
 * @param {string} bookingId - The booking ID to delete
 * @param {string} propertyId - The property ID to delete booking for
 * @param {string} userId - The user ID deleting the booking
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<void>}
 */
const deleteBooking = async (bookingId, propertyId, userId) => {
    if (!propertyId || !bookingId || !userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    const booking = await getBookingDetails(bookingId, propertyId, userId);
    if (!booking) {
        throw new NotFoundError("Booking not found");
    }

    await Booking.deleteOne({
        _id: bookingId,
        propertyId: propertyId,
    }).lean();

    Emitter.emit("booking.modified", {
        propertyId,
        userId,
        bookingId,
        updatedDate: booking.checkIn,
    });

    booking.attachments?.forEach((id) => {
        AttachmentService.deleteAttachment(id, userId).catch((e) =>
            console.error(e),
        );
    });
};

/**
 * Retrieves all bookings for a specific property
 * @param {string} propertyId - The property ID to get bookings for
 * @param {string} userId - The user ID requesting the bookings
 * @param {Object} [filters] - Optional filters
 * @param {number} [filters.checkInFrom] - Filter bookings from this check-in date (inclusive)
 * @param {number} [filters.checkInTo] - Filter bookings until this check-in date (inclusive)
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<Array<Object>>} Array of booking objects with selected fields
 */
const getBookingsByProperty = async (propertyId, userId, filters = {}) => {
    if (!propertyId || !userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    await PropertyService.hasPropertyAccess(propertyId, userId);

    // Build query
    const query = { propertyId: propertyId };

    // Add checkIn date filters if provided
    if (filters.checkInFrom && filters.checkInTo) {
        query.checkIn = {
            $gte: filters.checkInFrom,
            $lte: filters.checkInTo,
        };
    }

    const bookings = await Booking.find(query, {
        _id: 1,
        unitId: 1,
        ref: 1,
        guestName: 1,
        guestCount: 1,
        checkIn: 1,
        checkOut: 1,
        amount: 1,
        bookingSource: 1,
        note: 1,
    })
        .populate("unitId", "name")
        .sort({ checkIn: "desc" })
        .lean();

    bookings.forEach((b) => {
        b.unit = b.unitId.name;
        delete b.unitId;
    });

    return bookings;
};

/**
 * Retrieves detailed information for a specific booking
 * @param {string} bookingId - The booking ID
 * @param {string} propertyId - The property ID
 * @param {string} userId - The user ID requesting the booking details
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<Object|null>} Booking details object or null if not found
 */
const getBookingDetails = async (bookingId, propertyId, userId) => {
    if (!bookingId || !propertyId || !userId) {
        throw new ValidationError("Required arguments are missing!");
    }

    await PropertyService.hasPropertyAccess(propertyId, userId);

    const booking = await Booking.findOne(
        { _id: bookingId, propertyId: propertyId },
        {
            ref: 1,
            propertyId: 1,
            unitId: 1,
            guestName: 1,
            guestCount: 1,
            checkIn: 1,
            checkOut: 1,
            ratePerNight: 1,
            amount: 1,
            bookingSource: 1,
            paymentMode: 1,
            note: 1,
            attachments: 1,
        },
    )
        .populate("unitId", "_id name")
        .lean();

    booking.unit = { ...Bookingbooking.unitId };
    delete booking.unitId;

    return booking;
};

/**
 * Checks if property is available for given date
 *
 * @param {string} propertyId - The property ID
 * @param {string} unitId - The property unit ID
 * @param {number} checkIn - The check-in date for booking (inclusive)
 * @param {number} checkOut - The check-out date for booking (exclusive)
 * @param {string} userId - The user ID requesting the details
 * @param {string} [bookingId] - The booking ID to exclude
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<Boolean>} "true" if available else "false"
 */
const checkAvailability = async (
    propertyId,
    unitId,
    checkIn,
    checkOut,
    userId,
    bookingId,
) => {
    if (!checkIn || !checkOut) {
        throw new ValidationError("Check-in and Check-out dates are required");
    }

    await PropertyService.hasPropertyAccess(propertyId, userId);

    if (
        dayjs(checkIn).isAfter(checkOut, "day") ||
        dayjs(checkIn).isSame(checkOut, "day")
    ) {
        throw new ValidationError("Check-out must be after Check-in");
    }

    const filter = {
        propertyId: propertyId,
        unitId: unitId,
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
    };

    if (bookingId) {
        filter._id = { $ne: bookingId };
    }

    const overlappingBooking = await Booking.findOne(filter, {
        _id: 1,
    }).lean();

    return !overlappingBooking;
};

/**
 * Iterate through bookings and prepares an availability calendar
 *
 * @param {string} unitId - The property unit ID
 * @param {string} propertyId - The property ID
 * @param {number} from - The filter start date (inclusive)
 * @param {number} to - The filter end date (inclusive)
 * @param {string} userId - The user ID requesting the details
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<Object>} Returns { occupiedDates: number[] }
 */
const getAvailabilityCalendar = async (
    unitId,
    propertyId,
    from,
    to,
    userId,
) => {
    if (!unitId || !propertyId || !from || !to) {
        throw new ValidationError("Required arguments are missing.");
    }

    await PropertyService.hasPropertyAccess(propertyId, userId);

    const bookings = await Booking.find({
        propertyId: propertyId,
        unitId: unitId,
        checkIn: { $lt: from },
        checkOut: { $gt: to },
    }).lean();

    const occupiedDates = new Set();

    for (const booking of bookings) {
        const checkIn = booking.checkIn;
        const checkOut = booking.checkOut;

        /**
         * Clamp booking range to the provided date range
         * Date Range: Mar 1 → Mar 31
         * Booking: Feb 27 → Mar 3
         * Occupied: Mar 1 → Mar 3
         */
        checkIn = dayjs(checkIn).isAfter(from, "days") ? checkIn : from;
        checkOut = dayjs(checkOut).isBefore(to, "days") ? checkOut : to;

        // Check-out is exclusive in date range
        // Property can have new check-in on current check-out date
        for (
            let d = new Date(checkIn);
            d < checkOut;
            d.setDate(d.getDate() + 1)
        ) {
            occupiedDates.add(d.getTime());
        }
    }

    return {
        occupiedDates: Array.from(occupiedDates).sort(),
    };
};

/**
 * Retrieves booking statistics for properties within a date range
 * @param {string} propertyId - Property ID to get stats for
 * @param {string} userId - The user ID requesting the stats
 * @param {number} checkInFrom - Start date for check-in filter
 * @param {number} checkInTo - End date for check-in filter
 * @throws {ValidationError} If required arguments are missing or user doesn't have access
 * @returns {Promise<Object>} Booking statistics
 */
const getBookingStats = async (propertyId, userId, checkInFrom, checkInTo) => {
    // Validation
    if (!propertyId || !userId || !checkInFrom || !checkInTo) {
        throw new ValidationError("Required arguments are missing!");
    }

    await PropertyService.hasPropertyAccess(propertyId, userId);

    const filter = {
        propertyId: new mongoose.Types.ObjectId(propertyId),
        checkIn: {
            $gte: checkInFrom,
            $lte: checkInTo,
        },
    };

    const bySource = await Booking.aggregate([
        { $match: filter },
        {
            $group: {
                _id: "$bookingSource",
                amount: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                source: "$_id",
                amount: 1,
                count: 1,
            },
        },
    ]);

    // Calculate totals
    let totalAmount = 0;
    let totalRecords = 0;

    const bookingValueBySource = {};
    const bookingCountBySource = {};

    bySource.forEach((c) => {
        totalAmount = totalAmount + c.amount;
        totalRecords = totalRecords + c.count;

        bookingValueBySource[c.source] = c.amount;
        bookingCountBySource[c.source] = c.count;
    });

    return {
        totalBookingValue: totalAmount,
        totalRecords,
        bookingValueBySource,
        bookingCountBySource,
    };
};

/**
 * Booking Service
 * Handles all booking-related operations including creation, updates, and retrieval
 * @namespace BookingService
 */
const BookingService = {
    upsertBooking,
    deleteBooking,
    getBookingsByProperty,
    getBookingDetails,
    checkAvailability,
    getAvailabilityCalendar,
    getBookingStats,
};

module.exports = BookingService;
