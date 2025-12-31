import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState('login'); // removed TS types for pure JS compatibility if needed, works for TS too
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    dob: ''
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(''); 
  };

  // 🛠 REGISTER FUNCTION (FIXED)
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('પાસવર્ડ મેચ થતા નથી.');
      setLoading(false);
      return;
    }

    if (formData.mobile.length !== 10) {
      setErrorMsg('મોબાઈલ નંબર 10 અંકનો હોવો જોઈએ.');
      setLoading(false);
      return;
    }

    try {
      // Supabase માટે ફેક ઈમેલ બનાવો
      const fakeEmail = `${formData.mobile}@samaj.app`;

      // ૧. Auth માં સાઈન અપ કરો
      const { data, error } = await supabase.auth.signUp({
        email: fakeEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            dob: formData.dob,
            mobile: formData.mobile
          }
        }
      });

      if (error) throw error;

      // ૨. 🔥 [IMP FIX] Users ટેબલમાં ડેટા નાખો (જેથી પ્રોફાઈલમાં દેખાય)
      if (data.user) {
          const { error: insertError } = await supabase
            .from('users')
            .insert([{
                id: data.user.id,
                full_name: formData.fullName,
                mobile: formData.mobile,
                dob: formData.dob, // ✅ DOB અહી સેવ થશે
                created_at: new Date()
            }]);

          if (insertError) {
              // જો ઇન્સેર્ટ ના થાય, તો લોગ કરીને એરર બતાવો
              console.error("Users Table Insert Error:", insertError);
              throw insertError; 
          }
      }

      alert('રજીસ્ટ્રેશન સફળ! હવે લોગિન કરો.');
      setActiveTab('login');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'રજીસ્ટ્રેશનમાં ભૂલ છે.');
    } finally {
      setLoading(false);
    }
  };

  // 🔐 LOGIN FUNCTION
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const fakeEmail = `${formData.mobile}@samaj.app`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: formData.password,
      });

      if (error) throw error;
      navigate('/home');
    } catch (error) {
      console.error(error);
      setErrorMsg('મોબાઈલ નંબર અથવા પાસવર્ડ ખોટો છે.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-blue via-[#1A8FA3] to-mint flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white font-gujarati mb-2"
        >
          યોગી સમાજ સંબંધ
        </motion.h1>
        <p className="text-mint text-sm">સ્વાગત છે</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 px-6 mb-6">
        <button
          onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
          className={`flex-1 py-3 rounded-2xl font-gujarati font-medium transition-all ${
            activeTab === 'login'
              ? 'bg-white text-deep-blue shadow-lg'
              : 'bg-white/20 text-white'
          }`}
        >
          પ્રવેશ કરો
        </button>
        <button
          onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
          className={`flex-1 py-3 rounded-2xl font-gujarati font-medium transition-all ${
            activeTab === 'register'
              ? 'bg-white text-deep-blue shadow-lg'
              : 'bg-white/20 text-white'
          }`}
        >
          નવું એકાઉન્ટ
        </button>
      </div>

      {/* Content Card */}
      <div className="flex-1 bg-white rounded-t-[2rem] px-6 pt-8 pb-6 overflow-y-auto">
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center text-sm font-gujarati"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            {errorMsg}
          </motion.div>
        )}

        <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister} className="space-y-5">
          {activeTab === 'register' && (
            <div>
              <label className="block text-gray-700 font-gujarati mb-1 text-sm">નામ</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="તમારું પૂરું નામ"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mint font-gujarati"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-gujarati mb-1 text-sm">મોબાઇલ નંબર</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="10 અંકો નો નંબર"
              maxLength={10}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mint font-gujarati"
              required
            />
          </div>

          {activeTab === 'register' && (
            <div>
              <label className="block text-gray-700 font-gujarati mb-1 text-sm">જન્મ તારીખ</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mint font-gujarati"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-gujarati mb-1 text-sm">પાસવર્ડ</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="પાસવર્ડ દાખલ કરો"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mint font-gujarati"
              required
            />
          </div>

          {activeTab === 'register' && (
            <div>
              <label className="block text-gray-700 font-gujarati mb-1 text-sm">પાસવર્ડ કન્ફર્મ કરો</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="ફરીથી પાસવર્ડ લખો"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mint font-gujarati"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${activeTab === 'login' ? 'bg-mint' : 'bg-deep-blue text-white'} font-gujarati font-semibold py-4 rounded-2xl transition-all shadow-lg flex justify-center items-center`}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : activeTab === 'login' ? 'લોગિન કરો' : 'રજીસ્ટર કરો'}
          </button>

          <div className="text-center space-y-3 pt-2">
            {activeTab === 'login' && (
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-deep-blue text-sm font-gujarati hover:underline"
              >
                પાસવર્ડ ભૂલી ગયા?
              </button>
            )}
            <p className="text-gray-600 text-sm font-gujarati">
              {activeTab === 'login' ? 'નવા યુઝર?' : 'પહેલેથી એકાઉન્ટ છે?'}{' '}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                className="text-deep-blue font-semibold hover:underline"
              >
                {activeTab === 'login' ? 'રજીસ્ટર કરો' : 'લોગિન કરો'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}