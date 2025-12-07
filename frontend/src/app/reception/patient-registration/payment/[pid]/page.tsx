'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Save, Calculator } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

interface Patient {
  patient_id: number;
  cro: string;
  patient_name: string;
  age: string;
  gender: string;
  address: string;
  contact_number: string;
  amount: number;
  amount_reci: number;
  amount_due: number;
  discount: number;
  h_name: string;
  dname: string;
}

interface Scan {
  s_id: number;
  s_name: string;
  charges: number;
}

export default function PaymentDetails() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.pid as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [receivedAmount, setReceivedAmount] = useState('');
  const [dueAmount, setDueAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPaymentData();
  }, [patientId]);

  const fetchPaymentData = async () => {
    try {
      const response = await fetch(`https://varahasdc.co.in/api/reception/patients/${patientId}/payment`);
      if (response.ok) {
        const data = await response.json();
        setPatient(data.data.patient);
        setScans(data.data.scans);
        setDueAmount(data.data.patient.amount_due.toString());
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDue = () => {
    if (patient && receivedAmount) {
      const currentDue = parseFloat(patient.amount_due.toString());
      const received = parseFloat(receivedAmount);
      const newDue = currentDue - received;
      setDueAmount(newDue.toString());
    }
  };

  const handleSave = async () => {
    if (!receivedAmount || !patient) return;
    
    setSaving(true);
    try {
      const response = await fetch(`https://varahasdc.co.in/api/reception/patients/${patientId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          r_amount: receivedAmount,
          d_amount: dueAmount
        })
      });

      if (response.ok) {
        alert('Payment updated successfully!');
        router.push('/reception/patient-registration/edit');
      } else {
        alert('Failed to update payment');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error updating payment');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Not Found</h2>
          <button
            onClick={() => router.push('/reception/patient-registration/edit')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Patient List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/reception/patient-registration/edit')}
                className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Payment Details</h1>
                <p className="text-blue-100">Invoice #{patient.cro}</p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Invoice Header */}
          <div className="text-center mb-8 print:mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          {/* Patient Info */}
          <div className="flex justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h3>
              <div className="text-gray-600">
                <p className="font-medium text-gray-900">{patient.patient_name}</p>
                <p>CRO: {patient.cro}</p>
                <p>Age: {patient.age}</p>
                <p>Gender: {patient.gender}</p>
                <p>Address: {patient.address}</p>
                <p>Phone: {patient.contact_number}</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Details:</h3>
              <div className="text-gray-600">
                <p>Invoice #: {patient.cro}</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
                <p>Hospital: {patient.h_name}</p>
                <p>Doctor: {patient.dname}</p>
              </div>
            </div>
          </div>

          {/* Scans Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">S.No</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900">Name Of Scan</th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">Charges</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan, index) => (
                  <tr key={scan.s_id}>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm font-medium">{scan.s_name}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-right">₹{scan.charges}</td>
                  </tr>
                ))}
                
                {/* Payment Summary */}
                <tr className="bg-gray-50">
                  <td colSpan={2} className="border border-gray-300 px-4 py-3 text-sm font-semibold text-right">Total Amount</td>
                  <td className="border border-gray-300 px-4 py-3 text-sm font-semibold text-right">₹{patient.amount}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="border border-gray-300 px-4 py-3 text-sm font-semibold text-right">Previous Deposit</td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-right">₹{patient.amount_reci}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="border border-gray-300 px-4 py-3 text-sm font-semibold text-right">Previous Due</td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-right">
                    <input
                      type="text"
                      value={patient.amount_due}
                      className="w-full text-right bg-transparent border-none outline-none"
                      readOnly
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="border border-gray-300 px-4 py-3 text-sm font-semibold text-right">Received Amount</td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-right">
                    <input
                      type="number"
                      value={receivedAmount}
                      onChange={(e) => {
                        setReceivedAmount(e.target.value);
                        setTimeout(calculateDue, 0);
                      }}
                      className="w-full text-right border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </td>
                </tr>
                <tr className="bg-yellow-50">
                  <td colSpan={2} className="border border-gray-300 px-4 py-3 text-sm font-bold text-right">Total Due</td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-right">
                    <input
                      type="text"
                      value={dueAmount}
                      className="w-full text-right bg-yellow-50 border border-gray-300 rounded px-2 py-1 font-bold"
                      readOnly
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 print:hidden">
            <button
              onClick={handleSave}
              disabled={!receivedAmount || saving}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={parseFloat(dueAmount) > 0 || !receivedAmount || saving}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Save & Print</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
            <p className="text-sm">Thank you very much for doing business with us. We look forward to working with you again!</p>
          </div>
        </div>
      </div>
    </div>
  );
}