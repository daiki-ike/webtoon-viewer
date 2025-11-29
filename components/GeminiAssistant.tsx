import React, { useState } from 'react';
import { X, Send, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from './Button';
import { ChatMessage } from '../types';
import { analyzeWebtoonPage } from '../services/geminiService';

interface GeminiAssistantProps {
  currentImageBase64: string | null;
  onClose: () => void;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ currentImageBase64, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I can help you translate text, summarize the plot, or analyze the art style of this page. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || !currentImageBase64) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    // Extract base64 data (remove prefix if present)
    const base64Data = currentImageBase64.split(',')[1] || currentImageBase64;

    const responseText = await analyzeWebtoonPage(base64Data, "image/png", userMsg);

    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  const suggestions = [
    "Translate the text to English",
    "Summarize what is happening",
    "Describe the character's emotions"
  ];

  return (
    <div className="absolute inset-y-0 right-0 w-full sm:w-96 bg-gray-800 shadow-2xl border-l border-gray-700 flex flex-col z-50 transform transition-transform">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
        <div className="flex items-center gap-2 text-blue-400">
          <Sparkles className="w-5 h-5" />
          <h2 className="font-bold text-white">Gemini Assistant</h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-700 text-gray-100 rounded-bl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 p-3 rounded-2xl rounded-bl-none flex gap-2 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-700 space-y-3">
        {messages.length === 1 && (
           <div className="flex flex-wrap gap-2">
             {suggestions.map(s => (
               <button 
                key={s}
                onClick={() => setInput(s)}
                className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 px-3 py-1 rounded-full transition-colors"
               >
                 {s}
               </button>
             ))}
           </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about the comic..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="p-2 aspect-square">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};