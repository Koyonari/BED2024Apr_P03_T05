// Import Modules
const Pantry = require("../models/pantry");

// Controller function to get pantry ingredients for a user
const getPantryIngredients = async (req, res) => {
  try {
    const userid = req.userid;
    console.log("UserID:", userid);

    // Check if the user ID is available
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized: User information not available" });
    }

    // Fetch pantry ingredients for the user
    const ingredients = await Pantry.getIngredients(userid);
    res.status(200).json(ingredients);
  } catch (error) {
    console.error("Error fetching pantry ingredients:", error);

    // Handle unauthorized and token expired errors
    if (error.name === "UnauthorizedError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }

    // Handle other errors
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
    if (!existingPantryID) {
      const newPantryID = await Pantry.createPantry(user_id);
      res.status(201).json({
        message: "Pantry has been created for user",
        pantry_id: newPantryID,
      });
    }
    else{
      return res.status(200).json({
        message: "User already has a pantry",
        pantry_id: existingPantryID,
      });
    }
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
    
    // Attempt to add the ingredient to the pantry
    const result = await Pantry.addIngredientToPantry(pantry_id, ingredient_name, quantity);
    res.status(201).json({ message: "Ingredient added to pantry", result });
  } catch (error) {
    // Return the error message
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

// Add Ingredient Quantity
async function addIngredientQuantity(req, res) {
  try {
    const { pantry_id } = req.params;
    const { ingredient_id, quantity } = req.body;
    const result = await Pantry.addIngredientQuantity(pantry_id, ingredient_id, quantity);

    res.status(200).json({ message: "Ingredient quantity updated in pantry", result });
  } catch (error) {
    console.error("Error updating ingredient quantity in pantry:", error);
    res.status(500).json({ error: error.message });
  }
}

// Deduct Ingredient Quantity and calls delete if quantity is 0
async function deductIngredientQuantity(req, res) {
  try {
    const { pantry_id } = req.params;
    const { ingredient_id, quantity } = req.body;
    const result = await Pantry.deductIngredientQuantity(pantry_id, ingredient_id, quantity);

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

// Delete a ingredient from pantry
async function deleteIngredientFromPantry(req, res) {
  try {
    const { pantry_id } = req.params;
    const { ingredient_id } = req.body;
    const result = await Pantry.deleteIngredientFromPantry(pantry_id, ingredient_id);

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
  deductIngredientQuantity,
  addIngredientQuantity,
  deleteIngredientFromPantry,
};
