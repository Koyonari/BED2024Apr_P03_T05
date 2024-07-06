const sql = require('mssql');
const { dbConfig } = require('../config/dbConfig');
const { poolPromise } = require('../middleware/db');

class UserSQL {
  constructor(user_id, username) {
    this.user_id = user_id;
    this.username = username;
  }
}

// Function to create a new user in SQL
const createSQLUser = async (userId, username) => {
  try {
      const pool = await poolPromise;
      const sqlQuery = `
          INSERT INTO Users (user_id, username) 
          VALUES (@userId, @username); 
      `;
      const request = pool.request();
      request.input('userId', sql.VarChar(255), userId);
      request.input('username', sql.VarChar(255), username);
      await request.query(sqlQuery);
  } catch (error) {
      console.error('Error creating user in SQL:', error.message);
      throw error;
  }
};

  // Static method to get a user by user ID, utilised for testing purposes without MongoDB, done by Jason
  const getUserByUID = async (user_id, pool = null) => {
    let internalPool = pool;
    let isInternalPool = false;
    try {
      if (!internalPool) {
        internalPool = await sql.connect(dbConfig);
        isInternalPool = true;
      }

      const sqlQuery = `SELECT * FROM Users WHERE user_id = @user_id`;

      const request = internalPool.request();
      request.input('user_id', user_id);

      const result = await request.query(sqlQuery);

      if (result.recordset.length === 0) {
        return null;
      }

      const userData = result.recordset[0];
      return new User(userData.user_id, userData.username);
    } catch (error) {
      console.error('Error fetching user by ID:', error.message);
      throw error;
    } finally {
      if (isInternalPool && internalPool) {
        internalPool.close();
      }
    }
  }

  // Static method to get all users utilised for testing purposes without MongoDB, done by Jason
  const getAllUsers = async () => {
    let pool;
    try {
      pool = await sql.connect(dbConfig);

      const sqlQuery = `SELECT * FROM Users`;

      const request = pool.request();
      const result = await request.query(sqlQuery);

      return result.recordset.map((row) => new User(row.user_id, row.username));
    } catch (error) {
      console.error('Error fetching all users:', error.message);
      throw error;
    } finally {
      if (pool) {
        pool.close();
      }
    }
  }

module.exports = {
  UserSQL,
  createSQLUser
}
