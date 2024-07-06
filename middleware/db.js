const sql = require('mssql'); 
const {dbConfig} = require("../config/dbConfig"); // Adjust the path to your dbConfig file 
 
const poolPromise = new sql.ConnectionPool(dbConfig) 
    .connect() 
    .then(pool => { 
        console.log('Connected to SQL Server'); 
        return pool; 
    }) 
    .catch(err => { 
        console.error('Database connection failed:', err); 
        throw err; 
    }); 
    // Gracefully handle shutdown
    process.on("SIGINT", async () => {
        console.log("Server is shutting down");
        await sql.close();
        console.log("Database connections closed");
        process.exit(0);
    }
);
 
module.exports = { 
    sql, 
    poolPromise 
};