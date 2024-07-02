const express = require('express');
const router = express.Router();
const recipeController = require('../../controllers/recipeController');
const verifyJWT = require('../../middleware/verifyJWT');

// GET /api/fetchrecipes - Fetch all recipes
router.get('/fetch', verifyJWT, recipeController.getRecipes);
router.get('/byuser',recipeController.getAllRecipesByUserId);

// POST /api/insertrecipe - Insert a new recipe and link to a user
router.post('/insertrecipe', recipeController.insertRecipeByUserId);
// POST /api/getfilteredrecipes - Get filtered recipes by user preferences
router.post('/getfilteredrecipes', recipeController.getFilteredRecipesByUser);

// PATCH /api/patchrecipe/:id - Update a recipe with provided parameters [id in parameter is recipe id]
router.patch('/patchrecipe/:id', verifyJWT, recipeController.patchRecipe);

// DELETE /api/deleterecipebyuser/:id - Delete a recipe by user ID and recipe ID [id in parameter is recipe id]
router.delete('/deleterecipebyuser/:id', verifyJWT, recipeController.deleteRecipeByUserId);

module.exports = router;
