const express = require('express');
const router = express.Router();
const pantryController = require('../../controllers/pantryController');
const verifyJWT = require('../../middleware/verifyJWT');

// Route to get all pantry ingredients 
router.get('/ingredients', verifyJWT, pantryController.getPantryIngredients);

// Jason Pantry Routes
router.post('/:user_id', pantryController.createPantry); // Create a pantry for a user // works
router.get('/:user_id', pantryController.getPantryIDByUserID); // Get the pantry ID for a user // works
router.post('/:pantry_id/ingredients', pantryController.addIngredientToPantry); // Add an ingredient to a pantry // works
router.get('/:pantry_id/ingredients', pantryController.getIngredientsByPantryID); // Get all ingredients in a pantry // works
router.put('/:pantry_id/ingredients', pantryController.updateIngredientInPantry); // Update an ingredient in a pantry // works
router.delete('/:pantry_id/ingredients', pantryController.removeIngredientFromPantry); // Remove an ingredient from a pantry // works
router.post('/:pantry_id/addingredients',pantryController.addIngredientQuantity); // Add quantity to an ingredient in a pantry 

module.exports = router;
