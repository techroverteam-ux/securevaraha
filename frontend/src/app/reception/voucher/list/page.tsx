'use client';

import { useState, useEffect } from 'react';
import { Receipt, Calendar, Search, Filter, Printer, ArrowLeft } from 'lucide-react';
import LastEnrolledPatient from '@/components/LastEnrolledPatient';

interface Transaction {
  id: number;
  withdraw: number;
  r_amount: number;
  d_amount: number;
  added_on: string;
  remark: string;
}

export default function VoucherList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  useEffect(() => {
    fetchTransactions();
  }, [dateFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call to today_transaction table
      const mockData: Transaction[] = [
        {
          id: 1,
          withdraw: 500,
          r_amount: 2000,
          d_amount: 300,
          added_on: '01-08-2025',
          remark: 'Daily collection'
        },
        {
          id: 2,
          withdraw: 1000,
          r_amount: 5000,
          d_amount: 800,
          added_on: '31-07-2025',
          remark: 'Weekly settlement'
        },
        {
          id: 3,
          withdraw: 200,
          r_amount: 1500,
          d_amount: 100,
          added_on: '30-07-2025',
          remark: 'Patient payments'
        }
      ];
      
      // Filter by date if provided
      let filteredData = mockData;
      if (dateFilter) {
        const [year, month, day] = dateFilter.split('-');
        const formattedDate = `${day}-${month}-${year}`;
        filteredData = mockData.filter(t => t.added_on === formattedDate);
      }
      
      setTransactions(filteredData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.remark.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.added_on.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totals = filteredTransactions.reduce(
    (acc, transaction) => ({
      withdraw: acc.withdraw + transaction.withdraw,
      received: acc.received + transaction.r_amount,
      due: acc.due + transaction.d_amount
    }),
    { withdraw: 0, received: 0, due: 0 }
  );

  const cashInHand = totals.received - totals.due - totals.withdraw;

  const generateReport = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voucher List Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .summary { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">VARAHA DIAGNOSTIC CENTER</div>
          <div>Voucher List Report</div>
          ${dateFilter ? `<div>Date: ${dateFilter}</div>` : '<div>All Records</div>'}
        </div>
        
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Received:</strong> ₹${totals.received.toLocaleString()}</p>
          <p><strong>Total Due:</strong> ₹${totals.due.toLocaleString()}</p>
          <p><strong>Total Withdraw:</strong> ₹${totals.withdraw.toLocaleString()}</p>
          <p><strong>Cash in Hand:</strong> ₹${Math.max(0, cashInHand).toLocaleString()}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Received (₹)</th>
              <th>Due (₹)</th>
              <th>Withdraw (₹)</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions.map((transaction, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${transaction.added_on}</td>
                <td>₹${transaction.r_amount.toLocaleString()}</td>
                <td>₹${transaction.d_amount.toLocaleString()}</td>
                <td>₹${transaction.withdraw.toLocaleString()}</td>
                <td>${transaction.remark || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Total Transactions: ${filteredTransactions.length}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.location.href = '/reception/voucher'}
            className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <div className="flex justify-between items-start"><div><h1 className="text-3xl font-bold mb-2">Voucher List</h1>
            <p className="text-blue-100 text-lg">View all voucher transactions and history</p></div><div className="ml-6"><LastEnrolledPatient /></div></div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">₹{totals.received.toLocaleString()}</div>
          <div className="text-sm text-green-800">Total Received</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">₹{totals.due.toLocaleString()}</div>
          <div className="text-sm text-red-800">Total Due</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">₹{totals.withdraw.toLocaleString()}</div>
          <div className="text-sm text-orange-800">Total Withdraw</div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">₹{Math.max(0, cashInHand).toLocaleString()}</div>
          <div className="text-sm text-blue-800">Net Cash</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by remarks or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={fetchTransactions}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-md font-medium"
            >
              <Search className="h-5 w-5" />
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
          
          <button
            onClick={generateReport}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md font-medium"
          >
            <Printer className="h-5 w-5" />
            <span>Print Report</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Received (₹)</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Due (₹)</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Withdraw (₹)</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Net Amount (₹)</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction, index) => {
                const netAmount = transaction.r_amount - transaction.d_amount - transaction.withdraw;
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{startIndex + index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{transaction.added_on}</td>
                    <td className="border border-gray-300 px-4 py-2 text-green-600 font-medium">
                      ₹{transaction.r_amount.toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-red-600 font-medium">
                      ₹{transaction.d_amount.toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-orange-600 font-medium">
                      ₹{transaction.withdraw.toLocaleString()}
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 font-medium ${netAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ₹{netAmount.toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{transaction.remark || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-4 py-2" colSpan={2}>Total</td>
                <td className="border border-gray-300 px-4 py-2 text-green-600">
                  ₹{totals.received.toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-red-600">
                  ₹{totals.due.toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-orange-600">
                  ₹{totals.withdraw.toLocaleString()}
                </td>
                <td className={`border border-gray-300 px-4 py-2 ${cashInHand >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ₹{cashInHand.toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">-</td>
              </tr>
            </tfoot>
          </table>
          
          {paginatedTransactions.length === 0 && (
            <div className="text-center py-12">
              {loading ? (
                <div>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading transactions...</p>
                </div>
              ) : (
                <div>
                  <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                  <p className="text-gray-500">No voucher transactions found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}