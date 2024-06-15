const Request = require("../models/request");

async function createRequest(req, res) {
    const reqData = req.body;
    try {
      const createdRequest = await Request.createRequest(reqData);
      res.status(201).json(createdRequest);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating request");
    }
};

async function getRequestById(req, res) {
    const requestId = parseInt(req.params.id);
    try {
      const req = await Request.getRequestById(requestId);
      if (!req) {
        return res.status(404).send("Request not found");
      }
      res.json(req);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving request");
    }
};

async function updateRequest(req, res) {
  const requestId = parseInt(req.params.id);
  const newRequestData = req.body;

  try {
    const updatedRequest = await Request.updateRequest(requestId, newRequestData);
    if (!updatedRequest) {
      return res.status(404).send("Request not found");
    }
    res.json(updatedRequest);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating request");
  }
};

const deleteRequest = async (req, res) => {
  const requestId = parseInt(req.params.id);

  try {
    const success = await Request.deleteRequest(requestId);
    if (!success) {
      return res.status(404).send("Request not found");
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting request");
  }
};

module.exports = {
  createRequest,
  getRequestById,
  updateRequest,
  deleteRequest
}