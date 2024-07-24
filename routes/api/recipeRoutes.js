const express = require('express');
const router = express.Router();
const recipeController = require('../../controllers/recipeController');
const verifyJWT = require('../../middleware/verifyJWT');
const validateRecipe = require('../../middleware/validateRecipe');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const validateIngredients = require('../../middleware/validateIngredients');

// GET Routes
// GET /api/fetch - Fetch recipes from spoonacular API and automatically insert them into database
router.get('/fetch', recipeController.getRecipes);
// GET /api/fetchuserrecipes - Fetch all recipes by user ID from data base
router.get('/fetchuserrecipes', recipeController.getAllRecipesByUser);
// GET /api/fetchrecipesadmin - Fetch all recipes from data base, admin can fetch all recipes regardless of ownership
router.get('/fetchrecipesadmin',verifyRoles(ROLES_LIST.Admin), recipeController.getAllRecipes);
// GET /api/fetchrecipe/:id - Fetch a recipe by recipe ID and obtain its ingredients
router.get('/fetchingredients/:id', recipeController.getRecipeIngredients);

// POST Routes
// POST /api/insertrecipe - Insert a recipe by user ID, uses spoonacular json object format
router.post('/insertrecipe', recipeController.insertRecipeByUser);
// POST /api/insertrecipeadmin - Insert recipe ingredients to a specific recipe, by recipe ID
router.post('/insertrecipeingredients/:id', recipeController.insertRecipeIngredientsByRecipeId);
// POST /api/getfilteredrecipes - Get filtered recipes by user preferences
router.post('/getfilteredrecipes', validateIngredients, recipeController.getFilteredRecipesByUser);

// PUT Routes
// PUT /api/updaterecipe/:id - Update a recipe with provided parameters [id in parameter is recipe id]
router.put('/updaterecipedetails/:id', validateRecipe, recipeController.updateRecipeByUser);
// PUT /api/updaterecipeadmin/:id - Update a recipe with provided parameters [id in parameter is recipe id], admin can update any recipe
router.put('/updaterecipeadmin/:id', verifyRoles(ROLES_LIST.Admin), recipeController.updateRecipeByRecipeId);

// PATCH Routes
// PATCH /api/editrecipedetails/:id - Edit a recipe by user ID and recipe ID [id in parameter is recipe id]
router.patch('/editrecipedetails/:id', recipeController.patchRecipeByUser);
// PATCH /api/editrecipeadmin/:id - Edit a recipe by recipe ID [id in parameter is recipe id], admin can edit any recipe
router.patch('/editrecipeadmin/:id', verifyRoles(ROLES_LIST.Admin), recipeController.patchRecipeByRecipeId);

// DELETE Routes
// DELETE /api/deleterecipebyuser/:id - Delete a recipe by user ID and recipe ID [id in parameter is recipe id]
router.delete('/deleterecipe/:id', recipeController.deleteRecipeByUser);
// DELETE /api/deleterecipeadmin/:id - Delete a recipe by recipe ID [id in parameter is recipe id], admin can delete any recipe
router.delete('/deleterecipeadmin/:id', verifyRoles(ROLES_LIST.Admin), recipeController.deleteRecipeByRecipeId);
// DELETE /api/deleterecipeingredients/:id - Delete recipe ingredients for a specific recipe by recipe ID [id in parameter is recipe id]
router.delete('/deleterecipeingredients/:id', validateIngredients, recipeController.deleteRecipeIngredientByRecipeId);

module.exports = router;
