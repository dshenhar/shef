import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithShefi } from '../services/geminiService';
import { MessageCircle, X, Send, ChefHat } from 'lucide-react';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'model', text: 'אהלן! אני שפי 👨‍🍳. איך אני יכול לעזור לך במטבח היום?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
    try {
      const responseText = await chatWithShefi(history, userMsg.text);
      const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText || '', timestamp: Date.now() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 left-6 bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-full shadow-xl transition-all duration-300 z-50 flex items-center justify-center gap-2 group hover:scale-105">
          <ChefHat className="w-6 h-6 animate-bounce" />
          <span className="font-bold text-base">תתייעץ איתי</span>
        </button>
      )}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-teal-100 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-teal-100 p-4 flex justify-between items-center border-b border-teal-200">
            <div className="flex items-center">
              <div className="bg-white p-1.5 rounded-full mr-2"><ChefHat className="w-5 h-5 text-teal-600" /></div>
              <h3 className="font-bold text-teal-800">שפי - העוזר האישי</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-teal-700 hover:bg-teal-200 p-1 rounded-full transition"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-teal-500 text-white rounded-br-none shadow-md' : 'bg-white text-slate-800 rounded-bl-none shadow-sm border border-slate-100'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && <div className="flex justify-end"><div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">...</div></div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-teal-300 transition-all">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="שאל את שפי משהו..." className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 ml-2" />
              <button onClick={handleSend} disabled={isLoading || !input.trim()} className="text-teal-500 hover:text-teal-700 disabled:opacity-50 transition"><Send className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};