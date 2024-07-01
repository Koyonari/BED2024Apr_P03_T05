const express = require('express');
const router = express.Router();
const recipeController = require('../../controllers/recipeController');

// GET /fetchrecipes - Fetch all recipes
router.get('/fetchrecipes', recipeController.getRecipes);

// POST /recipes - Create a new recipe
router.post('/recipes', recipeController.insertRecipe);

// PATCH /recipes/:id - Update a recipe
router.patch('/recipes/:id', recipeController.updateRecipe);

// DELETE /recipes/:id - Delete a recipe
router.delete('/recipes/:id', recipeController.deleteRecipe);

module.exports = router;
