const pantry = require('../models/pantry');
const recipeService = require('../services/recipeService');
const { getRecipesByUserId, insertRecipe, updateRecipeDetails, editRecipe, deleteRecipe } = require('../models/recipe');

// Get recipes and store them in the database
const getRecipes = async (req, res) => {
  try {
    console.log('Fetching recipes...');

    //Get user id from request
    const userId = req.userid;
    console.log('User ID:', userId);

    // Get ingredients from pantry 
    const ingredients = await pantry.getIngredients(userId);
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
const getAllRecipesByUser = async (req, res) => {
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
const insertRecipeByUser = async (req, res) => {
  try {
    const userId = req.userid; // Obtain from JWT token
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
const updateRecipeByUser = async (req, res) => {
  try {
    const userId = req.userid; // Extracted from JWT token
    const recipeId = req.params.id; // Extracted from URL parameters
    const updates = req.body; // Updates sent in request body
    // Log the request body for debugging purposes
    console.log('Request body:', updates);
    // Check for missing parameters
    if (!userId || !recipeId || !updates) {
      return res.status(400).json({ message: 'User ID, Recipe ID, and updates must be provided' });
    }

    // Ensure that the recipe belongs to the user
    const userRecipes = await getRecipesByUserId(userId);

    // Ensure userRecipes is an array before using find
    if (!Array.isArray(userRecipes)) {
      throw new Error('Error fetching recipes for user');
    }

    const recipe = userRecipes.find(r => r.id === recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found or does not belong to the user' });
    }

    // Update the recipe object with new values
    const updatedRecipe = {
      ...recipe,
      ...updates // Override fields with updates
    };

    // Call service to update the recipe details
    await updateRecipeDetails(updatedRecipe);
    res.status(200).json({ message: 'Recipe updated successfully' });
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    res.status(500).json({ message: 'Error updating recipe', error: error.message });
  }
};

// Update a recipe with provided parameters
const patchRecipeByUser = async (req, res) => {
  try {
    const userId = req.userid; // Extracted from JWT token
    const recipeId = req.params.id; // Extracted from URL parameters
    const updates = req.body; // Updates sent in request body

    // Log the request body for debugging purposes
    console.log('Request body:', updates);

    // Check for missing parameters
    if (!userId || !recipeId || !updates) {
      return res.status(400).json({ message: 'User ID, Recipe ID, and updates must be provided' });
    }

    // Ensure that the recipe belongs to the user
    const userRecipes = await getRecipesByUserId(userId);

    // Ensure userRecipes is an array before using find
    if (!Array.isArray(userRecipes)) {
      throw new Error('Error fetching recipes for user');
    }

    const recipe = userRecipes.find(r => r.id === recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found or does not belong to the user' });
    }

    // Call the service to perform a partial update
    await editRecipe(recipeId, updates);

    res.status(200).json({ message: 'Recipe updated successfully' });
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    res.status(500).json({ message: 'Error updating recipe', error: error.message });
  }
};


// Delete a recipe by user ID and recipe ID
const deleteRecipeByUserId = async (req, res) => {
  try {
    const userId = req.userid; // Extracted from JWT token
    const recipeId = req.params.id; // Extracted from URL parameters

    // Log the request for debugging purposes
    console.log('Request to delete recipe with ID:', recipeId);

    if (!recipeId) {
      return res.status(400).json({ message: 'Recipe ID must be provided' });
    }

    // Ensure that the recipe belongs to the user
    const userRecipes = await getRecipesByUserId(userId);

    // Ensure userRecipes is an array before using find
    if (!Array.isArray(userRecipes)) {
      throw new Error('Error fetching recipes for user');
    }

    const recipe = userRecipes.find(r => r.id === recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found or does not belong to the user' });
    }

    // Call the deleteRecipe function
    await deleteRecipe(recipeId);

    res.status(200).json({ message: 'Recipe and associated ingredients deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error.message);
    res.status(500).json({ message: 'Error deleting recipe', error: error.message });
  }
};

module.exports = {
  getRecipes,
  getAllRecipesByUser,
  getFilteredRecipesByUser,
  insertRecipeByUser,
  updateRecipeByUser,
  patchRecipeByUser,
  deleteRecipeByUserId,
};
