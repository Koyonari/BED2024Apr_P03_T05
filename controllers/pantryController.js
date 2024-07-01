const pantryService = require('../services/pantryService');

const getPantryIngredients = async (req, res) => {
    try {
        // Ensure req.user and req.user.UserInfo are defined and contain userid
        const userid= req.userid;
        console.log('UserID:', userid); // Log to check if userId is correctly fetched

        if (!userid) {
            return res.status(401).json({ message: 'Unauthorized: User information not available' });
        }
        
        // Call pantry service with userId
        const ingredients = await pantryService.getIngredients(userid);
        res.json(ingredients);
    } catch (error) {
        console.error('Error fetching pantry ingredients:', error);

        // Check specific error types and handle accordingly
        if (error.name === 'UnauthorizedError') {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token expired' });
        }

        res.status(500).json({ message: 'Error fetching pantry ingredients', error: error.message });
    }
};

module.exports = {
    getPantryIngredients
};
