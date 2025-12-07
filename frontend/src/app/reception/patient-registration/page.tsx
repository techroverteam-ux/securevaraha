'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Eye, Calendar } from 'lucide-react';
import LastEnrolledPatient from '@/components/LastEnrolledPatient';

interface Patient {
  p_id: number;
  cro_number: string;
  patient_name: string;
  age: string;
  gender: string;
  mobile: string;
  h_name: string;
  dname: string;
  category: string;
  date: string;
  amount: number;
  address: string;
}

export default function PatientRegistration() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/admin/patient-list');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cro_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mobile.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Patient Registration</h1>
            <p className="text-blue-100 text-lg">Manage patient registrations and records</p>
          </div>
          <div className="ml-6">
            <LastEnrolledPatient />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, CRO, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchPatients}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-md font-medium"
            >
              <Search className="h-5 w-5" />
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
          <button 
            onClick={() => window.location.href = '/reception/patient-registration/new'}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>New Patient</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                <th className="border border-gray-300 px-4 py-2 text-left">CRO</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Patient Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Age/Gender</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Mobile</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Hospital</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Doctor</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.map((patient, index) => (
                <tr key={patient.p_id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{startIndex + index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{patient.cro_number}</td>
                  <td className="border border-gray-300 px-4 py-2">{patient.patient_name}</td>
                  <td className="border border-gray-300 px-4 py-2">{patient.age}, {patient.gender}</td>
                  <td className="border border-gray-300 px-4 py-2">{patient.mobile}</td>
                  <td className="border border-gray-300 px-4 py-2">{patient.h_name || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{patient.dname || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{patient.category || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">₹{patient.amount}</td>
                  <td className="border border-gray-300 px-4 py-2">{patient.date}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex space-x-1">
                      <button className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded hover:from-blue-600 hover:to-indigo-700 text-xs font-medium transition-all duration-200 shadow-md">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded hover:from-indigo-600 hover:to-purple-700 text-xs font-medium transition-all duration-200 shadow-md">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {paginatedPatients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {loading ? 'Loading patients...' : 'No patients found'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPatients.length)} of {filteredPatients.length}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 transition-all duration-200 shadow-md font-medium"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded shadow-md font-medium">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 transition-all duration-200 shadow-md font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}