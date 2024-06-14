const sql = require('mssql');
const dbConfig = require('../dbConfig');

class Request {
    constructor(request_id, title, category, description, user_id, volunteer_id){
        this.request_id = request_id;
        this.title = title;
        this.category = category;
        this.description = description;
        this.user_id = user_id;
        this.volunteer_id = volunteer_id;
    }

    static async createRequest(request) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `
            INSERT INTO requests (title, category, description, user_id, volunteer_id) 
            VALUES (@title, @category, @description, @user_id, @volunteer_id); 
            SELECT SCOPE_IDENTITY() AS id;
        `;
        const req = connection.request();
        req.input('title', request.title);
        req.input('category', request.category);
        req.input('description', request.description);
        req.input('user_id', request.user_id);
        req.input('volunteer_id', request.volunteer_id);

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
            result.recordset[0].volunteer_id
        )
        : null;
    }
}

module.exports = Request;