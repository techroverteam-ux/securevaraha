'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FormInput } from './FormComponents';
import ReceiptPrint from './ReceiptPrint';

interface PatientRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function PatientRegistrationForm({ isOpen, onClose, onSubmit }: PatientRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [formData, setFormData] = useState({
    // Patient Details
    prefix: 'Mr.',
    patientName: '',
    age: '',
    ageType: 'Year',
    gender: 'Male',
    category: 'GEN / Paid',
    address: '',
    city: '',
    contactNumber: '',
    
    // Hospital & Doctor
    hospitalId: '',
    doctorId: '',
    
    // Scan Details
    selectedScans: [] as number[],
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '',
    
    // Payment
    scanAmount: 0,
    totalAmount: 0,
    discount: 0,
    receivedAmount: 0,
    dueAmount: 0
  });

  const [hospitals] = useState([
    { id: 1, name: 'M.D.M Hospital', short: 'MDM' },
    { id: 2, name: 'S.N. Medical College', short: 'SNMC' },
    { id: 3, name: 'AIIMS Jodhpur', short: 'AIIMS' }
  ]);

  const [doctors] = useState([
    { id: 1, name: 'Dr. Rajesh Kumar', specialization: 'Radiology' },
    { id: 2, name: 'Dr. Priya Sharma', specialization: 'Internal Medicine' },
    { id: 3, name: 'Dr. Amit Singh', specialization: 'Orthopedics' }
  ]);

  const [scanTypes] = useState([
    { id: 1, name: 'CT Scan Head', charges: 2500, estimatedTime: 30 },
    { id: 2, name: 'CT Scan Chest', charges: 3000, estimatedTime: 45 },
    { id: 3, name: 'CT Scan Abdomen', charges: 3500, estimatedTime: 60 },
    { id: 4, name: 'CT Angiography', charges: 5000, estimatedTime: 90 },
    { id: 5, name: 'CT Whole Body', charges: 8000, estimatedTime: 120 }
  ]);

  const [timeSlots] = useState([
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM'
  ]);

  const freeCategories = ['IPD FREE', 'OPD FREE', 'RTA', 'RGHS', 'Chiranjeevi', 'Destitute', 'PRISONER', 'Sn. CITIZEN', 'Aayushmaan'];

  useEffect(() => {
    calculateAmounts();
  }, [formData.selectedScans, formData.discount, formData.receivedAmount, formData.category, scanTypes, freeCategories]);

  const calculateAmounts = () => {
    const totalScanAmount = formData.selectedScans.reduce((sum, scanId) => {
      const scan = scanTypes.find(s => s.id === scanId);
      return sum + (scan ? scan.charges : 0);
    }, 0);

    const isFreeCategory = freeCategories.includes(formData.category);
    const finalAmount = isFreeCategory ? 0 : totalScanAmount;
    const dueAmount = finalAmount - formData.discount - formData.receivedAmount;

    setFormData(prev => ({
      ...prev,
      scanAmount: totalScanAmount,
      totalAmount: finalAmount,
      dueAmount: Math.max(0, dueAmount)
    }));
  };

  const handleScanSelection = (scanId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedScans: prev.selectedScans.includes(scanId)
        ? prev.selectedScans.filter(id => id !== scanId)
        : [...prev.selectedScans, scanId]
    }));
  };

  const generateCRO = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB').replace(/\//g, '-');
    const randomNum = Math.floor(Math.random() * 1000) + 1;
    return `VDC/${dateStr}/${randomNum}`;
  };

  const handleSubmit = (printReceipt = false) => {
    const cro = generateCRO();
    const selectedScanNames = formData.selectedScans.map(scanId => {
      const scan = scanTypes.find(s => s.id === scanId);
      return scan ? scan.name : '';
    }).join(', ');

    const hospitalName = hospitals.find(h => h.id === parseInt(formData.hospitalId))?.name || '';
    const doctorName = doctors.find(d => d.id === parseInt(formData.doctorId))?.name || '';

    const submissionData = {
      ...formData,
      cro,
      hospitalName,
      doctorName,
      investigations: selectedScanNames,
      date: new Date().toLocaleDateString('en-GB')
    };

    if (printReceipt) {
      setReceiptData({
        cro,
        name: `${formData.prefix} ${formData.patientName}`,
        age: `${formData.age} ${formData.ageType}`,
        gender: formData.gender,
        address: `${formData.address}, ${formData.city}`,
        phone: formData.contactNumber,
        doctor: doctorName,
        category: formData.category,
        investigations: selectedScanNames,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.timeSlot,
        scanAmount: formData.scanAmount,
        totalAmount: formData.totalAmount,
        receivedAmount: formData.receivedAmount,
        discount: formData.discount > 0 ? formData.discount : null,
        date: new Date().toLocaleDateString('en-GB')
      });
      setShowReceipt(true);
    }

    onSubmit(submissionData);
    if (!printReceipt) {
      onClose();
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Patient Registration</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center p-4 border-b">
            <div className="flex space-x-8">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`flex items-center space-x-2 ${
                    currentStep >= step ? 'text-sky-500' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep >= step ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  <span className="font-medium">
                    {step === 1 && 'Patient Details'}
                    {step === 2 && 'Scan Selection'}
                    {step === 3 && 'Payment Details'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Patient Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hospital</label>
                    <select
                      value={formData.hospitalId}
                      onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    >
                      <option value="">Select Hospital</option>
                      {hospitals.map(hospital => (
                        <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                    <select
                      value={formData.doctorId}
                      onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prefix</label>
                    <select
                      value={formData.prefix}
                      onChange={(e) => setFormData({...formData, prefix: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Master">Master</option>
                      <option value="Miss">Miss</option>
                      <option value="Baby">Baby</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <FormInput
                      label="Patient Name"
                      type="text"
                      value={formData.patientName}
                      onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <FormInput
                      label="Age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age Type</label>
                    <select
                      value={formData.ageType}
                      onChange={(e) => setFormData({...formData, ageType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormInput
                      label="Address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <FormInput
                      label="City"
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <FormInput
                    label="Contact Number"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Scan Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Time</label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    >
                      <option value="">Select Time Slot</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Scan Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scanTypes.map(scan => (
                      <div
                        key={scan.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          formData.selectedScans.includes(scan.id)
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-gray-300 hover:border-sky-300'
                        }`}
                        onClick={() => handleScanSelection(scan.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{scan.name}</h4>
                            <p className="text-sm text-gray-600">₹{scan.charges} • {scan.estimatedTime} min</p>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            formData.selectedScans.includes(scan.id)
                              ? 'border-sky-500 bg-sky-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.selectedScans.includes(scan.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {formData.selectedScans.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Scans Summary</h4>
                    <div className="space-y-2">
                      {formData.selectedScans.map(scanId => {
                        const scan = scanTypes.find(s => s.id === scanId);
                        return scan ? (
                          <div key={scanId} className="flex justify-between text-sm">
                            <span>{scan.name}</span>
                            <span>₹{scan.charges}</span>
                          </div>
                        ) : null;
                      })}
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Total Amount</span>
                        <span>₹{formData.scanAmount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Payment Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-sky-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Scan Amount:</span>
                        <span className="font-medium">₹{formData.scanAmount}</span>
                      </div>
                      <div>
                        <FormInput
                          label="Discount Amount"
                          type="number"
                          value={formData.discount}
                          onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <FormInput
                          label="Received Amount"
                          type="number"
                          value={formData.receivedAmount}
                          onChange={(e) => setFormData({...formData, receivedAmount: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span>₹{formData.totalAmount}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold text-red-600">
                        <span>Due Amount:</span>
                        <span>₹{formData.dueAmount}</span>
                      </div>
                      {freeCategories.includes(formData.category) && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded">
                          <p className="text-sm">This category is eligible for free treatment. No payment required.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Patient Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Name:</span> {formData.prefix} {formData.patientName}</p>
                      <p><span className="font-medium">Age:</span> {formData.age} {formData.ageType}</p>
                      <p><span className="font-medium">Gender:</span> {formData.gender}</p>
                      <p><span className="font-medium">Category:</span> {formData.category}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Contact:</span> {formData.contactNumber}</p>
                      <p><span className="font-medium">Address:</span> {formData.address}, {formData.city}</p>
                      <p><span className="font-medium">Appointment:</span> {formData.appointmentDate} at {formData.timeSlot}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                {currentStep < 3 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleSubmit(false)}
                      className="px-6 py-2 border border-sky-500 text-sky-500 rounded-lg hover:bg-sky-50 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleSubmit(true)}
                      className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                      disabled={formData.dueAmount > 0 && !freeCategories.includes(formData.category)}
                    >
                      Save & Print
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReceipt && (
        <ReceiptPrint
          isOpen={showReceipt}
          onClose={() => {
            setShowReceipt(false);
            onClose();
          }}
          patientData={receiptData}
        />
      )}
    </>
  );
}