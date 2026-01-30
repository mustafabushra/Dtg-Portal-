
import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Send, User, Bot, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';

interface AIAssistantProps {
  contextData: any;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ contextData }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'أهلاً بك! أنا مساعد كافي برو الذكي. كيف يمكنني مساعدتك في إدارة عملياتك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatWithAI(userMsg, contextData);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'عذراً، واجهت مشكلة في معالجة طلبك.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-700">
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20">
            <BrainCircuit className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h3 className="text-lg font-black">المساعد الإداري الذكي</h3>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Powered by Gemini AI</p>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[80%] p-4 rounded-2xl flex gap-3 ${
              msg.role === 'user' 
                ? 'bg-white border border-slate-200 text-slate-900 rounded-tr-none' 
                : 'bg-slate-900 text-white rounded-tl-none shadow-xl'
            }`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-100 text-slate-500' : 'bg-amber-500 text-slate-900'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-slate-900 text-white p-4 rounded-2xl rounded-tl-none flex items-center gap-3 shadow-xl">
               <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
               <p className="text-sm font-bold italic">جاري التفكير...</p>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-6 bg-white border-t border-slate-100 shrink-0">
        <div className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسأل عن أي شيء (مثلاً: حلل لي وضع المخزون)"
            className="w-full pr-6 pl-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-amber-500/10 font-bold"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-slate-900 text-white rounded-xl hover:bg-amber-500 hover:text-slate-900 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
