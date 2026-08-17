const mongoose = require("mongoose");
const MONGO_CONNECTION = process.env.MONGO_CONNECTION;
const MONGO_DEBUG = process.env.MONGO_DEBUG;

const connectionOptions = {
    maxPoolSize: 20,
};

/**
 * Establishes a connection to MongoDB.
 * If the connection is successful, a message is logged to the console.
 * If the connection fails, the error is logged to the console.
 * The debug mode for mongoose is set based on the MONGO_DEBUG variable.
 */
const mongoconnect = () => {
    // Connect to MongoDB
    mongoose
        .connect(MONGO_CONNECTION, connectionOptions)
        .then(() => {
            console.log("Mongo connection established");
        })
        .catch((e) => {
            console.log("Mongo connection failed");
            console.error(e);
        });
    mongoose.set("debug", Boolean(Number(MONGO_DEBUG)));
};

module.exports = { mongoconnect };
