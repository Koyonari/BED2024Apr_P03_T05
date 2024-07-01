const axios = require('axios');
const { sql, poolPromise } = require('../middleware/db');
require('dotenv').config();
const apiKey = process.env.SPOONACULAR_API_KEY;


const fetchRecipes = async (ingredients) => {
    try {
        const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
            params: {
                apiKey: apiKey,
                includeIngredients: ingredients.join(','),
                number: 2
            }
        });

        const recipes = response.data.results;
        console.log(`Fetched ${recipes.length} recipes successfully`);
        return recipes;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        throw error; // Re-throw the error to be handled upstream
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
        console.error(`Error fetching recipe details for recipeId ${recipeId}:`, error);
        throw error; // Re-throw the error to be handled upstream
    }
};

const storeRecipe = async (recipe) => {
    const transaction = new sql.Transaction(poolPromise);

    try {
        await transaction.begin();

        const query = `
            INSERT INTO Recipe (id, title, imageurl, servings, readyInMinutes, pricePerServing)
            VALUES (@id, @title, @imageurl, @servings, @readyInMinutes, @pricePerServing)
        `;

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, recipe.id)
            .input('title', sql.VarChar, recipe.title)
            .input('imageurl', sql.VarChar, recipe.image)
            .input('servings', sql.Int, recipe.servings)
            .input('readyInMinutes', sql.Int, recipe.readyInMinutes)
            .input('pricePerServing', sql.Float, recipe.pricePerServing)
            .query(query);

        for (const ingredient of recipe.extendedIngredients) {
            const ingredientQuery = `
                INSERT INTO RecipeIngredients (recipeid, ingredientid)
                VALUES (@recipeid, @ingredientid)
            `;

            await pool.request()
                .input('recipeid', sql.Int, recipe.id)
                .input('ingredientid', sql.Int, ingredient.id)
                .query(ingredientQuery);
        }

        await transaction.commit();
        console.log(`Recipe with id ${recipe.id} stored successfully`);
    } catch (error) {
        await transaction.rollback();
        console.error('Error storing recipe:', error);
        throw error; // Re-throw the error to be handled upstream
    }
};

module.exports = {
    fetchRecipes,
    fetchRecipeDetails,
    storeRecipe
};
