'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Edit, Eye, FileText, Send, User, X } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import LastEnrolledPatient from '@/components/LastEnrolledPatient';
import DateRangeFilter from '@/components/ui/DateRangeFilter';

interface Patient {
  patient_id: number;
  cro: string;
  pre: string;
  patient_name: string;
  age: string;
  gender: string;
  doctor_name: string;
  hospital_id: string;
  amount_due: number;
  amount_reci: number;
  scan_status: number;
  date: string;
  dname?: string;
  h_name?: string;
}

interface SendToData {
  destination: 'Nursing' | 'Console';
  cro: string;
}

export default function PatientList() {
  const toast = useToastContext();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [sendToData, setSendToData] = useState<SendToData>({ destination: 'Nursing', cro: '' });
  const [currentDateRange, setCurrentDateRange] = useState<{from: string, to: string} | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (fromDate?: string, toDate?: string) => {
    try {
      let url = 'https://varahasdc.co.in/api/reception/patients/list';
      if (fromDate && toDate) {
        url += `?from=${fromDate}&to=${toDate}`;
      }
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Patients data:', data); // Debug log
        setPatients(data.data || []);
      } else {
        console.error('Failed to fetch patients');
        toast.error('Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Error fetching patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = useCallback((fromDate: string, toDate: string) => {
    setCurrentDateRange({ from: fromDate, to: toDate });
    setLoading(true);
    fetchPatients(fromDate, toDate);
  }, []);

  const handleSendTo = (patient: Patient) => {
    setSelectedPatient(patient);
    setSendToData({ destination: 'Nursing', cro: patient.cro });
    setShowSendModal(true);
  };

  const submitSendTo = async () => {
    try {
      const response = await fetch('/api/admin/patients/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendToData)
      });
      
      if (response.ok) {
        toast.success(`Patient sent to ${sendToData.destination} successfully!`);
        setShowSendModal(false);
        currentDateRange ? fetchPatients(currentDateRange.from, currentDateRange.to) : fetchPatients(); // Refresh list
      }
    } catch (error) {
      toast.error('Error sending patient');
    }
  };

  const getStatusButton = (patient: Patient) => {
    const isDue = patient.amount_due > 0;
    const status = patient.scan_status;
    
    let buttonText = '';
    let disabled = isDue;

    switch (status) {
      case 0:
        buttonText = 'Awaiting For Process';
        break;
      case 2:
        buttonText = 'Stand In Corridor Queue';
        disabled = true;
        break;
      case 3:
        buttonText = 'Recall';
        break;
      case 4:
        buttonText = 'Pending';
        break;
      default:
        buttonText = 'Unknown Status';
    }

    if (status === 2) {
      disabled = true;
    }

    return (
      <button
        onClick={() => !disabled && handleSendTo(patient)}
        disabled={disabled}
        title={buttonText}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${disabled ? 'bg-gray-400 text-white cursor-not-allowed opacity-60' : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md'}`}
      >
        {buttonText}
      </button>
    );
  };

  const getAmountStatus = (patient: Patient) => {
    if (patient.amount_due === 0) {
      return (
        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs font-medium shadow-md">
          No Due
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full text-xs font-medium shadow-md">
          Due
        </span>
      );
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.cro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-6">
          <div className="flex justify-between items-start"><div><h1 className="text-3xl font-bold mb-2">Registered Patient List</h1>
          <p className="text-blue-100 text-lg">Manage and view all registered patients</p></div><div className="ml-6"><LastEnrolledPatient /></div></div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Search Patients</h3>
            </div>
            
            <DateRangeFilter onDateChange={handleDateChange} />
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by CRO or patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => currentDateRange ? fetchPatients(currentDateRange.from, currentDateRange.to) : fetchPatients()}
                disabled={loading}
                title="Refresh patient list"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-md"
              >
                <Search className="h-5 w-5" />
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Patient Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">S. No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">CRO No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Amount Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Doctor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Hospital Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPatients.map((patient, index) => (
                  <tr key={patient.patient_id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">{startIndex + index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{patient.cro}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">{patient.patient_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{getAmountStatus(patient)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.dname || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{patient.h_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        {getStatusButton(patient)}
                        <div className="flex space-x-1">
                          <a href={`/reception/patient-registration/new?edit=${patient.patient_id}`} title="Edit Patient Details">
                            <button className="px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs rounded-lg hover:from-blue-600 hover:to-indigo-700 font-medium transition-all duration-200 shadow-md" title="Edit Patient Details">
                              <Edit className="h-4 w-4" />
                            </button>
                          </a>
                          <a href={`/reception/patient-registration/payment/${patient.patient_id}`} title="View Payment Details">
                            <button className="px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs rounded-lg hover:from-indigo-600 hover:to-purple-700 font-medium transition-all duration-200 shadow-md" title="View Payment Details">
                              <FileText className="h-4 w-4" />
                            </button>
                          </a>
                          <button className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs rounded-lg hover:from-purple-600 hover:to-pink-700 font-medium transition-all duration-200 shadow-md" title="View Invoice">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
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
                        title="Go to first page"
                        className="px-3 py-2 text-sm font-medium bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md"
                      >
                        First
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        title="Go to previous page"
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
                          title={`Go to page ${page}`}
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
                        title="Go to next page"
                        className="px-3 py-2 text-sm font-medium bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        title="Go to last page"
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
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Found</h3>
              <p className="text-gray-500">
                {loading ? 'Loading patients...' : 'No registered patients found.'}
              </p>
            </div>
          )}
        </div>

        {/* Send To Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Send To</h3>
                  <button onClick={() => setShowSendModal(false)} title="Close modal" className="text-white hover:text-gray-200 transition-colors duration-200">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Send patient <strong>{selectedPatient?.cro}</strong> to:
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="destination"
                        value="Nursing"
                        checked={sendToData.destination === 'Nursing'}
                        onChange={(e) => setSendToData(prev => ({ ...prev, destination: e.target.value as 'Nursing' }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Nursing</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="destination"
                        value="Console"
                        checked={sendToData.destination === 'Console'}
                        onChange={(e) => setSendToData(prev => ({ ...prev, destination: e.target.value as 'Console' }))}
                        className="mr-2"
                      />
                      <span className="text-sm">Console</span>
                    </label>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={submitSendTo}
                    title="Send patient to selected destination"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center justify-center space-x-2 transition-all duration-200 shadow-md font-medium"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit</span>
                  </button>
                  <button
                    onClick={() => setShowSendModal(false)}
                    title="Cancel and close modal"
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}