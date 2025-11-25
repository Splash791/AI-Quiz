// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
require('dotenv').config();

const Quiz = require('./models/quiz');
const { generateQuizQuestions } = require('./services/ai-service');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));


app.post('/api/quizzes/generate', upload.single('file'), async (req, res) => {
  try {
    const { topic, type, amount } = req.body;
    let textToProcess = topic || "";

    if (req.file) {
      const filePath = req.file.path;
      if (req.file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        textToProcess = data.text;
      } else if (req.file.mimetype.includes('wordprocessingml')) {
        const result = await mammoth.extractRawText({ path: filePath });
        textToProcess = result.value;
      }
      fs.unlinkSync(filePath); 
    }

    if (!textToProcess) return res.status(400).json({ error: "No text provided" });

    const aiData = await generateQuizQuestions(textToProcess, amount, type);

    const newQuiz = new Quiz({
      topic: req.file ? req.file.originalname : "Custom Topic",
      type,
      questionCount: amount,
      questions: aiData.questions
    });

    await newQuiz.save();
    res.json({ quizId: newQuiz._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    res.json(quiz);
  } catch (err) {
    res.status(404).json({ error: "Quiz not found" });
  }
});

app.patch('/api/quizzes/:id/question/:questionId', async (req, res) => {
  try {
    const { userAnswer } = req.body;
    const { id, questionId } = req.params;

    const quiz = await Quiz.findById(id);
    const question = quiz.questions.id(questionId);

    question.userAnswer = userAnswer;
    question.isCorrect = userAnswer === question.correctAnswer;

    const correctCount = quiz.questions.filter(q => q.isCorrect).length;
    quiz.score = (correctCount / quiz.questions.length) * 100;

    await quiz.save();
    
    res.json({ 
      isCorrect: question.isCorrect, 
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      currentScore: quiz.score 
    });
  } catch (err) {
    res.status(500).json({ error: "Error updating answer" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));