'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, FileText, Plus, ArrowLeft, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import LastEnrolledPatient from '@/components/LastEnrolledPatient';
import { getCurrentDate } from '@/utils/dateFormat';

interface FormData {
  // Step 1 - Enrollment Details
  date: string;
  hospital_name: string;
  doctor_name: string;
  pre: string;
  firstname: string;
  age: string;
  age_type: string;
  gender: string;
  petient_type: string;
  p_uni_submit: string;
  p_uni_id_name: string;
  address: string;
  city: string;
  contact_number: string;
  
  // Step 2 - Scan Options
  type_of_scan: string[];
  appoint_date: string;
  time: string;
  time_in: string;
  amount: string;
  est_time: string;
  
  // Step 3 - Payment Details
  total_amount: string;
  rec_amount: string;
  dis_amount: string;
  due_amount: string;
}

interface Hospital {
  h_id: number;
  h_name: string;
}

interface Doctor {
  d_id: number;
  dname: string;
}

interface Scan {
  s_id: number;
  s_name: string;
  charges: number;
  estimate_time: string;
}

export default function NewPatientRegistration() {
  const toast = useToastContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPatientId, setEditPatientId] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScans, setSelectedScans] = useState<Scan[]>([]);
  const [showUniId, setShowUniId] = useState(false);
  const [scanSearchTerm, setScanSearchTerm] = useState('');
  const [hospitalSearchTerm, setHospitalSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [showTimeInDropdown, setShowTimeInDropdown] = useState(false);
  const [showTimeOutDropdown, setShowTimeOutDropdown] = useState(false);
  const [timeInSearchTerm, setTimeInSearchTerm] = useState('');
  const [timeOutSearchTerm, setTimeOutSearchTerm] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [lastPatient, setLastPatient] = useState<{cro: string, patient_name: string} | null>(null);
  const [timeSlots, setTimeSlots] = useState<{time_id: number, time_slot: string}[]>([]);

  
  const [formData, setFormData] = useState<FormData>({
    date: getCurrentDate(),
    hospital_name: '',
    doctor_name: '',
    pre: 'Mr.',
    firstname: '',
    age: '',
    age_type: 'Year',
    gender: 'Male',
    petient_type: 'GEN / Paid',
    p_uni_submit: 'N',
    p_uni_id_name: '',
    address: '',
    city: '',
    contact_number: '',
    type_of_scan: [],
    appoint_date: getCurrentDate(),
    time: '',
    time_in: '',
    amount: '0',
    est_time: '0',
    total_amount: '0',
    rec_amount: '0',
    dis_amount: '0',
    due_amount: '0'
  });

  useEffect(() => {
    fetchHospitals();
    fetchDoctors();
    fetchScans();
    fetchTimeSlots();
    fetchLastPatient();
    
    // Check for edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
      setIsEditMode(true);
      setEditPatientId(editId);
      fetchPatientData(editId);
    } else {
      // For new patient registration, set current time in AM/PM format
      const now = new Date();
      const currentTime24 = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentTimeAMPM = formatTimeToAMPM(currentTime24);
      
      setFormData(prev => ({ ...prev, time: currentTime24 }));
      setTimeInSearchTerm(currentTimeAMPM);
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowHospitalDropdown(false);
        setShowDoctorDropdown(false);
        setShowTimeInDropdown(false);
        setShowTimeOutDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-set current time when appointment date is today
  useEffect(() => {
    if (!isEditMode && timeSlots.length > 0) {
      const today = new Date();
      const appointmentDate = new Date(formData.appoint_date);
      const isToday = appointmentDate.toDateString() === today.toDateString();
      
      if (isToday && !formData.time) {
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        
        // Find the next available time slot (current time or next available)
        const availableSlot = timeSlots.find(slot => {
          const timeMatch = slot.time_slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (!timeMatch) return false;
          
          let hour = parseInt(timeMatch[1]);
          const minute = parseInt(timeMatch[2]);
          const period = timeMatch[3].toUpperCase();
          
          if (period === 'PM' && hour !== 12) {
            hour += 12;
          } else if (period === 'AM' && hour === 12) {
            hour = 0;
          }
          
          const slotTimeInMinutes = hour * 60 + minute;
          return slotTimeInMinutes >= currentTimeInMinutes;
        });
        
        if (availableSlot) {
          setFormData(prev => ({ ...prev, time: availableSlot.time_id.toString() }));
          setTimeInSearchTerm(availableSlot.time_slot);
        } else {
          // If no future slot available, set current time in AM/PM format
          const currentTime24 = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
          const currentTimeAMPM = formatTimeToAMPM(currentTime24);
          setFormData(prev => ({ ...prev, time: currentTime24 }));
          setTimeInSearchTerm(currentTimeAMPM);
        }
      }
    }
  }, [formData.appoint_date, timeSlots, isEditMode, formData.time]);

  // Auto-calculate time out when time in or estimated time changes
  useEffect(() => {
    if (formData.time && formData.est_time && parseInt(formData.est_time) > 0) {
      calculateTimeOut(formData.time, parseInt(formData.est_time));
    }
  }, [formData.time, formData.est_time]);

  // Auto-calculate time out when estimated time changes
  useEffect(() => {
    if (formData.time && formData.est_time && parseInt(formData.est_time) > 0) {
      const timeSlot = timeSlots.find(slot => slot.time_id.toString() === formData.time);
      if (timeSlot) {
        const timeMatch = timeSlot.time_slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (timeMatch) {
          let hour = parseInt(timeMatch[1]);
          const minute = parseInt(timeMatch[2]);
          const period = timeMatch[3].toUpperCase();
          
          if (period === 'PM' && hour !== 12) {
            hour += 12;
          } else if (period === 'AM' && hour === 12) {
            hour = 0;
          }
          
          const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          calculateTimeOut(time24, parseInt(formData.est_time));
        }
      }
    }
  }, [formData.est_time, formData.time, timeSlots]);

  const fetchHospitals = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/reception/hospitals');
      if (response.ok) {
        const data = await response.json();
        setHospitals(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/reception/doctors');
      if (response.ok) {
        const data = await response.json();
        setDoctors(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchScans = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/reception/scans');
      if (response.ok) {
        const data = await response.json();
        setScans(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/reception/time-slots');
      if (response.ok) {
        const data = await response.json();
        const slots = Array.isArray(data) ? data : [];
        console.log('Fetched time slots:', slots);
        setTimeSlots(slots);
      } else {
        console.error('Failed to fetch time slots, using fallback');
        generateFallbackTimeSlots();
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      generateFallbackTimeSlots();
    }
  };

  // Generate fallback time slots if API fails - every 15 minutes for 24 hours
  const generateFallbackTimeSlots = () => {
    const fallbackSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) { // Every 15 minutes instead of every minute
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const timeAMPM = formatTimeToAMPM(time24);
        fallbackSlots.push({
          time_id: fallbackSlots.length + 1,
          time_slot: timeAMPM
        });
      }
    }
    console.log('Using fallback time slots:', fallbackSlots.length);
    setTimeSlots(fallbackSlots);
  };

  const fetchLastPatient = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/reception/patients/last-enrolled');
      if (response.ok) {
        const data = await response.json();
        setLastPatient(data.data);
      }
    } catch (error) {
      console.error('Error fetching last patient:', error);
    }
  };

  const [patientData, setPatientData] = useState<any>(null);

  const fetchPatientData = async (patientId: string) => {
    try {
      const response = await fetch(`https://varahasdc.co.in/api/reception/patients/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setPatientData(data.data);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  // Process patient data after scans are loaded
  useEffect(() => {
    if (patientData && scans.length > 0) {
      const patient = patientData;
      
      // Auto-select scans and calculate totals
      const scanIds = patient.scan_type ? patient.scan_type.split(',') : [];
      const selectedScansData = scans.filter(scan => scanIds.includes(scan.s_id.toString()));
      setSelectedScans(selectedScansData);
      
      // Calculate estimated time from selected scans
      const totalEstTime = selectedScansData.reduce((sum, scan) => {
        const timeMatch = scan.estimate_time?.match(/(\d+)/);
        return sum + (timeMatch ? parseInt(timeMatch[1]) : 0);
      }, 0);
      
      // Populate form with patient data
      setFormData({
        date: patient.date || getCurrentDate(),
        hospital_name: patient.hospital_id?.toString() || '',
        doctor_name: patient.doctor_name?.toString() || '',
        pre: patient.pre || 'Mr.',
        firstname: patient.patient_name || '',
        age: patient.age?.replace(/[^0-9]/g, '') || '',
        age_type: patient.age?.includes('Year') ? 'Year' : patient.age?.includes('Month') ? 'Month' : 'Days',
        gender: patient.gender || 'Male',
        petient_type: patient.petient_type || 'GEN / Paid',
        p_uni_submit: patient.p_uni_submit || 'N',
        p_uni_id_name: patient.p_uni_id_name || '',
        address: patient.address || '',
        city: patient.city || '',
        contact_number: patient.contact_number || '',
        type_of_scan: scanIds,
        appoint_date: patient.appoint_date ? (patient.appoint_date.includes('-') ? patient.appoint_date : patient.appoint_date) : getCurrentDate(),
        time: patient.time || '',
        time_in: patient.time_in || '',
        amount: patient.amount?.toString() || '0',
        est_time: totalEstTime.toString(),
        total_amount: patient.total_amount?.toString() || '0',
        rec_amount: patient.rec_amount?.toString() || '0',
        dis_amount: patient.dis_amount?.toString() || '0',
        due_amount: patient.due_amount?.toString() || '0'
      });
      
      // Set search terms for dropdowns
      if (patient.h_name) setHospitalSearchTerm(patient.h_name);
      if (patient.dname) setDoctorSearchTerm(patient.dname);
      
      // Set time search terms if available
      setTimeout(() => {
        // Handle time binding - check if it's a time slot ID or direct time value
        if (patient.time && timeSlots.length > 0) {
          const timeSlot = timeSlots.find(slot => slot.time_id.toString() === patient.time.toString());
          if (timeSlot) {
            setTimeInSearchTerm(timeSlot.time_slot);
            setFormData(prev => ({ ...prev, time: timeSlot.time_slot }));
          } else if (typeof patient.time === 'string' && patient.time.includes(':')) {
            setTimeInSearchTerm(formatTimeToAMPM(patient.time));
          }
        }
        
        if (patient.time_in && timeSlots.length > 0) {
          const timeSlot = timeSlots.find(slot => slot.time_id.toString() === patient.time_in.toString());
          if (timeSlot) {
            setTimeOutSearchTerm(timeSlot.time_slot);
            setFormData(prev => ({ ...prev, time_in: timeSlot.time_slot }));
          } else if (typeof patient.time_in === 'string' && patient.time_in.includes(':')) {
            setTimeOutSearchTerm(formatTimeToAMPM(patient.time_in));
          }
        }
        
        // Auto-calculate time out if time in exists and estimated time is available
        if (patient.time && totalEstTime > 0 && patient.time.includes(':')) {
          calculateTimeOut(patient.time, totalEstTime);
        }
      }, 500);
    }
  }, [patientData, scans, timeSlots]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Handle category change for ID requirement
    if (name === 'petient_type') {
      const freeCategories = ['IPD FREE', 'OPD FREE', 'RTA', 'RGHS', 'Chiranjeevi', 'Destitute', 'PRISONER', 'Sn. CITIZEN', 'Aayushmaan'];
      setShowUniId(freeCategories.includes(value));
    }
  };

  // Convert 24-hour time to 12-hour AM/PM format
  const formatTimeToAMPM = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Filter time slots based on appointment date and current time
  const getFilteredTimeSlots = () => {
    const now = new Date();
    
    // Parse appointment date properly - handle both YYYY-MM-DD and DD-MM-YYYY formats
    let selectedDate;
    if (formData.appoint_date.includes('-')) {
      // YYYY-MM-DD format
      selectedDate = new Date(formData.appoint_date);
    } else {
      // DD/MM/YYYY format - convert to proper date
      const parts = formData.appoint_date.split('/');
      if (parts.length === 3) {
        selectedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        selectedDate = new Date(formData.appoint_date);
      }
    }
    
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    if (!isToday) {
      // For future dates, return all time slots
      return timeSlots;
    }
    
    // For today, show slots from current time + 5 minutes onwards
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute + 5; // Add 5 minute buffer
    
    const filtered = timeSlots.filter(slot => {
      // Extract time from slot.time_slot (format: "HH:MM AM/PM")
      const timeMatch = slot.time_slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeMatch) return false;
      
      let hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      
      const slotTimeInMinutes = hour * 60 + minute;
      
      // Show slots that are from current time + buffer onwards
      return slotTimeInMinutes >= currentTimeInMinutes;
    });
    
    console.log('Filtered time slots:', {
      currentTime: `${currentHour}:${currentMinute}`,
      totalSlots: timeSlots.length,
      filteredSlots: filtered.length,
      isToday
    });
    
    return filtered;
  };

  const calculateTimeOut = (timeIn: string, estimatedMinutes: number) => {
    if (!timeIn || !estimatedMinutes) return;
    
    let hours, minutes;
    
    // Handle both 24-hour (HH:MM) and 12-hour (HH:MM AM/PM) formats
    if (timeIn.includes('AM') || timeIn.includes('PM')) {
      const timeMatch = timeIn.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeMatch) return;
      
      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
    } else {
      // Already in 24-hour format
      [hours, minutes] = timeIn.split(':').map(Number);
    }
    
    const timeInDate = new Date();
    timeInDate.setHours(hours, minutes, 0, 0);
    
    // Add estimated minutes
    const timeOutDate = new Date(timeInDate.getTime() + estimatedMinutes * 60000);
    
    // Format back to 24-hour format
    const timeOut = `${timeOutDate.getHours().toString().padStart(2, '0')}:${timeOutDate.getMinutes().toString().padStart(2, '0')}`;
    
    // Set calculated time out
    setFormData(prev => ({ ...prev, time_in: timeOut }));
    setTimeOutSearchTerm(formatTimeToAMPM(timeOut));
  };

  // Convert 12-hour format to 24-hour format
  const convertTo24Hour = (time12: string) => {
    const timeMatch = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) return time12;
    
    let hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();
    
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Get current time when appointment date changes
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  // Auto-select current time for today's appointment
  const autoSelectCurrentTime = () => {
    const today = new Date();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const currentTime24 = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    const currentTimeAMPM = formatTimeToAMPM(currentTime24);
    
    // Find the first available time slot that is at or after current time
    const availableSlot = timeSlots.find(slot => {
      const timeMatch = slot.time_slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeMatch) return false;
      
      let hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();
      
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
      
      const slotTimeInMinutes = hour * 60 + minute;
      return slotTimeInMinutes >= currentTimeInMinutes;
    });
    
    if (availableSlot) {
      setFormData(prev => ({ ...prev, time: availableSlot.time_id.toString() }));
      setTimeInSearchTerm(availableSlot.time_slot);
    } else {
      // If no available slot found, set current time directly
      setFormData(prev => ({ ...prev, time: currentTime24 }));
      setTimeInSearchTerm(currentTimeAMPM);
    }
  };

  // Handle appointment date change
  const handleAppointmentDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear time selections when date changes
    setFormData(prev => ({ ...prev, time: '', time_in: '' }));
    setTimeInSearchTerm('');
    setTimeOutSearchTerm('');
    
    // If selecting today's date, set current time in AM/PM format
    const selectedDate = new Date(value);
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    
    if (isToday) {
      const currentTime = getCurrentTime();
      const currentTimeAMPM = formatTimeToAMPM(currentTime);
      
      // Try to find matching time slot first
      const matchingSlot = timeSlots.find(slot => {
        const timeMatch = slot.time_slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!timeMatch) return false;
        
        let hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();
        
        if (period === 'PM' && hour !== 12) {
          hour += 12;
        } else if (period === 'AM' && hour === 12) {
          hour = 0;
        }
        
        const slotTime24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        return slotTime24 === currentTime;
      });
      
      if (matchingSlot) {
        setFormData(prev => ({ ...prev, time: matchingSlot.time_id.toString() }));
        setTimeInSearchTerm(matchingSlot.time_slot);
      } else {
        // Set current time directly in AM/PM format
        setFormData(prev => ({ ...prev, time: currentTime }));
        setTimeInSearchTerm(currentTimeAMPM);
      }
      
      // Auto-calculate time out if estimated time is available
      const estimatedTime = parseInt(formData.est_time) || 0;
      if (estimatedTime > 0) {
        calculateTimeOut(currentTime, estimatedTime);
      }
    }
  };

  const handleScanChange = (scanId: string, checked: boolean) => {
    let newSelectedScans = [...formData.type_of_scan];
    
    if (checked) {
      newSelectedScans.push(scanId);
    } else {
      newSelectedScans = newSelectedScans.filter(id => id !== scanId);
    }
    
    setFormData(prev => ({ ...prev, type_of_scan: newSelectedScans }));
    
    // Calculate totals
    const selected = scans.filter(scan => newSelectedScans.includes(scan.s_id.toString()));
    setSelectedScans(selected);
    
    const totalAmount = selected.reduce((sum, scan) => sum + scan.charges, 0);
    const totalTime = selected.reduce((sum, scan) => {
      const timeMatch = scan.estimate_time?.match(/(\d+)/);
      return sum + (timeMatch ? parseInt(timeMatch[1]) : 0);
    }, 0);
    
    // Store scan amount in database regardless of category
    const scanAmount = totalAmount;
    
    setFormData(prev => {
      let newFormData;
      
      if (prev.petient_type === 'GEN / Paid') {
        // For GEN/Paid: validate amount, received amount required
        newFormData = {
          ...prev,
          amount: scanAmount.toString(),
          est_time: totalTime.toString(),
          total_amount: scanAmount.toString(),
          rec_amount: scanAmount.toString(), // Auto-fill received amount
          due_amount: '0'
        };
      } else {
        // For other categories: total amount shows scan amount but received can be 0
        newFormData = {
          ...prev,
          amount: scanAmount.toString(),
          est_time: totalTime.toString(),
          total_amount: scanAmount.toString(),
          rec_amount: '0',
          due_amount: '0'
        };
        
        // Note: Patient belongs to free category - No payment required
      }
      
      return newFormData;
    });
    
    // Auto-select current time if not already selected and appointment is today
    if (!formData.time && timeSlots.length > 0) {
      const today = new Date();
      const appointmentDate = new Date(formData.appoint_date);
      const isToday = appointmentDate.toDateString() === today.toDateString();
      
      if (isToday) {
        setTimeout(() => {
          const currentTime24 = getCurrentTime();
          const currentTimeAMPM = formatTimeToAMPM(currentTime24);
          setFormData(prev => ({ ...prev, time: currentTime24 }));
          setTimeInSearchTerm(currentTimeAMPM);
        }, 100);
      }
    }
  };

  const calculatePayment = () => {
    const total = parseFloat(formData.total_amount) || 0;
    const received = parseFloat(formData.rec_amount) || 0;
    const discount = parseFloat(formData.dis_amount) || 0;
    
    // PHP logic: due_amount = total_amount - received_amount - discount_amount
    const due = total - received - discount;
    
    setFormData(prev => ({ ...prev, due_amount: due.toString() }));
  };

  const validatePayment = () => {
    // Free categories don't need payment validation (exact list from PHP)
    const freeCategories = ['Destitute', 'Chiranjeevi', 'RGHS', 'RTA', 'OPD FREE', 'IPD FREE', 'BPL/POOR', 'Sn. CITIZEN', 'BHAMASHAH', 'JSSY', 'PRISONER', 'Aayushmaan'];
    if (freeCategories.includes(formData.petient_type)) {
      return true;
    }
    
    const total = parseFloat(formData.total_amount) || 0;
    const received = parseFloat(formData.rec_amount) || 0;
    
    // For GEN/Paid category, received amount cannot be 0 if total > 0
    if (formData.petient_type === 'GEN / Paid' && total > 0 && received === 0) {
      if (toast && typeof toast.error === 'function') {
        toast.error('For GEN/Paid category, received amount cannot be 0');
      }
      return false;
    }
    
    return true;
  };

  // Handle category change and update amounts accordingly
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Handle category change for ID requirement
    const freeCategories = ['IPD FREE', 'OPD FREE', 'RTA', 'RGHS', 'Chiranjeevi', 'Destitute', 'PRISONER', 'Sn. CITIZEN', 'Aayushmaan'];
    setShowUniId(freeCategories.includes(value));
    
    // Recalculate amounts based on category
    const scanAmount = selectedScans.reduce((sum, scan) => sum + scan.charges, 0);
    
    if (value === 'GEN / Paid') {
      // For GEN/Paid: scan amount should be stored, received amount required, due can be 0
      setFormData(prev => ({
        ...prev,
        total_amount: scanAmount.toString(),
        amount: scanAmount.toString(),
        rec_amount: scanAmount.toString(), // Auto-fill received amount
        due_amount: '0'
      }));
    } else {
      // For other categories: total amount shows scan amount, received accepts 0, due also 0
      setFormData(prev => ({
        ...prev,
        total_amount: scanAmount.toString(),
        amount: scanAmount.toString(),
        rec_amount: '0',
        due_amount: '0'
      }));
    }
  };

  // Check if print should be enabled (PHP logic: due_amount == '0' + required fields validation)
  const isPrintEnabled = () => {
    // Check required fields first
    if (!formData.hospital_name || !formData.doctor_name || !formData.firstname.trim() || !formData.age.trim()) {
      return false;
    }
    
    // Check if at least one scan is selected
    if (formData.type_of_scan.length === 0) {
      return false;
    }
    
    // Check if time slots are selected
    if (!formData.time || !formData.time_in) {
      return false;
    }
    
    const freeCategories = ['Destitute', 'Chiranjeevi', 'RGHS', 'RTA', 'OPD FREE', 'IPD FREE', 'BPL/POOR', 'Sn. CITIZEN', 'BHAMASHAH', 'JSSY', 'PRISONER', 'Aayushmaan'];
    if (freeCategories.includes(formData.petient_type)) {
      return true; // Always enabled for free categories if required fields are filled
    }
    
    // PHP uses string comparison: due_amount == '0'
    const dueAmount = parseFloat(formData.due_amount) || 0;
    return dueAmount === 0;
  };

  const validateStep = (step: number) => {
    const newErrors: {[key: string]: string} = {};
    
    if (step === 1) {
      if (!formData.hospital_name) {
        newErrors.hospital_name = 'Hospital Name is required';
        toast.error('Please select Hospital Name');
      }
      if (!formData.doctor_name) {
        newErrors.doctor_name = 'Doctor Name is required';
        toast.error('Please select Doctor Name');
      }
      if (!formData.firstname.trim()) {
        newErrors.firstname = 'Patient Name is required';
        toast.error('Please enter Patient Name');
      }
      if (!formData.age.trim()) {
        newErrors.age = 'Age is required';
        toast.error('Please enter Age');
      }
      if (formData.contact_number && !/^[0-9]{10}$/.test(formData.contact_number)) {
        newErrors.contact_number = 'Contact Number must be 10 digits';
        toast.error('Contact Number must be 10 digits');
      }
    }
    
    if (step === 2) {
      if (formData.type_of_scan.length === 0) {
        newErrors.type_of_scan = 'At least one scan type is required';
        toast.error('Please select at least one scan type');
      }
      if (!formData.time) {
        newErrors.time = 'Time In is required';
        toast.error('Please select Time In');
      }
      if (!formData.time_in) {
        newErrors.time_in = 'Time Out is required';
        toast.error('Please select Time Out');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (action: string) => {
    try {
      // Prepare data in the format expected by the API
      const submitData = {
        hospital_name: formData.hospital_name,
        DoctorName: formData.doctor_name,
        pre: formData.pre,
        firstname: formData.firstname,
        age: formData.age,
        age_type: formData.age_type,
        gender: formData.gender,
        petient_type: formData.petient_type,
        p_uni_submit: formData.p_uni_submit || 'N',
        p_uni_id_name: formData.p_uni_id_name || '',
        address: formData.address,
        city: formData.city,
        contact_number: formData.contact_number,
        type_of_scan: formData.type_of_scan,
        appoint_date: formData.appoint_date,
        time: formData.time,
        time_in: formData.time_in,
        amount: formData.amount,
        total_amount: formData.total_amount,
        dis_amount: formData.dis_amount,
        rec_amount: formData.rec_amount,
        due_amount: formData.due_amount,
        admin_id: 1,
        action: action
      };

      let response;
      if (isEditMode && editPatientId) {
        response = await fetch(`https://varahasdc.co.in/api/reception/patients/${editPatientId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });
      } else {
        response = await fetch('https://varahasdc.co.in/api/reception/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });
      }
      
      if (response.ok) {
        const result = await response.json();
        const cro = result.data?.cro || (isEditMode ? 'Updated' : 'Registered');
        
        if (toast && typeof toast.success === 'function') {
          toast.success(`Patient ${isEditMode ? 'updated' : 'registered'} successfully! CRO: ${cro}`);
        }
        
        // For SaveAndPrint action, automatically print receipt
        if (action === 'SaveAndPrint') {
          setTimeout(() => {
            printReceipt(result.data);
            if (toast && typeof toast.info === 'function') {
              toast.info('Receipt printed successfully!');
            }
            setTimeout(() => {
              window.location.href = isEditMode ? '/admin/patient-edit' : '/reception/patient-registration/list';
            }, 2000);
          }, 1000);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (toast && typeof toast.error === 'function') {
          toast.error(`Error: ${errorData.error || (isEditMode ? 'Failed to update patient' : 'Failed to register patient')}`);
        }
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      if (toast && typeof toast.error === 'function') {
        toast.error(isEditMode ? 'Error updating patient' : 'Error saving patient');
      }
    }
  };

  const resetForm = () => {
    const today = getCurrentDate();
    setFormData({
      date: today,
      hospital_name: '',
      doctor_name: '',
      pre: 'Mr.',
      firstname: '',
      age: '',
      age_type: 'Year',
      gender: 'Male',
      petient_type: 'GEN / Paid',
      p_uni_submit: 'N',
      p_uni_id_name: '',
      address: '',
      city: '',
      contact_number: '',
      type_of_scan: [],
      appoint_date: today,
      time: '',
      time_in: '',
      amount: '0',
      est_time: '0',
      total_amount: '0',
      rec_amount: '0',
      dis_amount: '0',
      due_amount: '0'
    });
    
    // Reset search terms
    setHospitalSearchTerm('');
    setDoctorSearchTerm('');
    setTimeInSearchTerm('');
    setTimeOutSearchTerm('');
    setScanSearchTerm('');
    setSelectedScans([]);
    
    // Go back to first step
    setCurrentStep(1);
    
    // Refresh last patient data
    fetchLastPatient();
  };

  // Convert number to words function
  const numberToWords = (num: number): string => {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    if (num === 0) return 'zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    
    return num.toString();
  };

  const printReceipt = (patientData: any) => {
    const receiptDate = isEditMode ? formData.date : getCurrentDate();
    const currentDate = receiptDate;
    const appointmentDate = formData.appoint_date;
    const investigations = selectedScans.map(scan => scan.s_name).join(', ');
    const amountInWords = numberToWords(parseInt(formData.rec_amount || formData.total_amount)).toUpperCase();
    const ageWithUnit = `${formData.age} ${formData.age_type}`;
    
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt - ${patientData.cro || 'New Patient'}</title>
  <style>
    .admission_form { text-align: center; color: #000000; font-size: 10px; width: 100%; }
    .admission_form table { width: 98%; font-size: 10px; margin: -5px 8px; }
    .admission_form .form_input { padding: 2px 1%; font-size: 10px; border: none; font-weight: bold; font-style: italic; width: 99%; border-bottom: 1px dotted #000000; }
    .admission_form .form_input_box { border-bottom: 0px dotted #000000; padding: 0px 0px 2px 0px; width: 100%; display: inline-block; }
    @media print { .no_print, .no_print * { display: none !important; } .admission_div_desc { border: 0px !important; } .page_break { page-break-after: always; } }
  </style>
</head>
<body bgcolor="#FFFFFF" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" onload="window.print(); setTimeout(() => window.close(), 1000);">
  <div class="admission_form" align="center" style="border:solid thin; margin-top:18px;width:93.0%;margin-left:30px;">
    <table align="center" style="margin-top:2px;">
      <tr><td colspan="6"><b>Dr. S.N. MEDICAL COLLEGE AND ATTACHED GROUP OF HOSPITAL, JODHPUR</b></td></tr>
      <tr><td colspan="6"><b>Rajasthan Medical Relief Society, M.D.M. Hospital, Jodhpur</b></td></tr>
      <tr><td colspan="6"><b>IMAGING CENTRE UNDER P.P.P.MODE : VARAHA SDC</b></td></tr>
      <tr><td colspan="6"><b>256 SLICE DUAL ENERGY CT SCAN, M.D.M HOSPITAL Jodhpur(Raj.) - 342003</b></td></tr>
      <tr><td colspan="6"><b>Tel. : +91-291-2648120 , 0291-2648121 , 0291-2648122</b></td></tr>
    </table>
    
    <table>
      <tr>
        <td width="55">Reg.No :</td>
        <td width="200"><span class="form_input_box"><input type="text" class="form_input" value="${patientData.cro || ''}(${patientData.patient_id || ''})"></span></td>
        <td colspan="6"><span style="margin-left:30%; border: 1px solid #02C; border-radius: 11px;padding: 3px 15px;">Cash Receipt</span></td>
        <td width="36">Date</td>
        <td width="144"><span class="form_input_box"><input type="text" class="form_input" value="${currentDate}"></span></td>
      </tr>
    </table>
    
    <table>
      <tr>
        <td width="56">Ref. By :</td>
        <td width="482"><span class="form_input_box"><input type="text" class="form_input" value="${doctorSearchTerm || ''}"></span></td>
        <td width="174">Date and Time of Appointment :</td>
        <td width="316"><span class="form_input_box"><input type="text" class="form_input" value="${formData.appoint_date.split('-').reverse().join('-')} ${timeInSearchTerm || ''} - ${timeOutSearchTerm || ''}"></span></td>
      </tr>
    </table>
    
    <table>
      <tr>
        <td width="78">Patient Name :</td>
        <td width="650"><span class="form_input_box"><input type="text" class="form_input" value="${formData.pre} ${formData.firstname}"></span></td>
        <td width="33">Age :</td>
        <td width="144"><span class="form_input_box"><input type="text" class="form_input" value="${ageWithUnit}"></span></td>
        <td width="36">Gender :</td>
        <td width="144"><span class="form_input_box"><input type="text" class="form_input" value="${formData.gender}"></span></td>
      </tr>
    </table>
    
    <table>
      <tr>
        <td width="40">Address :</td>
        <td width="687"><span class="form_input_box"><input type="text" class="form_input" value="${formData.address || ''}"></span></td>
        <td width="120"><span class="form_input_box"><label>Category :</label><input type="text" class="form_input" value="${formData.petient_type}"></span></td>
        <td width="33">Phone :</td>
        <td width="333"><span class="form_input_box"><input type="text" class="form_input" value="${formData.contact_number || ''}"></span></td>
      </tr>
    </table>
    
    <table>
      <tr>
        <td width="59">Investigations :</td>
        <td width="1042"><span class="form_input_box"><input type="text" class="form_input" value="${investigations}"></span></td>
      </tr>
    </table>
    
    <table>
      <tr>
        <td width="100">For Sum Of Rupees :</td>
        <td width="733"><span class="form_input_box"><input type="text" class="form_input" value="${amountInWords} RUPEES ONLY"></span></td>
        <td width="30"><label>Scan Amount :</label><input type="text" value="₹ ${formData.total_amount}" style="border:1px solid #5E60AE;"></td>
        <td width="30"><label>Received Amount :</label><input type="text" value="₹ ${formData.rec_amount}" style="border:1px solid #5E60AE;"></td>
      </tr>
    </table>
    
    <table>
      <tr>
        <td colspan="6" align="right">For Varaha SDC, Jodhpur</span></td>
      </tr>
              <tr>
        <td></td>
      </tr>
    </table>
  </div>
  
  <hr>
  
  <div div class="admission_form" align="center" style="border:solid thin; margin-top:18px;width:93.0%;margin-left:30px;">
    <table align="center" style="margin-top:2px;">
      <tr><td colspan="6"><b>Dr. S.N. MEDICAL COLLEGE AND ATTACHED GROUP OF HOSPITAL, JODHPUR</b></td></tr>
      <tr><td colspan="6"><b>Rajasthan Medical Relief Society, M.D.M. Hospital, Jodhpur</b></td></tr>
      <tr><td colspan="6"><b>IMAGING CENTRE UNDER P.P.P.MODE : VARAHA SDC</b></td></tr>
      <tr><td colspan="6"><b>256 SLICE DUAL ENERGY CT SCAN, M.D.M HOSPITAL Jodhpur(Raj.) - 342003</b></td></tr>
      <tr><td colspan="6"><b>Tel. : +91-291-2648120 , 0291-2648121 , 0291-2648122</b></td></tr>
    </table>
    
    <table>
      <tr>
        <td width="55">Reg.No :</td>
        <td width="200"><span class="form_input_box"><input type="text" class="form_input" value="${patientData.cro || ''}(${patientData.patient_id || ''})"></span></td>
        <td colspan="6"><span style="margin-left:30%; border: 1px solid #02C; border-radius: 11px;padding: 3px 15px;">Cash Receipt</span></td>
        <td width="36">Date</td>
        <td width="144"><span class="form_input_box"><input type="text" class="form_input" value="${currentDate}"></span></td>
      </tr>
    </table>
    
    <table>
      <tr>
        <td width="56">Ref. By :</td>
        <td width="482"><span class="form_input_box"><input type="text" class="form_input" value="${doctorSearchTerm || ''}"></span></td>
        <td width="174">Date and Time of Appointment :</td>
        <td width="316"><span class="form_input_box"><input type="text" class="form_input" value="${formData.appoint_date.split('-').reverse().join('-')} ${timeInSearchTerm || ''}-${timeOutSearchTerm || ''}"></span></td>
      </tr>
    </table>
    
    <table>
      <tr>
        <td width="78">Patient Name:</td>
        <td width="650"><span class="form_input_box"><input type="text" class="form_input" value="${formData.pre} ${formData.firstname}"></span></td>
        <td width="33">Age :</td>
        <td width="144"><span class="form_input_box"><input type="text" class="form_input" value="${ageWithUnit}"></span></td>
        <td width="36">Gender</td>
        <td width="144"><span class="form_input_box"><input type="text" class="form_input" value="${formData.gender}"></span></td>
      </tr>
    </table>
    
    <table>
      <tr>
        <td width="40">Address</td>
        <td width="687"><span class="form_input_box"><input type="text" class="form_input" value="${formData.address || ''}"></span></td>
        <td width="120"><span class="form_input_box"><label>Category</label><input type="text" class="form_input" value="${formData.petient_type}"></span></td>
        <td width="33">Phone:</td>
        <td width="333"><span class="form_input_box"><input type="text" class="form_input" value="${formData.contact_number || ''}"></span></td>
      </tr>
    </table>
    
    <table>
      <tr>
        <td width="59">Investigations:</td>
        <td width="1042"><span class="form_input_box"><input type="text" class="form_input" value="${investigations}"></span></td>
      </tr>
    </table>
    
    <table>
      <tr>
        <td width="20">For Sum Of Rupees:</td>
        <td width="550"><span class="form_input_box"><input type="text" class="form_input" value="${amountInWords} RUPEES ONLY"></span></td>
        <td width="30"><label>Scan Amount</label><input type="text" value="₹ ${formData.total_amount}" style="border:1px solid #5E60AE;"></td>
        <td width="30"><label>Received Amount</label><input type="text" value="₹ ${formData.rec_amount}" style="border:1px solid #5E60AE;"></td>
      </tr>
    </table>
    
    <table>
      <tr>
        <td colspan="6" align="right">For Varaha SDC, Jodhpur</span></td>
      </tr>
         <tr>
        <td></td>
      </tr>
    </table>
  </div>
</body>
</html>`;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-4 sm:p-6 rounded-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold mb-2">{isEditMode ? 'Edit Patient Registration' : 'New Patient Registration'}</h1>
            <p className="text-sky-100 text-sm sm:text-lg">{isEditMode ? 'Update patient information and scan details' : 'Complete patient enrollment and scan booking'}</p>
          </div>
          {lastPatient && !isEditMode && (
            <div className="bg-sky-600 bg-opacity-50 rounded-lg px-4 py-2 min-w-0 flex-shrink-0">
              <p className="text-sky-200 text-xs mb-1">Last Enrolled Patient</p>
              <p className="text-white font-medium text-sm truncate">{lastPatient.cro} - {lastPatient.patient_name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-2xl border border-gray-100">
        {/* Step Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex flex-col sm:flex-row">
            <button
              className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm ${
                currentStep === 1 
                  ? 'border-sky-500 text-sky-600 bg-sky-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setCurrentStep(1)}
            >
              <span className="sm:hidden">1. Enrollment</span>
              <span className="hidden sm:inline">1. Enrollment Detail</span>
            </button>
            <button
              className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm ${
                currentStep === 2 
                  ? 'border-sky-500 text-sky-600 bg-sky-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setCurrentStep(2)}
            >
              <span className="sm:hidden">2. Scans</span>
              <span className="hidden sm:inline">2. Scan Options</span>
            </button>
            <button
              className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm ${
                currentStep === 3 
                  ? 'border-sky-500 text-sky-600 bg-sky-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setCurrentStep(3)}
            >
              <span className="sm:hidden">3. Payment</span>
              <span className="hidden sm:inline">3. Payment Details</span>
            </button>
          </nav>
        </div>

        <form className="p-3 sm:p-6">
          {/* Step 1: Enrollment Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="text"
                    name="date"
                    value={formData.date.split('-').reverse().join('-')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      value={hospitalSearchTerm}
                      onChange={(e) => {
                        setHospitalSearchTerm(e.target.value);
                        setShowHospitalDropdown(true);
                      }}
                      onFocus={() => setShowHospitalDropdown(true)}
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.hospital_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Search and select hospital"
                      required
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {showHospitalDropdown && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                      {hospitals
                        .filter(hospital => 
                          hospital.h_name.toLowerCase().includes(hospitalSearchTerm.toLowerCase())
                        )
                        .map(hospital => (
                          <div
                            key={hospital.h_id}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, hospital_name: hospital.h_id.toString() }));
                              setHospitalSearchTerm(hospital.h_name);
                              setShowHospitalDropdown(false);
                              if (errors.hospital_name) {
                                setErrors(prev => ({ ...prev, hospital_name: '' }));
                              }
                            }}
                          >
                            {hospital.h_name}
                          </div>
                        ))
                      }
                      {hospitals.filter(hospital => 
                        hospital.h_name.toLowerCase().includes(hospitalSearchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="px-3 py-2 text-gray-500">No hospitals found</div>
                      )}
                    </div>
                  )}
                  {errors.hospital_name && <p className="text-red-500 text-sm mt-1">{errors.hospital_name}</p>}
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      value={doctorSearchTerm}
                      onChange={(e) => {
                        setDoctorSearchTerm(e.target.value);
                        setShowDoctorDropdown(true);
                      }}
                      onFocus={() => setShowDoctorDropdown(true)}
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.doctor_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Search and select doctor"
                      required
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {showDoctorDropdown && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                      {doctors
                        .filter(doctor => 
                          doctor.dname.toLowerCase().includes(doctorSearchTerm.toLowerCase())
                        )
                        .map(doctor => (
                          <div
                            key={doctor.d_id}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, doctor_name: doctor.d_id.toString() }));
                              setDoctorSearchTerm(doctor.dname);
                              setShowDoctorDropdown(false);
                              if (errors.doctor_name) {
                                setErrors(prev => ({ ...prev, doctor_name: '' }));
                              }
                            }}
                          >
                            {doctor.dname}
                          </div>
                        ))
                      }
                      {doctors.filter(doctor => 
                        doctor.dname.toLowerCase().includes(doctorSearchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="px-3 py-2 text-gray-500">No doctors found</div>
                      )}
                    </div>
                  )}
                  {errors.doctor_name && <p className="text-red-500 text-sm mt-1">{errors.doctor_name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name <span className="text-red-500">*</span></label>
                  <select
                    name="pre"
                    value={formData.pre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Master">Master</option>
                    <option value="Miss">Miss</option>
                    <option value="Baby">Baby</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.firstname ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Please enter your First name"
                    required
                  />
                  {errors.firstname && <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value) && (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100))) {
                        handleInputChange(e);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                        e.preventDefault();
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.age ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Age (0-100)"
                    maxLength={3}
                  />
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">In (Year/Month/Days)</label>
                  <select
                    name="age_type"
                    value={formData.age_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Year">Year</option>
                    <option value="Month">Month</option>
                    <option value="Days">Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="petient_type"
                    value={formData.petient_type}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GEN / Paid">GEN / Paid</option>
                    <option value="IPD FREE">IPD Free</option>
                    <option value="OPD FREE">OPD Free</option>
                    <option value="RTA">RTA</option>
                    <option value="RGHS">RGHS</option>
                    <option value="Chiranjeevi">Chiranjeevi</option>
                    <option value="Destitute">Destitute</option>
                    <option value="PRISONER">PRISONER</option>
                    <option value="Sn. CITIZEN">Sn. CITIZEN</option>
                    <option value="Aayushmaan">Aayushmaan</option>
                  </select>
                </div>
              </div>

              {showUniId && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                    <input
                      type="text"
                      name="p_uni_submit"
                      value={formData.p_uni_submit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Y / N"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name Of ID</label>
                    <input
                      type="text"
                      name="p_uni_id_name"
                      value={formData.p_uni_id_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ID Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload ID</label>
                    <input
                      type="file"
                      name="p_uni_id_scan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please enter your Address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please enter your city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value) && value.length <= 10) {
                        handleInputChange(e);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                        e.preventDefault();
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.contact_number ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                  {errors.contact_number && <p className="text-red-500 text-sm mt-1">{errors.contact_number}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Scan Options */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Scan Type <span className="text-red-500">*</span></label>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search scans..."
                    value={scanSearchTerm}
                    onChange={(e) => setScanSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4">
                  {scans.filter(scan => 
                    scan.s_name.toLowerCase().includes(scanSearchTerm.toLowerCase())
                  ).map(scan => (
                    <label key={scan.s_id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.type_of_scan.includes(scan.s_id.toString())}
                        onChange={(e) => handleScanChange(scan.s_id.toString(), e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{scan.s_name}</span>
                        <div className="text-xs text-gray-500">₹{scan.charges} • {scan.estimate_time} min</div>
                      </div>
                    </label>
                  ))}
                  {scans.filter(scan => 
                    scan.s_name.toLowerCase().includes(scanSearchTerm.toLowerCase())
                  ).length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-4">No scans found</div>
                  )}
                </div>
                {errors.type_of_scan && <p className="text-red-500 text-sm mt-1">{errors.type_of_scan}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Appoint Date</label>
                  <input
                    type="date"
                    name="appoint_date"
                    value={formData.appoint_date.includes('-') && formData.appoint_date.split('-')[0].length === 4 ? formData.appoint_date : formData.appoint_date.split('-').reverse().join('-')}
                    onChange={handleAppointmentDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time In <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={timeInSearchTerm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                  {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Out <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={timeOutSearchTerm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                  {errors.time_in && <p className="text-red-500 text-sm mt-1">{errors.time_in}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
                  <input
                    type="text"
                    name="est_time"
                    value={formData.est_time}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              {selectedScans.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Selected Scans</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Name Of Scan</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Charges</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedScans.map((scan, index) => (
                          <tr key={scan.s_id}>
                            <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                            <td className="border border-gray-300 px-4 py-2">{scan.s_name}</td>
                            <td className="border border-gray-300 px-4 py-2">₹{scan.charges}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Patient Summary
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Patient Name</div>
                        <div className="text-sm font-semibold text-gray-900">{formData.pre} {formData.firstname}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Age & Gender</div>
                        <div className="text-sm font-semibold text-gray-900">{formData.age} {formData.age_type}, {formData.gender}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Category</div>
                        <div className="text-sm font-semibold text-gray-900">{formData.petient_type}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Appointment Date</div>
                        <div className="text-sm font-semibold text-gray-900">{formData.appoint_date.split('-').reverse().join('-')}</div>
                      </div>
                    </div>
                    
                    {(formData.contact_number || formData.address) && (
                      <div className="grid grid-cols-1 gap-4">
                        {formData.contact_number && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Contact Number</div>
                            <div className="text-sm font-semibold text-gray-900">{formData.contact_number}</div>
                          </div>
                        )}
                        {formData.address && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</div>
                            <div className="text-sm font-semibold text-gray-900">{formData.address}</div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {formData.time && formData.time_in && (
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                        <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Time Slot</div>
                        <div className="text-sm font-semibold text-blue-900">
                          {formatTimeToAMPM(formData.time)} - {formatTimeToAMPM(formData.time_in)}
                          <span className="ml-2 text-xs text-blue-600">({formData.est_time} min estimated)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                  <h4 className="font-semibold text-gray-800">Payment Details</h4>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Scan Details */}
                  {selectedScans.length > 0 && (
                    <div className="border border-gray-200 rounded">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <span className="font-medium text-sm">Selected Scans</span>
                      </div>
                      {selectedScans.map((scan, index) => (
                        <div key={scan.s_id} className="px-3 py-2 border-b border-gray-100 last:border-b-0 flex justify-between">
                          <span className="text-sm">{index + 1}. {scan.s_name}</span>
                          <span className="text-sm font-medium">₹{scan.charges}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Payment Calculation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                      <input
                        type="text"
                        name="total_amount"
                        value={`₹${formData.total_amount}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-semibold"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Received Amount</label>
                      <input
                        type="number"
                        name="rec_amount"
                        value={formData.rec_amount}
                        max={formData.total_amount}
                        onChange={(e) => {
                          const total = parseFloat(formData.total_amount) || 0;
                          const received = parseFloat(e.target.value) || 0;
                          
                          // For GEN/Paid category, validate received amount
                          if (formData.petient_type === 'GEN / Paid') {
                            if (received > total) {
                              return;
                            }
                          }
                          
                          const discount = parseFloat(formData.dis_amount) || 0;
                          const due = total - received - discount;
                          setFormData(prev => ({ ...prev, rec_amount: e.target.value, due_amount: due.toString() }));
                        }}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          formData.petient_type !== 'GEN / Paid' ? 'bg-gray-50' : ''
                        }`}
                        placeholder="0"
                        readOnly={formData.petient_type !== 'GEN / Paid'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                      <input
                        type="number"
                        name="dis_amount"
                        value={formData.dis_amount}
                        onChange={(e) => {
                          const total = parseFloat(formData.total_amount) || 0;
                          const received = parseFloat(formData.rec_amount) || 0;
                          const discount = parseFloat(e.target.value) || 0;
                          const due = total - received - discount;
                          setFormData(prev => ({ ...prev, dis_amount: e.target.value, due_amount: due.toString() }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Amount</label>
                      <input
                        type="text"
                        name="due_amount"
                        value={`₹${formData.due_amount}`}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md font-semibold ${
                          parseFloat(formData.due_amount) > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                        }`}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  {/* Payment Status */}
                  <div className={`text-center p-3 rounded-md ${
                    isPrintEnabled() ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <span className={`font-semibold ${
                      isPrintEnabled() ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {isPrintEnabled() 
                        ? 'Ready to print' 
                        : 'Payment Required - Complete payment to enable printing'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleSubmit('SaveAndPrint')}
                    disabled={!isPrintEnabled()}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 ${
                      isPrintEnabled() 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <Check className="h-5 w-5" />
                    <span>SAVE & PRINT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const confirmed = window.confirm('Are you sure you want to exit? Any unsaved changes will be lost.');
                      if (confirmed) {
                        if (toast && typeof toast.info === 'function') {
                          toast.info('Exiting patient registration');
                        }
                        window.location.href = '/reception/patient-registration/list';
                      }
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-lg transition-all duration-200"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>EXIT</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}