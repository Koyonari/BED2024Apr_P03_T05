const Pantry = require("../models/pantry");

// Controller function to get pantry ingredients for a user
const getPantryIngredients = async (req, res) => {
  try {
    const userid = req.userid;
    console.log("UserID:", userid);

    if (!userid) {
      return res.status(401).json({ message: "Unauthorized: User information not available" });
    }

    const ingredients = await Pantry.getIngredients(userid);
    res.json(ingredients);
  } catch (error) {
    console.error("Error fetching pantry ingredients:", error);

    if (error.name === "UnauthorizedError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }

    res.status(500).json({
      message: "Error fetching pantry ingredients",
      error: error.message,
    });
  }
};

// Create a pantry for a user
async function createPantry(req, res) {
  try {
    const { user_id } = req.params;

    const existingPantryID = await Pantry.getPantryIDByUserID(user_id);
    if (existingPantryID) {
      return res.status(200).json({
        message: "User already has a pantry",
        pantry_id: existingPantryID,
      });
    }

    const newPantryID = await Pantry.createPantry(user_id);
    res.status(201).json({
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
    const result = await Pantry.addIngredientToPantry(pantry_id, ingredient_name, quantity);
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
    const result = await Pantry.updateIngredientInPantry(pantry_id, ingredient_id, quantity);

    res.status(200).json({ message: "Ingredient updated in pantry", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Remove an ingredient from a pantry
async function removeIngredientFromPantry(req, res) {
  try {
    const { pantry_id } = req.params;
    const { ingredient_id, quantity } = req.body;
    const result = await Pantry.removeIngredientFromPantry(pantry_id, ingredient_id, quantity);

    if (result.quantity === 0) {
      await Pantry.deleteIngredientFromPantry(pantry_id, ingredient_id);
      res.status(200).json({ message: "Ingredient removed from pantry" });
    } else {
      res.status(200).json({ message: "Ingredient quantity updated in pantry", result });
    }
  } catch (error) {
    console.error("Error removing ingredient from pantry:", error);
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
