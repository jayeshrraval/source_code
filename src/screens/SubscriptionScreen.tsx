import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Loader2, HandHeart, ShieldCheck, ScrollText, GraduationCap, Users } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Browser } from '@capacitor/browser';

export default function SubscriptionScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'monthly',
      name: 'માસિક સહયોગ',
      nameEn: 'Monthly Contribution',
      price: '₹49',
      amount: 49,
      color: 'bg-[#1A8FA3]',
      icon: Heart,
    },
    {
      id: 'yearly',
      name: 'વાર્ષિક સહયોગ',
      nameEn: 'Yearly Contribution',
      price: '₹480',
      amount: 480,
      color: 'bg-[#D4AF37]',
      icon: HandHeart,
      badge: 'શ્રેષ્ઠ વિકલ્પ',
      savings: 'સમાજ સેવામાં મોટું યોગદાન',
    },
  ];

  const handleDonation = async (plan) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("કૃપા કરીને પહેલા લોગિન કરો.");
        setLoading(false);
        return;
      }

      const userMobile = user.user_metadata?.mobile || user.phone;

      if (!userMobile) {
        alert("તમારો મોબાઈલ નંબર મળ્યો નથી.");
        setLoading(false);
        return;
      }

      // 🔴 તમારી વેબસાઈટની લિંક (Blogger Page)
      const paymentPageUrl = "https://yogisamajsambandh.blogspot.com/p/blog-page.html";
      const fullUrl = `${paymentPageUrl}?phone=${userMobile}&amt=${plan.amount}`;

      await Browser.open({ url: fullUrl });

    } catch (error) {
      alert("Error: " + error.message);
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
          <HandHeart color="#D4AF37" fill="#D4AF37" size={40} />
        </div>
        <h1 className="text-2xl font-bold">સમાજ વિકાસ ફાળો</h1>
        <p className="text-white/60 text-sm">તમારું યોગદાન, સમાજની પ્રગતિ</p>
      </div>

      {/* ✅ Google Policy Safe Message */}
      <div className="mx-6 p-4 bg-[#e8f5e9] rounded-xl flex gap-3 border-l-4 border-[#2e7d32] mb-6">
        <ShieldCheck className="text-[#1b5e20] shrink-0" size={24} />
        <p className="text-[#1b5e20] text-sm font-bold leading-tight">
          "આ એપ સમાજ માટે મફત છે. આ રકમ એપના મેન્ટેનન્સ અને સમાજ સેવા માટે 'સ્વૈચ્છિક ફાળો' (Voluntary Donation) છે."
        </p>
      </div>

      {/* Plans */}
      <div className="px-6 space-y-4 mb-8">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-3xl p-6 shadow-xl overflow-hidden relative transform transition active:scale-95">
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
              {plan.savings && <p className="text-green-600 text-xs font-bold mt-1">{plan.savings}</p>}
            </div>

            <button 
              onClick={() => handleDonation(plan)}
              disabled={loading}
              className={`w-full py-4 rounded-2xl ${plan.color} text-white font-bold shadow-lg flex items-center justify-center gap-2`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "ફાળો આપો (Donate)"}
            </button>
          </div>
        ))}
      </div>

      {/* ✅ NEW: Professional Note Section */}
      <div className="mx-4 bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
          <ScrollText className="text-[#D4AF37]" size={24} />
          <h3 className="text-lg font-bold text-[#D4AF37]">મહત્વની નોંધ</h3>
        </div>

        <div className="space-y-4">
          {/* Point 1: App Maintenance */}
          <div className="flex gap-3">
            <div className="mt-1 bg-blue-500/20 p-1.5 rounded-lg h-fit">
              <Users size={16} className="text-blue-300" />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              તમે જે ફાળો આપશો તેનો ઉપયોગ <b className="text-white">સમાજના વિકાસ</b> માટે અને આપણી આ <b className="text-white">એપના મેન્ટેનન્સ ખર્ચ</b> પેટે વાપરવામાં આવશે.
            </p>
          </div>

          {/* Point 2: Scholarship & Help */}
          <div className="flex gap-3">
            <div className="mt-1 bg-green-500/20 p-1.5 rounded-lg h-fit">
              <GraduationCap size={16} className="text-green-300" />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              આ ફાળાથી આપણે સમાજના તેજસ્વી વિદ્યાર્થીઓ માટે <b className="text-white">સ્કોલરશીપ યોજના</b> બનાવી શકીશું અને આર્થિક રીતે નબળા વિદ્યાર્થીઓને મદદ કરી શકીશું.
            </p>
          </div>

          {/* Point 3: Final Appeal */}
          <div className="bg-[#D4AF37]/10 p-4 rounded-xl mt-2 border border-[#D4AF37]/30">
            <p className="text-sm text-[#FFE58F] font-medium text-center leading-relaxed">
              "માસિક ₹49 કે વાર્ષિક ₹480 આપણા માટે વધારે નથી, પણ બધાના સહયોગથી સમાજ માટે ઘણું મોટું કાર્ય થઈ શકે છે. તો આપણી ફરજ સમજીને અવશ્ય ફાળો આપીએ." 🙏
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}