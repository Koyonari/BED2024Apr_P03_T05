const { sql, poolPromise } = require('./db');

const RecipeModel = {
    addRecipeIngredients: async (recipeId, ingredients) => {
        try {
            const pool = await poolPromise;
            for (const ingredient of ingredients) {
                await pool.request()
                    .input('recipeId', sql.Int, recipeId)
                    .input('ingredientId', sql.Int, ingredient.id)
                    .query('INSERT INTO RecipeIngredients (recipe_id, ingredient_id) VALUES (@recipeId, @ingredientId)');
            }
        } catch (err) {
            console.error('SQL error', err);
        }
    }
};

module.exports = RecipeModel;
