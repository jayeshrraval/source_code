import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Users,
  Briefcase,
  Award,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ChevronDown,
  Send,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import type { Mentor, MentorFormData, MentorshipRequest } from '../types/education';
import { getMentors, registerMentor, sendMentorshipRequest, getMentorshipRequests } from '../services/educationApi';

const expertiseAreas = [
  'Engineering',
  'Medical',
  'Commerce',
  'Arts',
  'Law',
  'Agriculture',
  'IT & Computer',
  'Government Jobs',
  'Business',
  'Other',
];

const initialMentorForm: MentorFormData = {
  name: '',
  education: '',
  profession: '',
  experience: '',
  expertiseArea: '',
  contactVisible: false,
  contactInfo: '',
};

export default function MentorshipScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'mentors' | 'register' | 'requests'>('mentors');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExpertise, setFilterExpertise] = useState('');

  // Form state
  const [formData, setFormData] = useState<MentorFormData>(initialMentorForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Request modal
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    if (activeTab === 'mentors') {
      fetchMentors();
    } else if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [activeTab, filterExpertise]);

  const fetchMentors = async () => {
    setLoading(true);
    const response = await getMentors({
      isApproved: true,
      expertiseArea: filterExpertise || undefined,
      query: searchQuery || undefined,
    });
    if (response.success && response.data) {
      setMentors(response.data);
    }
    setLoading(false);
  };

  const fetchRequests = async () => {
    setLoading(true);
    const response = await getMentorshipRequests('sent');
    if (response.success && response.data) {
      setRequests(response.data);
    }
    setLoading(false);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'નામ જરૂરી છે';
    if (!formData.education.trim()) errors.education = 'અભ્યાસ જરૂરી છે';
    if (!formData.profession.trim()) errors.profession = 'Profession જરૂરી છે';
    if (!formData.expertiseArea) errors.expertiseArea = 'Expertise area પસંદ કરો';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const response = await registerMentor(formData);
    
    if (response.success) {
      setShowSuccess(true);
      setFormData(initialMentorForm);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab('mentors');
      }, 2000);
    } else {
      setFormErrors({ submit: response.error || 'કંઈક ખોટું થયું' });
    }
    setIsSubmitting(false);
  };

  const handleSendRequest = async () => {
    if (!selectedMentor || !requestMessage.trim()) return;

    setSendingRequest(true);
    const response = await sendMentorshipRequest(selectedMentor.id, requestMessage);
    
    if (response.success) {
      setSelectedMentor(null);
      setRequestMessage('');
      // Show success feedback
    }
    setSendingRequest(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            <span>પેન્ડિંગ</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>સ્વીકાર્યું</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            <span>નકાર્યું</span>
          </span>
        );
      default:
        return null;
    }
  };

  const renderMentorCard = (mentor: Mentor) => (
    <motion.div
      key={mentor.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card p-5 mb-4"
    >
      <div className="flex items-start space-x-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
          <Users className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-gujarati font-semibold text-gray-800 truncate">
            {mentor.name}
          </h3>
          <p className="text-gray-500 text-sm font-gujarati truncate">
            {mentor.profession}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <Award className="w-4 h-4 text-mint" />
          <span className="text-gray-600 font-gujarati">{mentor.education}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Briefcase className="w-4 h-4 text-mint" />
          <span className="text-gray-600 font-gujarati">
            {mentor.experience} અનુભવ
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-gujarati">
            {mentor.expertiseArea}
          </span>
        </div>
      </div>

      <button
        onClick={() => setSelectedMentor(mentor)}
        className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-gujarati font-medium flex items-center justify-center space-x-2"
      >
        <MessageCircle className="w-4 h-4" />
        <span>માર્ગદર્શન માટે Request મોકલો</span>
      </button>
    </motion.div>
  );

  const renderMentorsTab = () => (
    <div className="px-6 py-4">
      {/* Search & Filter */}
      <div className="flex space-x-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Mentor શોધો..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchMentors()}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-mint focus:ring-2 focus:ring-mint/20 font-gujarati text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Expertise Filter */}
      <div className="flex overflow-x-auto space-x-2 pb-4 -mx-6 px-6 scrollbar-hide">
        <button
          onClick={() => setFilterExpertise('')}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-gujarati ${
            !filterExpertise
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          બધા
        </button>
        {expertiseAreas.map((area) => (
          <button
            key={area}
            onClick={() => setFilterExpertise(area)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-gujarati ${
              filterExpertise === area
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Mentors List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : mentors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-gujarati">કોઈ Mentor મળ્યા નથી</p>
          <p className="text-gray-400 text-sm font-gujarati mt-1">
            Mentor તરીકે રજીસ્ટર કરો અને સમાજની સેવા કરો
          </p>
        </motion.div>
      ) : (
        <div>{mentors.map(renderMentorCard)}</div>
      )}

      {/* Quote */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border-l-4 border-purple-500">
        <p className="font-gujarati text-gray-700 text-sm italic">
          "એક અનુભવી વ્યક્તિ = અનેક ભવિષ્ય બચાવી શકે"
        </p>
      </div>
    </div>
  );

  const renderRegisterTab = () => (
    <div className="px-6 py-4">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          >
            <div className="bg-white rounded-3xl p-8 text-center max-w-sm">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="font-gujarati font-bold text-xl text-gray-800 mb-2">
                Request મોકલાઈ ગઈ!
              </h3>
              <p className="text-gray-600 font-gujarati text-sm">
                Admin approval પછી તમારી પ્રોફાઈલ દેખાશે
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="premium-card p-4 mb-6 bg-purple-50 border-l-4 border-purple-500">
        <p className="font-gujarati text-purple-800 text-sm">
          <strong>નોંધ:</strong> Mentor બનવા માટે Admin approval જરૂરી છે. 
          Approval પછી તમારી પ્રોફાઈલ public થશે.
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-sm font-gujarati text-gray-700 mb-2 block">નામ *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="તમારું પૂરું નામ"
            className={`w-full px-4 py-3 rounded-xl border ${formErrors.name ? 'border-red-400' : 'border-gray-200'} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-gujarati`}
          />
          {formErrors.name && <p className="text-red-500 text-xs mt-1 font-gujarati">{formErrors.name}</p>}
        </div>

        {/* Education */}
        <div>
          <label className="text-sm font-gujarati text-gray-700 mb-2 block">અભ્યાસ *</label>
          <input
            type="text"
            value={formData.education}
            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
            placeholder="દા.ત. B.E., M.B.B.S., M.Com"
            className={`w-full px-4 py-3 rounded-xl border ${formErrors.education ? 'border-red-400' : 'border-gray-200'} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-gujarati`}
          />
          {formErrors.education && <p className="text-red-500 text-xs mt-1 font-gujarati">{formErrors.education}</p>}
        </div>

        {/* Profession */}
        <div>
          <label className="text-sm font-gujarati text-gray-700 mb-2 block">Profession *</label>
          <input
            type="text"
            value={formData.profession}
            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            placeholder="દા.ત. Software Engineer, Doctor"
            className={`w-full px-4 py-3 rounded-xl border ${formErrors.profession ? 'border-red-400' : 'border-gray-200'} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-gujarati`}
          />
          {formErrors.profession && <p className="text-red-500 text-xs mt-1 font-gujarati">{formErrors.profession}</p>}
        </div>

        {/* Experience */}
        <div>
          <label className="text-sm font-gujarati text-gray-700 mb-2 block">અનુભવ</label>
          <input
            type="text"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            placeholder="દા.ત. 5 વર્ષ"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-gujarati"
          />
        </div>

        {/* Expertise Area */}
        <div className="relative">
          <label className="text-sm font-gujarati text-gray-700 mb-2 block">Expertise Area *</label>
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'expertise' ? null : 'expertise')}
            className={`w-full px-4 py-3 rounded-xl border ${formErrors.expertiseArea ? 'border-red-400' : 'border-gray-200'} bg-white flex items-center justify-between font-gujarati`}
          >
            <span className={formData.expertiseArea ? 'text-gray-800' : 'text-gray-400'}>
              {formData.expertiseArea || 'પસંદ કરો'}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openDropdown === 'expertise' ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {openDropdown === 'expertise' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto"
              >
                {expertiseAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => {
                      setFormData({ ...formData, expertiseArea: area });
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-purple-50 font-gujarati text-sm"
                  >
                    {area}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {formErrors.expertiseArea && <p className="text-red-500 text-xs mt-1 font-gujarati">{formErrors.expertiseArea}</p>}
        </div>

        {/* Contact Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-gujarati text-gray-800 text-sm">Contact visible કરવો?</p>
            <p className="font-gujarati text-gray-500 text-xs">Students સીધો contact કરી શકશે</p>
          </div>
          <button
            onClick={() => setFormData({ ...formData, contactVisible: !formData.contactVisible })}
            className={`w-12 h-7 rounded-full transition-colors ${formData.contactVisible ? 'bg-purple-500' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.contactVisible ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {formData.contactVisible && (
          <div>
            <label className="text-sm font-gujarati text-gray-700 mb-2 block">Contact Info</label>
            <input
              type="text"
              value={formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              placeholder="Mobile / Email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-gujarati"
            />
          </div>
        )}

        {formErrors.submit && (
          <div className="p-4 bg-red-50 rounded-xl">
            <p className="text-red-600 text-sm font-gujarati">{formErrors.submit}</p>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleRegister}
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-gujarati font-semibold shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            'Mentor તરીકે Register કરો'
          )}
        </motion.button>
      </div>
    </div>
  );

  const renderRequestsTab = () => (
    <div className="px-6 py-4">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-gujarati">કોઈ Request નથી</p>
          <p className="text-gray-400 text-sm font-gujarati mt-1">
            Mentors ને Request મોકલો
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-gujarati font-semibold text-gray-800">
                  {request.mentorName}
                </h3>
                {getStatusBadge(request.status)}
              </div>
              <p className="text-gray-600 text-sm font-gujarati line-clamp-2">
                {request.message}
              </p>
              {request.status === 'accepted' && (
                <button className="mt-3 w-full py-2 bg-green-500 text-white rounded-xl font-gujarati text-sm flex items-center justify-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat શરૂ કરો</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

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
                માર્ગદર્શન (Mentorship)
              </h1>
              <p className="text-mint text-sm font-gujarati">
                Mentorship Network
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pb-4 space-x-2">
          <button
            onClick={() => setActiveTab('mentors')}
            className={`flex-1 py-2.5 rounded-xl font-gujarati font-medium text-sm transition-all ${
              activeTab === 'mentors' ? 'bg-white text-deep-blue shadow-lg' : 'bg-white/10 text-white'
            }`}
          >
            Mentors
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 rounded-xl font-gujarati font-medium text-sm transition-all ${
              activeTab === 'register' ? 'bg-white text-deep-blue shadow-lg' : 'bg-white/10 text-white'
            }`}
          >
            <Plus className="w-4 h-4 inline-block mr-1" />
            Register
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2.5 rounded-xl font-gujarati font-medium text-sm transition-all ${
              activeTab === 'requests' ? 'bg-white text-deep-blue shadow-lg' : 'bg-white/10 text-white'
            }`}
          >
            Requests
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'mentors' && renderMentorsTab()}
      {activeTab === 'register' && renderRegisterTab()}
      {activeTab === 'requests' && renderRequestsTab()}

      {/* Request Modal */}
      <AnimatePresence>
        {selectedMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setSelectedMentor(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl p-6"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <h2 className="font-gujarati font-bold text-xl text-gray-800 mb-2">
                {selectedMentor.name} ને Request મોકલો
              </h2>
              <p className="text-gray-500 font-gujarati text-sm mb-4">
                તમારો પરિચય અને માર્ગદર્શન માટેનો હેતુ લખો
              </p>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="તમારો message લખો..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-gujarati resize-none mb-4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedMentor(null)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-gujarati text-gray-600"
                >
                  રદ કરો
                </button>
                <button
                  onClick={handleSendRequest}
                  disabled={!requestMessage.trim() || sendingRequest}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-gujarati font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {sendingRequest ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>મોકલો</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
