
const ReportSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },// Linked student
    message: { type: String, required: true }, // Performance review
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },// Who wrote the report
    sentToGuardian: { type: Boolean, default: false } //If report was emailed to parent 
});

const Report = mongoose.model('Report', ReportSchema);
module.exports = Report;
