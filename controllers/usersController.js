const User = require('../models/User');
const bcrypt = require('bcrypt');
const validateUser = require('../middleware/validateUser');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().exec();
        if (!users || users.length === 0) {
            return res.status(204).json({ 'message': 'No users found' });
        }
        res.json(users);
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

const createNewUser = async (req, res) => {
    console.log('Request Body:', req.body);

    const { username, password, dietaryRestrictions, intolerances, excludedIngredients, address, email, contact, roles, firstname, lastname } = req.body;

    if (!username || !password || !email || !contact) {
        return res.status(400).json({ 'message': 'Username, password, email, and contact are required.' });
    }

    if (roles && roles.Admin) {
        return res.status(403).json({ 'message': 'Cannot create an admin user through this operation' });
    }

    try {
        const hashedPwd = await bcrypt.hash(password, 10);

        const newUser = {
            username,
            password: hashedPwd,
            roles: roles || { User: 2001 },
            firstname,
            lastname,
            address,
            email,
            contact,
            dateCreated: new Date()
        };

        if (newUser.roles.User === 2001) {
            newUser.dietaryRestrictions = dietaryRestrictions || [];
            newUser.intolerances = intolerances || [];
            newUser.excludedIngredients = excludedIngredients || [];
        }

        // Validate user input using middleware
        validateUser(req, res, async () => {
            try {
                const result = await User.create(newUser);
                res.status(201).json(result);
            } catch (err) {
                console.error(err);
                res.status(500).json({ 'message': err.message });
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': err.message });
    }
};

const updateUser = async (req, res) => {
    const { id, ...updates } = req.body;

    if (!id) {
        return res.status(400).json({ 'message': 'User ID is required' });
    }

    try {
        const user = await User.findOne({ _id: id }).exec();
        if (!user) {
            return res.status(404).json({ 'message': `User with ID ${id} not found` });
        }

        // Update fields based on the provided updates object
        Object.keys(updates).forEach(key => {
            if (key === 'email' && !updates[key]) {
                // Skip update if email is not provided
                return;
            }
            if (key === 'contact' && !updates[key]) {
                // Skip update if contact is not provided
                return;
            }
            user[key] = updates[key];
        });

        // Validate and save the updated user
        const validationResult = user.validateSync(); // Validate synchronously
        if (validationResult) {
            // If validation fails, return the validation errors
            const errors = Object.keys(validationResult.errors).map(key => ({
                field: key,
                message: validationResult.errors[key].message
            }));
            return res.status(400).json({ errors });
        }

        // Save the user object
        const result = await user.save();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': err.message });
    }
};

const deleteUser = async (req, res) => {
    const userId = req.params.id; // Retrieve user ID from URL parameters

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }

        const result = await user.deleteOne();
        res.json({ message: `User with ID ${userId} deleted successfully` });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
};

const getUser = async (req, res) => {
    if (!req?.params?.id) {
        return res.status(400).json({ 'message': 'User ID is required' });
    }

    try {
        const user = await User.findOne({ _id: req.params.id }).exec();
        if (!user) {
            return res.status(400).json({ 'message': `User ID ${req.params.id} not found` });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': err.message });
    }
};

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser,
    getUser
};
