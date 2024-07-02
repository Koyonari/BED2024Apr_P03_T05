const express = require('express');
const router = express.Router();
const recipeController = require('../../controllers/recipeController');
const verifyJWT = require('../../middleware/verifyJWT');

// GET /api/fetchrecipes - Fetch all recipes
router.get('/fetch', verifyJWT, recipeController.getRecipes);
router.get('/byuser',recipeController.getAllRecipesByUserId);

// POST /api/storerecipe - Store a new recipe
router.post('/storerecipe', recipeController.storeRecipe);

// PUT /api/updaterecipe/:id - Update an existing recipe
router.put('/updaterecipe/:id', recipeController.updateRecipe);

// DELETE /api/deleterecipe/:id - Delete a recipe
router.delete('/deleterecipe/:id', recipeController.deleteRecipe);

module.exports = router;
