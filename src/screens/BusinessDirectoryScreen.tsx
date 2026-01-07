import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Phone, User, Search, Plus, 
  Briefcase, ArrowLeft, Loader2, MessageCircle, 
  Edit2, Trash2, X, Check 
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import BottomNav from '../components/BottomNav';

export default function BusinessDirectoryScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // ✅ Services માટે નવું સ્ટેટ
  const [serviceInput, setServiceInput] = useState('');
  const [servicesList, setServicesList] = useState([]); 

  const [formData, setFormData] = useState({
    business_name: '',
    business_type: 'દુકાન (Shop)',
    description: '',
    owner_name: '',
    village: '',
    taluka: '',
    district: '',
    mobile: ''
  });

  const businessTypes = [
    'દુકાન (Shop)', 'ફેક્ટરી (Factory)', 'સર્વિસ (Service)', 
    'પ્રોફેશનલ (Doctor/Advocate)', 'ખેતી (Farming)', 'અન્ય (Other)'
  ];

  useEffect(() => {
    fetchBusinesses();
    fetchCurrentUserDetails();
  }, []);

  const fetchCurrentUserDetails = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      if (!editingId) {
          let mobile = user.phone || user.user_metadata?.mobile_number || '';
          mobile = mobile.replace(/[^0-9]/g, '').slice(-10);
          let name = user.user_metadata?.full_name || user.user_metadata?.name || '';
          setFormData(prev => ({ ...prev, owner_name: name, mobile: mobile }));
      }
    }
  };

  const fetchBusinesses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000); 
    
    if (error) console.error(error);
    else setBusinesses(data || []);
    setLoading(false);
  };

  // ✅ Service Add Function
  const addService = () => {
    if (serviceInput.trim() !== "") {
      setServicesList([...servicesList, serviceInput.trim()]);
      setServiceInput(""); // ઇનપુટ ખાલી કરો
    }
  };

  // ✅ Service Remove Function
  const removeService = (index) => {
    const newList = servicesList.filter((_, i) => i !== index);
    setServicesList(newList);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.business_name || !formData.mobile) {
      alert("નામ અને મોબાઈલ નંબર જરૂરી છે!");
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("રજીસ્ટ્રેશન કરવા માટે એપમાં લોગિન હોવું જરૂરી છે.");
      setLoading(false);
      return;
    }

    // ✅ ડેટા તૈયાર કરો (Services સાથે)
    const finalData = {
        ...formData,
        services: servicesList // સર્વિસ લિસ્ટ પણ મોકલો
    };

    try {
        if (editingId) {
            const { error } = await supabase
                .from('businesses')
                .update(finalData)
                .eq('id', editingId);

            if (error) throw error;
            alert("તમારો વ્યવસાય અપડેટ થઈ ગયો છે! ✅");
        } else {
            const { error } = await supabase
                .from('businesses')
                .insert([{ ...finalData, user_id: user.id }]);
            
            if (error) throw error;
            alert("તમારો વ્યવસાય રજીસ્ટર થઈ ગયો છે! 🎉");
        }

        resetForm();
        fetchBusinesses();

    } catch (error) {
        alert("Error: " + error.message);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setServicesList([]); // સર્વિસ લિસ્ટ ખાલી કરો
    setFormData(prev => ({ 
        ...prev, business_name: '', description: '', village: '', taluka: '', district: '' 
    }));
    setActiveTab('list');
  };

  const handleEdit = (e, item) => {
      e.stopPropagation();
      setEditingId(item.id);
      
      // ✅ જૂની સર્વિસિસ લોડ કરો
      setServicesList(item.services || []); 
      
      setFormData({
          business_name: item.business_name,
          business_type: item.business_type,
          description: item.description,
          owner_name: item.owner_name,
          village: item.village,
          taluka: item.taluka,
          district: item.district,
          mobile: item.mobile
      });
      setActiveTab('add');
  };

  // ✅ DELETE ACCOUNT FUNCTION (મોટું બટન)
  const handleDeleteAccount = async () => {
      if (window.confirm("ચેતવણી: શું તમે ખરેખર તમારું બિઝનેસ એકાઉન્ટ કાયમ માટે ડિલીટ કરવા માંગો છો? આ ક્રિયા પાછી નહીં લઈ શકાય.")) {
          setLoading(true);
          const { error } = await supabase.from('businesses').delete().eq('id', editingId);
          if (error) {
            alert("Error: " + error.message);
          } else {
            alert("તમારું એકાઉન્ટ ડિલીટ થઈ ગયું છે. 👋");
            resetForm();
            fetchBusinesses();
          }
          setLoading(false);
      }
  };

  const filteredList = businesses.filter(b => {
    const matchesSearch = b.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.owner_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || b.business_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const callNow = (e) => { e.stopPropagation(); };
  const openWhatsApp = (e, mobile) => { e.stopPropagation(); window.open(`https://wa.me/91${mobile}`, '_blank'); };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-gujarati">
      
      {/* Header */}
      <div className="bg-[#1A8FA3] pt-6 pb-4 px-6 rounded-b-[30px] shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/')} className="bg-white/20 p-2 rounded-full text-white backdrop-blur-sm"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-bold text-white tracking-wide">સમાજ વ્યાપાર સેતુ</h1>
        </div>

        {activeTab === 'list' && (
          <div className="relative mb-2">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input type="text" placeholder="ધંધો, ગામ અથવા નામ શોધો..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white rounded-2xl py-3 pl-12 pr-4 outline-none font-medium text-gray-700 shadow-sm" />
          </div>
        )}

        <div className="flex bg-black/10 p-1 rounded-xl mt-4 backdrop-blur-md">
          <button onClick={() => { resetForm(); }} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white text-[#1A8FA3] shadow-md' : 'text-white/80'}`}>વ્યાપાર ડાયરેક્ટરી</button>
          <button onClick={() => setActiveTab('add')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'add' ? 'bg-white text-[#1A8FA3] shadow-md' : 'text-white/80'}`}>{editingId ? "✏️ સુધારો (Edit)" : "+ રજીસ્ટ્રેશન"}</button>
        </div>
      </div>

      <div className="p-5">
        
        {/* VIEW 1: Business List */}
        {activeTab === 'list' && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
              <button onClick={() => setSelectedCategory('All')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === 'All' ? 'bg-[#1A8FA3] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>બધા (All)</button>
              {businessTypes.map(type => (
                <button key={type} onClick={() => setSelectedCategory(type)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === type ? 'bg-[#1A8FA3] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>{type.split(' ')[0]}</button>
              ))}
            </div>

            <div className="space-y-4">
              {loading ? ( <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#1A8FA3]" size={32} /></div> ) : filteredList.length === 0 ? (
                <div className="text-center py-10"><Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-bold">કોઈ વ્યવસાય મળ્યો નથી</p></div>
              ) : (
                filteredList.map((item) => (
                  <div key={item.id} onClick={() => navigate(`/business-details/${item.id}`)} className="relative cursor-pointer bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transform transition-all active:scale-[0.99]">
                    
                    {currentUserId === item.user_id && (
                        <div className="absolute top-2 right-2 flex gap-1 z-20">
                            <button onClick={(e) => handleEdit(e, item)} className="p-2 bg-blue-50 text-blue-600 rounded-full shadow-sm hover:bg-blue-100"><Edit2 size={14} /></button>
                        </div>
                    )}

                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-start">
                      <div>
                        <div className="text-[10px] font-bold text-[#1A8FA3] bg-[#1A8FA3]/10 px-2 py-0.5 rounded-md w-fit mb-1">{item.business_type}</div>
                        <h3 className="text-lg font-bold text-gray-800 leading-tight pr-10">{item.business_name}</h3>
                      </div>
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">{item.business_name.charAt(0)}</div>
                    </div>

                    <div className="p-4">
                      {/* ✅ Services Tags Display */}
                      {item.services && item.services.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mb-3">
                              {item.services.slice(0, 3).map((srv, idx) => (
                                  <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">{srv}</span>
                              ))}
                              {item.services.length > 3 && <span className="text-[10px] text-gray-400">+{item.services.length - 3} વધુ</span>}
                          </div>
                      ) : (
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2 italic">"{item.description || 'વ્યવસાયની કોઈ વિગત નથી...'}"</p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700"><User size={16} className="text-gray-400" /> <span className="font-semibold">{item.owner_name}</span></div>
                        <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin size={16} className="text-orange-500" /> <span>{item.village}, {item.taluka}</span></div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <a href={`tel:${item.mobile}`} onClick={callNow} className="flex-1 bg-[#1A8FA3] text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:bg-[#157a8c]"><Phone size={16} /> Call</a>
                        <button onClick={(e) => openWhatsApp(e, item.mobile)} className="flex-1 bg-[#25D366] text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:bg-[#1ebc57]"><MessageCircle size={16} /> WhatsApp</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* VIEW 2: Registration / Edit Form */}
        {activeTab === 'add' && (
          <form onSubmit={handleRegister} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 space-y-4">
            <div className="text-center mb-4">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-600">{editingId ? <Edit2 size={32} /> : <Plus size={32} />}</div>
                <h2 className="text-xl font-bold text-gray-800">{editingId ? "વ્યવસાય સુધારો" : "નવો વ્યવસાય ઉમેરો"}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 ml-2">બિઝનેસનું નામ</label>
                <input required placeholder="ઉદા. જય ગણેશ ટ્રેડર્સ" className="w-full bg-gray-50 p-3.5 rounded-2xl outline-none border border-gray-200 focus:border-[#1A8FA3]"
                  value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 ml-2">બિઝનેસ પ્રકાર</label>
                <div className="relative">
                    <select className="w-full bg-gray-50 p-3.5 rounded-2xl outline-none border border-gray-200 appearance-none"
                    value={formData.business_type} onChange={e => setFormData({...formData, business_type: e.target.value})}>
                    {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
              </div>

              {/* ✅ NEW SERVICES INPUT SECTION */}
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <label className="text-xs font-bold text-indigo-600 ml-1">સેવાઓ / સર્વિસ (એક-એક કરીને ઉમેરો)</label>
                  <div className="flex gap-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="ઉદા. ઝેરોક્ષ, મની ટ્રાન્સફર..." 
                        className="flex-1 bg-white p-3 rounded-xl outline-none border border-indigo-200 text-sm"
                        value={serviceInput}
                        onChange={(e) => setServiceInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                      />
                      <button type="button" onClick={addService} className="bg-indigo-600 text-white p-3 rounded-xl font-bold shadow-md active:scale-95"><Plus size={20} /></button>
                  </div>
                  
                  {/* Added Services List (Chips) */}
                  <div className="flex flex-wrap gap-2 mt-3">
                      {servicesList.map((srv, index) => (
                          <div key={index} className="bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
                              {srv}
                              <button type="button" onClick={() => removeService(index)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                          </div>
                      ))}
                      {servicesList.length === 0 && <p className="text-xs text-gray-400 italic mt-1">હજુ કોઈ સર્વિસ ઉમેરી નથી.</p>}
                  </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 ml-2">વધુ વિગત (Description)</label>
                <textarea placeholder="અમારા ત્યાં શું મળશે..." className="w-full bg-gray-50 p-3.5 rounded-2xl outline-none border border-gray-200 h-24 resize-none"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>

            <div className="h-px bg-gray-100 my-2"></div>

            <div className="space-y-4">
              <div><label className="text-xs font-bold text-gray-500 ml-2">માલિકનું નામ</label><input required className="w-full bg-gray-50 p-3.5 rounded-2xl outline-none border border-gray-200" value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="ગામ" className="bg-gray-50 p-3.5 rounded-2xl outline-none border border-gray-200" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} />
                <input placeholder="તાલુકો" className="bg-gray-50 p-3.5 rounded-2xl outline-none border border-gray-200" value={formData.taluka} onChange={e => setFormData({...formData, taluka: e.target.value})} />
              </div>
              <input required placeholder="જીલ્લો" className="w-full bg-gray-50 p-3.5 rounded-2xl outline-none border border-gray-200" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} />
              <div><label className="text-xs font-bold text-gray-500 ml-2">મોબાઈલ નંબર</label><input required type="tel" maxLength={10} className="w-full bg-gray-50 p-3.5 rounded-2xl outline-none border border-gray-200 font-bold tracking-widest text-lg" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-[#1A8FA3] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-cyan-200 mt-6 active:scale-95 transition-transform flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : (editingId ? "Update Business" : "Register Business")}
            </button>
            
            {/* ✅ DELETE BUSINESS BUTTON (ફક્ત એડિટ મોડમાં) */}
            {editingId && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <button type="button" onClick={handleDeleteAccount} className="w-full bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
                        <Trash2 size={18} /> Delete Business Account
                    </button>
                </div>
            )}

            {editingId && (
                <button type="button" onClick={resetForm} className="w-full text-gray-400 py-3 font-bold text-sm">Cancel Edit</button>
            )}
          </form>
        )}
      </div>

      <BottomNav />
    </div>
  );
}