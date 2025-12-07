'use client';

import Layout from '@/components/layout/Layout';
import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Users, DollarSign } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Patient {
  cro: string;
  patient_name: string;
  age: string;
  gender: string;
  category: string;
  contact_number: string;
  amount: number;
  amount_reci: number;
  amount_due: number;
  scan_status: number;
  hospital_name: string;
  doctor_name: string;
}

interface Totals {
  total_amount: number;
  received_amount: number;
  due_amount: number;
  total_patients: number;
  completed_scans: number;
  pending_scans: number;
}

export default function DailyReport() {
  const params = useParams();
  const role = params.role as string;
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totals, setTotals] = useState<Totals>({
    total_amount: 0,
    received_amount: 0,
    due_amount: 0,
    total_patients: 0,
    completed_scans: 0,
    pending_scans: 0
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDailyReport();
  }, [selectedDate]);

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const formattedDate = selectedDate.split('-').reverse().join('-');
      const response = await fetch(`/api/reports/daily?date=${formattedDate}`);
      const data = await response.json();
      setPatients(data.patients || []);
      setTotals(data.totals || {
        total_amount: 0,
        received_amount: 0,
        due_amount: 0,
        total_patients: 0,
        completed_scans: 0,
        pending_scans: 0
      });
    } catch (error) {
      console.error('Error fetching daily report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const csvContent = [
      ['CRO', 'Patient Name', 'Age', 'Gender', 'Category', 'Hospital', 'Doctor', 'Amount', 'Received', 'Due', 'Status'],
      ...patients.map(p => [
        p.cro,
        p.patient_name,
        p.age,
        p.gender,
        p.category,
        p.hospital_name,
        p.doctor_name,
        p.amount,
        p.amount_reci,
        p.amount_due,
        p.scan_status === 1 ? 'Completed' : 'Pending'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Daily Report</h1>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
            />
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2 inline" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-bold text-black">Total Patients</p>
                <p className="text-2xl font-bold text-blue-600">{totals.total_patients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-bold text-black">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{totals.total_amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-bold text-black">Pending Scans</p>
                <p className="text-2xl font-bold text-orange-600">{totals.pending_scans}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-black">Patient Details - {selectedDate}</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-black font-bold">Loading...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">CRO</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Patient Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hospital</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Received</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Due</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.length > 0 ? patients.map((patient) => (
                    <tr key={patient.cro} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">{patient.cro}</td>
                      <td className="px-6 py-4 text-sm font-bold text-black">{patient.patient_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">{patient.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">{patient.gender}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">{patient.category}</td>
                      <td className="px-6 py-4 text-sm font-bold text-black">{patient.hospital_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">₹{patient.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">₹{patient.amount_reci}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">₹{patient.amount_due}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          patient.scan_status === 1 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {patient.scan_status === 1 ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center text-black font-bold text-lg">
                        No patients found for selected date
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm font-bold text-black">Total Amount</p>
              <p className="text-xl font-bold text-blue-600">₹{totals.total_amount.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-black">Received Amount</p>
              <p className="text-xl font-bold text-green-600">₹{totals.received_amount.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-black">Due Amount</p>
              <p className="text-xl font-bold text-red-600">₹{totals.due_amount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}