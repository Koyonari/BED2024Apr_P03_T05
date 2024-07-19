const express = require('express');
const router = express.Router();
const pantryController = require('../../controllers/pantryController');
const verifyJWT = require('../../middleware/verifyJWT');

// Route to get all pantry ingredients 
router.get('/ingredients', verifyJWT, pantryController.getPantryIngredients); // Yeo Jin Rong

// Jason Pantry Routes
router.post('/:user_id', pantryController.createPantry); // Create a pantry for a user // works
router.post('/:pantry_id/ingredients', pantryController.addIngredientToPantry); // Add an ingredient to a pantry // works

router.get('/:user_id', pantryController.getPantryIDByUserID); // Get the pantry ID for a user // works
router.get('/:pantry_id/ingredients', pantryController.getIngredientsByPantryID); // Get all ingredients in a pantry // works

router.put('/:pantry_id/ingredients', pantryController.updateIngredientInPantry); // Update an ingredient in a pantry // works

router.put('/:pantry_id/deductIngredientQuantity', pantryController.deductIngredientQuantity); // Deduct quantity of ingredient // works
// ^ also deletes ingredient from pantry automatically if quantity is 0 by calling the DELETE in Controller
router.put('/:pantry_id/addIngredientQuantity',pantryController.addIngredientQuantity); // Add quantity of ingredient // works

router.delete('/:pantry_id/deleteIngredient', pantryController.deleteIngredientFromPantry); // Delete an ingredient from a pantry // works

module.exports = router;
