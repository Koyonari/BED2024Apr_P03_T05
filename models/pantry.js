const sql = require("mssql");
const {dbConfig} = require("../config/dbConfig");
const axios = require("axios");

class Pantry {
  constructor(pantry_id, user_id) {
    this.pantry_id = pantry_id;
    this.user_id = user_id;
  }

  static async createPantry(user_id) {
    let connection;
    try {
      // First, check if the user already has a pantry
      const existingPantryID = await this.getPantryIDByUserID(user_id);
      if (existingPantryID) {
        return existingPantryID;
      }

      connection = await sql.connect(dbConfig);
      const pantry_id = generate5CharacterGene();

      const sqlQuery = `
        INSERT INTO Pantry (pantry_id, user_id) 
        VALUES (@pantry_id, @user_id);
      `;

      const request = connection.request();
      request.input("pantry_id", pantry_id);
      request.input("user_id", user_id);

      await request.query(sqlQuery);

      return pantry_id;
    } catch (error) {
      console.error("Error creating pantry:", error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  static async getPantryIDByUserID(user_id) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);

      const sqlQuery = `
        SELECT pantry_id FROM Pantry WHERE user_id = @user_id;
      `;

      const request = connection.request();
      request.input("user_id", user_id);

      const result = await request.query(sqlQuery);

      if (result.recordset.length === 0) {
        return null; // No pantry found for this user
      }

      return result.recordset[0].pantry_id;
    } catch (error) {
      console.error("Error getting pantry ID by user ID", error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  static async addIngredientToPantry(pantry_id, ingredient_name, quantity) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);

      // Use the Spoonacular API to get the ingredient ID
      const spoonacularResponse = await axios.get(
        `https://api.spoonacular.com/food/ingredients/search`,
        {
          params: {
            query: ingredient_name,
            apiKey: "dfeee259ff5341e0ba251d1513120f8c",
          },
        }
      );

      const ingredientData = spoonacularResponse.data.results[0];
      if (!ingredientData) {
        throw new Error("Ingredient not found");
      }
      const ingredient_id = ingredientData.id;
      const ingredient_name_db = ingredientData.name;

      // Check if the ingredient already exists in the Ingredients table
      await this.checkIngredientQuery(ingredient_id, ingredient_name_db);

      connection = await sql.connect(dbConfig); // Reopens connection
      const request = connection.request();

      // Insert the ingredient into the PantryIngredient table
      const sqlQuery = `
        INSERT INTO PantryIngredient (pantry_id, ingredient_id, quantity) 
        VALUES (@pantry_id, @ingredient_id, @quantity);
      `;

      request.input("pantry_id", pantry_id);
      request.input("ingredient_id", ingredient_id);
      request.input("quantity", quantity);

      await request.query(sqlQuery);

      return { ingredient_id, ingredient_name: ingredient_name_db, quantity };
    } catch (error) {
      console.error("Error adding ingredient to pantry", error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  static async checkIngredientQuery(ingredient_id, ingredient_name) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);

      const checkIngredientQuery = `
        IF NOT EXISTS (SELECT 1 FROM Ingredients WHERE ingredient_id = @ingredient_id)
        BEGIN
          INSERT INTO Ingredients (ingredient_id, ingredient_name) 
          VALUES (@ingredient_id, @ingredient_name);
        END
      `;
      const request = connection.request();
      request.input("ingredient_id", ingredient_id);
      request.input("ingredient_name", ingredient_name);
      await request.query(checkIngredientQuery);

      return { ingredient_id, ingredient_name };
    } catch (error) {
      console.error("Error checking ingredient", error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  static async getIngredientsByPantryID(pantry_id) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);

      const sqlQuery = `
        SELECT i.ingredient_id, i.ingredient_name, pi.quantity
        FROM Ingredients i
        JOIN PantryIngredient pi ON i.ingredient_id = pi.ingredient_id
        WHERE pi.pantry_id = @pantry_id;
      `;

      const request = connection.request();
      request.input("pantry_id", pantry_id);

      const result = await request.query(sqlQuery);

      return result.recordset;
    } catch (error) {
      console.error("Error getting ingredients by pantry ID", error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Update Ingredient Quantity in Pantry
  static async updateIngredientInPantry(pantry_id, ingredient_id, quantity) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);

      const sqlQuery = `
        UPDATE PantryIngredient 
        SET quantity = @quantity
        WHERE pantry_id = @pantry_id AND ingredient_id = @ingredient_id;
      `;

      const request = connection.request();
      request.input("pantry_id", pantry_id);
      request.input("ingredient_id", ingredient_id);
      request.input("quantity", quantity);

      const result = await request.query(sqlQuery);

      if (result.rowsAffected[0] === 0) {
        throw new Error("Ingredient not found in pantry");
      }

      return { pantry_id, ingredient_id, quantity };
    } catch (error) {
      console.error("Error updating ingredient in pantry:", error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Remove Ingredient from Pantry
  static async removeIngredientFromPantry(pantry_id, ingredient_id) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);

      const sqlQuery = `
        DELETE FROM PantryIngredient 
        WHERE pantry_id = @pantry_id AND ingredient_id = @ingredient_id;
      `;

      const request = connection.request();
      request.input("pantry_id", pantry_id);
      request.input("ingredient_id", ingredient_id);

      const result = await request.query(sqlQuery);

      if (result.rowsAffected[0] === 0) {
        throw new Error("Ingredient not found in pantry");
      }

      return { pantry_id, ingredient_id };
    } catch (error) {
      console.error("Error removing ingredient from pantry:", error);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}

module.exports = Pantry;

function generate5CharacterGene() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 5;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}
