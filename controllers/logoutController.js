const User = require('../models/User');

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No content

    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204); // No content
    }

    // Delete refreshToken in db
    foundUser.refreshToken = '';
    const result = await foundUser.save();

    // Clear the cookie from the client
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    
    // Send a response indicating successful logout
    res.sendStatus(204); // No content
}

module.exports = { handleLogout }
