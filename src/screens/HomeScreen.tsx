import React, { useEffect, useState, useRef } from 'react';
import {
  Bell, Settings, Heart, Search, MessageCircle, User, CreditCard,
  Building2, Bot, Users, GraduationCap, AlertTriangle, Briefcase, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabaseClient';

// ✅ સાઉન્ડ ફાઈલનો પાથ
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'; 

export default function HomeScreen() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Yogi Member');
  const [userPhoto, setUserPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false); // ✅ પોપઅપ સ્ટેટ

  // ✅ ઓડિયો પ્લેયર રેફરન્સ
  const audioRef = useRef(null);

  // ✅ ભાષા લોડ કરો (નવું લોજિક)
  const language = localStorage.getItem('app_language') || 'Gujarati';
  const t = (gu, en) => language === 'English' ? en : gu;

  // ✅ સ્ટેટ્સ: એપ યુઝર્સ અને મેટ્રિમોની પ્રોફાઈલ માટે
  const [statsData, setStatsData] = useState({
    totalAppUsers: 0,
    matrimonyProfiles: 0,
    messages: 0
  });

  // --- Real-time Logic (Fixes Applied) ---
  useEffect(() => {
    fetchDashboardData();
    
    // ✅ ઓડિયો ઓબ્જેક્ટ તૈયાર કરો
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);

    // ડેટાબેઝમાં ફેરફાર થાય તો ઓટોમેટિક અપડેટ કરો
    const channel = supabase
      .channel('realtime-dashboard-v2') // ચેનલ નામ યુનિક રાખ્યું
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
      // 🔥 ખાસ સુધારો: Notifications Listener 🔥
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        (payload) => {
           console.log("🔥 Notification Received:", payload);
           
           // ✅ ૧. સેટિંગ ચેક કરો: શું સાઉન્ડ ચાલુ છે?
           const isSoundEnabled = localStorage.getItem('notification_sound') !== 'off';

           // ✅ ૨. જો સેટિંગ ચાલુ હોય, તો જ સાઉન્ડ વગાડો
           if (isSoundEnabled && audioRef.current) {
              audioRef.current.play()
                .then(() => {
                    // સાઉન્ડ વાગ્યો
                })
                .catch(e => {
                    console.warn("Audio blocked by browser, but showing popup:", e);
                });
           } else {
               console.log("🔕 Sound is muted in Settings.");
           }

           // ૩. પોપઅપ બતાવો (સાઉન્ડ વાગે કે ના વાગે, પોપઅપ તો આવવું જ જોઈએ)
           setShowNotificationPopup(true);
           
           // ૪. ૫ સેકન્ડ પછી પોપઅપ બંધ કરો
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
        // ૧. યુઝર ડેટા
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (userData) {
          setUserName(userData.full_name || user.user_metadata?.full_name || 'Yogi Member');
          setUserPhoto(userData.avatar_url);
        }

        // ૨. કુલ રજીસ્ટર્ડ યુઝર્સ
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // ૩. કુલ મેટ્રિમોની પ્રોફાઈલ્સ
        const { count: profileCount } = await supabase
          .from('matrimony_profiles')
          .select('*', { count: 'exact', head: true });

        // ૪. વણવંચાયેલા મેસેજ
        const { count: messageCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);

        setStatsData({
            totalAppUsers: userCount || 0,
            matrimonyProfiles: profileCount || 0,
            messages: messageCount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ અપડેટ: 'મેસેજ' કાર્ડ કાઢીને 'મેટ્રીમોની ચેટ' ઉમેર્યું (ભાષા સપોર્ટ સાથે)
  const featureCards = [
    { icon: Heart, title: t('મેટ્રિમોની પ્રોફાઈલ', 'Matrimony Profiles'), color: 'from-pink-400 to-rose-500', path: '/matrimony' },
    { icon: Users, title: t('પરિવાર રજીસ્ટ્રેશન', 'Family Registration'), color: 'from-deep-blue to-cyan-500', path: '/family-list' },
    { icon: GraduationCap, title: t('શિક્ષણ અને ભવિષ્ય', 'Education & Future'), color: 'from-indigo-400 to-purple-500', path: '/education' },
    { icon: Briefcase, title: t('નોકરીની જાહેરાત', 'Job Ads'), color: 'from-blue-600 to-indigo-600', path: '/jobs' },
    { icon: MessageCircle, title: t('મેટ્રીમોની ચેટ', 'Matrimony Chat'), color: 'from-blue-400 to-cyan-500', path: '/messages' },
    { icon: CreditCard, title: t('સમાજ વિકાસ ફાળો', 'Membership Fee'), color: 'from-royal-gold to-yellow-600', path: '/subscription' },
    { icon: Building2, title: t('યોગી સમાજ ટ્રસ્ટ', 'Yogi Samaj Trust'), color: 'from-emerald-400 to-green-500', path: '/trust' },
    { icon: Bot, title: t('જ્ઞાન સહાયક', 'AI Assistant'), color: 'from-violet-400 to-purple-500', path: '/ai-assistant' },
  ];

  const stats = [
    { label: t('કુલ સભ્યો', 'Total Members'), value: statsData.totalAppUsers.toString(), color: 'text-deep-blue' },
    { label: t('લગ્ન પ્રોફાઈલ', 'Profiles'), value: statsData.matrimonyProfiles.toString(), color: 'text-mint' },
    { label: t('મેસેજ', 'Messages'), value: statsData.messages.toString(), color: 'text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-gujarati relative">
      
      {/* 🔥 નોટિફિકેશન પોપઅપ મોડલ (High Z-Index) 🔥 */}
      <AnimatePresence>
        {showNotificationPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[9999] w-[90%] max-w-sm pointer-events-auto"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-deep-blue/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 relative ring-1 ring-black/5">
              <div className="bg-deep-blue/10 p-3 rounded-full animate-bounce shrink-0">
                 <Bell className="w-6 h-6 text-deep-blue" />
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => { navigate('/notifications'); setShowNotificationPopup(false); }}>
                 <h3 className="font-bold text-gray-800 text-sm">{t('નવી નોટીફીકેશન આવેલ છે!', 'New Notification Received!')}</h3>
                 <p className="text-xs text-gray-500 font-medium mt-0.5">{t('હમણાજ તપાસો', 'Check Now')}</p>
              </div>
              <button 
                onClick={() => setShowNotificationPopup(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gradient-to-r from-deep-blue to-[#1A8FA3] safe-area-top shadow-lg">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                onClick={() => navigate('/profile')}
                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-inner overflow-hidden cursor-pointer"
              >
                {userPhoto ? (
                  <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-white font-bold text-xl tracking-tight">
                  {loading ? t('તૈયાર થઈ રહ્યું છે...', 'Loading...') : `${t('નમસ્તે', 'Hello')}, ${userName}`}
                </h1>
                <p className="text-mint text-xs font-medium uppercase tracking-widest">Community Connection</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => navigate('/notifications')} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center relative backdrop-blur-md active:scale-90 transition-all">
                <Bell className="w-5 h-5 text-white" />
                {statsData.messages > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/krishna-chat')}
        className="mx-6 -mt-6 p-5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer border-2 border-white relative overflow-hidden"
      >
        <div className="relative z-10 text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            🦚 {t('કૃષ્ણ સારથી (AI)', 'Krishna Sarathi (AI)')}
          </h3>
          <p className="text-xs text-orange-50 text-opacity-90 mt-1">{t('ગીતાજીના જ્ઞાનથી સમસ્યાનું સમાધાન મેળવો.', 'Get solutions from Gita.')}</p>
        </div>
        <div className="relative z-10 w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/50 shadow-lg">
          <span className="text-2xl">🙏</span>
        </div>
      </motion.div>

      <div className="px-6 mt-6">
          <motion.div
             whileTap={{ scale: 0.95 }}
             onClick={() => navigate('/accidental-aid')}
             className="bg-white p-4 rounded-2xl shadow-md border-l-8 border-red-600 flex items-center justify-between relative active:bg-red-50 transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{t('અકસ્માત સહાય (SOS)', 'Accident Aid (SOS)')}</h3>
                <p className="text-[10px] text-red-500 font-bold uppercase">{t('ઈમરજન્સી મદદ માટે અહીં ક્લિક કરો', 'Click here for emergency help')}</p>
              </div>
            </div>
            <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-black shadow-lg">HELP</div>
          </motion.div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-2 gap-4">
          {featureCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(card.path)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-start hover:shadow-md active:scale-95 transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg group-hover:rotate-6 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                {/* ✅ અહીં ફેરફાર કર્યો છે: font-medium અને text-sm */}
                <h3 className="text-gray-700 text-sm font-medium leading-tight text-left tracking-tight">
                  {card.title}
                </h3>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100 flex items-center justify-around">
            {stats.map((stat, index) => (
              <div key={index} className="text-center border-r last:border-0 border-gray-100 flex-1">
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-500 text-[9px] font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}