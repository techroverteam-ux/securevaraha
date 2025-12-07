'use client';

import { useState, useEffect } from 'react';
import { Camera, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import LastEnrolledPatient from '@/components/LastEnrolledPatient';

interface ScanData {
  s_id: number;
  s_name: string;
  n_o_films: number;
  contrass: number;
  total_scan: number;
  estimate_time: string;
  charges: number;
  scan_head_id?: number;
}

interface ScanHead {
  id: number;
  head_name: string;
  amount: number;
  per_scan: number;
}

export default function ReceptionScans() {
  const toast = useToastContext();
  const [scans, setScans] = useState<ScanData[]>([]);
  const [scanHeads, setScanHeads] = useState<ScanHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingScan, setEditingScan] = useState<ScanData | null>(null);
  const [formData, setFormData] = useState({ 
    s_name: '', 
    n_o_films: 0, 
    contrass: 0, 
    total_scan: 1, 
    estimate_time: '', 
    charges: 0,
    scan_head_id: 0
  });

  useEffect(() => {
    fetchScans();
    fetchScanHeads();
  }, []);

  const fetchScans = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/admin/scans');
      if (response.ok) {
        const data = await response.json();
        setScans(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
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

  const handleAdd = () => {
    setEditingScan(null);
    setFormData({ s_name: '', n_o_films: 0, contrass: 0, total_scan: 1, estimate_time: '', charges: 0, scan_head_id: 0 });
    setShowModal(true);
  };

  const handleEdit = (scan: ScanData) => {
    setEditingScan(scan);
    setFormData({ 
      s_name: scan.s_name, 
      n_o_films: scan.n_o_films, 
      contrass: scan.contrass, 
      total_scan: scan.total_scan, 
      estimate_time: scan.estimate_time, 
      charges: scan.charges,
      scan_head_id: scan.scan_head_id || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (scan: ScanData) => {
    if (confirm(`Are you sure you want to delete ${scan.s_name}?`)) {
      try {
        const response = await fetch(`https://varahasdc.co.in/api/admin/scans/${scan.s_id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Scan deleted successfully!');
          fetchScans();
        }
      } catch (error) {
        toast.error('Error deleting scan');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingScan ? `https://varahasdc.co.in/api/admin/scans/${editingScan.s_id}` : 'https://varahasdc.co.in/api/admin/scans';
      const method = editingScan ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.success(`Scan ${editingScan ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        fetchScans();
      }
    } catch (error) {
      toast.error('Error saving scan');
    }
  };

  const filteredScans = scans.filter(scan =>
    scan.s_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort all scans in descending order (latest first)
  const sortedScans = [...filteredScans].sort((a, b) => b.s_id - a.s_id);
  const totalPages = Math.ceil(sortedScans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedScans = sortedScans.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-start"><div><h1 className="text-3xl font-bold mb-2">Scan Management</h1>
        <p className="text-blue-100 text-lg">Manage scan types and pricing</p></div><div className="ml-6"><LastEnrolledPatient /></div></div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search scans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchScans}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-md font-medium"
            >
              <Search className="h-5 w-5" />
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
          <button onClick={handleAdd} className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md font-medium">
            <Plus className="h-5 w-5" />
            <span>Add Scan</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Head</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Films</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Scan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedScans.map((scan, index) => (
                <tr key={scan.s_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">{startIndex + index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black">{scan.s_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {scanHeads.find(head => head.id === scan.scan_head_id)?.head_name || 'Not Assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{scan.n_o_films}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{scan.total_scan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{scan.estimate_time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{scan.charges}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(scan)} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-xs font-medium shadow-md">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(scan)} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 text-xs font-medium shadow-md">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {paginatedScans.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {loading ? 'Loading scans...' : 'No scans found'}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages} | Total: {sortedScans.length} records
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
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
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
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">{editingScan ? 'Edit Scan' : 'Add Scan'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scan Name</label>
                  <input
                    type="text"
                    value={formData.s_name}
                    onChange={(e) => setFormData({...formData, s_name: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="Scan Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scan Head</label>
                  <select
                    value={formData.scan_head_id}
                    onChange={(e) => setFormData({...formData, scan_head_id: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={0}>Select Head</option>
                    {scanHeads.map(head => (
                      <option key={head.id} value={head.id}>{head.head_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Films</label>
                  <input
                    type="number"
                    value={formData.n_o_films}
                    onChange={(e) => setFormData({...formData, n_o_films: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contrast</label>
                  <input
                    type="number"
                    value={formData.contrass}
                    onChange={(e) => setFormData({...formData, contrass: parseInt(e.target.value) || 0})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Scan</label>
                  <input
                    type="number"
                    value={formData.total_scan}
                    onChange={(e) => setFormData({...formData, total_scan: parseInt(e.target.value) || 1})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimate Time</label>
                  <select
                    value={formData.estimate_time}
                    onChange={(e) => setFormData({...formData, estimate_time: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Time</option>
                    <option value="1 Min">1 Min</option>
                    <option value="2 Min">2 Min</option>
                    <option value="3 Min">3 Min</option>
                    <option value="5 Min">5 Min</option>
                    <option value="10 Min">10 Min</option>
                    <option value="15 Min">15 Min</option>
                    <option value="20 Min">20 Min</option>
                    <option value="30 Min">30 Min</option>
                    <option value="45 Min">45 Min</option>
                    <option value="60 Min">60 Min</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Charges</label>
                  <input
                    type="number"
                    value={formData.charges}
                    onChange={(e) => setFormData({...formData, charges: parseFloat(e.target.value) || 0})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="Amount"
                  />
                </div>
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm font-medium">
                  {editingScan ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 text-sm font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}