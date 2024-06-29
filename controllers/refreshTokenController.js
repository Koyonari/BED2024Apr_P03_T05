const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401); // Unauthorized
    const refreshToken = cookies.jwt;

    try {
        const foundUser = await User.findOne({ refreshToken }).exec();
        if (!foundUser) return res.sendStatus(403); // Forbidden

        // Evaluate JWT
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err || foundUser.userid !== decoded.userid) return res.sendStatus(403); // Forbidden
                
                const roles = Array.from(foundUser.roles.values());

                const accessToken = jwt.sign(
                    {
                        "UserInfo": {
                            "userid": foundUser._id,
                            "username": decoded.username,
                            "roles": roles
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '1h' }
                );

                res.json({ accessToken });
            }
        );
    } catch (error) {
        console.error('Error during refresh token verification:', error);
        res.sendStatus(500); // Internal server error
    }
};

module.exports = { handleRefreshToken };
