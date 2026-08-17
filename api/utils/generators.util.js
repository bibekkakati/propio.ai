const OTP_LENGTH = 6;

module.exports = {
    /**
     * Generates a 6-digit One-Time Password (OTP).
     * Returns a demo OTP from environment variables if configured, otherwise generates a random OTP.
     *
     * @returns {string} A 6-digit numeric OTP string.
     */
    generateOTP: () => {
        const digits = "0123456789";
        let otp = "";
        for (let i = 0; i < OTP_LENGTH; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }

        return otp;
    },
};
