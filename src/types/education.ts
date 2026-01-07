/**
 * Education Module Types - શિક્ષણ અને ભવિષ્ય Module
 * Real data types for Youware Backend integration
 */

// Study Level Options
export type StudyLevel = 
  | 'School'
  | 'College'
  | 'Diploma'
  | 'ITI'
  | 'Other';

// Student Profile
export interface Student {
  id: number;
  fullName: string;           // પૂરું નામ
  age: number;                // ઉંમર
  studyLevel: StudyLevel;     // અભ્યાસ લેવલ
  fieldOfStudy: string;       // અભ્યાસ ક્ષેત્ર
  currentInstitution: string; // હાલની સંસ્થા
  futureGoal: string;         // ભવિષ્યનું લક્ષ્ય
  isFirstGraduate: boolean;   // પરિવારનો પહેલો graduate
  village: string;            // ગામ
  taluko: string;             // તાલુકો
  district: string;           // જિલ્લો
  gol: string;                // ગોળ
  encryptedYwId: string;      // User identifier
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  fullName: string;
  age: string;
  studyLevel: StudyLevel | '';
  fieldOfStudy: string;
  currentInstitution: string;
  futureGoal: string;
  isFirstGraduate: boolean;
  village: string;
  taluko: string;
  district: string;
  gol: string;
}

// Scholarship
export interface Scholarship {
  id: number;
  name: string;               // સ્કોલરશિપ નામ
  eligibility: string;        // કોણ apply કરી શકે
  requiredDocuments: string;  // જરૂરી documents
  lastDate: string;           // Last date
  applyLink: string;          // Apply link
  contactDetails: string;     // Contact details
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScholarshipFormData {
  name: string;
  eligibility: string;
  requiredDocuments: string;
  lastDate: string;
  applyLink: string;
  contactDetails: string;
}

// Mentor
export interface Mentor {
  id: number;
  name: string;               // Mentor નામ
  education: string;          // અભ્યાસ
  profession: string;         // Profession
  experience: string;         // Experience
  expertiseArea: string;      // Expertise area
  contactVisible: boolean;    // Contact visibility
  contactInfo: string;        // Contact info (if visible)
  isApproved: boolean;        // Admin approval status
  encryptedYwId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MentorFormData {
  name: string;
  education: string;
  profession: string;
  experience: string;
  expertiseArea: string;
  contactVisible: boolean;
  contactInfo: string;
}

// Mentorship Request
export interface MentorshipRequest {
  id: number;
  studentId: number;
  mentorId: number;
  status: 'pending' | 'accepted' | 'rejected';
  studentName: string;
  mentorName: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

// Achiever (સમાજના ગૌરવ)
export interface Achiever {
  id: number;
  name: string;               // નામ
  photo: string;              // Photo URL
  educationJourney: string;   // Education journey
  struggles: string;          // Struggles
  adviceForYouth: string;     // Advice for youth
  achievements: string;       // Key achievements
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AchieverFormData {
  name: string;
  photo: string;
  educationJourney: string;
  struggles: string;
  adviceForYouth: string;
  achievements: string;
}

// Daily Guidance Post
export interface GuidancePost {
  id: number;
  title: string;              // Title
  content: string;            // Content
  topic: 'career' | 'skills' | 'myths' | 'general'; // Topic type
  isActive: boolean;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuidancePostFormData {
  title: string;
  content: string;
  topic: 'career' | 'skills' | 'myths' | 'general';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Search Filters
export interface StudentSearchFilters {
  studyLevel?: StudyLevel;
  village?: string;
  gol?: string;
  fieldOfStudy?: string;
  query?: string;
}

export interface ScholarshipSearchFilters {
  isActive?: boolean;
  query?: string;
}

export interface MentorSearchFilters {
  expertiseArea?: string;
  isApproved?: boolean;
  query?: string;
}
