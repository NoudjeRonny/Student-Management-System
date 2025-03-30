const mongoose = require('mongoose');
const mongoUrl = process.env.MONGO_URL;

async function connectToMongo() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Successfully connected to MongoDB:');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
  
}

connectToMongo();
