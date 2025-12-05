export interface Question {
    _id: string;
    questionText: string;
    answerChoices: string[];
    correctAnswer?: string;
    explanation?: string;   
    userAnswer?: string | null;
    isCorrect?: boolean | null;
  }
  
  export interface Quiz {
    _id: string;
    topic: string;
    type: string; 
    questions: Question[];
    score: number;
  }