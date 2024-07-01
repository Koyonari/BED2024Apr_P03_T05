const pantryService = require("../services/pantryService");
const Pantry = require("../models/pantry");

const getPantryIngredients = async (req, res) => {
  try {
    // Ensure req.user and req.user.UserInfo are defined and contain userid
    const userid = req.userid;
    console.log("UserID:", userid); // Log to check if userId is correctly fetched

    if (!userid) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User information not available" });
    }

    // Call pantry service with userId
    const ingredients = await pantryService.getIngredients(userid);
    res.json(ingredients);
  } catch (error) {
    console.error("Error fetching pantry ingredients:", error);

    // Check specific error types and handle accordingly
    if (error.name === "UnauthorizedError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }

    res
      .status(500)
      .json({
        message: "Error fetching pantry ingredients",
        error: error.message,
      });
  }
};

// Create a pantry for a user
async function createPantry(req, res) {
  try {
    const { user_id } = req.params;

    // Check if the user already has a pantry
    const existingPantryID = await Pantry.getPantryIDByUserID(user_id);
    if (existingPantryID) {
      return res
        .status(200)
        .json({
          message: "User already has a pantry",
          pantry_id: existingPantryID,
        });
    }

    // Create a new pantry if the user doesn't already have one
    const newPantryID = await Pantry.createPantry(user_id);
    res
      .status(201)
      .json({
        message: "Pantry has been created for user",
        pantry_id: newPantryID,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get the pantry ID for a user
async function getPantryIDByUserID(req, res) {
  try {
    const { user_id } = req.params;
    const pantry_id = await Pantry.getPantryIDByUserID(user_id);

    if (pantry_id) {
      res.status(200).json({ pantry_id });
    } else {
      res.status(404).json({ message: "No pantry found for the user" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Add an ingredient to a pantry
async function addIngredientToPantry(req, res) {
  try {
    const { pantry_id } = req.params;
    const { ingredient_name, quantity } = req.body;
    const result = await Pantry.addIngredientToPantry(
      pantry_id,
      ingredient_name,
      quantity
    );
    res.status(201).json({ message: "Ingredient added to pantry", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get all ingredients in a pantry
async function getIngredientsByPantryID(req, res) {
  try {
    const { pantry_id } = req.params;
    const ingredients = await Pantry.getIngredientsByPantryID(pantry_id);

    if (ingredients.length > 0) {
      res.status(200).json(ingredients);
    } else {
      res.status(404).json({ message: "No ingredients found in pantry" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update an ingredient in a pantry
async function updateIngredientInPantry(req, res) {
  try {
    const { pantry_id } = req.params;
    const { ingredient_id, quantity } = req.body;
    const result = await Pantry.updateIngredientInPantry(
      pantry_id,
      ingredient_id,
      quantity
    );

    res.status(200).json({ message: "Ingredient updated in pantry", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Remove an ingredient from a pantry
async function removeIngredientFromPantry(req, res) {
  try {
    const { pantry_id } = req.params;
    const { ingredient_id } = req.body;
    const result = await Pantry.removeIngredientFromPantry(
      pantry_id,
      ingredient_id
    );

    res.status(200).json({ message: "Ingredient removed from pantry", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getPantryIngredients,
  createPantry,
  getPantryIDByUserID,
  addIngredientToPantry,
  getIngredientsByPantryID,
  updateIngredientInPantry,
  removeIngredientFromPantry,
};
