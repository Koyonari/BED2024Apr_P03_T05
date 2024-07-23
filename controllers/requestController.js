const Request = require("../models/request");

// Get requests by User ID
async function getRequestByUserId(req, res) {
  const userId = req.params.id;
  try {
        const requests = await Request.getRequestByUserId(userId);
        if (!requests) {
            return res.status(404).send("No requests found for this user");
        }
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).send("Error retrieving requests");
    }
}

// Create a new request
async function createRequest(req, res) {
    const request = req.body;
    try {
        const createdRequest = await Request.createRequest(request);
        res.status(201).json(createdRequest);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating request");
    }
};

// Get all available requests
async function getAvailableRequest(req, res) {
    try {
        const requests = await Request.getAvailableRequests();
        if (!requests) {
            return res.status(404).send("No available requests found");
        }
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving available requests");
    }
}

// Update an accepted request with a new volunteer ID
async function updateAcceptedRequest(req, res) {
    const requestId = req.params.id;
    const newVolunteerId = req.body.volunteer_id;

    try {
        const updatedRequest = await Request.updateAcceptedRequest(requestId, newVolunteerId);
        if (!updatedRequest) {
            return res.status(404).send("Request not found");
        }
        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating accepted request");
    }
}

// Get accepted requests by volunteer ID
async function getAcceptedRequestById(req, res) {
    const volunteerId = req.params.id;
    try {
        const requests = await Request.getAcceptedRequestById(volunteerId);
        if (!requests) {
            return res.status(404).send("No accepted requests found for this volunteer");
        }
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving accepted requests");
    }
}

// Create Ingredient List
async function createIngredientList(req, res) {
    const { request_id, pantry_id, ingredient_id } = req.body;

    try {
        const createdIngreList = await Request.createIngredientList(request_id, pantry_id, ingredient_id);
        if (createdIngreList.message) {
            res.status(409).json(createdIngreList);
        } else {
            res.status(201).json(createdIngreList);
        }
    } catch (error) {
        console.error("Error creating request ingredients:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Get Request Ingredients
async function getRequestIngredientById(req, res) {
    const requestId = req.params.id;

    try {
        const requestIngredients = await Request.getRequestIngredientById(requestId);
        if (requestIngredients.length === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json(requestIngredients);
    } catch (error) {
        console.error("Error fetching request ingredients:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Update request to completed
async function updateCompletedRequest(req, res) {
    const requestId = req.params.id;

    try {
        const updatedRequest = await Request.updateCompletedRequest(requestId);
        if (!updatedRequest) {
            return res.status(404).send("Request not found");
        }
        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating request to completed");
    }
}

// Get request by ID
async function getRequestById(req, res) {
    const requestId = req.params.id;
    try {
      const request = await Request.getRequestById(requestId);
      if (!request) {
        return res.status(404).send("Request not found");
      }
      res.status(200).json(request);
    } catch (error) {
      res.status(500).send("Error retrieving request");
    }
}

// Get user details by id
async function getUserDetailsById(req, res) {
    const userId = req.params.id;
    try {
        const user = await Request.getUserDetailsById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving user details");
    }
}

// Approve request
async function updateApproveRequest(req, res) {
    const requestId = req.params.id;
    const adminId = req.body.admin_id;

    try {
        const updatedRequest = await Request.updateApproveRequest(requestId, adminId);
        if (!updatedRequest) {
            return res.status(404).send("Request not found");
        }
        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error approving request");
    }
}

// View Accepted Requests
async function getAcceptedRequest(req, res) {
    try {
        const requests = await Request.getAcceptedRequest();
        if (!requests) {
            return res.status(404).send("No accepted requests found");
        }
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving accepted requests");
    }
}

// View Completed Requests
async function getCompletedRequest(req, res) {
    try {
        const requests = await Request.getCompletedRequest();
        if (!requests) {
            return res.status(404).send("No completed requests found");
        }
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving completed requests");
    }
}

// View Approved Requests
async function getApprovedRequest(req, res) {
    try {
        const requests = await Request.getApprovedRequest();
        if (!requests) {
            return res.status(404).send("No approved requests found");
        }
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving approved requests");
    }
}

// Delete a request
async function deleteRequest(req, res) {
    const requestId = req.params.id;

    try {
        const success = await Request.deleteRequest(requestId);
        if (success) {
            return res.status(200).send("Request deleted successfully");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting request");
    }
};

module.exports = {
    getRequestByUserId,
    createRequest,
    getAvailableRequest,
    updateAcceptedRequest,
    getAcceptedRequestById,
    createIngredientList,
    getRequestIngredientById,
    updateCompletedRequest,
    getRequestById,
    getUserDetailsById,
    updateApproveRequest,
    getAcceptedRequest,
    getCompletedRequest,
    getApprovedRequest,
    deleteRequest
};
