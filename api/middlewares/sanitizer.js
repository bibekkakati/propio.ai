/**
 * Recursively trims whitespace from string values in a payload and replaces standalone ampersands with "and".
 * Handles nested objects and arrays while preserving HTML entities by only replacing "& " (ampersand with space).
 *
 * @param {*} payload - The payload to trim. Can be a string, array, object, or primitive value.
 * @returns {*} The trimmed payload with the same structure as the input.
 */
const trimRequestBody = (payload) => {
    const trimValue = (value) => {
        if (typeof value === "string") {
            value = value.trim();

            return value;
        } else if (Array.isArray(value)) {
            return value.map(trimValue);
        } else if (typeof value === "object" && value !== null) {
            const trimmedObject = {};
            for (let key in value) {
                trimmedObject[key] = trimValue(value[key]);
            }
            return trimmedObject;
        }
        return value;
    };

    return trimValue(payload);
};

/**
 * Express middleware that sanitizes request body data by trimming whitespace and replacing ampersands.
 * Applies trimming recursively to all string values in the request body, including nested objects and arrays.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the stack.
 * @returns {void|Object} Calls next() to continue middleware chain, or returns 500 error response if sanitization fails.
 */
const sanitizer = (req, res, next) => {
    try {
        // trim strings in body
        if (req.body) {
            req.body = trimRequestBody(req.body);
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = sanitizer;
