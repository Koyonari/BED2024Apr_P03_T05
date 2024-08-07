const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const verifyJWT = require('../../middleware/verifyJWT');
const checkAuthorisation = require('../../middleware/checkAuthorisation');
const checkUserExists = require('../../middleware/checkUserExists');
// GET /users - Retrieve all users
// POST /users - Create a new user
router.route('/')
    .get(usersController.getAllUsers)  // GET /users - Retrieve all users
    .post(
        verifyRoles(ROLES_LIST.Admin), // Middleware to verify admin role
        usersController.createNewUser  // POST /users - Create a new user
    );

// GET /users/:id - Retrieve a specific user
// PATCH /users/:id - Update a specific user, only admin for any user, only for own user for users/volunteer
// DELETE /users/:id - Delete a specific user (only admins)
router.route('/:id')
    .get(usersController.getUser)  // GET /users/:id - Retrieve user by ID
    .put(
        checkUserExists,          // Middleware to check if user exists
        checkAuthorisation,       // Middleware to check authorization
        usersController.updateUser // PATCH /users/:id - Update user by ID
    )
    .patch(
        checkUserExists,          // Middleware to check if user exists
        checkAuthorisation,       // Middleware to check authorization
        usersController.editUser // PATCH /users/:id - Update user by ID
    )
    .delete(
        checkUserExists,                  // Middleware to check if user exists
        verifyRoles(ROLES_LIST.Admin),    // Middleware to verify admin role
        usersController.deleteUser        // DELETE /users/:id - Delete user by ID (Admin only)
    );


module.exports = router;
