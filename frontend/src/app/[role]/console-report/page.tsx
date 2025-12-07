'use client';

import Layout from '@/components/layout/Layout';
import { FormInput, FormButton } from '@/components/ui/FormComponents';
import { Toast, useToast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';
import { Search, Download, Eye } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ConsoleReport() {
  const params = useParams();
  const role = params.role as string;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast, showToast, hideToast } = useToast();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/console-reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching console reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report: any) =>
    report.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    report.cro?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Console Report - {role}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <FormInput
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <FormInput
              label="To Date"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search:"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 w-full"
              />
            </div>
            <FormButton>
              <Download className="h-4 w-4" />
              <span>Export</span>
            </FormButton>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading console reports...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">S.No.</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">CRO</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Patient Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Scan Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReports.map((report: any, index) => (
                      <tr key={report.id || `report-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{startIndex + index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b font-medium">{report.cro || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{report.patient_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{report.scan_type || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{report.date || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm border-b">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'Complete' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm border-b">
                          <button 
                            onClick={() => showToast('Report viewed', 'success')}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredReports.length)} of {filteredReports.length}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded text-sm ${
                          currentPage === page
                            ? 'bg-sky-500 text-white border-sky-500'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-2 text-gray-500">...</span>}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          {!loading && filteredReports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No console reports found</p>
            </div>
          )}
        </div>

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      </div>
    </Layout>
  );
}