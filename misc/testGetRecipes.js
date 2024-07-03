const axios = require('axios');
const sql = require('mssql');
require('dotenv').config();

const apiKey = process.env.SPOONACULAR_API_KEY;
const dbConfig = {
    user: "BackEnd123", // Replace with your SQL Server login username
    password: "123", // Replace with your SQL Server login password
    server: "localhost",
    database: "backendtest",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 15000 // Connection timeout in milliseconds
    },
};

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
    throw error;
  }
};

const insertRecipe = async (recipe) => {
  const pool = await sql.connect(dbConfig);
  try {
    await insertRecipeDetails(pool, recipe);
    await insertRecipeIngredients(pool, recipe);
    console.log(`Recipe inserted: ${recipe.title}`);
  } catch (err) {
    console.error('Error inserting recipe:', err.message);
    throw err;
  } finally {
    pool.close();
  }
};

const insertRecipeDetails = async (pool, recipe) => {
  try {
    const idString = recipe.id.toString();
    const insertQuery = `
      INSERT INTO Recipes (id, title, imageurl, servings, readyInMinutes, pricePerServing)
      VALUES (@id_insert, @title, @imageurl, @servings, @readyInMinutes, @pricePerServing);
    `;
    await pool.request()
      .input('id_insert', sql.VarChar(255), idString)
      .input('title', sql.NVarChar, recipe.title)
      .input('imageurl', sql.NVarChar, recipe.image)
      .input('servings', sql.Int, recipe.servings)
      .input('readyInMinutes', sql.Int, recipe.readyInMinutes)
      .input('pricePerServing', sql.Float, recipe.pricePerServing)
      .query(insertQuery);

    console.log(`Recipe with id ${recipe.id} inserted successfully.`);
  } catch (error) {
    console.error('Error inserting recipe:', error.message);
    throw error;
  }
};

const insertRecipeIngredients = async (pool, recipe) => {
  for (const ingredient of recipe.extendedIngredients) {
    await insertOrUpdateIngredient(pool, ingredient);
    await linkRecipeIngredient(pool, recipe.id.toString(), ingredient);
  }
};

const insertOrUpdateIngredient = async (pool, ingredient) => {
    try {
      const ingredientQuery = `
        MERGE INTO Ingredients AS target
        USING (VALUES (@id_insertOrUpdate, @name)) AS source (ingredient_id, ingredient_name)
        ON target.ingredient_id = source.ingredient_id
        WHEN MATCHED THEN
          UPDATE SET target.ingredient_name = source.ingredient_name
        WHEN NOT MATCHED THEN
          INSERT (ingredient_id, ingredient_name) VALUES (source.ingredient_id, source.ingredient_name);
      `;
      await pool.request()
        .input('id_insertOrUpdate', sql.VarChar(255), ingredient.id.toString())
        .input('name', sql.NVarChar, ingredient.name)
        .query(ingredientQuery);
    } catch (error) {
      console.error('Error inserting/updating ingredient:', error.message);
      throw error;
    }
  };

  const linkRecipeIngredient = async (pool, recipeId, ingredient) => {
    try {
      const linkQuery = `
        INSERT INTO RecipeIngredients (recipe_id, ingredient_id, amount, unit)
        VALUES (@recipeId_link, @ingredientId_link, @amount, @unit);
      `;
      await pool.request()
        .input('recipeId_link', sql.VarChar(255), recipeId)
        .input('ingredientId_link', sql.VarChar(255), ingredient.id.toString())
        .input('amount', sql.Float, ingredient.amount)
        .input('unit', sql.NVarChar, ingredient.unit || '')
        .query(linkQuery);
    } catch (error) {
      console.error('Error linking recipe to ingredient:', error.message);
      throw error;
    }
  };

const getRecipes = async (ingredients) => {
  try {
    // Fetch recipes from Spoonacular API
    const recipes = await fetchRecipes(ingredients);

    // Iterate through each recipe and fetch details, then insert into database
    for (const recipe of recipes) {
      const recipeDetails = await fetchRecipeDetails(recipe.id);
      await insertRecipe(recipeDetails);
    }

    console.log('All recipes inserted successfully.');
  } catch (error) {
    console.error('Error getting recipes:', error.message);
    throw error;
  }
};

// Example usage:
const testGetRecipes = async () => {
  const ingredients = [
    { ingredient_id: '10115261', ingredient_name: 'fish' },
    { ingredient_id: '11529', ingredient_name: 'tomato' }
    // Add more ingredients as needed
  ];

  try {
    await getRecipes(ingredients);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Execute the test function
testGetRecipes();
