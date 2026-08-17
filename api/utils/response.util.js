const {
    ValidationError,
    NotFoundError,
    UnauthorizedError,
} = require("./error.util");

/**
 * Util for error response
 * @param {Error|null} error - The error object caught by Express
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with error details
 *
 * In development mode, includes error stack trace for debugging
 */
module.exports.ErrorResponse = (error, req, res) => {
    // Log error for debugging
    console.error(error);

    if (error?.code === "ETIMEDOUT" || error?.message?.includes("timeout")) {
        return res.status(408).json({
            success: false,
            error: "Request timeout - file upload took too long",
        });
    }

    // Handle NotFoundError
    if (error instanceof UnauthorizedError) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized",
        });
    }

    // Handle NotFoundError
    if (error instanceof NotFoundError) {
        return res.status(404).json({
            success: false,
            error: error.message || "Resource not found",
        });
    }

    // Handle ValidationError
    if (error instanceof ValidationError) {
        return res.status(error.statusCode || 400).json({
            success: false,
            error: error.message || "Validation failed",
        });
    }

    // Handle Mongoose validation errors
    if (error?.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            error: "Internal validation error",
        });
    }

    // Handle Mongoose CastError (invalid ObjectId)
    if (error?.name === "CastError") {
        return res.status(400).json({
            success: false,
            error: "Invalid ID format",
        });
    }

    // Handle custom errors with statusCode
    if (error?.statusCode) {
        return res.status(error.statusCode).json({
            success: false,
            error: error.message || "An error occurred",
        });
    }

    // Default server error
    return res.status(500).json({
        success: false,
        error: "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
};

module.exports.SuccessResponse = (res, { status = 200, message, data }) => {
    return res.status(status).json({
        success: true,
        message,
        data,
    });
};
