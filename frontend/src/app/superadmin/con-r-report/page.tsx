'use client';

import { useState, useEffect } from 'react';
import { Download, Monitor, Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import SuperAdminLayout from '@/components/SuperAdminLayout';

interface ConsoleData {
  sno: number;
  cro: string;
  patient_name: string;
  doctor_name: string;
  age: string;
  category: string;
  scan_type: string;
  number_films: number;
  number_of_scan: number;
  issue_cd: string;
  number_contrast: number;
  paid: string | number;
  free: string | number;
  amount: number;
  start_time: string;
  stop_time: string;
  remark: string;
  status: string;
}

interface ConsoleTotals {
  films: number;
  contrast: number;
  scans: number;
  amount: number;
  cd: number;
  paid: number;
  free: number;
}

export default function SuperAdminConsoleReport() {
  const [consoleData, setConsoleData] = useState<ConsoleData[]>([]);
  const [totals, setTotals] = useState<ConsoleTotals>({
    films: 0,
    contrast: 0,
    scans: 0,
    amount: 0,
    cd: 0,
    paid: 0,
    free: 0
  });
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

  useEffect(() => {
    fetchConsoleData();
  }, [selectedDate]);

  const fetchConsoleData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        s_date: selectedDate
      });
      const response = await fetch(`https://varahasdc.co.in/api/superadmin/console-report?${params}`);
      if (response.ok) {
        const data = await response.json();
        setConsoleData(data.data || []);
        setTotals(data.totals || {
          films: 0,
          contrast: 0,
          scans: 0,
          amount: 0,
          cd: 0,
          paid: 0,
          free: 0
        });
      }
    } catch (error) {
      console.error('Error fetching console data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsoleData = consoleData.filter(item =>
    item.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredConsoleData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConsoleData = filteredConsoleData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const exportToExcel = () => {
    // Matches PHP con_revenue_report.php exactly
    let htmlContent = `<html><meta http-equiv="Content-Type" content="text/html; charset=Windows-1252"><body>`;
    htmlContent += `<table border="1">`;
    htmlContent += `<tr><th colspan="13">VARAHA SDC</th></tr>`;
    htmlContent += `<tr><th style="text-margin:center;" colspan="13">CONSOLE REVNUE -${selectedDate}</th></tr>`;
    htmlContent += `<tr><th>S.No</th><th>CRO</th><th>NAME</th><th>DOCTOR NAME</th><th>AGE</th><th>CATEGORY</th><th>SCAN TYPE</th><th>FILMS</th><th>NUMBER OF SCAN </th><th>ISSUE CD / DVD</th><th>CONTRAST</th><th>PAID</th><th>FREE</th><th>AMOUNT</th><th>START TIME</th><th>END TIME</th><th>REMARK</th><th>STATUS</th></tr>`;
    
    filteredConsoleData.forEach((item) => {
      htmlContent += '<tr>';
      htmlContent += `<td>${item.sno}</td>`;
      htmlContent += `<td>${item.cro}</td>`;
      htmlContent += `<td>${item.patient_name}</td>`;
      htmlContent += `<td>${item.doctor_name}</td>`;
      htmlContent += `<td>${item.age}</td>`;
      htmlContent += `<td>${item.category}</td>`;
      htmlContent += `<td>${item.scan_type}</td>`;
      htmlContent += `<td>${item.number_films}</td>`;
      htmlContent += `<td>${item.number_of_scan}</td>`;
      htmlContent += `<td>${item.issue_cd}</td>`;
      htmlContent += `<td>${item.number_contrast}</td>`;
      htmlContent += `<td>${item.paid || '&nbsp;'}</td>`;
      htmlContent += `<td>${item.free || '&nbsp;'}</td>`;
      htmlContent += `<td>${item.amount}</td>`;
      htmlContent += `<td>${item.start_time}</td>`;
      htmlContent += `<td>${item.stop_time}</td>`;
      htmlContent += `<td>${item.remark}</td>`;
      htmlContent += `<td>${item.status}</td>`;
      htmlContent += '</tr>';
    });
    
    // Add totals row
    htmlContent += `<tr><th>&nbsp;</th><th>&nbsp;</th><th>&nbsp;</th><th>&nbsp;</th><th>&nbsp;</th><th>&nbsp;</th><th>TOTAL</th><th>${totals.films}</th><th>${totals.scans}</th><th>${totals.cd}</th><th>${totals.contrast}</th><th>${totals.paid}</th><th>${totals.free}</th><th>${totals.amount}</th><th></th><th></th><th>&nbsp;</th></tr>`;
    
    htmlContent += '</table></body></html>';

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `REVNUE${selectedDate}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <SuperAdminLayout 
      title="Console Report" 
      subtitle="Console Revenue Records"
      actions={
        <button
          onClick={exportToExcel}
          disabled={filteredConsoleData.length === 0}
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
                placeholder="Search console data..."
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
                <Monitor className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900">Console Data ({filteredConsoleData.length})</h2>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRO</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Type</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Films</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scans</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CD/DVD</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrast</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Free</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={15} className="px-2 py-4 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredConsoleData.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-2 py-4 text-center text-gray-500">No console data found</td>
                  </tr>
                ) : (
                  <>
                    {paginatedConsoleData.map((item, index) => (
                      <tr key={item.sno} className="hover:bg-gray-50">
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{item.sno}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.cro}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{item.patient_name}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{item.doctor_name}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{item.age}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{item.scan_type}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{item.number_films}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{item.number_of_scan}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{item.issue_cd}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{item.number_contrast}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{item.paid || '-'}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">{item.free || '-'}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.amount}</td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.status === 'Complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Totals Row */}
                    <tr className="bg-yellow-50 font-semibold">
                      <td className="px-2 py-4 text-sm text-gray-900" colSpan={6}>TOTAL</td>
                      <td className="px-2 py-4 text-sm text-gray-900">{totals.films}</td>
                      <td className="px-2 py-4 text-sm text-gray-900">{totals.scans}</td>
                      <td className="px-2 py-4 text-sm text-gray-900">{totals.cd}</td>
                      <td className="px-2 py-4 text-sm text-gray-900">{totals.contrast}</td>
                      <td className="px-2 py-4 text-sm text-gray-900">{totals.paid}</td>
                      <td className="px-2 py-4 text-sm text-gray-900">{totals.free}</td>
                      <td className="px-2 py-4 text-sm text-gray-900">₹{totals.amount}</td>
                      <td className="px-2 py-4 text-sm text-gray-900"></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredConsoleData.length)} of {filteredConsoleData.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === page
                            ? 'bg-red-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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