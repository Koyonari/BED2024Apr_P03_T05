const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Missing or invalid token format' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
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
                decoded // Optionally log entire decoded token for more details
            });

            next();
        }
    );
};

module.exports = verifyJWT;
