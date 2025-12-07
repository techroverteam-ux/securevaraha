'use client';

import { useState, useEffect } from 'react';
import { Search, Download, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToastContext } from '@/context/ToastContext';

interface PendingReport {
  patient_id: number;
  cro: string;
  patient_name: string;
  age: number;
  gender: string;
  mobile: string;
  doctor_name: string;
  n_patient_ct: string;
  n_patient_ct_report_date: string;
  n_patient_ct_remark: string;
  n_patient_x_ray: string;
  n_patient_x_ray_report_date: string;
  n_patient_x_ray_remark: string;
  date: string;
  allot_date: string;
}

export default function ReportPendingList() {
  const toast = useToastContext();
  const [allReports, setAllReports] = useState<PendingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/doctor/pending-patients');
      if (response.ok) {
        const data = await response.json();
        setAllReports(data.data || []);
        toast.success(`Loaded ${data.data?.length || 0} pending reports`);
      } else {
        toast.error('Failed to fetch pending reports');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReports = () => {
    let filtered = [...allReports];

    if (searchTerm.trim()) {
      filtered = filtered.filter(report => 
        report.cro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(report => {
        if (!report.date) return false;
        try {
          const reportDate = new Date(report.date).toISOString().split('T')[0];
          return reportDate === dateFilter;
        } catch {
          return false;
        }
      });
    }

    return filtered;
  };

  const filteredReports = getFilteredReports();
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '0000-00-00') return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return '';
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const exportData = getFilteredReports();
      
      const wb = XLSX.utils.book_new();
      
      const headerData = [
        ['VARAHA DIAGNOSTIC CENTER'],
        ['PENDING REPORTS - ' + new Date().toLocaleDateString()],
        [''],
        ['S.No', 'CRO', 'Patient Name', 'Doctor Name', 'CT-Scan', 'CT Report Date', 'CT Review', 'X-Ray', 'X-Ray Date', 'X-Ray Review']
      ];
      
      const excelData = exportData.map((report: PendingReport, index: number) => [
        index + 1,
        report.cro,
        report.patient_name,
        report.doctor_name || '',
        report.n_patient_ct,
        formatDate(report.n_patient_ct_report_date),
        report.n_patient_ct_remark || '',
        report.n_patient_x_ray,
        formatDate(report.n_patient_x_ray_report_date),
        report.n_patient_x_ray_remark || ''
      ]);
      
      const allData = [...headerData, ...excelData];
      const ws = XLSX.utils.aoa_to_sheet(allData);
      
      // Header formatting
      ws['A1'] = { v: 'VARAHA DIAGNOSTIC CENTER', t: 's', s: { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } };
      ws['A2'] = { v: 'PENDING REPORTS - ' + new Date().toLocaleDateString(), t: 's', s: { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } } };
      
      // Column headers formatting
      ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4', 'J4'].forEach(cell => {
        if (ws[cell]) {
          ws[cell].s = { font: { bold: true }, alignment: { horizontal: 'center' }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } };
        }
      });
      
      // Data cells border
      for (let row = 5; row <= 4 + exportData.length; row++) {
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(col => {
          const cell = col + row;
          if (ws[cell]) {
            ws[cell].s = { border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } };
          }
        });
      }
      
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }
      ];
      
      ws['!cols'] = [
        { width: 8 }, { width: 15 }, { width: 20 }, { width: 20 }, { width: 12 },
        { width: 15 }, { width: 30 }, { width: 12 }, { width: 15 }, { width: 30 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Pending Reports');
      
      const fileName = `pending_reports_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Report Pending List</h1>
            <p className="text-emerald-100">Nursing patients with incomplete CT-Scan or X-Ray reports</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportToExcel}
              disabled={exporting || filteredReports.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
            </button>
            <button
              onClick={fetchAllReports}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by CRO or Patient Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          
          <div></div>
          
          <button
            type="submit"
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Pending Reports</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {filteredReports.length} records | Page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CT-Scan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CT Report Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CT Review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X-Ray</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X-Ray Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X-Ray Review</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-emerald-500" />
                      <span className="text-gray-500">Loading pending reports...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    No pending reports found
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report, index) => (
                  <tr key={report.patient_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        {report.cro}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {report.patient_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.doctor_name || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {report.n_patient_ct || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(report.n_patient_ct_report_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {report.n_patient_ct_remark || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {report.n_patient_x_ray || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(report.n_patient_x_ray_report_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {report.n_patient_x_ray_remark || ''}
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
                Page {currentPage} of {totalPages} | Total: {filteredReports.length} records
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