require('dotenv').config();
const express = require('express');
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./models/swagger-output.json");
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const reqController = require("./controllers/requestController");
const { connectDB } = require('./config/dbConfig');
const { validateRequest, validatePatchAcceptedRequest, validatePatchApproveRequest } = require("./middleware/validateRequest");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3500;

// Connect to MongoDB
connectDB();

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware setup
app.use(logger);
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

// JWT protected routes
app.use(verifyJWT);
app.use('/users', require('./routes/api/userRoutes'));
app.use('/pantry', require('./routes/api/pantryRoutes'));
app.use('/recipes', require('./routes/api/recipeRoutes'));
app.use('/requests', require('./routes/api/requestRoutes'));

// // Jason SQL User Routes (were used for internal testing before merging with group) - main functions are /pantry routes
// const userController = require("./controllers/user_sqlController");
// const pantryController = require("./controllers/pantryController");
// app.post("/users", userController.createUser); 
// app.get("/users", userController.getAllUsers); 
// app.get("/users/:user_id", userController.getUserByUID); 

// Error handling middleware
app.use(errorHandler);

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

module.exports = app;