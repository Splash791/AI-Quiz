import axios from 'axios';
import { Quiz } from '../types';

// Point to backend port
const API_URL = 'http://localhost:5001/api/quizzes';

export const api = {
//generate quiz
    generateQuiz: async (formData: FormData): Promise<{ quizId: string }> => {
        const response = await axios.post(`${API_URL}/generate`, formData);
        return response.data;
    },

  //get quiz data
    getQuiz: async (id: string): Promise<Quiz> => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
  },

  // submit answer for a question
    submitAnswer: async (quizId: string, questionId: string, userAnswer: string) => {
        const response = await axios.patch(`${API_URL}/${quizId}/question/${questionId}`, {
        userAnswer,
    });
    return response.data; //return score, correct answer and explanation
    },
    getAllQuizzes: async (): Promise<Quiz[]> => {
        const response = await axios.get(`${API_URL}`);
        return response.data;
    },

    deleteQuiz: async (id: string) => {
        await axios.delete(`${API_URL}/${id}`);
      },
    
      clearHistory: async () => {
        await axios.delete(API_URL);
      }
};