// API Configuration for external Varaha API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://varaha-api-qpkj.vercel.app/api';

// API endpoints mapping
export const API_ENDPOINTS = {
  // Reception endpoints
  reception: {
    stats: '/admin/stats', // Using admin stats for reception
    patients: '/patients',
    hospitals: '/admin/hospitals',
    doctors: '/admin/doctors',
    categories: '/admin/categories',
    scans: '/admin/scans'
  },
  
  // Admin endpoints
  admin: {
    stats: '/admin/stats',
    patients: '/admin/patient-list',
    hospitals: '/admin/hospitals',
    categories: '/admin/categories',
    dailyRevenue: '/admin/daily-revenue-report'
  },
  
  // Patient endpoints
  patients: {
    list: '/patients',
    register: '/patients/register',
    search: '/patients/search',
    updateStatus: '/patients/{id}/update-status'
  }
};

// Helper function to build API URL
export function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

// Helper function to make API calls with error handling
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = buildApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}