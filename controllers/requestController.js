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

module.exports = {
  createRequest,
  getRequestById
}