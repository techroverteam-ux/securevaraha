'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, FileText, Plus, ArrowLeft, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import LastEnrolledPatient from '@/components/LastEnrolledPatient';

interface FormData {
  date: string;
  scan_date: string;
  cro: string;
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
  type_of_scan: string[];
  amount: string;
  est_time: string;
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

export default function BackEntryPatientRegistration() {
  const toast = useToastContext();
  const [currentStep, setCurrentStep] = useState(1);
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
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [lastPatient, setLastPatient] = useState<{cro: string, patient_name: string} | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
    scan_date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
    cro: '',
    hospital_name: '',
    doctor_name: '',
    pre: 'Mr.',
    firstname: '',
    age: '',
    age_type: 'Year',
    gender: 'Male',
    petient_type: 'GEN',
    p_uni_submit: 'N',
    p_uni_id_name: '',
    address: '',
    city: '',
    contact_number: '',
    type_of_scan: [],
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
    fetchLastPatient();
    generateCRO();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowHospitalDropdown(false);
        setShowDoctorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/reception/hospitals');
      if (response.ok) {
        const data = await response.json();
        setHospitals(data || []);
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
        setDoctors(data || []);
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
        setScans(data || []);
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    }
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

  const generateCRO = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/reception/patients/generate-cro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formData.date })
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, cro: data.cro }));
      }
    } catch (error) {
      console.error('Error generating CRO:', error);
      // Fallback CRO generation
      const count = Math.floor(Math.random() * 100) + 1;
      const cro = `VDC/${formData.date}/${count}`;
      setFormData(prev => ({ ...prev, cro }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'date') {
      setTimeout(() => generateCRO(), 100);
    }
    
    if (name === 'petient_type') {
      const freeCategories = ['BPL/POOR', 'Sn. CITIZEN'];
      setShowUniId(freeCategories.includes(value));
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
    
    const selected = scans.filter(scan => newSelectedScans.includes(scan.s_id.toString()));
    setSelectedScans(selected);
    
    const totalAmount = selected.reduce((sum, scan) => sum + scan.charges, 0);
    const totalTime = selected.reduce((sum, scan) => sum + parseInt(scan.estimate_time || '0'), 0);
    
    setFormData(prev => ({
      ...prev,
      amount: totalAmount.toString(),
      est_time: totalTime.toString(),
      total_amount: totalAmount.toString(),
      due_amount: totalAmount.toString()
    }));
  };

  const calculatePayment = () => {
    const total = parseFloat(formData.total_amount) || 0;
    const received = parseFloat(formData.rec_amount) || 0;
    const discount = parseFloat(formData.dis_amount) || 0;
    const due = total - received - discount;
    
    setFormData(prev => ({ ...prev, due_amount: due.toString() }));
  };

  const validateStep = (step: number) => {
    const newErrors: {[key: string]: string} = {};
    
    if (step === 1) {
      if (!formData.hospital_name) newErrors.hospital_name = 'Hospital Name is required';
      if (!formData.doctor_name) newErrors.doctor_name = 'Doctor Name is required';
      if (!formData.firstname.trim()) newErrors.firstname = 'Patient Name is required';
      if (!formData.age.trim()) newErrors.age = 'Age is required';
      if (!formData.contact_number.trim()) newErrors.contact_number = 'Contact Number is required';
      if (formData.contact_number && !/^[0-9]{10}$/.test(formData.contact_number)) {
        newErrors.contact_number = 'Contact Number must be 10 digits';
      }
    }
    
    if (step === 2) {
      if (formData.type_of_scan.length === 0) newErrors.type_of_scan = 'At least one scan type is required';
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
      const submitData = {
        date: formData.date,
        scan_date: formData.scan_date,
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
        amount: formData.amount,
        est_time: formData.est_time,
        total_amount: formData.total_amount,
        dis_amount: formData.dis_amount,
        rec_amount: formData.rec_amount,
        due_amount: formData.due_amount,
        admin_id: 1
      };

      const response = await fetch('https://varahasdc.co.in/api/reception/patients/back-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(`Back-entry patient registered successfully! CRO: ${result.data.cro}`);
        
        // Reset form
        setFormData({
          date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
          scan_date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
          cro: '',
          hospital_name: '',
          doctor_name: '',
          pre: 'Mr.',
          firstname: '',
          age: '',
          age_type: 'Year',
          gender: 'Male',
          petient_type: 'GEN',
          p_uni_submit: 'N',
          p_uni_id_name: '',
          address: '',
          city: '',
          contact_number: '',
          type_of_scan: [],
          amount: '0',
          est_time: '0',
          total_amount: '0',
          rec_amount: '0',
          dis_amount: '0',
          due_amount: '0'
        });
        
        setHospitalSearchTerm('');
        setDoctorSearchTerm('');
        setScanSearchTerm('');
        setSelectedScans([]);
        generateCRO();
        setCurrentStep(1);
        fetchLastPatient();
        
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error || 'Failed to register back-entry patient'}`);
      }
    } catch (error) {
      console.error('Error saving back-entry patient:', error);
      toast.error('Error saving back-entry patient');
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sm:p-6 rounded-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold mb-2">Back Entry Patient Registration</h1>
            <p className="text-blue-100 text-sm sm:text-lg">Complete patient enrollment with back-entry functionality</p>
          </div>
          {lastPatient && (
            <div className="bg-blue-600 bg-opacity-50 rounded-lg p-4 sm:p-6 text-center">
              <p className="text-blue-200 text-sm sm:text-base mb-3">Last Enrolled Patient</p>
              <p className="text-white font-bold text-lg sm:text-xl mb-2">{lastPatient.cro}</p>
              <p className="text-blue-100 text-base sm:text-lg font-medium">{lastPatient.patient_name}</p>
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
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
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
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
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
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CRO No.</label>
                  <input
                    type="text"
                    name="cro"
                    value={formData.cro}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scan Date</label>
                  <input
                    type="date"
                    name="scan_date"
                    value={formData.scan_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.age ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Age"
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
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GEN">GEN</option>
                    <option value="BPL/POOR">BPL/POOR</option>
                    <option value="Sn. CITIZEN">Sn. CITIZEN</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.contact_number ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Please enter your contact Number"
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
                </div>
                {errors.type_of_scan && <p className="text-red-500 text-sm mt-1">{errors.type_of_scan}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Patient Summary
                </h3>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Full Name</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 ml-5">{formData.pre} {formData.firstname}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Age & Gender</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 ml-5">{formData.age} {formData.age_type}, {formData.gender}</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Category</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 ml-5">{formData.petient_type}</p>
                    </div>
                  </div>
                  
                  {formData.address && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Address</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 ml-5">{formData.address}</p>
                    </div>
                  )}
                  
                  {formData.contact_number && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Contact Number</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 ml-5">{formData.contact_number}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedScans.map(scan => (
                      <tr key={scan.s_id}>
                        <td className="border border-gray-300 px-4 py-2">{scan.s_name}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">₹{scan.charges}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium text-right">Total Amount</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          name="total_amount"
                          value={formData.total_amount}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-right bg-gray-50"
                          readOnly
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium text-right">Received Amount</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          name="rec_amount"
                          value={formData.rec_amount}
                          onChange={(e) => {
                            handleInputChange(e);
                            setTimeout(calculatePayment, 0);
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium text-right">Discount</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          name="dis_amount"
                          value={formData.dis_amount}
                          onChange={(e) => {
                            handleInputChange(e);
                            setTimeout(calculatePayment, 0);
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                    <tr className="bg-yellow-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium text-right">Due Amount</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          name="due_amount"
                          value={formData.due_amount}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-right bg-yellow-50 font-medium"
                          readOnly
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md font-medium"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleSubmit('Save')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md font-medium"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit('Save_Print')}
                    disabled={parseFloat(formData.due_amount) > 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md font-medium"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Save & Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/reception/patient-registration'}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-md hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md font-medium"
                  >
                    <span>Exit</span>
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