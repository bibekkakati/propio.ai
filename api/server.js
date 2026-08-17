require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const bodyParser = require("body-parser");
const logger = require("./middlewares/logger");
const sanitizer = require("./middlewares/sanitizer");
const authorization = require("./middlewares/authorization");
const cors = require("./middlewares/cors");
const cookieParser = require("cookie-parser");
const { ErrorResponse } = require("./utils/response.util");
const { NotFoundError } = require("./utils/error.util");
const { mongoconnect } = require("./infrastructure/mongo.client");
const { cleanupLocalFiles } = require("./utils/attachment.util");

// Create an Express application
const app = express();

// Establish mongo db connection
mongoconnect();

app.get("/", (req, res) => {
    return res.send("Welcome to Propio");
});

// Set up middleware
app.use(helmet()); // Helps secure Express apps by setting various HTTP headers
app.use(compression()); // Compress response bodies for all request that traverse middleware
app.use(logger()); // HTTP request logger middleware
app.use(cors()); // Enable CORS
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50kb" })); // Parse incoming request bodies in a middleware before your handlers
app.use(bodyParser.urlencoded({ extended: true, limit: "50kb" }));
app.use(sanitizer); // Trim request body

// Public routes
app.use("/api/v1/constants", require("./routes/constants.routes"));
// Auth routes
app.use("/api/v1/auth", require("./routes/auth.routes"));
// Normal routes
app.use("/api/v1/user", authorization, require("./routes/user.routes"));
app.use(
    "/api/v1/organization",
    authorization,
    require("./routes/organization.routes"),
);
app.use("/api/v1/property", authorization, require("./routes/property.routes"));
app.use("/api/v1/expense", authorization, require("./routes/expense.routes"));
app.use("/api/v1/booking", authorization, require("./routes/booking.routes"));
app.use("/api/v1/earning", authorization, require("./routes/earning.routes"));
app.use(
    "/api/v1/attachment",
    authorization,
    require("./routes/attachment.routes"),
);
app.use(
    "/api/v1/document",
    authorization,
    require("./routes/documentstorage.routes"),
);
app.use("/api/v1/agent", authorization, require("./routes/agent.routes"));

/**
 * Middleware to handle requests to non-existent routes.
 * Logs the attempted access and returns a 404 status code.
 * This should come AFTER all valid routes.
 */
app.use((req, res, next) => {
    return ErrorResponse(new NotFoundError("Resource not found"), req, res);
});

/**
 * Global error handling middleware.
 * Must have 4 parameters (error, req, res, next) to be recognized as error handler.
 * This should come LAST, after the 404 handler.
 */
app.use((error, req, res, next) => {
    return ErrorResponse(error, req, res);
});

// Start the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    // Clean up old local files on startup, then periodically every 1 hour
    cleanupLocalFiles(1).catch(console.error);
    setInterval(() => {
        cleanupLocalFiles(1).catch(console.error);
    }, 60 * 60 * 1000);
});

server.setTimeout(2 * 60 * 1000); // 2 minutes max per request
server.keepAliveTimeout = 300 * 1000; // 60 seconds idle
server.headersTimeout = 320 * 1000; // slightly higher than keep-alive

const handleExit = async (signal) => {
    console.log(`Received ${signal}. Closing server gracefully.`);
    server.close((err) => {
        if (err) console.error(err);
        process.exit(1);
    });
};
process.on("SIGINT", handleExit);
process.on("SIGQUIT", handleExit);
process.on("SIGTERM", handleExit);
