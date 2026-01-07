import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle, Phone, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Supabase Import

const steps = [
  {
    title: 'હેલ્પલાઇન સંપર્ક',
    description: 'આપત્તિ વખતે નીચે આપેલા બટન પર ક્લિક કરી તરત સંપર્ક કરો.',
  },
  {
    title: 'પરિસ્થિતિની તપાસ',
    description: 'સમાજના પ્રતિનિધિ દ્વારા જરૂરી માહિતી અને ચકાસણી કરવામાં આવશે.',
  },
  {
    title: 'સીધી આર્થિક સહાય',
    description: 'ચકાસણી બાદ તુરંત જ જરૂર મુજબ આર્થિક સહાય આપવામાં આવશે.',
  },
];

export default function AccidentalAidScreen() {
  const navigate = useNavigate();
  const [helplineNumber, setHelplineNumber] = useState<string>(''); // Default ખાલી રાખો
  const [loading, setLoading] = useState(true);

  // 🔄 Supabase માંથી નંબર લાવો
  useEffect(() => {
    const fetchHelpline = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('setting_value')
          .eq('setting_key', 'helpline_number')
          .single();

        if (data) {
          setHelplineNumber(data.setting_value);
        }
      } catch (error) {
        console.error('Error fetching helpline:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHelpline();
  }, []);

  const handleCall = () => {
    if (helplineNumber) {
      window.open(`tel:${helplineNumber}`);
    } else {
      alert('નંબર ઉપલબ્ધ નથી. કૃપા કરીને એડમિનનો સંપર્ક કરો.');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 font-gujarati">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0B4F6C] to-[#1A8FA3] rounded-b-[40px] px-6 pt-12 pb-10 shadow-lg">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white leading-snug">
          અકસ્માત આર્થિક સહાય યોજના
        </h1>
        <p className="text-lg text-teal-100 mt-2 opacity-90">
          આપત્તિના સમયે જ્ઞાતિનો સધિયારો
        </p>
      </header>

      <main className="px-6 pt-8 pb-28 space-y-8">
        {/* Disclaimer */}
        <section className="bg-orange-50 border border-orange-100 rounded-2xl p-5 shadow-sm flex gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-gray-700 leading-relaxed text-sm font-medium pt-1">
            નોંધ: આ યોજનાનો લાભ માત્ર આર્થિક રીતે નબળા અને જરૂરિયાતમંદ પરિવારો માટે જ છે. ખોટી રજૂઆત કરવી નહીં.
          </p>
        </section>

        {/* Steps */}
        <section className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex items-start gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-[#0B4F6C] flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                {index + 1}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {step.title}
                </h3>
                <p className="text-gray-600 mt-1 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 px-6 py-5 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={handleCall}
          disabled={loading}
          className="w-full bg-[#0B4F6C] active:bg-[#093d54] text-white rounded-2xl py-4 flex items-center justify-center gap-3 text-lg font-semibold shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Phone className="w-6 h-6 fill-current" />
              <span>તાત્કાલિક સહાય માટે કોલ કરો</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}