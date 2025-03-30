import express from "express";
import dotenv from "dotenv";
import connectdb from "./config/connectingdb.js"; // Ensure the path is correct

// Load the .env file
dotenv.config();

const app = express();

// Port declaration
const port = process.env.PORT || 5000;
const mongoURL = process.env.MONGO_URL;

// Connecting to the MongoDB database
connectdb(mongoURL).then(() => {
    // Middleware to parse JSON requests
    app.use(express.json());

    // Starting the server
    app.listen(port, () => {
        console.log(`The server is running on port ${port}`);
    });
}).catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1); // Exit the process if the connection fails
});