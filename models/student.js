const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    grade: Number,
});

module.exports = mongoose.model('Student', StudentSchema);