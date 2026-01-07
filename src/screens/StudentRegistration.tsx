import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, Send, Phone } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function StudentRegistration() {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event; // TrustScreen પરથી આવેલો ડેટા

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', sub_surname: '', village: '', taluko: '', district: '', gol: '', 
    school_college: '', percentage: '', passing_year: '', marksheet_url: '', mobile: ''
  });

  const handleFileUpload = async (e: any) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `student-${Math.random()}.${fileExt}`;
      const filePath = `trust-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('trust-documents').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('trust-documents').getPublicUrl(filePath);
      setFormData({ ...formData, marksheet_url: data.publicUrl });
      alert("✅ માર્કશીટ અપલોડ થઈ ગઈ!");
    } catch (error: any) {
      alert("Upload Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.marksheet_url) return alert("કૃપા કરીને માર્કશીટ અપલોડ કરો.");
    
    setLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("લોગીન જરૂરી છે.");

        const { error } = await supabase.from('trust_registrations').insert([{
            user_id: user.id, ...formData, event_type: event?.title || 'General Registration', status: 'Pending'
        }]);

        if (error) throw error;
        
        // જો ઈવેન્ટ હોય તો કાઉન્ટ વધારો
        if (event?.id) {
            await supabase.from('trust_events').update({ attendees_count: (event.attendees_count || 0) + 1 }).eq('id', event.id);
        }
        
        alert(`સફળતાપૂર્વક રજીસ્ટ્રેશન થઈ ગયું છે! 🙏`);
        navigate('/trust'); // પાછા ફરો
    } catch (error: any) { alert('Error: ' + error.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-gujarati">
      {/* Header */}
      <div className="bg-emerald-600 p-6 pt-12 rounded-b-[2rem] shadow-lg flex items-center gap-4 text-white">
        <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full"><ArrowLeft size={24}/></button>
        <div>
            <h1 className="text-xl font-bold">વિદ્યાર્થી રજીસ્ટ્રેશન</h1>
            <p className="text-emerald-100 text-xs">{event?.title || 'Saraswati Sanman'}</p>
        </div>
      </div>

      <div className="p-6 -mt-4">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-50">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="વિદ્યાર્થીનું પૂરું નામ" className="input-box" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})}/>
                <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="પેટા અટક" className="input-box" value={formData.sub_surname} onChange={e => setFormData({...formData, sub_surname: e.target.value})}/>
                    <input required placeholder="ગોળ" className="input-box" value={formData.gol} onChange={e => setFormData({...formData, gol: e.target.value})}/>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <input required placeholder="ગામ" className="input-box" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})}/>
                    <input required placeholder="તાલુકો" className="input-box" value={formData.taluko} onChange={e => setFormData({...formData, taluko: e.target.value})}/>
                    <input required placeholder="જિલ્લો" className="input-box" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}/>
                </div>
                <div className="relative">
                    <Phone size={18} className="absolute left-4 top-4 text-gray-400" />
                    <input required type="tel" maxLength={10} placeholder="મોબાઈલ નંબર" className="input-box pl-12" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})}/>
                </div>
                <input required placeholder="સ્કૂલ/કોલેજ નું નામ" className="input-box" value={formData.school_college} onChange={e => setFormData({...formData, school_college: e.target.value})}/>
                <div className="grid grid-cols-2 gap-3">
                    <input required type="number" step="0.01" placeholder="ટકાવારી (%)" className="input-box" value={formData.percentage} onChange={e => setFormData({...formData, percentage: e.target.value})}/>
                    <input required placeholder="પાસીઈંગ યર" className="input-box" value={formData.passing_year} onChange={e => setFormData({...formData, passing_year: e.target.value})}/>
                </div>
                
                <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-2xl p-6 text-center cursor-pointer relative">
                    <input type="file" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" onChange={handleFileUpload} accept="image/*" />
                    <div className="flex flex-col items-center gap-2 text-emerald-600">
                        {uploading ? <Loader2 className="animate-spin"/> : formData.marksheet_url ? <span className="font-bold">✅ માર્કશીટ અપલોડ છે</span> : <><Upload/> <span>માર્કશીટ અપલોડ કરો</span></>}
                    </div>
                </div>

                <button disabled={loading || uploading} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg flex justify-center items-center gap-2 active:scale-95 transition-all">
                    {loading ? <Loader2 className="animate-spin"/> : <Send size={20}/>} ફોર્મ સબમિટ કરો
                </button>
            </form>
        </div>
      </div>
      <style>{`.input-box { width: 100%; padding: 1rem; background-color: #f8fafc; border-radius: 1rem; outline: none; border: 1px solid #e2e8f0; font-weight: 600; color: #334155; } .input-box:focus { border-color: #10b981; background-color: #fff; }`}</style>
    </div>
  );
}