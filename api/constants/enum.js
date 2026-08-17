/**
 * ‼️ ANY CHANGE IN ENUMS SHOULD BE SYNCED WITH CLIENT SIDE APPLICATIONS ‼️
 */

module.exports.UserRoles = Object.freeze({
    OWNER: "Owner",
    HOST: "Host",
    MANAGER: "Manager",
});

module.exports.TaxSystems = Object.freeze({
    GST_INDIA: "GST (India)",
});

module.exports.BookingSources = Object.freeze({
    DIRECT: "Direct",
    AIRBNB: "Airbnb",
    OTA: "OTA",
    AGENT: "Agent",
    OTHER: "Other",
});

module.exports.BookingPaymentModes = Object.freeze({
    UPI: "UPI",
    CARD: "Debit/Credit Card",
    BANKTRANSFER: "Bank Transfer",
    PAYMENTGATEWAY: "Payment Gateway",
    CASH: "Cash",
});

module.exports.ExpensePaymentModes = Object.freeze({
    CASH: "Cash",
    UPI: "UPI",
    CARD: "Debit/Credit Card",
    BANKTRANSFER: "Bank Transfer",
});

module.exports.ExpenseCategories = Object.freeze([
    "Electricity",
    "Water",
    "Toiletries",
    "Laundry",
    "Food & Drinks",
    "Cook Gas",
    "Platform Fee",
    "Salary",
    "Property Rent",
    "Property Tax",
    "Property Maintenance",
    "Society Maintenance",
    "Legal & Compliance",
    "Promotion & Marketing",
    "Others",
]);

module.exports.TimeZones = Object.freeze([
    { value: "Asia/Kolkata", label: "India (IST)", offset: "UTC+5:30" },
    { value: "Asia/Dubai", label: "UAE (GST)", offset: "UTC+4:00" },
    { value: "Asia/Singapore", label: "Singapore (SGT)", offset: "UTC+8:00" },
    { value: "Asia/Bangkok", label: "Thailand (ICT)", offset: "UTC+7:00" },
    { value: "Asia/Jakarta", label: "Indonesia (WIB)", offset: "UTC+7:00" },
    { value: "Asia/Manila", label: "Philippines (PHT)", offset: "UTC+8:00" },
    { value: "Asia/Kuala_Lumpur", label: "Malaysia (MYT)", offset: "UTC+8:00" },
    { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)", offset: "UTC+8:00" },
    { value: "Asia/Shanghai", label: "China (CST)", offset: "UTC+8:00" },
    { value: "Asia/Tokyo", label: "Japan (JST)", offset: "UTC+9:00" },
    { value: "Asia/Seoul", label: "South Korea (KST)", offset: "UTC+9:00" },
    { value: "Asia/Colombo", label: "Sri Lanka (SLST)", offset: "UTC+5:30" },
    { value: "Asia/Karachi", label: "Pakistan (PKT)", offset: "UTC+5:00" },
    { value: "Asia/Dhaka", label: "Bangladesh (BST)", offset: "UTC+6:00" },
]);

module.exports.Currencies = Object.freeze([
    { label: "INR", symbol: "₹", unit: 100 },
]);

module.exports.Agents = Object.freeze({
    // OCR AGENTS
    EXPENSE_OCRAGENT: "expense.ocr.agent",
    BOOKING_OCRAGENT: "booking.ocr.agent",
});

module.exports.AgentTaskStatus = Object.freeze({
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
});

module.exports.Modules = Object.freeze({
    EXPENSE: "Expense",
    EARNING: "Earning",
    BOOKING: "Booking",
    DOCSTORAGE: "Document Storage",
});

module.exports.PropertyTypes = Object.freeze([
    "Apartment",
    "Villa",
    "Glamping",
    "Independent House",
    "Hotel",
    "Guesthouse",
    "Hostel",
    "Homestay",
    "Farmstay",
    "Other",
]);

module.exports.UnitTypes = Object.freeze([
    // Apartments / Villas / Houses
    "Private Room",
    "Shared Room",
    "Studio",
    "1BHK",
    "2BHK",
    "3BHK",
    "Villa",
    "Independent House",

    // Hotels
    "Standard Room",
    "Deluxe Room",
    "Super Deluxe Room",
    "Suite",

    // Hostels
    "Dormitory Bed",
    "Pod Bed",

    // Other property/unit types
    "Glamping",
    "Other",
]);

module.exports.DocumentTypes = Object.freeze({
    AGREEMENT: "Agreement",
    LEASE_AGREEMENT: "Lease Agreement",
    PLATFORM_AGREEMENT: "Platform Agreement",
    RENTAL_AGREEMENT: "Rental Agreement",
    NOC: "NOC (No Objection Certificate)",
    PURCHASE_DOCUMENT: "Purchase Document",
    NOTICE: "Notice",
    LEGAL_NOTICE: "Legal Notice",
    IDENTITY_DOCUMENT: "Identity Document",
    PROPERTY_DOCUMENT: "Property Document",
    AMC: "Annual Maintenance Contract",
    OTHER: "Other",
});

module.exports.SeverityLevels = Object.freeze({
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    CRITICAL: "Critical",
});
