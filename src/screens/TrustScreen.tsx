import React, { useState, useEffect } from 'react';
import { Calendar, Users, Heart, PartyPopper, MessageSquare, Send, Loader2, MapPin, X, User, Phone, Upload, GraduationCap, Shield, RefreshCw, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [events, setEvents] = useState<TrustEvent[]>([]);
  const [suggestion, setSuggestion] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ફંડ સ્ટેટ
  const [fundStats, setFundStats] = useState({
    total_fund: '0',
    total_donors: '0',
    upcoming_events: '0'
  });

  // મોડલ સ્ટેટ
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TrustEvent | null>(null);
  const [uploading, setUploading] = useState(false);

  // 🎓 વિદ્યાર્થી ફોર્મ ડેટા
  const [studentForm, setStudentForm] = useState({
    full_name: '', sub_surname: '', village: '', taluko: '', district: '', gol: '', 
    school_college: '', percentage: '', passing_year: '', marksheet_url: '', mobile: ''
  });

  // 💍 સમૂહ લગ્ન ફોર્મ ડેટા (તમારી રિક્વાયરમેન્ટ મુજબ)
  const [marriageForm, setMarriageForm] = useState({
    groom_name: '', groom_father: '', groom_mother: '', groom_peta_atak: '', groom_village: '', groom_taluka: '', groom_district: '', groom_gol: '', groom_photo_url: '',
    bride_name: '', bride_father: '', bride_mother: '', bride_peta_atak: '', bride_village: '', bride_taluka: '', bride_district: '', bride_gol: '', bride_photo_url: ''
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

  // 📂 ફાઈલ અપલોડ (સામાન્ય અને લગ્ન બંને માટે)
  const handleFileUpload = async (e: any, type: 'student' | 'groom' | 'bride') => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Math.random()}.${fileExt}`;
      const filePath = `trust-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('trust-documents').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('trust-documents').getPublicUrl(filePath);
      
      if (type === 'student') setStudentForm({ ...studentForm, marksheet_url: data.publicUrl });
      if (type === 'groom') setMarriageForm({ ...marriageForm, groom_photo_url: data.publicUrl });
      if (type === 'bride') setMarriageForm({ ...marriageForm, bride_photo_url: data.publicUrl });

      alert("✅ ફોટો અપલોડ થઈ ગયો!");
    } catch (error: any) {
      alert("Upload Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 🎓 વિદ્યાર્થી રજીસ્ટ્રેશન સબમિટ
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.marksheet_url) return alert("કૃપા કરીને માર્કશીટનો ફોટો અપલોડ કરો.");
    
    setRegLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("લોગીન જરૂરી છે.");

        const { error } = await supabase.from('trust_registrations').insert([{
            user_id: user.id, ...studentForm, event_type: selectedEvent?.title, status: 'Pending'
        }]);

        if (error) throw error;
        await supabase.from('trust_events').update({ attendees_count: (selectedEvent?.attendees_count || 0) + 1 }).eq('id', selectedEvent?.id);
        
        alert(`સફળતાપૂર્વક રજીસ્ટ્રેશન થઈ ગયું છે! 🙏`);
        setShowRegModal(false);
        setStudentForm({ full_name: '', sub_surname: '', village: '', taluko: '', district: '', gol: '', school_college: '', percentage: '', passing_year: '', marksheet_url: '', mobile: '' });
    } catch (error: any) { alert('Error: ' + error.message); } 
    finally { setRegLoading(false); }
  };

  // 💍 સમૂહ લગ્ન રજીસ્ટ્રેશન સબમિટ
  const handleMarriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marriageForm.groom_photo_url || !marriageForm.bride_photo_url) return alert("કૃપા કરીને વર અને કન્યા બંનેના ફોટા અપલોડ કરો.");

    setRegLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("લોગીન જરૂરી છે.");

        const { error } = await supabase.from('samuh_lagan_registrations').insert([{
            user_id: user.id, ...marriageForm, status: 'Pending'
        }]);

        if (error) throw error;
        await supabase.from('trust_events').update({ attendees_count: (selectedEvent?.attendees_count || 0) + 1 }).eq('id', selectedEvent?.id);

        alert(`લગ્ન રજીસ્ટ્રેશન સફળતાપૂર્વક થઈ ગયું છે! 🎉`);
        setShowRegModal(false);
        // Reset form
        setMarriageForm({
            groom_name: '', groom_father: '', groom_mother: '', groom_peta_atak: '', groom_village: '', groom_taluka: '', groom_district: '', groom_gol: '', groom_photo_url: '',
            bride_name: '', bride_father: '', bride_mother: '', bride_peta_atak: '', bride_village: '', bride_taluka: '', bride_district: '', bride_gol: '', bride_photo_url: ''
        });
    } catch (error: any) { alert('Error: ' + error.message); } 
    finally { setRegLoading(false); }
  };

  // 💡 Check if event is Mass Marriage
  const isMarriageEvent = selectedEvent?.title.includes('સમૂહ લગ્ન') || selectedEvent?.title.includes('Samuh Lagan');

  const handleSuggestionSubmit = async () => {
    if (!suggestion.trim()) return alert("લખો.");
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("લોગીન કરો.");
      await supabase.from('trust_suggestions').insert([{ user_id: user.id, message: suggestion }]);
      alert("સૂચન મોકલાઈ ગયું!"); setSuggestion('');
    } catch (error: any) { alert("Error: " + error.message); } 
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
        <div className="grid grid-cols-2 gap-4">
          {sections.map((section, index) => (
            <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-3 shadow-md`}><section.icon className="w-6 h-6 text-white" strokeWidth={2.5} /></div>
                <h3 className="font-bold text-gray-700 text-sm font-gujarati">{section.title}</h3>
            </div>
          ))}
        </div>

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
                <button onClick={() => { setSelectedEvent(event); setShowRegModal(true); }} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg font-gujarati">
                    {event.title.includes('સમૂહ લગ્ન') ? 'લગ્ન માટે રજીસ્ટ્રેશન કરો 💍' : 'નામ નોંધાવો (Register)'}
                </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 font-gujarati"><MessageSquare className="text-blue-600" /> યુવાનોનું મંતવ્ય</h3>
          <textarea value={suggestion} onChange={(e) => setSuggestion(e.target.value)} placeholder="તમારા વિચારો લખો..." rows={3} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-700 font-gujarati" />
          <button onClick={handleSuggestionSubmit} disabled={submitting} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg font-gujarati">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} <span>મોકલો</span>
          </button>
        </div>
      </div>

      {/* ✅ ડાયનેમિક મોડલ (શરત પ્રમાણે ફોર્મ બદલાશે) */}
      <AnimatePresence>
        {showRegModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative my-8"
            >
              <button onClick={() => setShowRegModal(false)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center font-gujarati">
                  {isMarriageEvent ? '💍 સમૂહ લગ્ન રજીસ્ટ્રેશન' : '🎓 વિદ્યાર્થી રજીસ્ટ્રેશન'}
              </h2>

              {/* 💍 FORM: MARRIAGE */}
              {isMarriageEvent ? (
                  <form onSubmit={handleMarriageSubmit} className="space-y-6 font-gujarati">
                      {/* વર પક્ષ */}
                      <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100">
                          <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2"><User size={20}/> વર પક્ષ</h3>
                          <div className="space-y-3">
                              <input required placeholder="વર નું નામ" className="input-box" value={marriageForm.groom_name} onChange={e => setMarriageForm({...marriageForm, groom_name: e.target.value})}/>
                              <input required placeholder="વર ના પિતા નું નામ" className="input-box" value={marriageForm.groom_father} onChange={e => setMarriageForm({...marriageForm, groom_father: e.target.value})}/>
                              <input required placeholder="વરની માતા નું નામ" className="input-box" value={marriageForm.groom_mother} onChange={e => setMarriageForm({...marriageForm, groom_mother: e.target.value})}/>
                              <div className="grid grid-cols-2 gap-3">
                                  <input required placeholder="પેટા અટક" className="input-box" value={marriageForm.groom_peta_atak} onChange={e => setMarriageForm({...marriageForm, groom_peta_atak: e.target.value})}/>
                                  <input required placeholder="ગોળ" className="input-box" value={marriageForm.groom_gol} onChange={e => setMarriageForm({...marriageForm, groom_gol: e.target.value})}/>
                              </div>
                              <input required placeholder="વરનું ગામ" className="input-box" value={marriageForm.groom_village} onChange={e => setMarriageForm({...marriageForm, groom_village: e.target.value})}/>
                              <div className="grid grid-cols-2 gap-3">
                                  <input required placeholder="તાલુકો" className="input-box" value={marriageForm.groom_taluka} onChange={e => setMarriageForm({...marriageForm, groom_taluka: e.target.value})}/>
                                  <input required placeholder="જીલ્લો" className="input-box" value={marriageForm.groom_district} onChange={e => setMarriageForm({...marriageForm, groom_district: e.target.value})}/>
                              </div>
                              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-200 cursor-pointer">
                                  {uploading ? <Loader2 className="animate-spin text-blue-500"/> : <Camera className="text-blue-500"/>}
                                  <span className="text-sm text-gray-500">{marriageForm.groom_photo_url ? 'વરનો ફોટો અપલોડ છે ✅' : 'વરનો પાસપોર્ટ ફોટો'}</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'groom')}/>
                              </label>
                          </div>
                      </div>

                      {/* કન્યા પક્ષ */}
                      <div className="bg-pink-50 p-5 rounded-3xl border border-pink-100">
                          <h3 className="font-bold text-pink-800 mb-4 flex items-center gap-2"><Heart size={20}/> કન્યા પક્ષ</h3>
                          <div className="space-y-3">
                              <input required placeholder="કન્યા નું નામ" className="input-box focus:ring-pink-500" value={marriageForm.bride_name} onChange={e => setMarriageForm({...marriageForm, bride_name: e.target.value})}/>
                              <input required placeholder="કન્યા ના પિતા નું નામ" className="input-box focus:ring-pink-500" value={marriageForm.bride_father} onChange={e => setMarriageForm({...marriageForm, bride_father: e.target.value})}/>
                              <input required placeholder="કન્યાની માતા નું નામ" className="input-box focus:ring-pink-500" value={marriageForm.bride_mother} onChange={e => setMarriageForm({...marriageForm, bride_mother: e.target.value})}/>
                              <div className="grid grid-cols-2 gap-3">
                                  <input required placeholder="પેટા અટક" className="input-box focus:ring-pink-500" value={marriageForm.bride_peta_atak} onChange={e => setMarriageForm({...marriageForm, bride_peta_atak: e.target.value})}/>
                                  <input required placeholder="ગોળ" className="input-box focus:ring-pink-500" value={marriageForm.bride_gol} onChange={e => setMarriageForm({...marriageForm, bride_gol: e.target.value})}/>
                              </div>
                              <input required placeholder="કન્યાનું ગામ" className="input-box focus:ring-pink-500" value={marriageForm.bride_village} onChange={e => setMarriageForm({...marriageForm, bride_village: e.target.value})}/>
                              <div className="grid grid-cols-2 gap-3">
                                  <input required placeholder="તાલુકો" className="input-box focus:ring-pink-500" value={marriageForm.bride_taluka} onChange={e => setMarriageForm({...marriageForm, bride_taluka: e.target.value})}/>
                                  <input required placeholder="જીલ્લો" className="input-box focus:ring-pink-500" value={marriageForm.bride_district} onChange={e => setMarriageForm({...marriageForm, bride_district: e.target.value})}/>
                              </div>
                              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-pink-200 cursor-pointer">
                                  {uploading ? <Loader2 className="animate-spin text-pink-500"/> : <Camera className="text-pink-500"/>}
                                  <span className="text-sm text-gray-500">{marriageForm.bride_photo_url ? 'કન્યાનો ફોટો અપલોડ છે ✅' : 'કન્યાનો પાસપોર્ટ ફોટો'}</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'bride')}/>
                              </label>
                          </div>
                      </div>

                      <button disabled={regLoading || uploading} className="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all">
                          {regLoading ? 'Wait...' : 'રજીસ્ટ્રેશન કન્ફર્મ કરો ✨'}
                      </button>
                  </form>
              ) : (
                  /* 🎓 FORM: STUDENT (Existing) */
                  <form onSubmit={handleStudentSubmit} className="space-y-4 font-gujarati">
                    <input required placeholder="વિદ્યાર્થીનું પૂરું નામ" className="input-box" value={studentForm.full_name} onChange={e => setStudentForm({...studentForm, full_name: e.target.value})}/>
                    <div className="grid grid-cols-2 gap-3">
                        <input required placeholder="પેટા અટક" className="input-box" value={studentForm.sub_surname} onChange={e => setStudentForm({...studentForm, sub_surname: e.target.value})}/>
                        <input required placeholder="ગોળ" className="input-box" value={studentForm.gol} onChange={e => setStudentForm({...studentForm, gol: e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <input required placeholder="ગામ" className="input-box" value={studentForm.village} onChange={e => setStudentForm({...studentForm, village: e.target.value})}/>
                        <input required placeholder="તાલુકો" className="input-box" value={studentForm.taluko} onChange={e => setStudentForm({...studentForm, taluko: e.target.value})}/>
                        <input required placeholder="જિલ્લો" className="input-box" value={studentForm.district} onChange={e => setStudentForm({...studentForm, district: e.target.value})}/>
                    </div>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-4 text-gray-400" />
                      <input required type="tel" maxLength={10} placeholder="મોબાઈલ નંબર" className="input-box pl-12" value={studentForm.mobile} onChange={e => setStudentForm({...studentForm, mobile: e.target.value.replace(/\D/g, '')})}/>
                    </div>
                    <input required placeholder="સ્કૂલ/કોલેજ નું નામ" className="input-box" value={studentForm.school_college} onChange={e => setStudentForm({...studentForm, school_college: e.target.value})}/>
                    <div className="grid grid-cols-2 gap-3">
                        <input required type="number" step="0.01" placeholder="ટકાવારી (%)" className="input-box" value={studentForm.percentage} onChange={e => setStudentForm({...studentForm, percentage: e.target.value})}/>
                        <input required placeholder="પાસીઈંગ યર" className="input-box" value={studentForm.passing_year} onChange={e => setStudentForm({...studentForm, passing_year: e.target.value})}/>
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center bg-gray-50">
                        <input type="file" id="marksheet" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'student')} />
                        <label htmlFor="marksheet" className="cursor-pointer flex flex-col items-center gap-2">
                            {uploading ? <Loader2 className="animate-spin text-emerald-500" /> : (
                                studentForm.marksheet_url ? <img src={studentForm.marksheet_url} className="h-24 rounded shadow" /> : 
                                <><Upload className="text-gray-400" /> <span className="text-sm text-gray-500 font-medium">માર્કશીટનો ફોટો અપલોડ કરો</span></>
                            )}
                        </label>
                    </div>
                    <button disabled={regLoading || uploading} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg flex justify-center items-center gap-2 active:scale-95 transition-all">
                        {regLoading ? <Loader2 className="animate-spin"/> : <Send size={20}/>} સબમિટ કરો
                    </button>
                  </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
      
      {/* CSS Utility Class for Inputs */}
      <style>{`
        .input-box {
            width: 100%;
            padding: 1rem;
            background-color: #f9fafb;
            border-radius: 1rem;
            border: none;
            outline: none;
            transition: all 0.2s;
        }
        .input-box:focus {
            ring: 2px;
            ring-color: #10b981;
            background-color: #ffffff;
        }
      `}</style>
    </div>
  );
}