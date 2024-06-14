module.exports = {
    user: "nodeuser", // Replace with your SQL Server login username
    password: "lightning62", // Replace with your SQL Server login password
    server: "localhost",
    database: "na_request",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 60000, // Connection timeout in milliseconds
    },
};