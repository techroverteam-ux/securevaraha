'use client';

import { useState, useEffect } from 'react';
import { Search, Save, User, Calendar, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import LastEnrolledPatient from '@/components/LastEnrolledPatient';
import DateRangeFilter from '@/components/ui/DateRangeFilter';

interface Patient {
  patient_id: number;
  cro: string;
  patient_name: string;
  age: string;
  gender: string;
  contact_number: string;
  h_name: string;
  dname: string;
  category: string;
  amount: number;
  scan_status?: number;
  allot_date?: string;
  allot_time?: string;
  scan_type?: string;
  remark?: string;
}

export default function PatientModify() {
  const toast = useToastContext();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    allot_date: '',
    allot_time: '',
    scan_type: '',
    remark: '',
    scan_status: 0
  });

  const fetchPatients = async (from: string, to: string) => {
    setLoading(true);
    try {
      const fromFormatted = from.split('-').reverse().join('-');
      const toFormatted = to.split('-').reverse().join('-');
      const response = await fetch(`https://varahasdc.co.in/api/admin/patient-list?from_date=${fromFormatted}&to_date=${toFormatted}`);
      const data = await response.json();
      setPatients(data.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Error fetching patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (from: string, to: string) => {
    fetchPatients(from, to);
  };

  const filteredPatients = patients.filter(patient =>
    (patient.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.cro || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.contact_number || '').includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      allot_date: patient.allot_date || '',
      allot_time: patient.allot_time || '',
      scan_type: patient.scan_type || '',
      remark: patient.remark || '',
      scan_status: patient.scan_status || 0
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    setLoading(true);
    try {
      const response = await fetch(`https://varahasdc.co.in/api/admin/patients/${editingPatient.patient_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Patient scan details updated successfully!');
        setEditingPatient(null);
        // Patient list will refresh automatically
      } else {
        toast.error('Error updating patient');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating patient');
    } finally {
      setLoading(false);
    }
  };

  const toggleScanStatus = async (patient: Patient) => {
    const newStatus = patient.scan_status === 1 ? 0 : 1;
    
    try {
      const response = await fetch(`https://varahasdc.co.in/api/admin/patients/${patient.patient_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_status: newStatus })
      });

      if (response.ok) {
        toast.success(`Scan status ${newStatus === 1 ? 'completed' : 'pending'}`);
        // Patient list will refresh automatically
      } else {
        toast.error('Error updating scan status');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating scan status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-start"><div><h1 className="text-3xl font-bold mb-2">Patient Scan Management</h1>
        <p className="text-blue-100 text-lg">Manage patient scan details and status</p></div><div className="ml-6"><LastEnrolledPatient /></div></div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="space-y-4 mb-6">
          <DateRangeFilter onDateChange={handleDateChange} />
          
          <div className="flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, CRO, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading patients...</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPatients.map((patient, index) => (
                    <tr key={patient.patient_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">{startIndex + index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{patient.cro}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{patient.patient_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.age}, {patient.gender}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.contact_number || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.h_name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.dname || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.category || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">₹{patient.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleScanStatus(patient)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                            patient.scan_status === 1
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        >
                          {patient.scan_status === 1 ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>Pending</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(patient)}
                          className="px-2 py-1 bg-sky-400 text-white text-xs rounded-lg hover:bg-sky-500 font-medium transition-all duration-200 shadow-md"
                        >
                          Edit Scan
                        </button>
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
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Found</h3>
                <p className="text-gray-500">No patients found for the selected date.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Scan Details</h3>
              <button
                onClick={() => setEditingPatient(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">Patient: {editingPatient.patient_name}</p>
              <p className="text-sm text-gray-600">CRO: {editingPatient.cro}</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Allotment Date
                </label>
                <input
                  type="date"
                  value={formData.allot_date}
                  onChange={(e) => setFormData({...formData, allot_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Allotment Time
                </label>
                <input
                  type="time"
                  value={formData.allot_time}
                  onChange={(e) => setFormData({...formData, allot_time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scan Type</label>
                <input
                  type="text"
                  value={formData.scan_type}
                  onChange={(e) => setFormData({...formData, scan_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter scan type"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scan Status</label>
                <select
                  value={formData.scan_status}
                  onChange={(e) => setFormData({...formData, scan_status: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Pending</option>
                  <option value={1}>Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({...formData, remark: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter remarks"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-md font-medium"
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  {loading ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 px-4 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}