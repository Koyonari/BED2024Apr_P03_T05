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

const updateSQLUsername = async (userId, newUsername) => {
  try {
      const pool = await poolPromise;
      const sqlQuery = `
          UPDATE Users 
          SET username = @newUsername 
          WHERE user_id = @userId;
      `;
      const request = pool.request();
      request.input('userId', sql.VarChar(255), userId);
      request.input('newUsername', sql.VarChar(255), newUsername);
      await request.query(sqlQuery);
  } catch (error) {
      console.error('Error updating username in SQL:', error.message);
      throw error;
  }
};
const deleteSQLUser = async (userId) => {
  console.log('Starting SQL user deletion for ID:', userId);

  try {
      const pool = await poolPromise;
      const sqlQuery = `
          DELETE FROM Users 
          WHERE user_id = @userId;
      `;
      const request = pool.request();
      request.input('userId', sql.VarChar(255), userId);

      console.log('Executing SQL query:', sqlQuery);
      await request.query(sqlQuery);

      console.log('SQL user deletion completed for ID:', userId);
  } catch (error) {
      console.error('Error deleting user from SQL:', error.message);
      throw error;
  }
};



module.exports = {
  createSQLUser,
  updateSQLUsername,
  deleteSQLUser
}
