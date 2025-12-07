'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Search, Download, Eye, ChevronLeft, ChevronRight, Filter, RefreshCw } from 'lucide-react';
import SuperAdminLayout, { Card, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, Button, Pagination } from '@/components/SuperAdminLayout';
import DateRangeFilter from '@/components/ui/DateRangeFilter';

interface PatientData {
  patient_id: number;
  cro: string;
  patient_name: string;
  age: number;
  gender: string;
  contact_number: string;
  h_name: string;
  dname: string;
  category?: string;
  amount: number;
  date: string;
  remark?: string;
}



export default function PatientList() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  
  const [currentDateRange, setCurrentDateRange] = useState<{from_date: string, to_date: string} | null>(null);

  useEffect(() => {
    if (currentDateRange) {
      fetchPatients();
    }
  }, [currentDateRange]);

  const fetchPatients = useCallback(async () => {
    if (!currentDateRange) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from_date: currentDateRange.from_date,
        to_date: currentDateRange.to_date
      });
      
      const response = await fetch(`https://varahasdc.co.in/api/admin/patient-list?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPatients(data.data || []);
        setFilteredPatients(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }, [currentDateRange]);

  const handleViewPatient = (patient: PatientData) => {
    setSelectedPatient(patient);
    setShowViewDialog(true);
  };

  const exportToExcel = () => {
    const headers = ['S.No', 'CRO Number', 'Patient Name', 'Age', 'Gender', 'Mobile', 'Hospital', 'Doctor', 'Amount', 'Date'];
    
    const formatDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-');
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    };
    
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
            th { background-color: #dc2626; color: white; font-weight: bold; padding: 8px; border: 1px solid #ccc; text-align: center; }
            td { padding: 6px; border: 1px solid #ccc; text-align: left; }
            .center { text-align: center; }
            .header { text-align: center; font-weight: bold; font-size: 16px; }
          </style>
        </head>
        <body>
          <table>
            <tr><th colspan="10" class="header">VARAHA SDC</th></tr>
            <tr><th colspan="10" class="header">PATIENT LIST (${formatDate(currentDateRange?.from_date || '')} to ${formatDate(currentDateRange?.to_date || '')})</th></tr>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${filteredPatients.map((patient, index) => `
                <tr>
                  <td class="center">${index + 1}</td>
                  <td>${patient.cro}</td>
                  <td>${patient.patient_name}</td>
                  <td class="center">${patient.age}</td>
                  <td class="center">${patient.gender}</td>
                  <td>${patient.contact_number}</td>
                  <td>${patient.h_name || '-'}</td>
                  <td>${patient.dname || '-'}</td>
                  <td class="center">₹${patient.amount}</td>
                  <td class="center">${patient.date}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Patient-List-${formatDate(currentDateRange?.from_date || '')}-to-${formatDate(currentDateRange?.to_date || '')}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter patients based on search
  useEffect(() => {
    let filtered = patients;
    
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.contact_number.includes(searchTerm)
      );
    }
    
    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [patients, searchTerm]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Patient List</h1>
        <button
          onClick={exportToExcel}
          disabled={filteredPatients.length === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <Download className="h-5 w-5" />
          <span>Export Excel</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <DateRangeFilter onDateChange={(fromDate, toDate) => setCurrentDateRange({ from_date: fromDate, to_date: toDate })} />
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or CRO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={fetchPatients}
            disabled={loading || !currentDateRange}
            className="ml-4 flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">All Patients</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S. No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-gray-500">No patients found</td>
                </tr>
              ) : (
                paginatedPatients.map((patient, index) => (
                  <tr key={patient.patient_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{startIndex + index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.cro}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.patient_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.age}/{patient.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.contact_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.h_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.dname || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{patient.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button 
                        onClick={() => handleViewPatient(patient)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPatients.length)} of {filteredPatients.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === page
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Patient Dialog */}
      {showViewDialog && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Patient Details</h3>
                <button
                  onClick={() => setShowViewDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">CRO Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.cro}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.patient_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.age}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.contact_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hospital</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.h_name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Doctor</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.dname || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-sm text-gray-900">₹{selectedPatient.amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.date}</p>
                </div>
                {selectedPatient.remark && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Remark</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPatient.remark}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowViewDialog(false)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}