const { sql, poolPromise } = require('../middleware/db');

const getIngredients = async (userId) => {
    const query = `SELECT Ingredients.ingredient_name
                   FROM Pantry
                   JOIN PantryIngredient ON Pantry.pantry_id = PantryIngredient.pantry_id
                   JOIN Ingredients ON PantryIngredient.ingredient_id = Ingredients.ingredient_id
                   WHERE Pantry.user_id = @userId`;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.VarChar, userId)
            .query(query);

        return result.recordset.map(row => row.ingredient_name);
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        throw error; // Re-throw the error to be handled upstream
    }
};

module.exports = {
    getIngredients
};
