const Pantry = require('../models/pantry');

// Create a pantry for a user
async function createPantry(req, res) {
  try {
    const { user_id } = req.params;
    const pantry_id = await Pantry.createPantry(user_id);
    res.status(201).json({ pantry_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get the pantry ID for a user
async function getPantryIDByUserID(req, res) {
  try {
    const { user_id } = req.params;
    const pantry_id = await Pantry.getPantryIDByUserID(user_id);
    res.status(200).json({ pantry_id });
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
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get all ingredients in a pantry
async function getIngredientsByPantryID(req, res) {
  try {
    const { pantry_id } = req.params;
    const ingredients = await Pantry.getIngredientsByPantryID(pantry_id);
    res.status(200).json(ingredients);
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
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Remove an ingredient from a pantry
async function removeIngredientFromPantry(req, res) {
  try {
    const { pantry_id } = req.params;
    const { ingredient_id } = req.body;
    const result = await Pantry.removeIngredientFromPantry(pantry_id, ingredient_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createPantry,
  getPantryIDByUserID,
  addIngredientToPantry,
  getIngredientsByPantryID,
  updateIngredientInPantry,
  removeIngredientFromPantry,
};
