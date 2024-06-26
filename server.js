require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const sql = require("mssql");
const bodyParser = require("body-parser");
const db = require("./config"); // Assuming this is your MSSQL database config
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware

// Custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// Built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// Built-in middleware for JSON
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

// Serve static files
app.use('/', express.static(path.join(__dirname, '/public')));

// Routes

// Example MSSQL Routes
app.post("/users", async (req, res) => {
    // Your MSSQL user creation logic here
});

app.get("/users", async (req, res) => {
    // Your MSSQL get all users logic here
});

app.get("/users/:user_id", async (req, res) => {
    // Your MSSQL get user by ID logic here
});

// Example MongoDB Routes
app.use(verifyJWT);
app.use('/users', require('./routes/api/users'));

// Common routes for both databases or additional routes
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

// 404 Not Found handler
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

// Error handler middleware
app.use(errorHandler);

// Start server and connect to MongoDB
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// Connect to MSSQL database
async function connectMSSQL() {
    try {
        await sql.connect(db);
        console.log("MSSQL Database connection established successfully");
    } catch (err) {
        console.error("MSSQL Database connection error:", err);
        process.exit(1); // Exit with code 1 indicating an error
    }
}

// Call the MSSQL connection function
connectMSSQL();

// Close the MSSQL connection pool on SIGINT signal
process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");
    // Perform cleanup tasks (e.g., close database connections)
    await sql.close();
    console.log("MSSQL Database connection closed");
    process.exit(0); // Exit with code 0 indicating successful shutdown
});
