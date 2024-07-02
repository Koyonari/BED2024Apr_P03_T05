const sql = require('mssql');
const { dbConfig } = require('../config/dbConfig');

// Function to get all recipes by user ID
const getRecipesByUserId = async (userId) => {
  try {
    const pool = await sql.connect(dbConfig);

    // SQL query to get recipes by user ID
    const query = `
      SELECT r.id, r.title, r.imageurl, r.servings, r.readyInMinutes, r.pricePerServing
      FROM UserRecipes ur
      INNER JOIN Recipes r ON ur.recipe_id = r.id
      WHERE ur.user_id = @userId;
    `;

    const result = await pool.request()
      .input('userId', sql.VarChar(255), userId)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error('Error fetching recipes by user ID:', error.message);
    throw error;
  } finally {
    sql.close(); // Close the pool connection
  }
};

// Insert a new recipe and link it to the user
const insertRecipe = async (recipe, userId) => {
  const pool = await sql.connect(dbConfig);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    await insertRecipeDetails(transaction, recipe);
    await insertRecipeIngredients(transaction, recipe);
    await linkUserToRecipe(transaction, userId, recipe.id);

    await transaction.commit();
    console.log(`Recipe inserted and linked to user ${userId}: ${recipe.title}`);
  } catch (err) {
    await transaction.rollback();
    console.error('Error inserting recipe:', err.message);
    throw err;
  } finally {
    pool.close();
  }
};

// Inserting recipe details, part of insertRecipe
const insertRecipeDetails = async (pool, recipe) => {
  try {
    const idString = recipe.id.toString();

    // Check if the recipe with the same id already exists
    const existingRecipe = await pool.request()
      .input('id_check', sql.VarChar(255), idString)
      .query('SELECT * FROM Recipes WHERE id = @id_check');

    if (existingRecipe.recordset.length > 0) {
      // Recipe already exists, update it
      console.log(`Recipe with id ${recipe.id} already exists. Updating.`);
      await updateRecipeDetails(pool, recipe); // Implement update logic
      return; // Exit the function after updating
    }

    // If recipe doesn't exist, insert it
    const insertQuery = `
      INSERT INTO Recipes (id, title, imageurl, servings, readyInMinutes, pricePerServing)
      VALUES (@id_insert, @title, @imageurl, @servings, @readyInMinutes, @pricePerServing);
    `;
    await pool.request()
      .input('id_insert', sql.VarChar(255), idString)
      .input('title', sql.NVarChar, recipe.title)
      .input('imageurl', sql.NVarChar, recipe.image) // Assuming recipe.image is the URL
      .input('servings', sql.Int, recipe.servings)
      .input('readyInMinutes', sql.Int, recipe.readyInMinutes)
      .input('pricePerServing', sql.Float, recipe.pricePerServing)
      .query(insertQuery);

    console.log(`Recipe with id ${recipe.id} inserted successfully.`);
  } catch (error) {
    console.error('Error inserting/updating recipe details:', error.message);
    throw error;
  }
};

// Update existing recipe details
const updateRecipeDetails = async (pool, recipe) => {
  try {
    const updateQuery = `
      UPDATE Recipes
      SET title = @title, imageurl = @imageurl, servings = @servings, readyInMinutes = @readyInMinutes, pricePerServing = @pricePerServing
      WHERE id = @id_update;
    `;
    await pool.request()
      .input('id_update', sql.VarChar(255), recipe.id.toString())
      .input('title', sql.NVarChar, recipe.title)
      .input('imageurl', sql.NVarChar, recipe.image) // Assuming recipe.image is the URL
      .input('servings', sql.Int, recipe.servings)
      .input('readyInMinutes', sql.Int, recipe.readyInMinutes)
      .input('pricePerServing', sql.Float, recipe.pricePerServing)
      .query(updateQuery);

    console.log(`Recipe details updated for recipe with id ${recipe.id}.`);
  } catch (error) {
    console.error('Error updating recipe details:', error.message);
    throw error;
  }
};

// Inserting recipe ingredients, part of insertRecipe
const insertRecipeIngredients = async (pool, recipe) => {
  try {
    for (const ingredient of recipe.extendedIngredients) {
      await insertOrUpdateIngredient(pool, ingredient);
      await linkRecipeIngredient(pool, recipe.id.toString(), ingredient);
    }
  } catch (error) {
    console.error('Error inserting recipe ingredients:', error.message);
    throw error;
  }
};

// Inserting to ingredients table or update, part of insertRecipeIngredients (has to ensure foreign key)
const insertOrUpdateIngredient = async (pool, ingredient) => {
  try {
    const ingredientQuery = `
      MERGE INTO Ingredients AS target
      USING (VALUES (@id_insertOrUpdate, @name, @image)) AS source (ingredient_id, ingredient_name, ingredient_image)
      ON target.ingredient_id = source.ingredient_id
      WHEN MATCHED THEN
        UPDATE SET target.ingredient_name = source.ingredient_name, target.ingredient_image = source.ingredient_image
      WHEN NOT MATCHED THEN
        INSERT (ingredient_id, ingredient_name, ingredient_image) VALUES (source.ingredient_id, source.ingredient_name, source.ingredient_image);
    `;
    await pool.request()
      .input('id_insertOrUpdate', sql.VarChar(255), ingredient.id.toString())
      .input('name', sql.NVarChar, ingredient.name)
      .input('image', sql.NVarChar, ingredient.image || '') // Default to empty if image is not provided
      .query(ingredientQuery);
  } catch (error) {
    console.error('Error inserting/updating ingredient:', error.message);
    throw error;
  }
};

// Linking recipe to ingredient, part of insertRecipeIngredients
const linkRecipeIngredient = async (pool, recipeId, ingredient) => {
  try {
    // Check if the combination already exists
    const checkQuery = `
      SELECT COUNT(*) AS count
      FROM RecipeIngredients
      WHERE recipe_id = @recipeId AND ingredient_id = @ingredientId
    `;
    const result = await pool.request()
      .input('recipeId', sql.VarChar(255), recipeId)
      .input('ingredientId', sql.VarChar(255), ingredient.id.toString())
      .query(checkQuery);

    if (result.recordset[0].count === 0) {
      // If the combination doesn't exist, insert it
      const insertQuery = `
        INSERT INTO RecipeIngredients (recipe_id, ingredient_id, amount, unit)
        VALUES (@recipeId, @ingredientId, @amount, @unit);
      `;
      await pool.request()
        .input('recipeId', sql.VarChar(255), recipeId)
        .input('ingredientId', sql.VarChar(255), ingredient.id.toString())
        .input('amount', sql.Float, ingredient.amount)
        .input('unit', sql.NVarChar, ingredient.unit || '')
        .query(insertQuery);

      console.log(`Linked recipe ${recipeId} to ingredient ${ingredient.id}`);
    } else {
      console.log(`Recipe ${recipeId} is already linked to ingredient ${ingredient.id}`);
    }
  } catch (error) {
    console.error('Error linking recipe to ingredient:', error.message);
    throw error;
  }
};

// Link user to recipe in UserRecipes table
const linkUserToRecipe = async (transaction, userId, recipeId) => {
  try {
    // Check if the user-recipe link already exists
    const checkQuery = `
      SELECT COUNT(*) AS count
      FROM UserRecipes
      WHERE user_id = @userId AND recipe_id = @recipeId
    `;
    const result = await transaction.request()
      .input('userId', sql.VarChar(255), userId.toString())
      .input('recipeId', sql.VarChar(255), recipeId.toString())
      .query(checkQuery);

    if (result.recordset[0].count === 0) {
      // If the combination doesn't exist, insert it
      const insertQuery = `
        INSERT INTO UserRecipes (user_id, recipe_id)
        VALUES (@userId, @recipeId);
      `;
      await transaction.request()
        .input('userId', sql.VarChar(255), userId.toString())
        .input('recipeId', sql.VarChar(255), recipeId.toString())
        .query(insertQuery);

      console.log(`Linked user ${userId} to recipe ${recipeId}`);
    } else {
      console.log(`User ${userId} is already linked to recipe ${recipeId}`);
    }
  } catch (error) {
    console.error('Error linking user to recipe:', error.message);
    throw error;
  }
};


//Update a recipe with provided parameters //Patch Functionaility
const updateRecipe = async (recipeId, updates) => {
  const pool = await sql.connect(dbConfig);

  try {
    const fields = Object.keys(updates).map(field => `${field} = @${field}`).join(', ');

    const query = `
      UPDATE Recipes
      SET ${fields}
      WHERE id = @recipeId;
    `;

    const request = pool.request().input('recipeId', sql.VarChar(255), recipeId);
    Object.entries(updates).forEach(([key, value]) => {
      request.input(key, sql.NVarChar, value);
    });

    await request.query(query);
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    throw error;
  } finally {
    pool.close();
  }
};

// Delete a recipe by user ID and recipe ID
const deleteRecipe = async (recipeId) => {
  const pool = await sql.connect(dbConfig);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const deleteRecipeIngredientsQuery = `
      DELETE FROM RecipeIngredients
      WHERE recipe_id = @recipeId;
    `;
    await transaction.request()
      .input('recipeId', sql.VarChar(255), recipeId)
      .query(deleteRecipeIngredientsQuery);

    const deleteUserRecipesQuery = `
      DELETE FROM UserRecipes
      WHERE recipe_id = @recipeId;
    `;
    await transaction.request()
      .input('recipeId', sql.VarChar(255), recipeId)
      .query(deleteUserRecipesQuery);

    const deleteRecipeQuery = `
      DELETE FROM Recipes
      WHERE id = @recipeId;
    `;
    await transaction.request()
      .input('recipeId', sql.VarChar(255), recipeId)
      .query(deleteRecipeQuery);

    await transaction.commit();
    console.log(`Recipe with ID ${recipeId} and its associated ingredients deleted successfully.`);
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting recipe:', error.message);
    throw error;
  } finally {
    pool.close();
  }
};

module.exports = {
  getRecipesByUserId,
  insertRecipe,
  updateRecipe,
  deleteRecipe,
};
