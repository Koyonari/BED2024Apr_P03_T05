const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.roles || !Array.isArray(req.roles)) return res.sendStatus(401); // Ensure roles is an array
        const rolesArray = req.roles;
        console.log('Roles array:', rolesArray); // Logging allowed roles for debugging
        const result = rolesArray.some(role => allowedRoles.includes(role));
        if (!result) return res.sendStatus(401);
        next();
    };
};

module.exports = verifyRoles;
