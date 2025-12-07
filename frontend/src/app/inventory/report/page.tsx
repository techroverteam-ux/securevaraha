'use client';

import { useState, useEffect } from 'react';
import { Package, Download, Filter, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';

interface InventoryTransaction {
  id: number;
  item_name: string;
  transaction_type: 'INWARD' | 'OUTWARD';
  quantity: number;
  rate?: number;
  total_amount?: number;
  supplier?: string;
  department?: string;
  issued_to?: string;
  transaction_date: string;
  unit: string;
}

interface SummaryData {
  total_items: number;
  total_transactions: number;
  total_value: number;
  by_item: Array<{
    item_name: string;
    transaction_count: number;
    total_value: number;
  }>;
  by_supplier: Array<{
    supplier_name: string;
    item_count: number;
    transaction_count: number;
    total_value: number;
  }>;
}

export default function InventoryReport() {
  const toast = useToastContext();
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    type: '',
    from_date: '',
    to_date: '',
    item_id: ''
  });
  const [items, setItems] = useState<Array<{id: number, item_name: string}>>([]);

  useEffect(() => {
    fetchItems();
    fetchTransactions();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/inventory/items');
      if (response.ok) {
        const data = await response.json();
        setItems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'ALL') params.append(key, value);
      });
      
      const response = await fetch(`https://varahasdc.co.in/api/inventory/transactions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data || []);
        generateSummary(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = (data: InventoryTransaction[]) => {
    const itemMap = new Map();
    const supplierMap = new Map();
    let totalValue = 0;

    data.forEach(transaction => {
      const value = transaction.total_amount || 0;
      totalValue += value;

      // By item
      const itemKey = transaction.item_name;
      if (!itemMap.has(itemKey)) {
        itemMap.set(itemKey, { item_name: itemKey, transaction_count: 0, total_value: 0 });
      }
      const itemData = itemMap.get(itemKey);
      itemData.transaction_count++;
      itemData.total_value += value;

      // By supplier (only for inward transactions)
      if (transaction.transaction_type === 'INWARD' && transaction.supplier) {
        const supplierKey = transaction.supplier;
        if (!supplierMap.has(supplierKey)) {
          supplierMap.set(supplierKey, { supplier_name: supplierKey, item_count: 0, transaction_count: 0, total_value: 0 });
        }
        const supplierData = supplierMap.get(supplierKey);
        supplierData.transaction_count++;
        supplierData.total_value += value;
        
        // Count unique items per supplier
        const supplierItems = data.filter(t => t.supplier === supplierKey).map(t => t.item_name);
        supplierData.item_count = [...new Set(supplierItems)].length;
      }
    });

    setSummary({
      total_items: [...new Set(data.map(t => t.item_name))].length,
      total_transactions: data.length,
      total_value: totalValue,
      by_item: Array.from(itemMap.values()),
      by_supplier: Array.from(supplierMap.values())
    });
  };

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const downloadReport = () => {
    try {
      if (transactions.length === 0) {
        toast.error('No data to export');
        return;
      }

      const dateRange = filters.from_date && filters.to_date ? `${filters.from_date} to ${filters.to_date}` : 'All Dates';
      const typeFilter = filters.type || 'All Types';
      
      const csvContent = [
        'VARAHA SDC : INVENTORY MANAGEMENT',
        'INVENTORY TRANSACTION REPORT',
        `Date Range: ${dateRange}`,
        `Transaction Type: ${typeFilter}`,
        '',
        'S.No,Item Name,Type,Quantity,Unit,Rate,Amount,Supplier/Department,Date',
        ...transactions.map((row, index) => [
          index + 1,
          `"${row.item_name || ''}"`,
          row.transaction_type,
          row.quantity || 0,
          `"${row.unit || ''}"`,
          row.rate || 0,
          row.total_amount || 0,
          `"${row.supplier || row.department || ''}"`,
          `"${row.transaction_date || ''}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'inventory-transaction-report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Error downloading report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Report</h1>
          <p className="text-gray-600 mt-2">Comprehensive inventory transaction reporting with value calculations</p>
        </div>

        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Types</option>
                  <option value="INWARD">Inward</option>
                  <option value="OUTWARD">Outward</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                <select
                  value={filters.item_id}
                  onChange={(e) => handleFilterChange('item_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Items</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.item_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="text"
                  placeholder="28-09-2025"
                  value={filters.from_date}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) value = value.slice(0,2) + '-' + value.slice(2);
                    if (value.length >= 5) value = value.slice(0,5) + '-' + value.slice(5,9);
                    handleFilterChange('from_date', value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="text"
                  placeholder="28-09-2025"
                  value={filters.to_date}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) value = value.slice(0,2) + '-' + value.slice(2);
                    if (value.length >= 5) value = value.slice(0,5) + '-' + value.slice(5,9);
                    handleFilterChange('to_date', value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                  maxLength={10}
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={fetchTransactions}
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
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.total_items || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.total_transactions || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">₹{(summary.total_value || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Tables */}
          {summary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Item Summary */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Transactions by Item</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Sr.No</th>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-left">Transactions</th>
                        <th className="px-4 py-2 text-left">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.by_item && summary.by_item.length > 0 ? (
                        <>
                          {summary.by_item.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2">{index + 1}</td>
                              <td className="px-4 py-2">{item.item_name || 'Unknown'}</td>
                              <td className="px-4 py-2">{item.transaction_count || 0}</td>
                              <td className="px-4 py-2">₹{(item.total_value || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold">
                            <td className="px-4 py-2" colSpan={2}>Total</td>
                            <td className="px-4 py-2">{summary.by_item.reduce((sum, item) => sum + (item.transaction_count || 0), 0)}</td>
                            <td className="px-4 py-2">₹{summary.by_item.reduce((sum, item) => sum + (item.total_value || 0), 0).toLocaleString()}</td>
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

              {/* By Supplier Summary */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Transactions by Supplier</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Sr.No</th>
                        <th className="px-4 py-2 text-left">Supplier</th>
                        <th className="px-4 py-2 text-left">Items</th>
                        <th className="px-4 py-2 text-left">Transactions</th>
                        <th className="px-4 py-2 text-left">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.by_supplier && summary.by_supplier.length > 0 ? (
                        <>
                          {summary.by_supplier.map((supplier, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2">{index + 1}</td>
                              <td className="px-4 py-2">{supplier.supplier_name || 'Unknown'}</td>
                              <td className="px-4 py-2">{supplier.item_count || 0}</td>
                              <td className="px-4 py-2">{supplier.transaction_count || 0}</td>
                              <td className="px-4 py-2">₹{(supplier.total_value || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold">
                            <td className="px-4 py-2" colSpan={2}>Total</td>
                            <td className="px-4 py-2">{summary.by_supplier.reduce((sum, supplier) => sum + (supplier.item_count || 0), 0)}</td>
                            <td className="px-4 py-2">{summary.by_supplier.reduce((sum, supplier) => sum + (supplier.transaction_count || 0), 0)}</td>
                            <td className="px-4 py-2">₹{summary.by_supplier.reduce((sum, supplier) => sum + (supplier.total_value || 0), 0).toLocaleString()}</td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-4 text-center text-gray-500">No data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Transactions Table */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Detailed Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier/Dept</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                          <span className="ml-2 text-gray-600">Loading transactions...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedTransactions && paginatedTransactions.length > 0 ? paginatedTransactions.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{startIndex + index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.item_name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.transaction_type === 'INWARD' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.transaction_type === 'INWARD' ? (
                            <><TrendingUp className="h-3 w-3 mr-1" />IN</>
                          ) : (
                            <><TrendingDown className="h-3 w-3 mr-1" />OUT</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.quantity} {transaction.unit}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">₹{(transaction.rate || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">₹{(transaction.total_amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.supplier || transaction.department || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.transaction_date || 'N/A'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No transactions found for the selected criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              {transactions.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-6 px-6">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, transactions.length)} of {transactions.length} results
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
      </div>
    </div>
  );
}