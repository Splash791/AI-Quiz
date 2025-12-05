const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
require('dotenv').config();

// Make sure your file in 'models' is named Quiz.js (or update this import to match)
const Quiz = require('./models/Quiz'); 
// Make sure your file in 'services' is named ai-service.js
const { generateQuizQuestions } = require('./services/ai-service');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB Error:', err));

// --- ROUTES ---

// 1. GENERATE QUIZ (Debug Version)
app.post('/api/quizzes/generate', upload.single('file'), async (req, res) => {
  console.log("📍 STEP 1: Route hit!"); 
  console.log("📍 STEP 2: Body received:", req.body);
  console.log("📍 STEP 3: File received:", req.file ? "YES" : "NO");

  try {
    const { topic, type, amount } = req.body;
    let textToProcess = topic || "";

    // Handle File Uploads
    if (req.file) {
      console.log("📍 STEP 4: Processing file...");
      const filePath = req.file.path;
      
      if (req.file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        textToProcess = data.text;
      } else if (req.file.mimetype.includes('wordprocessingml')) {
        const result = await mammoth.extractRawText({ path: filePath });
        textToProcess = result.value;
      } else if (req.file.mimetype.includes('text/plain')) {
         textToProcess = fs.readFileSync(filePath, 'utf8');
      }
      
      // Cleanup temp file
      fs.unlinkSync(filePath);
    }

    if (!textToProcess) {
      console.log("❌ ERROR: No text found");
      return res.status(400).json({ error: "No text provided" });
    }

    console.log("📍 STEP 5: Sending to AI Service...");
    
    // Call AI Service
    const aiData = await generateQuizQuestions(textToProcess, amount, type);
    
    console.log("📍 STEP 6: AI Finished! Saving to DB...");

    // Save to DB
    const newQuiz = new Quiz({
      topic: req.file ? req.file.originalname : (topic || "Custom Topic"),
      type,
      questionCount: amount,
      questions: aiData.questions
    });

    await newQuiz.save();
    console.log("✅ SUCCESS: Quiz Saved with ID:", newQuiz._id);
    res.json({ quizId: newQuiz._id });

  } catch (error) {
    console.error("❌ SERVER ERROR:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// 2. GET QUIZ
app.get('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    res.json(quiz);
  } catch (err) {
    res.status(404).json({ error: "Quiz not found" });
  }
});

// 3. SUBMIT SINGLE ANSWER (Immediate Feedback)
app.patch('/api/quizzes/:id/question/:questionId', async (req, res) => {
  try {
    const { userAnswer } = req.body;
    const { id, questionId } = req.params;

    const quiz = await Quiz.findById(id);
    const question = quiz.questions.id(questionId);

    // Update Answer & Check Correctness
    question.userAnswer = userAnswer;
    question.isCorrect = userAnswer === question.correctAnswer;

    // Recalculate Score
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