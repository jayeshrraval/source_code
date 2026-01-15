import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Smile, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import imageCompression from 'browser-image-compression';

export default function NoticeBoardScreen() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // ✅ એડમિન ઈમેલ/નંબર
  const ADMIN_IDENTIFIER = '9714443758';

  useEffect(() => {
    checkAdminStatus();
    fetchMessages();
    markAsRead();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email && user.email.includes(ADMIN_IDENTIFIER)) {
          setIsAdmin(true);
      }
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async () => {
    const { data } = await supabase.from('admin_messages').select('*').order('created_at', { ascending: true });
    setMessages(data || []);
    setLoading(false);
  };

  const markAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('message_reads').upsert({ user_id: user.id, last_read_at: new Date().toISOString() });
  };

  // 🔥 સુધારો: 100 KB સાઈઝ લિમિટ
  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const imageFile = e.target.files[0];
      
      const options = {
        maxSizeMB: 0.1,        // ✅ 0.1 MB = 100 KB
        maxWidthOrHeight: 800, // રિઝોલ્યુશન પણ માપસરનું રાખ્યું
        useWebWorker: true
      };

      try {
        const compressedFile = await imageCompression(imageFile, options);
        setSelectedImage(compressedFile);
      } catch (error) {
        console.log("Compression Error:", error);
        alert("ફોટો નાનો કરવામાં એરર આવી, ઓરીજીનલ ફોટો લેવાશે.");
        setSelectedImage(imageFile);
      }
    }
  };

  const onEmojiClick = (emojiObject) => {
    setInputText((prev) => prev + emojiObject.emoji);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;
    setShowEmojiPicker(false);

    let imageUrl = null;
    
    if (selectedImage) {
      setUploading(true);
      const fileName = `${Date.now()}_img`; 
      const { error } = await supabase.storage.from('chat-images').upload(fileName, selectedImage);
      
      if (error) {
        alert("Image upload failed!");
        setUploading(false);
        return;
      }
      
      const { data: urlData } = supabase.storage.from('chat-images').getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
      setUploading(false);
    }

    const { error } = await supabase.from('admin_messages').insert([{ 
        title: 'સમાજ ન્યૂઝ', 
        message: inputText, 
        image_url: imageUrl 
    }]);

    if (!error) {
      setInputText('');
      setSelectedImage(null);
      fetchMessages();
    } else {
      alert("Error: " + error.message);
    }
  };

  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString() ? 'Today' : date.toLocaleDateString('en-GB');
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5]">
      <div className="bg-[#075E54] p-3 pt-safe-top flex items-center gap-2 shadow-md z-10 sticky top-0 text-white">
        <button onClick={() => navigate('/')} className="p-1 rounded-full hover:bg-white/10"><ArrowLeft size={24} /></button>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">📢</div>
        <div>
          <h1 className="font-bold text-lg leading-tight">સમાજ ન્યૂઝ</h1>
          <p className="text-[11px] text-white/80">{isAdmin ? 'You (Admin)' : 'તમે, પ્રમુખશ્રી, મંત્રીશ્રી...'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-fixed">
        {loading ? <div className="text-center text-xs bg-white/80 w-fit mx-auto px-2 py-1 rounded">Loading...</div> : (
          <>
            {messages.map((msg, index) => {
              const showDate = index === 0 || new Date(messages[index].created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();
              return (
                <div key={msg.id}>
                  {showDate && <div className="flex justify-center my-2"><span className="bg-[#E1F3FB] text-gray-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">{formatDateLabel(msg.created_at)}</span></div>}
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-start max-w-[85%]">
                    <div className="bg-white p-1 rounded-lg rounded-tl-none shadow-sm relative text-gray-800 min-w-[120px]">
                       {msg.image_url && (<div className="p-1 pb-0"><img src={msg.image_url} alt="Post" className="rounded-lg w-full h-auto max-h-64 object-cover" /></div>)}
                       <div className="px-2 pt-1 pb-5">
                         {msg.title && msg.title !== 'સમાજ ન્યૂઝ' && <p className="font-bold text-[#D85C27] text-sm mb-1">{msg.title}</p>}
                         <p className="text-sm whitespace-pre-wrap leading-snug">{msg.message}</p>
                       </div>
                       <div className="absolute bottom-1 right-2 text-[9px] text-gray-400">{formatTime(msg.created_at)}</div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {isAdmin ? (
        <div className="bg-[#f0f2f5] border-t relative">
           {showEmojiPicker && (
             <div className="absolute bottom-16 left-2 z-50 shadow-2xl rounded-xl border border-gray-200">
               <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
             </div>
           )}

           {selectedImage && (
             <div className="absolute bottom-16 left-14 bg-white p-2 rounded-lg shadow-lg border border-green-500 z-20">
               <img src={URL.createObjectURL(selectedImage)} className="h-20 w-20 object-cover rounded" alt="prev"/>
               <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={14}/></button>
             </div>
           )}

           <div className="p-2 flex items-end gap-2">
             <div className="flex-1 bg-white flex items-center rounded-2xl border px-2 py-1 shadow-sm">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-400 hover:text-yellow-500 p-2 transition-colors">
                  <Smile size={24} />
                </button>
                <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Message" className="flex-1 max-h-32 p-2 border-none focus:ring-0 text-sm resize-none bg-transparent outline-none" rows={1} onClick={() => setShowEmojiPicker(false)} />
                <button onClick={() => fileInputRef.current.click()} className="text-gray-400 hover:text-gray-600 p-2 -rotate-45"><Paperclip size={22} /></button>
                <button onClick={() => fileInputRef.current.click()} className="text-gray-400 hover:text-gray-600 p-2"><ImageIcon size={22} /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
             </div>
             <button onClick={handleSendMessage} disabled={uploading} className="bg-[#008a7c] text-white p-3 rounded-full shadow-md hover:bg-[#075E54] transition-all flex items-center justify-center h-12 w-12">
               {uploading ? <span className="animate-spin text-xs">⏳</span> : <Send size={20} className="ml-0.5" />}
             </button>
           </div>
        </div>
      ) : (
        <div className="p-2 bg-[#f0f2f5] flex items-center justify-center text-xs text-gray-400 border-t">Only admins can send messages</div>
      )}
    </div>
  );
}