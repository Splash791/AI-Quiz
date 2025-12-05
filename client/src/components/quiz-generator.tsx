import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useTheme } from '../lib/theme';
import { Loader2, Upload, BookOpen, Settings2, FileText, Sun, Moon, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function QuizGenerator() {
  const navigate = useNavigate();
  const { theme, toggleTheme, setColor } = useTheme();
  
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [quizType, setQuizType] = useState('Multiple Choice');
  const [amount, setAmount] = useState(3);

  const handleGenerate = async () => {
    if (!topic && !file) {
      alert("Please enter a topic or upload a file!");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', quizType);
      formData.append('amount', amount.toString());
      
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
    <div className="min-h-screen bg-background p-8 flex flex-col items-center transition-colors duration-300">
      
      <div className="absolute top-4 right-4 flex gap-2">
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon"><Palette className="h-5 w-5" /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 grid grid-cols-5 gap-2">
            {['blue', 'green', 'orange', 'purple', 'red'].map((c) => (
              <button 
                key={c} 
                onClick={() => setColor(c as any)}
                className={`w-6 h-6 rounded-full border border-gray-300 shadow-sm
                  ${c === 'blue' ? 'bg-blue-500' : ''}
                  ${c === 'green' ? 'bg-green-500' : ''}
                  ${c === 'orange' ? 'bg-orange-500' : ''}
                  ${c === 'purple' ? 'bg-purple-500' : ''}
                  ${c === 'red' ? 'bg-red-500' : ''}
                `}
              />
            ))}
          </PopoverContent>
        </Popover>
      </div>

      <div className="text-center mb-10 space-y-2 pt-10">
        <h1 className="text-5xl font-extrabold tracking-tight flex items-center justify-center gap-3 text-foreground">
          <BookOpen className="w-12 h-12 text-primary" />
          AI Quiz Gen
        </h1>
        <p className="text-lg text-muted-foreground">Create custom quizzes from any text or document in seconds.</p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        <Card className="shadow-xl border-t-4 border-t-primary h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-foreground">
              <FileText className="w-6 h-6 text-primary" />
              Step 1: Source Material
            </CardTitle>
            <CardDescription>Choose what the quiz should be about.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="topic" className="text-base font-semibold">Enter a Topic</Label>
              <Input 
                id="topic"
                placeholder="e.g. The Solar System" 
                value={topic}
                onChange={(e) => { setTopic(e.target.value); setFile(null); }}
                disabled={!!file} 
                className="h-14 text-lg"
              />
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-background px-4 text-muted-foreground font-bold tracking-wider">OR Upload File</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="file" className="text-base font-semibold">Upload Document</Label>
              <div className="flex gap-3">
                <Input 
                  id="file" type="file" accept=".pdf,.docx,.txt"
                  onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setTopic(''); }}}
                  className="cursor-pointer file:text-primary file:font-semibold h-12 pt-2"
                />
                {file && <Button variant="ghost" size="icon" onClick={() => setFile(null)}>X</Button>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-t-4 border-t-primary h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-foreground">
              <Settings2 className="w-6 h-6 text-primary" />
              Step 2: Configuration
            </CardTitle>
            <CardDescription>Customize your quiz difficulty and format.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="amount" className="text-base font-semibold">Number of Questions</Label>
                <span className="text-xl font-bold text-primary bg-secondary px-3 py-1 rounded-md">{amount}</span>
              </div>
              <Input 
                id="amount" type="range" min={1} max={10} step={1}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className="cursor-pointer accent-primary h-2"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Quiz Type</Label>
              <RadioGroup defaultValue="Multiple Choice" onValueChange={setQuizType} className="grid grid-cols-1 gap-4">
                {['Multiple Choice', 'True/False', 'Hybrid'].map((type) => (
                  <div key={type} className={`flex items-center space-x-3 border-2 p-4 rounded-lg cursor-pointer transition-all ${quizType === type ? 'border-primary bg-secondary/50 shadow-sm' : 'border-border hover:bg-secondary/30'}`}>
                    <RadioGroupItem value={type} id={type} className="text-primary" />
                    <Label htmlFor={type} className="cursor-pointer w-full font-medium text-lg">{type === 'Hybrid' ? 'Hybrid (Mix)' : type}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-xl font-bold shadow-lg mt-4" 
              onClick={handleGenerate} disabled={isLoading}
            >
              {isLoading ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Generating...</> : <><Upload className="mr-3 h-6 w-6" /> Generate Quiz</>}
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}