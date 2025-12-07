'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import * as XLSX from 'xlsx';

interface DetailReport {
  con_id: number;
  c_p_cro: string;
  examination_id: number;
  number_films: number;
  number_scan: string;
  number_contrast: number;
  issue_cd: string;
  start_time: string;
  stop_time: string;
  status: string;
  technician_name: string;
  nursing_name: string;
  remark: string;
  added_on: string;
  patient_name: string;
  pre: string;
  doctor_name: string;
  age: string;
  category: string;
  scan_type: string;
  scan_names?: string;
  amount: number;
  cro: string;
  date: string;
}

export default function ConsoleDetailReport() {
  const toast = useToastContext();
  const [reports, setReports] = useState<DetailReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(
    new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Calcutta' })
  );
  const [toDate, setToDate] = useState(
    new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Calcutta' })
  );
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate]);

  useEffect(() => {
    // Fetch data on initial load with today's date
    fetchReports();
  }, []);

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

  const fetchReports = async () => {
    if (!validateDateRange()) {
      return;
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        fromDate: fromDate.split('-').reverse().join('-'),
        toDate: toDate.split('-').reverse().join('-')
      });
      
      const response = await fetch(`https://varahasdc.co.in/api/console/detail-report?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data.data || []);
        
        if (!data.data || data.data.length === 0) {
          toast.error('No data found for the selected date range');
        } else {
          toast.success(`Found ${data.data.length} records for the selected date range`);
        }
        
        // Calculate total revenue
        const revenue = (data.data || []).reduce((sum: number, report: DetailReport) => {
          return sum + (parseInt(String(report.amount)) || 0);
        }, 0);
        setTotalRevenue(revenue);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Console detail report API error:', errorData);
        toast.error(`Failed to fetch detail report: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching detail report:', error);
      toast.error('Network error: Unable to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (reports.length === 0) {
      toast.error('No data to export');
      return;
    }

    setExporting(true);
    try {
      const formattedFromDate = fromDate.split('-').reverse().join('-');
      const formattedToDate = toDate.split('-').reverse().join('-');
      
      // Create HTML table with styling similar to reception daily report
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
              .amount { text-align: right; }
            </style>
          </head>
          <body>
            <table>
              <tr><th colspan="20" class="header">VARAHA SDC</th></tr>
              <tr><th colspan="20" class="header">CONSOLE DETAIL REPORT - From ${formattedFromDate} To ${formattedToDate}</th></tr>
              <tr>
                <th>S.No</th>
                <th>CRO</th>
                <th>Exam. Id</th>
                <th>Name</th>
                <th>Doctor Name</th>
                <th>Age</th>
                <th>Category</th>
                <th>Scan Type</th>
                <th>Films</th>
                <th>Number of Scan</th>
                <th>Issue CD/DVD</th>
                <th>Contrast</th>
                <th>Amount</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Technician Name</th>
                <th>Nursing Name</th>
                <th>Remark</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
      `;

      // Calculate totals
      let totalFilms = 0, totalScans = 0, totalCD = 0, totalContrast = 0, totalAmount = 0;

      // Add patient data rows
      reports.forEach((report: DetailReport, index: number) => {
        const films = parseInt(String(report.number_films)) || 0;
        const scans = parseInt(String(report.number_scan)) || 0;
        const cd = report.issue_cd === 'YES' ? 1 : 0;
        const contrast = parseInt(String(report.number_contrast)) || 0;
        const amount = parseInt(String(report.amount)) || 0;
        
        totalFilms += films;
        totalScans += scans;
        totalCD += cd;
        totalContrast += contrast;
        totalAmount += amount;
        
        htmlContent += `
          <tr>
            <td class="center">${index + 1}</td>
            <td>${report.c_p_cro || report.cro}</td>
            <td class="center">${report.examination_id || 0}</td>
            <td>${report.pre} ${report.patient_name}</td>
            <td>${report.doctor_name || '-'}</td>
            <td class="center">${report.age || '-'}</td>
            <td>${report.category || '-'}</td>
            <td>${report.scan_type || '-'}</td>
            <td class="center">${films}</td>
            <td class="center">${scans}</td>
            <td class="center">${cd}</td>
            <td class="center">${contrast}</td>
            <td class="amount">₹${amount.toLocaleString()}</td>
            <td class="center">${report.start_time || '-'}</td>
            <td class="center">${report.stop_time || '-'}</td>
            <td>${report.technician_name || '-'}</td>
            <td>${report.nursing_name || '-'}</td>
            <td>${report.remark || '-'}</td>
            <td class="center">${report.status || '-'}</td>
            <td class="center">${report.date ? report.date.split('-').reverse().join('-') : (report.added_on ? report.added_on.split('-').reverse().join('-') : '-')}</td>
          </tr>
        `;
      });

      // Add totals row
      htmlContent += `
              <tr><td colspan="20"></td></tr>
              <tr style="font-weight: bold; background-color: #f0f0f0;">
                <td class="center">-</td>
                <td class="center">-</td>
                <td class="center">-</td>
                <td class="center">-</td>
                <td class="center">-</td>
                <td class="center">-</td>
                <td class="center">TOTAL</td>
                <td class="center">-</td>
                <td class="center">${totalFilms}</td>
                <td class="center">${totalScans}</td>
                <td class="center">${totalCD}</td>
                <td class="center">${totalContrast}</td>
                <td class="amount">₹${totalAmount.toLocaleString()}</td>
                <td class="center">-</td>
                <td class="center">-</td>
                <td class="center">-</td>
                <td class="center">-</td>
                <td class="center">-</td>
                <td class="center">-</td>
                <td class="center">${reports.length}</td>
              </tr>
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
      a.download = `CONSOLE_DETAIL_REPORT_${formattedFromDate}_TO_${formattedToDate}.xls`;
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold mb-2">Detail Report</h1>
            <p className="text-sky-100 text-sm sm:text-base">Console detail activity report with date range</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={exportToExcel}
              disabled={exporting || reports.length === 0}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export Excel'}</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
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
              className="px-3 py-2 w-full sm:w-auto border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm sm:text-base"
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
              className="px-3 py-2 w-full sm:w-auto border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <button
            onClick={fetchReports}
            disabled={loading || !fromDate || !toDate}
            className="px-4 sm:px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 text-sm sm:text-base flex-shrink-0"
          >
            Generate Report
          </button>
          <div className="text-xs sm:text-sm text-gray-600 break-words">
            <div className="sm:hidden">
              <div>Records: {reports.length}</div>
              <div>Revenue: ₹{totalRevenue.toLocaleString()}</div>
            </div>
            <div className="hidden sm:block">
              Total Records: {reports.length} | Total Revenue: ₹{totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Console Detail Activities</h2>
          <p className="text-sm text-gray-600 mt-1">
            Report from {fromDate.split('-').reverse().join('-')} to {toDate.split('-').reverse().join('-')}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam. Id</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Films</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Scan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CD/DVD</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrast</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stop Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nursing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={20} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                      <span className="text-gray-500">Loading detail report...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={20} className="px-6 py-12 text-center text-gray-500">
                    No activities found for selected date range
                  </td>
                </tr>
              ) : (
                reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((report, index) => (
                  <tr key={`${report.c_p_cro || report.cro}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        {report.c_p_cro || report.cro}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.examination_id || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">
                        {report.pre} {report.patient_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.doctor_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.age || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.scan_names || report.scan_type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.number_films || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.number_scan || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.issue_cd === 'YES' ? '1' : '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.number_contrast || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.amount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.start_time || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.stop_time || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.technician_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.nursing_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.remark || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        report.status === 'Complete' 
                          ? 'bg-green-100 text-green-900 border-green-300' 
                          : report.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                          : report.status === 'Recall'
                          ? 'bg-red-100 text-red-900 border-red-300'
                          : 'bg-gray-100 text-gray-900 border-gray-300'
                      }`}>
                        {report.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {report.date ? report.date.split('-').reverse().join('-') : (report.added_on ? report.added_on.split('-').reverse().join('-') : '-')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Client-side Pagination */}
        {reports.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {Math.ceil(reports.length / itemsPerPage)} | Total: {reports.length} records
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
                  {Array.from({ length: Math.min(5, Math.ceil(reports.length / itemsPerPage)) }, (_, i) => {
                    const startPage = Math.max(1, currentPage - 2);
                    const page = startPage + i;
                    const totalPages = Math.ceil(reports.length / itemsPerPage);
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
                
                {currentPage < Math.ceil(reports.length / itemsPerPage) && (
                  <>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.ceil(reports.length / itemsPerPage))}
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