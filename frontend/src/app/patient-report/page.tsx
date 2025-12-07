'use client';

import { useState, useEffect } from 'react';
import { Download, Search } from 'lucide-react';

interface Patient {
  patient_id: number;
  cro: string;
  patient_name: string;
  age: number;
  gender: string;
  mobile: string;
  date: string;
  amount: number;
  doctor_name: string;
  hospital_name: string;
  scan_name: string;
}

export default function PatientReport() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      let url = '/api/reports/patient-report';
      if (fromDate && toDate) {
        url += `?from_date=${fromDate}&to_date=${toDate}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setPatients(data.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['CRO', 'Patient Name', 'Age', 'Gender', 'Mobile', 'Date', 'Amount', 'Doctor', 'Hospital', 'Scan Type'];
    const csvContent = [
      headers.join(','),
      ...patients.map(p => [
        p.cro,
        p.patient_name,
        p.age,
        p.gender,
        p.mobile,
        p.date,
        p.amount,
        p.doctor_name,
        p.hospital_name,
        p.scan_name
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Patient Report</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchPatients}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={exportToCSV}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CRO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hospital</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scan Type</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center">No patients found</td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.patient_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.cro}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.patient_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{patient.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.doctor_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.hospital_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.scan_name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Total Records: {patients.length}
        </div>
      </div>
    </div>
  );
}