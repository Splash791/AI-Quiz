const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  answerChoices: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: "No explanation provided." }, 
  userAnswer: { type: String, default: null },
  isCorrect: { type: Boolean, default: null }
});

const QuizSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  type: { type: String, enum: ['Multiple Choice', 'True/False', 'Hybrid'], required: true },
  questionCount: { type: Number, required: true },
  questions: [QuestionSchema],
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);