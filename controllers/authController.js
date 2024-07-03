const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    // Extract username and password from the request body
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Find the user in mongodb
        const foundUser = await User.findOne({ username }).exec();
        if (!foundUser) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        // Compare the password with the hashed password
        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        // Extract the roles from the user object in mongodb
        const roles = Array.from(foundUser.roles.values());
        // Create an access token and a refresh token
        // The access token contains the user's id, username, and roles
        const accessTokenPayload = {
            UserInfo: {
                userid: foundUser._id,
                username: foundUser.username,
                roles: roles
            }
        };
        
           // Add dietary info to access token if the role is 'User'
           if (roles.includes(2001)) { // 2001 code is for 'User'
            accessTokenPayload.UserInfo.dietaryRestrictions = foundUser.dietaryRestrictions;
            accessTokenPayload.UserInfo.intolerances = foundUser.intolerances;
            accessTokenPayload.UserInfo.excludedIngredients = foundUser.excludedIngredients;
        }
        
        // Sign using the access token secret and set the expiry time to 1 hour
        const accessToken = jwt.sign(
            accessTokenPayload,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        // Create a refresh token with the user's id, this is for users to generate a new access token without login
        const refreshTokenPayload = { userid: foundUser._id };

        // Sign using the refresh token secret and set the expiry time to 1 day
        const refreshToken = jwt.sign(
            refreshTokenPayload,
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // Debugging purposes
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        // Decode and log the tokens to see their contents
        const decodedAccessToken = jwt.decode(accessToken);
        const decodedRefreshToken = jwt.decode(refreshToken);

        console.log('Decoded Access Token:', decodedAccessToken);
        console.log('Decoded Refresh Token:', decodedRefreshToken);
        // Debugging code ends here

        // Save the refresh token to the user object in mongodb
        foundUser.refreshToken = refreshToken;
        await foundUser.save();

        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken });
    } catch (error) {
        console.error('Error during login:', error);
        res.sendStatus(500); // Internal server error
    }
};

module.exports = { handleLogin };
