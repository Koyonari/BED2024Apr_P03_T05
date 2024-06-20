const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const db = require("./config");
const app = express();
const port = process.env.PORT || 3000;

// Import Controllers
const userController = require("./controllers/userController");
const pantryController = require("./controllers/pantryController");

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

// User Routes
app.post("/users", userController.createUser); // works
app.get("/users", userController.getAllUsers); // works
app.get("/users/:user_id", userController.getUserByUID); // works

// Pantry Routes
app.post('/pantry/:user_id', pantryController.createPantry); // Create a pantry for a user
app.get('/pantry/:user_id', pantryController.getPantryIDByUserID); // Get the pantry ID for a user
app.post('/pantry/:pantry_id/ingredients', pantryController.addIngredientToPantry); // Add an ingredient to a pantry
app.get('/pantry/:pantry_id/ingredients', pantryController.getIngredientsByPantryID); // Get all ingredients in a pantry
app.put('/pantry/:pantry_id/ingredients', pantryController.updateIngredientInPantry); // Update an ingredient in a pantry
app.delete('/pantry/:pantry_id/ingredients', pantryController.removeIngredientFromPantry); // Remove an ingredient from a pantry

app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(db);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});
