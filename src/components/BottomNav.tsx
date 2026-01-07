import { Home, Heart, Briefcase, User } from 'lucide-react'; // Briefcase આઈકન નોકરી માટે
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/home' },
    { id: 'matrimony', icon: Heart, label: 'Matrimony', path: '/matrimony' },
    { id: 'jobs', icon: Briefcase, label: 'Jobs', path: '/jobs' }, // ✅ મેસેજ કાઢીને Jobs કર્યું
    { id: 'account', icon: User, label: 'Account', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom shadow-elevated z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 relative py-2 px-3 rounded-2xl transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-mint/10 rounded-2xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center space-y-1">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-deep-blue' : 'text-gray-400'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-deep-blue' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}