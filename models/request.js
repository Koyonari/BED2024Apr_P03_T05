const sql = require('mssql');
const dbConfig = require('../dbConfig');

class Request {
    constructor(request_id, title, category, description, user_id, volunteer_id, isCompleted){
        this.request_id = request_id;
        this.title = title;
        this.category = category;
        this.description = description;
        this.user_id = user_id;
        this.volunteer_id = volunteer_id;
        this.isCompleted = isCompleted;
    }

    static async createRequest(request) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `
            INSERT INTO requests (title, category, description, user_id, volunteer_id, isCompleted) 
            VALUES (@title, @category, @description, @user_id, @volunteer_id, @isCompleted); 
            SELECT SCOPE_IDENTITY() AS id;
        `;
        const req = connection.request();
        req.input('title', request.title);
        req.input('category', request.category);
        req.input('description', request.description);
        req.input('user_id', request.user_id);
        req.input('volunteer_id', request.volunteer_id);
        req.input('isCompleted', request.isCompleted);

        const result = await req.query(sqlQuery);
        connection.close();
        return this.getRequestById(result.recordset[0].id);
    }

    static async getRequestById(id) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM requests WHERE request_id = @id`;
        const req = connection.request();
        req.input('id', id);
        const result = await req.query(sqlQuery);
        connection.close();
        return result.recordset[0]
        ? new Request(
            result.recordset[0].request_id,
            result.recordset[0].title,
            result.recordset[0].category,
            result.recordset[0].description,
            result.recordset[0].user_id,
            result.recordset[0].volunteer_id,
            result.recordset[0].isCompleted
        )
        : null;
    }

    static async updateRequest(id, newRequestData) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = 
        `UPDATE requests SET 
        title = @title, 
        category = @category, 
        description = @description, 
        user_id = @user_id, 
        volunteer_id = @volunteer_id,
        isCompleted = @isCompleted
        WHERE request_id = @id`;
    
        const request = connection.request();
        request.input("id", id);
        request.input("title", newRequestData.title);
        request.input("category", newRequestData.category);
        request.input("description", newRequestData.description);
        request.input("user_id", newRequestData.user_id);
        request.input("volunteer_id", newRequestData.volunteer_id || null);
        request.input("isCompleted", newRequestData.isCompleted);        
    
        await request.query(sqlQuery);
    
        connection.close();
    
        return this.getRequestById(id); // returning the updated book data
    }
    
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