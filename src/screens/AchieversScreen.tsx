import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Star, Award, BookOpen, Quote, User, Loader2
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabaseClient';

interface Achiever {
  id: number;
  name: string;
  achievements: string;
  photo: string;
  educationJourney: string;
  struggles: string;
  adviceForYouth: string;
}

export default function AchieversScreen() {
  const navigate = useNavigate();
  const [achievers, setAchievers] = useState<Achiever[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchiever, setSelectedAchiever] = useState<Achiever | null>(null);

  useEffect(() => {
    fetchAchievers();
  }, []);

  const fetchAchievers = async () => {
    try {
      setLoading(true);
      
      // SQL એરર સોલ્વ કરવા માટે સીધા ડેટાબેઝના નામો વાપર્યા છે
      const { data, error } = await supabase
        .from('achievers')
        .select(`
          id,
          name,
          achievements,
          photo,
          education_journey,
          struggles,
          advice_for_youth
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // UI ઇન્ટરફેસ (camelCase) મુજબ ડેટા મેપિંગ
      const formattedData = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        achievements: item.achievements,
        photo: item.photo,
        educationJourney: item.education_journey,
        struggles: item.struggles,
        adviceForYouth: item.advice_for_youth
      }));

      setAchievers(formattedData);

    } catch (error: any) {
      console.error('Error fetching achievers:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAchieverCard = (achiever: Achiever, index: number) => (
    <motion.div
      key={achiever.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => setSelectedAchiever(achiever)}
      className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 mb-4 cursor-pointer active:scale-95 transition-all"
    >
      <div className="flex items-start space-x-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 shadow-inner">
            {achiever.photo ? (
              <img src={achiever.photo} alt={achiever.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
        </div>
        <div className="flex-1">
          <h3 className="font-gujarati font-bold text-gray-800 text-lg leading-tight mb-1">{achiever.name}</h3>
          <p className="text-royal-gold text-xs font-black uppercase tracking-widest mb-2">{achiever.achievements}</p>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} className="text-amber-400 fill-amber-400" />)}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-gujarati">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-[#1A8FA3] safe-area-top shadow-lg">
        <div className="px-6 py-8 flex items-center space-x-4">
          <button onClick={() => navigate('/education')} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-2xl tracking-tight">સમાજના ગૌરવ</h1>
            <p className="text-mint text-xs font-medium uppercase tracking-widest">Achievers Gallery</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-[35px] border-l-8 border-royal-gold shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-3">
             <Award className="text-royal-gold" size={32} />
             <h2 className="font-black text-gray-800 text-lg">પ્રેરણાત્મક ગાથા</h2>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">સમાજના એવા રત્નો જેમણે શૂન્યમાંથી સર્જન કર્યું છે. તેમની સફળતામાંથી શીખો અને આગળ વધો.</p>
        </motion.div>

        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-royal-gold" size={40} /></div>
        ) : achievers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                <Star className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-bold">હજુ કોઈ માહિતી ઉપલબ્ધ નથી</p>
            </div>
        ) : (
            <div className="space-y-2">{achievers.map(renderAchieverCard)}</div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAchiever && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAchiever(null)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={(e) => e.stopPropagation()} className="w-full bg-white rounded-t-[45px] max-h-[90vh] overflow-y-auto shadow-2xl pb-10">
              <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-gray-50 flex justify-center">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full" />
              </div>

              <div className="p-8">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-3xl bg-amber-50 overflow-hidden shadow-lg border-2 border-white">
                        {selectedAchiever.photo ? <img src={selectedAchiever.photo} className="w-full h-full object-cover" /> : <User size={48} className="m-auto text-amber-200" />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 mb-1">{selectedAchiever.name}</h2>
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">{selectedAchiever.achievements}</span>
                    </div>
                </div>

                <div className="space-y-8">
                    <DetailSection icon={BookOpen} title="શિક્ષણની સફર" content={selectedAchiever.educationJourney} />
                    <DetailSection icon={Award} title="મુખ્ય સંઘર્ષ" content={selectedAchiever.struggles} />
                    
                    {selectedAchiever.adviceForYouth && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-[30px] border border-amber-100 relative">
                            <Quote className="absolute top-4 right-4 text-amber-200" size={40} />
                            <h4 className="font-black text-amber-800 text-sm mb-3 uppercase tracking-wider">યુવાનો માટે સંદેશ</h4>
                            <p className="text-amber-900 italic font-medium leading-relaxed">"{selectedAchiever.adviceForYouth}"</p>
                        </div>
                    )}
                </div>

                <button onClick={() => setSelectedAchiever(null)} className="w-full mt-10 py-4 bg-gray-100 rounded-2xl font-bold text-gray-500 active:scale-95 transition-all uppercase text-xs tracking-widest">બંધ કરો</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}

function DetailSection({ icon: Icon, title, content }: any) {
    if (!content) return null;
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-mint/10 rounded-lg text-mint"><Icon size={18} /></div>
                <h3 className="font-black text-gray-800 text-sm uppercase tracking-tighter">{title}</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap pl-10 border-l-2 border-gray-100">{content}</p>
        </div>
    );
}