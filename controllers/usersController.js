const User = require('../models/user');
const bcrypt = require('bcrypt');
const validateUser = require('../middleware/validateUser');
const { date } = require('joi');
const checkAuthorisation = require('../middleware/checkAuthorisation');
const mongoose = require('mongoose');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().exec();
        if (!users || users.length === 0) {
            return res.status(204).json({ message: 'No users found' });
        }
        res.json(users);
    } catch (err) {
        if (err.name === 'UnauthorizedError') {
            return res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
        }
        res.status(500).json({ message: err.message });
    }
};


const createNewUser = async (req, res) => {
    console.log('Request Body:', req.body);

    const { username, password, dietaryRestrictions, intolerances, excludedIngredients, address, email, contact, roles, firstname, lastname, dateOfBirth } = req.body;

    // Check required fields
    if (!username || !password || !email || !contact) {
        return res.status(400).json({ message: 'Username, password, email, and contact are required.' });
    }

    // Check if trying to create an admin user
    if (roles && roles.Admin) {
        return res.status(403).json({ message: 'Cannot create an admin user through this operation' });
    }

    try {
        // Hash password
        const hashedPwd = await bcrypt.hash(password, 10);

        // Prepare new user object
        const newUser = {
            username,
            password: hashedPwd,
            roles: roles || { User: 2001 },
            firstname,
            lastname,
            address,
            email,
            contact,
            dateCreated: new Date(),
            dateOfBirth: new Date(dateOfBirth)
        };

        // If creating a regular user, include optional fields
        if (newUser.roles.User === 2001) {
            newUser.dietaryRestrictions = dietaryRestrictions || [];
            newUser.intolerances = intolerances || [];
            newUser.excludedIngredients = excludedIngredients || [];
        }

        // Validate user input using middleware or function (assuming validateUser is defined)
        validateUser(req, res, async () => {
            try {
                // Attempt to create the user
                const result = await User.create(newUser);
                res.status(201).json({ message: `User ${username} created successfully` });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Failed to create user', error: err.message });
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params; // Retrieve user ID from URL parameters
    const updates = req.body; // Updates to be applied
    
    if (!id) {
        // Validation to check if user id is provided
        return res.status(400).json({ 'message': 'User ID is required' });
    }

    try {
        // Validation to check if the user id exists in database
        const user = await User.findOne({ _id: id }).exec();
        if (!user) {
            return res.status(404).json({ 'message': `User with ID ${id} not found` });
        }

        // Store the original user document for comparison
        const originalUser = user.toObject();

        // Validate and apply updates
        Object.keys(updates).forEach(key => {
            // Skip updates for certain fields if not provided
            if (key === 'email' && !updates[key]) return;
            if (key === 'contact' && !updates[key]) return;

            // Handle special cases or validations (e.g., dateOfBirth)
            if (key === 'dateOfBirth') {
                user[key] = new Date(updates[key]); // Example: Ensure date is correctly parsed
            } else {
                user[key] = updates[key];
            }
        });

        // Validate the user object
        const validationResult = user.validateSync();
        if (validationResult) {
            const errors = Object.keys(validationResult.errors).map(key => ({
                field: key,
                message: validationResult.errors[key].message
            }));
            return res.status(400).json({ errors });
        }

        // Save the updated user object
        const result = await user.save();

        // Find the differences between the original and updated user
        const editedFields = {};
        Object.keys(updates).forEach(key => {
            if (originalUser[key] !== result[key]) {
                editedFields[key] = result[key];
            }
        });

        // Put the edited fields in the response
        res.json({ message: 'User updated successfully', editedFields });

    } catch (err) {
        console.error('Error updating user:', err);
        // Handle specific MongoDB errors
        if (err.name === 'CastError' && err.kind === 'ObjectId') {
            return res.status(400).json({ message: `Invalid user ID ${id}` });
        }
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

const deleteUser = async (req, res) => {
    const userId = req.params.id; // Retrieve user ID from URL parameters

    try {
        // Check if userId is a valid MongoDB ObjectId
        // if (!userId.match(/^[0-9a-fA-F]{24}$/)) - Alternative regex check, using mongoose method below
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: `Invalid user ID format: ${userId}` });
        }


        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }

        // Delete the user
        await user.deleteOne();
        
        res.json({ message: `User with ID ${userId} deleted successfully` });
    } catch (error) {
        console.error("Error deleting user:", error);

        // Differentiate between different types of errors
        if (error.name === 'CastError') {
            res.status(400).json({ message: `Invalid user ID format: ${userId}` });
        } else if (error.name === 'DocumentNotFoundError') {
            res.status(404).json({ message: `User with ID ${userId} not found` });
        } else {
            res.status(500).json({ message: "Failed to delete user", error: error.message });
        }
    }
};


const getUser = async (req, res) => {
    if (!req?.params?.id) {
        return res.status(400).json({ 'message': 'User ID is required' });
    }

    const userId = req.params.id;

    try {
        // Validate if userId is a valid ObjectId, this is native to mongoose 
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ 'message': 'Invalid user ID format' });
        }

        const user = await User.findOne({ _id: userId }).exec();
        if (!user) {
            return res.status(404).json({ 'message': `User with ID ${userId} not found` });
        }

        console.log('Retrieved User:', user); // Log the retrieved user object
        res.json(user);
    } catch (err) {
        // Handle specific MongoDB errors
        if (err.name === 'CastError' && err.kind === 'ObjectId') {
            return res.status(400).json({ 'message': `Invalid user ID ${userId}` });
        }

        console.error(err);
        res.status(500).json({ 'message': 'Internal server error', 'error': err.message });
    }
};

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser,
    getUser,
    checkAuthorisation
};
