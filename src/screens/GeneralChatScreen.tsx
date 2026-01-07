import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Users, Loader2, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

// General Room ID (જે આપણે SQL માં ફિક્સ બનાવ્યો)
const GENERAL_ROOM_ID = '00000000-0000-0000-0000-000000000000';

export default function GeneralChatScreen() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchUserAndMessages();

    // 🔴 Realtime Listener (કોઈ મેસેજ કરે તો તરત દેખાય)
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${GENERAL_ROOM_ID}` },
        (payload) => {
          // નવો મેસેજ લિસ્ટમાં ઉમેરો
          setMessages((prev) => [...prev, payload.new]);
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUserAndMessages = async () => {
    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);

    // 2. Get Old Messages
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', GENERAL_ROOM_ID)
      .order('created_at', { ascending: true }); // જૂના ઉપર, નવા નીચે

    if (data) setMessages(data);
    setLoading(false);
    setTimeout(scrollToBottom, 500);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    const messageToSend = newMessage;
    setNewMessage(''); // Clear input immediately

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          room_id: GENERAL_ROOM_ID,
          sender_id: userId,
          content: messageToSend
        }
      ]);

    if (error) {
      console.error('Error sending message:', error);
      alert('મેસેજ મોકલવામાં ભૂલ થઈ');
    }
  };

  return (
    <div className="min-h-screen bg-[#E5DDD5] flex flex-col">
      {/* Header */}
      <div className="bg-deep-blue p-4 safe-area-top sticky top-0 z-10 shadow-md">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold font-gujarati text-lg">યોગી સમાજ ગ્રુપ</h1>
            <p className="text-white/70 text-xs font-gujarati">જનરલ ચેટ</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center pt-10">
            <Loader2 className="w-8 h-8 text-deep-blue animate-spin" />
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === userId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-xl shadow-sm relative ${
                    isMe 
                      ? 'bg-[#DCF8C6] rounded-tr-none' 
                      : 'bg-white rounded-tl-none'
                  }`}
                >
                  {/* Sender ID (We can replace this with Name later via Join) */}
                  {!isMe && <p className="text-[10px] text-orange-600 font-bold mb-0.5">Yogi Member</p>}
                  
                  <p className="text-gray-800 text-sm font-gujarati leading-relaxed">
                    {msg.content}
                  </p>
                  <p className="text-[10px] text-gray-500 text-right mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white safe-area-bottom flex items-center space-x-2 shadow-lg">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="મેસેજ લખો..."
          className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 focus:ring-2 focus:ring-deep-blue/20 outline-none font-gujarati"
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="w-12 h-12 bg-deep-blue rounded-full flex items-center justify-center text-white disabled:opacity-50 active:scale-90 transition-transform shadow-md"
        >
          <Send className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
}