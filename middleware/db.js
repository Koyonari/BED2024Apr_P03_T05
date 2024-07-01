const sql = require('mssql');
const { dbConfig } = require('../config/dbConfig');

// Singleton pattern to manage the connection pool
const poolPromise = (async () => {
    let pool = null;

    const connect = async () => {
        if (!pool) {
            try {
                pool = await sql.connect(dbConfig);
                console.log('Connected to SQL Server');
            } catch (err) {
                console.error('Error connecting to SQL Server:', err.message);
                throw err; // Re-throw the error to be handled upstream
            }
        }
        return pool;
    };

    // Ensure initial connection
    await connect();

    return { connect };
})();

module.exports = {
    sql,
    poolPromise
};
