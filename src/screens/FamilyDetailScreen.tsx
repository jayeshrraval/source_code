import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, MapPin, User, GraduationCap, Loader2, Info 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import BottomNav from '../components/BottomNav';

export default function FamilyDetailsScreen() {
  const { id } = useParams<{ id: string }>(); // લિસ્ટમાંથી મળેલ ID
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // સિંગલ ટેબલ લોજીક માટે સ્ટેટ
  const [headInfo, setHeadInfo] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (id) fetchFamilyDetails();
  }, [id]);

  const fetchFamilyDetails = async () => {
    try {
      setLoading(true);
      
      // 1. પહેલા આ ID વાળા સભ્યનો ડેટા લાવો (જેથી ખબર પડે કે કયો પરિવાર છે)
      const { data: refData, error: refError } = await supabase
        .from('families')
        .select('*')
        .eq('id', id)
        .single();

      if (refError) throw refError;

      setHeadInfo(refData);

      // 2. હવે તે પરિવારના (Head Name + Village મેચ થતા) બધા સભ્યો શોધો
      // આ એક જ ટેબલ (families) માંથી ડેટા લાવશે
      const { data: allMembers, error: listError } = await supabase
        .from('families')
        .select('*')
        .eq('head_name', refData.head_name)
        .eq('village', refData.village);

      if (listError) throw listError;

      setMembers(allMembers || []);

    } catch (error: any) {
      console.error(error);
      // alert('ભૂલ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-deep-blue" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-gujarati">
      <div className="bg-gradient-to-r from-deep-blue to-[#1A8FA3] p-6 shadow-lg safe-area-top">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white mb-4"><ArrowLeft size={20} /></button>
        {headInfo && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white">
            <h2 className="text-2xl font-bold">{headInfo.head_name}</h2>
            <p className="text-white/80 font-bold text-lg">({headInfo.sub_surname})</p>
            <div className="flex gap-4 mt-2 text-sm text-white/90">
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-lg">
                  <MapPin size={14}/> {headInfo.village}, {headInfo.taluko}
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-lg">
                  <Users size={14}/> {members.length} સભ્યો
              </span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2"><Info className="text-deep-blue" size={20} /> સભ્યોની યાદી</h3>
        {members.length === 0 ? (
            <p className="text-center text-gray-400">કોઈ સભ્ય મળ્યા નથી.</p>
        ) : (
            members.map((member, index) => (
            <motion.div key={member.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="bg-white p-4 rounded-2xl shadow-sm border flex gap-4 items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${member.gender === 'સ્ત્રી' ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'}`}>
                    <User size={20} />
                </div>
                <div>
                <h4 className="font-bold text-gray-800">{member.member_name}</h4>
                <p className="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-full w-fit mt-1">{member.relationship}</p>
                </div>
            </motion.div>
            ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}