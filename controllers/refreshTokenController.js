const User = require('../models/user');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.status(401).json({ message: 'Unauthorized: No refreshToken cookie found' });
    }

    const refreshToken = cookies.jwt;

    try {
        const foundUser = await User.findOne({ refreshToken }).exec();
        if (!foundUser) {
            return res.status(403).json({ message: 'Forbidden: RefreshToken does not match any user' });
        }

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) {
                    console.error('Error verifying refreshToken:', err);
                    return res.status(403).json({ message: 'Forbidden: Token verification failed' });
                }

                if (foundUser._id.toString() !== decoded.userid) {
                    console.error('User ID mismatch:', foundUser._id, decoded.userid);
                    return res.status(403).json({ message: 'Forbidden: User ID mismatch' });
                }

                const roles = Array.from(foundUser.roles.values());

                const accessToken = jwt.sign(
                    {
                        UserInfo: {
                            userid: foundUser._id,
                            username: decoded.username,
                            roles: roles
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
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { handleRefreshToken };
