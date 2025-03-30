const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], // enrolled student
    documents: [{ type: String }], // linl to the course materials
    status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' }, //course status
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }] // linked quiz
});

// Check if the model already exists to avoid OverwriteModelError
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
module.exports = Course;
