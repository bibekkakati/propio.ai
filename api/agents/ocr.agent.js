const { Type, createPartFromUri } = require("@google/genai");
const AI = require("../infrastructure/ai.client");
const {
    ExpenseCategories,
    ExpensePaymentModes,
    BookingSources,
    BookingPaymentModes,
} = require("../constants/enum");
const { AppError } = require("../utils/error.util");
const BookingSourcesOptions = Object.values(BookingSources);
const BookingPaymentOptions = Object.values(BookingPaymentModes);
const ExpensePaymentOptions = Object.values(ExpensePaymentModes);

const Models = ["gemma-4-31b-it", "gemini-2.5-flash-lite"];

const expenseParsingSystemInstruction = `You are an OCR-based financial document data extraction agent.

    Your task is to read the provided receipt, bill, or invoice file and extract data strictly according to the provided JSON schema.

    DOCUMENT TYPES:
    Receipts, invoices, utility bills, platform fee invoices, service bills, salary slips, maintenance bills.

    IMPORTANT RULE:
    If the input document does not match with mentioned Document Types, return the "error" field.

    EXTRACTION RULES:
    1. Extract only data that is explicitly visible in the document.
    2. Never guess, infer, or fabricate values.
    3. If a field is missing or unclear, return null for that field.
    4. Normalize extracted values:
        - recordDate → YYYY-MM-DD format.
        - amount → numeric value only (remove currency symbols, commas, text).
        - vendorName → business name shown on receipt or invoice header.
    5. Always prioritize the registered business name if available. Otherwise, the brand name.
    6. If multiple amounts exist, select the FINAL PAYABLE or TOTAL PAID amount.
    7. Ignore taxes, subtotal, item-level prices unless final total is missing.

    CATEGORY MAPPING:
    Map extracted document context to ONE of the allowed categories:
    ${ExpenseCategories.join("\n")}

    If category cannot be determined with confidence → use "Others".

    PAYMENT MODE MAPPING:
    Map detected payment method to one of:
    ${ExpensePaymentOptions.join("\n")}

    Examples:
        UPI apps → ${ExpensePaymentModes.UPI}
        Visa/Mastercard/RuPay swipe → ${ExpensePaymentModes.CARD}
        NEFT/IMPS/RTGS → ${ExpensePaymentModes.BANKTRANSFER}

        If payment mode is not visible → ${ExpensePaymentModes.CASH}.

    NOTE:
    Document can have multiple pages. Go through all the page content carefully and calculate the total amount.

    FAILURE CONDITIONS:
    If the file is corrupted, blank, unsupported, not readable, or not a financial document, return only:
    { "error": "Seems like file is not a valid document" }

    OUTPUT RULES:
    1. Always return valid JSON.
    2. Follow the provided schema exactly.
    3. Do not add extra fields.
    4. Do not return explanations or text outside JSON.
    5. For successfull document parsing, return the field "error" as empty string ""
`;

const bookingParsingSystemInstruction = `You are an OCR-based hotel/homestay/airbnb/villa booking document data extraction agent.

    Your task is to read the provided receipt, bill, or invoice file and extract data strictly according to the provided JSON schema.

    DOCUMENT TYPES:
    Booking receipts, booking invoices, booking confirmation email or message.

    IMPORTANT RULE:
    If the input document does not match with mentioned Document Types, return the "error" field.

    EXTRACTION RULES:
    1. Extract only data that is explicitly visible in the document.
    2. Never guess, infer, or fabricate values.
    3. If a field is missing or unclear, return null for that field.
    4. Normalize extracted values:
        - checkIn → YYYY-MM-DD format.
        - checkOut → YYYY-MM-DD format.
        - amount → numeric value only (remove currency symbols, commas, text).
        - guestName → guest name shown on document or primary travellers name.
        - guestCount → numeric value only. Guest count shown on document as number of guest/pax/travellers/units/adults/person.
    5. If multiple amounts exist, select the FINAL PAYABLE or TOTAL PAID amount.
    6. Ignore taxes, subtotal, item-level prices unless final total is missing.

    BOOKING SOURCE MAPPING:
    Map extracted document context to ONE of the allowed booking source:
    ${BookingSourcesOptions.join("\n")}

    Examples:
        Airbnb booking document/mail/screenshot → ${BookingSources.AIRBNB}
        MakeMyTrip/Booking.com/Agoda.com and similar OTA platforms → ${BookingSources.OTA}

    If booking source cannot be determined with confidence → use "${BookingSources.OTHER}".

    PAYMENT MODE MAPPING:
    Map detected payment method to one of:
    ${BookingPaymentOptions.join("\n")}

    Examples:
        UPI apps → ${BookingPaymentModes.UPI}
        Visa/Mastercard/RuPay swipe → ${BookingPaymentModes.CARD}
        NEFT/IMPS/RTGS → ${BookingPaymentModes.BANKTRANSFER}

    If payment mode is not visible → ${BookingPaymentModes.CASH}.

    FAILURE CONDITIONS:
    If the file is corrupted, blank, unsupported, not readable, or not a financial document, return only:
    { "error": "Seems like file is not a valid document" }

    OUTPUT RULES:
    1. Always return valid JSON.
    2. Follow the provided schema exactly.
    3. Do not add extra fields.
    4. Do not return explanations or text outside JSON.
    5. For successfull document parsing, return the field "error" as empty string ""
`;

const parseExpenseReceipt = async (fileurl, mimeType) => {
    const config = {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                recordDate: {
                    type: Type.STRING,
                    description: "This is receipt/invoice/billing date",
                },
                category: {
                    type: Type.STRING,
                    enum: ExpenseCategories,
                },
                amount: {
                    type: Type.NUMBER,
                },
                paymentMode: {
                    type: Type.STRING,
                    enum: ExpensePaymentOptions,
                },
                vendorName: {
                    type: Type.STRING,
                },
                error: {
                    type: Type.STRING,
                    nullable: true,
                },
            },
        },
        systemInstruction: [
            {
                text: expenseParsingSystemInstruction,
            },
        ],
    };

    const contents = [createPartFromUri(fileurl, mimeType)];

    const response = await AI.generateContent(Models, config, contents);

    const tokensConsumed = response.usageMetadata?.totalTokenCount;
    const result = JSON.parse(response.text);

    if (!result) {
        throw new AppError(
            "Agent couldn't perform the document scanning task!",
        );
    }

    // Safety sanitization
    if (result.error === "null") {
        result.error = null;
    }

    return { result, tokensConsumed, error: result.error };
};

const parseBookingReceipt = async (fileurl, mimeType) => {
    const config = {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                checkIn: {
                    type: Type.STRING,
                    description: "Check-in date or trip starting date",
                },
                checkOut: {
                    type: Type.STRING,
                    description: "Check-out date or trip ending date",
                },
                amount: {
                    type: Type.NUMBER,
                    description: "Total booking/invoice/paid amount",
                },
                bookingSource: {
                    type: Type.STRING,
                    enum: BookingSourcesOptions,
                },
                guestName: {
                    type: Type.STRING,
                    description:
                        "Name of the primary guest or first traveller in list",
                },
                guestCount: {
                    type: Type.NUMBER,
                    description:
                        "Number of guests mentioned as guest count/units/pax/travellers/person/adult",
                },
                paymentMode: {
                    type: Type.STRING,
                    enum: BookingPaymentOptions,
                },
                error: {
                    type: Type.STRING,
                    nullable: true,
                },
            },
        },
        systemInstruction: [
            {
                text: bookingParsingSystemInstruction,
            },
        ],
    };

    const contents = [createPartFromUri(fileurl, mimeType)];

    const response = await AI.generateContent(Models, config, contents);

    const tokensConsumed = response.usageMetadata?.totalTokenCount;
    const result = JSON.parse(response.text);

    if (!result) {
        throw new AppError(
            "Agent couldn't perform the document scanning task!",
        );
    }

    // Safety sanitization
    if (result.error === "null") {
        result.error = null;
    }

    return { result, tokensConsumed, error: result.error };
};

const OcrAgent = {
    parseExpenseReceipt,
    parseBookingReceipt,
};

module.exports = OcrAgent;
