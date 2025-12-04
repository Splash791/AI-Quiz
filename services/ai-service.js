const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "AI Quiz Generator",
  },
});

async function generateQuizQuestions(text, numQuestions, type) {
  console.log("Generating quiz with AI...");
  
  const prompt = `
    Generate a ${numQuestions}-question ${type} quiz based on the text below.
    Output purely valid JSON with no markdown formatting.
    
    Structure:
    {
      "questions": [
        {
          "questionText": "...",
          "answerChoices": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "The exact string of the correct option",
          "explanation": "A short sentence explaining why this answer is correct."
        }
      ]
    }
    
    Text to analyze:
    "${text.substring(0, 15000)}" 
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash", 
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate quiz");
  }
}

module.exports = { generateQuizQuestions };