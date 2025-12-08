import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Quiz } from '../types';
import { History, ArrowRight, Calendar, HelpCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetTrigger} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export function QuizHistory() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchQuizzes = async () => {
    try {
      const data = await api.getAllQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    
    try {
      await api.deleteQuiz(id);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
    } catch (error) {
      console.error("Failed to delete quiz", error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete ALL history? This cannot be undone.")) return;
    
    try {
      await api.clearHistory();
      setQuizzes([]);
    } catch (error) {
      console.error("Failed to clear history", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) fetchQuizzes();
    }}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 shadow-lg text-white">
          <History className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl w-full sm:max-w-md">
        <SheetHeader className="mb-6 flex flex-row items-center justify-between">
          <SheetTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-blue-500" />
            Quiz History
          </SheetTitle>
          
          {quizzes.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleClearAll}
              className="h-8 text-xs bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50"
            >
              Clear All
            </Button>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] pr-4">
          <div className="space-y-4">
            {quizzes.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No quizzes taken yet.</div>
            ) : (
              quizzes.map((quiz) => (
                <div 
                  key={quiz._id} 
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-blue-500/50 cursor-pointer pr-12"
                  onClick={() => {
                    setIsOpen(false);
                    navigate(`/quiz/${quiz._id}`);
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1 pr-2 text-gray-100">
                      {quiz.topic}
                    </h3>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${quiz.score >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {quiz.score !== undefined && quiz.score !== null ? `${quiz.score.toFixed(0)}%` : 'In Progress'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      {quiz.questionCount || quiz.questions?.length || '?'} Question(s)
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Unknown Date'}
                    </span>
                  </div>

                  <ArrowRight className="absolute right-4 bottom-4 w-5 h-5 text-blue-500 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10 z-10 transition-colors"
                    onClick={(e) => handleDelete(e, quiz._id)}
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}