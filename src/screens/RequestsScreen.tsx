import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, X, MessageCircle, Loader2, 
  CheckCircle, UserPlus, Clock, ShieldCheck, Heart 
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function RequestsScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('received');
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setLoading(false);
        return;
    }

    try {
      if (activeTab === 'received') {
        const { data: reqs, error } = await supabase
          .from('requests')
          .select('*')
          .eq('receiver_id', user.id)
          .eq('status', 'pending');
        
        if (error) throw error;

        if (reqs && reqs.length > 0) {
            const senderIds = reqs.map(r => r.sender_id);
            const { data: profiles } = await supabase
                .from('matrimony_profiles')
                .select('user_id, full_name, image_url, village, age, peta_atak, occupation')
                .in('user_id', senderIds);
            
            const merged = reqs.map(r => ({
                ...r,
                profile: profiles?.find(p => p.user_id === r.sender_id)
            }));
            setRequests(merged);
        } else {
            setRequests([]);
        }

      } else {
        const { data: conns, error } = await supabase
          .from('requests')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (error) throw error;

        if (conns && conns.length > 0) {
            const otherIds = conns.map(c => c.sender_id === user.id ? c.receiver_id : c.sender_id);
            const { data: profiles } = await supabase
                .from('matrimony_profiles')
                .select('user_id, full_name, image_url, village, age, occupation')
                .in('user_id', otherIds);

            const merged = conns.map(c => {
                const otherId = c.sender_id === user.id ? c.receiver_id : c.sender_id;
                return {
                    ...c,
                    otherId: otherId,
                    profile: profiles?.find(p => p.user_id === otherId)
                };
            });
            setConnections(merged);
        } else {
            setConnections([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 [FINAL UPDATED FIX] જાસૂસી લોજિક: આખા પરિવારને (Group) શોધશે 🔥
  const notifyFamiliesOnAccept = async (accepterId: any, senderId: any) => {
    try {
        console.log("Starting Spy Logic (Group Version)...");

        // ૧. બંને યુઝરના મોબાઈલ મેળવો
        const { data: accepterUser } = await supabase.from('users').select('mobile, full_name').eq('id', accepterId).single();
        const { data: senderUser } = await supabase.from('users').select('mobile, full_name').eq('id', senderId).single();

        // પ્રોફાઈલ ડેટા
        const { data: accepterProfile } = await supabase.from('matrimony_profiles').select('full_name, village').eq('user_id', accepterId).maybeSingle();
        const { data: senderProfile } = await supabase.from('matrimony_profiles').select('full_name, village').eq('user_id', senderId).maybeSingle();

        const accName = accepterProfile?.full_name || accepterUser?.full_name || 'User';
        const accVillage = accepterProfile?.village || '';
        const sendName = senderProfile?.full_name || senderUser?.full_name || 'User';
        const sendVillage = senderProfile?.village || '';

        // Helper: Clean Mobile
        const getLast10 = (str: any) => {
            if (!str) return '';
            return str.replace(/\D/g, '').slice(-10);
        };

        const notifications = [];

        // ==================================================
        // 🛠️ હેલ્પર: મોબાઈલ પરથી આખા ફેમિલી ગ્રુપના નંબર લાવે
        // ==================================================
        const getFamilyGroupMobiles = async (userMobile: string) => {
            const cleanUserMobile = getLast10(userMobile);
            console.log(`Searching Family Group for: ${cleanUserMobile}`);

            // ૧. પહેલા 'families' માંથી આ મોબાઈલ વાળી લાઈન શોધો
            const { data: allFamilies } = await supabase.from('families').select('*');
            
            const myFamilyRow = allFamilies?.find(f => 
                getLast10(f.mobile_number) === cleanUserMobile || 
                getLast10(f.member_mobile) === cleanUserMobile
            );

            if (!myFamilyRow) {
                console.log("No family record found for this mobile.");
                return [];
            }

            // ૨. હવે એ લાઈનનો 'user_id' (Family ID) પકડો
            const familyGroupId = myFamilyRow.user_id;
            console.log(`Found Family Group ID: ${familyGroupId}`);

            // ૩. એ Group ID વાળા *બધા* સભ્યોને શોધો
            const groupMembers = allFamilies?.filter(f => f.user_id === familyGroupId);

            // ૪. બધાના નંબરનું લિસ્ટ બનાવો
            let allNumbers: string[] = [];
            groupMembers?.forEach(m => {
                if (m.mobile_number) allNumbers.push(getLast10(m.mobile_number));
                if (m.member_mobile) allNumbers.push(getLast10(m.member_mobile));
            });

            // ડુપ્લિકેટ નંબર કાઢી નાખો
            return [...new Set(allNumbers)];
        };

        // ==================================================
        // PART A: સ્વીકારનાર (Accepter) ના પરિવારને જાણ કરો
        // ==================================================
        if (accepterUser?.mobile) {
             const familyNumbers = await getFamilyGroupMobiles(accepterUser.mobile);
             console.log("Accepter Family Numbers:", familyNumbers);

             if (familyNumbers.length > 0) {
                 // એપમાં રજીસ્ટર થયેલા યુઝર્સ શોધો
                 const { data: allUsers } = await supabase.from('users').select('id, mobile');
                 
                 const familyUsers = allUsers?.filter(u => 
                    u.mobile && 
                    familyNumbers.includes(getLast10(u.mobile)) && 
                    u.id !== accepterId // પોતાને મેસેજ ન મોકલો
                 );

                 familyUsers?.forEach(fUser => {
                     notifications.push({
                         user_id: fUser.id,
                         title: '✅ રિક્વેસ્ટ સ્વીકારાઈ',
                         message: `તમારા ઘરના સભ્ય '${accName}' એ '${sendName}' (${sendVillage}) ની રિક્વેસ્ટ સ્વીકારી છે.`,
                         type: 'success',
                         related_user_id: senderId
                     });
                 });
             }
        }

        // ==================================================
        // PART B: મોકલનાર (Sender) ના પરિવારને જાણ કરો
        // ==================================================
        if (senderUser?.mobile) {
            const familyNumbers = await getFamilyGroupMobiles(senderUser.mobile);
            console.log("Sender Family Numbers:", familyNumbers);
            
            if (familyNumbers.length > 0) {
                const { data: allUsers } = await supabase.from('users').select('id, mobile');
                
                const familyUsers = allUsers?.filter(u => 
                   u.mobile && 
                   familyNumbers.includes(getLast10(u.mobile)) && 
                   u.id !== senderId // પોતાને મેસેજ ન મોકલો
                );
                
                familyUsers?.forEach(fUser => {
                    notifications.push({
                        user_id: fUser.id,
                        title: '🎉 અભિનંદન! રિક્વેસ્ટ સ્વીકારાઈ',
                        message: `તમારા ઘરના સભ્ય '${sendName}' ની રિક્વેસ્ટ '${accName}' (${accVillage}) એ સ્વીકારી લીધી છે.`,
                        type: 'success',
                        related_user_id: accepterId
                    });
                });
            }
       }

       // Final Insert
       if (notifications.length > 0) {
           await supabase.from('notifications').insert(notifications);
           console.log("Success! Family Notifications Sent:", notifications.length);
       } else {
           console.log("No valid family members found on the app to notify.");
       }

    } catch (error) {
        console.error("Spy Logic Error:", error);
    }
  };

  const handleAccept = async (requestId: any, senderId: any) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;

        const { error: updateError } = await supabase
            .from('requests')
            .update({ status: 'accepted' })
            .eq('id', requestId);

        if (updateError) throw updateError;

        // રિક્વેસ્ટ સ્વીકારતી વખતે પણ ડુપ્લિકેટ ચેક કરો
        const { data: existingRooms } = await supabase
            .from('chat_rooms')
            .select('id')
            .contains('participant_ids', [user.id, senderId])
            .eq('type', 'matrimony');

        if (!existingRooms || existingRooms.length === 0) {
            await supabase
                .from('chat_rooms')
                .insert([{
                    type: 'matrimony',
                    participant_ids: [user.id, senderId] 
                }]);
        }

        // ✅ અહીં જાસૂસી લોજિક કોલ કર્યું (બંને પરિવારને જાણ થશે)
        await notifyFamiliesOnAccept(user.id, senderId);

        alert("રિક્વેસ્ટ સ્વીકારાઈ ગઈ!");
        fetchRequests(); 

    } catch (error) {
        console.error(error);
        alert("રિક્વેસ્ટ સ્વીકારવામાં તકલીફ થઈ છે.");
    }
  };

  const handleReject = async (requestId: any) => {
    if(!confirm("શું તમે આ રિક્વેસ્ટ નકારવા માંગો છો?")) return;
    try {
        await supabase.from('requests').update({ status: 'rejected' }).eq('id', requestId);
        fetchRequests();
    } catch (error) {
        alert("ભૂલ આવી છે.");
    }
  };

  // ✅ SUPER FIX: ડુપ્લિકેટ રૂમની સમસ્યા કાયમ માટે ગાયબ
  const handleStartChat = async (otherId: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return;

    // ૧. બંને યુઝર જેમાં હોય તેવા *બધા* રૂમ શોધો (એક નહીં)
    const { data: existingRooms, error } = await supabase
        .from('chat_rooms')
        .select('id, created_at')
        .contains('participant_ids', [user.id, otherId]) // આ બંને ID હોવા જોઈએ
        .eq('type', 'matrimony')
        .order('created_at', { ascending: true }); // સૌથી જૂનો રૂમ પહેલા

    if (existingRooms && existingRooms.length > 0) {
        // ✅ જો રૂમ મળી જાય (ભલે ૨-૩ હોય), તો હંમેશા *પહેલો* (સૌથી જૂનો) રૂમ જ પકડો
        console.log("Existing Room Found (Using Oldest):", existingRooms[0].id);
        navigate(`/private-chat/${existingRooms[0].id}`);
    } else {
        // ૨. જો એકપણ રૂમ ન હોય, તો જ નવો બનાવો
        console.log("No room found. Creating NEW Room...");
        const { data: newRoom, error: createError } = await supabase
            .from('chat_rooms')
            .insert([{ 
                type: 'matrimony', 
                participant_ids: [user.id, otherId] 
            }])
            .select()
            .single();
            
        if (newRoom) {
            navigate(`/private-chat/${newRoom.id}`);
        } else {
            console.error(createError);
            alert("ચેટ શરૂ કરવામાં ભૂલ છે.");
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-gujarati pb-20">
      <div className="bg-gradient-to-r from-pink-600 to-rose-500 p-8 safe-area-top shadow-xl">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="p-2 bg-white/20 rounded-2xl backdrop-blur-md">
                    <ArrowLeft className="w-7 h-7 text-white" />
                </button>
                <div>
                    <h1 className="text-white font-bold text-2xl">રિક્વેસ્ટ અને ચેટ</h1>
                </div>
            </div>
            <Heart className="text-white w-6 h-6 animate-pulse" />
        </div>
      </div>

      <div className="flex bg-white shadow-md sticky top-0 z-40">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-5 font-bold text-sm ${activeTab === 'received' ? 'text-pink-600 border-b-4 border-pink-600 bg-pink-50/20' : 'text-gray-400'}`}
        >
          <UserPlus size={20} className="inline mr-2" /> આવેલી રિક્વેસ્ટ
        </button>
        <button
          onClick={() => setActiveTab('connected')}
          className={`flex-1 py-5 font-bold text-sm ${activeTab === 'connected' ? 'text-pink-600 border-b-4 border-pink-600 bg-pink-50/20' : 'text-gray-400'}`}
        >
          <MessageCircle size={20} className="inline mr-2" /> જોડાયેલા (Chats)
        </button>
      </div>

      <div className="px-5 py-8">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="animate-spin text-pink-500 w-12 h-12" />
            </div>
        ) : (
            <AnimatePresence mode="wait">
                {activeTab === 'received' ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-[50px] border-2 border-dashed">
                                <Clock className="mx-auto text-gray-300 mb-3" size={50} />
                                <p className="text-gray-500 font-bold">કોઈ નવી રિક્વેસ્ટ નથી.</p>
                            </div>
                        ) : (
                            requests.map((req: any) => (
                                <div key={req.id} className="bg-white p-6 rounded-[35px] shadow-sm flex items-center justify-between">
                                    <div className="flex items-center space-x-5">
                                        <img 
                                            src={req.profile?.image_url || `https://ui-avatars.com/api/?name=${req.profile?.full_name || 'User'}&background=random`} 
                                            className="w-16 h-16 rounded-3xl object-cover" 
                                            alt="Profile"
                                        />
                                        <div>
                                            <h3 className="font-bold text-gray-800">{req.profile?.full_name}</h3>
                                            <p className="text-[11px] text-pink-600 font-black">{req.profile?.village} | {req.profile?.age} વર્ષ</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button onClick={() => handleAccept(req.id, req.sender_id)} className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white"><Check size={20} /></button>
                                        <button onClick={() => handleReject(req.id)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><X size={20} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                        {connections.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-[50px] border-2 border-dashed">
                                <MessageCircle className="mx-auto text-gray-300 mb-3" size={50} />
                                <p className="text-gray-500 font-bold">કોઈ ચેટ નથી.</p>
                            </div>
                        ) : (
                            connections.map((conn: any) => (
                                <div key={conn.id} className="bg-white p-6 rounded-[35px] shadow-sm flex items-center justify-between">
                                    <div className="flex items-center space-x-5">
                                        <img 
                                            src={conn.profile?.image_url || `https://ui-avatars.com/api/?name=${conn.profile?.full_name || 'User'}&background=random`} 
                                            className="w-16 h-16 rounded-3xl object-cover" 
                                            alt="Profile"
                                        />
                                        <div>
                                            <h3 className="font-bold text-gray-800">{conn.profile?.full_name}</h3>
                                            <p className="text-[10px] text-green-600 font-black flex items-center">
                                                <CheckCircle className="w-3.5 h-3.5 mr-1" /> વાતચીત માટે તૈયાર
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleStartChat(conn.otherId)}
                                        className="px-5 py-3 bg-pink-500 text-white rounded-xl font-bold text-sm"
                                    >
                                        ચેટ
                                    </button>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        )}
      </div>

      <div className="px-10 text-center opacity-40 py-4">
        <p className="text-[9px] font-bold text-gray-400 flex items-center justify-center space-x-2">
            <ShieldCheck size={12} />
            <span>Secure community chat</span>
        </p>
      </div>
    </div>
  );
}