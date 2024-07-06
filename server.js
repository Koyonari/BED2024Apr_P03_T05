require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const { connectDB } = require('./config/dbConfig');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3500;

// Connect to MongoDB
connectDB();

// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());  // Ensure this is before the routes

//middleware for cookies
app.use(cookieParser());

// Import Controllers 
const userController = require("./controllers/user_sqlController");
const pantryController = require("./controllers/pantryController");

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

//serve static files
app.use('/', express.static(path.join(__dirname, '/public')));

// routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

// Routes that require JWT verification
app.use(verifyJWT);
app.use('/users', require('./routes/api/users'));
app.use('/pantry', require('./routes/api/pantryRoutes'));
app.use('/recipes', require('./routes/api/recipeRoutes'));

// Jason SQL User Routes
app.post("/users", userController.createUser); // works
app.get("/users", userController.getAllUsers); // works
app.get("/users/:user_id", userController.getUserByUID); // works

// Error handling middleware
app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
