const sql = require('mssql');
const { dbConfig } = require('../config/dbConfig');

// Function to get all recipes by user ID
const getRecipesByUserId = async (userId) => {
  try {
    const pool = await sql.connect(dbConfig);

    // Query to get recipes by user ID
    const query = `
      SELECT r.id, r.title, r.imageurl, r.servings, r.readyInMinutes, r.pricePerServing,
       ri.amount AS ingredientAmount, ri.unit AS ingredientUnit, i.ingredient_name
FROM Recipes r
INNER JOIN RecipeIngredients ri ON r.id = ri.recipe_id
INNER JOIN Ingredients i ON ri.ingredient_id = i.ingredient_id
INNER JOIN Pantry p ON p.user_id = @userId -- Check this join condition
INNER JOIN PantryIngredient pi ON p.pantry_id = pi.pantry_id -- Check this join condition
WHERE p.user_id = @userId; -- Ensure correct usage of user_id or pantry_id
    `;
    const result = await pool.request()
      .input('userId', sql.VarChar(255), userId)
      .query(query);

    // Organize recipes and ingredients data
    const recipes = {};
    result.recordset.forEach(row => {
      const { id, title, imageurl, servings, readyInMinutes, pricePerServing, ingredientAmount, ingredientUnit, ingredient_name } = row;
      if (!recipes[id]) {
        recipes[id] = {
          id,
          title,
          imageurl,
          servings,
          readyInMinutes,
          pricePerServing,
          ingredients: []
        };
      }
      recipes[id].ingredients.push({
        amount: ingredientAmount,
        unit: ingredientUnit,
        name: ingredient_name
      });
    });

    return Object.values(recipes); // Convert object to array of recipes
  } catch (error) {
    console.error('Error fetching recipes by user ID:', error.message);
    throw error;
  } finally {
    sql.close();
  }
};

/// Insert a new recipe into the Recipes table
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
    pool.close(); // Close the pool to release resources
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

// SQL Transaction version of storeRecipe
const storeRecipe = async (recipe) => {
  const pool = await sql.connect(dbConfig);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Insert recipe details into Recipes table
    const query = `
          INSERT INTO Recipes (id, title, imageurl, servings, readyInMinutes, pricePerServing)
          VALUES (@id, @title, @imageurl, @servings, @readyInMinutes, @pricePerServing);
      `;
    await pool.request()
      .input('id', sql.VarChar(255), recipe.id.toString()) // Convert id to string here
      .input('title', sql.NVarChar, recipe.title)
      .input('imageurl', sql.NVarChar, recipe.image)
      .input('servings', sql.Int, recipe.servings)
      .input('readyInMinutes', sql.Int, recipe.readyInMinutes)
      .input('pricePerServing', sql.Float, recipe.pricePerServing)
      .query(query);

    // Check if each ingredient exists in Ingredients table
    for (const ingredient of recipe.extendedIngredients) {
      const checkIngredientQuery = `
              SELECT ingredient_id FROM Ingredients WHERE ingredient_id = @id;
          `;
      const checkResult = await pool.request()
        .input('id', sql.Int, ingredient.id)
        .query(checkIngredientQuery);

      // If ingredient does not exist, insert it into Ingredients table
      if (checkResult.recordset.length === 0) {
        const insertIngredientQuery = `
                  INSERT INTO Ingredients (ingredient_id, ingredient_name)
                  VALUES (@id, @name);
              `;
        await pool.request()
          .input('id', sql.Int, ingredient.id)
          .input('name', sql.NVarChar, ingredient.name)
          .query(insertIngredientQuery);
      }

      // Insert into RecipeIngredients table
      const ingredientQuery = `
              INSERT INTO RecipeIngredients (recipeid, ingredientid)
              VALUES (@recipeid, @ingredientid);
          `;
      await pool.request()
        .input('recipeid', sql.Int, recipe.id)
        .input('ingredientid', sql.Int, ingredient.id)
        .query(ingredientQuery);
    }

    // Commit the transaction if all operations succeed
    await transaction.commit();
    console.log(`Recipe with id ${recipe.id} stored successfully`);
  } catch (error) {
    // Rollback the transaction if any error occurs
    await transaction.rollback();
    console.error('Error storing recipe:', error);
    throw error; // Re-throw the error to be handled upstream
  } finally {
    // Close the pool to release resources
    pool.close();
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
  getRecipesByUserId,
  insertRecipe,
  storeRecipe,
  updateRecipe,
  deleteRecipe
};
