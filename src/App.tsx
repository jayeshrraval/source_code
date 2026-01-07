import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// 🔥 PLUGINS

import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

// Screens Imports
import SplashScreen from './screens/SplashScreen';
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from './screens/HomeScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import FamilyListScreen from './screens/FamilyListScreen';
import FamilyDetailScreen from './screens/FamilyDetailScreen';
import FamilyRegistrationScreen from './screens/FamilyRegistrationScreen';
import MatrimonyScreen from './screens/MatrimonyScreen';
import RequestsScreen from './screens/RequestsScreen'; 
import PrivateChatScreen from './screens/PrivateChatScreen';
import GeneralChatScreen from './screens/GeneralChatScreen';
import EducationHubScreen from './screens/EducationHubScreen';
import StudentProfileScreen from './screens/StudentProfileScreen';
import ScholarshipScreen from './screens/ScholarshipScreen';
import AchieversScreen from './screens/AchieversScreen';
import DailyGuidanceScreen from './screens/DailyGuidanceScreen';
import TrustScreen from './screens/TrustScreen';
import SamuhLagnaForm from './screens/SamuhLagnaForm'; 
import AccidentalAidScreen from './screens/AccidentalAidScreen';
import JobPostScreen from './screens/JobPostScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import AIAssistantScreen from './screens/AIAssistantScreen';
import KrishnaChatScreen from './screens/KrishnaChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import AboutScreen from './screens/AboutScreen'; 
import MessagesScreen from './screens/MessagesScreen';
import StudentRegistration from './screens/StudentRegistration';
import MarriageRegistration from './screens/MarriageRegistration';
import BusinessDirectoryScreen from './screens/BusinessDirectoryScreen';
import BusinessDetailsScreen from './screens/BusinessDetailsScreen';

// ✅ MainLayout: દરેક પેજ પર એડ માટે જગ્યા રાખશે
const MainLayout = ({ children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden' 
    }}>
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        paddingBottom: '60px' // 🔥 Banner Ad માટે જગ્યા
      }}>
        {children}
      </div>
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await CapacitorUpdater.notifyAppReady();
      } catch (error) {
        console.error("Capgo error:", error);
      }

      // 🔥 AdMob Setup (Banner + Video)
      try {
        await AdMob.initialize({
          requestTrackingAuthorization: true,
        });

        // 1. BANNER AD (દરેક સ્ક્રીન પર)
        await AdMob.showBanner({
          adId: 'ca-app-pub-2459932160741563/8195857584', 
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER, 
          margin: 0, 
        });

        // 2. VIDEO AD (એપ ચાલુ થાય ત્યારે એકવાર)
        await AdMob.prepareInterstitial({
          adId: 'ca-app-pub-2459932160741563/1668325292', // 🔥 તમારી નવી Video ID
          autoShow: false 
        });

        // 5 સેકન્ડ પછી વિડીયો બતાવો
        setTimeout(async () => {
           await AdMob.showInterstitial();
        }, 5000);

      } catch (e) {
        console.error('AdMob Error:', e);
      }

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
      });

      setTimeout(() => {
        setShowSplash(false);
        setLoading(false);
      }, 4000);

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeApp();
  }, []);

  if (showSplash || loading) {
    return <SplashScreen />;
  }

  const ProtectedRoute = ({ children }) => {
    if (!session) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={!session ? <LoginScreen /> : <Navigate to="/home" replace />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          
          <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsScreen /></ProtectedRoute>} />
          <Route path="/family-list" element={<ProtectedRoute><FamilyListScreen /></ProtectedRoute>} />
          <Route path="/family-details/:id" element={<ProtectedRoute><FamilyDetailScreen /></ProtectedRoute>} />
          <Route path="/family-registration" element={<ProtectedRoute><FamilyRegistrationScreen /></ProtectedRoute>} />
          <Route path="/matrimony" element={<ProtectedRoute><MatrimonyScreen /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><RequestsScreen /></ProtectedRoute>} />
          
          <Route path="/messages" element={<ProtectedRoute><MessagesScreen /></ProtectedRoute>} />
          <Route path="/chat/:roomId" element={<ProtectedRoute><PrivateChatScreen /></ProtectedRoute>} />
          <Route path="/private-chat/:roomId" element={<ProtectedRoute><PrivateChatScreen /></ProtectedRoute>} />
          
          <Route path="/general-chat" element={<ProtectedRoute><GeneralChatScreen /></ProtectedRoute>} />
          <Route path="/education" element={<ProtectedRoute><EducationHubScreen /></ProtectedRoute>} />
          <Route path="/student-profile" element={<ProtectedRoute><StudentProfileScreen /></ProtectedRoute>} />
          <Route path="/scholarship" element={<ProtectedRoute><ScholarshipScreen /></ProtectedRoute>} />
          <Route path="/achievers" element={<ProtectedRoute><AchieversScreen /></ProtectedRoute>} />
          <Route path="/daily-guidance" element={<ProtectedRoute><DailyGuidanceScreen /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><JobPostScreen /></ProtectedRoute>} />
          <Route path="/trust" element={<ProtectedRoute><TrustScreen /></ProtectedRoute>} />
          <Route path="/samuh-lagna-form" element={<ProtectedRoute><SamuhLagnaForm /></ProtectedRoute>} /> 
          <Route path="/accidental-aid" element={<ProtectedRoute><AccidentalAidScreen /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><SubscriptionScreen /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistantScreen /></ProtectedRoute>} />
          <Route path="/krishna-chat" element={<ProtectedRoute><KrishnaChatScreen /></ProtectedRoute>} /> 
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><AboutScreen /></ProtectedRoute>} />

          <Route path="/student-registration" element={<ProtectedRoute><StudentRegistration /></ProtectedRoute>} />
          <Route path="/marriage-registration" element={<ProtectedRoute><MarriageRegistration /></ProtectedRoute>} />
          <Route path="/business-directory" element={<BusinessDirectoryScreen />} />
          <Route path="/business-details/:id" element={<BusinessDetailsScreen />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}