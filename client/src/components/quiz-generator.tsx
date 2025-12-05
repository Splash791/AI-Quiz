import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useTheme } from '../lib/theme';
import { Loader2, Upload, BookOpen, Settings2, FileText, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function QuizGenerator() {
  const navigate = useNavigate();
  const { setColor, color } = useTheme();
  
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [quizType, setQuizType] = useState('Multiple Choice');
  const [amount, setAmount] = useState(3);

  const getGradient = () => {
    switch (color) {
      case 'green': return 'from-gray-950 via-gray-900 to-emerald-950';
      case 'orange': return 'from-gray-950 via-gray-900 to-orange-950';
      case 'purple': return 'from-gray-950 via-gray-900 to-purple-950';
      case 'red': return 'from-gray-950 via-gray-900 to-red-950';
      default: return 'from-gray-950 via-gray-900 to-blue-950';
    }
  };

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
      if (file) formData.append('file', file);
      else formData.append('topic', topic);

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
    <div className={`min-h-screen p-8 flex flex-col items-center justify-center transition-all duration-700 bg-gradient-to-br ${getGradient()} text-white`}>
      
      <div className="absolute top-6 right-6 flex gap-3 z-50">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 shadow-lg text-white">
              <Palette className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 grid grid-cols-5 gap-2 bg-black/80 backdrop-blur-xl border-white/10 p-3">
            {['blue', 'green', 'orange', 'purple', 'red'].map((c) => (
              <button 
                key={c} 
                onClick={() => setColor(c as any)}
                className={`
                  w-8 h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-transform
                  ${color === c ? 'border-white scale-110' : 'border-transparent'}
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

      <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top-10 duration-700">
        <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-xl rounded-3xl mb-4 border border-white/20 shadow-2xl ring-1 ring-white/20">
          <BookOpen className="w-12 h-12 text-primary drop-shadow-md" />
        </div>
        <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-white drop-shadow-sm pb-2">
          AI Quiz Gen
        </h1>
        <p className="text-xl opacity-70 font-medium whitespace-nowrap mx-auto">
        Transform any topic or document into an interactive quiz in seconds using AI.
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        <div className="glass-card p-8 flex flex-col gap-6 animate-in slide-in-from-left-8 duration-700 delay-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/20 rounded-xl text-primary"><FileText className="w-6 h-6" /></div>
            <h2 className="text-2xl font-bold">Source Material</h2>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label className="text-base font-semibold ml-1">Topic</Label>
              <Input 
                id="topic"
                placeholder="e.g. Quantum Physics" 
                value={topic}
                onChange={(e) => { setTopic(e.target.value); setFile(null); }}
                disabled={!!file} 
                className="h-14 text-lg bg-white/5 border-white/10 focus:bg-white/10 transition-all backdrop-blur-sm text-white placeholder:text-white/30"
              />
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center text-xs font-bold tracking-widest opacity-50 uppercase"><span>OR</span></div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold ml-1">Upload File</Label>
              <div className="flex gap-3">
                <Input 
                  id="file" type="file" accept=".pdf,.docx,.txt"
                  onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setTopic(''); }}}
                  className="cursor-pointer h-14 pt-3 bg-white/5 border-white/10 hover:bg-white/10 transition-colors file:text-primary file:font-bold file:bg-transparent file:border-0 text-white"
                />
                {file && <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-14 w-14 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20">X</Button>}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col gap-6 animate-in slide-in-from-right-8 duration-700 delay-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/20 rounded-xl text-primary"><Settings2 className="w-6 h-6" /></div>
            <h2 className="text-2xl font-bold">Configuration</h2>
          </div>

          <div className="space-y-6 flex-1">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Questions</Label>
                <span className="text-2xl font-black text-primary">{amount}</span>
              </div>
              <Input 
                id="amount" type="range" min={1} max={20} step={1} value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className="cursor-pointer accent-primary h-3 bg-white/10 rounded-full appearance-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Mode</Label>
              <RadioGroup defaultValue="Multiple Choice" onValueChange={setQuizType} className="grid grid-cols-1 gap-3">
                {['Multiple Choice', 'True/False', 'Hybrid'].map((type) => (
                  <div key={type} className={`relative flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all duration-200 ${quizType === type ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.3)]' : 'border-white/10 hover:bg-white/5'}`}>
                    <RadioGroupItem value={type} id={type} className="text-primary border-white/50" />
                    <Label htmlFor={type} className="cursor-pointer w-full font-medium text-lg z-10">{type === 'Hybrid' ? 'Hybrid (Mix)' : type}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <Button 
            className="w-full h-16 text-xl font-bold rounded-xl shadow-2xl bg-gradient-to-r from-primary to-purple-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-4 border-t border-white/20"
            onClick={handleGenerate} disabled={isLoading}
          >
            {isLoading ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Crafting Quiz...</> : <><Sparkles className="mr-3 h-6 w-6 fill-current" /> Generate Quiz</>}
          </Button>
        </div>

      </div>
    </div>
  );
}