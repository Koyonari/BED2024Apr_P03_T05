const axios = require('axios');
const { sql, poolPromise } = require('../middleware/db');
const { add } = require('date-fns');
require('dotenv').config();
const apiKey = process.env.SPOONACULAR_API_KEY;

// Fetch Recipes based on ingredients, working
const fetchRecipes = async (ingredients) => {
  try {
    // Log the ingredients being mapped
    const mappedIngredients = ingredients.map(ingredient => ingredient.ingredient_name).join(',');
    console.log('Mapped Ingredients:', mappedIngredients);
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey: apiKey,
        includeIngredients: mappedIngredients,
        number: 5 // Adjust as per testing
      }
    });

    const recipes = response.data.results;
    console.log(`Fetched ${recipes.length} recipes successfully`);
    return recipes;
  } catch (error) {
    console.error('Error fetching recipes:', error.message);
    throw error; // Re-throw the error to be handled upstream
  }
};

// Function to fetch filtered recipes
const fetchFilteredRecipes = async (ingredients, excludedIngredients = [], intolerances = [], diet = '') => {
  try {
    if (!Array.isArray(ingredients)) {
      throw new Error('Ingredients should be an array');
    }

    const mappedIngredients = ingredients.map(ingredient => ingredient.ingredient_name).join(',');
    console.log('Mapped Ingredients:', mappedIngredients);

    const excludeIngredients = Array.isArray(excludedIngredients) ? excludedIngredients.join(',') : '';
    const intoleranceList = Array.isArray(intolerances) ? intolerances.join(',') : '';

    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey: apiKey,
        includeIngredients: mappedIngredients,
        excludeIngredients: excludeIngredients,
        intolerances: intoleranceList,
        diet: diet,
        number: 5,
        addRecipeInformation: true
      }
    });
    const recipes = response.data.results.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      imageurl: recipe.image,
      servings: recipe.servings,
      readyInMinutes: recipe.readyInMinutes,
      pricePerServing: recipe.pricePerServing
    }));
    console.log(`Fetched ${recipes.length} recipes successfully`);
    return recipes;
  } catch (error) {
    console.error('Error fetching recipes:', error.message);
    throw error;
  }
};

const fetchRecipeDetails = async (recipeId) => {
  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
      params: {
        apiKey: apiKey,
      }
    });

    const recipeDetails = response.data;
    console.log(`Fetched recipe details for recipeId ${recipeId} successfully`);
    return recipeDetails;
  } catch (error) {
    console.error(`Error fetching recipe details for recipeId ${recipeId}:`, error.message);
    throw error; // Re-throw the error to be handled upstream
  }
};

module.exports = {
  fetchRecipes,
  fetchFilteredRecipes,
  fetchRecipeDetails
};
