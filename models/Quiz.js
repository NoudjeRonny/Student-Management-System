const QuizSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // course linked to a quiz 
    questions: [{
        questionText: String, // list of question 
        options: [String], 
        correctAnswer: String
    }],
    duration: { type: Number, required: true }, // time for the quiz
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Quiz = mongoose.model('Quiz', QuizSchema);
module.exports = Quiz;
