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
const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI)
    } catch (err) {
        console.error(err);
    }
}

module.exports = connectDB;
