const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    // Retrieve JWT Token from Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // Check if token is missing or not in Bearer format
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Missing or invalid token format' });
    }
    // Extract token from Bearer token
    const token = authHeader.split(' ')[1];
    // Verify token using JWT library
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET, // JWT Secret Key from .env file
        (err, decoded) => {
            if (err) {
                // Log error for debugging
                console.error('JWT verification error:', err);
                return res.status(403).json({ message: 'Forbidden: Invalid token' });
            }

            // Attach decoded user information to req object
            req.userid = decoded.UserInfo.userid;
            req.roles = decoded.UserInfo.roles;

            // Log req object for debugging
            console.log('Verified JWT. User Info:', {
                userid: req.userid,
                roles: req.roles,
                decoded // Log entire decoded token for more details
            });
            // Proceed to the next middleware or route handler
            next();
        }
    );
};

module.exports = verifyJWT;
