'use client';

import { useState, useEffect } from 'react';
import { Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { useToastContext } from '@/context/ToastContext';

interface Transaction {
  id: number;
  item_name: string;
  transaction_type: 'INWARD' | 'OUTWARD';
  quantity: number;
  unit: string;
  rate?: number;
  total_amount?: number;
  supplier?: string;
  department?: string;
  issued_to?: string;
  purpose?: string;
  invoice_no?: string;
  remarks?: string;
  transaction_date: string;
}

interface InventoryItem {
  id: number;
  item_name: string;
  quantity: number;
  unit: string;
}

export default function InventoryTransactions() {
  const toast = useToastContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'INWARD' | 'OUTWARD'>('INWARD');
  const [submitting, setSubmitting] = useState(false);
  
  const [filters, setFilters] = useState({
    type: 'ALL',
    from_date: '',
    to_date: '',
    item_id: ''
  });
  
  const [formData, setFormData] = useState({
    item_id: '',
    quantity: '',
    rate: '',
    supplier: '',
    invoice_no: '',
    department: '',
    issued_to: '',
    purpose: '',
    remarks: ''
  });

  useEffect(() => {
    fetchTransactions();
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/inventory/items');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setItems(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.item_id || !formData.quantity) {
      toast.error('Please fill in required fields');
      return;
    }
    
    setSubmitting(true);
    try {
      const endpoint = modalType === 'INWARD' ? '/inward' : '/outward';
      const response = await fetch(`https://varahasdc.co.in/api/inventory${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          rate: parseFloat(formData.rate) || 0
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success(`${modalType} transaction recorded successfully`);
        setShowModal(false);
        setFormData({
          item_id: '', quantity: '', rate: '', supplier: '', invoice_no: '',
          department: '', issued_to: '', purpose: '', remarks: ''
        });
        fetchTransactions();
        fetchItems(); // Refresh items to update stock levels
      } else {
        toast.error(result.error || 'Failed to record transaction');
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
      toast.error('Network error while submitting transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'ALL') params.append(key, value);
      });
      
      const response = await fetch(`https://varahasdc.co.in/api/inventory/transactions?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTransactions(data.data || []);
          if (data.data && data.data.length > 0) {
            toast.success(`Found ${data.data.length} transactions`);
          }
        } else {
          toast.error('Failed to fetch transactions');
        }
      } else {
        toast.error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Network error while fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  const exportTransactions = () => {
    try {
      if (transactions.length === 0) {
        toast.error('No data to export');
        return;
      }

      const dateRange = filters.from_date && filters.to_date ? `${filters.from_date} to ${filters.to_date}` : 'All Dates';
      const typeFilter = filters.type !== 'ALL' ? filters.type : 'All Types';
      
      let htmlContent = `<html><meta http-equiv="Content-Type" content="text/html; charset=Windows-1252"><body>`;
      htmlContent += `<table border="1" style="border-collapse: collapse; width: 100%;">`;
      htmlContent += `<tr><th colspan="12" style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px;">VARAHA SDC : 256 SLICE CT SCAN</th></tr>`;
      htmlContent += `<tr><th colspan="12" style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px;">INVENTORY TRANSACTIONS REPORT</th></tr>`;
      htmlContent += `<tr><th colspan="12" style="background-color:#FFEA00; color:black; text-align:center; font-weight:bold; padding:8px;">Date Range: ${dateRange} | Type: ${typeFilter}</th></tr>`;
      htmlContent += `<tr><th colspan="12" style="text-align:center; padding:4px;">&nbsp;</th></tr>`;
      htmlContent += `<tr>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">S.No</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Item Name</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Type</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Quantity</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Unit</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Rate</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Amount</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Supplier</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Department</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Invoice/Purpose</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Date</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Remarks</th>`;
      htmlContent += `</tr>`;
      
      let totalAmount = 0;
      transactions.forEach((txn, index) => {
        totalAmount += parseFloat(String(txn.total_amount || 0));
        htmlContent += '<tr>';
        htmlContent += `<td style="text-align:center; padding:4px; border:1px solid black;">${index + 1}</td>`;
        htmlContent += `<td style="text-align:left; padding:4px; border:1px solid black;">${txn.item_name}</td>`;
        htmlContent += `<td style="text-align:center; padding:4px; border:1px solid black;">${txn.transaction_type}</td>`;
        htmlContent += `<td style="text-align:right; padding:4px; border:1px solid black;">${txn.quantity}</td>`;
        htmlContent += `<td style="text-align:center; padding:4px; border:1px solid black;">${txn.unit}</td>`;
        htmlContent += `<td style="text-align:right; padding:4px; border:1px solid black;">${txn.rate || 0}</td>`;
        htmlContent += `<td style="text-align:right; padding:4px; border:1px solid black;">${txn.total_amount || 0}</td>`;
        htmlContent += `<td style="text-align:left; padding:4px; border:1px solid black;">${txn.supplier || ''}</td>`;
        htmlContent += `<td style="text-align:left; padding:4px; border:1px solid black;">${txn.department || ''}</td>`;
        htmlContent += `<td style="text-align:left; padding:4px; border:1px solid black;">${txn.invoice_no || txn.purpose || ''}</td>`;
        htmlContent += `<td style="text-align:center; padding:4px; border:1px solid black;">${txn.transaction_date}</td>`;
        htmlContent += `<td style="text-align:left; padding:4px; border:1px solid black;">${txn.remarks || ''}</td>`;
        htmlContent += '</tr>';
      });
      
      // Total row
      htmlContent += `<tr>`;
      htmlContent += `<th colspan="6" style="background-color:#FFEA00; color:black; text-align:right; font-weight:bold; padding:8px; border:1px solid black;">TOTAL</th>`;
      htmlContent += `<th style="background-color:#FFEA00; color:black; text-align:right; font-weight:bold; padding:8px; border:1px solid black;">${totalAmount.toFixed(2)}</th>`;
      htmlContent += `<th colspan="5" style="background-color:#FFEA00; color:black; padding:8px; border:1px solid black;">&nbsp;</th>`;
      htmlContent += `</tr>`;
      
      htmlContent += '</table></body></html>';

      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `INVENTORY-TRANSACTIONS-${dateRange.replace(/\s+/g, '-')}.xls`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Transactions exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exporting transactions');
    }
  };

  return (
    <SuperAdminLayout title="Inventory Transactions" subtitle="Track inward and outward stock movements">
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
              >
                <option value="ALL">All Types</option>
                <option value="INWARD">Inward</option>
                <option value="OUTWARD">Outward</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
              <select
                value={filters.item_id}
                onChange={(e) => setFilters(prev => ({ ...prev, item_id: e.target.value }))}
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
                placeholder="DD-MM-YYYY"
                value={filters.from_date}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) value = value.slice(0,2) + '-' + value.slice(2);
                  if (value.length >= 5) value = value.slice(0,5) + '-' + value.slice(5,9);
                  setFilters(prev => ({ ...prev, from_date: value }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="text"
                placeholder="DD-MM-YYYY"
                value={filters.to_date}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) value = value.slice(0,2) + '-' + value.slice(2);
                  if (value.length >= 5) value = value.slice(0,5) + '-' + value.slice(5,9);
                  setFilters(prev => ({ ...prev, to_date: value }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                maxLength={10}
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={fetchTransactions}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={() => { setModalType('INWARD'); setShowModal(true); }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Add Inward
            </button>
            <button
              onClick={() => { setModalType('OUTWARD'); setShowModal(true); }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Add Outward
            </button>
          </div>
          <button
            onClick={exportTransactions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transactions ({transactions.length})</h2>
          </div>
          
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">Loading...</td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No transactions found</td>
                  </tr>
                ) : (
                  transactions.map((txn, index) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{txn.item_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          txn.transaction_type === 'INWARD' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {txn.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{txn.quantity} {txn.unit}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">₹{txn.rate || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">₹{txn.total_amount || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {txn.transaction_type === 'INWARD' 
                          ? `${txn.supplier || 'N/A'} (${txn.invoice_no || 'No Invoice'})`
                          : `${txn.department || 'N/A'} - ${txn.issued_to || 'N/A'} (${txn.purpose || 'N/A'})`
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{txn.transaction_date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                Add {modalType} Transaction
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
                  <select
                    value={formData.item_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, item_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select Item</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.item_name} (Stock: {item.quantity} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                {modalType === 'INWARD' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Unit</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                      <input
                        type="text"
                        value={formData.supplier}
                        onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                        placeholder="Supplier name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
                      <input
                        type="text"
                        value={formData.invoice_no}
                        onChange={(e) => setFormData(prev => ({ ...prev, invoice_no: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                        placeholder="Invoice number"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                        placeholder="Department name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Issued To</label>
                      <input
                        type="text"
                        value={formData.issued_to}
                        onChange={(e) => setFormData(prev => ({ ...prev, issued_to: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                        placeholder="Person name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                      <input
                        type="text"
                        value={formData.purpose}
                        onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                        placeholder="Purpose of issue"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                    rows={2}
                    placeholder="Additional remarks"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}