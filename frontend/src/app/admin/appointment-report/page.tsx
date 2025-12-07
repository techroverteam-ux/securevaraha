'use client';

import { useState, useEffect } from 'react';
import { Download, Calendar, ClipboardList, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import SuperAdminLayout from '@/components/SuperAdminLayout';

interface AppointmentData {
  sno: number;
  cro: string;
  patient_name: string;
  age: string;
  gender: string;
  category: string;
  scan_type: string;
  total_scan: number;
  time_in: string;
  time_out: string;
  status: string;
  console_date: string;
}

export default function AppointmentReport() {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };
  
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString.includes('-') && dateString.length === 10) return dateString;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        s_date: selectedDate
      });
      const response = await fetch(`https://varahasdc.co.in/api/admin/appointment-report?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.cro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const exportToExcel = () => {
    // Matches PHP appoexcel.php exactly
    let htmlContent = `<html><meta http-equiv="Content-Type" content="text/html; charset=Windows-1252"><body>`;
    htmlContent += `<table border="1">`;
    htmlContent += `<tr><th colspan="14">VARAHA SDC</th></tr>`;
    htmlContent += `<tr><th style="text-margin:center;" colspan="14">Appointment REPORT-${selectedDate}</th></tr>`;
    htmlContent += `<tr><th>S.No</th><th>CRO</th><th>NAME</th><th>AGE</th><th>GENDER</th><th>CATEGORY</th><th>SCAN TYPE</th><th>TOTAL SCAN</th><th>Time In</th><th>Time Out</th><th>Status</th><th>Console Date</th></tr>`;
    
    filteredAppointments.forEach((appointment, index) => {
      htmlContent += '<tr>';
      htmlContent += `<td>${appointment.sno}</td>`;
      htmlContent += `<td>${appointment.cro}</td>`;
      htmlContent += `<td>${appointment.patient_name}</td>`;
      htmlContent += `<td>${appointment.age}</td>`;
      htmlContent += `<td>${appointment.gender}</td>`;
      htmlContent += `<td>${appointment.category}</td>`;
      htmlContent += `<td>${appointment.scan_type}</td>`;
      htmlContent += `<td>${appointment.total_scan}</td>`;
      htmlContent += `<td>${appointment.time_in}</td>`;
      htmlContent += `<td>${appointment.time_out}</td>`;
      htmlContent += `<td>${appointment.status}</td>`;
      htmlContent += `<td>${formatDate(appointment.console_date)}</td>`;
      htmlContent += '</tr>';
    });
    
    htmlContent += '</table></body></html>';

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DAILY REPORT-${selectedDate}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <SuperAdminLayout 
      title="Appointment Report" 
      subtitle="Patient Appointment Records"
      actions={
        <button
          onClick={exportToExcel}
          disabled={filteredAppointments.length === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <Download className="h-5 w-5" />
          <span>Export Excel</span>
        </button>
      }
    >
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate.split('-').reverse().join('-')}
                onChange={(e) => {
                  const parts = e.target.value.split('-');
                  const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                  setSelectedDate(formattedDate);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClipboardList className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900">Appointments ({filteredAppointments.length})</h2>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Scan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Console Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-4 text-center text-gray-500">No appointments found</td>
                  </tr>
                ) : (
                  paginatedAppointments.map((appointment, index) => (
                    <tr key={appointment.sno} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.sno}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.cro}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.patient_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.gender}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.scan_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.total_scan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.time_in}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.time_out}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(appointment.console_date)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <span className="flex items-center px-3 py-2 text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
}