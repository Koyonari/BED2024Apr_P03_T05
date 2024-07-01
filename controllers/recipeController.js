const recipeService = require('../services/recipeService');
const pantryService = require('../services/pantryService');

// Get recipes and store them in the database
const getRecipes = async (req, res) => {
    try {
        const userId = req.user.UserInfo.userid; // Extracted from JWT token
        const ingredients = await pantryService.getIngredients(userId);
        const recipes = await recipeService.fetchRecipes(ingredients);

        for (const recipe of recipes) {
            const recipeDetails = await recipeService.fetchRecipeDetails(recipe.id);
            await recipeService.storeRecipe(recipeDetails);
        }

        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching and storing recipes', error });
    }
};

// Insert a new recipe
const insertRecipe = async (req, res) => {
    const { id, title, imageurl, servings, readyInMinutes, pricePerServing } = req.body;

    const recipe = {
        id,
        title,
        imageurl,
        servings,
        readyInMinutes,
        pricePerServing
    };

    try {
        await recipeService.insertRecipe(recipe);
        res.status(201).json({ message: 'Recipe inserted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error inserting recipe', error: error.message });
    }
};

// Update an existing recipe
const updateRecipe = async (req, res) => {
    const recipeId = req.params.id;
    const updates = req.body;

    try {
        await recipeService.updateRecipe(recipeId, updates);
        res.json({ message: `Recipe with ID ${recipeId} updated successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Error updating recipe', error: error.message });
    }
};

// Delete a recipe
const deleteRecipe = async (req, res) => {
    const recipeId = req.params.id;

    try {
        await recipeService.deleteRecipe(recipeId);
        res.json({ message: `Recipe with ID ${recipeId} deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting recipe', error: error.message });
    }
};

module.exports = {
    getRecipes,
    insertRecipe,
    updateRecipe,
    deleteRecipe
};
