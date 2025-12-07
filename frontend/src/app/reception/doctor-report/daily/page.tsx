'use client';

import { useState, useEffect } from 'react';
import { Calendar, FileText, Download, Search } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import LastEnrolledPatient from '@/components/LastEnrolledPatient';
import { getCurrentDate, formatDate } from '@/utils/dateFormat';

interface ReportData {
  sno: number;
  doctorName: string;
  totalScans: number;
  paidPatients: number;
  freePatients: number;
  totalRevenue: number;
}

export default function DoctorDailyReport() {
  const toast = useToastContext();
  const getTodayDate = () => {
    return getCurrentDate();
  };

  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);

  const generateReport = async (start = startDate, end = endDate) => {
    if (!start || !end) {
      toast.error('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://varahasdc.co.in/api/reception/reports/doctor?startDate=${start}&endDate=${end}`);
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data.data || []);
        setHasData(true);
      } else {
        toast.error('Failed to generate report');
        setReportData([]);
        setHasData(false);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report');
      setReportData([]);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    generateReport();
  };

  // Removed auto-load - users must click Generate Report button

  const exportToExcel = () => {
    if (!startDate || !endDate) {
      toast.error('Please generate report first');
      return;
    }

    // Use server-side Excel generation (matches PHP exactly)
    const url = `https://varahasdc.co.in/api/reception/reports/doctor/excel?startDate=${startDate}&endDate=${endDate}`;
    window.open(url, '_blank');
  };

  const exportToExcelClient = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Create HTML table structure exactly like PHP
    let htmlContent = '<html>';
    htmlContent += '<meta http-equiv="Content-Type" content="text/html; charset=Windows-1252"><body>';
    htmlContent += '<table border="1">';
    htmlContent += '<tr><th colspan="6">VARAHA SDC</th></tr>';
    htmlContent += '<tr><th style="text-align:center;" colspan="6">DOCTOR REPORT</th></tr>';
    htmlContent += `<tr><th style="text-align:center;" colspan="6">From ${startDate} To ${endDate}</th></tr>`;
    htmlContent += '<tr><th>S.No</th><th>DOCTOR NAME</th><th>Total Scan</th><th>Paid Patient</th><th>Free Patient</th><th>Total Revenue</th></tr>';
    
    reportData.forEach(row => {
      htmlContent += `<tr><td>${row.sno}</td><td>${row.doctorName}</td><td>${row.totalScans}</td><td>${row.paidPatients}</td><td>${row.freePatients}</td><td>${row.totalRevenue}</td></tr>`;
    });
    
    htmlContent += '<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
    htmlContent += '</table></body></html>';

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DOCTOR_REPORT-${startDate} -To-${endDate}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getTotalScans = () => reportData.reduce((sum, row) => sum + row.totalScans, 0);
  const getTotalPaid = () => reportData.reduce((sum, row) => sum + row.paidPatients, 0);
  const getTotalFree = () => reportData.reduce((sum, row) => sum + row.freePatients, 0);
  const getTotalRevenue = () => reportData.reduce((sum, row) => sum + row.totalRevenue, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-6">
          <div className="flex justify-between items-start"><div><h1 className="text-3xl font-bold mb-2">Doctor Daily Report</h1>
          <p className="text-blue-100 text-lg">Generate comprehensive doctor performance reports</p></div><div className="ml-6"><LastEnrolledPatient /></div></div>
        </div>

        {/* Report Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Report By Date Range
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate.split('-').reverse().join('-')}
                  onChange={(e) => {
                    const parts = e.target.value.split('-');
                    setStartDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate.split('-').reverse().join('-')}
                  onChange={(e) => {
                    const parts = e.target.value.split('-');
                    setEndDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-md font-medium"
                >
                  <Search className="h-4 w-4" />
                  <span>{loading ? 'Generating...' : 'Generate Report'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Report Results */}
        {hasData && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-100">
            {/* Report Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">VARAHA SDC</h2>
                  <h3 className="text-lg font-semibold text-gray-700 mt-1">DOCTOR REPORT</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    From <span className="font-medium">{startDate}</span> To <span className="font-medium">{endDate}</span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={exportToExcelClient}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md font-medium"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Download Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Report Table */}
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-16" />
                  <col className="w-48" />
                  <col className="w-24" />
                  <col className="w-24" />
                  <col className="w-24" />
                  <col className="w-32" />
                </colgroup>
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 uppercase">S.No</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-blue-700 uppercase">Doctor Name</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-blue-700 uppercase">Total Scan</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-blue-700 uppercase">Paid Patient</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-blue-700 uppercase">Free Patient</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-blue-700 uppercase">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((row, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">{row.sno}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 font-medium truncate">{row.doctorName}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-center">{row.totalScans}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-center">{row.paidPatients}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-center">{row.freePatients}</td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium">₹{row.totalRevenue.toLocaleString()}</td>
                    </tr>
                  ))}
                  
                  {/* Total Row */}
                  <tr className="bg-blue-100 font-bold">
                    <td className="px-3 py-2 text-sm text-blue-900" colSpan={2}>TOTAL</td>
                    <td className="px-3 py-2 text-sm text-blue-900 text-center">{getTotalScans()}</td>
                    <td className="px-3 py-2 text-sm text-blue-900 text-center">{getTotalPaid()}</td>
                    <td className="px-3 py-2 text-sm text-blue-900 text-center">{getTotalFree()}</td>
                    <td className="px-3 py-2 text-sm text-blue-900 text-right">₹{getTotalRevenue().toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {reportData.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
                <p className="text-gray-500">No doctor reports found for the selected date range.</p>
              </div>
            )}
          </div>
        )}

        {!hasData && !loading && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-12">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Doctor Report</h3>
              <p className="text-gray-500">Select a date range above and click "Generate Report" to view doctor performance data.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}