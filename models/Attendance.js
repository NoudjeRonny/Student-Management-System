const AttendanceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    dateTime: { type: Date, default: new Date() },
    status: { type: String, enum: ['Present', 'Absent'], required: true },
});
const Attendance = mongoose.model('Attendance', AttendanceSchema);

module.exports = Attendance;

