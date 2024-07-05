const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const foundUser = await User.findOne({ username }).exec();
        if (!foundUser) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const roles = Array.from(foundUser.roles.values());

        const accessTokenPayload = {
            UserInfo: {
                userid: foundUser._id,
                username: foundUser.username,
                roles: roles
            }
        };
        
           // Add dietary info to access token if the role is 'User'
           if (roles.includes(2001)) { // Assuming 2001 is the code for 'User'
            accessTokenPayload.UserInfo.dietaryRestrictions = foundUser.dietaryRestrictions;
            accessTokenPayload.UserInfo.intolerances = foundUser.intolerances;
            accessTokenPayload.UserInfo.excludedIngredients = foundUser.excludedIngredients;
        }

        const accessToken = jwt.sign(
            accessTokenPayload,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        const refreshTokenPayload = { userid: foundUser._id };

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
