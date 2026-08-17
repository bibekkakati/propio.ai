const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("./error.util");

const MAX_EXPIRY_GRACE_MINUTES = 10;

// Base64 Encoded
const JWT_PRIVATE_KEY = Buffer.from(process.env.JWT_PRIVATE_KEY, "base64").toString("utf-8");
const JWT_PUBLIC_KEY = Buffer.from(process.env.JWT_PUBLIC_KEY, "base64").toString("utf-8");

const JWT_OPTS = {
    algorithm: process.env.JWT_ALGORITHM,
    expiresIn: process.env.EXPIRES_IN_DAYS + "d",
    issuer: process.env.ISSUER,
    allowInsecureKeySizes: true,
    audience: "propiohq.com",
};

module.exports = {
    /**
     * Generates a JSON Web Token (JWT) for authentication.
     *
     * @param {Object} payload - The data to encode in the JWT.
     * @returns {string} A signed JWT string.
     */
    getAuthToken: (payload) => {
        const opts = { ...JWT_OPTS };

        return jwt.sign(payload, JWT_PRIVATE_KEY, opts);
    },

    /**
     * Verifies and decodes a JSON Web Token (JWT).
     * Allows a grace period of up to 10 minutes after token expiration.
     *
     * @param {string} token - The JWT string to verify.
     * @returns {Object} The decoded JWT payload.
     * @throws {Error} Throws "Token expired" error if token is expired beyond the grace period or verification fails.
     */
    verifyAuthToken: (token) => {
        try {
            const payload = jwt.verify(token, JWT_PUBLIC_KEY, JWT_OPTS);
            return payload;
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                const payload = jwt.decode(token);
                const now = Math.floor(Date.now() / 1000);
                const expiredSince = now - payload.exp;

                if (expiredSince <= MAX_EXPIRY_GRACE_MINUTES * 60) {
                    return payload;
                }
            }

            throw new UnauthorizedError("Token expired");
        }
    },
};
