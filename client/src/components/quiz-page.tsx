import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Quiz } from '../types';
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  useEffect(() => {
    if (id) {
      api.getQuiz(id)
        .then((data) => {
          setQuiz(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleAnswer = async (answer: string) => {
    if (!quiz || !id || feedback || isSubmitting) return; // Block if already answered

    setSelectedAnswer(answer);
    setIsSubmitting(true);
    
    try {
      const questionId = quiz.questions[currentQuestionIndex]._id;
      const result = await api.submitAnswer(id, questionId, answer);

      setFeedback({
        isCorrect: result.isCorrect,
        explanation: result.explanation
      });
      
      quiz.score = result.currentScore;

    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setSelectedAnswer(null);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-10 h-10" /></div>;
  if (!quiz) return <div className="text-center p-10">Quiz not found</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isFinished = currentQuestionIndex >= quiz.questions.length;

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-6xl font-black text-blue-600">
              {quiz.score?.toFixed(0)}%
            </div>
            <p className="text-gray-500">You have finished the quiz on {quiz.topic}.</p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Create New Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        
        {}
        <div className="flex justify-between items-center text-sm font-medium text-gray-500 uppercase tracking-wide">
          <span>{quiz.topic}</span>
          <span>Question {currentQuestionIndex + 1} / {quiz.questions.length}</span>
        </div>

        {}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.answerChoices.map((choice, index) => {
              let borderClass = "border-gray-200 hover:bg-gray-50 hover:border-blue-300";
              let bgClass = "bg-white";
              
              if (selectedAnswer === choice) {
                if (feedback) {
                  borderClass = feedback.isCorrect ? "border-green-500 ring-1 ring-green-500" : "border-red-500 ring-1 ring-red-500";
                  bgClass = feedback.isCorrect ? "bg-green-50" : "bg-red-50";
                } else {
                  borderClass = "border-blue-500 ring-1 ring-blue-500";
                  bgClass = "bg-blue-50";
                }
              }

              return (
                <div 
                  key={index}
                  onClick={() => handleAnswer(choice)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-between
                    ${borderClass} ${bgClass}
                    ${feedback ? 'cursor-default' : ''}
                  `}
                >
                  <span className="font-medium">{choice}</span>
                  {selectedAnswer === choice && feedback && (
                    feedback.isCorrect ? <CheckCircle2 className="text-green-600 w-5 h-5" /> : <XCircle className="text-red-600 w-5 h-5" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {feedback && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className={`p-4 rounded-lg border ${feedback.isCorrect ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'} mb-4`}>
              <p className="font-semibold mb-1">
                {feedback.isCorrect ? "Correct!" : "Incorrect"}
              </p>
              <p className="text-sm opacity-90">{feedback.explanation}</p>
            </div>
            
            <Button onClick={nextQuestion} className="w-full h-12 text-lg">
              {currentQuestionIndex + 1 === quiz.questions.length ? "Finish Quiz" : "Next Question"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}