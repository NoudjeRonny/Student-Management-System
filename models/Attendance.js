const AttendanceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    dateTime: { type: Date, default: Date.now },
    status: { type: String, enum: ['Present', 'Absent'], required: true },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);

