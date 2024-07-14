const express = require('express');
const router = express.Router();
const recipeController = require('../../controllers/recipeController');
const verifyJWT = require('../../middleware/verifyJWT');
const validateRecipe = require('../../middleware/validateRecipe');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

// GET /api/fetchrecipes - Fetch all recipes
router.get('/fetch', verifyJWT, recipeController.getRecipes);
router.get('/byuser', recipeController.getAllRecipesByUser);
router.get('/fetchrecipes', verifyJWT, verifyRoles(ROLES_LIST.Admin), recipeController.getAllRecipes);
router.get('/recipes/fetchingredients/:id', verifyJWT, recipeController.getRecipeIngredients);

// POST /api/insertrecipe - Insert a new recipe and link to a user
router.post('/insertrecipe', recipeController.insertRecipeByUser);

// POST /api/getfilteredrecipes - Get filtered recipes by user preferences
router.post('/getfilteredrecipes', recipeController.getFilteredRecipesByUser);

// PUT /api/updaterecipedetails/:id - Update recipe details with provided parameters [id in parameter is recipe id]
router.put('/updaterecipedetails/:id', verifyJWT, validateRecipe, recipeController.updateRecipeByUser);
router.put('/updaterecipe/:id', verifyJWT, verifyRoles(ROLES_LIST.Admin), recipeController.updateRecipeByRecipeId);

// PATCH /api/patchrecipe/:id - Update a recipe with provided parameters [id in parameter is recipe id]
router.patch('/editrecipedetails/:id', verifyJWT, recipeController.patchRecipeByUser);
router.patch('/editrecipebyid/:id', verifyJWT, verifyRoles(ROLES_LIST.Admin), recipeController.patchRecipeByRecipeId);

// DELETE /api/deleterecipebyuser/:id - Delete a recipe by user ID and recipe ID [id in parameter is recipe id]
router.delete('/deleterecipe/:id', verifyJWT, recipeController.deleteRecipeByUser);
router.delete('/deleterecipebyid/:id', verifyJWT, verifyRoles(ROLES_LIST.Admin), recipeController.deleteRecipeByRecipeId);

module.exports = router;
