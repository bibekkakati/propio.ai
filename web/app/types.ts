export enum Modules {
    EXPENSE = "Expense",
    EARNING = "Earning",
    BOOKING = "Booking",
    DOCSTORAGE = "Document Storage",
}

export enum UserRoles {
    OWNER = "Owner",
    HOST = "Host",
    MANAGER = "Manager",
}

// Booking Sources
export enum BookingSource {
    DIRECT = "Direct",
    AIRBNB = "Airbnb",
    OTA = "OTA",
    AGENT = "Agent",
    OTHER = "Other",
}

// Booking Payment Modes
export enum BookingPaymentMode {
    UPI = "UPI",
    CARD = "Debit/Credit Card",
    BANK_TRANSFER = "Bank Transfer",
    PAYMENT_GATEWAY = "Payment Gateway",
    CASH = "Cash",
}

// Expense Payment Modes
export enum ExpensePaymentMode {
    CASH = "Cash",
    UPI = "UPI",
    CARD = "Debit/Credit Card",
    BANK_TRANSFER = "Bank Transfer",
}

export enum ExpenseCategory {
    ELECTRICITY = "Electricity",
    WATER = "Water",
    TOILETRIES = "Toiletries",
    LAUNDRY = "Laundry",
    FOOD_DRINKS = "Food & Drinks",
    COOK_GAS = "Cook Gas",
    PLATFORM_FEE = "Platform Fee",
    SALARY = "Salary",
    PROPERTY_RENT = "Property Rent",
    PROPERTY_TAX = "Property Tax",
    PROPERTY_MAINTENANCE = "Property Maintenance",
    SOCIETY_MAINTENANCE = "Society Maintenance",
    LEGAL_COMPLIANCE = "Legal & Compliance",
    PROMOTION_MARKETING = "Promotion & Marketing",
    OTHERS = "Others",
}

export enum AgentTaskStatus {
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}

export enum DocumentType {
    AGREEMENT = "Agreement",
    LEASE_AGREEMENT = "Lease Agreement",
    PLATFORM_AGREEMENT = "Platform Agreement",
    RENTAL_AGREEMENT = "Rental Agreement",
    NOC = "NOC (No Objection Certificate)",
    PURCHASE_DOCUMENT = "Purchase Document",
    NOTICE = "Notice",
    LEGAL_NOTICE = "Legal Notice",
    IDENTITY_DOCUMENT = "Identity Document",
    PROPERTY_DOCUMENT = "Property Document",
    AMC = "Annual Maintenance Contract",
    OTHER = "Other",
}
