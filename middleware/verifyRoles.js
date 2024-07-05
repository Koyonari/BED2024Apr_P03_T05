const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.roles || !Array.isArray(req.roles)) {
            return res.status(401).json({ message: 'Unauthorized: User roles not provided or invalid format' });
        }

        const rolesArray = req.roles;
        console.log('Roles array:', rolesArray); // Logging allowed roles for debugging

        const result = rolesArray.some(role => allowedRoles.includes(role));
        if (!result) {
            return res.status(403).json({ message: 'Forbidden: User does not have permission to access this resource' });
        }

        next();
    };
};

module.exports = verifyRoles;
