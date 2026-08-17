const { sendEmail, getEmailBody } = require("../utils/mail.util");

/**
 * Sends an email containing an OTP (One-Time Password) for account verification.
 * Uses a pre-defined email template with OTP and expiry information.
 *
 * @param {string} email - The recipient's email address.
 * @param {string} otp - The one-time password to send to the user.
 * @param {number} expiry_in_mins - The number of minutes until the OTP expires.
 * @returns {Promise<void>} A Promise that resolves when the email is sent or logs an error if sending fails.
 */
const sendOTP = async (email, otp, expiry_in_mins) => {
    if (process.env.NODE_ENV !== "production") {
        console.log(`[OTP] ${otp}`);
    }

    try {
        const body = await getEmailBody("otp-verification", {
            otp,
            expiry_in_mins,
        });

        const subject = "Verify your account";
        return await sendEmail(email, subject, body);
    } catch (error) {
        console.error("OTP mail error: ", error);
    }
};

const MailService = {
    sendOTP,
};

module.exports = MailService;
