const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-extraction'); 
const mammoth = require('mammoth');
const fs = require('fs');
require('dotenv').config();
const Quiz = require('./models/Quiz'); 
const { generateQuizQuestions } = require('./services/ai-service');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(' DB Error:', err));


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
      } else if (req.file.mimetype.includes('text/plain')) {
         textToProcess = fs.readFileSync(filePath, 'utf8');
      }
      
      fs.unlinkSync(filePath);
    }

    if (!textToProcess) {
      console.log("error: No text found");
      return res.status(400).json({ error: "No text provided" });
    }
    const aiData = await generateQuizQuestions(textToProcess, amount, type);
    const newQuiz = new Quiz({
      topic: req.file ? req.file.originalname : (topic || "Custom Topic"),
      type,
      questionCount: amount,
      questions: aiData.questions
    });

    await newQuiz.save();
    console.log("SUCCESS: Quiz Saved with ID:", newQuiz._id);
    res.json({ quizId: newQuiz._id });

  } catch (error) {
    console.error("SERVER ERROR:", error);
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

    //update / check answer 
    question.userAnswer = userAnswer;
    question.isCorrect = userAnswer === question.correctAnswer;

  // recalculate score 
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

app.get('/api/quizzes', async (req, res) => {
  try {
    // return id, topic, score, and date. Sort by newest first.
    const quizzes = await Quiz.find({}, 'topic score createdAt questionCount')
      .sort({ createdAt: -1 })
      .limit(20); //limit to last 20 to keep it fast
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

app.delete('/api/quizzes/:id', async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete quiz" });
  }
});

app.delete('/api/quizzes', async (req, res) => {
  try {
    await Quiz.deleteMany({});
    res.json({ message: "All quizzes deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear history" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));