import API from "@/lib/api";
import { BookingPaymentMode, BookingSource } from "@/types";

const BookingService = {
    getBooking: async (bookingId: string, propertyId: string) => {
        return await API.get(
            `/api/v1/booking?bid=${bookingId}&pid=${propertyId}`,
        );
    },
    getBookings: async (propertyId: string, month: number, year: number) => {
        const params = new URLSearchParams();

        params.append("m", month.toString());
        params.append("y", year.toString());
        params.append("pid", propertyId);

        const queryStr = params.toString();

        return await API.get(`/api/v1/booking/all?${queryStr}`);
    },
    addBooking: async (
        propertyId: string,
        unitId: string,
        guestName: string,
        guestCount: number,
        checkIn: Date,
        checkOut: Date,
        ratePerNight: number,
        bookingSource: BookingSource,
        paymentMode: BookingPaymentMode,
        note?: string,
        attachmentIds?: string[],
    ) => {
        return await API.post("/api/v1/booking", {
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
        });
    },
    updateBooking: async (
        bookingId: string,
        propertyId: string,
        unitId: string,
        guestName: string,
        guestCount: number,
        checkIn: Date,
        checkOut: Date,
        ratePerNight: number,
        bookingSource: BookingSource,
        paymentMode: BookingPaymentMode,
        note?: string,
        attachmentIds?: string[],
    ) => {
        return await API.put("/api/v1/booking", {
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
        });
    },
    deleteBooking: async (bookingId: string, propertyId: string) => {
        return await API.delete(
            `/api/v1/booking?bid=${bookingId}&pid=${propertyId}`,
        );
    },
    getAvailabilityByMonth: async (
        propertyId: string,
        unitId: string,
        month: number,
        year: number,
    ) => {
        const params = new URLSearchParams();

        params.append("m", month.toString());
        params.append("y", year.toString());
        params.append("pid", propertyId);
        params.append("uid", unitId);

        const queryStr = params.toString();

        return await API.get(`/api/v1/booking/availability/month?${queryStr}`);
    },
    checkAvailability: async (
        propertyId: string,
        unitId: string,
        checkIn: Date,
        checkOut: Date,
    ) => {
        const params = new URLSearchParams();

        params.append("checkIn", checkIn.toISOString());
        params.append("checkOut", checkOut.toISOString());
        params.append("pid", propertyId);
        params.append("uid", unitId);

        const queryStr = params.toString();

        return await API.get(`/api/v1/booking/availability/check?${queryStr}`);
    },
};

export default BookingService;
