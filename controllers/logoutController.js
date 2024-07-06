// Import moduels
const User = require('../models/user');

// handleLogout function, handles logout process
const handleLogout = async (req, res) => {
    // Extract the refreshToken from the cookie
    const cookies = req.cookies;
    // If the cookie is not present, return a 204 status code
    if (!cookies?.jwt) return res.sendStatus(204);
    // Extract the refreshToken from the cookie
    const refreshToken = cookies.jwt;

    // Check if the refreshToken exists in the database
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        // Clear JWT cookie from the client
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        // Return a 204 status code
        return res.sendStatus(204);
    }

    // Clear the refreshToken from the user object in MongoDB
    foundUser.refreshToken = '';
    // Save the updated user object in MongoDB
    const result = await foundUser.save();
    console.log ('Refresh Token has been cleared', result);

    // Clear the cookie from the client
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    
    // Send a 204 No Content response indicating successful logout
    res.sendStatus(204);
}

module.exports = { handleLogout }
