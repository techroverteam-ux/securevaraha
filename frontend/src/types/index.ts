export interface Patient {
  patient_id?: number;
  pre: string;
  patient_name: string;
  hospital_id: number;
  doctor_name: number;
  cro: string;
  age: string;
  gender: string;
  category: string;
  p_uni_id_submit?: string;
  p_uni_id_name?: string;
  enroll_no: string;
  date: string;
  contact_number: string;
  address: string;
  city: string;
  scan_type: string;
  total_scan: number;
  amount: number;
  discount: number;
  amount_reci: number;
  amount_due: number;
  allot_date: string;
  allot_time: number;
  scan_date?: string;
  allot_time_out?: number;
  admin_id: number;
  scan_status: number;
}

export interface Hospital {
  h_id?: number;
  h_name: string;
  h_short: string;
  h_address?: string;
  h_contact?: string;
}

export interface Doctor {
  d_id?: number;
  dname: string;
  specialization?: string;
  contact?: string;
}

export interface Scan {
  s_id?: number;
  s_name: string;
  s_amount: number;
  category?: string;
}

export interface User {
  id?: number;
  username: string;
  password?: string;
  admin_type: 'admin' | 'superadmin' | 'doctor' | 'nurse' | 'console' | 'reception';
  hospital_id?: number;
}

export interface ReportData {
  id?: number;
  patient_name: string;
  cro: string;
  hospital_name: string;
  doctor_name: string;
  amount: number;
  date: string;
  category: string;
  scan_type: string;
  status: string;
}

export interface RevenueReport {
  date: string;
  total_patients: number;
  total_scans: number;
  total_amount: number;
  hospital_wise: Array<{
    hospital_name: string;
    patients: number;
    amount: number;
  }>;
  category_wise: Array<{
    category: string;
    patients: number;
    amount: number;
  }>;
}

export interface TimeSlot {
  time_id?: number;
  time_slot: string;
  status: 'available' | 'booked';
}