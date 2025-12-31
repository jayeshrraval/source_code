import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Phone, LogOut, Camera, ChevronRight, 
  Heart, Users, FileText, Settings, Loader2, Save, Calendar 
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabaseClient';
// ✅ નવો ઈમ્પોર્ટ: ઈમેજ કોમ્પ્રેસ કરવા માટે
import imageCompression from 'browser-image-compression';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // User State
  const [userSession, setUserSession] = useState(null);
  const [profile, setProfile] = useState({
    id: '',
    full_name: '',
    mobile: '',
    avatar_url: '',
    dob: '' 
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/'); 
        return;
      }
      setUserSession(user);

      // Fetch Profile Data
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          id: data.id,
          full_name: data.full_name || '',
          mobile: data.mobile || user.email?.split('@')[0] || '',
          avatar_url: data.avatar_url || '',
          dob: data.dob || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // 📤 Logout Function
  const handleLogout = async () => {
    if (confirm('શું તમે લોગ આઉટ કરવા માંગો છો?')) {
        await supabase.auth.signOut();
        navigate('/');
    }
  };

  // 📸 Image Upload (Updated with Compression)
  const handleImageUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      // --- 📉 COMPRESSION LOGIC START (100KB Limit) ---
      const options = {
        maxSizeMB: 0.1,          // 0.1 MB = 100 KB
        maxWidthOrHeight: 1024,  // ફોટો રીસાઈઝ થશે
        useWebWorker: true,
      };

      console.log(`Original Size: ${file.size / 1024} KB`);
      const compressedFile = await imageCompression(file, options);
      console.log(`Compressed Size: ${compressedFile.size / 1024} KB`);
      // --- 📉 COMPRESSION LOGIC END ---

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      // ✅ Upload compressedFile instead of file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      await updateProfileInDB({ avatar_url: publicUrl });
      
      alert('પ્રોફાઈલ ફોટો અપડેટ થઈ ગયો!');

    } catch (error) {
      alert('ફોટો અપલોડમાં ભૂલ છે.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // 💾 Save Details (Name + DOB)
  const handleSaveDetails = async () => {
    setSaving(true);
    await updateProfileInDB({ 
        full_name: profile.full_name,
        dob: profile.dob 
    });
    setSaving(false);
    alert('પ્રોફાઈલ વિગતો અપડેટ થઈ ગઈ!');
  };

  // Helper to update DB
  const updateProfileInDB = async (updates) => {
    if (!userSession) return;
    const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userSession.id);
    
    if (error) console.error(error);
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 text-deep-blue animate-spin" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header / Cover */}
      <div className="bg-gradient-to-br from-deep-blue to-[#1A8FA3] pb-24 pt-10 px-6 rounded-b-[2.5rem] shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-white font-bold font-gujarati text-2xl">મારું એકાઉન્ટ</h1>
            <button onClick={() => navigate('/settings')} className="p-2 bg-white/20 rounded-full">
                <Settings className="w-5 h-5 text-white" />
            </button>
        </div>
        
        {/* Profile Card Info */}
        <div className="flex flex-col items-center">
             <div className="relative group">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                        </div>
                    )}
                </div>
                {/* Upload Button */}
                <label className="absolute bottom-0 right-0 bg-royal-gold p-2 rounded-full shadow-lg cursor-pointer active:scale-90 transition-transform">
                    {uploading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
             </div>
             
             <div className="mt-4 text-center w-full max-w-xs space-y-3">
                
                {/* Editable Name Input */}
                <div className="flex items-center justify-center space-x-2 bg-white/10 rounded-xl p-1">
                    <input 
                        type="text" 
                        value={profile.full_name} 
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                        className="bg-transparent text-white font-bold text-xl text-center focus:outline-none w-full font-gujarati placeholder-white/50"
                        placeholder="તમારું નામ"
                    />
                </div>

                {/* Mobile Display */}
                <p className="text-mint text-sm font-medium flex items-center justify-center">
                    <Phone className="w-3 h-3 mr-1" /> +91 {profile.mobile}
                </p>

                {/* DOB Input */}
                <div className="flex items-center justify-center space-x-2">
                    <div className="flex items-center bg-white/20 px-3 py-1.5 rounded-lg">
                        <Calendar className="w-3 h-3 text-white mr-2" />
                        <input 
                            type="date"
                            value={profile.dob}
                            onChange={(e) => setProfile({...profile, dob: e.target.value})}
                            className="bg-transparent text-white text-sm focus:outline-none font-gujarati"
                            placeholder="જન્મ તારીખ"
                        />
                    </div>
                    {/* Save Button for Name & DOB */}
                    <button onClick={handleSaveDetails} className="p-2 bg-royal-gold rounded-lg shadow-md hover:bg-yellow-500 active:scale-95 transition-all">
                        {saving ? <Loader2 className="w-4 h-4 text-deep-blue animate-spin"/> : <Save className="w-4 h-4 text-deep-blue"/>}
                    </button>
                </div>

             </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="px-6 -mt-10 space-y-4">
        {/* Status Card */}
        <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} className="bg-white p-4 rounded-2xl shadow-md flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-xs font-gujarati">સભ્ય સ્ટેટસ</p>
                <p className="text-deep-blue font-bold font-gujarati">વેરીફાઈડ સભ્ય ✅</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
            </div>
        </motion.div>

        {/* Links */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <MenuItem 
                icon={Heart} 
                title="મારી મેટ્રિમોની પ્રોફાઈલ" 
                subtitle="તમારો બાયોડેટા અને પસંદગીઓ" 
                color="text-pink-500" 
                bg="bg-pink-50"
                onClick={() => navigate('/matrimony')}
            />
            <div className="h-[1px] bg-gray-100 mx-16"></div>
            <MenuItem 
                icon={Users} 
                title="મારો પરિવાર" 
                subtitle="પરિવારની યાદી અને સભ્યો" 
                color="text-deep-blue" 
                bg="bg-blue-50"
                onClick={() => navigate('/family-list')}
            />
            <div className="h-[1px] bg-gray-100 mx-16"></div>
            <MenuItem 
                icon={FileText} 
                title="મારી રિક્વેસ્ટ & ચેટ" 
                subtitle="આવેલી અને મોકલેલી રિક્વેસ્ટ" 
                color="text-purple-500" 
                bg="bg-purple-50"
                onClick={() => navigate('/requests')}
            />
        </div>

        {/* Logout Button */}
        <button 
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-transform"
        >
            <LogOut className="w-5 h-5" />
            <span>લોગ આઉટ કરો</span>
        </button>

        <p className="text-center text-gray-400 text-xs mt-4">Version 1.0.0 • Yogi Samaj App</p>
      </div>

      <BottomNav />
    </div>
  );
}

// Helper Component for Menu Items
function MenuItem({ icon: Icon, title, subtitle, color, bg, onClick }) {
    return (
        <button onClick={onClick} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                    <h3 className="text-gray-800 font-bold font-gujarati text-sm">{title}</h3>
                    <p className="text-gray-400 text-xs font-gujarati">{subtitle}</p>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>
    );
}