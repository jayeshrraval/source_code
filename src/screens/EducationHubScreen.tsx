import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  GraduationCap, 
  Star, 
  Newspaper 
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

interface EducationCard {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  gradient: string;
  path: string;
}

export default function EducationHubScreen() {
  const navigate = useNavigate();

  const educationCards: EducationCard[] = [
    {
      icon: BookOpen,
      title: 'વિદ્યાર્થી પ્રોફાઈલ',
      subtitle: 'વિદ્યાર્થીઓની માહિતી જુઓ અને ઉમેરો',
      gradient: 'from-blue-500 to-indigo-600',
      path: '/student-profile', // ✅ Corrected Path
    },
    {
      icon: GraduationCap,
      title: 'સ્કોલરશિપ અને સહાય',
      subtitle: 'સ્કોલરશિપની માહિતી મેળવો',
      gradient: 'from-emerald-500 to-teal-600',
      path: '/scholarship', // ✅ Corrected Path
    },
    {
      icon: Star,
      title: 'સમાજના ગૌરવ',
      subtitle: 'સમાજના સફળ વ્યક્તિઓની ઓળખ',
      gradient: 'from-amber-500 to-orange-600',
      path: '/achievers', // ✅ Corrected Path
    },
    {
      icon: Newspaper,
      title: 'આજનું શિક્ષણ માર્ગદર્શન',
      subtitle: 'દૈનિક શિક્ષણ માર્ગદર્શન પોસ્ટ',
      gradient: 'from-rose-500 to-pink-600',
      path: '/daily-guidance', // ✅ Corrected Path
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-[#1A8FA3] safe-area-top">
        <div className="px-6 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/home')}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-white font-gujarati font-bold text-xl">
                શિક્ષણ અને ભવિષ્ય
              </h1>
              <p className="text-mint text-sm font-gujarati">
                Education Hub
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Intro Section */}
      <div className="px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-6 bg-gradient-to-br from-mint/20 to-white"
        >
          <h2 className="font-gujarati font-bold text-deep-blue text-lg mb-2">
            🎯 હેતુ
          </h2>
          <ul className="space-y-2 text-gray-700 font-gujarati text-sm">
            <li className="flex items-start space-x-2">
              <span className="text-mint mt-1">•</span>
              <span>સમાજમાં શિક્ષણનું મહત્વ સમજાવવું</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-mint mt-1">•</span>
              <span>વિદ્યાર્થીઓને માર્ગદર્શન આપવું</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-mint mt-1">•</span>
              <span>માતા-પિતાને જાગૃત કરવું</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-mint mt-1">•</span>
              <span>Role-models showcase કરવું</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Cards Grid */}
      <div className="px-6">
        <div className="grid grid-cols-2 gap-4">
          {educationCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => navigate(card.path)}
                className="premium-card p-5 text-left hover:shadow-elevated transition-all active:scale-95"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-gujarati font-semibold text-gray-800 text-sm leading-tight mb-1">
                  {card.title}
                </h3>
                <p className="font-gujarati text-gray-500 text-xs leading-tight">
                  {card.subtitle}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Quote Section */}
      <div className="px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="premium-card p-6 bg-gradient-to-br from-royal-gold/10 to-white border-l-4 border-royal-gold"
        >
          <p className="font-gujarati text-gray-700 text-sm italic">
            "એક અનુભવી વ્યક્તિ = અનેક ભવિષ્ય બચાવી શકે"
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}