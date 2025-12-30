import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MoreVertical, Phone, Loader2, CheckCheck, Video, 
  Smile, Paperclip, Mic, Camera, Send 
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import EmojiPicker from 'emoji-picker-react';

export default function PrivateChatScreen() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherUser, setOtherUser] = useState({ id: '', name: '', image: '' });
  const [isOnline, setIsOnline] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // ✅ નવી ફ્લેગ: ડેટા લોડ થઈ જાય પછી જ Realtime ચાલુ થશે
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1️⃣ Step 1: પહેલા યુઝર અને જૂના મેસેજ લોડ કરો
  useEffect(() => {
    if (roomId) fetchChatDetails();
  }, [roomId]);

  const fetchChatDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // રૂમ અને સામેવાળાની વિગત
      const { data: roomData } = await supabase.from('chat_rooms').select('participant_ids').eq('id', roomId).single();

      if (roomData) {
        const otherId = roomData.participant_ids.find((id) => id !== user.id);
        if (otherId) {
          const { data: profile } = await supabase.from('matrimony_profiles').select('user_id, full_name, image_url').eq('user_id', otherId).single();
          if (profile) {
            setOtherUser({ 
              id: profile.user_id, 
              name: profile.full_name, 
              image: profile.image_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=random` 
            });
          }
        }
      }

      // મેસેજ લોડ કરો
      const { data: msgs } = await supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
      if (msgs) {
        setMessages(msgs); // જૂના મેસેજ સેટ કરો
        setTimeout(scrollToBottom, 300);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setInitialFetchDone(true); // ✅ હવે Realtime માટે લીલી ઝંડી
    }
  };

  // 2️⃣ Step 2: Realtime Connection (ફક્ત ડેટા લોડ થયા પછી જ)
  useEffect(() => {
    // જો ડેટા લોડ ન થયો હોય, તો કનેક્ટ ન કરો (Race Condition Fix)
    if (!roomId || !currentUserId || !initialFetchDone) return;

    console.log("🔌 Connecting to Realtime for Room:", roomId);

    const messageChannel = supabase
      .channel(`room_chat_${roomId}`)
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `room_id=eq.${roomId}` 
        }, 
        (payload) => {
          console.log("🔥 નવો મેસેજ આવ્યો:", payload);
          setMessages((prev) => {
            // ડુપ્લિકેટ અટકાવો
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe((status) => {
        console.log("📡 Message Status:", status);
      });

    // ઓનલાઇન સ્ટેટસ
    const presenceChannel = supabase.channel(`presence_${roomId}`, {
      config: { presence: { key: currentUserId } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        if (otherUser?.id) {
          const isOnlineNow = Object.values(state).flat().some((u: any) => u.user_id === otherUser.id);
          setIsOnline(isOnlineNow);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_id: currentUserId, online_at: new Date().toISOString() });
        }
      });

    return () => {
      console.log("🧹 Cleaning up channels...");
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(presenceChannel);
    };

  }, [roomId, currentUserId, initialFetchDone]); // ✅ અહીં dependency બરાબર છે

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !roomId || !otherUser.id) return;
    const tempMessage = newMessage;
    setNewMessage('');
    setShowEmojiPicker(false);

    const { error } = await supabase.from('messages').insert([{
      room_id: roomId, 
      sender_id: currentUserId, 
      receiver_id: otherUser.id, 
      content: tempMessage
    }]);

    if (error) {
      console.error("Message Send Error:", error);
      alert('મેસેજ મોકલી શકાયો નથી.');
      setNewMessage(tempMessage);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="h-screen flex flex-col font-gujarati bg-[#efe7de]">
      {/* Header */}
      <div className="bg-[#075e54] p-2 flex items-center justify-between safe-area-top shadow-md z-20">
        <div className="flex items-center space-x-2">
          <button onClick={() => navigate(-1)} className="p-1 text-white active:scale-90">
            <ArrowLeft size={24} />
          </button>
          
          <div className="relative">
            <img 
              src={otherUser?.image || 'https://ui-avatars.com/api/?name=User&background=random'} 
              className="w-10 h-10 rounded-full object-cover border border-white/20"
              alt="User"
            />
            {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#075e54] rounded-full"></div>}
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-base truncate max-w-[150px]">
              {otherUser?.name || 'Loading...'}
            </h1>
            <span className="text-white/80 text-[11px]">
              {isOnline ? 'ઓનલાઇન' : 'ઓફલાઇન'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-5 text-white p-2">
          <Video size={22} className="cursor-pointer" />
          <Phone size={20} className="cursor-pointer" />
          <MoreVertical size={20} className="cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 relative" 
           style={{ backgroundImage: "url('https://i.pinimg.com/originals/ab/ab/60/abab60f06ab52fa727e78f20501f57df.png')", backgroundSize: 'contain' }}>
        {loading ? (
          <div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 text-[#075e54] animate-spin" /></div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                <div className={`relative px-3 py-1.5 rounded-lg shadow-sm max-w-[85%] text-[15px] ${
                  isMe ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'
                }`}>
                  <p className="pr-12 pb-1">{msg.content}</p>
                  <div className="flex items-center justify-end space-x-1 -mt-1">
                    <span className="text-[10px] text-gray-500 uppercase">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                    {isMe && <CheckCheck size={14} className="text-blue-500" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative">
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-0 right-0 z-30">
            <EmojiPicker 
                onEmojiClick={onEmojiClick} 
                width="100%" 
                height={300}
                previewConfig={{ showPreview: false }}
            />
          </div>
        )}

        <div className="p-2 bg-[#efe7de] flex items-end space-x-2 safe-area-bottom z-40">
            <div className="flex-1 bg-white rounded-2xl flex items-center px-2 py-1 shadow-sm border border-gray-200 min-h-[45px]">
                <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                    className="p-1.5 text-gray-500 hover:text-gray-600 active:scale-90 transition-transform"
                >
                    <Smile size={24} />
                </button>

                <input
                    type="text"
                    value={newMessage}
                    onClick={() => setShowEmojiPicker(false)} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="મેસેજ લખો..."
                    className="flex-1 py-2 px-2 outline-none text-[16px] bg-transparent"
                />

                <div className="flex items-center space-x-3 pr-2 text-gray-500">
                    <Paperclip size={20} className="cursor-pointer rotate-[-45deg]" />
                    {!newMessage && <Camera size={20} className="cursor-pointer" />}
                </div>
            </div>

            <button
                onClick={handleSendMessage}
                className="w-12 h-12 bg-[#00897b] rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-all"
            >
                {newMessage.trim() ? (
                    <Send size={20} className="ml-0.5" /> 
                ) : (
                    <Mic size={20} /> 
                )}
            </button>
        </div>
      </div>
    </div>
  );
}