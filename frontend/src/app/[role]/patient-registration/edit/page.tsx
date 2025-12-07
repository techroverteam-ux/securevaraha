'use client';

import Layout from '@/components/layout/Layout';
import { FormInput, FormButton } from '@/components/ui/FormComponents';
import { Toast, useToast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';
import { Search, Edit, Save, X, Calendar, Clock, FileText, User, Hospital, Stethoscope } from 'lucide-react';
import { useParams } from 'next/navigation';

interface PatientData {
  patient_id: string;
  cro: string;
  date: string;
  hospital_id: string;
  doctor_name: string;
  pre: string;
  patient_name: string;
  age: string;
  age_type: string;
  gender: string;
  category: string;
  address: string;
  city: string;
  contact_number: string;
  scan_type: string;
  allot_time: string;
  allot_time_out: string;
  amount: string;
}

export default function PatientRegistrationEdit() {
  const params = useParams();
  const role = params.role as string;
  const [croNumber, setCroNumber] = useState('');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<{time_id: number, time_slot: string}[]>([]);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [hospitalsRes, doctorsRes, scansRes] = await Promise.all([
        fetch('/api/hospitals'),
        fetch('/api/doctors'),
        fetch('/api/scans')
      ]);
      
      setHospitals(await hospitalsRes.json());
      setDoctors(await doctorsRes.json());
      setScans(await scansRes.json());
      
      // Generate time slots
      const slots = [];
      for (let i = 8; i <= 18; i++) {
        slots.push({ time_id: i, time_slot: `${i}:00` });
        slots.push({ time_id: i + 0.5, time_slot: `${i}:30` });
      }
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const searchPatient = async () => {
    if (!croNumber.trim()) {
      showToast('Please enter CRO number', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/patients?cro=${croNumber}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setPatientData(data[0]);
        showToast('Patient found successfully', 'success');
      } else {
        showToast('Patient not found with this CRO number', 'error');
        setPatientData(null);
      }
    } catch (error) {
      console.error('Error searching patient:', error);
      showToast('Error searching patient', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updatePatient = async () => {
    if (!patientData) return;

    setLoading(true);
    try {
      const response = await fetch('/api/patients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });

      if (response.ok) {
        showToast('Patient updated successfully!', 'success');
      } else {
        showToast('Error updating patient', 'error');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      showToast('Error updating patient', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (patientData) {
      setPatientData({ ...patientData, [field]: value });
    }
  };

  const renderStepTabs = () => (
    <ul className="flex border-b border-gray-200 mb-6">
      {[
        { step: 1, title: '1. Enrollment Detail', icon: User },
        { step: 2, title: '2. Scan Options', icon: FileText },
        { step: 3, title: '3. Payment Details', icon: Clock }
      ].map(({ step, title, icon: Icon }) => (
        <li key={step} className="flex-1">
          <button
            onClick={() => setCurrentStep(step)}
            className={`w-full flex items-center justify-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              currentStep === step
                ? 'border-sky-500 text-sky-600 bg-sky-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {title}
          </button>
        </li>
      ))}
    </ul>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CRO No.</label>
          <input
            type="text"
            value={patientData?.cro || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={patientData?.date || ''}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
          <select
            value={patientData?.hospital_id || ''}
            onChange={(e) => handleInputChange('hospital_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Hospital</option>
            {hospitals.map((hospital: any) => (
              <option key={hospital.h_id} value={hospital.h_id}>
                {hospital.h_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
          <select
            value={patientData?.doctor_name || ''}
            onChange={(e) => handleInputChange('doctor_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Doctor</option>
            {doctors.map((doctor: any) => (
              <option key={doctor.d_id} value={doctor.d_id}>
                {doctor.dname}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <select
            value={patientData?.pre || ''}
            onChange={(e) => handleInputChange('pre', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="Mr.">Mr.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Master">Master</option>
            <option value="Miss">Miss</option>
            <option value="Baby">Baby</option>
          </select>
        </div>
        <div className="md:col-span-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
          <input
            type="text"
            value={patientData?.patient_name || ''}
            onChange={(e) => handleInputChange('patient_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter patient name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
          <input
            type="number"
            value={patientData?.age || ''}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age Type</label>
          <select
            value={patientData?.age_type || ''}
            onChange={(e) => handleInputChange('age_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            <option value="Year">Year</option>
            <option value="Month">Month</option>
            <option value="Days">Days</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select
            value={patientData?.gender || ''}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={patientData?.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            <option value="GEN">GEN / Paid</option>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            value={patientData?.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={patientData?.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter city"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
        <input
          type="tel"
          value={patientData?.contact_number || ''}
          onChange={(e) => handleInputChange('contact_number', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Enter contact number"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Previously Selected Scans</label>
        <input
          type="text"
          value={patientData?.scan_type || ''}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Update Scan Type</label>
        <select
          multiple
          value={patientData?.scan_type?.split(',') || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            handleInputChange('scan_type', values.join(','));
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
        >
          {scans.map((scan: any) => (
            <option key={scan.s_id} value={scan.s_id}>
              {scan.s_name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date</label>
          <input
            type="date"
            value={patientData?.date || ''}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time In</label>
          <select
            value={patientData?.allot_time || ''}
            onChange={(e) => handleInputChange('allot_time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Time</option>
            {timeSlots.map((slot: any) => (
              <option key={slot.time_id} value={slot.time_id}>
                {slot.time_slot}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Out</label>
          <select
            value={patientData?.allot_time_out || ''}
            onChange={(e) => handleInputChange('allot_time_out', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Time</option>
            {timeSlots.map((slot: any) => (
              <option key={slot.time_id} value={slot.time_id}>
                {slot.time_slot}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <input
            type="number"
            value={patientData?.amount || ''}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
          <input
            type="text"
            placeholder="Auto calculated"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            readOnly
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Patient Name:</span>
            <span className="font-medium">{patientData?.patient_name}</span>
          </div>
          <div className="flex justify-between">
            <span>Age:</span>
            <span>{patientData?.age} {patientData?.age_type}</span>
          </div>
          <div className="flex justify-between">
            <span>Gender:</span>
            <span>{patientData?.gender}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-medium">₹{patientData?.amount}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Patient Registration - {role}</h1>
        </div>

        {!patientData ? (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <Search className="h-12 w-12 text-sky-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Search Patient</h2>
                <p className="text-gray-600">Enter CRO number to find patient</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CRO Number</label>
                  <input
                    type="text"
                    value={croNumber}
                    onChange={(e) => setCroNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Enter CRO number"
                  />
                </div>
                
                <FormButton
                  onClick={searchPatient}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Searching...' : 'Search Patient'}
                </FormButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {renderStepTabs()}
            
            <div className="min-h-96">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <div className="flex space-x-2">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex space-x-2">
                {currentStep < 3 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                  >
                    Next
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <FormButton
                      onClick={updatePatient}
                      disabled={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </FormButton>
                    <button
                      onClick={() => {
                        setPatientData(null);
                        setCroNumber('');
                        setCurrentStep(1);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Exit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      </div>
    </Layout>
  );
}