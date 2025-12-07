'use client';

import { useState, useEffect } from 'react';
import { Clock, User, Calendar, Phone, ArrowLeft } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

interface PatientData {
  patient: {
    cro: string;
    patient_name: string;
    pre: string;
    age: number;
    contact_number: string;
    allot_date: string;
    category: string;
    doctor_name: string;
    date: string;
    time_slot?: string;
  };
  scans: Array<{
    scan_id: number;
    s_id?: number;
    s_name: string;
    status: string;
  }>;
  console: {
    stop_time: string;
  } | null;
}

export default function ConsolePatient({ params }: { params: Promise<{ cro: string }> }) {
  const toast = useToastContext();
  const router = useRouter();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [stopTime, setStopTime] = useState('');
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Calcutta' })
  );
  const [cro, setCro] = useState('');
  const [formData, setFormData] = useState({
    examination_id: '',
    number_scan: '',
    number_film: '',
    number_contrast: '',
    technician_name: '',
    nursing_name: '',
    issue_cd: 'NO',
    remark: '',
    console_date: new Date().toLocaleDateString('en-CA'),
    console_time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Calcutta', hour12: false })
  });

  useEffect(() => {
    params.then(p => setCro(decodeURIComponent(p.cro)));
  }, [params]);

  useEffect(() => {
    if (cro) {
      fetchPatientData();
    }
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Calcutta' }));
    }, 1000);
    return () => clearInterval(timer);
  }, [cro]);

  const fetchPatientData = async () => {
    
    setLoading(true);
    try {
      const response = await fetch(`/api/console/patient/${encodeURIComponent(cro)}`);
      if (response.ok) {
        const data = await response.json();
        setPatientData(data.data);
        
        // Bind console data to form if it exists
        if (data.data.console) {
          const console = data.data.console;
          setFormData({
            examination_id: console.examination_id || '',
            number_scan: console.number_scan || '',
            number_film: console.number_films || '',
            number_contrast: console.number_contrast || '',
            technician_name: console.technician_name || '',
            nursing_name: console.nursing_name || '',
            issue_cd: console.issue_cd || 'NO',
            remark: console.remark || '',
            console_date: new Date().toLocaleDateString('en-CA'),
            console_time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Calcutta', hour12: false })
          });
          setStartTime(console.start_time || '');
          setStopTime(console.stop_time || '');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Console patient API error:', errorData);
        toast.error(`API Error: ${errorData.error || 'Failed to fetch patient data'}. Details: ${errorData.details || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Error loading patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleScanStatusChange = async (scanId: number, status: string) => {
    try {
      const response = await fetch('/api/console/update-scan-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          patient_id: cro,
          status: status
        })
      });

      if (response.ok) {
        fetchPatientData(); // Refresh data
        toast.success('Scan status updated');
      } else {
        toast.error('Failed to update scan status');
      }
    } catch (error) {
      console.error('Error updating scan status:', error);
      toast.error('Error updating scan status');
    }
  };

  const handleStartTimer = () => {
    setStartTime(currentTime);
  };

  const handleStopTimer = () => {
    setStopTime(currentTime);
  };

  const handleSubmit = async (action: string) => {
    try {
      // Validate required fields
      if (!formData.examination_id) {
        toast.error('Please enter Examination ID');
        return;
      }



      // Map action to status
      let status = action;
      if (action === 'Complete') status = 'Complete';
      
      const response = await fetch('https://varahasdc.co.in/api/console/save-console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cro,
          start_time: startTime,
          stop_time: stopTime,
          status,
          ...formData
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (action === 'Complete') {
          toast.success('Console completed successfully!');
          router.push('/console');
        } else if (action === 'Pending') {
          toast.success('Console marked as pending');
          router.push('/console');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(`Failed to save console data: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving console data:', error);
      toast.error('Error saving console data');
    }
  };

  const generateFinalReceipt = () => {
    if (!patientData) return;
    
    const receiptContent = `
      <html>
        <head>
          <title>Console Final Receipt - ${cro}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .patient-info { margin-bottom: 15px; }
            .console-details { margin: 15px 0; }
            .scan-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .scan-table th, .scan-table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>VARAHA SDC</h2>
            <h3>Console Completion Receipt</h3>
            <p>Date: ${new Date().toLocaleDateString('en-GB')}</p>
          </div>
          
          <div class="patient-info">
            <h4>Patient Information:</h4>
            <p><strong>CRO:</strong> ${cro}</p>
            <p><strong>Patient Name:</strong> ${patientData.patient.pre} ${patientData.patient.patient_name}</p>
            <p><strong>Age:</strong> ${patientData.patient.age}</p>
            <p><strong>Doctor:</strong> ${patientData.patient.doctor_name}</p>
            <p><strong>Category:</strong> ${patientData.patient.category}</p>
            <p><strong>Contact:</strong> ${patientData.patient.contact_number}</p>
          </div>
          
          <div class="console-details">
            <h4>Console Details:</h4>
            <p><strong>Examination ID:</strong> ${formData.examination_id}</p>
            <p><strong>Start Time:</strong> ${startTime}</p>
            <p><strong>Stop Time:</strong> ${stopTime}</p>
            <p><strong>Technician:</strong> ${formData.technician_name}</p>
            <p><strong>Nursing:</strong> ${formData.nursing_name}</p>
            <p><strong>Number of Scans:</strong> ${formData.number_scan}</p>
            <p><strong>Number of Films:</strong> ${formData.number_film}</p>
            <p><strong>Number of Contrast:</strong> ${formData.number_contrast}</p>
            <p><strong>Issue CD/DVD:</strong> ${formData.issue_cd}</p>
            ${formData.remark ? `<p><strong>Remark:</strong> ${formData.remark}</p>` : ''}
          </div>
          
          <table class="scan-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Scan Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${patientData.scans.map((scan, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${scan.s_name}</td>
                  <td>${scan.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Console completed successfully</p>
            <p>Thank you for choosing VARAHA SDC</p>
          </div>
        </body>
      </html>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Patient not found</p>
        <button
          onClick={() => router.push('/console')}
          className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
        >
          Back to Queue
        </button>
      </div>
    );
  }

  const allScansComplete = patientData.scans.every(scan => scan.status === 'complete');
  const pendingScans = patientData.scans.filter(scan => scan.status === 'pending').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/console')}
              className="p-2 bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold mb-2">Console - {cro}</h1>
              <p className="text-sky-100">Patient examination console</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Details */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient History</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Console Date Of Examination</label>
            <input
              type="text"
              value={new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Console Time</label>
            <input
              type="text"
              value={new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Calcutta', hour12: false })}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CRO Number</label>
            <input
              type="text"
              value={patientData.patient.cro}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <input
              type="text"
              value={`${patientData.patient.pre} ${patientData.patient.patient_name}`}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="text"
              value={patientData.patient.age}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <input
              type="text"
              value={patientData.patient.doctor_name}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={patientData.patient.category}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <input
              type="text"
              value={patientData.patient.contact_number}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Console Date and Time */}
      

      {/* Timer */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Timer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <button
              onClick={handleStartTimer}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-mono"
            >
              {startTime || currentTime}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stop Time</label>
            <button
              onClick={handleStopTimer}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-lg font-mono"
            >
              {stopTime || currentTime}
            </button>
          </div>
        </div>
      </div>

      {/* MRI Details */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">MRI Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">S.No</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">MRI NAME</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patientData.scans.map((scan, index) => (
                <tr key={scan.s_id || scan.scan_id || index}>
                  <td className="px-4 py-4 text-sm text-black font-medium">{index + 1}</td>
                  <td className="px-4 py-4 text-sm font-medium text-black">{scan.s_name}</td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`scan_${scan.s_id || scan.scan_id || index}`}
                          checked={scan.status === 'pending'}
                          onChange={() => handleScanStatusChange(scan.scan_id, 'pending')}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Pending</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`scan_${scan.s_id || scan.scan_id || index}`}
                          checked={scan.status === 'complete'}
                          onChange={() => handleScanStatusChange(scan.scan_id, 'complete')}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Complete</span>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Console Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Console Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Examination ID <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={formData.examination_id}
              onChange={(e) => setFormData({...formData, examination_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Scans</label>
            <input
              type="number"
              value={formData.number_scan}
              onChange={(e) => setFormData({...formData, number_scan: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Films</label>
            <input
              type="number"
              value={formData.number_film}
              onChange={(e) => setFormData({...formData, number_film: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Contrast</label>
            <input
              type="number"
              value={formData.number_contrast}
              onChange={(e) => setFormData({...formData, number_contrast: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technician Name</label>
            <input
              type="text"
              value={formData.technician_name}
              onChange={(e) => setFormData({...formData, technician_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nursing Name</label>
            <input
              type="text"
              value={formData.nursing_name}
              onChange={(e) => setFormData({...formData, nursing_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue CD/DVD</label>
            <select
              value={formData.issue_cd}
              onChange={(e) => setFormData({...formData, issue_cd: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="NO">NO</option>
              <option value="YES">YES</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({...formData, remark: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {allScansComplete ? (
          <button
            onClick={() => handleSubmit('Complete')}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg"
          >
            Complete
          </button>
        ) : (
          <button
            onClick={() => handleSubmit('Pending')}
            className="px-8 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium shadow-lg"
          >
            Pending
          </button>
        )}
        <button
          onClick={() => {
            if (window.confirm('You Click On Recall Button, Patient Data Is Not Save And Patient Is Sent On Reception Table')) {
              toast.info('Patient recalled to reception');
              router.push('/console');
            }
          }}
          className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg"
        >
          Recall
        </button>
      </div>
    </div>
  );
}