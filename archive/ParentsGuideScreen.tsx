import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  BookOpen,
  MessageCircle,
  Heart,
  Lightbulb,
  Shield,
  Target,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function ParentsGuideScreen() {
  const navigate = useNavigate();

  const guidanceTopics = [
    {
      icon: Heart,
      title: 'બાળકો સાથે વાતચીત',
      description: 'બાળકો સાથે શિક્ષણ વિશે ખુલ્લી વાતચીત કેવી રીતે કરવી',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      icon: Target,
      title: 'Career માર્ગદર્શન',
      description: 'બાળકોના career decisions માં કેવી રીતે મદદ કરવી',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Shield,
      title: 'Mental Support',
      description: 'Exam stress અને pressure handle કરવામાં સહાય',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Lightbulb,
      title: 'Modern Education',
      description: 'આજના યુગમાં શિક્ષણના નવા options સમજો',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: BookOpen,
      title: 'Study Environment',
      description: 'ઘરે અભ્યાસ માટે યોગ્ય વાતાવરણ બનાવો',
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      icon: MessageCircle,
      title: 'શાળા સાથે સંપર્ક',
      description: 'Teachers અને school સાથે effective communication',
      gradient: 'from-cyan-500 to-blue-600',
    },
  ];

  const importantTips = [
    'બાળકોની પસંદગી અને રુચિને સમજો',
    'અન્ય બાળકો સાથે comparison ટાળો',
    'Failure ને learning opportunity તરીકે જુઓ',
    'બાળકોને decision making માં involve કરો',
    'Regular communication maintain રાખો',
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-deep-blue to-[#1A8FA3] safe-area-top">
        <div className="px-6 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/education')}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-white font-gujarati font-bold text-xl">
                માતા-પિતા માટે માર્ગદર્શન
              </h1>
              <p className="text-mint text-sm font-gujarati">
                Parents Guide
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
          className="premium-card p-5 bg-gradient-to-br from-cyan-50 to-blue-50 border-l-4 border-cyan-500"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Users className="w-8 h-8 text-cyan-600" />
            <h2 className="font-gujarati font-bold text-gray-800">
              માતા-પિતાની ભૂમિકા
            </h2>
          </div>
          <p className="font-gujarati text-gray-600 text-sm">
            બાળકોના શિક્ષણ અને ભવિષ્યમાં માતા-પિતાની ભૂમિકા અત્યંત મહત્વપૂર્ણ છે. 
            યોગ્ય માર્ગદર્શન અને support થી બાળકો વધુ સારું perform કરી શકે છે.
          </p>
        </motion.div>
      </div>

      {/* Guidance Topics */}
      <div className="px-6">
        <h3 className="font-gujarati font-semibold text-gray-800 mb-4">
          મહત્વના વિષયો
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {guidanceTopics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="premium-card p-4"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-gujarati font-semibold text-gray-800 text-sm mb-1">
                  {topic.title}
                </h4>
                <p className="font-gujarati text-gray-500 text-xs line-clamp-2">
                  {topic.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Important Tips */}
      <div className="px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="premium-card p-5"
        >
          <h3 className="font-gujarati font-semibold text-gray-800 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 text-royal-gold mr-2" />
            મહત્વની Tips
          </h3>
          <ul className="space-y-3">
            {importantTips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-mint/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-mint font-semibold text-xs">{index + 1}</span>
                </div>
                <p className="font-gujarati text-gray-700 text-sm">{tip}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Quote */}
      <div className="px-6 pb-6">
        <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border-l-4 border-cyan-500">
          <p className="font-gujarati text-gray-700 text-sm italic">
            "માતા-પિતાનો support = બાળકનું confident future"
          </p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="px-6 pb-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="premium-card p-4 bg-gray-50 text-center"
        >
          <p className="font-gujarati text-gray-500 text-sm">
            📚 વધુ detailed content જલ્દી આવી રહ્યું છે...
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
