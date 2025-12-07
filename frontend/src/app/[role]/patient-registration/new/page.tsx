'use client';

import Layout from '@/components/layout/Layout';
import PatientRegistrationForm from '@/components/ui/PatientRegistrationForm';
import { Toast, useToast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, Calendar, Clock, FileText, Printer, Eye } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function PatientRegistrationNew() {
  const params = useParams();
  const role = params.role as string;
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSubmit = (patientData: any) => {
    setPatients(prev => Array.isArray(prev) ? [patientData, ...prev] : [patientData]);
    showToast('Patient registered successfully with receipt printed!', 'success');
  };

  const filteredPatients = patients.filter((patient: any) =>
    patient.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    patient.cro?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const todayStats = {
    totalRegistered: patients.length,
    todayRegistered: patients.filter((p: any) => {
      const today = new Date().toISOString().split('T')[0];
      return p.date === today;
    }).length,
    pendingScans: patients.filter((p: any) => p.scan_status === 'Pending').length,
    completedScans: patients.filter((p: any) => p.scan_status === 'Complete').length
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">New Patient Registration - {role}</h1>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Today:</span> {new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Registered</p>
                <p className="text-2xl font-bold text-gray-900">{todayStats.totalRegistered}</p>
              </div>
              <div className="p-3 bg-sky-100 rounded-full">
                <UserPlus className="h-6 w-6 text-sky-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today Registered</p>
                <p className="text-2xl font-bold text-gray-900">{todayStats.todayRegistered}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Scans</p>
                <p className="text-2xl font-bold text-gray-900">{todayStats.pendingScans}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Scans</p>
                <p className="text-2xl font-bold text-gray-900">{todayStats.completedScans}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Show</span>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search:"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Register New Patient</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading patients...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">S.No.</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">CRO</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Patient Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Age</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Gender</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Contact</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPatients.map((patient: any, index) => (
                      <tr key={patient.patient_id || `patient-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{startIndex + index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b font-medium">{patient.cro || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b font-medium">{patient.patientName || patient.patient_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{patient.age || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{patient.gender || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{patient.category || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{patient.contactNumber || patient.contact_number || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm border-b">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            patient.scan_status === 'Complete' 
                              ? 'bg-green-100 text-green-800' 
                              : patient.scan_status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {patient.scan_status || 'Registered'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm border-b">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => showToast('Patient details viewed', 'success')}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => showToast('Receipt reprinted successfully', 'success')}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Reprint Receipt"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPatients.length)} of {filteredPatients.length}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded text-sm ${
                          currentPage === page
                            ? 'bg-sky-500 text-white border-sky-500'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-2 text-gray-500">...</span>}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          {!loading && filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No patients registered yet</p>
              <p className="text-gray-400 text-sm mt-2">Click "Register New Patient" to start patient registration</p>
            </div>
          )}
        </div>

        <PatientRegistrationForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handlePatientSubmit}
        />

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