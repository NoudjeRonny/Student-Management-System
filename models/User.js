const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Optional, but ensures unique email addresses
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'student'
    },
    createdAt: { type: Date, default: new Date() },
    token:String,
  image: {
     type: String, 
        }, // student profile picture
    
courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }] // Fix: Add this line
});

const User = mongoose.model('User', userSchema);

module.exports = User;
