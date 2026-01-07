import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Building2, MapPin, Phone, User, ArrowLeft, 
  MessageCircle, Share2, Briefcase, Store, CheckCircle 
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function BusinessDetailsScreen() {
  const { id } = useParams(); // URL માંથી ID મળશે
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessDetails();
  }, [id]);

  const fetchBusinessDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) console.error(error);
    else setBusiness(data);
    setLoading(false);
  };

  const openWhatsApp = (mobile) => {
    window.open(`https://wa.me/91${mobile}`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.business_name,
          text: `Check out ${business.business_name} on Samaj Vyapar Setu!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      alert("Link Copied!");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  if (!business) return <div className="min-h-screen flex items-center justify-center">કોઈ માહિતી મળી નથી.</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-gujarati">
      
      {/* Header Image Pattern */}
      <div className="h-48 bg-gradient-to-r from-indigo-900 to-[#1A8FA3] relative">
        <div className="absolute top-6 left-6">
          <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full text-white backdrop-blur-md">
            <ArrowLeft size={24} />
          </button>
        </div>
        <div className="absolute -bottom-10 left-6">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#1A8FA3]">
             <Store size={40} />
          </div>
        </div>
      </div>

      <div className="mt-12 px-6 pb-24">
        {/* Title Section */}
        <div className="flex justify-between items-start">
          <div>
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {business.business_type}
            </span>
            <h1 className="text-2xl font-black text-gray-800 mt-2 leading-tight">
              {business.business_name}
            </h1>
          </div>
          <button onClick={handleShare} className="bg-gray-100 p-3 rounded-full text-gray-600 active:scale-90 transition-transform">
            <Share2 size={20} />
          </button>
        </div>

        {/* ✅ NEW: Services List Section */}
        {business.services && business.services.length > 0 && (
          <div className="mt-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-500 text-sm mb-3 uppercase flex items-center gap-2">
               <CheckCircle size={16} className="text-[#1A8FA3]" /> અમારી સેવાઓ (Services)
            </h3>
            <div className="flex flex-wrap gap-2">
               {business.services.map((service, index) => (
                  <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-indigo-100 shadow-sm">
                    {service}
                  </span>
               ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-500 text-sm mb-2 uppercase">વ્યવસાયની વિગત</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {business.description || "કોઈ વિગત ઉપલબ્ધ નથી."}
          </p>
        </div>

        {/* Owner & Location Details */}
        <div className="mt-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-full text-orange-500">
              <User size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">માલિકનું નામ</p>
              <p className="text-gray-800 font-bold text-lg">{business.owner_name}</p>
            </div>
          </div>

          <div className="h-px bg-gray-50"></div>

          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-full text-green-600">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">સરનામું</p>
              <p className="text-gray-800 font-medium">
                {business.village}, {business.taluka}
              </p>
              <p className="text-gray-500 text-sm">જી. {business.district}</p>
            </div>
          </div>
        </div>

        {/* Contact Buttons (Sticky Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-3 z-50 safe-area-bottom">
          <a 
            href={`tel:${business.mobile}`} 
            className="flex-1 bg-[#1A8FA3] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <Phone size={20} /> Call Now
          </a>
          <button 
            onClick={() => openWhatsApp(business.mobile)}
            className="flex-1 bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <MessageCircle size={20} /> WhatsApp
          </button>
        </div>
        
      </div>
    </div>
  );
}
