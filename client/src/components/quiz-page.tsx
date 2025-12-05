import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Quiz } from '../types';
import { useTheme } from '../lib/theme';
import { CheckCircle2, XCircle, ArrowRight, Loader2, Home, Sparkles, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuizPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { theme, color } = useTheme();
    
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  
    const getGradient = () => {
      switch (color) {
        case 'green': return 'from-gray-950 via-gray-900 to-emerald-950';
        case 'orange': return 'from-gray-950 via-gray-900 to-orange-950';
        case 'purple': return 'from-gray-950 via-gray-900 to-purple-950';
        case 'red': return 'from-gray-950 via-gray-900 to-red-950';
        default: return 'from-gray-950 via-gray-900 to-blue-950';
      }
    };
  
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
      if (!quiz || !id || feedback || isSubmitting) return;
  
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
  
    if (loading) return (
      <div className={`min-h-screen flex justify-center items-center bg-gradient-to-br ${getGradient()} text-white`}>
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-12 h-12 text-primary" />
          <p className="font-medium animate-pulse">Loading your quiz...</p>
        </div>
      </div>
    );
  
    if (!quiz) return <div className="text-center p-10">Quiz not found</div>;
  
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isFinished = currentQuestionIndex >= quiz.questions.length;
  
    if (isFinished) {
      return (
        <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br ${getGradient()} text-white`}>
          <div className="glass-card w-full max-w-lg text-center p-10 animate-in zoom-in-95 duration-500">
            
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-primary/20 rounded-full text-primary shadow-[0_0_30px_rgba(var(--primary),0.4)]">
                <Trophy className="w-16 h-16" />
              </div>
            </div>
  
            <h2 className="text-4xl font-black mb-2">Quiz Complete!</h2>
            <p className="text-lg opacity-80 mb-8">You scored</p>
  
            <div className="text-7xl font-black text-primary mb-2 tracking-tighter drop-shadow-sm">
              {quiz.score?.toFixed(0)}%
            </div>
            
            <div className="h-2 w-full bg-black/10 rounded-full mb-8 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out" 
                style={{ width: `${quiz.score}%` }} 
              />
            </div>
  
            <p className="text-sm opacity-60 mb-8">Topic: {quiz.topic}</p>
  
            <Button 
              onClick={() => navigate('/')} 
              className="w-full h-14 text-lg font-bold shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Home className="mr-2 w-5 h-5" />
              Create New Quiz
            </Button>
          </div>
        </div>
      );
    }
  
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 bg-gradient-to-br ${getGradient()} text-white`}>
        
        <div className="w-full max-w-3xl space-y-6">
          
          <div className="glass-card px-6 py-4 flex justify-between items-center text-sm font-bold tracking-wider opacity-90">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/')} 
                className="hover:bg-red-500/20 hover:text-red-400 -ml-2 rounded-full w-8 h-8"
                title="Exit Quiz"
              >
                <X className="w-5 h-5" />
              </Button>
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> {quiz.topic}</span>
            </div>
            
            <span className="bg-primary/10 px-3 py-1 rounded-full text-primary border border-primary/20">
              {currentQuestionIndex + 1} / {quiz.questions.length}
            </span>
          </div>
  
          <div className="glass-card p-8 animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-8">
              {currentQuestion.questionText}
            </h2>
  
            <div className="space-y-3">
              {currentQuestion.answerChoices.map((choice, index) => {
                let borderClass = "border-white/10 hover:bg-white/10 hover:border-white/30";
                let bgClass = "bg-transparent";
                
                if (selectedAnswer === choice) {
                  if (feedback) {
                    borderClass = feedback.isCorrect 
                      ? "border-green-500 bg-green-500/20 text-green-700 dark:text-green-300" 
                      : "border-red-500 bg-red-500/20 text-red-700 dark:text-red-300";
                  } else {
                    borderClass = "border-primary bg-primary/10 ring-1 ring-primary";
                  }
                }
  
                return (
                  <button 
                    key={index}
                    onClick={() => handleAnswer(choice)}
                    disabled={!!feedback || isSubmitting}
                    className={`
                      w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group
                      ${borderClass} ${bgClass}
                      ${feedback ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <span className="text-lg font-medium">{choice}</span>
                    
                    {selectedAnswer === choice && feedback && (
                      <div className="scale-125 transition-transform">
                        {feedback.isCorrect 
                          ? <CheckCircle2 className="text-green-500 w-6 h-6" /> 
                          : <XCircle className="text-red-500 w-6 h-6" />
                        }
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
  
          {feedback && (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 border-l-4 border-l-primary">
              <div className="mb-4">
                <p className="font-bold text-lg mb-1 flex items-center gap-2">
                  {feedback.isCorrect ? "Correct!" : "Incorrect"}
                </p>
                <p className="text-base opacity-90 leading-relaxed">{feedback.explanation}</p>
              </div>
              
              <Button 
                onClick={nextQuestion} 
                className="w-full h-14 text-lg font-bold shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {currentQuestionIndex + 1 === quiz.questions.length ? "Finish Quiz" : "Next Question"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }