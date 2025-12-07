'use client';

import { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, XCircle, Calendar, Phone } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import LastEnrolledPatient from '@/components/LastEnrolledPatient';

interface PendingPatient {
  patient_id: number;
  p_id?: number;
  cro: string;
  cro_number?: string;
  patient_name: string;
  age: string;
  gender: string;
  mobile?: string;
  contact_number?: string;
  h_name?: string;
  hospital_name?: string;
  dname?: string;
  doctor_name?: string;
  category: string;
  date: string;
  amount: number;
  amount_due?: number;
  address: string;
  remark?: string;
  scan_type?: string;
  scan_status?: number;
}

export default function PendingPatient() {
  const toast = useToastContext();
  const [patients, setPatients] = useState<PendingPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  const [itemsPerPage] = useState(10);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingPatients();
  }, []);

  const fetchPendingPatients = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/reception/patients/list');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePatientStatus = async (patientId: number, newStatus: string) => {
    setUpdating(patientId);
    try {
      const response = await fetch(`https://varahasdc.co.in/api/admin/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.error(`Patient status updated to ${newStatus}`);
        fetchPendingPatients();
      } else {
        toast.error('Error updating patient status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating patient status');
    } finally {
      setUpdating(null);
    }
  };

  const filteredPatients = patients.filter(patient =>
    (patient.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.cro || patient.cro_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.contact_number || patient.mobile || '').includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pending Patients</h1>
            <p className="text-sky-100 text-lg">Manage patients waiting for consultation</p>
          </div>
          <div className="bg-sky-600 bg-opacity-50 rounded-lg p-4 sm:p-6 text-center">
            <LastEnrolledPatient />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, CRO, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{filteredPatients.length} pending patients</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pending patients...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRO</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPatients.map((patient, index) => (
                    <tr key={patient.patient_id || patient.p_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">{startIndex + index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{patient.cro || patient.cro_number || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{patient.patient_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.age}, {patient.gender}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.contact_number || patient.mobile || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.address || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.hospital_name || patient.h_name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.doctor_name || patient.dname || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.category || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">₹{patient.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updatePatientStatus(patient.patient_id || patient.p_id || 0, 'in_progress')}
                            disabled={updating === (patient.patient_id || patient.p_id)}
                            className="px-2 py-1 bg-sky-400 text-white text-xs rounded-lg hover:bg-sky-500 disabled:opacity-50 font-medium transition-all duration-200 shadow-md"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => updatePatientStatus(patient.patient_id || patient.p_id || 0, 'completed')}
                            disabled={updating === (patient.patient_id || patient.p_id)}
                            className="px-2 py-1 bg-sky-400 text-white text-xs rounded-lg hover:bg-sky-500 disabled:opacity-50 font-medium transition-all duration-200 shadow-md"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updatePatientStatus(patient.patient_id || patient.p_id || 0, 'cancelled')}
                            disabled={updating === (patient.patient_id || patient.p_id)}
                            className="px-2 py-1 bg-sky-400 text-white text-xs rounded-lg hover:bg-sky-500 disabled:opacity-50 font-medium transition-all duration-200 shadow-md"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages} | Total: {filteredPatients.length} records
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentPage > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentPage(1)}
                          className="px-3 py-2 text-sm font-medium bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md"
                        >
                          First
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="px-3 py-2 text-sm font-medium bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md"
                        >
                          Previous
                        </button>
                      </>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const page = startPage + i;
                        if (page > totalPages) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-md ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    {currentPage < totalPages && (
                      <>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="px-3 py-2 text-sm font-medium bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md"
                        >
                          Next
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-3 py-2 text-sm font-medium bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md"
                        >
                          Last
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Patients</h3>
                <p className="text-gray-500">All patients have been processed or no patients found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}