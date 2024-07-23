const sql = require('mssql');
const {dbConfig} = require('../config/dbConfig');
const crypto = require("crypto");

// Generate a 24 varchar string
function generateUUID24() {
    // Define the characters to be used in the string
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    
    let result = '';
    // Generate 24 characters randomly
    for (let i = 0; i < 24; i++) {
      const randomIndex = crypto.randomInt(charactersLength);
      result += characters[randomIndex];
    }
  
    return result;
}

class Request {
    constructor(request_id, title, category, description, user_id, volunteer_id, isCompleted, admin_id){
        this.request_id = request_id;
        this.title = title;
        this.category = category;
        this.description = description;
        this.user_id = user_id;
        this.volunteer_id = volunteer_id;
        this.isCompleted = isCompleted;
        this.admin_id = admin_id;
    }

    // GET: Package 1.1 & 2.2.1 - Allows users to view their requests
    static async getRequestByUserId(userId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM requests WHERE user_id = @userId`;
            const request = connection.request();
            request.input('userId', sql.VarChar(24), userId);
            const result = await request.query(sqlQuery);
            return result.recordset;
        } catch (error) {
            console.error("Error retrieving requests by user ID:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    // POST: Package 1.2 - Allows users to create requests
    static async createRequest(request) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            await connection.connect();
            const uuid = generateUUID24();
            const sqlQuery = `
            INSERT INTO requests (request_id, title, category, description, user_id, volunteer_id, isCompleted, admin_id) 
            VALUES (@request_id, @title, @category, @description, @user_id, NULL, 0, NULL);
            `;
            const req = connection.request();
            req.input('request_id', uuid);
            req.input('title', request.title);
            req.input('category', request.category);
            req.input('description', request.description);
            req.input('user_id', request.user_id);
        
            await req.query(sqlQuery);
            return this.getRequestById(uuid, connection);
        } catch (error) {
            console.error("Error creating requests:", error);
            throw error;
        } finally {
                if (connection) {
                await connection.close();
            }
        }
    }

    // GET: Package 2.1.2 & 9.2.1 - Allow Volunteers and Admins to view available requests
    static async getAvailableRequests() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM requests WHERE volunteer_id IS NULL AND admin_id IS NULL AND isCompleted = 0`;
        const req = connection.request();
        const result = await req.query(sqlQuery);
        connection.close();
    
        if (result.recordset.length > 0) {
            return result.recordset.map(record => new Request(
                record.request_id,
                record.title,
                record.category,
                record.description,
                record.user_id,
                record.volunteer_id,
                record.isCompleted,
                record.admin_id
            ));
        } else {
            return [];
        }
    }    

    // PATCH: Package 2.1.3 - Allow Volunteers to accept available request by updating volunteer_id
    static async updateAcceptedRequest(id, newVolunteerId) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = 
        `UPDATE requests SET 
        volunteer_id = @volunteer_id
        WHERE request_id = @id`;
    
        const request = connection.request();
        request.input("id", id);
        request.input("volunteer_id", newVolunteerId || null);
    
        await request.query(sqlQuery);
    
        connection.close();
    
        return this.getRequestById(id);
    }      

    // GET: Package 2.1.5 & 6.1 - Allow Volunteers to view accepted requests
    static async getAcceptedRequestById(volunteerId) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM requests WHERE volunteer_id = @volunteerId`;
        const req = connection.request();
        req.input('volunteerId', volunteerId);
        const result = await req.query(sqlQuery);
        connection.close();

        if (result.recordset.length > 0) {
            return result.recordset.map(record => new Request(
                record.request_id,
                record.title,
                record.category,
                record.description,
                record.user_id,
                record.volunteer_id,
                record.isCompleted,
                record.admin_id
            ));
        } else {
            return null;
        }
    }

    // POST: Package 2.2.2 - User Creates Ingredient List based on Request
    static async createIngredientList(request_id, pantry_id, ingredient_id) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
    
            // Check if the entry already exists
            const checkQuery = `
                SELECT COUNT(*) as count
                FROM RequestIngredients
                WHERE request_id = @request_id AND ingredient_id = @ingredient_id
            `;
            const checkReq = connection.request();
            checkReq.input('request_id', request_id);
            checkReq.input('ingredient_id', sql.Int, ingredient_id);
    
            const checkResult = await checkReq.query(checkQuery);
            const count = checkResult.recordset[0].count;
    
            if (count === 0) {
                // Entry doesn't exist, so insert it
                const reqing_id = generateUUID24();
    
                const insertQuery = `
                    INSERT INTO RequestIngredients (reqing_id, request_id, pantry_id, ingredient_id) 
                    VALUES (@reqing_id, @request_id, @pantry_id, @ingredient_id);
                `;
                const insertReq = connection.request();
                insertReq.input('reqing_id', reqing_id);
                insertReq.input('request_id', request_id);
                insertReq.input('pantry_id', pantry_id);
                insertReq.input('ingredient_id', ingredient_id);
    
                await insertReq.query(insertQuery);
                return { reqing_id, request_id, pantry_id, ingredient_id, count: 1 };
            } else {
                // Entry already exists
                console.log( "Ingredient already exists for this request", count);
            }
        } catch (error) {
            console.error("Error creating request ingredients:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    // GET: Package 2.2.2 - User Views Request Ingredient List
    static async getRequestIngredientById(id) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `
                SELECT 
                    u.username AS user_name,
                    u.user_id AS user_id,
                    v.username AS volunteer_name,
                    v.user_id AS volunteer_id,
                    r.title AS request_title,
                    r.category AS request_category,
                    r.description AS request_description,
                    i.ingredient_name AS ingredient_name,
                    pi.quantity AS ingredient_quantity
                FROM 
                    RequestIngredients ri
                JOIN 
                    requests r ON ri.request_id = r.request_id
                JOIN 
                    Users u ON r.user_id = u.user_id
                LEFT JOIN 
                    Users v ON r.volunteer_id = v.user_id
                JOIN 
                    Ingredients i ON ri.ingredient_id = i.ingredient_id
                JOIN 
                    PantryIngredient pi ON pi.pantry_id = ri.pantry_id AND pi.ingredient_id = ri.ingredient_id
                WHERE 
                    r.request_id = @request_id;
            `;
            const request = connection.request();
            request.input("request_id", id);
            const result = await request.query(sqlQuery);
            return result.recordset;
        } catch (error) {
            console.error("Error getting request by request ID", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    // PATCH: Package 2.2.2 - Allow Users to update the status to true for isCompleted
    static async updateCompletedRequest(id) {
        const connection = await sql.connect(dbConfig);
        
        const sqlQuery = 
        `UPDATE requests SET 
        isCompleted = 1
        WHERE request_id = @id`;
        
        const request = connection.request();
        request.input("id", id);
        
        await request.query(sqlQuery);
        
        connection.close();
        
        return this.getRequestById(id);
    }

    // GET: Package 2.2.2 & 6.2 - View details of specfic request
    static async getRequestById(id) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            await connection.connect();
            const sqlQuery = `SELECT * FROM requests WHERE request_id = @request_id`;
            const request = connection.request();
            request.input("request_id", id);
            const result = await request.query(sqlQuery);
            return result.recordset[0];
            } catch (error) {
                console.error("Error getting request by request ID", error);
                throw error;
            } finally {
                if (connection) {
                    await connection.close();
                }
        }
    }

    // GET: Package 6.3 - Volunteer view User's profile
    static async getUserDetailsById(userId) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM users WHERE user_id = @userId`;
        const req = connection.request();
        req.input('userId', userId);
        const result = await req.query(sqlQuery);
        connection.close();

        if (result.recordset.length > 0) {
            return result.recordset[0];
        } else {
            return null;
        }
    }

    // PATCH: Package 9.1.2 - Admin approve requests
    static async updateApproveRequest(requestId, adminId) {
        const connection = await sql.connect(dbConfig);
        
        try {
            const sqlQuery = `UPDATE requests SET admin_id = @adminId WHERE request_id = @requestId`;
    
            const request = connection.request();
            request.input('requestId', requestId);
            request.input('adminId', adminId);
    
            await request.query(sqlQuery);
        } catch (error) {
            console.error("Error updating request:", error);
            throw error;
        } finally {
            connection.close();
        }
    
        return this.getRequestById(requestId);
    }

    // GET: Package 9.3.1 - Admin view accepted request
    static async getAcceptedRequest() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM requests WHERE volunteer_id IS NOT NULL AND isCompleted = 0`;
        const req = connection.request();
        const result = await req.query(sqlQuery);
        connection.close();

        if (result.recordset.length > 0) {
            return result.recordset.map(record => new Request(
                record.request_id,
                record.title,
                record.category,
                record.description,
                record.user_id,
                record.volunteer_id,
                record.isCompleted,
                record.admin_id
            ));
        } else {
            return [];
        }
    }

    // GET: Package ____ - Admin view completed request
    static async getCompletedRequest() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM requests WHERE isCompleted = 1 AND admin_id IS NULL`;
        const req = connection.request();
        const result = await req.query(sqlQuery);
        connection.close();

        if (result.recordset.length > 0) {
            return result.recordset.map(record => new Request(
                record.request_id,
                record.title,
                record.category,
                record.description,
                record.user_id,
                record.volunteer_id,
                record.isCompleted,
                record.admin_id
            ));
        } else {
            return [];
        }
    }

    // GET: Package ____ - Admin view approved request
    static async getApprovedRequest() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM requests WHERE admin_id IS NOT NULL`;
        const req = connection.request();
        const result = await req.query(sqlQuery);
        connection.close();

        if (result.recordset.length > 0) {
            return result.recordset.map(record => new Request(
                record.request_id,
                record.title,
                record.category,
                record.description,
                record.user_id,
                record.volunteer_id,
                record.isCompleted,
                record.admin_id
            ));
        } else {
            return [];
        }
    }
    
    // DELETE: Package 9.2.2 & 9.3.2 - Allow Admins to delete available request
    static async deleteRequest(id) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `
        DELETE FROM requests WHERE request_id = @id
        DELETE FROM RequestIngredients WHERE request_id = @id`;
    
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.rowsAffected > 0;
    }
}

module.exports = Request;