'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Filter, Printer, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import LastEnrolledPatient from '@/components/LastEnrolledPatient';

interface Appointment {
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
  completed_date?: string;
  scan_names?: string;
}

export default function AppointmentReport() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const formatConsoleDate = (dateString?: string) => {
    if (!dateString || dateString === '-') return '-';
    
    // Handle ISO format like 2025-10-01T04:00:00.000Z
    if (dateString.includes('T')) {
      const date = new Date(dateString);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    
    // Return as is if already in DD-MM-YYYY format
    return dateString;
  };

  const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const fetchAppointments = async (date?: string) => {
    setLoading(true);
    try {
      const queryDate = date || selectedDate;
      const url = queryDate 
        ? `https://varahasdc.co.in/api/reports/appointment?date=${queryDate}`
        : `https://varahasdc.co.in/api/reports/appointment?date=${getTodayDate()}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAppointments(data.data || []);
          if (data.data.length === 0) {
            // Show toast message instead of alert
          }
        } else {
          setAppointments([]);
        }
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const todayDate = getTodayDate();
    setSelectedDate(todayDate);
    fetchAppointments(todayDate);
  }, []);

  const filteredAppointments = appointments.filter(appointment => 
    statusFilter === 'all' || appointment.status === statusFilter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const statusCounts = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  const exportToExcel = () => {
    if (filteredAppointments.length === 0) {
      alert('No data to export');
      return;
    }

    // Create HTML table with styling similar to PHP version
    let htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
            .header { text-align: center; font-weight: bold; font-size: 16px; }
            .center { text-align: center; }
          </style>
        </head>
        <body>
          <table>
            <tr><th colspan="12" class="header">VARAHA SDC</th></tr>
            <tr><th colspan="12" class="header">APPOINTMENT REPORT Date: ${selectedDate}</th></tr>
            <tr>
              <th>S.No</th>
              <th>CRO</th>
              <th>NAME</th>
              <th>AGE</th>
              <th>GENDER</th>
              <th>CATEGORY</th>
              <th>SCAN TYPE</th>
              <th>TOTAL SCAN</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Status</th>
              <th>Console Date</th>
            </tr>
    `;

    // Add appointment data rows
    filteredAppointments.forEach((appointment, index) => {
      htmlContent += `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${appointment.cro}</td>
          <td>${appointment.patient_name}</td>
          <td>${appointment.age}</td>
          <td>${appointment.gender}</td>
          <td>${appointment.category}</td>
          <td>${appointment.scan_names || appointment.scan_type}</td>
          <td class="center">${appointment.total_scan}</td>
          <td class="center">${appointment.time_in || '-'}</td>
          <td class="center">${appointment.time_out || '-'}</td>
          <td class="center">${appointment.status.toUpperCase()}</td>
          <td class="center">${formatConsoleDate(appointment.completed_date)}</td>
        </tr>
      `;
    });

    htmlContent += `
          </table>
        </body>
      </html>
    `;

    // Create blob and download as Excel file
    const blob = new Blob([htmlContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `APPOINTMENT REPORT-${selectedDate}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-start"><div><h1 className="text-3xl font-bold mb-2">Appointment Report</h1>
        <p className="text-sky-100 text-lg">Track and manage patient appointments and schedules</p></div><div className="ml-6"><LastEnrolledPatient /></div></div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <input
                type="date"
                value={selectedDate.split('-').reverse().join('-')}
                onChange={(e) => {
                  const parts = e.target.value.split('-');
                  const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                  setSelectedDate(formattedDate);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <button
              onClick={() => fetchAppointments()}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all duration-200 disabled:opacity-50 shadow-md font-medium"
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
          
          {appointments.length > 0 && (
            <button
              onClick={exportToExcel}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all duration-200 shadow-md font-medium"
            >
              <Printer className="h-4 w-4" />
              <span>Export to Excel</span>
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        )}

        {appointments.length > 0 && (
          <div className="space-y-6">
            {/* Status Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total</p>
                    <p className="text-2xl font-bold text-gray-700">{statusCounts.total}</p>
                  </div>
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Scheduled</p>
                    <p className="text-2xl font-bold text-blue-700">{statusCounts.scheduled}</p>
                  </div>
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Completed</p>
                    <p className="text-2xl font-bold text-green-700">{statusCounts.completed}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">{statusCounts.pending}</p>
                  </div>
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="overflow-x-auto">
              <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
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
                  {(() => {
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
                    
                    return paginatedAppointments.map((appointment, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{startIndex + index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{appointment.cro}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{appointment.patient_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{appointment.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{appointment.gender}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{appointment.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{appointment.scan_names || appointment.scan_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">{appointment.total_scan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">{appointment.time_in || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">{appointment.time_out || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full border ${
                            appointment.status === 'Completed' ? 'bg-green-100 text-green-900 border-green-300' :
                            appointment.status === 'Shared to Console' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                            'bg-yellow-100 text-yellow-900 border-yellow-300'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">{formatConsoleDate(appointment.completed_date)}</td>
                    </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredAppointments.length > itemsPerPage && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {Math.ceil(filteredAppointments.length / itemsPerPage)} | Total: {filteredAppointments.length} records
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
                      {Array.from({ length: Math.min(5, Math.ceil(filteredAppointments.length / itemsPerPage)) }, (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const page = startPage + i;
                        const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
                        if (page > totalPages) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                              currentPage === page
                                ? 'bg-sky-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    {currentPage < Math.ceil(filteredAppointments.length / itemsPerPage) && (
                      <>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Next
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.ceil(filteredAppointments.length / itemsPerPage))}
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
        )}

        {!appointments.length && !loading && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Found</h3>
            <p className="text-gray-500">No appointments scheduled for the selected date.</p>
          </div>
        )}
      </div>
    </div>
  );
}