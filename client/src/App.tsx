import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuizGenerator from './components/quiz-generator';
import QuizPage from './components/quiz-page';
import { ThemeProvider } from './lib/theme'; 

function App() {
  return (
    <ThemeProvider> 
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<QuizGenerator />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;