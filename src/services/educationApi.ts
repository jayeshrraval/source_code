/**
 * Education Module API Service
 * Real API calls to Youware Backend
 * Backend will be implemented later - this provides the interface
 */

import type {
  Student,
  StudentFormData,
  StudentSearchFilters,
  Scholarship,
  ScholarshipFormData,
  ScholarshipSearchFilters,
  Mentor,
  MentorFormData,
  MentorSearchFilters,
  MentorshipRequest,
  Achiever,
  AchieverFormData,
  GuidancePost,
  GuidancePostFormData,
  ApiResponse,
  PaginatedResponse,
} from '../types/education';

const API_BASE = 'https://backend.youware.com';

// Helper to get headers
const getHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
});

// ==================== STUDENT API ====================

export async function getStudents(
  filters?: StudentSearchFilters,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Student>> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.studyLevel) params.append('studyLevel', filters.studyLevel);
    if (filters?.village) params.append('village', filters.village);
    if (filters?.gol) params.append('gol', filters.gol);
    if (filters?.fieldOfStudy) params.append('fieldOfStudy', filters.fieldOfStudy);
    if (filters?.query) params.append('q', filters.query);

    const res = await fetch(`${API_BASE}/api/students?${params}`, {
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      console.error('Failed to fetch students:', res.status, res.statusText);
      return { success: false, data: [], total: 0, page, limit };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching students:', error);
    return { success: false, data: [], total: 0, page, limit };
  }
}

export async function getStudentById(id: number): Promise<ApiResponse<Student>> {
  try {
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      console.error('Failed to fetch student:', res.status, res.statusText);
      return { success: false, error: 'Student not found' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching student:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function createStudent(data: StudentFormData): Promise<ApiResponse<Student>> {
  try {
    const res = await fetch(`${API_BASE}/api/students`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      console.error('Failed to create student:', res.status, res.statusText);
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || 'Failed to create student' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error creating student:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function updateStudent(id: number, data: Partial<StudentFormData>): Promise<ApiResponse<Student>> {
  try {
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      console.error('Failed to update student:', res.status, res.statusText);
      return { success: false, error: 'Failed to update student' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error updating student:', error);
    return { success: false, error: 'Network error' };
  }
}

// ==================== SCHOLARSHIP API ====================

export async function getScholarships(
  filters?: ScholarshipSearchFilters,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Scholarship>> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.query) params.append('q', filters.query);

    const res = await fetch(`${API_BASE}/api/scholarships?${params}`, {
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      console.error('Failed to fetch scholarships:', res.status, res.statusText);
      return { success: false, data: [], total: 0, page, limit };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    return { success: false, data: [], total: 0, page, limit };
  }
}

export async function getScholarshipById(id: number): Promise<ApiResponse<Scholarship>> {
  try {
    const res = await fetch(`${API_BASE}/api/scholarships/${id}`, {
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Scholarship not found' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function createScholarship(data: ScholarshipFormData): Promise<ApiResponse<Scholarship>> {
  try {
    const res = await fetch(`${API_BASE}/api/scholarships`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Failed to create scholarship' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error creating scholarship:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function updateScholarship(id: number, data: Partial<ScholarshipFormData>): Promise<ApiResponse<Scholarship>> {
  try {
    const res = await fetch(`${API_BASE}/api/scholarships/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Failed to update scholarship' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error updating scholarship:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function deleteScholarship(id: number): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_BASE}/api/scholarships/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Failed to delete scholarship' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    return { success: false, error: 'Network error' };
  }
}

// ==================== MENTOR API ====================

export async function getMentors(
  filters?: MentorSearchFilters,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Mentor>> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.expertiseArea) params.append('expertiseArea', filters.expertiseArea);
    if (filters?.isApproved !== undefined) params.append('isApproved', filters.isApproved.toString());
    if (filters?.query) params.append('q', filters.query);

    const res = await fetch(`${API_BASE}/api/mentors?${params}`, {
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      return { success: false, data: [], total: 0, page, limit };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return { success: false, data: [], total: 0, page, limit };
  }
}

export async function getMentorById(id: number): Promise<ApiResponse<Mentor>> {
  try {
    const res = await fetch(`${API_BASE}/api/mentors/${id}`, {
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Mentor not found' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching mentor:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function registerMentor(data: MentorFormData): Promise<ApiResponse<Mentor>> {
  try {
    const res = await fetch(`${API_BASE}/api/mentors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Failed to register mentor' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error registering mentor:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function approveMentor(id: number, approved: boolean): Promise<ApiResponse<Mentor>> {
  try {
    const res = await fetch(`${API_BASE}/api/mentors/${id}/approve`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ approved }),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Failed to update mentor status' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error approving mentor:', error);
    return { success: false, error: 'Network error' };
  }
}

// ==================== MENTORSHIP REQUEST API ====================

export async function sendMentorshipRequest(
  mentorId: number,
  message: string
): Promise<ApiResponse<MentorshipRequest>> {
  try {
    const res = await fetch(`${API_BASE}/api/mentorship-requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mentorId, message }),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Failed to send request' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error sending mentorship request:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function getMentorshipRequests(
  type: 'sent' | 'received'
): Promise<PaginatedResponse<MentorshipRequest>> {
  try {
    const res = await fetch(`${API_BASE}/api/mentorship-requests?type=${type}`, {
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      return { success: false, data: [], total: 0, page: 1, limit: 20 };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching mentorship requests:', error);
    return { success: false, data: [], total: 0, page: 1, limit: 20 };
  }
}

export async function respondToMentorshipRequest(
  requestId: number,
  status: 'accepted' | 'rejected'
): Promise<ApiResponse<MentorshipRequest>> {
  try {
    const res = await fetch(`${API_BASE}/api/mentorship-requests/${requestId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Failed to respond to request' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error responding to mentorship request:', error);
    return { success: false, error: 'Network error' };
  }
}

// ==================== ACHIEVERS API ====================

export async function getAchievers(page = 1, limit = 20): Promise<PaginatedResponse<Achiever>> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const res = await fetch(`${API_BASE}/api/achievers?${params}`, {
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      return { success: false, data: [], total: 0, page, limit };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching achievers:', error);
    return { success: false, data: [], total: 0, page, limit };
  }
}

export async function getAchieverById(id: number): Promise<ApiResponse<Achiever>> {
  try {
    const res = await fetch(`${API_BASE}/api/achievers/${id}`, {
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Achiever not found' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching achiever:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function createAchiever(data: AchieverFormData): Promise<ApiResponse<Achiever>> {
  try {
    const res = await fetch(`${API_BASE}/api/achievers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Failed to create achiever' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error creating achiever:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function updateAchiever(id: number, data: Partial<AchieverFormData>): Promise<ApiResponse<Achiever>> {
  try {
    const res = await fetch(`${API_BASE}/api/achievers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Failed to update achiever' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error updating achiever:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function deleteAchiever(id: number): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_BASE}/api/achievers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Failed to delete achiever' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting achiever:', error);
    return { success: false, error: 'Network error' };
  }
}

// ==================== DAILY GUIDANCE API ====================

export async function getGuidancePosts(page = 1, limit = 20): Promise<PaginatedResponse<GuidancePost>> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const res = await fetch(`${API_BASE}/api/guidance-posts?${params}`, {
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      return { success: false, data: [], total: 0, page, limit };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching guidance posts:', error);
    return { success: false, data: [], total: 0, page, limit };
  }
}

export async function getTodayGuidance(): Promise<ApiResponse<GuidancePost>> {
  try {
    const res = await fetch(`${API_BASE}/api/guidance-posts/today`, {
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      return { success: false, error: 'No guidance for today' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching today guidance:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function createGuidancePost(data: GuidancePostFormData): Promise<ApiResponse<GuidancePost>> {
  try {
    const res = await fetch(`${API_BASE}/api/guidance-posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Failed to create guidance post' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error creating guidance post:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function updateGuidancePost(id: number, data: Partial<GuidancePostFormData>): Promise<ApiResponse<GuidancePost>> {
  try {
    const res = await fetch(`${API_BASE}/api/guidance-posts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Failed to update guidance post' };
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error updating guidance post:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function deleteGuidancePost(id: number): Promise<ApiResponse<void>> {
  try {
    const res = await fetch(`${API_BASE}/api/guidance-posts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      return { success: false, error: 'Failed to delete guidance post' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting guidance post:', error);
    return { success: false, error: 'Network error' };
  }
}
