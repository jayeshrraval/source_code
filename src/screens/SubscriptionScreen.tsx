import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Zap, ArrowLeft, Info, Heart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { Browser } from '@capacitor/browser'; // ✅ Capacitor Browser Import

export default function SubscriptionScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'monthly',
      name: 'માસિક મેમ્બરશીપ ફી',
      nameEn: 'Monthly Membership Fee',
      price: '₹49',
      amount: 49,
      color: 'bg-[#1A8FA3]',
      icon: Zap,
    },
    {
      id: 'yearly',
      name: 'વાર્ષિક મેમ્બરશીપ ફી',
      nameEn: 'Yearly Membership Fee',
      price: '₹480',
      amount: 480,
      color: 'bg-[#D4AF37]',
      icon: Crown,
      badge: 'Best Value',
      savings: '₹108 બચત',
    },
  ];

  const handleSubscribe = async (plan) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("પહેલા લોગિન કરો.");
        setLoading(false);
        return;
      }

      const userMobile = user.user_metadata?.mobile || "9999999999";

      const { data, error } = await supabase.functions.invoke('phonepe-init', {
        body: { amount: plan.amount, mobileNumber: userMobile }
      });

      if (error) throw new Error("સર્વર કનેક્શનમાં ભૂલ છે.");

      if (data?.success && data?.url) {
        // ✅ Capacitor માં બ્રાઉઝર ખોલવાની સાચી રીત
        await Browser.open({ url: data.url });
      } else {
        alert("પેમેન્ટ લિંક મળી નથી.");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#002B45] text-white pb-20">
      {/* Header */}
      <div className="flex flex-col items-center p-8 relative">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-8 left-6 p-2 bg-white/10 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-4">
          <Heart color="#D4AF37" fill="#D4AF37" size={40} />
        </div>
        <h1 className="text-2xl font-bold">મેમ્બરશીપ ફી</h1>
        <p className="text-white/60 text-sm">સમાજનું ઉત્થાન, આપણી જવાબદારી</p>
      </div>

      {/* Message Box */}
      <div className="mx-6 p-4 bg-[#FFF3CD] rounded-xl flex gap-3 border-l-4 border-[#FFEEBA]">
        <Info className="text-[#856404] shrink-0" size={20} />
        <p className="text-[#856404] text-sm font-bold leading-tight">
          "આ એપ સમાજ માટે મફત છે, પણ સમાજના વિકાસ માટે દરેક સભ્યે સ્વૈચ્છિક ફાળો અથવા લવાજમ આપવું ફરજિયાત છે."
        </p>
      </div>

      {/* Plans */}
      <div className="p-6 space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-3xl p-6 shadow-xl overflow-hidden relative">
            {plan.badge && (
              <div className="absolute top-3 right-3 bg-[#D4AF37] text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                {plan.badge}
              </div>
            )}
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl ${plan.color} flex items-center justify-center text-white shadow-lg`}>
                <plan.icon size={24} />
              </div>
              <div>
                <h3 className="text-gray-800 font-bold text-lg leading-none">{plan.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{plan.nameEn}</p>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-black text-[#002B45]">{plan.price}</span>
              <span className="text-gray-500 text-sm">/પ્લાન</span>
              {plan.savings && <p className="text-green-600 text-xs font-bold mt-1">{plan.savings}</p>}
            </div>
            <button 
              onClick={() => handleSubscribe(plan)}
              disabled={loading}
              className={`w-full py-4 rounded-2xl ${plan.color} text-white font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "સભ્યપદ મેળવો"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}