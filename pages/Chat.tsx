
import React, { useState, useEffect, useRef } from 'react';
import { chatWithBackend } from '../services/api';
import { Message } from '../types';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Namaste. I'm Pandora, your personal AI therapy companion. How are you feeling right now?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSource, setLastSource] = useState<'dataset' | 'ai' | 'error' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const result = await chatWithBackend(messages, userText);
    
    if (result && result.text) {
      setMessages(prev => [...prev, { role: 'model', text: result.text }]);
      setLastSource(result.source);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)] shadow-2xl rounded-3xl overflow-hidden border border-slate-200 bg-white">
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
            <i className="fas fa-robot text-lg"></i>
          </div>
          <div>
            <h2 className="font-bold">Pandora AI</h2>
            <p className="text-[10px] opacity-80 uppercase tracking-widest">Full-Stack ML Assistant</p>
          </div>
        </div>
        <div className="flex space-x-2">
           {lastSource && (
             <span className={`text-[10px] px-2 py-1 rounded-full border border-white/30 ${lastSource === 'dataset' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
               Source: {lastSource === 'dataset' ? 'Local ML' : 'Gemini AI'}
             </span>
           )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm flex space-x-1">
               <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
        />
        <button 
          disabled={isLoading}
          className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default Chat;
