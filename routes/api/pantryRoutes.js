const express = require('express');
const router = express.Router();
const pantryController = require('../../controllers/pantryController');
const verifyJWT = require('../../middleware/verifyJWT');

router.get('/ingredients', verifyJWT, pantryController.getPantryIngredients);

module.exports = router;
