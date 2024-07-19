const express = require('express');
const router = express.Router();
const reqController = require("../../controllers/requestController");
const { validateRequest, validatePatchAcceptedRequest, validatePatchApproveRequest } = require("../../middleware/validateRequest");

// POST ROUTE
// POST: User Creates New Request
router.post('/req', validateRequest, reqController.createRequest);

// GET ROUTES
// GET: User Views Own Request
router.get("/req/user/:id", reqController.getRequestByUserId);
// GET: Volunteer Views Available Requests
router.get("/available", reqController.getAvailableRequest);
// GET: Volunteer View Own Accepted Requests
router.get("/req/accepted/:id", reqController.getAcceptedRequestById);
// GET: User, Volunteer, Admin View Details of Request
router.get("/req/:id", reqController.getRequestById); //need add ingredient list + volunteer id, name, contact, email in charge
// GET: Admin Views Accepted Requests
router.get("/accepted", reqController.getAcceptedRequest);
// GET: Admin Views Completed Requests
router.get("/completed", reqController.getCompletedRequest);
// GET: Admin Views Approved Requests
router.get("/approved", reqController.getApprovedRequest);

// PATCH ROUTES
// PATCH: Volunteer Accepts Request
router.patch("/req/accepted/update/:id", validatePatchAcceptedRequest, reqController.updateAcceptedRequest);
// PATCH: User Updates Request As Completed
router.patch("/req/completed/:id", reqController.updateCompletedRequest);
// PATCH: Admin Approves Request
router.patch("/req/approve/:id", validatePatchApproveRequest, reqController.updateApproveRequest);

// DELETE ROUTE
// DELETE: Admin & User Deletes Request
router.delete("/req/:id", reqController.deleteRequest);

module.exports = router;