'use client';

import Layout from '@/components/layout/Layout';
import { FormInput, FormButton } from '@/components/ui/FormComponents';
import { Toast, useToast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, User, Save, Printer, X } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function PatientRegistrationBackEntry() {
  const params = useParams();
  const role = params.role as string;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [lastPatient, setLastPatient] = useState<{cro: string, patient_name: string} | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const [formData, setFormData] = useState({
    cro: '',
    date: new Date().toISOString().split('T')[0],
    scan_date: new Date().toISOString().split('T')[0],
    hospital_name: '',
    doctor_name: '',
    pre: 'Mr.',
    firstname: '',
    age: '',
    age_type: 'Year',
    gender: '',
    category: '',
    address: '',
    city: '',
    contact_number: '',
    scan_types: [],
    amount: '',
    est_time: ''
  });

  useEffect(() => {
    fetchMasterData();
    fetchLastPatient();
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
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const fetchLastPatient = async () => {
    try {
      const response = await fetch('/api/patients?last=true');
      const data = await response.json();
      if (data && data.length > 0) {
        setLastPatient(data[0]);
      }
    } catch (error) {
      console.error('Error fetching last patient:', error);
    }
  };

  const generateCRO = async () => {
    try {
      const response = await fetch('/api/patients/cro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formData.date })
      });
      const data = await response.json();
      setFormData(prev => ({ ...prev, cro: data.cro }));
    } catch (error) {
      console.error('Error generating CRO:', error);
    }
  };

  useEffect(() => {
    if (formData.date) {
      generateCRO();
    }
  }, [formData.date]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateScanDetails = async () => {
    if (formData.scan_types.length === 0) return;
    
    try {
      const response = await fetch('/api/scans/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_ids: formData.scan_types })
      });
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        amount: data.total_amount,
        est_time: data.estimated_time
      }));
    } catch (error) {
      console.error('Error calculating scan details:', error);
    }
  };

  useEffect(() => {
    calculateScanDetails();
  }, [formData.scan_types]);

  const submitForm = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          page_type: 'patient_back',
          admin_id: 1 // Replace with actual admin ID
        })
      });

      if (response.ok) {
        showToast('Patient registered successfully with back entry!', 'success');
        fetchLastPatient();
        // Reset form
        setFormData({
          cro: '',
          date: new Date().toISOString().split('T')[0],
          scan_date: new Date().toISOString().split('T')[0],
          hospital_name: '',
          doctor_name: '',
          pre: 'Mr.',
          firstname: '',
          age: '',
          age_type: 'Year',
          gender: '',
          category: '',
          address: '',
          city: '',
          contact_number: '',
          scan_types: [],
          amount: '',
          est_time: ''
        });
        setCurrentStep(1);
      } else {
        showToast('Error registering patient', 'error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('Error registering patient', 'error');
    } finally {
      setLoading(false);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CRO No.</label>
          <input
            type="text"
            value={formData.cro}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Scan Date</label>
          <input
            type="date"
            value={formData.scan_date}
            onChange={(e) => handleInputChange('scan_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
          <select
            value={formData.hospital_name}
            onChange={(e) => handleInputChange('hospital_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Hospital</option>
            {hospitals.map((hospital: any) => (
              <option key={hospital.h_id} value={hospital.h_id}>
                {hospital.h_short}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
          <select
            value={formData.doctor_name}
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
            value={formData.pre}
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
            value={formData.firstname}
            onChange={(e) => handleInputChange('firstname', e.target.value)}
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
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age Type</label>
          <select
            value={formData.age_type}
            onChange={(e) => handleInputChange('age_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="Year">Year</option>
            <option value="Month">Month</option>
            <option value="Days">Days</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select
            value={formData.gender}
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
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select</option>
            <option value="GEN">GEN</option>
            <option value="BPL/POOR">BPL/POOR</option>
            <option value="Sn. CITIZEN">Sn. CITIZEN</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={formData.city}
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
          value={formData.contact_number}
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Scan Type</label>
        <select
          multiple
          value={formData.scan_types}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            handleInputChange('scan_types', values);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
        >
          {scans.map((scan: any) => (
            <option key={scan.s_id} value={scan.s_id}>
              {scan.s_name}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple scans</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
          <input
            type="text"
            value={formData.est_time}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            placeholder="Auto calculated"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Invoice Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Patient Name:</span>
            <span className="font-medium">{formData.pre} {formData.firstname}</span>
          </div>
          <div className="flex justify-between">
            <span>Age:</span>
            <span>{formData.age} {formData.age_type}</span>
          </div>
          <div className="flex justify-between">
            <span>Gender:</span>
            <span>{formData.gender}</span>
          </div>
          <div className="flex justify-between">
            <span>Address:</span>
            <span>{formData.address}</span>
          </div>
          <hr />
          <div className="flex justify-between font-semibold">
            <span>Total Amount:</span>
            <span>₹{formData.amount}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Patient Registration Back Entry - {role}</h1>
            {lastPatient && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Last Entry:</span> {lastPatient.cro} - {lastPatient.patient_name}
              </div>
            )}
          </div>
        </div>

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
                    onClick={submitForm}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </FormButton>
                  <FormButton
                    onClick={() => {
                      submitForm();
                      // Add print logic here
                    }}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Save & Print
                  </FormButton>
                  <button
                    onClick={() => setCurrentStep(1)}
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