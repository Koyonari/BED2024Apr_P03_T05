const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const verifyJWT = require('../../middleware/verifyJWT');
const checkAuthorisation = require('../../middleware/checkAuthorisation');

// GET /users - Retrieve all users
// POST /users - Create a new user
router.route('/')
    .get(usersController.getAllUsers)
    .post(usersController.createNewUser)

// GET /users/:id - Retrieve a specific user
// PATCH /users/:id - Update a specific user, only admin for any user, only for own user for users/volunteer
// DELETE /users/:id - Delete a specific user (only admins)
router.route('/:id')
    .get(usersController.getUser)
    .patch(verifyJWT, checkAuthorisation, usersController.updateUser)
    .delete(verifyJWT, verifyRoles(ROLES_LIST.Admin), usersController.deleteUser);  // Only admins can delete

module.exports = router;
