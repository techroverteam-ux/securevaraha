'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Search, Eye } from 'lucide-react';

interface CompletedReport {
  p_id: number;
  cro: string;
  patient_name: string;
  doctor_name: string;
  hospital_name: string;
  date: string;
  amount: number;
  age: string;
  gender: string;
  mobile: string;
  ct_scan: string;
  ct_report_date: string;
  ct_remark: string;
  xray: string;
  xray_report_date: string;
  xray_remark: string;
}

export default function ViewReports() {
  const [reports, setReports] = useState<CompletedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
    fetchCompletedReports();
  }, []);

  const fetchCompletedReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://varahasdc.co.in/api/superadmin/view-reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching completed reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    const headers = ['S. No.', 'CRO', 'Patient Name', 'Doctor Name', 'Ct-Scan', 'Ct-Scan Report Date', 'Ct-Scan Review', 'X-Ray Film', 'X-Ray Film Date', 'X-Ray Film Review'];
    
    // Create HTML table with styling matching PHP version
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
            th { background-color: #4472C4; color: white; font-weight: bold; padding: 8px; border: 1px solid #ccc; text-align: center; }
            td { padding: 6px; border: 1px solid #ccc; text-align: left; }
            .number { text-align: right; }
            .center { text-align: center; }
            .header { text-align: center; font-weight: bold; font-size: 16px; }
          </style>
        </head>
        <body>
          <table>
            <tr><th colspan="10" class="header">VARAHA SDC</th></tr>
            <tr><th colspan="10" class="header">VIEW REPORTS LIST</th></tr>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${filteredReports.map((report, index) => `
                <tr>
                  <td class="center">${index + 1}</td>
                  <td class="center">${report.cro}</td>
                  <td>${report.patient_name}</td>
                  <td>${report.doctor_name || ''}</td>
                  <td class="center">${report.ct_scan}</td>
                  <td class="center">${formatDate(report.ct_report_date)}</td>
                  <td>${report.ct_remark || ''}</td>
                  <td class="center">${report.xray}</td>
                  <td class="center">${formatDate(report.xray_report_date)}</td>
                  <td>${report.xray_remark || ''}</td>
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
    const today = new Date();
    const todayFormatted = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
    a.download = `View-Reports-List-${todayFormatted}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredReports = reports.filter(report =>
    report.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.cro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">View Reports</h1>
        <button
          onClick={handleDownloadExcel}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Download Excel</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Search Reports</h2>
          </div>
          <button
            onClick={fetchCompletedReports}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Search className="h-4 w-4 mr-2 inline" />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        <div className="mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search CRO or Patient Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Completed Reports ({filteredReports.length} records)</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S. No.</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRO</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ct-Scan</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ct-Scan Report Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ct-Scan Review</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X-Ray Film</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X-Ray Film Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X-Ray Film Review</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-3 py-2 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-2 text-center text-gray-500">No completed reports found</td>
                </tr>
              ) : (
                paginatedReports.map((report, index) => (
                  <tr key={report.p_id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-center">{startIndex + index + 1}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{report.cro}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{report.patient_name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{report.doctor_name || ''}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {report.ct_scan}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-center">{formatDate(report.ct_report_date)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{report.ct_remark || ''}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {report.xray}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-center">{formatDate(report.xray_report_date)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{report.xray_remark || ''}</td>
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredReports.length)} of {filteredReports.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}