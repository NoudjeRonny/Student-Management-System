const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['super-admin', 'admin'], default: 'admin', required: true },
  profilePicture: { type: String }, // Admin profile picture
  createdAt: { type: Date, default: Date.now },
  resetToken: String,
  resetPasswordExpires: Date
});

module.exports = mongoose.model('Admin', adminSchema);
