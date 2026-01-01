import React, { useState, useEffect } from 'react';
import { Calendar, Users, Heart, PartyPopper, MessageSquare, Send, Loader2, MapPin, Shield, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabaseClient'; 

// TypeScript Interfaces
interface TrustEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees_count: number;
}

export default function TrustScreen() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<TrustEvent[]>([]);
  const [suggestion, setSuggestion] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ફંડ સ્ટેટ
  const [fundStats, setFundStats] = useState({
    total_fund: '0',
    total_donors: '0',
    upcoming_events: '0'
  });

  const sections = [
    { icon: Calendar, title: 'સંમેલન', color: 'from-blue-400 to-cyan-500' },
    { icon: Users, title: 'સમૂહ લગ્ન', color: 'from-pink-400 to-rose-500' },
    { icon: Heart, title: 'સેવાકાર્ય', color: 'from-green-400 to-emerald-500' },
    { icon: PartyPopper, title: 'ઈવેન્ટ્સ', color: 'from-purple-400 to-indigo-500' },
  ];

  useEffect(() => {
    fetchEvents();
    fetchFundStats(); 
  }, []);

  const handleRefresh = async () => {
      setRefreshing(true);
      await fetchEvents();
      await fetchFundStats();
      setRefreshing(false);
  };

  const fetchFundStats = async () => {
    try {
      const { data } = await supabase.from('fund_stats').select('*').single();
      if (data) setFundStats({ total_fund: data.total_fund, total_donors: data.total_donors, upcoming_events: data.upcoming_events });
    } catch (error) { console.error(error); }
  };

  const fetchEvents = async () => {
    try {
      const { data } = await supabase.from('trust_events').select('*').order('date', { ascending: true });
      setEvents(data || []);
    } catch (error) { console.error(error); } finally { setLoadingEvents(false); }
  };

  // ✅ નેવિગેશન હેન્ડલર (ફોર્મ અહીં નથી, નવી સ્ક્રીન પર છે)
  const handleRegisterClick = (event: TrustEvent) => {
      // 🔥 જો "સમૂહ લગ્ન" હોય તો અલગ પેજ પર લઈ જાઓ
      if (event.title.includes('સમૂહ લગ્ન') || event.title.includes('Samuh Lagan')) {
          navigate('/marriage-registration', { state: { event } });
      } else {
          // 🔥 બાકી બધા માટે વિદ્યાર્થી રજીસ્ટ્રેશન
          navigate('/student-registration', { state: { event } });
      }
  };

  const handleSuggestionSubmit = async () => {
    if (!suggestion.trim()) return alert("લખો.");
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("લોગીન કરો.");
      await supabase.from('trust_suggestions').insert([{ user_id: user.id, message: suggestion }]);
      alert("સૂચન મોકલાઈ ગયું!"); setSuggestion('');
    } catch (error: any) { alert("Error: " + error.message); } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-gujarati">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-500 pt-12 px-6 pb-20 rounded-b-[2.5rem] shadow-lg relative">
        <h1 className="text-white font-bold text-2xl font-gujarati">યોગી સમાજ ટ્રસ્ટ</h1>
        <p className="text-white/80 text-sm font-gujarati">સમાજ સેવા અને વિકાસ</p>
        <button onClick={handleRefresh} className="absolute top-12 right-6 p-2 bg-white/20 rounded-full text-white active:scale-90 transition-all">
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Fund Box */}
      <div className="px-6 -mt-12 relative z-10">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
            <h2 className="text-gray-800 font-bold font-gujarati flex items-center gap-2"><Shield className="w-5 h-5 text-yellow-500 fill-current" />સમાજ વિકાસ ફંડ</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-100">
            <div className="px-1"><p className="text-emerald-600 font-bold text-lg">{fundStats.total_fund}</p><p className="text-gray-400 text-[10px]">કુલ ફંડ</p></div>
            <div className="px-1"><p className="text-blue-600 font-bold text-lg">{fundStats.total_donors}</p><p className="text-gray-400 text-[10px]">દાતાઓ</p></div>
            <div className="px-1"><p className="text-purple-600 font-bold text-lg">{fundStats.upcoming_events}</p><p className="text-gray-400 text-[10px]">કાર્યક્રમો</p></div>
          </div>
        </motion.div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* Sections */}
        <div className="grid grid-cols-2 gap-4">
          {sections.map((section, index) => (
            <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-3 shadow-md`}><section.icon className="w-6 h-6 text-white" strokeWidth={2.5} /></div>
                <h3 className="font-bold text-gray-700 text-sm font-gujarati">{section.title}</h3>
            </div>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-lg px-2 border-l-4 border-emerald-500 pl-3 font-gujarati">આગામી કાર્યક્રમો</h3>
          {loadingEvents ? <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div> : 
           events.map((event) => (
            <div key={event.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Event</span>
                    <h4 className="font-bold text-gray-800 text-lg mt-1 font-gujarati">{event.title}</h4>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center min-w-[60px]">
                      <span className="block text-xs text-gray-400 font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="block text-xl font-bold text-emerald-600">{new Date(event.date).getDate()}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl font-gujarati">{event.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 font-gujarati">
                    <div className="flex items-center gap-1"><Users size={14}/> {event.attendees_count || 0} જોડાયા</div>
                    <div className="flex items-center gap-1"><MapPin size={14}/> {event.location}</div>
                </div>
                {/* ✅ અહીં બટન ક્લિક પર નેવિગેશન થશે */}
                <button onClick={() => handleRegisterClick(event)} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg font-gujarati">
                    {event.title.includes('સમૂહ લગ્ન') ? 'લગ્ન માટે રજીસ્ટ્રેશન કરો 💍' : 'નામ નોંધાવો (Register)'}
                </button>
            </div>
          ))}
        </div>

        {/* Suggestion Box */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 font-gujarati"><MessageSquare className="text-blue-600" /> યુવાનોનું મંતવ્ય</h3>
          <textarea value={suggestion} onChange={(e) => setSuggestion(e.target.value)} placeholder="તમારા વિચારો લખો..." rows={3} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-700 font-gujarati" />
          <button onClick={handleSuggestionSubmit} disabled={submitting} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg font-gujarati">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} <span>મોકલો</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}