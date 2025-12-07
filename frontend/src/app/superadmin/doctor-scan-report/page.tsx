'use client';

import { useState, useEffect } from 'react';
import { Stethoscope, Download, Filter, Calendar, User, FileText } from 'lucide-react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { useToastContext } from '@/context/ToastContext';

interface DoctorScanReport {
  doctor_id: number;
  doctor_name: string;
  patient_cro: string;
  patient_name: string;
  scan_types: string;
  scan_names: string;
  scan_head_names: string;
  total_amount: number;
  report_date: string;
  category: string;
}

interface SummaryData {
  total_doctors: number;
  total_reports: number;
  total_amount: number;
  by_doctor: Array<{
    doctor_name: string;
    report_count: number;
    total_amount: number;
  }>;
  by_head: Array<{
    head_name: string;
    doctor_count: number;
    report_count: number;
    total_amount: number;
  }>;
}

export default function DoctorScanReport() {
  const toast = useToastContext();
  const [reports, setReports] = useState<DoctorScanReport[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    doctor_id: '',
    scan_head_id: '',
    from_date: '',
    to_date: '',

  });
  const [doctors, setDoctors] = useState<Array<{d_id: number, doctor_name: string}>>([]);
  const [scanHeads, setScanHeads] = useState<Array<{id: number, head_name: string}>>([]);


  useEffect(() => {
    fetchDoctors();
    fetchScanHeads();
    fetchReports();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/doctor/ct-scan-doctors');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchScanHeads = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/admin/scan-heads');
      if (response.ok) {
        const data = await response.json();
        setScanHeads(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching scan heads:', error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'All') params.append(key, value);
      });
      
      const response = await fetch(`https://varahasdc.co.in/api/superadmin/doctor-scan-report?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data.data || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = reports.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const downloadReport = async () => {
    try {
      if (reports.length === 0) {
        toast.error('No data to export');
        return;
      }

      const dateRange = filters.from_date && filters.to_date ? `${filters.from_date} to ${filters.to_date}` : 'All Dates';
      const doctorFilter = filters.doctor_id ? doctors.find(d => d.d_id === parseInt(filters.doctor_id))?.doctor_name || 'Unknown' : 'All Doctors';
      
      let html = `
        <html>
        <meta http-equiv="Content-Type" content="text/html; charset=Windows-1252">
        <body>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <tr>
            <th colspan="8" style="background-color:#2F75B5; color:white; text-align:center; padding:8px;">VARAHA SDC</th>
          </tr>
          <tr>
            <th colspan="8" style="background-color:#2F75B5; color:white; text-align:center; padding:8px;">DOCTOR SCAN REPORT</th>
          </tr>
          <tr>
            <th colspan="8" style="background-color:#FFEA00; color:black; text-align:center; padding:8px;">Date Range: ${dateRange}</th>
          </tr>
          <tr>
            <th colspan="8" style="background-color:#FFEA00; color:black; text-align:center; padding:8px;">Doctor Filter: ${doctorFilter}</th>
          </tr>
          <tr><td colspan="8" style="height:10px;"></td></tr>
          <tr>
            <th colspan="8" style="background-color:#2F75B5; color:white; text-align:center; padding:8px;">REPORTS BY DOCTOR</th>
          </tr>
          <tr>
            <th style="background-color:#D3D3D3; padding:5px;">Sr.No</th>
            <th style="background-color:#D3D3D3; padding:5px;">Doctor</th>
            <th style="background-color:#D3D3D3; padding:5px;">Reports</th>
            <th style="background-color:#D3D3D3; padding:5px;">Amount</th>
            <th colspan="4"></th>
          </tr>
      `;
      
      // Doctor summary data
      (summary?.by_doctor || []).forEach((item, index) => {
        html += `
          <tr>
            <td style="text-align:center; padding:3px;">${index + 1}</td>
            <td style="padding:3px;">${item.doctor_name || 'Unknown'}</td>
            <td style="text-align:right; padding:3px;">${item.report_count || 0}</td>
            <td style="text-align:right; padding:3px;">${parseFloat(String(item.total_amount || 0)).toFixed(2)}</td>
            <td colspan="4"></td>
          </tr>
        `;
      });
      
      const doctorTotalReports = (summary?.by_doctor || []).reduce((sum, item) => sum + (item.report_count || 0), 0);
      const doctorTotalAmount = (summary?.by_doctor || []).reduce((sum, item) => sum + parseFloat(String(item.total_amount || 0)), 0);
      
      html += `
          <tr>
            <td></td>
            <td style="background-color:#FFFF99; font-weight:bold; padding:5px;">Total</td>
            <td style="background-color:#FFFF99; font-weight:bold; text-align:right; padding:5px;">${doctorTotalReports}</td>
            <td style="background-color:#FFFF99; font-weight:bold; text-align:right; padding:5px;">${doctorTotalAmount.toFixed(2)}</td>
            <td colspan="4"></td>
          </tr>
          <tr><td colspan="8" style="height:15px;"></td></tr>
          <tr>
            <th colspan="8" style="background-color:#2F75B5; color:white; text-align:center; padding:8px;">REPORTS BY SCAN HEAD</th>
          </tr>
          <tr>
            <th style="background-color:#D3D3D3; padding:5px;">Sr.No</th>
            <th style="background-color:#D3D3D3; padding:5px;">Scan Head</th>
            <th style="background-color:#D3D3D3; padding:5px;">Doctors</th>
            <th style="background-color:#D3D3D3; padding:5px;">Reports</th>
            <th style="background-color:#D3D3D3; padding:5px;">Rate/Report</th>
            <th style="background-color:#D3D3D3; padding:5px;">Amount</th>
            <th colspan="2"></th>
          </tr>
      `;
      
      // Scan head data
      (summary?.by_head || []).forEach((item, index) => {
        const ratePerReport = (item.report_count || 0) > 0 ? (item.total_amount || 0) / (item.report_count || 0) : 0;
        html += `
          <tr>
            <td style="text-align:center; padding:3px;">${index + 1}</td>
            <td style="padding:3px;">${item.head_name || 'Unknown'}</td>
            <td style="text-align:right; padding:3px;">${item.doctor_count || 0}</td>
            <td style="text-align:right; padding:3px;">${item.report_count || 0}</td>
            <td style="text-align:right; padding:3px;">${ratePerReport.toFixed(2)}</td>
            <td style="text-align:right; padding:3px;">${parseFloat(String(item.total_amount || 0)).toFixed(2)}</td>
            <td colspan="2"></td>
          </tr>
        `;
      });
      
      const headTotalDoctors = (summary?.by_head || []).reduce((sum, item) => sum + (item.doctor_count || 0), 0);
      const headTotalReports = (summary?.by_head || []).reduce((sum, item) => sum + (item.report_count || 0), 0);
      const headTotalAmount = (summary?.by_head || []).reduce((sum, item) => sum + (parseFloat(String(item.total_amount)) || 0), 0);
      
      html += `
          <tr>
            <td></td>
            <td style="background-color:#FFFF99; font-weight:bold; padding:5px;">Total</td>
            <td style="background-color:#FFFF99; font-weight:bold; text-align:right; padding:5px;"></td>
            <td style="background-color:#FFFF99; font-weight:bold; text-align:right; padding:5px;">${headTotalReports}</td>
            <td style="background-color:#FFFF99; padding:5px;"></td>
            <td style="background-color:#FFFF99; font-weight:bold; text-align:right; padding:5px;">${headTotalAmount.toFixed(2)}</td>
            <td colspan="2"></td>
          </tr>
          <tr><td colspan="8" style="height:15px;"></td></tr>
          <tr>
            <th colspan="8" style="background-color:#2F75B5; color:white; text-align:center; padding:8px;">DETAILED REPORTS</th>
          </tr>
          <tr>
            <th style="background-color:#D3D3D3; padding:5px;">S.No</th>
            <th style="background-color:#D3D3D3; padding:5px;">Doctor Name</th>
            <th style="background-color:#D3D3D3; padding:5px;">Patient Name</th>
            <th style="background-color:#D3D3D3; padding:5px;">CRO</th>
            <th style="background-color:#D3D3D3; padding:5px;">Scan Types</th>
            <th style="background-color:#D3D3D3; padding:5px;">Scan Heads</th>
            <th style="background-color:#D3D3D3; padding:5px;">Amount</th>
            <th style="background-color:#D3D3D3; padding:5px;">Report Date</th>
          </tr>
      `;
      
      // Detailed reports
      reports.forEach((row, index) => {
        html += `
          <tr>
            <td style="text-align:center; padding:3px;">${index + 1}</td>
            <td style="padding:3px;">${row.doctor_name || ''}</td>
            <td style="padding:3px;">${row.patient_name || ''}</td>
            <td style="padding:3px;">${row.patient_cro || ''}</td>
            <td style="padding:3px;">${row.scan_names || ''}</td>
            <td style="padding:3px;">${row.scan_head_names || ''}</td>
            <td style="text-align:right; padding:3px;">${parseFloat(String(row.total_amount || 0)).toFixed(2)}</td>
            <td style="padding:3px;">${row.report_date || ''}</td>
          </tr>
        `;
      });
      
      html += `
        </table>
        </body>
        </html>
      `;
      
      // Create and download file
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'doctor-scan-report.xls';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Error downloading report');
    }
  };

  return (
    <SuperAdminLayout 
      title="Doctor Scan Report" 
      subtitle="Comprehensive doctor scan reporting with amount calculations"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <select
                value={filters.doctor_id}
                onChange={(e) => handleFilterChange('doctor_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Doctors</option>
                {doctors.map(doctor => (
                  <option key={doctor.d_id} value={doctor.d_id}>{doctor.doctor_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scan Head</label>
              <select
                value={filters.scan_head_id}
                onChange={(e) => handleFilterChange('scan_head_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Heads</option>
                {scanHeads.map(head => (
                  <option key={head.id} value={head.id}>{head.head_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.from_date ? filters.from_date.split('-').reverse().join('-') : ''}
                onChange={(e) => {
                  const date = e.target.value;
                  if (date) {
                    const [year, month, day] = date.split('-');
                    handleFilterChange('from_date', `${day}-${month}-${year}`);
                  } else {
                    handleFilterChange('from_date', '');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.to_date ? filters.to_date.split('-').reverse().join('-') : ''}
                onChange={(e) => {
                  const date = e.target.value;
                  if (date) {
                    const [year, month, day] = date.split('-');
                    handleFilterChange('to_date', `${day}-${month}-${year}`);
                  } else {
                    handleFilterChange('to_date', '');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={fetchReports}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
            <button
              onClick={downloadReport}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2 inline" />
              Excel
            </button>

          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total_doctors || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total_reports || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(summary.total_amount || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Tables */}
        {summary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Doctor Summary */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Reports by Doctor</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Sr.No</th>
                      <th className="px-4 py-2 text-left">Doctor</th>
                      <th className="px-4 py-2 text-left">Patient</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.by_doctor && summary.by_doctor.length > 0 ? (
                      <>
                        {summary.by_doctor.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{index + 1}</td>
                            <td className="px-4 py-2">{item.doctor_name || 'Unknown'}</td>
                            <td className="px-4 py-2">{item.report_count || 0}</td>
                            <td className="px-4 py-2">₹{(item.total_amount || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold">
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2">Total</td>
                          <td className="px-4 py-2">{summary.by_doctor.reduce((sum, item) => sum + parseInt(String(item.report_count || 0)), 0)}</td>
                          <td className="px-4 py-2">₹{summary.by_doctor.reduce((sum, item) => sum + parseFloat(String(item.total_amount || 0)), 0).toFixed(2)}</td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-gray-500">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By Head Summary */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Reports by Scan Head</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Sr.No</th>
                      <th className="px-4 py-2 text-left">Scan Head</th>
                      <th className="px-4 py-2 text-left">Doctors</th>
                      <th className="px-4 py-2 text-left">Reports</th>
                       <th className="px-4 py-2 text-left">Rate/Report</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                     
                    </tr>
                  </thead>
                  <tbody>
                    {summary.by_head && summary.by_head.length > 0 ? (
                      <>
                        {summary.by_head.map((item, index) => {
                          const ratePerReport = (item.report_count || 0) > 0 ? (item.total_amount || 0) / (item.report_count || 0) : 0;
                          return (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2">{index + 1}</td>
                              <td className="px-4 py-2">{item.head_name || 'Unknown'}</td>
                              <td className="px-4 py-2">{item.doctor_count || 0}</td>
                              <td className="px-4 py-2">{item.report_count || 0}</td>
                              <td className="px-4 py-2">₹{ratePerReport.toFixed(2)}</td>
                              <td className="px-4 py-2">₹{(item.total_amount || 0).toLocaleString()}</td>
                       
                            </tr>
                          );
                        })}
                        <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold">
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2">Total</td>
                                                   <td className="px-4 py-2"></td>
                          <td className="px-4 py-2">{summary.by_head.reduce((sum, item) => sum + (item.report_count || 0), 0)}</td>
                             <td className="px-4 py-2"></td>
                          <td className="px-4 py-2">₹{summary.by_head.reduce((sum, item) => sum + (parseFloat(String(item.total_amount)) || 0), 0).toFixed(2)}</td>
                          
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 text-center text-gray-500">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Reports Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Detailed Reports</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CRO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scan Types</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scan Heads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                        <span className="ml-2 text-gray-600">Loading reports...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedReports && paginatedReports.length > 0 ? paginatedReports.map((report, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{startIndex + index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.doctor_name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.patient_name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.patient_cro || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.scan_names || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.scan_head_names || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">₹{(parseFloat(String(report.total_amount)) || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.report_date || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.category || 'N/A'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      No reports found for the selected criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination */}
            {reports.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6 px-6">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, reports.length)} of {reports.length} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 border rounded text-sm ${
                          currentPage === pageNum
                            ? 'bg-red-600 text-white border-red-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}