'use client';

import { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown, Package, AlertTriangle, BarChart3 } from 'lucide-react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { useToastContext } from '@/context/ToastContext';

interface StockSummary {
  id: number;
  item_name: string;
  unit: string;
  opening_stock: number;
  current_stock: number;
  total_inward: number;
  total_outward: number;
  inward_value: number;
  current_value: number;
}

interface LowStockItem {
  item_name: string;
  quantity: number;
  unit: string;
}

interface MonthlyTrend {
  month: string;
  transaction_type: string;
  total_quantity: number;
  total_value: number;
}

export default function InventoryAnalysis() {
  const toast = useToastContext();
  const [stockSummary, setStockSummary] = useState<StockSummary[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: ''
  });

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`https://varahasdc.co.in/api/inventory/analysis?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStockSummary(data.data.stock_summary || []);
          setLowStockItems(data.data.low_stock_alerts || []);
          setMonthlyTrend(data.data.monthly_trend || []);
          
          if (data.data.low_stock_alerts && data.data.low_stock_alerts.length > 0) {
            toast.error(`${data.data.low_stock_alerts.length} items have low stock!`);
          } else {
            toast.success('Analysis data loaded successfully');
          }
        } else {
          toast.error('Failed to fetch analysis data');
        }
      } else {
        toast.error('Failed to fetch analysis data');
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      toast.error('Network error while fetching analysis data');
    } finally {
      setLoading(false);
    }
  };

  const exportAnalysis = () => {
    try {
      if (stockSummary.length === 0) {
        toast.error('No data to export');
        return;
      }

      const dateRange = filters.from_date && filters.to_date ? `${filters.from_date} to ${filters.to_date}` : 'All Time';
      const currentDate = new Date().toLocaleDateString('en-GB');
      
      let htmlContent = `<html><meta http-equiv="Content-Type" content="text/html; charset=Windows-1252"><body>`;
      htmlContent += `<table border="1" style="border-collapse: collapse; width: 100%;">`;
      htmlContent += `<tr><th colspan="10" style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px;">VARAHA SDC : 256 SLICE CT SCAN</th></tr>`;
      htmlContent += `<tr><th colspan="10" style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px;">INVENTORY ANALYSIS REPORT</th></tr>`;
      htmlContent += `<tr><th colspan="10" style="background-color:#FFEA00; color:black; text-align:center; font-weight:bold; padding:8px;">Period: ${dateRange}</th></tr>`;
      htmlContent += `<tr><th colspan="10" style="background-color:#FFEA00; color:black; text-align:center; font-weight:bold; padding:8px;">Generated on: ${currentDate}</th></tr>`;
      htmlContent += `<tr><th colspan="10" style="text-align:center; padding:4px;">&nbsp;</th></tr>`;
      
      // Stock Summary
      htmlContent += `<tr><th colspan="10" style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px;">STOCK SUMMARY</th></tr>`;
      htmlContent += `<tr>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Item Name</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Unit</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Opening Stock</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Current Stock</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Total Inward</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Total Outward</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Inward Value</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Current Value</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Stock Status</th>`;
      htmlContent += `<th style="background-color:#2F75B5; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Turnover %</th>`;
      htmlContent += `</tr>`;
      
      let totalCurrentValue = 0;
      let totalInwardValue = 0;
      let totalCurrentStock = 0;
      let totalInward = 0;
      let totalOutward = 0;
      
      stockSummary.forEach((item) => {
        const turnover = item.opening_stock > 0 ? ((item.total_outward / item.opening_stock) * 100).toFixed(1) : '0';
        const status = item.current_stock < 10 ? 'LOW STOCK' : item.current_stock > 100 ? 'OVERSTOCK' : 'NORMAL';
        
        totalCurrentValue += item.current_value;
        totalInwardValue += item.inward_value;
        totalCurrentStock += item.current_stock;
        totalInward += item.total_inward;
        totalOutward += item.total_outward;
        
        htmlContent += '<tr>';
        htmlContent += `<td style="text-align:left; padding:4px; border:1px solid black;">${item.item_name}</td>`;
        htmlContent += `<td style="text-align:center; padding:4px; border:1px solid black;">${item.unit}</td>`;
        htmlContent += `<td style="text-align:right; padding:4px; border:1px solid black;">${item.opening_stock}</td>`;
        htmlContent += `<td style="text-align:right; padding:4px; border:1px solid black;">${item.current_stock}</td>`;
        htmlContent += `<td style="text-align:right; padding:4px; border:1px solid black;">${item.total_inward}</td>`;
        htmlContent += `<td style="text-align:right; padding:4px; border:1px solid black;">${item.total_outward}</td>`;
        htmlContent += `<td style="text-align:right; padding:4px; border:1px solid black;">₹${item.inward_value.toFixed(2)}</td>`;
        htmlContent += `<td style="text-align:right; padding:4px; border:1px solid black;">₹${item.current_value.toFixed(2)}</td>`;
        htmlContent += `<td style="text-align:center; padding:4px; border:1px solid black;">${status}</td>`;
        htmlContent += `<td style="text-align:right; padding:4px; border:1px solid black;">${turnover}%</td>`;
        htmlContent += '</tr>';
      });
      
      // Summary totals
      htmlContent += `<tr>`;
      htmlContent += `<th style="background-color:#FFEA00; color:black; text-align:right; font-weight:bold; padding:8px; border:1px solid black;">TOTAL</th>`;
      htmlContent += `<th style="background-color:#FFEA00; color:black; padding:8px; border:1px solid black;">&nbsp;</th>`;
      htmlContent += `<th style="background-color:#FFEA00; color:black; padding:8px; border:1px solid black;">&nbsp;</th>`;
      htmlContent += `<th style="background-color:#FFEA00; color:black; text-align:right; font-weight:bold; padding:8px; border:1px solid black;">${totalCurrentStock}</th>`;
      htmlContent += `<th style="background-color:#FFEA00; color:black; text-align:right; font-weight:bold; padding:8px; border:1px solid black;">${totalInward}</th>`;
      htmlContent += `<th style="background-color:#FFEA00; color:black; text-align:right; font-weight:bold; padding:8px; border:1px solid black;">${totalOutward}</th>`;
      htmlContent += `<th style="background-color:#FFEA00; color:black; text-align:right; font-weight:bold; padding:8px; border:1px solid black;">₹${totalInwardValue.toFixed(2)}</th>`;
      htmlContent += `<th style="background-color:#FFEA00; color:black; text-align:right; font-weight:bold; padding:8px; border:1px solid black;">₹${totalCurrentValue.toFixed(2)}</th>`;
      htmlContent += `<th colspan="2" style="background-color:#FFEA00; color:black; padding:8px; border:1px solid black;">&nbsp;</th>`;
      htmlContent += `</tr>`;
      
      // Low Stock Alerts
      if (lowStockItems.length > 0) {
        htmlContent += `<tr><th colspan="10" style="text-align:center; padding:8px;">&nbsp;</th></tr>`;
        htmlContent += `<tr><th colspan="10" style="background-color:#FF6B6B; color:white; text-align:center; font-weight:bold; padding:8px;">LOW STOCK ALERTS - IMMEDIATE ACTION REQUIRED</th></tr>`;
        htmlContent += `<tr>`;
        htmlContent += `<th style="background-color:#FF6B6B; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Item Name</th>`;
        htmlContent += `<th style="background-color:#FF6B6B; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Current Stock</th>`;
        htmlContent += `<th style="background-color:#FF6B6B; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Unit</th>`;
        htmlContent += `<th colspan="7" style="background-color:#FF6B6B; color:white; text-align:center; font-weight:bold; padding:8px; border:1px solid black;">Action Required</th>`;
        htmlContent += `</tr>`;
        
        lowStockItems.forEach((item) => {
          htmlContent += '<tr>';
          htmlContent += `<td style="text-align:left; padding:4px; border:1px solid black; background-color:#FFE6E6;">${item.item_name}</td>`;
          htmlContent += `<td style="text-align:right; padding:4px; border:1px solid black; background-color:#FFE6E6; font-weight:bold; color:red;">${item.quantity}</td>`;
          htmlContent += `<td style="text-align:center; padding:4px; border:1px solid black; background-color:#FFE6E6;">${item.unit}</td>`;
          htmlContent += `<td colspan="7" style="text-align:center; padding:4px; border:1px solid black; background-color:#FFE6E6; font-weight:bold; color:red;">REORDER IMMEDIATELY</td>`;
          htmlContent += '</tr>';
        });
      }
      
      htmlContent += '</table></body></html>';

      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `INVENTORY-ANALYSIS-${dateRange.replace(/\s+/g, '-')}.xls`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Analysis report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exporting analysis report');
    }
  };

  // Calculate summary statistics
  const totalItems = stockSummary.length;
  const totalValue = stockSummary.reduce((sum, item) => sum + parseFloat(String(item.current_value || 0)), 0);
  const lowStockCount = lowStockItems.length;
  const totalInward = stockSummary.reduce((sum, item) => sum + parseInt(String(item.total_inward || 0)), 0);
  const totalOutward = stockSummary.reduce((sum, item) => sum + parseInt(String(item.total_outward || 0)), 0);

  return (
    <SuperAdminLayout title="Inventory Analysis" subtitle="Comprehensive stock analysis and reporting">
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                onClick={fetchAnalysis}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Analyze'}
              </button>
              <button
                onClick={exportAnalysis}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Inward</p>
                <p className="text-2xl font-bold text-gray-900">{totalInward}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Outward</p>
                <p className="text-2xl font-bold text-gray-900">{totalOutward}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-red-800">Low Stock Alerts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-red-200">
                  <p className="font-medium text-gray-900">{item.item_name}</p>
                  <p className="text-sm text-red-600">Only {item.quantity} {item.unit} remaining</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stock Summary Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Stock Summary</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opening</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">Loading...</td>
                  </tr>
                ) : stockSummary.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No data available</td>
                  </tr>
                ) : (
                  stockSummary.map((item, index) => {
                    const status = item.current_stock < 10 ? 'LOW' : item.current_stock > 100 ? 'HIGH' : 'NORMAL';
                    const statusColor = status === 'LOW' ? 'text-red-600' : status === 'HIGH' ? 'text-blue-600' : 'text-green-600';
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.item_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.unit}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.opening_stock}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.current_stock}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.total_inward}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.total_outward}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">₹{item.current_value.toLocaleString()}</td>
                        <td className={`px-6 py-4 text-sm font-medium ${statusColor}`}>{status}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}