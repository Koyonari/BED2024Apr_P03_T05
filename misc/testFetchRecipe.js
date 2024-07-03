const axios = require('axios');
require('dotenv').config(); 
const apiKey = process.env.SPOONACULAR_API_KEY;

// Function to fetch recipes based on ingredients
const fetchRecipes = async (ingredients) => {
    try {
        const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
            params: {
                apiKey: apiKey,
                includeIngredients: ingredients.map(ingredient => ingredient.ingredient_name).join(','),
                number: 5 // Adjust as per your testing needs
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

// Example usage of fetchRecipes function
const testFetchRecipes = async () => {
    const ingredients = [
        { ingredient_id: '10115261', ingredient_name: 'fish' },
        { ingredient_id: '11529', ingredient_name: 'tomato' }
        // Add more ingredients as needed
    ];

    try {
        const recipes = await fetchRecipes(ingredients);
        console.log('Fetched Recipes:', recipes);
    } catch (error) {
        console.error('Error:', error.message);
    }
};

// Execute the test function
testFetchRecipes();
