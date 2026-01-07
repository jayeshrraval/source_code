import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Loader2, HandHeart, ShieldCheck, ScrollText, GraduationCap, Users, AlertTriangle, Info } from 'lucide-react';
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
    <div className="min-h-screen bg-[#002B45] text-white pb-24">
      
      {/* Header */}
      <div className="flex flex-col items-center p-8 relative">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-8 left-6 p-2 bg-white/10 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="w-32 h-32 rounded-full bg-white mb-4 border-4 border-[#D4AF37] shadow-2xl overflow-hidden flex items-center justify-center">
            <img 
               src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj02tGMctD7dOcizJfzCDJ5RCzIWo9apjlz-pueOsYK8QHb9R76VwQ9hAGiFLyWXuowPhDZd1795uHtvYCRgUgRKhkn9HUHRB3yzLblPyEjZeMjzz8TzyINinutpXdbNh84KWTImWkiMdYBdIHg55ERSl3iasTuZzFDwZ84wq76BWxSWxGUudmpBHI4JpNq/s320/icon.png" 
               alt="Yogi Samaj Logo"
               className="w-full h-full object-cover scale-110"
            />
        </div>

        <h1 className="text-2xl font-bold mt-2">સમાજ વિકાસ ફાળો</h1>
        <p className="text-white/60 text-sm">તમારું યોગદાન, સમાજની પ્રગતિ</p>
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

      {/* ✅ નિયમો અને શરતો Section */}
      <div className="mx-4 bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-3">
          <ScrollText className="text-[#D4AF37]" size={24} />
          <h3 className="text-lg font-bold text-white">નિયમો અને શરતો</h3>
        </div>

        <div className="space-y-6">
          
          {/* ૧. ફાળાની વહેંચણી */}
          <div className="flex gap-3">
            <div className="mt-1 bg-blue-500/20 p-1.5 rounded-lg h-fit shrink-0">
              <Info size={16} className="text-blue-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">૧. ફાળાની વહેંચણી (Funds Allocation):</h4>
              <p className="text-xs text-gray-300 leading-relaxed text-justify">
                યુઝર દ્વારા આપવામાં આવેલા કુલ ફાળાના <b className="text-white">૩૦% રકમ</b> આ ડિજિટલ પ્લેટફોર્મ (એપ) ના સર્વર ખર્ચ, મેન્ટેનન્સ, સિક્યુરિટી અને નવા અપડેટ્સ માટે વાપરવામાં આવશે. બાકીના <b className="text-white">૭૦% રકમ</b> સીધી સમાજના કલ્યાણકારી કાર્યો (સ્કોલરશીપ, સમૂહ લગ્ન, ઇનામ વિતરણ, સહાય અને બીજા સામાજિક વિકાસ) માટે સુરક્ષિત રાખવામાં આવશે.
              </p>
            </div>
          </div>

          {/* ૨. સહાયની મર્યાદા */}
          <div className="flex gap-3">
            <div className="mt-1 bg-yellow-500/20 p-1.5 rounded-lg h-fit shrink-0">
              <AlertTriangle size={16} className="text-yellow-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">૨. સહાયની મર્યાદા (Fund Availability):</h4>
              <p className="text-xs text-gray-300 leading-relaxed text-justify">
                સમાજની વિવિધ યોજનાઓ જેવી કે અકસ્માત સહાય કે સ્કોલરશીપનો લાભ સંપૂર્ણપણે ભેગા થયેલા ફંડની ઉપલબ્ધતા પર આધારિત છે. જો ફંડ પૂરતું નહીં હોય, તો સહાય આપી શકાશે નહીં. કોઈપણ સંજોગોમાં સહાય આપવી કે નહીં તેનો આખરી નિર્ણય ટ્રસ્ટ/એડમિનનો રહેશે.
              </p>
            </div>
          </div>

          {/* ૩. કોઈ ગેરંટી કે હકદાવો નહીં */}
          <div className="flex gap-3">
            <div className="mt-1 bg-red-500/20 p-1.5 rounded-lg h-fit shrink-0">
              <ShieldCheck size={16} className="text-red-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">૩. કોઈ ગેરંટી કે હકદાવો નહીં (No Claims):</h4>
              <p className="text-xs text-gray-300 leading-relaxed text-justify">
                આ ફાળો એક <b className="text-white">'સ્વૈચ્છિક દાન'</b> છે, કોઈ વીમો (Insurance) નથી. ફાળો આપ્યા બાદ કોઈપણ સભ્ય એવો કાયદેસરનો હકદાવો (Claim) નહીં કરી શકે કે તેણે પૈસા આપ્યા છે એટલે તેને સહાય મળવી જ જોઈએ. સહાય માત્ર જરૂરિયાત અને ફંડની સ્થિતિ જોઈને જ નક્કી કરવામાં આવશે.
              </p>
            </div>
          </div>

          {/* ૪. સામૂહિક નૈતિક જવાબદારી */}
          <div className="flex gap-3">
            <div className="mt-1 bg-green-500/20 p-1.5 rounded-lg h-fit shrink-0">
              <Users size={16} className="text-green-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">૪. સામૂહિક નૈતિક જવાબદારી:</h4>
              <p className="text-xs text-gray-300 leading-relaxed text-justify">
                આ એપ અને તેની યોજનાઓ સમાજના દરેક સભ્યોના નાના-નાના સહયોગથી ચાલે છે. જો સભ્યો ફાળો આપવાનું બંધ કરશે, તો ફંડના અભાવે આ સુવિધાઓ અને યોજનાઓ કોઈપણ પૂર્વ સૂચના વગર બંધ થઈ શકે છે.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}