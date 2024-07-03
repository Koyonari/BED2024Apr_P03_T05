const mongoose = require('mongoose');

const dbConfig = {
    user: "BackEnd123", // Replace with your SQL Server login username
    password: "123", // Replace with your SQL Server login password
    server: "localhost",
    database: "backendtest",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 15000 // Connection timeout in milliseconds
    },
};

// const { MongoClient } = require('mongodb');

// async function connectDB() {
//     /**
//      * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
//      * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
//      */
//     const uri = process.env.DATABASE_URI;

//     const client = new MongoClient(uri);

//     try {
//         // Connect to the MongoDB cluster
//         await client.connect();
//         console.log('Connected to MongoDB');
//         return client; // Return the connected client
//     } catch (e) {
//         console.error('Failed to connect to MongoDB:', e);
//         throw e;
//     }
// }

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, {
            //useNewUrlParser: true, // Apparently this will be deprecated but it's still supported as of July 2024
            //useUnifiedTopology: true
        });
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

module.exports = { dbConfig, connectDB };
