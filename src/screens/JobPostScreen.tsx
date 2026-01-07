import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Search, Loader2, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient'; // ✅ પાથ સુધાર્યો
import BottomNav from '../components/BottomNav'; // ✅ બોટમ નેવિગેશન ઉમેર્યું

export default function JobPostScreen() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_alerts')
        .select('*')
        .eq('is_active', true) // ફક્ત ચાલુ ભરતી જ બતાવો
        .order('id', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 સર્ચ ફિલ્ટર
  const filteredJobs = jobs.filter(job => 
    (job.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (job.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // 📅 તારીખ ફોર્મેટ
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('gu-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-gujarati"> {/* pb-24 જેથી બોટમ નેવ કપાય નહીં */}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 pt-12 rounded-b-[30px] shadow-lg sticky top-0 z-20">
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => navigate('/home')} // બેક બટન હવે હોમ પર લઈ જશે
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">નોકરીની જાહેરાત</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="નોકરી અથવા વિભાગ શોધો..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/95 backdrop-blur text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner"
          />
          <Search className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
        </div>
      </div>

      {/* Jobs List */}
      <div className="px-5 py-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-10 space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-500 text-sm">માહિતી લોડ થઈ રહી છે...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 font-bold">કોઈ નવી ભરતી મળી નથી.</div>
        ) : (
          filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                  <p className="text-sm text-blue-600 font-medium flex items-center mt-1">
                    <Building2 className="w-3 h-3 mr-1" />
                    {job.department}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                  job.job_type === 'Private' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                }`}>
                  {job.job_type || 'Government'}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3 mt-2">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  પોસ્ટ: {formatDate(job.post_date)}
                </div>
                {job.last_date && (
                   <div className="flex items-center text-red-500 font-medium">
                   <Calendar className="w-3 h-3 mr-1" />
                   છેલ્લી તા: {formatDate(job.last_date)}
                 </div>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                 <p className="text-sm text-gray-600 line-clamp-2">
                    {job.description || 'વધુ માહિતી માટે લિંક પર ક્લિક કરો.'}
                 </p>
                 {job.salary && (
                    <p className="text-sm font-bold text-gray-800 mt-2">
                      પગાર: {job.salary}
                    </p>
                 )}
              </div>

              <button
                onClick={() => window.open(job.apply_link, '_blank')}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all hover:bg-blue-700"
              >
                <span>વધુ વિગત અને અરજી કરો</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* ✅ બોટમ નેવિગેશન અહીં ઉમેર્યું */}
      <BottomNav />
    </div>
  );
}