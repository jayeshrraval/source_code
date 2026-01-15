import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Plus, User, GraduationCap, MapPin, 
  Target, Filter, Check, Loader2
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabaseClient';

const studyLevelOptions = [
  { value: 'School', label: 'School' },
  { value: 'College', label: 'College' },
  { value: 'Diploma', label: 'Diploma' },
  { value: 'ITI', label: 'ITI' },
  { value: 'Other', label: 'Other' },
];

export default function StudentProfileScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'register'
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStudyLevel, setFilterStudyLevel] = useState('');
  const [filterGol, setFilterGol] = useState('');

  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    studyLevel: '',
    fieldOfStudy: '',
    currentInstitution: '',
    futureGoal: '',
    isFirstGraduate: false,
    village: '',
    taluko: '',
    district: '',
    gol: '' 
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // 1. Fetch Data on Load & Filter Change
  useEffect(() => {
    fetchStudents();
  }, [filterStudyLevel, filterGol]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('student_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,village.ilike.%${searchQuery}%,field_of_study.ilike.%${searchQuery}%`);
      }
      if (filterStudyLevel) {
        query = query.eq('study_level', filterStudyLevel);
      }
      if (filterGol) {
        query = query.ilike('gol', `%${filterGol}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Fetch Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'પૂરું નામ જરૂરી છે';
    if (!formData.age) errors.age = 'ઉંમર નાખો';
    if (!formData.studyLevel) errors.studyLevel = 'અભ્યાસ લેવલ પસંદ કરો';
    if (!formData.fieldOfStudy) errors.fieldOfStudy = 'વિષય/ક્ષેત્ર લખો';
    if (!formData.currentInstitution.trim()) errors.currentInstitution = 'સંસ્થાનું નામ લખો';
    if (!formData.gol.trim()) errors.gol = 'ગોળ લખવો જરૂરી છે';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 3. Handle Submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("પ્લીઝ લોગીન કરો (Login Required)");

      const { error } = await supabase
        .from('student_profiles')
        .insert([{
            user_id: user.id,
            full_name: formData.fullName,
            age: parseInt(formData.age) || 0,
            study_level: formData.studyLevel,
            field_of_study: formData.fieldOfStudy,
            current_institution: formData.currentInstitution,
            future_goal: formData.futureGoal,
            is_first_graduate: formData.isFirstGraduate,
            village: formData.village,
            taluko: formData.taluko,
            district: formData.district,
            gol: formData.gol
        }]);

      if (error) throw error;

      // Success
      setShowSuccess(true);
      setFormData({
        fullName: '', age: '', studyLevel: '', fieldOfStudy: '', currentInstitution: '',
        futureGoal: '', isFirstGraduate: false, village: '', taluko: '', district: '', gol: ''
      });

      // Hide success popup after 2 sec & switch tab
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab('list');
        fetchStudents();
      }, 2000);

    } catch (error) {
        console.error('Submit Error:', error.message);
        alert(`Error: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-[#1A8FA3] safe-area-top shadow-lg">
        <div className="px-6 py-6 flex items-center space-x-4">
          <button onClick={() => navigate('/education')} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-gujarati font-bold text-xl">વિદ્યાર્થી પ્રોફાઈલ</h1>
            <p className="text-mint text-xs font-medium uppercase tracking-widest">Raval Yogi Samaj Students</p>
          </div>
        </div>

        <div className="flex px-6 pb-4 space-x-4">
          <button 
            onClick={() => setActiveTab('list')} 
            className={`flex-1 py-3 rounded-2xl font-gujarati font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'list' ? 'bg-white text-deep-blue shadow-xl' : 'bg-white/10 text-white'}`}
          >
            <Search size={16} /> પ્રોફાઈલ જુઓ
          </button>
          <button 
            onClick={() => setActiveTab('register')} 
            className={`flex-1 py-3 rounded-2xl font-gujarati font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'register' ? 'bg-white text-deep-blue shadow-xl' : 'bg-white/10 text-white'}`}
          >
            <Plus size={16} /> નવી નોંધણી
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {activeTab === 'list' ? (
          <>
            {/* Search Bar */}
            <div className="flex space-x-3 mb-6">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="નામ, ગામ અથવા વિષય શોધો..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && fetchStudents()} 
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-mint font-gujarati text-sm" 
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`p-3.5 rounded-2xl shadow-sm transition-all ${showFilters ? 'bg-mint text-white' : 'bg-white text-gray-500'}`}
              >
                <Filter size={20} />
              </button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }} 
                  className="bg-white p-5 rounded-2xl shadow-sm mb-6 border border-mint/10 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">અભ્યાસ લેવલ</label>
                      <select 
                        value={filterStudyLevel} 
                        onChange={(e) => setFilterStudyLevel(e.target.value)} 
                        className="w-full p-3 bg-gray-50 border-none rounded-xl text-xs font-bold font-gujarati outline-none"
                      >
                        <option value="">બધા લેવલ</option>
                        {studyLevelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">ગોળ (Text)</label>
                      <input 
                        type="text" 
                        placeholder="ગોળ લખો..." 
                        value={filterGol} 
                        onChange={(e) => setFilterGol(e.target.value)} 
                        className="w-full p-3 bg-gray-50 border-none rounded-xl text-xs font-bold font-gujarati outline-none" 
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-mint" size={40} /></div>
            ) : students.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-gujarati">કોઈ વિદ્યાર્થી મળ્યા નથી.</p>
                </div>
            ) : (
                <div className="space-y-4">
                  {students.map((student) => (
                    <motion.div 
                      key={student.id} 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint to-teal-500 flex items-center justify-center text-white shadow-lg">
                                    <User size={24}/>
                                </div>
                                <div>
                                    <h3 className="font-gujarati font-bold text-gray-800 text-base">{student.full_name}</h3>
                                    <p className="text-mint text-[10px] font-black uppercase tracking-tighter">{student.age} વર્ષ • {student.gol}</p>
                                </div>
                            </div>
                            {student.is_first_graduate && <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-[10px] font-bold">1st GRADUATE</div>}
                        </div>
                        <div className="space-y-2 text-[13px] text-gray-600 font-gujarati pl-1">
                            <div className="flex items-center gap-2"><GraduationCap className="text-gray-400" size={16}/> <span>{student.study_level} - {student.field_of_study}</span></div>
                            <div className="flex items-center gap-2"><MapPin className="text-gray-400" size={16}/> <span>{student.village}, {student.district}</span></div>
                            {student.future_goal && <div className="bg-gray-50 p-3 rounded-2xl mt-2 flex gap-2 italic"><Target className="text-orange-400 shrink-0" size={16}/> <span>{student.future_goal}</span></div>}
                        </div>
                    </motion.div>
                  ))}
                </div>
            )}
          </>
        ) : (
          <div className="space-y-5">
            <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-50 space-y-4 font-gujarati">
                <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">વિદ્યાર્થીની માહિતી</h3>
                
                {/* 1. Full Name */}
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">પૂરું નામ *</label>
                   <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-mint font-bold" placeholder="નામ લખો" />
                   {formErrors.fullName && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.fullName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   {/* 2. Age */}
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">ઉંમર *</label>
                      <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-mint font-bold" />
                      {formErrors.age && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.age}</p>}
                   </div>
                   {/* 3. Study Level */}
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">અભ્યાસ લેવલ *</label>
                      <select value={formData.studyLevel} onChange={(e) => setFormData({...formData, studyLevel: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold appearance-none bg-white">
                         <option value="">પસંદ કરો</option>
                         {studyLevelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      {formErrors.studyLevel && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.studyLevel}</p>}
                   </div>
                </div>

                {/* 4. Field of Study */}
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">અભ્યાસ ક્ષેત્ર (Field) *</label>
                   <input type="text" value={formData.fieldOfStudy} onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold" placeholder="દા.ત. Science, IT, Arts" />
                   {formErrors.fieldOfStudy && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.fieldOfStudy}</p>}
                </div>

                {/* 5. Current Institution (School/College) */}
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">હાલની સંસ્થા/સ્કૂલનું નામ *</label>
                   <input type="text" value={formData.currentInstitution} onChange={(e) => setFormData({...formData, currentInstitution: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold" placeholder="સ્કૂલ/કોલેજનું નામ" />
                   {formErrors.currentInstitution && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.currentInstitution}</p>}
                </div>

                {/* 6. Village & Taluko */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">ગામ</label>
                      <input type="text" value={formData.village} onChange={(e) => setFormData({...formData, village: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold" placeholder="ગામ" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">તાલુકો</label>
                      <input type="text" value={formData.taluko} onChange={(e) => setFormData({...formData, taluko: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold" placeholder="તાલુકો" />
                    </div>
                </div>

                {/* 7. District & Gol */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">જિલ્લો</label>
                      <input type="text" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold" placeholder="જિલ્લો" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">ગોળ *</label>
                      <input type="text" value={formData.gol} onChange={(e) => setFormData({...formData, gol: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold" placeholder="ગોળ" />
                      {formErrors.gol && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.gol}</p>}
                    </div>
                </div>

                {/* 8. Future Goal */}
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">ભવિષ્યનો ધ્યેય (Future Goal)</label>
                   <input type="text" value={formData.futureGoal} onChange={(e) => setFormData({...formData, futureGoal: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold" placeholder="દા.ત. Doctor, Engineer" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                   <span className="text-sm font-bold text-gray-600">પરિવારનો પ્રથમ ગ્રેજ્યુએટ?</span>
                   <input type="checkbox" checked={formData.isFirstGraduate} onChange={(e) => setFormData({...formData, isFirstGraduate: e.target.checked})} className="w-6 h-6 accent-mint" />
                </div>

                <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-4 bg-deep-blue text-white rounded-[20px] font-black shadow-lg disabled:opacity-50 active:scale-95 transition-all mt-4 uppercase tracking-wider">
                   {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'માહિતી સેવ કરો'}
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-white p-8 rounded-[40px] text-center shadow-2xl w-full max-w-xs">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                        <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
                    </div>
                    <h3 className="font-bold text-2xl font-gujarati mb-2 text-gray-800">સફળતા!</h3>
                    <p className="text-gray-500 font-gujarati text-sm">તમારી પ્રોફાઈલ લાઈવ થઈ ગઈ છે.</p>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}