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
const reqController = require("./controllers/requestController");
const { connectDB } = require('./config/dbConfig');
const { validateRequest, validatePatchAcceptedRequest, validatePatchApproveRequest } = require("./middleware/validateRequest");
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

// Edric routes
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

// Jason Pantry Routes
app.post('/pantry/:user_id', pantryController.createPantry); // Create a pantry for a user // works
app.get('/pantry/:user_id', pantryController.getPantryIDByUserID); // Get the pantry ID for a user // works
app.post('/pantry/:pantry_id/ingredients', pantryController.addIngredientToPantry); // Add an ingredient to a pantry // works
app.get('/pantry/:pantry_id/ingredients', pantryController.getIngredientsByPantryID); // Get all ingredients in a pantry // works
app.put('/pantry/:pantry_id/ingredients', pantryController.updateIngredientInPantry); // Update an ingredient in a pantry // works
app.delete('/pantry/:pantry_id/ingredients', pantryController.removeIngredientFromPantry); // Remove an ingredient from a pantry // works

// YongShyan Request Routes
app.get("/req/user/:id", reqController.getRequestByUserId);
app.post('/req', validateRequest, reqController.createRequest); //works
app.get("/available", reqController.getAvailableRequest);
app.patch("/req/accepted/update/:id", validatePatchAcceptedRequest, reqController.updateAcceptedRequest);
app.get("/req/accepted/:id", reqController.getAcceptedRequestById);
app.patch("/req/completed/:id", reqController.updateCompletedRequest);
app.get("/req/:id", reqController.getRequestById); //works
app.patch("/req/approve/:id", validatePatchApproveRequest, reqController.updateApproveRequest);
app.get("/accepted", reqController.getAcceptedRequest); 
app.delete("/req/:id", reqController.deleteRequest);

// Error handling middleware
app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
