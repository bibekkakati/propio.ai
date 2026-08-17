const {
    getBookingDetails,
    getBookingsByProperty,
    createBooking,
    updateBooking,
    deleteBooking,
    checkAvailability,
    getAvailabilityByMonth,
} = require("../controllers/booking.controller");

const router = require("express").Router();

router.get("/", getBookingDetails);
router.get("/all", getBookingsByProperty);
router.post("/", createBooking);
router.put("/", updateBooking);
router.get("/availability/month", getAvailabilityByMonth);
router.get("/availability/check", checkAvailability);
router.delete("/", deleteBooking);

module.exports = router;
