import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { User, Loader2, MessageCircle, ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function MessagesScreen() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchConnectedUsers();
  }, []);

  const fetchConnectedUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // ૧. એવા લોકો શોધો જેની સાથે રિક્વેસ્ટ 'accepted' છે (બંને બાજુ)
      const { data: requests, error } = await supabase
        .from('requests')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      // ૨. સામે વાળાની પ્રોફાઈલ વિગત મેળવો
      const chatList = await Promise.all(requests.map(async (req) => {
        // જો હું sender છું, તો receiver ની પ્રોફાઈલ લાવો, નહીંતર sender ની
        const otherUserId = req.sender_id === user.id ? req.receiver_id : req.sender_id;
        
        const { data: profile } = await supabase
          .from('matrimony_profiles')
          .select('full_name, image_url, user_id')
          .eq('user_id', otherUserId)
          .single();

        return {
          requestId: req.id,
          otherUser: profile || { full_name: 'Unknown User', image_url: null, user_id: otherUserId }
        };
      }));

      setChats(chatList);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = async (otherUserId) => {
    try {
      // ૧. પહેલા ચેક કરો કે આ બે લોકો વચ્ચે કોઈ 'chat_room' છે?
      // (આપણે ડેટાબેઝમાં એરે ચેક કરીએ છીએ)
      // નોટ: સરળતા માટે આપણે રૂમ ID બનાવી શકીએ છીએ
      
      let { data: room } = await supabase
        .from('chat_rooms')
        .select('id')
        .contains('participant_ids', [currentUserId, otherUserId])
        .maybeSingle();

      // ૨. જો રૂમ ના હોય, તો નવો બનાવો
      if (!room) {
        const { data: newRoom, error } = await supabase
          .from('chat_rooms')
          .insert([{ participant_ids: [currentUserId, otherUserId] }])
          .select()
          .single();
        
        if (error) throw error;
        room = newRoom;
      }

      // ૩. હવે ચેટ સ્ક્રીન પર જાઓ (જૂની અને નવી બંને લિંક સપોર્ટ કરશે)
      navigate(`/chat/${room.id}`);

    } catch (error) {
      console.error('Chat Room Error:', error);
      alert('ચેટ શરૂ કરવામાં ભૂલ આવી.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-gujarati">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full active:scale-90 transition-all">
            <ArrowLeft className="text-gray-600 w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">મેટ્રીમોની ચેટ</h1>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-pink-600" /></div>
        ) : chats.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 font-bold bg-white p-6 rounded-2xl border border-dashed">
            <p>હજુ સુધી કોઈ સાથે રિક્વેસ્ટ એક્સેપ્ટ થઈ નથી.</p>
            <p className="text-xs mt-2 text-pink-500">મેટ્રિમોનીમાં જઈને રિક્વેસ્ટ મોકલો!</p>
          </div>
        ) : (
          chats.map((chat, index) => (
            <div 
              key={index}
              onClick={() => handleOpenChat(chat.otherUser.user_id)}
              className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-95 transition-all cursor-pointer hover:bg-gray-50"
            >
              <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                {chat.otherUser.image_url ? (
                  <img src={chat.otherUser.image_url} className="w-full h-full object-cover" alt="user" />
                ) : (
                  <User className="text-pink-300" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{chat.otherUser.full_name}</h3>
                <p className="text-xs text-green-600 font-bold flex items-center gap-1 mt-1">
                  <MessageCircle size={12} /> વાતચીત કરવા ક્લિક કરો
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}