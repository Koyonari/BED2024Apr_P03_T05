const jwt = require('jsonwebtoken');

const checkAuthorisation = (req, res, next) => {
    const token = req.headers.authorization; // Assuming token is passed in headers
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    console.log('Received Token:', token); // Log received token for debugging

    jwt.verify(token.split(' ')[1], process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.error('Error decoding token:', err);
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }

        console.log('Decoded Token:', decoded); // Log decoded token for debugging

        const userId = decoded.UserInfo.userid; // Assuming UserInfo contains userid

        // Check if the user is the same ID as the one being updated or if the user is admin
        if (userId !== req.params.id && (!decoded.UserInfo.roles || decoded.UserInfo.roles.indexOf(2003) === -1)) {
            return res.status(403).json({ message: 'Unauthorized to update this user' });
        }

        // Authorized, proceed to the next middleware or route handler
        next();
    });
};

module.exports = checkAuthorisation;
