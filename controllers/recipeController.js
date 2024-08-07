// Import necessary modules
const pantry = require('../models/pantry');
const recipeService = require('../services/recipeService');
const { getRecipeById, getRecipesByUserId, getAllStoredRecipes, getRecipeIngredientsById, insertRecipe,
  insertRecipeIngredient, updateRecipeDetails, updateRecipeDetailsbyUser, editRecipe, deleteRecipe, deleteRecipeIngredients } = require('../models/recipe');
const { de } = require('date-fns/locale');
const e = require('cors');

// Controller function to fetch recipes based on pantry ingredients, stores them in SQL Database
const getRecipes = async (req, res) => {
  try {
    console.log('Fetching recipes...');

    //Get user id from request
    const userId = req.userid;
    console.log('User ID:', userId);

    // Get ingredients from pantry 
    const ingredients = await pantry.getIngredients(userId);
    console.log('Fetched ingredients:', ingredients);

    // Parse into into Spoonacular API, fetches recipes
    const recipes = await recipeService.fetchRecipes(ingredients);
    console.log('Fetched recipes:', recipes);

    // Iterate thorugh each recipe and fetch detailed informations
    for (const recipe of recipes) {
      const recipeDetails = await recipeService.fetchRecipeDetails(recipe.id);
      // Call the insertRecipe function in recipe model to insert the recipe into the database (create)
      await insertRecipe(recipeDetails, userId);
    }

    console.log('Recipes stored in the database.');
    res.status(201).json(recipes);
  } catch (error) {
    console.error('Error fetching and storing recipes:', error);
    if (error.response && error.response.status === 402) {
      res.status(402).json({ message: 'API key expired or payment required', error: error.message });
    }
    else {
      res.status(500).json({ message: 'Error fetching and storing recipes', error: error.message });
    }
  }
};

// Controller function to get all recipes for a user by user ID
const getAllRecipesByUser = async (req, res) => {
  try {
    const userId = req.userid; // Extract user ID from request (JWT)

    // Check if user ID is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID not provided' });
    }

    // Fetch recipes for the user from the database
    const recipes = await getRecipesByUserId(userId);

    // Check if any recipes were found
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ message: 'No recipes found for the user' });
    }

    res.status(200).json(recipes);
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

// Controller function to get all recipes
const getAllRecipes = async (req, res) => {
  try {
    // Fetch all recipes from the database
    const recipes = await getAllStoredRecipes();

    // Check if any recipes were found
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ message: 'No recipes found' });
    }

    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error getting all recipes:', error);

    // Check if it's a specific type of error
    if (error.name === 'RequestError') {
      return res.status(500).json({ message: 'Database error', error: error.message });
    }

    // Default error response
    res.status(500).json({ message: 'Error getting all recipes', error: error.message });
  }
};

// Controller to handle getting recipe ingredients by recipe ID
const getRecipeIngredients = async (req, res) => {
  const userId = req.userid;
  const recipeId = req.params.id;
  try {
    // Validate recipeId
    if (!recipeId) {
      return res.status(400).json({ error: 'Recipe ID is required' });
    }

    // Check if user ID is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID not provided' });
    }

    // Call the service function to get recipe ingredients
    const ingredients = await getRecipeIngredientsById(recipeId);

    // Check if ingredients were found
    if (!ingredients) {
      return res.status(404).json({ error: 'No ingredients found for the given recipe ID' });
    }

    // Send response with ingredients
    return res.status(200).json(ingredients);
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error('Error in getRecipeIngredients controller:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller function to get filtered recipes by user preferences
const getFilteredRecipesByUser = async (req, res) => {
  try {
    const userId = req.userid; // Extracted user id from JWT token
    const excludedIngredients = req.excludedIngredients || [];
    const intolerances = req.intolerances || [];
    const dietaryRestrictions = req.dietaryRestrictions || [];

    // Check if user id is provided
    if (!userId) {
      return res.status(400).json({ message: 'User ID not provided' });
    }

    // Obtain ingredients as req.body
    const ingredients = req.body
    // Debug log for ingredients
    console.log('Ingredients received:', ingredients);

    // Check if ingredients are provided
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: 'Ingredients must be provided' });
    }

    // Fetch recipes based on the provided filters
    const recipes = await recipeService.fetchFilteredRecipes(ingredients, excludedIngredients, intolerances, dietaryRestrictions);

    // Check if any recipes were found
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ message: 'No recipes found for the given filters' });
    }

    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error getting filtered recipes:', error);

    // Handle specific error cases
    if (error.name === 'RequestError') {
      return res.status(500).json({ message: 'Database error', error: error.message });
    }
    else if (error.response && error.response.status === 402) {
      return res.status(402).json({ message: 'API key expired or payment required', error: error.message });
    }
    else {
      // General error response
      return res.status(500).json({ message: 'Error getting filtered recipes', error: error.message });
    }
  }
};


// Controller function to insert recipes into the database for a user
const insertRecipeByUser = async (req, res) => {
  try {
    const userId = req.userid; // Obtain from JWT token
    const recipes = req.body;
    const errors = []; // To accumulate errors for recipes with missing details
    // Check if user ID and recipes are provided 
    if (!userId || !Array.isArray(recipes) || recipes.length === 0) {
      return res.status(400).json({ message: 'User ID and recipes array must be provided' });
    }
    // Iterate through each recipe and fetch detailed information
    for (const recipe of recipes) {
      // Fetch the recipe details based on the recipe ID
      const recipeDetails = await recipeService.fetchRecipeDetails(recipe.id);
      // Check if the recipe details are found
      if (!recipeDetails) {
        errors.push(`Recipe with ID ${recipe.id} not found`);
      } else {
        try {
          // Call the insertRecipe function in recipe model to insert the recipe into the database (create)
          await insertRecipe(recipeDetails, userId);
        } catch (insertError) {
          // Handle insertion errors
          console.error(`Error inserting recipe ${recipe.id}:`, insertError.message);
          errors.push(`Error inserting recipe ${recipe.id}: ${insertError.message}`);
        }
      }
    }
    // After processing all recipes, check if there were any errors
    if (errors.length > 0) {
      return res.status(404).json({ message: 'Some recipes could not be found', errors });
    }

    res.status(201).json({ message: 'Recipes inserted and linked to user successfully' });
  } catch (error) {
    // Check if the error is due to a primary key violation
    if (error.message.includes('Violation of PRIMARY KEY constraint')) {
      return res.status(400).json({ message: 'One or more recipes are already linked to this user', error: error.message });
    }
    console.error('Error inserting recipes:', error.message);
    res.status(500).json({ message: 'Error inserting recipes', error: error.message });
  }
};

// Controller function to fetch recipes based on pantry ingredients, stores them in SQL Database
const insertRecipeIngredientsByRecipeId = async (req, res) => {
  try {
    const userId = req.userid;
    const recipeId = req.params.id;
    const ingredientsArray = req.body;

    // Check if the recipe belongs to the user
    const isUsersRecipe = await isUserRecipe(userId, recipeId);
    if (!isUsersRecipe) {
      return res.status(404).json({ message: 'Recipe not found or does not belong to the user' });
    }

    // Process each ingredient
    for (const ingredient of ingredientsArray) {
      let ingredientData;
      try {
        // Fetch ingredient data from the API
        console.log('Fetching ingredient:', ingredient.name);
        ingredientData = await recipeService.fetchRecipeIngredient(ingredient.name);
        console.log('Fetched ingredient data:', ingredientData);
      } catch (error) {
        console.error('Error fetching ingredient from API:', error.message);

        // Handle specific 402 errors
        if (error.response && error.response.status === 402) {
          return res.status(402).json({ message: 'API key expired or payment required', error: error.message });
        }

        // Handle other errors related to ingredient fetching
        return res.status(404).json({ message: `Ingredient with name ${ingredient.name} not found` });
      }

      // Format ingredient object for insertion
      const formattedIngredient = {
        id: ingredientData.id,
        name: ingredient.name,
        image: ingredientData.image,
        amount: ingredient.amount || null,
        unit: ingredient.unit || null,
      };

      try {
        // Insert ingredient into the database
        await insertRecipeIngredient(formattedIngredient, recipeId);
      } catch (error) {
        console.error('Error inserting recipe ingredients:', error.message);
        throw new Error('Database connection error'); // Propagate the error to the outer catch block
      }
    }

    // Respond with success message
    res.status(201).json({ message: 'Recipe ingredients updated and stored in the database.' });

  } catch (error) {
    console.error('Error fetching and storing ingredients:', error);

    // Handle API key expiration errors
    if (error.response && error.response.status === 402) {
      return res.status(402).json({ message: 'API key expired or payment required', error: error.message });
    }

    // Handle other internal server errors
    res.status(500).json({ message: 'Error fetching and storing recipes', error: error.message });
  }
};

// Controller function to update a recipe for a user by user ID and recipe ID (PUT)
const updateRecipeByUser = async (req, res) => {
  try {
    const userId = req.userid; // Extracted from JWT token
    const recipeId = req.params.id; // Extracted from URL parameters
    const updates = req.body; // Updates sent in request body

    // Log the request body for debugging purposes
    console.log('User ID:', userId);
    console.log('Recipe ID:', recipeId);
    console.log('Request body (updates):', updates);

    // Check for missing parameters
    if (!userId || !recipeId) {
      return res.status(400).json({ message: 'User ID and Recipe ID must be provided' });
    }
    // Check if updates exist and are not empty
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Updates must be provided to update the recipe' });
    }
    // Ensure that the recipe belongs to the user
    const userRecipes = await getRecipesByUserId(userId);

    // Ensure userRecipes is an array before using find
    if (!Array.isArray(userRecipes)) {
      throw new Error('Error fetching recipes for user');
    }
    // Find the recipe object in the user's recipes array, where the input recipe ID matches the primary key recipe ID
    const recipe = userRecipes.find(r => r.id === recipeId);
    // Check if the recipe is found
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found or does not belong to the user' });
    }
    // Log the found recipe
    console.log('Found recipe:', recipe);

    // Update the recipe object with new values
    const updatedRecipe = {
      ...recipe,
      ...updates // Override fields with updates
    };

    // Log the updated recipe
    console.log('Updated recipe:', updatedRecipe);

    // Call the updateRecipeDetailsbyUser function in recipe model to update the recipe (put)
    await updateRecipeDetailsbyUser(updatedRecipe);
    res.status(200).json({ message: 'Recipe updated successfully' });
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    res.status(500).json({ message: 'Error updating recipe', error: error.message });
  }
};

// Controller function to update a recipe by recipe ID, this is for admin purposes (PUT)
const updateRecipeByRecipeId = async (req, res) => {
  try {
    const recipeId = req.params.id; // Extracted from URL parameters
    const updates = req.body; // Updates sent in request body

    // Log the request body for debugging purposes
    console.log('Recipe ID:', recipeId);
    console.log('Request body (updates):', updates);

    // Check for missing parameters
    if (!recipeId || !updates) {
      return res.status(400).json({ message: 'Recipe ID and updates must be provided' });
    }
    // Check if updates exist and are not empty
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Updates must be provided to update the recipe' });
    }
    // Fetch the recipe from the database using the recipe ID
    const recipe = await getRecipeById(recipeId);

    // Check if the recipe is found
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Log the found recipe
    console.log('Found recipe:', recipe);

    // Update the recipe object with new values
    const updatedRecipe = {
      ...recipe,
      ...updates // Override fields with updates
    };

    // Log the updated recipe
    console.log('Updated recipe:', updatedRecipe);

    // Call the updateRecipeDetails function in the recipe model to update the recipe (put)
    await updateRecipeDetailsbyUser(updatedRecipe);
    res.status(200).json({ message: 'Recipe updated successfully by Admin' });
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    res.status(500).json({ message: 'Error updating recipe', error: error.message });
  }
};

// Controller function to update a recipe with provided parameters (PATCH)
const patchRecipeByUser = async (req, res) => {
  try {
    const userId = req.userid; // Extracted from JWT token
    const recipeId = req.params.id; // Extracted from URL parameters
    const updates = req.body; // Updates sent in request body

    // Log the request body for debugging purposes
    console.log('Request body:', updates);

    // Check for missing parameters
    if (!userId || !recipeId) {
      // Respond with error if any required parameters are missing
      return res.status(400).json({ message: 'User ID and Recipe ID must be provided' });
    }
    // Check if updates exist and are not empty
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Updates must be provided to update the recipe' });
    }
    // Check if the recipe belongs to the user
    const isUsersRecipe = await isUserRecipe(userId, recipeId);
    if (!isUsersRecipe) {
      return res.status(404).json({ message: 'Recipe not found or does not belong to the user' });
    }
    // Call the editRecipe function in recipe model to patch the recipe (patch)
    await editRecipe(recipeId, updates);
    // Respond with success message
    res.status(200).json({ message: 'Recipe updated successfully' });
  } catch (error) {
    // Log the error message
    console.error('Error updating recipe:', error.message);
    // Respond with error message
    res.status(500).json({ message: 'Error updating recipe', error: error.message });
  }
};

// Controller function to update a recipe with provided parameters, for admins (PATCH)
const patchRecipeByRecipeId = async (req, res) => {
  try {
    const recipeId = req.params.id; // Extracted from URL parameters
    const updates = req.body; // Updates sent in request body

    // Log the request body for debugging purposes
    console.log('Request body:', updates);

    // Check for missing parameters
    if (!recipeId || !updates) {
      // Respond with error if any required parameters are missing
      return res.status(400).json({ message: 'Recipe ID and updates must be provided' });
    }

    // Call the editRecipe function in recipe model to patch the recipe
    await editRecipe(recipeId, updates);
    // Respond with success message
    res.status(200).json({ message: 'Recipe updated successfully by Admin' });
  } catch (error) {
    // Log the error message
    console.error('Error updating recipe:', error.message);
    // Respond with error message
    res.status(500).json({ message: 'Error updating recipe', error: error.message });
  }
};


// Controller function to delete a recipe by recipe ID (for users)
const deleteRecipeByUser = async (req, res) => {
  try {
    const userId = req.userid; // Extracted from JWT token
    const recipeId = req.params.id; // Extracted from URL parameters

    // Log the request for debugging purposes
    console.log('Request to delete recipe with ID:', recipeId);
    // Check if recipe ID is provided
    if (!recipeId) {
      return res.status(400).json({ message: 'Recipe ID must be provided' });
    }

    // Check if the recipe belongs to the user
    const isUsersRecipe = await isUserRecipe(userId, recipeId);
    if (!isUsersRecipe) {
      return res.status(404).json({ message: 'Recipe not found or does not belong to the user' });
    }
    // Call the deleteRecipe function
    await deleteRecipe(recipeId);
    // Respond with success message
    res.status(200).json({ message: 'Recipe and associated ingredients deleted successfully' });
  } catch (error) {
    // Log the error message
    console.error('Error deleting recipe:', error.message);
    // Respond with error message
    res.status(500).json({ message: 'Error deleting recipe', error: error.message });
  }
};

// Controller function to delete a recipe by recipe ID (for admins) 
const deleteRecipeByRecipeId = async (req, res) => {
    const recipeId = req.params.id; // Extracted from URL parameters

    // Log the request for debugging purposes
    console.log('Admin request to delete recipe with ID:', recipeId);

    // Check if recipe ID is provided
    if (!recipeId) {
      return res.status(400).json({ message: 'Recipe ID must be provided' });
    }
    
    try {
      const allRecipes = await getAllStoredRecipes();
      if (!Array.isArray(allRecipes)) {
        throw new Error('Invalid response from getAllStoredRecipes');
      }
  
      const recipeToDelete = allRecipes.find(recipe => recipe.id === recipeId);
      if (!recipeToDelete) {
        return res.status(404).json({ message: 'Recipe not found' });
      }
  
      await deleteRecipe(recipeId);
      res.status(200).json({ message: 'Recipe deleted successfully by Admin' });
    } catch (error) {
      console.error('Error deleting recipe:', error.message);
      res.status(500).json({ message: 'Error deleting recipe', error: error.message });
    }
  };
  
// Controller function to delete a recipe ingredient by recipe ID and ingredient ID
const deleteRecipeIngredientByRecipeId = async (req, res) => {
  try {
    const userId = req.userid;
    const recipeId = req.params.id;
    const ingredientId = req.body.ingredient_id;

    console.log('Request to delete ingredient with ID:', ingredientId, 'from recipe with ID:', recipeId);

    if (!recipeId || !ingredientId) {
      return res.status(400).json({ message: 'Recipe ID and ingredient ID must be provided' });
    }

    const isUsersRecipe = await isUserRecipe(userId, recipeId);
    console.log('isUsersRecipe:', isUsersRecipe);

    if (!isUsersRecipe) {
      console.log('Recipe not found or does not belong to the user');
      return res.status(404).json({ message: 'Recipe not found or does not belong to the user' });
    }

    await deleteRecipeIngredients(recipeId, ingredientId);
    res.status(200).json({ message: 'Ingredient deleted successfully from recipe' });
  } catch (error) {
    console.error('Error deleting recipe ingredient:', error.message);
    res.status(500).json({ message: 'Error deleting ingredient from recipe', error: error.message });
  }
};

// Function to check user ownership of a recipe
async function isUserRecipe(userId, recipeId) {
  const userRecipes = await getRecipesByUserId(userId);
  if (!Array.isArray(userRecipes)) {
    throw new Error('Error fetching recipes for user');
  }

  const recipe = userRecipes.find(r => r.id === recipeId);
  return recipe !== undefined;
}

module.exports = {
  getRecipes,
  getAllRecipesByUser,
  getFilteredRecipesByUser,
  getAllRecipes,
  getRecipeIngredients,
  insertRecipeByUser,
  insertRecipeIngredientsByRecipeId,
  updateRecipeByUser,
  updateRecipeByRecipeId,
  patchRecipeByUser,
  patchRecipeByRecipeId,
  deleteRecipeByUser,
  deleteRecipeByRecipeId,
  deleteRecipeIngredientByRecipeId,
  isUserRecipe
};
