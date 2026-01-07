import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, ArrowLeft, Trash2, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabaseClient'; //

export default function AIAssistantScreen() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Netlify Environment Variable
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  interface Message {
    id: number | string;
    type: 'user' | 'ai';
    message: string;
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      message: 'નમસ્તે! હું જ્ઞાન સહાયક છું. તમે મને શિક્ષણ, કરિયર અથવા સમાજ વિશે કોઈપણ પ્રશ્ન પૂછી શકો છો.'
    }
  ]);

  // ૧. લોગીન યુઝર ચેક કરો અને હિસ્ટ્રી લોડ કરો
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchUserHistory(user.id);
      }
    };
    init();
  }, []);

  // ૨. Supabase માંથી આ યુઝરની પર્સનલ ચેટ હિસ્ટ્રી લાવો
  const fetchUserHistory = async (uid: string) => {
    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      const history = data.flatMap((item: any) => [
        { id: `u_${item.id}`, type: 'user', message: item.prompt },
        { id: `a_${item.id}`, type: 'ai', message: item.response }
      ]);
      setMessages(history);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🧠 Smart Function: DB Cache (Smart Search) -> API Call -> DB Save
  const getAIResponse = async (userText: string) => {
    if (!userText) return "";
    
    // પ્રશ્નને સામાન્ય ફોર્મેટમાં ફેરવો
    const cleanQuestion = userText.trim().toLowerCase();

    try {
      console.log("Checking Supabase Cache for:", cleanQuestion);

      // 1️⃣ સ્ટેપ: Smart Search Logic (તમારું ઓરિજિનલ)
      const searchTerms = cleanQuestion.replace(/[?!.]/g, '').split(' ').join(' | ');

      const { data: cachedData, error: dbError } = await supabase
        .from('ai_faq_cache')
        .select('answer')
        .textSearch('question', searchTerms, { type: 'websearch', config: 'english' })
        .maybeSingle();

      if (dbError) {
        console.warn("Supabase Check Error:", dbError.message);
      }

      if (cachedData && cachedData.answer) {
        console.log("✅ Cache Hit! Serving from DB.");
        return cachedData.answer;
      }

      console.log("❌ Cache Miss. Calling Gemini API...");

      // 2️⃣ સ્ટેપ: Smart Model Discovery (તમારું ઓરિજિનલ)
      if (!GEMINI_API_KEY) return "API Key સેટ કરેલી નથી.";

      const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
      const listData = await listResponse.json();
      
      const availableModels = listData.models || [];
      const bestModel = availableModels.find((m: any) => m.name.includes('gemini') && m.name.includes('flash') && m.supportedGenerationMethods?.includes('generateContent')) 
                     || availableModels.find((m: any) => m.name.includes('gemini') && m.supportedGenerationMethods?.includes('generateContent'))
                     || { name: 'models/gemini-pro' };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${bestModel.name}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `You are a helpful Gujarati assistant. Answer in Gujarati only. Question: ${userText}` }] }],
          }),
        }
      );

      if (response.status === 429) {
        return "ક્ષમા કરશો, અત્યારે ટ્રાફિક વધુ છે. કૃપા કરીને ૧ મિનિટ પછી પ્રયત્ન કરો.";
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content) {
        const aiAnswer = data.candidates[0].content.parts[0].text;

        // 3️⃣ સ્ટેપ: FAQ Cache માં સેવ કરો (તમારું ઓરિજિનલ)
        const { error: insertError } = await supabase
          .from('ai_faq_cache')
          .insert([{ question: cleanQuestion, answer: aiAnswer }]);

        if (insertError) console.error("Failed to cache answer:", insertError.message);
        else console.log("✅ New answer cached in DB!");
          
        // 4️⃣ સ્ટેપ: યુઝરની પર્સનલ હિસ્ટ્રીમાં સેવ કરો (નવું લોજિક)
        if (userId) {
          await supabase.from('ai_chat_history').insert([{ 
            user_id: userId, 
            prompt: userText, 
            response: aiAnswer 
          }]);
        }

        return aiAnswer;
      }
      
      return "માફ કરશો, અત્યારે સર્વર વ્યસ્ત છે.";

    } catch (error: any) {
      console.error("System Error:", error);
      return "ટેકનિકલ સમસ્યા આવી છે.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    
    const newUserMsg: Message = { id: Date.now(), type: 'user', message: userMessage };
    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    const aiText = await getAIResponse(userMessage);

    const newAiMsg: Message = { id: Date.now() + 1, type: 'ai', message: aiText };
    setMessages(prev => [...prev, newAiMsg]);
    setLoading(false);
  };

  // હિસ્ટ્રી ડિલીટ કરવાનું ફંક્શન
  const clearHistory = async () => {
    if (confirm('શું તમે આખી ચેટ હિસ્ટ્રી ડિલીટ કરવા માંગો છો?')) {
      const { error } = await supabase.from('ai_chat_history').delete().eq('user_id', userId);
      if (!error) {
        setMessages([{ id: Date.now(), type: 'ai', message: 'હિસ્ટ્રી ક્લીન થઈ ગઈ છે. નવો પ્રશ્ન પૂછો!' }]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24 font-gujarati">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 safe-area-top px-4 py-4 shadow-md z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/home')} className="p-1 bg-white/20 rounded-full">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">જ્ઞાન સહાયક</h1>
              <p className="text-violet-100 text-xs flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                Online • Smart Mode
              </p>
            </div>
          </div>
          {userId && (
            <button onClick={clearHistory} className="text-white/70 hover:text-white p-2">
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto bg-[#EBE5DE]">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1 shadow-sm ${
                  msg.type === 'user' ? 'bg-[#1a237e]' : 'bg-gradient-to-br from-violet-500 to-purple-600'
                }`}>
                  {msg.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`px-4 py-3 shadow-md text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.type === 'user' ? 'bg-[#dcf8c6] text-gray-800 rounded-2xl rounded-br-none' : 'bg-white text-gray-800 rounded-2xl rounded-bl-none'
                }`}>
                  {msg.message}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
            <div className="bg-white px-4 py-3 rounded-2xl shadow-md flex space-x-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 safe-area-bottom shadow-lg border-t border-gray-100">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="તમારો પ્રશ્ન પૂછો..."
            disabled={loading}
            className="flex-1 bg-transparent focus:outline-none text-gray-700"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-2 bg-violet-600 rounded-full text-white disabled:opacity-50 active:scale-90 transition-transform"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}