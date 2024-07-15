// Importing modules
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login handler, which will be called when the user sends a POST request to /auth
const handleLogin = async (req, res) => {
    // Extract the username and password from the request body
    const { username, password } = req.body;
    // Check if the username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Find the user with the provided username in MongoDB
        const foundUser = await User.findOne({ username }).exec();
        // If the user is not found, return an error message
        if (!foundUser) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        // Compare the provided password with the hashed password stored in the database
        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) {
            // If the passwords do not match, return an error message
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        // Extract role information from the user object in MongoDB
        const roles = Array.from(foundUser.roles.values());
        // Create an access token, create payload for accessToken
        const accessTokenPayload = {
            UserInfo: {
                userid: foundUser._id,
                username: foundUser.username,
                roles: roles
            }
        };
        
           // Add dietary info to access token if the role is 'User'
           if (roles.includes(2001)) { // 2001 is the code for 'User'
            accessTokenPayload.UserInfo.dietaryRestrictions = foundUser.dietaryRestrictions;
            accessTokenPayload.UserInfo.intolerances = foundUser.intolerances;
            accessTokenPayload.UserInfo.excludedIngredients = foundUser.excludedIngredients;
        }
        // Sign access token with secret key, set expiration to 1hr
        const accessToken = jwt.sign(
            accessTokenPayload,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );
        // Create a refresh token, create payload for refreshToken
        const refreshTokenPayload = { userid: foundUser._id };
        // Sign refresh token with secret key, set expiration to 1 day
        const refreshToken = jwt.sign(
            refreshTokenPayload,
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // Debugging purposes, logging accessToken and refreshToken
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        // Decode and log the tokens to see their contents
        const decodedAccessToken = jwt.decode(accessToken);
        const decodedRefreshToken = jwt.decode(refreshToken);

        console.log('Decoded Access Token:', decodedAccessToken);
        console.log('Decoded Refresh Token:', decodedRefreshToken);
        // Debugging code ends here

        // Save the refresh token in the user object in MongoDB
        foundUser.refreshToken = refreshToken;
        await foundUser.save();

        // Set the refresh token as a cookie in the response [httpOnly should change to https allow?]
        res.cookie('jwt', refreshToken, { httpOnly: true, same_site: 'None', maxAge: 24 * 60 * 60 * 1000 });
        
        // Send the access token in the response
        res.json({ accessToken });
    } catch (error) {
        // Log errors that occur during login with 500 Internal server error
        console.error('Error during login:', error);
        res.sendStatus(500); // Internal server error
    }
};

module.exports = { handleLogin };
