// Import modules
const sql = require('mssql');
const { dbConfig } = require('../config/dbConfig');
const { v4: uuid4 } = require('uuid');

// Class for Recipe
class Recipe {
  constructor(id, title, imageurl, servings, readyInMinutes, pricePerServing, spoonacularId, userId) {
    this.id = id;
    this.title = title;
    this.imageurl = imageurl;
    this.servings = servings;
    this.readyInMinutes = readyInMinutes;
    this.pricePerServing = pricePerServing;
    this.spoonacularId = spoonacularId;
    this.userId = userId;
  }
}
/// Recipe Functions
// Function to get all recipes by user ID
const getRecipesByUserId = async (userId) => {
  try {
    // Connect to database
    const pool = await sql.connect(dbConfig);

    // SQL query to get recipes by user ID
    const query = `
      SELECT r.id, r.title, r.imageurl, r.servings, r.readyInMinutes, r.pricePerServing, r.spoonacularId
      FROM UserRecipes ur
      INNER JOIN Recipes r ON ur.recipe_id = r.id
      WHERE ur.user_id = @userId;
    `;
    // Execute the query with parameterized input
    const result = await pool.request()
      .input('userId', sql.VarChar(255), userId)
      .query(query);

    // Return the fetched records
    return result.recordset;
  } catch (error) {
    // Log and throw any errors
    console.error('Error fetching recipes by user ID:', error.message);
    throw error;
  } finally {
    sql.close(); // Close the pool connection
  }
};

// Function to get a recipe by recipe ID, stored in database
const getRecipeById = async (recipeId) => {
  try {
    // Connect to the database
    const pool = await sql.connect(dbConfig);

    // SQL query to get a recipe by its ID
    const query = `
      SELECT id, title, imageurl, servings, readyInMinutes, pricePerServing
      FROM Recipes
      WHERE id = @recipeId;
    `;

    // Execute the query with parameterized input
    const result = await pool.request()
      .input('recipeId', sql.VarChar(255), recipeId)
      .query(query);

    // Check if a recipe was found
    if (result.recordset.length === 0) {
      return null; // No recipe found with the given ID
    }
    // Return the first (and only) recipe found
    return result.recordset[0];
  } catch (error) {
    // Log and throw any errors
    console.error('Error fetching recipe by ID:', error.message);
    throw error;
  } finally {
    // Close the database connection in the finally block
    sql.close();
  }
};

// Function to get all recipes stored in database
const getAllStoredRecipes = async () => {
  try {
    // Connect to the database
    const pool = await sql.connect(dbConfig);

    // SQL query to get all recipes
    const query = `
      SELECT id, title, imageurl, servings, readyInMinutes, pricePerServing
      FROM Recipes;
    `;

    // Execute the query to get all recipes
    const result = await pool.request().query(query);

    // Return the list of recipes
    return result.recordset;
  } catch (error) {
    // Log and throw any errors
    console.error('Error fetching all recipes:', error.message);
    throw error;
  } finally {
    // Close the database connection in the finally block
    sql.close();
  }
};

// Function to insert a new recipe and link it to the user
const insertRecipe = async (recipe, userId) => {
  // Connect to database
  const pool = await sql.connect(dbConfig);
  const transaction = new sql.Transaction(pool);

  try {
    // Begin a transaction to ensure data integrity
    await transaction.begin();
    // Call function to Insert recipe details into recipe  table
    const { recipeId } = await insertRecipeDetails(pool, recipe, userId);
    console.log('Recipe ID:', recipeId);
    // Call function to Insert recipe ingredients into ingredients table
    await insertRecipeIngredients(transaction, recipe, recipeId);
    // Call function to Link user to recipe in UserRecipes table
    await linkUserToRecipe(transaction, userId, recipeId);
    // Commit the transaction if all operations are successful
    await transaction.commit();
    console.log(`Recipe successfuly inserte/updated and linked to user ${userId}: ${recipe.title}`);
  } catch (err) {
    await transaction.rollback();
    console.error('Error inserting recipe:', err.message);
    throw err;
  } finally {
    // Close the database connection in the finally block
    pool.close();
  }
};

// Function to get a recipe by recipe ID, stored in database
const getRecipeIngredientsById = async (recipeId) => {
  try {
    // Connect to the database
    const pool = await sql.connect(dbConfig);

    // SQL query to get a recipe by its ID
    const query = `
      SELECT i.ingredient_id, i.ingredient_name, i.ingredient_image, ri.amount, ri.unit
      FROM RecipeIngredients ri
      INNER JOIN Recipes r ON ri.recipe_id = r.id
      INNER JOIN Ingredients i ON ri.ingredient_id = i.ingredient_id
      WHERE recipe_id = @recipeId
    `;

    // Execute the query with parameterized input
    const result = await pool.request()
      .input('recipeId', sql.VarChar(255), recipeId.toString())
      .query(query);

    // Check if a recipe was found
    if (result.recordset.length === 0) {
      return null; // No recipe found with the given ID
    }
    // Return the first (and only) recipe found
    return result.recordset;
  } catch (error) {
    // Log and throw any errors
    console.error('Error fetching recipe by ID:', error.message);
    throw error;
  } finally {
    // Close the database connection in the finally block
    sql.close();
  }
};

// Function for Inserting recipe details, part of insertRecipe
const insertRecipeDetails = async (pool, recipe, userId) => {
  try {
    // Validate recipe fields
    if (!recipe || !recipe.id || !recipe.title) {
      throw new Error('Recipe object, id, or title is undefined');
    }

    const spoonacularId = recipe.id.toString(); // Convert spoonacular id to string
    console.log(spoonacularId);

    // Ensure title is a string
    if (typeof recipe.title !== 'string') {
      throw new Error(`Recipe title must be a string, but received ${typeof recipe.title}`);
    }

    // Check if the recipe with the same id already exists
    const existingRecipe = await pool.request()
      .input('user_id_check', sql.VarChar(255), userId)
      .input('spoonacularid_check', sql.VarChar(255), spoonacularId)
      .query(`
        SELECT *
        FROM UserRecipes ur
        INNER JOIN Recipes r ON ur.recipe_id = r.id
        INNER JOIN Users u ON ur.user_id = u.user_id
        WHERE ur.user_id = @user_id_check AND r.spoonacularId = @spoonacularid_check
      `);

    if (existingRecipe.recordset.length > 0) {
      // Extract the recipe_id from the result set
      const recipeId = existingRecipe.recordset[0].recipe_id;
      console.log(`Recipe with spoonacularId ${spoonacularId} already exists with recipe_id ${recipeId}.`);
      // Update the recipe details
      await updateRecipeDetails(pool, recipe, recipeId);
      return { recipeId };
    } else {
      console.log(`No existing recipe found with spoonacularId ${spoonacularId}.`);
    }

    // Generate a unique ID for the recipe, primary key
    const idString = uuid4();

    // If recipe doesn't exist, insert it
    const insertQuery = `
      INSERT INTO Recipes (id, title, imageurl, servings, readyInMinutes, pricePerServing, spoonacularId)
      VALUES (@id_insert, @title, @imageurl, @servings, @readyInMinutes, @pricePerServing, @spoonacularId);
    `;
    await pool.request()
      .input('id_insert', sql.VarChar(255), idString)
      .input('title', sql.NVarChar, recipe.title)
      .input('imageurl', sql.NVarChar, recipe.image || '')
      .input('servings', sql.Int, recipe.servings)
      .input('readyInMinutes', sql.Int, recipe.readyInMinutes)
      .input('pricePerServing', sql.Float, recipe.pricePerServing)
      .input('spoonacularId', sql.VarChar(255), spoonacularId)
      .query(insertQuery);
    console.log(`Recipe with id ${idString} and spoonacular id ${spoonacularId} inserted successfully.`);
    return { recipeId: idString };
  } catch (error) {
    console.error('Error inserting/updating recipe details:', error.message);
    throw error;
  }
};

// Update existing recipe details
const updateRecipeDetails = async (pool, recipe, recipeId) => {
  try {
    console.log('Received recipe for update:', recipe); // Log received recipe
    // Debugging: Check if recipe and its properties are defined
    if (!recipe || !recipe.id || !recipe.title) {
      throw new Error('Recipe object, id, or title is undefined');
    }

    const updateQuery = `
      UPDATE Recipes
      SET 
        title = @title, 
        imageurl = @imageurl, 
        servings = @servings, 
        readyInMinutes = @readyInMinutes, 
        pricePerServing = @pricePerServing,
        spoonacularId = @spoonacularId
      WHERE id = @id_update;
    `;

    await pool.request()
      .input('id_update', sql.VarChar(255), recipeId) // Make sure recipe.id is defined
      .input('title', sql.NVarChar, recipe.title) // Ensure recipe.title is a string
      .input('imageurl', sql.NVarChar, recipe.image || '') // Default to empty if recipe.image is not provided
      .input('servings', sql.Int, recipe.servings)
      .input('readyInMinutes', sql.Int, recipe.readyInMinutes)
      .input('pricePerServing', sql.Float, recipe.pricePerServing)
      .input(`spoonacularId`, sql.VarChar(255), recipe.id.toString())
      .query(updateQuery);

    console.log(`Recipe details updated for recipe with id ${recipe.id}.`);
  } catch (error) {
    console.error('Error updating recipe details:', error.message);
    throw error;
  }
};

// Update existing recipe details, no pool parameter
const updateRecipeDetailsbyUser = async (recipe) => {
  // Connect to database
  const pool = await sql.connect(dbConfig);
  try {
    console.log('Received recipe for update:', recipe); // Log received recipe
    // Debugging: Check if recipe and its properties are defined
    if (!recipe || !recipe.id || !recipe.title) {
      throw new Error('Recipe object, id, or title is undefined');
    }

    const updateQuery = `
      UPDATE Recipes
      SET 
        title = @title, 
        imageurl = @imageurl, 
        servings = @servings, 
        readyInMinutes = @readyInMinutes, 
        pricePerServing = @pricePerServing,
        spoonacularId = @spoonacularId
      WHERE id = @id_update;
    `;

    await pool.request()
      .input('id_update', sql.VarChar(255), recipe.id.toString()) // Make sure recipe.id is defined
      .input('title', sql.NVarChar, recipe.title) // Ensure recipe.title is a string
      .input('imageurl', sql.NVarChar, recipe.image || '') // Default to empty if recipe.image is not provided
      .input('servings', sql.Int, recipe.servings)
      .input('readyInMinutes', sql.Int, recipe.readyInMinutes)
      .input('pricePerServing', sql.Float, recipe.pricePerServing)
      .input(`spoonacularId`, sql.VarChar(255), null)
      .query(updateQuery);

    console.log(`Recipe details updated for recipe with id ${recipe.id}.`);
  } catch (error) {
    console.error('Error updating recipe details:', error.message);
    throw error;
  }
};

// Inserting recipe ingredients, part of insertRecipe
const insertRecipeIngredients = async (pool, recipe, recipeId) => {
  try {
    for (const ingredient of recipe.extendedIngredients) {
      await insertOrUpdateIngredient(pool, ingredient);
      await linkRecipeIngredient(pool, recipeId, ingredient);
    }
  } catch (error) {
    console.error('Error inserting recipe ingredients:', error.message);
    throw error;
  }
};

const insertRecipeIngredient = async (ingredient, recipeId) => {
  try {
    // Connect to database
    const pool = await sql.connect(dbConfig);
    await insertOrUpdateIngredient(pool, ingredient);
    await linkRecipeIngredient(pool, recipeId, ingredient);
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
        .input('amount', sql.Float, ingredient.amount || '')
        .input('unit', sql.NVarChar, ingredient.unit || '')
        .query(insertQuery);

      console.log(`Linked recipe ${recipeId} to ingredient ${ingredient.id}`);
    } else if (result.recordset[0].count > 0) {
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
const editRecipe = async (recipeId, updates) => {
  const pool = await sql.connect(dbConfig);

  try {
    // Build the SET clause dynamically
    const fields = Object.keys(updates)
      .map(field => `${field} = @${field}`)
      .join(', ');

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE Recipes
      SET ${fields}
      WHERE id = @recipeId;
    `;

    // Prepare the SQL request
    const request = pool.request().input('recipeId', sql.VarChar(255), recipeId);

    // Dynamically add parameters to the request based on the updates object
    Object.entries(updates).forEach(([key, value]) => {
      // Determine the SQL data type based on the value
      let type;
      if (typeof value === 'string') {
        type = sql.NVarChar;
      } else if (typeof value === 'number') {
        type = sql.Float;
      } else if (Number.isInteger(value)) {
        type = sql.Int;
      } else {
        throw new Error(`Unsupported data type for field ${key}`);
      }
      request.input(key, type, value);
    });

    // Execute the query
    await request.query(query);

    console.log(`Recipe updated successfully for recipeId ${recipeId}.`);
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    throw error;
  } finally {
    // Ensure the pool connection is closed
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

// Function to delete recipe ingredients by recipe ID and ingredient ID
const deleteRecipeIngredients = async (recipeId, ingredientId) => {
  const pool = await sql.connect(dbConfig);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    // Check if the ingredient exists in the recipe
    const checkIngredientQuery = `
  SELECT COUNT(*)
  FROM RecipeIngredients
  WHERE recipe_id = @recipeId AND ingredient_id = @ingredientId;
`;
    const checkResult = await transaction.request()
      .input('recipeId', sql.VarChar(255), recipeId)
      .input('ingredientId', sql.VarChar(255), ingredientId)
      .query(checkIngredientQuery);

    if (checkResult.recordset[0][''] === 0) {
      throw new Error('Ingredient does not exist in the specified recipe');
    }
    const deleteRecipeIngredientsQuery = `
      DELETE FROM RecipeIngredients
      WHERE recipe_id = @recipeId AND ingredient_id = @ingredientId;
    `;
    await transaction.request()
      .input('recipeId', sql.VarChar(255), recipeId)
      .input('ingredientId', sql.VarChar(255), ingredientId)
      .query(deleteRecipeIngredientsQuery);

    await transaction.commit();
    console.log(`Ingredient with ID ${ingredientId} from recipe ${recipeId} deleted successfully.`);
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting recipe ingredient:', error.message);
    throw error;
  } finally {
    pool.close();
  }
};

// Export the module functions  
module.exports = {
  Recipe,
  getRecipeById,
  getRecipesByUserId,
  getAllStoredRecipes,
  getRecipeIngredientsById,
  insertRecipe,
  insertRecipeIngredient,
  updateRecipeDetails,
  updateRecipeDetailsbyUser,
  editRecipe,
  deleteRecipe,
  deleteRecipeIngredients
};
