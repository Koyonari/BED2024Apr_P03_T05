const express = require('express');
const reqController = require("./controllers/requestController");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const { validateRequest, validatePatchAcceptedRequest, validatePatchApproveRequest } = require("./middlewares/validateRequest");

const app = express();
const port = 5000;

// async function resetIdentity() {
//   try {
//     const pool = await sql.connect(dbConfig);
//     const result = await pool.request().query("DBCC CHECKIDENT ('requests', RESEED, 3);");
//     console.log('Identity reset successfully.');
//     await sql.close();
//   } catch (err) {
//     console.error('Error resetting identity:', err);
//   }
// }

// // Call the function to reset the identity
// resetIdentity();

// Middleware to handle JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/req/user/:id", reqController.getRequestByUserId);
app.post('/req', validateRequest, reqController.createRequest);
app.get("/available", reqController.getAvailableRequest);
app.patch("/req/accepted/update/:id", validatePatchAcceptedRequest, reqController.updateAcceptedRequest);
app.get("/req/accepted/:id", reqController.getAcceptedRequestById);
app.patch("/req/completed/:id", reqController.updateCompletedRequest);
app.get("/req/:id", reqController.getRequestById);
app.get("/user/:id", reqController.getUserDetailsById);
app.patch("/req/approve/:id", validatePatchApproveRequest ,reqController.updateApproveRequest);
app.get("/accepted", reqController.getAcceptedRequest); 
app.delete("/req/:id", reqController.deleteRequest);

// Start server and connect to database
app.listen(port, async () => {
    try {
        await sql.connect(dbConfig);
        console.log("Database connection established successfully");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1); // Exit with error code 1
    }
  
    console.log(`Server listening on port ${port}`);
});

// Gracefully handle shutdown
process.on("SIGINT", async () => {
    console.log("Server is shutting down.");
    await sql.close();
    console.log("Database connection closed.");
    process.exit(0); // Exit with success code 0
});
