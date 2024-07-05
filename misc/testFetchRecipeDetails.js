const axios = require('axios');
require('dotenv').config(); 
const apiKey = process.env.SPOONACULAR_API_KEY;

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

// // Test function to fetch details for each recipe
// const testFetchRecipeDetails = async () => {
//     const recipes = [
//         { id: 716408, title: 'Greek-Style Baked Fish: Fresh, Simple, and Delicious' },
//         { id: 659135, title: 'Salmon with roasted vegetables' },
//         { id: 639851, title: 'Cod with Tomato-Olive-Chorizo Sauce and Mashed Potatoes' },
//         { id: 640828, title: 'Crispy Panko and Herb Crusted Salmon' },
//         { id: 640321, title: 'Crab Stacks' }
//     ];

//     try {
//         for (const recipe of recipes) {
//             const recipeDetails = await fetchRecipeDetails(recipe.id);
//             console.log(`Details for recipe ${recipe.title}:`, recipeDetails);
//         }
//     } catch (error) {
//         console.error('Error testing fetchRecipeDetails:', error.message);
//     }
// };

// Test function to fetch details for one recipe
const testFetchRecipeDetails = async () => {
    const recipeId = 716408; // Replace with the recipe ID you want to test

    try {
        const recipeDetails = await fetchRecipeDetails(recipeId);
        console.log(`Details for recipe with ID ${recipeId}:`, recipeDetails);
    } catch (error) {
        console.error('Error testing fetchRecipeDetails:', error.message);
    }
};


// Execute the test function
testFetchRecipeDetails();
