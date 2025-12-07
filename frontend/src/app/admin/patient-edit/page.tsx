'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Edit, Eye, FileText, Send, User, X, RefreshCw } from 'lucide-react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
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

export default function AdminPatientEdit() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [sendToData, setSendToData] = useState<SendToData>({ destination: 'Nursing', cro: '' });
  const [currentDateRange, setCurrentDateRange] = useState<{from_date: string, to_date: string} | null>(null);

  useEffect(() => {
    if (currentDateRange) {
      fetchPatients();
    }
  }, [currentDateRange]);

  const fetchPatients = useCallback(async () => {
    if (!currentDateRange) return;
    
    try {
      const params = new URLSearchParams({
        from_date: currentDateRange.from_date,
        to_date: currentDateRange.to_date
      });
      
      const response = await fetch(`https://varahasdc.co.in/api/admin/patient-list?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setPatients(data.data || []);
      } else {
        alert('Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      alert('Error fetching patients');
    } finally {
      setLoading(false);
    }
  }, [currentDateRange]);

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
        alert(`Patient sent to ${sendToData.destination} successfully!`);
        setShowSendModal(false);
        fetchPatients();
      }
    } catch (error) {
      alert('Error sending patient');
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
        buttonText = 'Recall';
    }

    if (status === 2) {
      disabled = true;
    }

    return (
      <button
        onClick={() => !disabled && handleSendTo(patient)}
        disabled={disabled}
        title={buttonText}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
          disabled 
            ? 'bg-gray-400 text-white cursor-not-allowed opacity-60' 
            : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
        }`}
      >
        {buttonText}
      </button>
    );
  };

  const getAmountStatus = (patient: Patient) => {
    if (patient.amount_due === 0) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          No Due
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          Due
        </span>
      );
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.cro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  return (
    <SuperAdminLayout 
      title="Edit Patient Registration" 
      subtitle="Manage and edit registered patient information"
    >
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <DateRangeFilter onDateChange={(fromDate, toDate) => setCurrentDateRange({ from_date: fromDate, to_date: toDate })} />
          
          <div className="flex items-center justify-between mt-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search Patient to Edit</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by CRO or patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={fetchPatients}
                disabled={loading || !currentDateRange}
                title="Refresh patient list"
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 shadow-md"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S. No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRO No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPatients.map((patient, index) => (
                  <tr key={patient.patient_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{startIndex + index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">{patient.cro}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{patient.patient_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getAmountStatus(patient)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.dname || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.h_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        {getStatusButton(patient)}
                        <div className="flex space-x-1">
                          <a href={`/reception/patient-registration/new?edit=${patient.patient_id}`} title="Edit Patient Details">
                            <button className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 font-medium transition-all duration-200 shadow-md group" title="Edit Patient Details">
                              <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            </button>
                          </a>
                          <a href={`/reception/patient-registration/payment/${patient.patient_id}`} title="View Payment Details">
                            <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 shadow-md group" title="View Payment Details">
                              <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            </button>
                          </a>
                          <button className="px-2 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-medium transition-all duration-200 shadow-md group" title="View Invoice">
                            <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
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
                        className="px-3 py-2 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md"
                      >
                        First
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        title="Go to previous page"
                        className="px-3 py-2 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md"
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
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-400 text-white hover:bg-gray-500'
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
                        className="px-3 py-2 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        title="Go to last page"
                        className="px-3 py-2 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md"
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
                {loading ? 'Loading patients...' : 'No registered patients found for today.'}
              </p>
            </div>
          )}
        </div>

        {/* Send To Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="bg-red-600 text-white p-4 rounded-t-lg">
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
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-all duration-200 shadow-md font-medium"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit</span>
                  </button>
                  <button
                    onClick={() => setShowSendModal(false)}
                    title="Cancel and close modal"
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}