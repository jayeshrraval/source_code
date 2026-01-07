import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// આપણે બનાવેલું પાવરફુલ સર્ચ એન્જિન ઈમ્પોર્ટ કરો
import { findBestShlokas } from '../utils/gitaMatcher'; 

interface Message {
  id: string;
  sender: 'user' | 'krishna';
  text?: string;
  
  // કૃષ્ણના જવાબ માટે સ્પેશિયલ ફિલ્ડ્સ
  shlokaData?: {
    sanskrit: string;
    meaning: string;
    explanation: string;
    action_plan: string;
    chapter: number;
    shloka: number;
  };
}

export default function KrishnaChatScreen() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'krishna',
      text: 'જય શ્રી કૃષ્ણ! હે મિત્ર, તારા મનમાં જે પણ દ્વિધા છે તે મને કહે. હું ગીતાના જ્ઞાન દ્વારા તને માર્ગદર્શન આપીશ.'
    }
  ]);
  
  const scrollViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // User Message
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    // કૃષ્ણ જવાબ આપે છે (થોડો સમય લેશે)
    setTimeout(() => {
      // ૧. અહીં આપણું પાવરફુલ ફંક્શન કોલ થશે
      const results = findBestShlokas(currentInput);

      if (results && results.length > 0) {
        // ૨. સૌથી બેસ્ટ રિઝલ્ટ (પહેલું) બતાવો
        const bestMatch = results[0];

        const botMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          sender: 'krishna',
          shlokaData: {
            sanskrit: bestMatch.sanskrit,
            meaning: bestMatch.gujarati_meaning,
            explanation: bestMatch.explanation,
            action_plan: bestMatch.action_plan,
            chapter: bestMatch.chapter,
            shloka: bestMatch.shloka
          }
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        // ૩. જો કઈ જ ના મળે તો (જે બહુ ઓછું બનશે)
        const botMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          sender: 'krishna',
          text: "હે મિત્ર, હું તારી વ્યથા પૂરી સમજી શક્યો નથી. શું તું મને ટૂંકમાં કહીશ? (ઉદાહરણ: 'મને ગુસ્સો આવે છે', 'ચિંતા થાય છે', 'નિષ્ફળતા મળી')."
        };
        setMessages(prev => [...prev, botMsg]);
      }
      
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-700 to-yellow-600 p-4 flex items-center shadow-lg z-10">
        <button onClick={() => navigate(-1)} className="text-white mr-4"><ArrowLeft /></button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-200"/> કૃષ્ણ સારથી
          </h1>
          <p className="text-orange-100 text-xs">શ્રીમદ ભગવદ ગીતા માર્ગદર્શન</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollViewRef} style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/cream-paper.png)' }}>
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* User Message Bubble */}
            {msg.sender === 'user' ? (
               <div className="bg-orange-100 text-orange-900 px-5 py-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%]">
                 <p>{msg.text}</p>
               </div>
            ) : (
               // Krishna Message Bubble (Rich Design)
               <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100">
                  
                  {msg.text ? (
                      <div className="p-4 text-gray-800">{msg.text}</div>
                  ) : (
                    <>
                      {/* 1. Header with Shloka Reference */}
                      <div className="bg-orange-50 p-3 border-b border-orange-100 flex items-center gap-2">
                          <BookOpen size={16} className="text-orange-600"/>
                          <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">
                              અધ્યાય {msg.shlokaData?.chapter} • શ્લોક {msg.shlokaData?.shloka}
                          </span>
                      </div>

                      {/* 2. Main Explanation (આત્મીય વાત) */}
                      <div className="p-5">
                          <p className="text-gray-800 text-lg leading-relaxed font-medium mb-4">
                              "{msg.shlokaData?.explanation}"
                          </p>

                          {/* Action Plan (ઉકેલ) */}
                          <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-4">
                              <h4 className="text-green-800 font-bold text-sm mb-2 flex items-center gap-2">
                                  <AlertCircle size={16}/> તારે શું કરવું જોઈએ?
                              </h4>
                              <p className="text-green-900 text-sm whitespace-pre-line leading-relaxed">
                                  {msg.shlokaData?.action_plan}
                              </p>
                          </div>

                          {/* Shloka & Meaning (Reference) */}
                          <div className="bg-orange-50/50 p-3 rounded-lg text-center">
                              <p className="text-orange-800 font-serif italic text-sm mb-2">|| {msg.shlokaData?.sanskrit} ||</p>
                              <p className="text-gray-500 text-xs border-t border-orange-200 pt-2">
                                  અર્થ: {msg.shlokaData?.meaning}
                              </p>
                          </div>
                      </div>
                    </>
                  )}
               </div>
            )}
          </motion.div>
        ))}
        
        {loading && (
            <div className="flex items-center gap-2 ml-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-150"></span>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-orange-100">
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-orange-300">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="તમારી સમસ્યા જણાવો..."
            className="flex-1 bg-transparent outline-none p-2 text-gray-700"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3 bg-orange-600 rounded-lg text-white shadow hover:bg-orange-700 disabled:bg-gray-300 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}