// API Configuration - Dynamic API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'https://varahasdc.co.in/api';


// User credentials from database
export const USER_CREDENTIALS = {
  reception: { username: 'reception', password: 'Admin@321', role: 'reception' },
  doctor: { username: 'doctor', password: 'Admin@321', role: 'doctor' },
  console: { username: 'console', password: 'Admin@321', role: 'console' },
  admin: { username: 'admin', password: 'Admin@Varaha', role: 'admin' },

  superadmin: { username: 'superadmin', password: 'Super@321', role: 'superadmin' }
};

// API Client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Superadmin APIs
  async getSuperadminStats() {
    return this.request('/superadmin/stats');
  }

  async getSuperadminPatientReport(fromDate?: string, toDate?: string) {
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    
    return this.request(`/superadmin/patient-report?${params}`);
  }

  // Admin APIs
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminHospitals() {
    return this.request('/admin/hospitals');
  }

  async getAdminDoctors() {
    return this.request('/admin/doctors');
  }

  async getAdminPatients(status?: string, limit?: number, offset?: number) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return this.request(`/admin/patients?${params}`);
  }

  async getAdminDailyRevenue(date?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    return this.request(`/admin/daily-revenue?${params}`);
  }

  // Doctor APIs
  async getDoctorStats() {
    return this.request('/doctor/stats');
  }

  async getDoctorPendingPatients() {
    return this.request('/doctor/pending-patients');
  }

  async getDoctorPatient(cro: string) {
    return this.request(`/doctor/patient/${cro}`);
  }

  async addDoctorReport(cro: string, reportDetail: string, remark: string) {
    return this.request('/doctor/add-report', {
      method: 'POST',
      body: JSON.stringify({ cro, report_detail: reportDetail, remark }),
    });
  }

  async getDoctorDailyReport(date?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    return this.request(`/doctor/daily-report?${params}`);
  }

  // Console APIs
  async getConsoleStats() {
    return this.request('/console/stats');
  }

  async getConsoleQueue(status?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    return this.request(`/console/queue?${params}`);
  }

  async updateConsoleStatus(cro: string, status: number, remark: string) {
    return this.request('/console/update-status', {
      method: 'POST',
      body: JSON.stringify({ cro, status, remark }),
    });
  }

  async getConsoleDailyReport(date?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    return this.request(`/console/daily-report?${params}`);
  }

  async addToConsoleQueue(cro: string) {
    return this.request('/console/add-to-queue', {
      method: 'POST',
      body: JSON.stringify({ cro }),
    });
  }



  // Reports APIs
  async getPatientReport(fromDate?: string, toDate?: string) {
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    
    return this.request(`/reports/patient-report?${params}`);
  }

  async getDailyRevenue(date?: string) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    return this.request(`/reports/daily-revenue?${params}`);
  }

  async getConsoleReport(fromDate?: string, toDate?: string) {
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    
    return this.request(`/reports/console-report?${params}`);
  }

  // Patients APIs
  async getPatients(limit?: number, offset?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return this.request(`/patients?${params}`);
  }

  async getPatientByCro(cro: string) {
    return this.request(`/patients/cro/${cro}`);
  }

  async getDoctors() {
    return this.request('/patients/doctors');
  }

  async getHospitals() {
    return this.request('/patients/hospitals');
  }

  async getScans() {
    return this.request('/patients/scans');
  }

  // Patient Registration
  async registerPatient(patientData: {
    patient_name: string;
    age: number;
    gender: string;
    mobile: string;
    doctor_name: number;
    hospital_id: number;
    scan_type: number;
    amount: number;
    appointment_date?: string;
    appointment_time?: string;
    notes?: string;
  }) {
    return this.request('/patients/register', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  // Slot Management
  async getAvailableSlots(date: string, doctorId?: number) {
    const params = new URLSearchParams();
    params.append('date', date);
    if (doctorId) params.append('doctor_id', doctorId.toString());
    
    return this.request(`/patients/slots/available?${params}`);
  }

  // Patient Status Updates
  async updatePatientStatus(patientId: number, status: string, notes?: string) {
    return this.request(`/patients/${patientId}/update-status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Patient Search
  async searchPatients(params: {
    q?: string;
    date_from?: string;
    date_to?: string;
    status?: string;
    doctor_id?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request(`/patients/search?${searchParams}`);
  }

  // Dashboard APIs
  async getRecentPatients(limit: number = 10) {
    return this.request(`/dashboard/recent-patients?limit=${limit}`);
  }

  async getQuickStats() {
    return this.request('/dashboard/quick-stats');
  }

  async getTodayAppointments() {
    return this.request('/dashboard/appointments-today');
  }

  // Reports APIs
  async getFinancialSummary(fromDate?: string, toDate?: string) {
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    
    return this.request(`/reports/financial-summary?${params}`);
  }

  async getMonthlyAnalytics(year?: number) {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    
    return this.request(`/reports/monthly-analytics?${params}`);
  }

  async getPatientStatusReport(fromDate?: string, toDate?: string) {
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    
    return this.request(`/reports/patient-status-report?${params}`);
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create API client instance
export const api = new ApiClient(API_BASE);

// Export types
export interface User {
  id: number;
  username: string;
  role: string;
  name?: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  total?: number;
  error?: string;
}

export interface Patient {
  patient_id: number;
  cro: string;
  patient_name: string;
  age: number;
  gender: string;
  mobile: string;
  date: string;
  amount: number;
  doctor_name?: string;
  hospital_name?: string;
  scan_name?: string;
  status?: string;
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
}

export interface Doctor {
  d_id: number;
  doctor_name: string;
  specialization?: string;
  phone?: string;
  email?: string;
}

export interface Hospital {
  h_id: number;
  hospital_name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Scan {
  scan_id: number;
  scan_name: string;
  price?: number;
  description?: string;
}

export interface DashboardStats {
  currentMonthTotal?: number;
  lastMonthTotal?: number;
  todayScans: number;
  todayReceived: number;
  todayDue: number;
  todayWithdraw: number;
  cashInHand: number;
  totalAmount?: number;
}

export default api;