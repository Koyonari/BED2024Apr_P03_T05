const User = require('../../../youtube video practices/Test for Assignment/model/User');
const bcrypt = require('bcrypt');
const ROLES_LIST = require('../../../youtube video practices/Test for Assignment/config/roles_list');
const validateUser = require('../middleware/validateUser');

const handleNewUser = async (req, res) => {
    const { username, password, dietaryRestrictions, intolerances, excludedIngredients, address, email, contact, roles } = req.body;

    // Validate the required fields for user creation
    if (!username || !password || !email || !contact) {
        return res.status(400).json({ 'message': 'Username, password, email, and contact are required.' });
    }

    try {
        // Check for duplicate usernames in the database
        const duplicate = await User.findOne({ username }).exec();
        if (duplicate) {
            return res.status(409).json({ 'message': 'Username already exists.' });
        }

        // Encrypt the password
        const hashedPwd = await bcrypt.hash(password, 10);

        // Extract the role from the roles object
        let userRole = { User: ROLES_LIST.User }; // Default to User role
        if (roles) {
            if (roles.User) userRole = { User: ROLES_LIST.User };
            else if (roles.Volunteer) userRole = { Volunteer: ROLES_LIST.Volunteer };
            else if (roles.Admin) userRole = { Admin: ROLES_LIST.Admin };
        }

        // Create new user object
        const newUser = {
            username,
            password: hashedPwd,
            roles: userRole,
            address,
            email,
            contact
        };

        // Add dietaryRestrictions, intolerances, and excludedIngredients if the role is 'User' (2001)
        if (userRole.User === ROLES_LIST.User) {
            newUser.dietaryRestrictions = dietaryRestrictions || [];
            newUser.intolerances = intolerances || [];
            newUser.excludedIngredients = excludedIngredients || [];
        }

        // Validate user input using middleware
        validateUser(req, res, async () => {
            try {
                // Store the new user in the database
                const result = await User.create(newUser);
                console.log(result);
                res.status(201).json({ 'success': `New user ${username} created!` });
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

module.exports = { handleNewUser };
