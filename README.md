🧠 AI Quiz Generator

A full-stack web application that uses Artificial Intelligence to generate interactive quizzes from any topic or uploaded document. Built with the MERN stack (MongoDB, Express, React, Node.js) and powered by OpenRouter (Gemini).

✨ Features

- AI-Powered Generation: Create quizzes instantly by entering a topic or uploading a PDF/DOCX file.

- Flexible Modes: Support for Multiple Choice, True/False, or Hybrid (Mixed) question types.

- Customizable: Choose the number of questions (1-20).

- Interactive Quiz Interface:

- Immediate feedback (Green/Red) on answers.

- AI-generated explanations for every question.

- Live score tracking.

- Quiz History: A sidebar drawer to view, retake, or delete past quizzes.

- Modern UI: Beautiful Glassmorphism design with animated gradients.

- Theming: Dark mode by default with a custom color picker (Blue, Green, Orange, Purple, Red).

🛠️ Tech Stack

- Frontend (Client)

  - Framework: React (Vite)

  - Language: TypeScript

  - Styling: Tailwind CSS

  - UI Library: ShadCN UI (Radix Primitives)

  - Icons: Lucide React

  - State/Routing: React Router DOM, Axios

Backend (Server)

Runtime: Node.js & Express

Database: MongoDB (Mongoose)

AI Integration: OpenAI SDK (pointing to OpenRouter API)

File Processing: Multer, PDF-Extraction, Mammoth (for .docx)
