const AttachmentService = require("../services/attachment.service");
const BookingService = require("../services/booking.service");
const { ValidationError, NotFoundError } = require("../utils/error.util");
const { SuccessResponse } = require("../utils/response.util");

module.exports = {
    createBooking: async (req, res) => {
        const { userId } = req.user;

        const bookingId = await BookingService.upsertBooking(
            { ...req.body },
            userId,
        );

        return SuccessResponse(res, {
            data: bookingId,
        });
    },
    updateBooking: async (req, res) => {
        const { userId } = req.user;

        const bookingId = await BookingService.upsertBooking(
            { ...req.body },
            userId,
        );

        return SuccessResponse(res, {
            data: bookingId,
        });
    },
    deleteBooking: async (req, res) => {
        const { userId } = req.user;
        const { bid: bookingId, pid: propertyId } = req.query;

        await BookingService.deleteBooking(bookingId, propertyId, userId);

        return SuccessResponse(res, {
            data: bookingId,
        });
    },
    getBookingsByProperty: async (req, res) => {
        const { userId } = req.user;
        const { pid: propertyId, m, y } = req.query;

        const month = parseInt(m);
        if (isNaN(month) || month < 1 || month > 12) {
            throw new ValidationError("Select a valid month");
        }

        const year = parseInt(y);
        if (isNaN(year)) {
            throw new ValidationError("Select a valid year");
        }

        const from = new Date(year, month - 1, 1).getTime();
        const to = new Date(year, month, 1).getTime() - 1;

        const bookings = await BookingService.getBookingsByProperty(
            propertyId,
            userId,
            {
                checkInFrom: from,
                checkInTo: to,
            },
        );

        return SuccessResponse(res, {
            data: bookings,
        });
    },
    getBookingDetails: async (req, res) => {
        const { userId } = req.user;
        const { bid: bookingId, pid: propertyId } = req.query;

        const booking = await BookingService.getBookingDetails(
            bookingId,
            propertyId,
            userId,
        );

        if (!booking) {
            throw new NotFoundError("Booking not found!");
        }

        if (booking.attachments?.length) {
            const attachments =
                await AttachmentService.fetchMultipleAttachments(
                    booking.attachments,
                );
            booking.attachments = attachments;
        }

        return SuccessResponse(res, {
            data: booking,
        });
    },
    checkAvailability: async (req, res) => {
        const { userId } = req.user;
        const { pid: propertyId, uid: unitId, checkIn, checkOut } = req.query;

        const isAvailable = await BookingService.checkAvailability(
            propertyId,
            unitId,
            new Date(checkIn).getTime(),
            new Date(checkOut).getTime(),
            userId,
        );

        return SuccessResponse(res, {
            data: {
                isAvailable,
            },
        });
    },
    getAvailabilityByMonth: async (req, res) => {
        const { userId } = req.user;
        const { pid: propertyId, uid: unitId, m, y } = req.query;

        const month = parseInt(m);
        if (isNaN(month) || month < 1 || month > 12) {
            throw new ValidationError("Select a valid month");
        }

        const year = parseInt(y);
        if (isNaN(year)) {
            throw new ValidationError("Select a valid year");
        }

        const from = new Date(year, month - 1, 1).getTime();
        const to = new Date(year, month, 1).getTime() - 1;

        const calendar = await BookingService.getAvailabilityCalendar(
            unitId,
            propertyId,
            from,
            to,
            userId,
        );

        return SuccessResponse(res, {
            data: calendar,
        });
    },
};
