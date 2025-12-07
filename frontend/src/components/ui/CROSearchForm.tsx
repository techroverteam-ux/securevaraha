'use client';

import { useState } from 'react';
import { Search, Printer, CreditCard } from 'lucide-react';
import { FormInput, FormButton } from './FormComponents';
import ReceiptPrint from './ReceiptPrint';
import { Toast, useToast } from './Toast';

interface CROSearchFormProps {
  onPatientFound?: (patient: any) => void;
}

export default function CROSearchForm({ onPatientFound }: CROSearchFormProps) {
  const [cro, setCro] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState<{receivedAmount: number, dueAmount: number}>({
    receivedAmount: 0,
    dueAmount: 0
  });
  const { toast, showToast, hideToast } = useToast();

  const searchPatient = async () => {
    if (!cro.trim()) {
      showToast('Please enter CRO number', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/patients/search?cro=${cro}`);
      const data = await response.json();
      
      if (data.success && data.patient) {
        setPatientData(data.patient);
        setPaymentData({
          receivedAmount: data.patient.amount_reci || 0,
          dueAmount: data.patient.amount_due || 0
        });
        onPatientFound?.(data.patient);
        showToast('Patient found successfully!', 'success');
      } else {
        showToast('Patient not found with this CRO', 'error');
        setPatientData(null);
      }
    } catch (error) {
      showToast('Error searching patient', 'error');
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!patientData) return;

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cro: patientData.cro,
          receivedAmount: paymentData.receivedAmount,
          dueAmount: paymentData.dueAmount
        })
      });

      if (response.ok) {
        showToast('Payment processed successfully!', 'success');
        setShowPaymentForm(false);
        // Update patient data with new payment info
        setPatientData((prev: any) => ({
          ...prev,
          amount_reci: paymentData.receivedAmount,
          amount_due: paymentData.dueAmount
        }));
      }
    } catch (error) {
      showToast('Payment processing failed', 'error');
    }
  };

  const printReceipt = () => {
    if (!patientData) return;
    
    const receiptData = {
      cro: patientData.cro,
      name: patientData.patient_name,
      age: patientData.age,
      gender: patientData.gender,
      address: patientData.address,
      phone: patientData.contact_number,
      doctor: patientData.doctor_name,
      category: patientData.category,
      investigations: patientData.scan_type,
      appointmentDate: patientData.allot_date,
      appointmentTime: patientData.allot_time,
      scanAmount: patientData.amount,
      totalAmount: patientData.amount,
      receivedAmount: patientData.amount_reci,
      date: patientData.date
    };
    
    setShowReceipt(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Search className="h-6 w-6 text-sky-500" />
          <h2 className="text-xl font-bold text-gray-900">Enter Patient CRO No</h2>
        </div>

        <div className="space-y-4">
          <FormInput
            label="Enter CRO No"
            type="text"
            value={cro}
            onChange={(e) => setCro(e.target.value)}
            placeholder="e.g., VDC/11-09-2025/123"
          />
          
          <FormButton 
            onClick={searchPatient}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>{loading ? 'Searching...' : 'Submit'}</span>
          </FormButton>
        </div>

        {patientData && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Patient Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium">CRO:</span> {patientData.cro}</div>
              <div><span className="font-medium">Name:</span> {patientData.patient_name}</div>
              <div><span className="font-medium">Age:</span> {patientData.age}</div>
              <div><span className="font-medium">Gender:</span> {patientData.gender}</div>
              <div><span className="font-medium">Category:</span> {patientData.category}</div>
              <div><span className="font-medium">Contact:</span> {patientData.contact_number}</div>
              <div className="md:col-span-2"><span className="font-medium">Address:</span> {patientData.address}</div>
            </div>

            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <div className="font-semibold">₹{patientData.amount || 0}</div>
                </div>
                <div>
                  <span className="text-gray-600">Received:</span>
                  <div className="font-semibold text-green-600">₹{patientData.amount_reci || 0}</div>
                </div>
                <div>
                  <span className="text-gray-600">Due:</span>
                  <div className="font-semibold text-red-600">₹{patientData.amount_due || 0}</div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-4">
              <FormButton onClick={printReceipt}>
                <Printer className="h-4 w-4" />
                <span>Print Receipt</span>
              </FormButton>
              
              {(patientData.amount_due > 0) && (
                <FormButton 
                  onClick={() => setShowPaymentForm(true)}
                  variant="secondary"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Process Payment</span>
                </FormButton>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Process Payment</h3>
            <div className="space-y-4">
              <FormInput
                label="Received Amount"
                type="number"
                value={paymentData.receivedAmount}
                onChange={(e) => setPaymentData({
                  ...paymentData,
                  receivedAmount: parseFloat(e.target.value) || 0
                })}
              />
              <FormInput
                label="Due Amount"
                type="number"
                value={paymentData.dueAmount}
                onChange={(e) => setPaymentData({
                  ...paymentData,
                  dueAmount: parseFloat(e.target.value) || 0
                })}
              />
              <div className="flex space-x-3">
                <FormButton onClick={handlePayment} className="flex-1">
                  Process Payment
                </FormButton>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReceipt && patientData && (
        <ReceiptPrint
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          patientData={patientData}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
}