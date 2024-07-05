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
 
module.exports = { 
    sql, 
    poolPromise 
};