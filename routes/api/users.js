const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const verifyJWT = require('../../middleware/verifyJWT');

router.route('/')
    .get(usersController.getAllUsers)
    .post(usersController.createNewUser)
    .patch(usersController.updateUser);

router.route('/:id')
    .get(usersController.getUser)
    .delete(verifyJWT, verifyRoles(ROLES_LIST.Admin), usersController.deleteUser);  // Only admins can delete

module.exports = router;
