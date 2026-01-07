import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Heart, Info, CheckCircle, Loader2, Briefcase, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabaseClient';

// નોટિફિકેશન સાઉન્ડ (ઓનલાઇન URL અથવા લોકલ ફાઈલ વાપરી શકાય)
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // વંચાયેલા નોટિફિકેશનના ID સ્ટોર કરવા માટે
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('read_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // લોજીક: એડમિન (Global) અને પર્સનલ બંને નોટિફિકેશન લાવો
      let query = supabase
        .from('notifications') // ટેબલનું નામ ચેક કરી લેજો
        .select('*')
        .eq('is_active', true);

      if (user) {
        // user_id NULL હોય (બધા માટે) અથવા user_id મેચ થતું હોય
        query = query.or(`user_id.is.null,user_id.eq.${user.id}`);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setNotifications(data);
        checkForNewNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ નવું નોટિફિકેશન હોય તો બેલ વાગશે
  const checkForNewNotifications = (data) => {
    const savedReads = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    // જો કોઈ પણ એવું નોટિફિકેશન હોય જે read લિસ્ટમાં નથી, તો અવાજ કરો
    const hasUnread = data.some(n => !savedReads.includes(n.id));
    
    if (hasUnread) {
      notificationSound.play().catch(e => console.log('Sound play blocked:', e));
    }
  };

  // ✅ નોટિફિકેશન પર ક્લિક કરતા 'Read' માર્ક થશે અને લાલ ટપકું જશે
  const handleNotificationClick = (notification) => {
    // 1. Read લિસ્ટમાં ઉમેરો
    if (!readNotifications.includes(notification.id)) {
      const newReadList = [...readNotifications, notification.id];
      setReadNotifications(newReadList);
      localStorage.setItem('read_notifications', JSON.stringify(newReadList));
    }

    // 2. નેવિગેશન લોજીક
    if (notification.type === 'job') navigate('/jobs');
    else if (notification.type === 'matrimony') navigate('/matrimony');
    else if (notification.type === 'profile') navigate('/profile');
    else if (notification.type === 'admin') alert('Admin Notice: ' + notification.message);
  };

  // બધા વાંચી લીધા (Clear All / Mark all read)
  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(allIds);
    localStorage.setItem('read_notifications', JSON.stringify(allIds));
    alert('બધા નોટિફિકેશન વંચાઈ ગયા છે.');
  };

  // આઈકન લોજીક
  const getIcon = (type) => {
    switch (type) {
      case 'matrimony': return <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />;
      case 'job': return <Briefcase className="w-6 h-6 text-purple-600" />;
      case 'welcome': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'admin': return <Megaphone className="w-6 h-6 text-orange-500" />; // Admin માટે સ્પીકર
      default: return <Bell className="w-6 h-6 text-blue-500" />;
    }
  };

  // કલર લોજીક
  const getBgColor = (type) => {
    switch (type) {
      case 'matrimony': return 'bg-pink-50 border-pink-500';
      case 'job': return 'bg-purple-50 border-purple-500';
      case 'welcome': return 'bg-green-50 border-green-500';
      case 'admin': return 'bg-orange-50 border-orange-500';
      default: return 'bg-blue-50 border-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-mint to-teal-500 safe-area-top px-6 py-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-white font-bold text-2xl">નોટીફિકેશન</h1>
              <p className="text-white/90 text-xs font-medium tracking-wide">
                 તમારા અને સમાજના અપડેટ્સ
              </p>
            </div>
          </div>
          {/* Mark all Read Button */}
          {notifications.length > 0 && (
             <button onClick={markAllAsRead} className="text-white text-xs bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 transition">
               બધું વાંચો
             </button>
          )}
        </div>
      </div>

      <div className="px-5 py-6 space-y-4">
        {loading ? (
           <div className="flex justify-center pt-20">
             <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
           </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center pt-20 opacity-60"
          >
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-600 text-lg">હાલ કોઈ નોટીફિકેશન નથી</h3>
          </motion.div>
        ) : (
          notifications.map((notification, index) => {
            const isRead = readNotifications.includes(notification.id);
            const style = getBgColor(notification.type); // બોર્ડર અને બેકગ્રાઉન્ડ બંને લાવશે

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleNotificationClick(notification)}
                className={`relative p-4 rounded-2xl shadow-sm cursor-pointer transition-all active:scale-98 bg-white border-l-[6px] ${style.split(' ')[1]}`} // બોર્ડર કલર
              >
                {/* 🔴 Red Point Logic: જો વંચાયું નથી તો લાલ ટપકું */}
                {!isRead && (
                  <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-md"></span>
                )}

                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full ${style.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                     {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-base mb-1 ${!isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notification.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${!isRead ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold tracking-wider">
                      {new Date(notification.created_at).toLocaleDateString('gu-IN', {day: 'numeric', month: 'short'})} • {new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}