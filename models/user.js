const sql = require("mssql");
const config = require("../config");

class User {
  constructor(user_id, username) {
    this.user_id = user_id;
    this.username = username;
  }

  /////////////////////// Create User
  static async createUser(newUserData) {
    let connection;
    try {
      connection = await sql.connect(config.db);

      const sqlQuery = `
          INSERT INTO Users (user_id, username) 
          VALUES (@user_id, @username); 
          SELECT SCOPE_IDENTITY() AS id;
        `;

      const request = connection.request();
      request.input("user_id", sql.NVarChar, newUserData.user_id);
      request.input("username", sql.NVarChar, newUserData.username);

      const result = await request.query(sqlQuery);

      connection.close();

      // Retrieve the newly created user using its ID
      return await this.getUserByUID(newUserData.user_id);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    } finally {
      if (connection) {
        connection.close();
      }
    }
  }
  ///////////////////////

  /////////////////////// Get User by UID

  static async getUserByUID(user_id) {
    const connection = await sql.connect(config.db);

    const sqlQuery = `SELECT * FROM Users WHERE user_id = @user_id`;

    const request = connection.request();
    request.input("user_id", user_id);

    const result = await request.query(sqlQuery);

    connection.close();

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    return new User(row.user_id, row.username);
  }
  ///////////////////////

  /////////////////////// Get All Users
  static async getAllUsers() {
    const connection = await sql.connect(config.db);

    const sqlQuery = `SELECT * FROM Users`;

    const request = connection.request();
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset.map((row) => new User(row.user_id, row.username)); // Convert rows to User objects
  }
}

module.exports = User;
