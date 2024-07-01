const sql = require('mssql');
const { dbConfig } = require('../config/dbConfig');

// Insert a new recipe into the Recipes table
const insertRecipe = async (recipe) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('id', sql.Int, recipe.id)
      .input('title', sql.NVarChar, recipe.title)
      .input('imageurl', sql.NVarChar, recipe.imageurl)
      .input('servings', sql.Int, recipe.servings)
      .input('readyInMinutes', sql.Int, recipe.readyInMinutes)
      .input('pricePerServing', sql.Float, recipe.pricePerServing)
      .query(`
        INSERT INTO Recipes (id, title, imageurl, servings, readyInMinutes, pricePerServing)
        VALUES (@id, @title, @imageurl, @servings, @readyInMinutes, @pricePerServing)
      `);
    console.log(`Recipe inserted: ${recipe.title}`);
  } catch (err) {
    console.error('Error inserting recipe:', err.message);
    throw err; // Re-throw the error to be handled upstream
  }
};

// // Update an existing recipe in the Recipes table (this is for put)
// const updateRecipe = async (recipe) => {
//   try {
//     const pool = await sql.connect(dbConfig);
//     await pool.request()
//       .input('id', sql.Int, recipe.id)
//       .input('title', sql.NVarChar, recipe.title)
//       .input('imageurl', sql.NVarChar, recipe.imageurl)
//       .input('servings', sql.Int, recipe.servings)
//       .input('readyInMinutes', sql.Int, recipe.readyInMinutes)
//       .input('pricePerServing', sql.Float, recipe.pricePerServing)
//       .query(`
//         UPDATE Recipes
//         SET title = @title, imageurl = @imageurl, servings = @servings, 
//             readyInMinutes = @readyInMinutes, pricePerServing = @pricePerServing
//         WHERE id = @id
//       `);
//     console.log(`Recipe updated: ${recipe.title}`);
//   } catch (err) {
//     console.error('Error updating recipe:', err.message);
//     throw err; // Re-throw the error to be handled upstream
//   }
// };

// Update an existing recipe in the Recipes table
const updateRecipe = async (recipeId, updates) => {
  try {
    const pool = await sql.connect(dbConfig);

    // Constructing the SET clause dynamically based on updates
    const setClause = Object.keys(updates).map(key => `${key} = @${key}`).join(', ');

    // Create a request object
    const request = pool.request();

    // Add recipeId as input parameter
    request.input('id', sql.Int, recipeId);

    // Add each update field as input parameter
    Object.keys(updates).forEach(key => {
      request.input(key, sql.NVarChar, updates[key]);
    });

    // Execute the update query
    await request.query(`
      UPDATE Recipes
      SET ${setClause}
      WHERE id = @id
    `);

    console.log(`Recipe with ID ${recipeId} updated`);
  } catch (err) {
    console.error('Error updating recipe:', err.message);
    throw err; // Re-throw the error to be handled upstream
  }
};

// Delete a recipe from the Recipes table based on its ID
const deleteRecipe = async (recipeId) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('id', sql.Int, recipeId)
      .query(`
        DELETE FROM Recipes
        WHERE id = @id
      `);
    console.log(`Recipe deleted with ID: ${recipeId}`);
  } catch (err) {
    console.error('Error deleting recipe:', err.message);
    throw err; // Re-throw the error to be handled upstream
  }
};

module.exports = {
  insertRecipe,
  updateRecipe,
  deleteRecipe,
};
