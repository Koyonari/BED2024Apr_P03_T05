const recipeService = require('../services/recipeService');
const pantryService = require('../services/pantryService');
const {getRecipesByUserId, insertRecipe } = require('../models/recipe');

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
          await insertRecipe(recipeDetails);
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


const storeRecipe = async (req, res) => {
    try {
      const recipe = req.body; // Assuming recipe details are sent in the request body
      await recipeService.storeRecipe(recipe);
      res.status(201).json({ message: 'Recipe stored successfully' });
    } catch (error) {
      console.error('Error storing recipe:', error.message);
      res.status(500).json({ message: 'Error storing recipe', error: error.message });
    }
  };
  
  const updateRecipe = async (req, res) => {
    try {
      const recipeId = req.params.id;
      const updates = req.body; // Assuming updates are sent in the request body
      await recipeService.updateRecipe(recipeId, updates);
      res.json({ message: `Recipe with ID ${recipeId} updated successfully` });
    } catch (error) {
      console.error('Error updating recipe:', error.message);
      res.status(500).json({ message: 'Error updating recipe', error: error.message });
    }
  };
  
  const deleteRecipe = async (req, res) => {
    try {
      const recipeId = req.params.id;
      await recipeService.deleteRecipe(recipeId);
      res.json({ message: `Recipe with ID ${recipeId} deleted successfully` });
    } catch (error) {
      console.error('Error deleting recipe:', error.message);
      res.status(500).json({ message: 'Error deleting recipe', error: error.message });
    }
  };
module.exports = {
    getRecipes,
    getAllRecipesByUserId,
    storeRecipe,
    updateRecipe,
    deleteRecipe
};
