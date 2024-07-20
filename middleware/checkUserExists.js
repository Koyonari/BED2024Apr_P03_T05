const mongoose = require('mongoose');
const User = require('../models/user');

const checkUserExists = async (req, res, next) => {
    const userId = req.params.id;

    // Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    try {
        // Check if the user exists in the database
        const existingUser = await User.findById(userId);
        
        if (!existingUser) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }

        // Attach the existingUser to the request object for further use in the route handler
        req.user = existingUser;

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        console.error('Error checking user existence:', err.message);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

module.exports = checkUserExists;
