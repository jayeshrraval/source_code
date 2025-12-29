import React, { useEffect, useState, useRef } from 'react';
import {
  Bell, Settings, Heart, Search, MessageCircle, User, CreditCard,
  Building2, Bot, Users, GraduationCap, AlertTriangle, Briefcase, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabaseClient';

// ✅ નોટિફિકેશન સાઉન્ડ યુઆરએલ
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'; 

export default function HomeScreen() {
  const navigate = useNavigate();
  
  // ✅ લોડિંગ વગર નામ બતાવવા માટે કેશ ડેટાનો ઉપયોગ
  const [userName, setUserName] = useState(localStorage.getItem('cached_user_full_name') || 'Yogi Member');
  const [userPhoto, setUserPhoto] = useState<string | null>(localStorage.getItem('cached_user_photo_url'));
  const [loading, setLoading] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ભાષા સેટિંગ્સ
  const language = localStorage.getItem('app_language') || 'Gujarati';
  const t = (gu: string, en: string) => language === 'English' ? en : gu;

  // આંકડાકીય માહિતી માટે સ્ટેટ
  const [statsData, setStatsData] = useState({
    totalAppUsers: 0,
    matrimonyProfiles: 0,
    messages: 0
  });

  useEffect(() => {
    fetchDashboardData();
    
    // ઓડિયો એલિમેન્ટ તૈયાર કરો
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);

    // સુપાબેસ રીઅલ-ટાઇમ લિસનર
    const channel = supabase
      .channel('realtime-home-updates')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'matrimony_profiles' }, 
        () => fetchDashboardData()
      )
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'users' }, 
        () => fetchDashboardData()
      )
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        (payload) => {
           console.log("New Notification:", payload);
           const isSoundEnabled = localStorage.getItem('notification_sound') !== 'off';

           if (isSoundEnabled && audioRef.current) {
              audioRef.current.play().catch(err => console.log("Audio play blocked"));
           }

           setShowNotificationPopup(true);
           setTimeout(() => setShowNotificationPopup(false), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // ૧. યુઝર પ્રોફાઈલ ફેચ કરો
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (userData) {
          const currentName = userData.full_name || 'Yogi Member';
          setUserName(currentName);
          setUserPhoto(userData.avatar_url);
          
          // ભવિષ્યમાં લોડિંગ રોકવા માટે સેવ કરો
          localStorage.setItem('cached_user_full_name', currentName);
          if (userData.avatar_url) {
            localStorage.setItem('cached_user_photo_url', userData.avatar_url);
          }
        }

        // ૨. મેમ્બર્સ કાઉન્ટ
        const { count: uCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // ૩. લગ્ન પ્રોફાઈલ કાઉન્ટ
        const { count: pCount } = await supabase
          .from('matrimony_profiles')
          .select('*', { count: 'exact', head: true });

        // ૪. અનરીડ મેસેજ કાઉન્ટ
        const { count: mCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);

        setStatsData({
            totalAppUsers: uCount || 0,
            matrimonyProfiles: pCount || 0,
            messages: mCount || 0
        });
      }
    } catch (err) {
      console.error('Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // કાર્ડ્સ માટે ડેટા
  const featureCards = [
    { icon: Heart, title: t('મેટ્રિમોની પ્રોફાઈલ', 'Matrimony Profiles'), color: 'from-pink-400 to-rose-500', path: '/matrimony' },
    { icon: Users, title: t('પરિવાર રજીસ્ટ્રેશન', 'Family Registration'), color: 'from-deep-blue to-cyan-500', path: '/family-list' },
    { icon: GraduationCap, title: t('શિક્ષણ અને ભવિષ્ય', 'Education & Future'), color: 'from-indigo-400 to-purple-500', path: '/education' },
    { icon: Briefcase, title: t('નોકરીની જાહેરાત', 'Job Ads'), color: 'from-blue-600 to-indigo-600', path: '/jobs' },
    { icon: MessageCircle, title: t('મેટ્રીમોની ચેટ', 'Matrimony Chat'), color: 'from-blue-400 to-cyan-500', path: '/messages' },
    { icon: CreditCard, title: t('મેમ્બરશીપ ફી', 'Membership Fee'), color: 'from-royal-gold to-yellow-600', path: '/subscription' },
    { icon: Building2, title: t('યોગી સમાજ ટ્રસ્ટ', 'Yogi Samaj Trust'), color: 'from-emerald-400 to-green-500', path: '/trust' },
    { icon: Bot, title: t('જ્ઞાન સહાયક', 'AI Assistant'), color: 'from-violet-400 to-purple-500', path: '/ai-assistant' },
  ];

  const statCards = [
    { label: t('કુલ સભ્યો', 'Total Members'), value: statsData.totalAppUsers.toString(), color: 'text-deep-blue' },
    { label: t('લગ્ન પ્રોફાઈલ', 'Profiles'), value: statsData.matrimonyProfiles.toString(), color: 'text-mint' },
    { label: t('મેસેજ', 'Messages'), value: statsData.messages.toString(), color: 'text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-gujarati relative">
      
      {/* નોટિફિકેશન પોપઅપ */}
      <AnimatePresence>
        {showNotificationPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -50 }} 
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[9999] w-[90%] max-w-sm"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-deep-blue/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 relative">
              <div className="bg-deep-blue/10 p-3 rounded-full shrink-0">
                <Bell className="w-6 h-6 text-deep-blue" />
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => { navigate('/notifications'); setShowNotificationPopup(false); }}>
                 <h3 className="font-bold text-gray-800 text-[11px]">{t('નવી નોટીફીકેશન!', 'New Notification!')}</h3>
                 <p className="text-[9px] text-gray-500 mt-0.5">{t('તપાસો', 'Check Now')}</p>
              </div>
              <button onClick={() => setShowNotificationPopup(false)} className="absolute top-2 right-2 text-gray-400 p-1">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* હેડર સેક્શન */}
      <div className="bg-gradient-to-r from-deep-blue to-[#1A8FA3] safe-area-top shadow-lg">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                onClick={() => navigate('/profile')} 
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 overflow-hidden cursor-pointer shadow-inner"
              >
                {userPhoto ? (
                  <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-white font-medium text-base tracking-tight">
                  {t('નમસ્તે', 'Hello')}, {userName}
                </h1>
                <p className="text-mint text-[9px] font-medium uppercase tracking-widest">Yogi Samaj Connect</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/notifications')} 
              className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center relative active:scale-90 transition-all backdrop-blur-md"
            >
              <Bell className="w-4 h-4 text-white" />
              {statsData.messages > 0 && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ફીચર કાર્ડ્સ ગ્રીડ */}
      <div className="px-5 py-6">
        <div className="grid grid-cols-2 gap-3">
          {featureCards.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(item.path)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start transition-all hover:bg-gray-50/50"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-md`}>
                  <IconComponent className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                {/* ✅ ફોન્ટ સાઈઝ નાની (text-xs) અને નોર્મલ વેટ (font-medium) */}
                <h3 className="text-gray-700 text-xs font-medium leading-tight text-left tracking-tight">
                  {item.title}
                </h3>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* સ્ટેટ્સ સેક્શન */}
      <div className="px-6 pb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-around">
            {statCards.map((st, i) => (
              <div key={i} className="text-center flex-1 border-r last:border-0 border-gray-50 px-2">
                <p className={`text-xl font-black ${st.color}`}>{st.value}</p>
                <p className="text-gray-400 text-[8px] font-bold mt-1 uppercase tracking-wider">{st.label}</p>
              </div>
            ))}
        </div>
      </div>

      {/* બોટમ નેવિગેશન */}
      <BottomNav />
    </div>
  );
}