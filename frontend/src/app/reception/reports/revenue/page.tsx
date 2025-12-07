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
  category: string;
  scanType: string;
  films: number;
  numberOfScan: number;
  issueCd: number;
  contrast: number;
  paid: number;
  free: number;
  amount: number;
}

interface ReportSummary {
  totalFilms: number;
  totalContrast: number;
  totalScans: number;
  totalAmount: number;
  totalCd: number;
  totalPaid: number;
  totalFree: number;
}

export default function RevenueReport() {
  const toast = useToastContext();
  const [selectedDate, setSelectedDate] = useState('');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);

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
      const response = await fetch(`https://varahasdc.co.in/api/reception/reports/revenue?date=${date}`);
      
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
      } else if (response.status === 404) {
        toast.error('Revenue report API not available. Please contact administrator.');
        setReportData([]);
        setSummary(null);
        setHasData(false);
      } else {
        toast.error('Failed to generate report');
        setReportData([]);
        setSummary(null);
        setHasData(false);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Revenue report service unavailable');
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
            <tr><th colspan="13" class="header">VARAHA SDC</th></tr>
            <tr><th colspan="13" class="header">CONSOLE REVENUE REPORT Date: ${selectedDate}</th></tr>
            <tr>
              <th>S.No</th>
              <th>CRO</th>
              <th>Name</th>
              <th>Age</th>
              <th>Category</th>
              <th>Scan Type</th>
              <th>Films</th>
              <th>Number of Scan</th>
              <th>Issue CD/DVD</th>
              <th>Contrast</th>
              <th>Paid</th>
              <th>Free</th>
              <th>Amount</th>
            </tr>
    `;

    // Add patient data rows
    reportData.forEach((row) => {
      htmlContent += `
        <tr>
          <td class="center">${row.sno}</td>
          <td>${row.cro}</td>
          <td>${row.patientName}</td>
          <td class="center">${row.age}</td>
          <td>${row.category}</td>
          <td>${row.scanType}</td>
          <td class="center">${row.films}</td>
          <td class="center">${row.numberOfScan}</td>
          <td class="center">${row.issueCd}</td>
          <td class="center">${row.contrast}</td>
          <td class="center">${row.paid || '-'}</td>
          <td class="center">${row.free || '-'}</td>
          <td class="amount">₹${row.amount.toLocaleString()}</td>
        </tr>
      `;
    });

    // Add totals row if summary exists
    if (summary) {
      htmlContent += `
            <tr><td colspan="13"></td></tr>
            <tr style="font-weight: bold; background-color: #f0f0f0;">
              <td colspan="5" class="center">TOTAL</td>
              <td class="center">-</td>
              <td class="center">${summary.totalFilms}</td>
              <td class="center">${summary.totalScans}</td>
              <td class="center">${summary.totalCd}</td>
              <td class="center">${summary.totalContrast}</td>
              <td class="center">${summary.totalPaid}</td>
              <td class="center">${summary.totalFree}</td>
              <td class="amount">₹${summary.totalAmount.toLocaleString()}</td>
            </tr>
      `;
    }

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
    a.download = `CONSOLE REVENUE REPORT-${selectedDate}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-6 rounded-xl shadow-lg mb-6">
          <div className="flex justify-between items-start"><div><h1 className="text-3xl font-bold mb-2">Revenue Report</h1>
          <p className="text-sky-100 text-lg">Generate console revenue and scan completion reports</p></div><div className="ml-6"><LastEnrolledPatient /></div></div>
        </div>

        {/* Report Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6">
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
                  <h3 className="text-lg font-semibold text-gray-700 mt-1">CONSOLE REVENUE - {selectedDate}</h3>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRO</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Films</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Scan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue CD/DVD</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrast</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Free</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">{row.sno}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{row.cro}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{row.patientName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.scanType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.films}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.numberOfScan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.issueCd}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.contrast}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.paid || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.free || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">₹{row.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  
                  {/* Summary Row */}
                  {summary && (
                    <tr className="bg-blue-100 font-bold">
                      <td className="px-6 py-4 text-sm text-blue-900" colSpan={5}></td>
                      <td className="px-6 py-4 text-sm text-blue-900 font-medium">TOTAL</td>
                      <td className="px-6 py-4 text-sm text-blue-900 font-medium">{summary.totalFilms}</td>
                      <td className="px-6 py-4 text-sm text-blue-900 font-medium">{summary.totalScans}</td>
                      <td className="px-6 py-4 text-sm text-blue-900 font-medium">{summary.totalCd}</td>
                      <td className="px-6 py-4 text-sm text-blue-900 font-medium">{summary.totalContrast}</td>
                      <td className="px-6 py-4 text-sm text-blue-900 font-medium">{summary.totalPaid}</td>
                      <td className="px-6 py-4 text-sm text-blue-900 font-medium">{summary.totalFree}</td>
                      <td className="px-6 py-4 text-sm text-blue-900 font-medium">₹{summary.totalAmount.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {reportData.length === 0 && (
              
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
                <p className="text-gray-500">No completed scans found for the selected date.</p>
              </div>
            )}
          </div>
        )}

        {!hasData && !loading && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-12">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Revenue Report</h3>
              <p className="text-gray-500">Select a date above and click "Generate Report" to view console revenue data.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}