import mongoose from "mongoose";

 // Replace with your actual MongoDB connection string

const connectdb = async (mongoURL) => {
    try {
        const connect = await mongoose.connect(mongoURL, {
         
            
        });
        console.log("Successfully connected to the database");
    } catch (err) {
        console.error("Error occurred while connecting to the database:", err);
    }
};

export default connectdb; // Use ES module export