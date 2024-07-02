const recipeService = require('../services/recipeService');
const pantryService = require('../services/pantryService');
const { getRecipesByUserId, insertRecipe, updateRecipe, deleteRecipe } = require('../models/recipe');

// Get recipes and store them in the database
const getRecipes = async (req, res) => {
  try {
    console.log('Fetching recipes...');

    //Get user id from request
    const userId = req.userid;
    console.log('User ID:', userId);

    // Get ingredients from pantry 
    const ingredients = await pantryService.getIngredients(userId);
    console.log('Fetched ingredients:', ingredients);

    // Parse into into SPoonacular API
    const recipes = await recipeService.fetchRecipes(ingredients);
    console.log('Fetched recipes:', recipes);

    for (const recipe of recipes) {
      const recipeDetails = await recipeService.fetchRecipeDetails(recipe.id);
      await insertRecipe(recipeDetails, userId);
    }

    console.log('Recipes stored in the database.');

    res.json(recipes);
  } catch (error) {
    console.error('Error fetching and storing recipes:', error);
    res.status(500).json({ message: 'Error fetching and storing recipes', error: error.message });
  }
};

// Controller function to get recipes by user ID
const getAllRecipesByUserId = async (req, res) => {
  try {
    const userId = req.userid; // Assuming user ID is obtained from request

    if (!userId) {
      return res.status(400).json({ message: 'User ID not provided' });
    }

    const recipes = await getRecipesByUserId(userId);

    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ message: 'No recipes found for the user' });
    }

    res.json(recipes);
  } catch (error) {
    console.error('Error getting recipes by user ID:', error);

    // Check if it's a specific type of error
    if (error.name === 'RequestError') {
      return res.status(500).json({ message: 'Database error', error: error.message });
    }

    // Default error response
    res.status(500).json({ message: 'Error getting recipes by user ID', error: error.message });
  }
};

// Controller function to get filtered recipes by user preferences
const getFilteredRecipesByUser = async (req, res) => {
  try {
    const userId = req.userid; // Extracted from JWT token
    const excludedIngredients = req.excludedIngredients || [];
    const intolerances = req.intolerances || [];
    const dietaryRestrictions = req.dietaryRestrictions || [];

    if (!userId) {
      return res.status(400).json({ message: 'User ID not provided' });
    }

    const ingredients = req.body
    // Debug log for ingredients
    console.log('Ingredients received:', ingredients);

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: 'Ingredients must be provided' });
    }

    const recipes = await recipeService.fetchFilteredRecipes(ingredients, excludedIngredients, intolerances, dietaryRestrictions);

    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ message: 'No recipes found for the given filters' });
    }

    res.json(recipes);
  } catch (error) {
    console.error('Error getting filtered recipes:', error);

    // Handle specific error cases
    if (error.name === 'RequestError') {
      return res.status(500).json({ message: 'Database error', error: error.message });
    }

    // General error response
    res.status(500).json({ message: 'Error getting filtered recipes', error: error.message });
  }
};


// Insert a recipe by user ID
const insertRecipeByUserId = async (req, res) => {
  try {
    const userId = req.userid; // Assuming user ID is obtained from request
    const recipes = req.body;

    if (!userId || !Array.isArray(recipes) || recipes.length === 0) {
      return res.status(400).json({ message: 'User ID and recipes array must be provided' });
    }

    for (const recipe of recipes) {
      // Fetch the recipe details based on the recipe ID
      const recipeDetails = await recipeService.fetchRecipeDetails(recipe.id);

      if (!recipeDetails) {
        return res.status(404).json({ message: `Recipe with ID ${recipe.id} not found` });
      }

      // Insert the recipe into the database
      await insertRecipe(recipeDetails, userId);
    }

    res.status(201).json({ message: 'Recipes inserted and linked to user successfully' });
  } catch (error) {
    if (error.message.includes('Violation of PRIMARY KEY constraint')) {
      return res.status(400).json({ message: 'One or more recipes are already linked to this user', error: error.message });
    }
    console.error('Error inserting recipes:', error.message);
    res.status(500).json({ message: 'Error inserting recipes', error: error.message });
  }
};

// Update a recipe with provided parameters
const patchRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const updates = req.body;

    if (!recipeId || !updates) {
      return res.status(400).json({ message: 'Recipe ID or update data not provided' });
    }

    await updateRecipe(recipeId, updates);
    res.json({ message: `Recipe with ID ${recipeId} updated successfully` });
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    res.status(500).json({ message: 'Error updating recipe', error: error.message });
  }
};

// Delete a recipe by user ID and recipe ID
const deleteRecipeByUserId = async (req, res) => {
  try {
    const userId = req.userid;
    const recipeId = req.params.id;

    if (!userId || !recipeId) {
      return res.status(400).json({ message: 'User ID or recipe ID not provided' });
    }

    await deleteRecipe(recipeId);
    res.json({ message: `Recipe with ID ${recipeId} deleted successfully` });
  } catch (error) {
    console.error('Error deleting recipe:', error.message);
    res.status(500).json({ message: 'Error deleting recipe', error: error.message });
  }
};

module.exports = {
  getRecipes,
  getAllRecipesByUserId,
  getFilteredRecipesByUser,
  insertRecipeByUserId,
  patchRecipe,
  deleteRecipeByUserId,
};
