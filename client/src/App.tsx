import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuizGenerator from './components/quiz-generator';
import QuizPage from './components/quiz-page';

function App() {
  return (
    <Router>
      <div className="antialiased text-gray-900">
        <Routes>
          <Route path="/" element={<QuizGenerator />} />
          
          <Route path="/quiz/:id" element={<QuizPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;