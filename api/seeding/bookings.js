require("dotenv").config();
const BookingService = require("../services/booking.service");
const mongoconnect = require("../utils/mongoconnect");
// Importing it for emitter
require("../services/summary.service");

const bookings = [];

const propertyId_1 = "697bb97e087aba0e18518b60";
const propertyId_2 = "6987482267562a54ae6c2751";
const userId = "697b6743f2ad1986c6f2eac0";

const run = async () => {
    mongoconnect();

    for (let i = 0; i < bookings.length; i++) {
        const booking = bookings[i];

        console.log("Booking #", i + 1);

        await BookingService.upsertBooking(
            {
                property_id: propertyId_1,
                ...booking,
            },
            userId,
        );
    }
};

run();
