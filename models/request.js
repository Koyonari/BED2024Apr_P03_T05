const sql = require('mssql');
const dbConfig = require('../dbConfig');

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

    // GET: Package 1.1 & 2.2 - Allows users to view their requests
    static async getRequestByUserId(userId) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM requests WHERE user_id = @userId`;
        const req = connection.request();
        req.input('userId',sql.Int, userId);
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

    // POST: Package 1.2 - Allows users to create requests
    static async createRequest(request) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `
            INSERT INTO requests (title, category, description, user_id, volunteer_id, isCompleted, admin_id) 
            VALUES (@title, @category, @description, @user_id, @volunteer_id, @isCompleted, @admin_id); 
            SELECT SCOPE_IDENTITY() AS id;
        `;
        const req = connection.request();
        req.input('title', request.title);
        req.input('category', request.category);
        req.input('description', request.description);
        req.input('user_id', request.user_id);
        req.input('volunteer_id', request.volunteer_id);
        req.input('isCompleted', request.isCompleted);
        req.input('admin_id', request.admin_id);

        const result = await req.query(sqlQuery);
        connection.close();
        return this.getRequestById(result.recordset[0].id);
    }

    // GET: Package 2.1.2 - Allow Volunteers to view available requests
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

    // Put: Package 2.1.3 - Allow Volunteers to accept available request by updating volunteer_id
    static async updateAcceptedRequest(id, newVolunteerId) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = 
        `UPDATE requests SET 
        volunteer_id = @volunteer_id
        WHERE request_id = @id`;
    
        const request = connection.request();
        request.input("id", sql.Int, id);
        request.input("volunteer_id", sql.Int, newVolunteerId || null);
    
        await request.query(sqlQuery);
    
        connection.close();
    
        return this.getRequestById(id);
    }      

    // GET: Package 2.1.5 & 6.1 - Allow Volunteers to view accepted requests
    static async getAcceptedRequestById(volunteerId) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM requests WHERE volunteer_id = @volunteerId`;
        const req = connection.request();
        req.input('volunteerId',sql.Int, volunteerId);
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

    // PUT: Package 2.2.2 - Allow Users to update the status to true for isCompleted
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
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM requests WHERE request_id = @id`;
        const request = connection.request();
        request.input("id", sql.Int, id);
        const result = await request.query(sqlQuery);
        connection.close();

        if (result.recordset.length > 0) {
            const record = result.recordset[0];
            return new Request(
                record.request_id,
                record.title,
                record.category,
                record.description,
                record.user_id,
                record.volunteer_id,
                record.isCompleted,
                record.admin_id
            );
        } else {
            return null;
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

    // PUT: Package 9.1.2 - Admin approve requests
    static async updateApproveRequest(requestId, adminId) {
        const connection = await sql.connect(dbConfig);
        
        try {
            const sqlQuery = `UPDATE requests SET admin_id = @adminId WHERE request_id = @requestId`;
    
            const request = connection.request();
            request.input('requestId', sql.Int, requestId);
            request.input('adminId', sql.Int, adminId);
    
            await request.query(sqlQuery);
        } catch (error) {
            console.error("Error updating request:", error);
            throw error;
        } finally {
            connection.close();
        }
    
        return this.getRequestById(requestId); // returning the updated request data
    }

    // GET: Package 9.2.1 - Admin view accepted request
    static async getAcceptedRequest() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM requests WHERE volunteer_id IS NOT NULL`;
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
    
    // DELETE: Package 9.2.2 & 9.3.1 - Allow Admins to delete available request
    static async deleteRequest(id) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `DELETE FROM requests WHERE request_id = @id`;
    
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.rowsAffected > 0;
    }
}

module.exports = Request;