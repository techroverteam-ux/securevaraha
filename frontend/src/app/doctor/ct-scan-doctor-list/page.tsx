'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, Calendar } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

interface CTScanDoctorPatient {
  patient_id: number;
  cro: string;
  patient_name: string;
  pre: string;
  date: string;
  age: string;
  doctor_name: string;
  hospital_name: string;
  scan_type: string;
  n_patient_ct: string;
  n_patient_ct_report_date: string;
  n_patient_ct_remark: string;
  n_patient_x_ray: string;
  n_patient_x_ray_report_date: string;
  n_patient_x_ray_remark: string;
  ct_scan_doctor_id: number;
  ct_doctor_name: string;
}

export default function CTScanDoctorList() {
  const toast = useToastContext();
  const router = useRouter();
  const [patientData, setPatientData] = useState<CTScanDoctorPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allPatients, setAllPatients] = useState<CTScanDoctorPatient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<CTScanDoctorPatient[]>([]);
  const [fromDate, setFromDate] = useState(
    new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Calcutta' })
  );
  const [toDate, setToDate] = useState(
    new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Calcutta' })
  );
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchPatientData();
  }, [fromDate, toDate]);

  useEffect(() => {
    // Client-side search filtering
    if (searchTerm.trim()) {
      const filtered = allPatients.filter(patient => 
        patient.cro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(allPatients);
    }
    setCurrentPage(1);
  }, [searchTerm, allPatients]);

  const validateDateRange = () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both from and to dates');
      return false;
    }
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    if (from > to) {
      toast.error('From date cannot be later than to date');
      return false;
    }
    
    return true;
  };

  const fetchPatientData = async () => {
    if (!validateDateRange()) {
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from_date: fromDate.split('-').reverse().join('-'),
        to_date: toDate.split('-').reverse().join('-')
      });
      
      const response = await fetch(`/api/doctor/ct-scan-doctor-list?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAllPatients(data.data || []);
        setFilteredPatients(data.data || []);
        
        if (!data.data || data.data.length === 0) {
          toast.error('No data found for the selected date range');
        } else {
          toast.success(`Found ${data.data.length} records for the selected date range`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to fetch patient data');
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewNursing = (cro: string) => {
    console.log('Navigating to nursing page with CRO:', cro);
    const encodedCro = encodeURIComponent(cro);
    const url = `/doctor/nursing/${encodedCro}`;
    console.log('Navigation URL:', url);
    router.push(url);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPatientData();
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedData = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">CT Scan Doctor List</h1>
            <p className="text-emerald-100">Manage CT scan doctor assignments with date filtering</p>
          </div>
          <button
            onClick={fetchPatientData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 w-full sm:w-auto border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 w-full sm:w-auto border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="relative flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by CRO or Patient Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={fetchPatientData}
            disabled={loading || !fromDate || !toDate}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            Generate Report
          </button>
          <div className="text-sm text-gray-600">
            Total Records: {filteredPatients.length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">CT Scan Doctor Assignments</h2>
          <p className="text-sm text-gray-600 mt-1">
            Report from {fromDate.split('-').reverse().join('-')} to {toDate.split('-').reverse().join('-')} | Page {currentPage} of {totalPages} | Total: {filteredPatients.length} records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  Sr. No.
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  CRO
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  Patient Name
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  Age
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  Date
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  CT Scan Doctor
                </th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  CT Status
                </th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  X-Ray Status
                </th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center border-b border-gray-200">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-emerald-500" />
                      <span className="text-gray-500">Loading patient data...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500 border-b border-gray-200">
                    No patient records found for selected date range
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item.patient_id} className="hover:bg-blue-50 transition-colors border-b border-gray-200">
                    <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 font-medium">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-4 border-r border-gray-200">
                      <div className="text-sm font-semibold text-blue-600 cursor-pointer hover:text-blue-800 hover:underline"
                           onClick={() => handleViewNursing(item.cro)}>
                        {item.cro}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-r border-gray-200">
                      <div className="text-sm font-medium text-gray-900">
                        {item.pre} {item.patient_name}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                      {item.age || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                      {item.date}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                      {item.ct_doctor_name || '-'}
                    </td>
                    <td className="px-4 py-4 text-center border-r border-gray-200">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        item.n_patient_ct?.toLowerCase() === 'yes' 
                          ? 'bg-green-100 text-green-800' 
                          : item.n_patient_ct?.toLowerCase() === 'no'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.n_patient_ct?.toLowerCase() === 'yes' ? 'Completed' : item.n_patient_ct?.toLowerCase() === 'no' ? 'Pending' : 'Not Set'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center border-r border-gray-200">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        item.n_patient_x_ray?.toLowerCase() === 'yes' 
                          ? 'bg-green-100 text-green-800' 
                          : item.n_patient_x_ray?.toLowerCase() === 'no'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.n_patient_x_ray?.toLowerCase() === 'yes' ? 'Completed' : item.n_patient_x_ray?.toLowerCase() === 'no' ? 'Pending' : 'Not Set'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleViewNursing(item.cro)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                        title="View Nursing Details"
                      >
                        <div className="text-center">
                          <div className="font-semibold">{item.cro}</div>
                          <div className="text-xs opacity-90">{item.date}</div>
                        </div>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Client-side Pagination */}
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
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === page
                            ? 'bg-emerald-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
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
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Last
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}