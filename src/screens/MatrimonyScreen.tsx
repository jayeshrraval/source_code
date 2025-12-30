import React, { useState, useEffect } from 'react';
import { Search, Heart, Loader2, User, MapPin, Briefcase, GraduationCap, Camera, Bell, ArrowLeft, Users, Lock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabaseClient';

type TabType = 'list' | 'detail' | 'myprofile';

export default function MatrimonyScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // ✅ ફેમિલી વેરીફીકેશન સ્ટેટ
  const [isFamilyVerified, setIsFamilyVerified] = useState<boolean | null>(null);
  const [familyData, setFamilyData] = useState<any>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    mother_name: '',
    peta_atak: '',
    mother_peta_atak: '',
    gol: '',
    age: '',
    marital_status: 'અપરિણીત',
    village: '',
    taluka: '',
    district: '',
    education: '',
    occupation: '',
    kundali_available: false,
    image_url: ''
  });

  useEffect(() => {
    fetchProfiles();
    checkFamilyAndProfileStatus();
  }, []);

  // 🔥 સુધારેલું લોજિક: મોબાઈલ નંબરથી મેચિંગ અને ઓટો-ફિલ 🔥
  const checkFamilyAndProfileStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // ૧. પહેલા ચેક કરો કે મેટ્રિમોની પ્રોફાઈલ છે કે નહીં?
      const { data: matProfile } = await supabase
        .from('matrimony_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (matProfile) {
        setFormData({ ...matProfile, age: matProfile.age?.toString() || '' });
        setHasProfile(true);
        setIsFamilyVerified(true);
        return;
      }

      // ૨. લોગીન યુઝરનો મોબાઈલ નંબર મેળવો (ઈમેઈલ કે ફોન ગમે તેમાંથી)
      // ✅ અપડેટ: આ લોજિક હવે ઈમેઈલમાંથી પણ નંબર શોધી લેશે
      let rawPhone = user.phone || user.email || user.user_metadata?.mobile_number || '';
      
      // ✅ પાવરફુલ ક્લીનિંગ: ફક્ત છેલ્લા ૧૦ આંકડા જ પકડશે
      const cleanPhone = rawPhone.replace(/[^0-9]/g, '').slice(-10);

      if (!cleanPhone || cleanPhone.length < 10) {
        console.log("No valid phone number found");
        setIsFamilyVerified(false);
        return;
      }

      console.log("Checking family for phone:", cleanPhone);

      // ૩. ✅ સુધારો: 'families' ટેબલમાં સર્ચ (હેડ અથવા મેમ્બર મોબાઈલ બંનેમાં)
      const { data: familyRows } = await supabase
        .from('families')
        .select('*')
        .or(`mobile_number.ilike.%${cleanPhone}%,member_mobile.ilike.%${cleanPhone}%`)
        .limit(1);

      if (familyRows && familyRows.length > 0) {
        const member = familyRows[0];
        setIsFamilyVerified(true);
        setFamilyData(member);
        
        // ૪. ✅ ડેટા ઓટોમેટિક ભરી દો (ફેમિલી ટેબલમાંથી)
        setFormData(prev => ({
          ...prev,
          full_name: member.member_name || member.head_name || '',
          peta_atak: member.sub_surname || '',
          village: member.village || '',
          taluka: member.taluko || '',
          district: member.district || '',
          gol: member.gol || '',
          // જો જન્મતારીખ હોય તો ઉંમર ગણશે
          age: member.dob ? calculateAge(member.dob) : '' 
        }));
      } else {
        setIsFamilyVerified(false); // ❌ નંબર મેચ ના થયો
      }

    } catch (error) {
      console.error('Check Error:', error);
    }
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return '';
    const birthDate = new Date(dobString);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
  };

  const fetchProfiles = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    let query = supabase.from('matrimony_profiles').select('*').order('created_at', { ascending: false });
    if (user) query = query.neq('user_id', user.id);
    const { data } = await query;
    if (data) setProfiles(data);
    setLoading(false);
  };

  const handleSendRequest = async (receiverId: string) => {
    if (!hasProfile) {
      alert("તમે રિક્વેસ્ટ મોકલી શકતા નથી! પહેલા 'મારી પ્રોફાઇલ' બનાવો.");
      setActiveTab('myprofile');
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert('લોગીન કરો.');
      
      const { data: existingRequest } = await supabase
        .from('requests')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .maybeSingle();

      if (existingRequest) {
        if (existingRequest.status === 'accepted') alert('તમે બંને પહેલેથી જ કનેક્ટેડ છો! ✅');
        else if (existingRequest.sender_id === user.id) alert('રિક્વેસ્ટ મોકલેલી છે! ⏳');
        else alert('સામે વાળાએ રિક્વેસ્ટ મોકલી છે! 📩');
        return;
      }

      const { error } = await supabase
        .from('requests')
        .insert([{ sender_id: user.id, receiver_id: receiverId, status: 'pending' }]);

      if (error) throw error;
      alert('રિક્વેસ્ટ સફળતાપૂર્વક મોકલાઈ ગઈ! 🎉');
    } catch (error: any) {
      alert('ભૂલ આવી: ' + error.message);
    }
  };

  const handleImageUpload = async (event: any) => {
      try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `matrimony/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      alert('ફોટો અપલોડ થઈ ગયો!');
    } catch (error: any) {
      alert('અપલોડમાં ભૂલ: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
      try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('matrimony_profiles').upsert({
        user_id: user.id,
        ...formData,
        age: parseInt(formData.age) || 0,
        updated_at: new Date()
      }, { onConflict: 'user_id' });
      if (error) throw error;
      alert('પ્રોફાઇલ સેવ થઈ ગઈ! 🎉');
      setHasProfile(true);
      setActiveTab('list');
      fetchProfiles();
    } catch (error: any) {
      alert('ભૂલ આવી: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-gujarati">
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-8 shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-white font-bold text-3xl tracking-tight">મેટ્રિમોની</h1>
          <p className="text-pink-100 text-sm mt-1 opacity-90 font-medium">યોગ્ય જીવનસાથીની પસંદગી</p>
        </div>
        <button 
          onClick={() => navigate('/requests')} 
          className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/30 text-white active:scale-90 transition-all shadow-lg"
        >
          <Bell size={26} />
        </button>
      </div>

      <div className="bg-white border-b border-gray-200 px-6 pt-4 sticky top-0 z-20 shadow-sm overflow-x-auto whitespace-nowrap">
        <div className="flex space-x-6">
          <button onClick={() => setActiveTab('list')} className={`pb-3 px-1 font-bold text-sm ${activeTab === 'list' ? 'text-pink-600 border-b-4 border-pink-600' : 'text-gray-400'}`}>પ્રોફાઈલ લિસ્ટ</button>
          <button onClick={() => setActiveTab('myprofile')} className={`pb-3 px-1 font-bold text-sm ${activeTab === 'myprofile' ? 'text-pink-600 border-b-4 border-pink-600' : 'text-gray-400'}`}>મારી પ્રોફાઈલ</button>
          <button onClick={() => setActiveTab('detail')} className={`pb-3 px-1 font-bold text-sm ${activeTab === 'detail' ? 'text-pink-600 border-b-4 border-pink-600' : 'text-gray-400'}`}>વિગત</button>
        </div>
      </div>

      <div className="px-6 py-6">
        {activeTab === 'list' && (
          <div className="space-y-4">
            {loading ? <Loader2 className="animate-spin mx-auto mt-10 text-pink-500" /> : profiles.length === 0 ? <p className="text-center text-gray-400 mt-10 font-bold">કોઈ પ્રોફાઇલ મળી નથી.</p> : profiles.map((profile) => (
              <motion.div key={profile.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-4 rounded-[30px] shadow-sm border border-gray-100 flex gap-4 items-center">
                <div className="w-20 h-20 rounded-2xl bg-pink-50 flex items-center justify-center shrink-0 border border-pink-100 overflow-hidden shadow-inner">
                  {profile.image_url ? <img src={profile.image_url} className="w-full h-full object-cover" /> : <User className="text-pink-200 w-10 h-10" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{profile.full_name}</h3>
                  <p className="text-pink-600 text-xs font-bold mt-1 bg-pink-50 w-fit px-2 py-0.5 rounded-full">{profile.age} વર્ષ | {profile.village}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => { setSelectedProfile(profile); setActiveTab('detail'); }} className="bg-pink-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm active:scale-90 transition-all">વિગત</button>
                    <button onClick={() => handleSendRequest(profile.user_id)} className="bg-white text-pink-600 border border-pink-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm active:scale-90 transition-all">રિક્વેસ્ટ</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'myprofile' && (
            // ✅ ફેમિલી વેરીફીકેશન ચેક
            isFamilyVerified === false ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <Lock className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">પ્રોફાઈલ બનાવી શકાતી નથી</h2>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs leading-relaxed">
                        અમારો રેકોર્ડ કહે છે કે તમારો મોબાઈલ નંબર 'પરિવાર લિસ્ટ'માં નથી. લગ્ન પ્રોફાઈલ બનાવવા માટે તમારું ફેમિલી રજીસ્ટ્રેશન હોવું જરૂરી છે.
                    </p>
                    <button 
                        onClick={() => navigate('/family-list')}
                        className="bg-deep-blue text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all shadow-lg hover:bg-blue-800"
                    >
                        <Users size={20} />
                        પરિવાર લિસ્ટમાં જોડાવો
                    </button>
                </div>
            ) : (
                // જો ફેમિલીમાં હોય તો ફોર્મ ખૂલશે
                <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 space-y-6">
                      {familyData && !hasProfile && (
                          <div className="bg-green-50 p-4 rounded-xl flex items-start gap-3 border border-green-100">
                              <CheckCircle className="text-green-600 w-5 h-5 shrink-0 mt-0.5" />
                              <div>
                                 <p className="text-sm text-green-800 font-bold">વેરીફાઈડ મેમ્બર ✅</p>
                                 <p className="text-xs text-green-700 mt-1">
                                     તમારો મોબાઈલ નંબર પરિવાર લિસ્ટ સાથે મેચ થયો છે. તમારી વિગતો ઓટોમેટિક ભરાઈ ગઈ છે.
                                 </p>
                             </div>
                          </div>
                      )}

                    <div className="flex flex-col items-center mb-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-gray-50 border-2 border-dashed border-pink-200 overflow-hidden flex items-center justify-center shadow-inner">
                        {formData.image_url ? <img src={formData.image_url} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-pink-100" />}
                        </div>
                        <label className="absolute -bottom-2 -right-2 bg-pink-600 p-3 rounded-2xl shadow-lg cursor-pointer active:scale-90 transition-transform">
                        {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>
                    </div>

                    <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 border-b pb-2 text-lg uppercase tracking-wider">વ્યક્તિગત માહિતી</h3>
                    
                    {/* ફોર્મ ફિલ્ડ્સ */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">લગ્ન સ્થિતિ</label>
                        <select 
                        value={formData.marital_status}
                        onChange={(e) => setFormData({...formData, marital_status: e.target.value})}
                        className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-pink-500 border-none mt-1 shadow-inner appearance-none"
                        >
                        <option value="અપરિણીત">અપરિણીત</option>
                        <option value="વિધવા">વિધવા</option>
                        <option value="વિધુર">વિધુર</option>
                        <option value="છૂટાછેડા">છૂટાછેડા</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">પૂરું નામ</label>
                        <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-700 mt-1 shadow-inner border-none outline-none focus:ring-2 focus:ring-pink-500" placeholder="નામ લખો" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">પિતાનું નામ</label>
                        <input type="text" value={formData.father_name} onChange={(e) => setFormData({...formData, father_name: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-700 mt-1 shadow-inner border-none outline-none focus:ring-2 focus:ring-pink-500" placeholder="પિતાનું નામ લખો" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">માતાનું નામ</label>
                        <input type="text" value={formData.mother_name} onChange={(e) => setFormData({...formData, mother_name: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-700 mt-1 shadow-inner border-none outline-none focus:ring-2 focus:ring-pink-500" placeholder="માતાનું નામ લખો" />
                    </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">પેટા અટક</label>
                        <input type="text" value={formData.peta_atak} onChange={(e) => setFormData({...formData, peta_atak: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-700 mt-1 shadow-inner border-none outline-none focus:ring-2 focus:ring-pink-500" placeholder="પેટા અટક લખો" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">માતાની પેટા અટક</label>
                        <input type="text" value={formData.mother_peta_atak} onChange={(e) => setFormData({...formData, mother_peta_atak: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-700 mt-1 shadow-inner border-none outline-none focus:ring-2 focus:ring-pink-500" placeholder="માતાની પેટા અટક લખો" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ગોળ</label>
                        <input type="text" value={formData.gol} onChange={(e) => setFormData({...formData, gol: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-700 mt-1 shadow-inner border-none outline-none focus:ring-2 focus:ring-pink-500" placeholder="ગોળ લખો" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ઉંમર</label>
                        <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-700 mt-1 shadow-inner border-none outline-none focus:ring-2 focus:ring-pink-500" placeholder="ઉંમર લખો" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ગામ</label>
                        <input type="text" value={formData.village} onChange={(e) => setFormData({...formData, village: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-700 mt-1 shadow-inner border-none outline-none focus:ring-2 focus:ring-pink-500" placeholder="ગામ લખો" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">તાલુકો</label>
                        <input type="text" value={formData.taluka} onChange={(e) => setFormData({...formData, taluka: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-700 mt-1 shadow-inner border-none outline-none focus:ring-2 focus:ring-pink-500" placeholder="તાલુકો લખો" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">જીલ્લો</label>
                        <input type="text" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-700 mt-1 shadow-inner border-none outline-none focus:ring-2 focus:ring-pink-500" placeholder="જીલ્લો લખો" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">શિક્ષણ</label>
                        <input type="text" value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-700 mt-1 shadow-inner border-none outline-none focus:ring-2 focus:ring-pink-500" placeholder="શિક્ષણ લખો" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">નોકરી/ધંધો</label>
                        <input type="text" value={formData.occupation} onChange={(e) => setFormData({...formData, occupation: e.target.value})} className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold text-gray-700 mt-1 shadow-inner border-none outline-none focus:ring-2 focus:ring-pink-500" placeholder="ધંધો લખો" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-pink-50 rounded-2xl mt-4">
                        <span className="text-sm font-bold text-pink-700 uppercase">કુંડળી ઉપલબ્ધ છે?</span>
                        <input type="checkbox" className="w-6 h-6 accent-pink-600 rounded" checked={formData.kundali_available} onChange={(e) => setFormData({...formData, kundali_available: e.target.checked})} />
                    </div>
                    </div>

                    <button onClick={handleSaveProfile} disabled={loading} className="w-full bg-pink-600 text-white font-black py-5 rounded-[25px] shadow-lg active:scale-95 transition-all mt-6 uppercase tracking-widest">
                    {loading ? 'સેવ થઈ રહ્યું છે...' : 'મેટ્રિમોની પ્રોફાઇલ સેવ કરો'}
                    </button>
                </div>
            )
        )}

        {activeTab === 'detail' && (
          <div className="space-y-6">
            {selectedProfile ? (
              <div className="bg-white rounded-[40px] p-6 shadow-xl border border-pink-50">
                <div className="text-center mb-6">
                  <div className="w-32 h-32 bg-pink-50 rounded-full mx-auto mb-4 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                    <img src={selectedProfile.image_url || 'https://ui-avatars.com/api/?name=User&background=random'} className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-800">{selectedProfile.full_name}</h2>
                  <p className="text-pink-500 font-bold uppercase text-xs tracking-widest">{selectedProfile.peta_atak}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-6">
                  <DetailRow icon={User} label="લગ્ન સ્થિતિ" value={selectedProfile.marital_status} />
                  <DetailRow icon={MapPin} label="ગામ" value={selectedProfile.village} />
                  <DetailRow icon={Briefcase} label="ધંધો" value={selectedProfile.occupation} />
                  <DetailRow icon={GraduationCap} label="શિક્ષણ" value={selectedProfile.education} />
                  <DetailRow icon={Heart} label="ગોળ" value={selectedProfile.gol} />
                </div>
                <button onClick={() => handleSendRequest(selectedProfile.user_id)} className="w-full mt-6 bg-pink-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all uppercase tracking-widest">રિક્વેસ્ટ મોકલો</button>
              </div>
            ) : <p className="text-center text-gray-400 font-bold mt-10">લિસ્ટમાંથી કોઈ પ્રોફાઇલ પસંદ કરો.</p>}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex flex-col p-3 bg-gray-50 rounded-2xl">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-pink-500" />
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{label}</span>
      </div>
      <p className="text-sm font-bold text-gray-700 truncate">{value || '-'}</p>
    </div>
  );
}