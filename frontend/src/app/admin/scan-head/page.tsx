'use client';

import { useState, useEffect } from 'react';
import { Scan, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { useToastContext } from '@/context/ToastContext';

interface ScanHeadData {
  id: number;
  head_name: string;
  amount: number;
  per_scan: number;
}

export default function ScanHeadManagement() {
  const toast = useToastContext();
  const [scanHeads, setScanHeads] = useState<ScanHeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingScanHead, setEditingScanHead] = useState<ScanHeadData | null>(null);
  const [formData, setFormData] = useState({ s_name: '', charges: '', total_scan: '' });

  useEffect(() => {
    fetchScanHeads();
  }, []);

  const fetchScanHeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://varahasdc.co.in/api/admin/scan-heads');
      if (response.ok) {
        const data = await response.json();
        setScanHeads(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching scan heads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingScanHead(null);
    setFormData({ s_name: '', charges: '', total_scan: '' });
    setShowModal(true);
  };

  const handleEdit = (scanHead: ScanHeadData) => {
    setEditingScanHead(scanHead);
    setFormData({ 
      s_name: scanHead.head_name, 
      charges: scanHead.amount.toString(), 
      total_scan: scanHead.per_scan.toString() 
    });
    setShowModal(true);
  };

  const handleDelete = async (scanHead: ScanHeadData) => {
    if (confirm(`Are you sure you want to delete ${scanHead.head_name}?`)) {
      try {
        const response = await fetch(`https://varahasdc.co.in/api/admin/scan-heads/${scanHead.id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.error('Scan head deleted successfully!');
          fetchScanHeads();
        }
      } catch (error) {
        toast.error('Error deleting scan head');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingScanHead ? `https://varahasdc.co.in/api/admin/scan-heads/${editingScanHead.id}` : 'https://varahasdc.co.in/api/admin/scan-heads';
      const method = editingScanHead ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          head_name: formData.s_name,
          amount: parseFloat(formData.charges),
          per_scan: parseInt(formData.total_scan)
        })
      });
      if (response.ok) {
        toast.error(`Scan head ${editingScanHead ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        fetchScanHeads();
      }
    } catch (error) {
      toast.error('Error saving scan head');
    }
  };

  const filteredScanHeads = scanHeads.filter(scanHead =>
    scanHead.head_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredScanHeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedScanHeads = filteredScanHeads.slice(startIndex, startIndex + itemsPerPage);

  return (
    <SuperAdminLayout 
      title="Scan Head Wise Management" 
      subtitle="Manage scan heads and their pricing information"
    >
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search scan heads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={fetchScanHeads}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 shadow-md font-medium"
              >
                <Search className="h-5 w-5" />
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
            <button onClick={handleAdd} className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md font-medium">
              <Plus className="h-5 w-5" />
              <span>Add Scan Head</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per Scan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedScanHeads.map((scanHead, index) => (
                  <tr key={scanHead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{startIndex + index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{scanHead.head_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{scanHead.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scanHead.per_scan}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(scanHead)} className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-xs font-medium shadow-md">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                        <button onClick={() => handleDelete(scanHead)} className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-xs font-medium shadow-md">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {paginatedScanHeads.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {loading ? 'Loading scan heads...' : 'No scan heads found'}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages} | Total: {filteredScanHeads.length} records
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
                            ? 'bg-red-600 text-white'
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
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{editingScanHead ? 'Edit Scan Head' : 'Add Scan Head'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                  <label className="form-label block text-sm font-medium text-gray-700 mb-1">Head Name</label>
                  <input
                    type="text"
                    name="s_name"
                    value={formData.s_name}
                    onChange={(e) => setFormData({...formData, s_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Scan Head Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    name="charges"
                    value={formData.charges}
                    onChange={(e) => setFormData({...formData, charges: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Amount"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label block text-sm font-medium text-gray-700 mb-1">Per Scan</label>
                  <input
                    type="number"
                    name="total_scan"
                    value={formData.total_scan}
                    onChange={(e) => setFormData({...formData, total_scan: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Per Scan Count"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md font-medium">
                    {editingScanHead ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md font-medium">
                    Cancel
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