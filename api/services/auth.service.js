const bcrypt = require("bcrypt");
const AuthSession = require("../models/AuthSession");
const { getAuthToken } = require("../utils/auth.util");
const { ValidationError } = require("../utils/error.util");
const { generateOTP } = require("../utils/generators.util");
const MailService = require("./mail.service");
const UserService = require("./user.service");

const OTP_EXPIRY_MINS = 5;
const SALT_ROUNDS = 6;

/**
 * Sends an OTP to the specified email address for authentication.
 * Reuses existing unexpired OTP if one was recently sent to avoid OTP flooding.
 *
 * @param {string} email - The email address to send the OTP to.
 * @returns {Promise<string>} Returns the auth session ID.
 */
const sendEmailOTP = async (email) => {
    if (!email) {
        throw new ValidationError("Email is required");
    }

    const currTime = new Date();

    const otp = generateOTP();
    const otpHashed = await bcrypt.hash(otp, SALT_ROUNDS);

    // Set the expiry time for the OTP
    currTime.setUTCMinutes(currTime.getUTCMinutes() + OTP_EXPIRY_MINS);

    const authSession = await new AuthSession({
        email,
        code: otpHashed,
        expiryAt: currTime.getTime(),
    }).save();

    MailService.sendOTP(email, otp, OTP_EXPIRY_MINS);

    return authSession._id;
};

/**
 * Verifies an email OTP against the stored authentication session.
 * Checks if OTP is valid, not expired, and not already validated.
 *
 * @param {string} authSessionId - The unique identifier of the authentication session.
 * @param {string} otp - The OTP code to verify.
 * @throws {Error} Throws an error if verification fails
 */
const verifyEmailOTP = async (authSessionId, otp) => {
    if (!authSessionId || !otp) {
        throw new ValidationError("Auth Session ID and OTP is required");
    }

    const authsession = await AuthSession.findById(authSessionId, {
        code: 1,
        expiryAt: 1,
        isValidated: 1,
    });

    if (authsession.isValidated) {
        throw new ValidationError("OTP is already validated");
    }

    if (authsession.expiryAt < Date.now()) {
        throw new ValidationError("OTP is expired");
    }

    const isValid = await bcrypt.compare(otp, authsession.code);
    if (!isValid) {
        throw new ValidationError("Incorrect OTP");
    }

    await authsession.updateOne({ isValidated: true }, { runValidators: true });
};

/**
 * Register an user if does not exists
 *
 * @param {string} name - Full name of the user
 * @param {string} email - Email of the user
 * @param {string} authSessionId - The unique identifier of the authentication session.
 * @param {string} otp - The OTP code to verify.
 * @returns {Promise<{userId: string, token: string} | {authSessionId: string}>} Object containing userId and token.
 */
const registerUser = async (name, email, authSessionId, otp) => {
    const userExists = await UserService.fetchCustomerByEmail(email, {
        _id: 1,
    });

    if (userExists) {
        throw new ValidationError(
            "Email is already registered. Please signin to continue.",
        );
    }

    if (authSessionId) {
        // Validate email
        await verifyEmailOTP(authSessionId, otp);

        // Create the user
        const user = await UserService.createUser(name, email, {
            emailVerified: true,
        });
        const userId = user._id;

        // Generate an auth token
        const token = getAuthToken({
            userId,
        });

        // Return a success response
        return {
            userId,
            token,
        };
    }

    // Trigger email OTP
    authSessionId = await sendEmailOTP(email);

    return {
        authSessionId,
    };
};

/**
 * Login user if exists and is active
 *
 * @param {string} email - Email of the user
 * @param {string} authSessionId - The unique identifier of the authentication session.
 * @param {string} otp - The OTP code to verify.
 * @returns {Promise<{userId: string, token: string} | {authSessionId: string}>} Object containing userId and token.
 */
const loginUser = async (email, authSessionId, otp) => {
    const user = await UserService.fetchCustomerByEmail(email, {
        _id: 1,
        isActive: 1,
    });

    if (!user) {
        throw new ValidationError("User not found. Please register to access.");
    }

    if (!user.isActive) {
        throw new ValidationError(
            "Account is deactivated. Please contact support for activation.",
        );
    }

    if (authSessionId) {
        // Validate email
        await verifyEmailOTP(authSessionId, otp);

        const userId = user._id;

        // Generate an auth token
        const token = getAuthToken({
            userId,
        });

        // Return a success response
        return {
            userId,
            token,
        };
    }

    // Trigger email OTP
    authSessionId = await sendEmailOTP(email);

    return {
        authSessionId,
    };
};

const AuthService = {
    registerUser,
    loginUser,
};

module.exports = AuthService;
