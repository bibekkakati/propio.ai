const {
    UserRoles,
    BookingSources,
    BookingPaymentModes,
    ExpensePaymentModes,
    ExpenseCategories,
    PropertyTypes,
    DocumentTypes,
    TaxSystems,
    UnitTypes,
} = require("../constants/enum");

const USER_ROLES_LIST = Object.values(UserRoles);
const SUPPORTED_TAX_SYSTEMS = Object.values(TaxSystems);
const BOOKING_SOURCES_LIST = Object.values(BookingSources);
const BOOKING_PAYMENT_MODES = Object.values(BookingPaymentModes);
const EXPENSE_PAYMENT_MODES = Object.values(ExpensePaymentModes);
const DOCUMENT_TYPES_LIST = Object.values(DocumentTypes);

module.exports.isUserRoleValid = (role) => {
    return USER_ROLES_LIST.includes(role);
};

module.exports.isBookingSourceValid = (source) => {
    return BOOKING_SOURCES_LIST.includes(source);
};

module.exports.isEarningSourceValid = (source) => {
    return BOOKING_SOURCES_LIST.includes(source);
};

module.exports.isBookingPaymentModeValid = (mode) => {
    return BOOKING_PAYMENT_MODES.includes(mode);
};

module.exports.isExpensePaymentModeValid = (mode) => {
    return EXPENSE_PAYMENT_MODES.includes(mode);
};

module.exports.isExpenseCategoryValid = (category) => {
    return ExpenseCategories.includes(category);
};

module.exports.isPropertyTypeValid = (type) => {
    return PropertyTypes.includes(type);
};

module.exports.isUnitTypeValid = (type) => {
    return UnitTypes.includes(type);
};

module.exports.isDocumentTypeValid = (type) => {
    return DOCUMENT_TYPES_LIST.includes(type);
};

module.exports.isTaxSystemValid = (system) => {
    return SUPPORTED_TAX_SYSTEMS.includes(system);
};

module.exports.isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (typeof email !== "string") return false;

    return emailRegex.test(email.trim());
};

module.exports.sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports.withRetry = (fn, maxRetries = 3, baseDelayMs = 1000) => {
    return async (...args) => {
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                return await fn(...args);
            } catch (error) {
                attempt++;
                if (attempt >= maxRetries) {
                    console.error(`Operation failed after ${maxRetries} attempts. Final error:`, error);
                    throw error;
                }
                const delay = baseDelayMs * Math.pow(2, attempt - 1);
                console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms... Error: ${error.message}`);
                await module.exports.sleep(delay);
            }
        }
    };
};
