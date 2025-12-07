'use client';

import { useState, useEffect } from 'react';
import { Calendar, FileText, Download, Search } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import LastEnrolledPatient from '@/components/LastEnrolledPatient';

interface ReportData {
  sno: number;
  cro: string;
  patientName: string;
  age: string;
  gender: string;
  category: string;
  doctorName: string;
  hospitalName: string;
  scanType: string;
  totalScan: number;
  totalAmount: number;
  receivedAmount: number;
  dueAmount: number;
  contactNumber: string;
}

interface ReportSummary {
  totalScans: number;
  totalAmount: number;
  totalReceived: number;
  totalDue: number;
  creditAmount: number;
  refund: number;
  discount: number;
  complimentry: number;
  expanse: number;
  netAmount: number;
  creditCros: string;
}

export default function DailyReport() {
  const toast = useToastContext();
  const [selectedDate, setSelectedDate] = useState('');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  useEffect(() => {
    const todayDate = getTodayDate();
    setSelectedDate(todayDate);
    generateReport(todayDate);
  }, []);

  const generateReport = async (date = selectedDate) => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://varahasdc.co.in/api/reception/reports/daily?date=${date}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReportData(data.data || []);
          setSummary(data.summary);
          setHasData(true);
          
          if (data.data.length === 0) {
            toast.info('No data found for the selected date');
          }
        } else {
          toast.error('Failed to generate report');
          setReportData([]);
          setSummary(null);
          setHasData(false);
        }
      } else {
        toast.error('Failed to generate report');
        setReportData([]);
        setSummary(null);
        setHasData(false);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report');
      setReportData([]);
      setSummary(null);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    generateReport();
  };

  const exportToExcel = () => {
    if (!selectedDate || reportData.length === 0) {
      toast.error('No data to export');
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
            .amount { text-align: right; }
          </style>
        </head>
        <body>
          <table>
            <tr><th colspan="14" class="header">VARAHA SDC</th></tr>
            <tr><th colspan="14" class="header">DAILY REPORT Date: ${selectedDate}</th></tr>
            <tr>
              <th>S.No</th>
              <th>CRO</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Category</th>
              <th>Doctor</th>
              <th>Hospital</th>
              <th>Scan Type</th>
              <th>Total Scan</th>
              <th>Total Amount</th>
              <th>Received Amount</th>
              <th>Due Amount</th>
              <th>Contact Number</th>
            </tr>
    `;

    // Add patient data rows
    reportData.forEach((row, index) => {
      htmlContent += `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${row.cro}</td>
          <td>${row.patientName}</td>
          <td class="center">${row.age}</td>
          <td class="center">${row.gender}</td>
          <td>${row.category}</td>
          <td>${row.doctorName}</td>
          <td>${row.hospitalName}</td>
          <td>${row.scanType}</td>
          <td class="center">${row.totalScan}</td>
          <td class="amount">₹${row.totalAmount.toLocaleString()}</td>
          <td class="amount">₹${row.receivedAmount.toLocaleString()}</td>
          <td class="amount">₹${row.dueAmount.toLocaleString()}</td>
          <td>${row.contactNumber}</td>
        </tr>
      `;
    });

    // Add totals row
    const totalAmount = reportData.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
    const totalReceived = reportData.reduce((sum, row) => sum + (row.receivedAmount || 0), 0);
    const totalDue = reportData.reduce((sum, row) => sum + (row.dueAmount || 0), 0);
    const totalScans = reportData.reduce((sum, row) => sum + (row.totalScan || 0), 0);

    htmlContent += `
            <tr><td colspan="14"></td></tr>
            <tr style="font-weight: bold; background-color: #f0f0f0;">
              <td class="center">-</td>
              <td class="center">-</td>
              <td class="center">TOTAL</td>
              <td class="center">-</td>
              <td class="center">-</td>
              <td class="center">-</td>
              <td class="center">-</td>
              <td class="center">-</td>
              <td class="center">-</td>
              <td class="center">${totalScans}</td>
              <td class="amount">₹${totalAmount.toLocaleString()}</td>
              <td class="amount">₹${totalReceived.toLocaleString()}</td>
              <td class="amount">₹${totalDue.toLocaleString()}</td>
              <td class="center">${reportData.length}</td>
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
    a.download = `DAILY REPORT-${selectedDate}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-6">
          <div className="flex justify-between items-start"><div><h1 className="text-3xl font-bold mb-2">Daily Report</h1>
          <p className="text-blue-100 text-lg">Generate comprehensive daily patient and financial reports</p></div><div className="ml-6"><LastEnrolledPatient /></div></div>
        </div>

        {/* Report Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Report By Day
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate.split('-').reverse().join('-')}
                  onChange={(e) => {
                    const parts = e.target.value.split('-');
                    setSelectedDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all duration-200 disabled:opacity-50 shadow-md font-medium"
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
                  <h3 className="text-lg font-semibold text-gray-700 mt-1">DAILY REPORT - {selectedDate}</h3>
                </div>
                <button
                  onClick={exportToExcel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all duration-200 shadow-md font-medium"
                >
                  <Download className="h-4 w-4" />
                  <span>Export to Excel</span>
                </button>
              </div>
            </div>

            {/* Report Table */}
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRO</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Scan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receive Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    const totalPages = Math.ceil(reportData.length / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const paginatedData = reportData.slice(startIndex, startIndex + itemsPerPage);
                    
                    return paginatedData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">{startIndex + index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">{row.cro}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-black">{row.patientName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.age}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.gender}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.doctorName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.hospitalName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.scanType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.totalScan}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">₹{row.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">₹{row.receivedAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">₹{row.dueAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.contactNumber}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {(() => {
              const totalPages = Math.ceil(reportData.length / itemsPerPage);
              return totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages} | Total: {reportData.length} records
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
              );
            })()}

            {reportData.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
                <p className="text-gray-500">No patient records found for the selected date.</p>
              </div>
            )}
          </div>
        )}

        {!hasData && !loading && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-12">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Daily Report</h3>
              <p className="text-gray-500">Select a date above and click "Generate Report" to view daily patient and financial data.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}