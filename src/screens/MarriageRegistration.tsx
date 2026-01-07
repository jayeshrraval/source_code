import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Heart, Camera, Loader2, Send, Phone } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function MarriageRegistration() {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    groom_name: '', groom_father: '', groom_mother: '', groom_peta_atak: '', groom_village: '', groom_taluka: '', groom_district: '', groom_gol: '', groom_mobile: '', groom_photo_url: '',
    bride_name: '', bride_father: '', bride_mother: '', bride_peta_atak: '', bride_village: '', bride_taluka: '', bride_district: '', bride_gol: '', bride_mobile: '', bride_photo_url: ''
  });

  const handleFileUpload = async (e: any, type: 'groom' | 'bride') => {
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
      
      if (type === 'groom') setFormData({ ...formData, groom_photo_url: data.publicUrl });
      if (type === 'bride') setFormData({ ...formData, bride_photo_url: data.publicUrl });

      alert("✅ ફોટો અપલોડ થઈ ગયો!");
    } catch (error: any) { alert("Upload Error: " + error.message); } 
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.groom_photo_url || !formData.bride_photo_url) return alert("વર અને કન્યા બંનેના ફોટા જરૂરી છે.");
    if (formData.groom_mobile.length < 10 || formData.bride_mobile.length < 10) return alert("કૃપા કરીને સાચો મોબાઈલ નંબર નાખો.");

    setLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("લોગીન જરૂરી છે.");

        const { error } = await supabase.from('samuh_lagan_registrations').insert([{
            user_id: user.id, ...formData, status: 'Pending'
        }]);

        if (error) throw error;
        
        if (event?.id) {
            await supabase.from('trust_events').update({ attendees_count: (event.attendees_count || 0) + 1 }).eq('id', event.id);
        }

        alert(`લગ્ન રજીસ્ટ્રેશન સફળતાપૂર્વક થઈ ગયું છે! 🎉`);
        navigate('/trust');
    } catch (error: any) { alert('Error: ' + error.message); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-gujarati">
      <div className="bg-gradient-to-r from-pink-600 to-rose-500 p-6 pt-12 rounded-b-[2rem] shadow-lg flex items-center gap-4 text-white">
        <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full"><ArrowLeft size={24}/></button>
        <div>
            <h1 className="text-xl font-bold">સમૂહ લગ્ન રજીસ્ટ્રેશન 💍</h1>
            <p className="text-pink-100 text-xs">{event?.title || 'Samuh Lagan 2025'}</p>
        </div>
      </div>

      <div className="p-6 -mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Groom Section */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2 text-lg"><User className="fill-blue-100"/> વર પક્ષ</h3>
                <div className="space-y-3">
                    <input required placeholder="વર નું નામ" className="input-box" value={formData.groom_name} onChange={e => setFormData({...formData, groom_name: e.target.value})}/>
                    <input required placeholder="પિતાનું નામ" className="input-box" value={formData.groom_father} onChange={e => setFormData({...formData, groom_father: e.target.value})}/>
                    <input required placeholder="માતાનું નામ" className="input-box" value={formData.groom_mother} onChange={e => setFormData({...formData, groom_mother: e.target.value})}/>
                    
                    <div className="relative">
                        <Phone size={18} className="absolute left-4 top-4 text-gray-400" />
                        <input required type="tel" maxLength={10} placeholder="વર પક્ષનો મોબાઈલ નંબર" className="input-box pl-12" value={formData.groom_mobile} onChange={e => setFormData({...formData, groom_mobile: e.target.value.replace(/\D/g, '')})}/>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input required placeholder="પેટા અટક" className="input-box" value={formData.groom_peta_atak} onChange={e => setFormData({...formData, groom_peta_atak: e.target.value})}/>
                        <input required placeholder="ગોળ" className="input-box" value={formData.groom_gol} onChange={e => setFormData({...formData, groom_gol: e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <input required placeholder="ગામ" className="input-box" value={formData.groom_village} onChange={e => setFormData({...formData, groom_village: e.target.value})}/>
                        <input required placeholder="તાલુકો" className="input-box" value={formData.groom_taluka} onChange={e => setFormData({...formData, groom_taluka: e.target.value})}/>
                        <input required placeholder="જિલ્લો" className="input-box" value={formData.groom_district} onChange={e => setFormData({...formData, groom_district: e.target.value})}/>
                    </div>
                    <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                        {uploading ? <Loader2 className="animate-spin text-blue-600"/> : <Camera className="text-blue-600"/>}
                        <span className="text-sm text-blue-800 font-bold">{formData.groom_photo_url ? 'વરનો ફોટો ✅' : 'વરનો ફોટો અપલોડ કરો'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'groom')}/>
                    </label>
                </div>
            </div>

            {/* Bride Section */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-pink-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-pink-500"></div>
                <h3 className="font-bold text-pink-800 mb-4 flex items-center gap-2 text-lg"><Heart className="fill-pink-100"/> કન્યા પક્ષ</h3>
                <div className="space-y-3">
                    <input required placeholder="કન્યા નું નામ" className="input-box focus:border-pink-500" value={formData.bride_name} onChange={e => setFormData({...formData, bride_name: e.target.value})}/>
                    <input required placeholder="પિતાનું નામ" className="input-box focus:border-pink-500" value={formData.bride_father} onChange={e => setFormData({...formData, bride_father: e.target.value})}/>
                    <input required placeholder="માતાનું નામ" className="input-box focus:border-pink-500" value={formData.bride_mother} onChange={e => setFormData({...formData, bride_mother: e.target.value})}/>
                    
                    <div className="relative">
                        <Phone size={18} className="absolute left-4 top-4 text-gray-400" />
                        <input required type="tel" maxLength={10} placeholder="કન્યા પક્ષનો મોબાઈલ નંબર" className="input-box pl-12 focus:border-pink-500" value={formData.bride_mobile} onChange={e => setFormData({...formData, bride_mobile: e.target.value.replace(/\D/g, '')})}/>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input required placeholder="પેટા અટક" className="input-box focus:border-pink-500" value={formData.bride_peta_atak} onChange={e => setFormData({...formData, bride_peta_atak: e.target.value})}/>
                        <input required placeholder="ગોળ" className="input-box focus:border-pink-500" value={formData.bride_gol} onChange={e => setFormData({...formData, bride_gol: e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <input required placeholder="ગામ" className="input-box focus:border-pink-500" value={formData.bride_village} onChange={e => setFormData({...formData, bride_village: e.target.value})}/>
                        <input required placeholder="તાલુકો" className="input-box focus:border-pink-500" value={formData.bride_taluka} onChange={e => setFormData({...formData, bride_taluka: e.target.value})}/>
                        <input required placeholder="જિલ્લો" className="input-box focus:border-pink-500" value={formData.bride_district} onChange={e => setFormData({...formData, bride_district: e.target.value})}/>
                    </div>
                    <label className="flex items-center gap-3 p-4 bg-pink-50 rounded-2xl border border-pink-100 cursor-pointer hover:bg-pink-100 transition-colors">
                        {uploading ? <Loader2 className="animate-spin text-pink-600"/> : <Camera className="text-pink-600"/>}
                        <span className="text-sm text-pink-800 font-bold">{formData.bride_photo_url ? 'કન્યાનો ફોટો ✅' : 'કન્યાનો ફોટો અપલોડ કરો'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'bride')}/>
                    </label>
                </div>
            </div>

            <button disabled={loading || uploading} className="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin"/> : <Send size={20}/>} રજીસ્ટ્રેશન કન્ફર્મ કરો
            </button>
        </form>
      </div>
      <style>{`.input-box { width: 100%; padding: 1rem; background-color: #f8fafc; border-radius: 1rem; outline: none; border: 1px solid #e2e8f0; font-weight: 600; color: #334155; } .input-box:focus { border-color: #3b82f6; background-color: #fff; }`}</style>
    </div>
  );
}