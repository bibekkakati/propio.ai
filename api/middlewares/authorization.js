const { verifyAuthToken } = require("../utils/auth.util");
const { UnauthorizedError } = require("../utils/error.util");

const authorization = (req, res, next) => {
    // Token validation
    const token = (
        req.cookies["x-a-token"] || req.header("Authorization")
    )?.replace("Bearer ", "");

    if (!token) {
        throw new UnauthorizedError("Authentication token is invalid!");
    }

    req.user = verifyAuthToken(token);
    req.user.organizationId = req.header("x-organization-id");

    // Admin routes should have isAdmin parameter in token
    const isAdminRoute = req.path.startsWith("/api/v1/admin/");
    if (isAdminRoute && !req.user.isAdmin) {
        throw new UnauthorizedError("Unauthorized request");
    }

    return next();
};

module.exports = authorization;
