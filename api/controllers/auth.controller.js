const AuthService = require("../services/auth.service");
const { isValidEmail } = require("../utils/common.util");
const { ValidationError } = require("../utils/error.util");
const { SuccessResponse } = require("../utils/response.util");

module.exports = {
    processSignupWithEmail: async (req, res) => {
        const { name, email, authId, otp } = req.body;

        if (!name || !email) {
            throw new ValidationError("Required fields are missing!");
        }

        if (authId && !otp) {
            throw new ValidationError("Please enter the OTP");
        }

        if (!isValidEmail(email)) {
            throw new ValidationError("Email is not valid!");
        }

        const { userId, token, authSessionId } = await AuthService.registerUser(
            name,
            email,
            authId,
            otp,
        );

        // OTP generated response
        if (authSessionId) {
            return SuccessResponse(res, {
                data: {
                    authId: authSessionId,
                },
                message: "OTP has been sent to email",
            });
        }

        return SuccessResponse(res, {
            data: {
                userId,
                token,
            },
            message: "Account created successfully",
        });
    },
    processLoginWithEmail: async (req, res) => {
        const { email, authId, otp } = req.body;

        if (!email) {
            throw new ValidationError("Email is required!");
        }

        if (authId && !otp) {
            throw new ValidationError("Please enter the OTP");
        }

        if (!isValidEmail(email)) {
            throw new ValidationError("Email is not valid!");
        }

        const { userId, token, authSessionId } = await AuthService.loginUser(
            email,
            authId,
            otp,
        );

        // OTP generated response
        if (authSessionId) {
            return SuccessResponse(res, {
                data: {
                    authId: authSessionId,
                },
                message: "OTP has been sent to email",
            });
        }

        return SuccessResponse(res, {
            data: {
                userId,
                token,
            },
            message: "Logged-in successfully",
        });
    },
};
