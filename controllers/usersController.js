const User = require('../models/user');
const sql = require('mssql');
const { createSQLUser } = require('../models/usersql');
const { dbConfig } = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const validateUser = require('../middleware/validateUser');
const { date } = require('joi');
const checkAuthorisation = require('../middleware/checkAuthorisation');
const mongoose = require('mongoose');

const getAllUsers = async (req, res) => {
    try {
        // Fetch all users from MongoDB
        const users = await User.find().exec();
        // If no users are found, return a 204 status code
        if (!users || users.length === 0) {
            return res.status(204).json({ message: 'No users found' });
        }
        // Filter out sensitive fields from each user object, password and refreshToken
        const sanitizedUsers = users.map(user => {
            // Deconstruct the user object and remove the password and refreshToken fields
            const { password, refreshToken, ...sanitizedUser } = user.toObject();
            return sanitizedUser; // Return the sanitized user object
        });
        // Return the sanitized user objects
        res.status(200).json(sanitizedUsers);
    } catch (err) {
        // Handle specific MongoDB errors
        if (err.name === 'UnauthorizedError') {
            // Return a 401 status code if the error is an UnauthorizedError
            return res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
        }
        // Send a 500 status code for other errors
        res.status(500).json({ message: err.message });
    }
};

const createNewUser = async (req, res) => {
    // Log user information from the request body
    console.log('Request Body:', req.body);
    // Deconstruct the user information from the request body
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

        // Prepare new user object for MongoDB
        const newUserMongo = new User({
            username,
            password: hashedPwd,
            roles: roles || { User: 2001 },
            firstname,
            lastname,
            address,
            email,
            contact,
            dateCreated: new Date(),
            dateOfBirth: new Date(dateOfBirth),
            // Add dietary info if the role is 'User'
            dietaryRestrictions: roles.User === 2001 ? dietaryRestrictions || [] : [],
            intolerances: roles.User === 2001 ? intolerances || [] : [],
            excludedIngredients: roles.User === 2001 ? excludedIngredients || [] : []
        });

        // Validate user input using middleware or function
        validateUser(req, res, async () => {
            try {
                // Attempt to create the user in MongoDB
                const resultMongo = await newUserMongo.save(); // newUserMongo.save() persists user to MongoDB
                const userId = resultMongo._id.toString();
                // Attempt to create the user in SQL
                const newUserSQL = await createSQLUser(userId, username);

                // Return success response after both operations are complete
                res.status(201).json({
                    message: `User ${username} created successfully in MongoDB and SQL BY Admin ${req.user.username}`,
                    user: { mongoDB: resultMongo, sqlDB: newUserSQL }
                });

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
    // Log user information from the request body
    console.log('Request Body:', req.body);
    // Destructure the user information from the request body
    const { username, password, dietaryRestrictions, intolerances, excludedIngredients, address, email, contact, roles, firstname, lastname, dateOfBirth } = req.body;
    const userId = req.params.id; // Assuming user ID is in the URL parameters

    // Check required fields
    if (!username || !password || !email || !contact) {
        return res.status(400).json({ message: 'Username, password, email, and contact are required.' });
    }

    // Check if trying to create an admin user
    if (roles && roles.Admin) {
        return res.status(403).json({ message: 'Cannot assign Admin role through this operation' });
    }

    try {
        // Hash password if provided
        const hashedPwd = password ? await bcrypt.hash(password, 10) : undefined;

        // Prepare updated user object
        const updatedUser = {
            username,
            password: hashedPwd || undefined, // Only include password if it's being updated
            roles: roles || { User: 2001 }, // Default to User role
            firstname,
            lastname,
            address,
            email,
            contact,
            dateOfBirth: new Date(dateOfBirth), // Ensure date is correctly parsed
            dietaryRestrictions: dietaryRestrictions || [], // Default to empty array
            intolerances: intolerances || [],  // Default to empty array
            excludedIngredients: excludedIngredients || [] // Default to empty array
        };

        // Validate user input using middleware or function (assuming validateUser is defined)
        validateUser(req, res, async () => {
            try {
                // Check if user exists in MongoDB
                const existingUser = await User.findById(userId);
                if (!existingUser) {
                    return res.status(404).json({ message: 'User not found' });
                }
                // Update the user
                await User.findByIdAndUpdate(userId, updatedUser, { new: true });
                // Return success response
                res.status(200).json({ message: `User ${username} updated successfully` });
            } catch (err) {
                console.error('Error updating user:', err.message);
                res.status(500).json({ message: 'Failed to update user', error: err.message });
            }
        });

    } catch (err) {
        console.error('Internal server error:', err.message);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
};

const editUser = async (req, res) => {
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
                user[key] = new Date(updates[key]); // Ensure date is correctly parsed
            } else {
                user[key] = updates[key];
            }
        });

        // Validate the user object
        const validationResult = user.validateSync();
        if (validationResult) {
            // Extract the error messages from the validation result
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
        res.json({ message: 'User updated successfully', editedFields});

    } catch (err) {
        console.error('Error updating user:', err);
        // Handle specific MongoDB errors
        if (err.name === 'CastError' && err.kind === 'ObjectId') {
            return res.status(400).json({ message: `Invalid user ID ${id}` });
        }
        // Send a 500 status code for other errors
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
        // Find the user by ID
        const user = await User.findOne({ _id: userId }).exec();
        if (!user) {
            return res.status(404).json({ 'message': `User with ID ${userId} not found` });
        }

        console.log('Retrieved User:', user); // Log the retrieved user object
        // Filter out sensitive fields from the user object
        const { password, refreshToken, ...sanitizedUser } = user.toObject();
        res.json(sanitizedUser);
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
    editUser,
    deleteUser,
    getUser,
    checkAuthorisation
};
