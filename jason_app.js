const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const { dbConfig } = require("../config/dbConfig");
const app = express();
const port = process.env.PORT || 3000;

// Import Controllers
const userController = require("./controllers/user_sqlController");
const pantryController = require("./controllers/pantryController");

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

// User Routes
app.post("/users", userController.createUser); // works
app.get("/users", userController.getAllUsers); // works
app.get("/users/:user_id", userController.getUserByUID); // works

// Pantry Routes
app.post('/pantry/:user_id', pantryController.createPantry); // Create a pantry for a user // works
app.get('/pantry/:user_id', pantryController.getPantryIDByUserID); // Get the pantry ID for a user // works
app.post('/pantry/:pantry_id/ingredients', pantryController.addIngredientToPantry); // Add an ingredient to a pantry // works
app.get('/pantry/:pantry_id/ingredients', pantryController.getIngredientsByPantryID); // Get all ingredients in a pantry // works
app.put('/pantry/:pantry_id/ingredients', pantryController.updateIngredientInPantry); // Update an ingredient in a pantry // works
app.delete('/pantry/:pantry_id/ingredients', pantryController.removeIngredientFromPantry); // Remove an ingredient from a pantry // works

app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
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
