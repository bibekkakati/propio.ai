/**
 * If validation or processing logic fails due to code issue or mismatch in required parameters
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * If validation fails due to missing data from client side or from schema
 */
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

/**
 * If requested resource is not found
 */
class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}

/**
 * If session is unauthorized or trying to access a resource without permission
 */
class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}

module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
};
