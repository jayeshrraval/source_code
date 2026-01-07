import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Save, Phone, User, MapPin, Calendar } from 'lucide-react';

export default function SamuhLagnaForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // ફોર્મ ડેટા
  const [formData, setFormData] = useState({
    var_name: '', var_father_name: '', var_mother_name: '', var_sub_caste: '',
    var_mobile: '', var_village: '', var_taluka: '', var_district: '', var_dob: '', var_age: '',
    
    kanya_name: '', kanya_father_name: '', kanya_mother_name: '', kanya_sub_caste: '',
    kanya_mobile: '', kanya_village: '', kanya_taluka: '', kanya_district: '', kanya_dob: '', kanya_age: ''
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    // વેલિડેશન
    if (formData.var_mobile.length !== 10 || formData.kanya_mobile.length !== 10) {
        alert("કૃપા કરીને બંને પક્ષના મોબાઈલ નંબર ૧૦ આંકડાના નાખો.");
        return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("પ્લીઝ લોગીન કરો.");

      const { error } = await supabase.from('samuh_lagna_registrations').insert([
        { ...formData, user_id: user.id }
      ]);

      if (error) throw error;
      alert("તમારું ફોર્મ સફળતાપૂર્વક ભરાઈ ગયું છે! એડમિન સંપર્ક કરશે.");
      navigate(-1); // પાછા જાઓ
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-6 text-white flex items-center gap-4 shadow-lg rounded-b-3xl sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/20 rounded-full"><ArrowLeft size={24} /></button>
        <div>
            <h1 className="text-xl font-bold">સમૂહ લગ્ન રજીસ્ટ્રેશન</h1>
            <p className="text-xs text-white/80">ફોર્મ અંગ્રેજી અથવા ગુજરાતીમાં ભરી શકો છો</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        
        {/* --- વર પક્ષ (GROOM) --- */}
        <div className="bg-white p-5 rounded-2xl shadow-md border-t-4 border-blue-600">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <User className="text-blue-600"/>
            <h2 className="text-lg font-bold text-blue-800">વર પક્ષ (Groom)</h2>
          </div>
          
          <div className="space-y-4">
            <Input name="var_name" label="વરનું પૂરું નામ" placeholder="નામ પિતાનું નામ અટક" onChange={handleChange} />
            
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <Input name="var_mobile" label="વર પક્ષ સંપર્ક નંબર (Mobile)" type="number" placeholder="98XXXXXXXX" onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Input name="var_father_name" label="પિતાનું નામ" onChange={handleChange} />
                <Input name="var_mother_name" label="માતાનું નામ" onChange={handleChange} />
            </div>
            
            <Input name="var_sub_caste" label="પેટા અટક (Sub Caste)" onChange={handleChange} />
            
            <div className="grid grid-cols-2 gap-3">
                <Input name="var_dob" label="જન્મ તારીખ" type="date" onChange={handleChange} />
                <Input name="var_age" label="ઉંમર (Age)" type="number" onChange={handleChange} />
            </div>

            <div className="border-t pt-3 mt-2">
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Address Details</label>
                <Input name="var_village" label="ગામ (Village)" onChange={handleChange} />
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <Input name="var_taluka" label="તાલુકો" onChange={handleChange} />
                    <Input name="var_district" label="જીલ્લો" onChange={handleChange} />
                </div>
            </div>
          </div>
        </div>

        {/* --- કન્યા પક્ષ (BRIDE) --- */}
        <div className="bg-white p-5 rounded-2xl shadow-md border-t-4 border-pink-600">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <User className="text-pink-600"/>
            <h2 className="text-lg font-bold text-pink-800">કન્યા પક્ષ (Bride)</h2>
          </div>
          
          <div className="space-y-4">
            <Input name="kanya_name" label="કન્યાનું પૂરું નામ" placeholder="નામ પિતાનું નામ અટક" onChange={handleChange} />
            
            <div className="bg-pink-50 p-3 rounded-xl border border-pink-100">
                <Input name="kanya_mobile" label="કન્યા પક્ષ સંપર્ક નંબર (Mobile)" type="number" placeholder="98XXXXXXXX" onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Input name="kanya_father_name" label="પિતાનું નામ" onChange={handleChange} />
                <Input name="kanya_mother_name" label="માતાનું નામ" onChange={handleChange} />
            </div>
            
            <Input name="kanya_sub_caste" label="પેટા અટક (Sub Caste)" onChange={handleChange} />
            
            <div className="grid grid-cols-2 gap-3">
                <Input name="kanya_dob" label="જન્મ તારીખ" type="date" onChange={handleChange} />
                <Input name="kanya_age" label="ઉંમર (Age)" type="number" onChange={handleChange} />
            </div>

            <div className="border-t pt-3 mt-2">
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Address Details</label>
                <Input name="kanya_village" label="ગામ (Village)" onChange={handleChange} />
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <Input name="kanya_taluka" label="તાલુકો" onChange={handleChange} />
                    <Input name="kanya_district" label="જીલ્લો" onChange={handleChange} />
                </div>
            </div>
          </div>
        </div>

        <button disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl flex justify-center items-center gap-2 hover:scale-[1.02] transition-transform">
          <Save size={20} /> {loading ? 'સબમિટ થાય છે...' : 'ફોર્મ સબમિટ કરો'}
        </button>
        <p className="text-center text-xs text-gray-400 pb-6">તમારો ડેટા સુરક્ષિત રહેશે.</p>
      </form>
    </div>
  );
}

// Input Component (ડિઝાઈન માટે)
const Input = ({ label, name, type = "text", placeholder, onChange }: any) => (
  <div>
    <label className="text-sm text-gray-700 font-semibold block mb-1.5">{label}</label>
    <input 
      required 
      name={name} 
      type={type} 
      placeholder={placeholder} 
      onChange={onChange}
      className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all" 
    />
  </div>
);