import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Loader2, Upload, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function QuizGenerator() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [quizType, setQuizType] = useState('Multiple Choice');

  const handleGenerate = async () => {
    if (!topic && !file) {
      alert("Please enter a topic or upload a file!");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', quizType);
      formData.append('amount', '3'); 
      
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('topic', topic);
      }

      const data = await api.generateQuiz(formData);
      
      navigate(`/quiz/${data.quizId}`);
      
    } catch (error) {
      console.error(error);
      alert('Failed to generate quiz. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            AI Quiz Generator
          </CardTitle>
          <CardDescription>
            Upload a document or enter a topic to generate a quiz instantly.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input 
              id="topic"
              placeholder="e.g. The History of Pizza" 
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setFile(null); 
              }}
              disabled={!!file} 
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or upload file</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload Document (PDF/Docx)</Label>
            <div className="flex gap-2">
              <Input 
                id="file"
                type="file" 
                accept=".pdf,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                    setTopic(''); 
                  }
                }}
                className="cursor-pointer"
              />
              {file && (
                <Button variant="ghost" size="icon" onClick={() => setFile(null)} title="Clear file">
                  X
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Quiz Type</Label>
            <RadioGroup defaultValue="Multiple Choice" onValueChange={setQuizType} className="grid grid-cols-1 gap-2">
              
              <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="Multiple Choice" id="mc" />
                <Label htmlFor="mc" className="cursor-pointer w-full">Multiple Choice</Label>
              </div>
              
              <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="True/False" id="tf" />
                <Label htmlFor="tf" className="cursor-pointer w-full">True / False</Label>
              </div>

              <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="Hybrid" id="hybrid" />
                <Label htmlFor="hybrid" className="cursor-pointer w-full">Hybrid (Mix)</Label>
              </div>

            </RadioGroup>
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg" 
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Generate Quiz
              </>
            )}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}