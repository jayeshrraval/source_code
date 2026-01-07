import React, { useState } from 'react';
import { Trophy, GraduationCap, Briefcase, ChevronRight, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabaseClient'; // Ensure path is correct

export default function ScholarshipScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'policy' | 'apply'>('policy');
  const [loading, setLoading] = useState(false);

  // Application Form State
  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    category: 'Std 10',
    percentage: '',
    institute_name: '',
    result_image_url: ''
  });

  const handleApply = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('અરજી કરવા માટે લોગીન કરવું જરૂરી છે.');
        return;
      }

      if (!formData.full_name || !formData.percentage) {
        alert('કૃપા કરીને બધી વિગતો ભરો.');
        return;
      }

      const { error } = await supabase
        .from('scholarship_applications')
        .insert([{
          user_id: user.id,
          ...formData,
          percentage: parseFloat(formData.percentage)
        }]);

      if (error) throw error;

      alert('તમારી સ્કોલરશીપ અરજી સફળતાપૂર્વક મોકલાઈ ગઈ છે!');
      // Reset form
      setFormData({ full_name: '', mobile: '', category: 'Std 10', percentage: '', institute_name: '', result_image_url: '' });
      setActiveTab('policy'); 
    } catch (error) {
      console.error(error);
      alert('ભૂલ આવી છે. ફરી પ્રયત્ન કરો.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: any) => {
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        // Upload logic here (Assuming 'images' bucket exists from previous steps)
        const fileExt = file.name.split('.').pop();
        const fileName = `scholarship/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

        setFormData({ ...formData, result_image_url: publicUrl });
        alert("ફાઈલ અપલોડ થઈ ગઈ! ✅");

    } catch (error) {
        console.error(error);
        alert("ફોટો અપલોડમાં ભૂલ છે. ફરી પ્રયત્ન કરો.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 safe-area-top px-6 py-6">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)} className="p-1 bg-white/20 rounded-full">
            <ChevronRight className="w-6 h-6 text-white rotate-180" />
          </button>
          <div>
            <h1 className="text-white font-gujarati font-bold text-xl">સમાજ સ્કોલરશીપ યોજના</h1>
            <p className="text-indigo-100 text-xs font-gujarati">શિક્ષણ અને સિદ્ધિ માટે પ્રોત્સાહન</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white shadow-sm mb-4 sticky top-0 z-10">
        <button
          onClick={() => setActiveTab('policy')}
          className={`flex-1 py-4 font-gujarati font-bold text-center transition-colors ${
            activeTab === 'policy' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500'
          }`}
        >
          યોજનાની માહિતી
        </button>
        <button
          onClick={() => setActiveTab('apply')}
          className={`flex-1 py-4 font-gujarati font-bold text-center transition-colors ${
            activeTab === 'apply' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500'
          }`}
        >
          અરજી કરો
        </button>
      </div>

      {/* POLICY CONTENT - TAB 1 */}
      {activeTab === 'policy' && (
        <div className="px-4 space-y-6">
          
          {/* Section 1: School */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 font-gujarati">વિભાગ 1: શાળાકીય શિક્ષણ</h2>
            </div>
            
            <div className="space-y-4">
              <PriceCard title="ધોરણ 10" ranks={['10,000', '5,000', '3,000']} />
              <PriceCard title="ધોરણ 11" ranks={['5,000', '2,500', '1,500']} />
              <PriceCard title="ધોરણ 12" ranks={['10,000', '5,000', '3,000']} />
            </div>
            <p className="mt-3 text-xs text-gray-500 font-gujarati italic">* ક્રમ (Rank) સમાજની અંદર નક્કી કરવામાં આવશે.</p>
          </motion.div>

          {/* Section 2: Higher Education */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-2xl shadow-sm border border-purple-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 font-gujarati">વિભાગ 2: ઉચ્ચ શિક્ષણ (12 પછી)</h2>
            </div>

            <div className="space-y-4">
              <PriceCard title="ડિપ્લોમા અભ્યાસ" ranks={['15,000', '8,000', '5,000']} />
              <PriceCard title="ગ્રેજ્યુએશન (BA/BCom/BE..)" ranks={['20,000', '10,000', '7,000']} />
              <PriceCard title="પ્રોફેશનલ કોર્સ (CA/CS/MBBS..)" ranks={['25,000', '15,000', '10,000']} />
              <PriceCard title="પોસ્ટ ગ્રેજ્યુએશન (MBA/MCA..)" ranks={['30,000', '20,000', '15,000']} />
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100 flex justify-between items-center shadow-sm">
                <span className="font-gujarati font-bold text-purple-900">PhD / Research</span>
                <span className="font-bold text-purple-700 bg-white px-3 py-1 rounded-lg shadow-sm">₹50,000</span>
              </div>
            </div>
          </motion.div>

          {/* Section 3: Govt Jobs */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-5 rounded-2xl shadow-sm border border-green-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 font-gujarati">વિભાગ 3: સરકારી નોકરી</h2>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-2xl text-white mb-6 shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-1 font-gujarati">Government Job Bonus</h3>
                <p className="opacity-90 font-gujarati text-sm mb-3">પરીક્ષા પાસ કરી નોકરી મેળવનારને</p>
                <div className="text-4xl font-bold">₹11,000 <span className="text-sm font-normal opacity-80">(એકમુષ્ટ)</span></div>
              </div>
              <div className="absolute -right-6 -bottom-6 bg-white/10 w-32 h-32 rounded-full blur-2xl"></div>
            </div>

            <ul className="space-y-3 bg-gray-50 p-4 rounded-xl">
              <li className="flex items-center text-sm text-gray-700 font-gujarati">
                <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" /> સમાજનો સભ્ય હોવો ફરજિયાત
              </li>
              <li className="flex items-center text-sm text-gray-700 font-gujarati">
                <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" /> Government Job join કરેલ હોવી જોઈએ
              </li>
              <li className="flex items-center text-sm text-gray-700 font-gujarati">
                <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" /> પ્રથમ વખત નોકરી પ્રાપ્ત થયેલ હોવી જોઈએ
              </li>
              <li className="flex items-center text-sm text-red-600 font-gujarati font-medium bg-red-50 p-2 rounded-lg">
                <span className="mr-3">❌</span> Private / Contract Job માન્ય નથી
              </li>
            </ul>
          </motion.div>
          
          <div className="h-4"></div>
        </div>
      )}

      {/* APPLY FORM - TAB 2 */}
      {activeTab === 'apply' && (
        <div className="px-6 py-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-sm space-y-5 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 font-gujarati">સ્કોલરશીપ અરજી ફોર્મ</h2>
            <p className="text-sm text-gray-500 font-gujarati -mt-3">કૃપા કરીને સાચી માહિતી ભરો.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-gujarati mb-1.5">વિદ્યાર્થીનું પૂરું નામ</label>
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-gujarati focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="દા.ત. પટેલ આરવ કુમાર" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-gujarati mb-1.5">મોબાઈલ નંબર</label>
                <input 
                  type="number" 
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-gujarati focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="98765xxxxx" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-gujarati mb-1.5">કેટેગરી પસંદ કરો</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-gujarati focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option>Std 10</option>
                  <option>Std 11</option>
                  <option>Std 12</option>
                  <option>Diploma</option>
                  <option>Graduation</option>
                  <option>Professional Course</option>
                  <option>Post Graduation</option>
                  <option>PhD / Research</option>
                  <option>Govt Job Selection</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-gujarati mb-1.5">ટકાવારી (%)</label>
                  <input 
                    type="number" 
                    value={formData.percentage}
                    onChange={(e) => setFormData({...formData, percentage: e.target.value})}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-gujarati focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="85.50" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-gujarati mb-1.5">શાળા/કોલેજ</label>
                  <input 
                    type="text" 
                    value={formData.institute_name}
                    onChange={(e) => setFormData({...formData, institute_name: e.target.value})}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-gujarati focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="સ્કૂલનું નામ" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-gujarati mb-1.5">માર્કશીટ / પ્રૂફ અપલોડ કરો</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 hover:border-indigo-400 transition-all relative cursor-pointer group">
                  <input type="file" accept="image/*,application/pdf" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleImageUpload} />
                  {formData.result_image_url ? (
                      <div className="text-center">
                        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                        <span className="text-green-700 font-bold text-sm">ડોક્યુમેન્ટ અપલોડ થઈ ગયું ✅</span>
                      </div>
                  ) : (
                      <div className="text-center group-hover:scale-105 transition-transform">
                          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
                            <Upload className="w-6 h-6 text-indigo-500" />
                          </div>
                          <span className="text-sm font-gujarati text-gray-600">અહીં ક્લિક કરી ફોટો પસંદ કરો</span>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG or PDF</p>
                      </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={handleApply}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex justify-center items-center mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'અરજી સબમિટ કરો'}
            </button>

          </motion.div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}

// Helper Component for Price Display with better UI
function PriceCard({ title, ranks }: { title: string, ranks: string[] }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
      <h3 className="font-gujarati font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">{title}</h3>
      <div className="grid grid-cols-3 gap-3 text-center">
        <RankBox rank="1st" amount={ranks[0]} color="yellow" />
        <RankBox rank="2nd" amount={ranks[1]} color="gray" />
        <RankBox rank="3rd" amount={ranks[2]} color="orange" />
      </div>
    </div>
  );
}

function RankBox({ rank, amount, color }: { rank: string, amount: string, color: 'yellow' | 'gray' | 'orange' }) {
  const colorClasses = {
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  };

  return (
    <div className={`p-2 rounded-lg border ${colorClasses[color]} flex flex-col items-center justify-center`}>
      <span className="text-[10px] uppercase font-bold tracking-wider mb-0.5 opacity-70">{rank}</span>
      <span className="text-sm font-bold">₹{amount}</span>
    </div>
  );
}