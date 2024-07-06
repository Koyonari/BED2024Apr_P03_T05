// Import the allowedOrigins array from the allowedOrigins.js file
const allowedOrigins = require('./allowedOrigins');

// Define the CORS options object
const corsOptions = {
    // Check the origin against the allowedOrigins array
    origin: (origin, callback) => {
        // Check if the origin is in the allowedOrigins array
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            // If the origin is not in the allowedOrigins array, return an error
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions;