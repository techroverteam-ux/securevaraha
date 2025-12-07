'use client';

import Layout from '@/components/layout/Layout';
import { FormButton } from '@/components/ui/FormComponents';
import ScanForm from '@/components/ui/ScanForm';
import { Toast, useToast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Scan {
  id: number;
  scanName: string;
  films: number;
  contrast: string;
  totalScan: number;
  estimateTime: string;
  charges: number;
}

export default function Scans() {
  const params = useParams();
  const role = params.role as string;
  const [scans, setScans] = useState<Scan[]>([
    { id: 11, scanName: 'NCCT Head Bone Cuts with 3D reconstruction', films: 2, contrast: 'No', totalScan: 1, estimateTime: '5 Min', charges: 1760 },
    { id: 12, scanName: 'CT dynamic study Pituitary', films: 2, contrast: 'No', totalScan: 1, estimateTime: '5 Min', charges: 720 },
    { id: 13, scanName: 'NCCT Orbit', films: 2, contrast: 'No', totalScan: 1, estimateTime: '2 Min', charges: 720 },
    { id: 14, scanName: 'CECT Orbit (Both)', films: 2, contrast: 'Yes', totalScan: 1, estimateTime: '2 Min', charges: 2100 },
    { id: 15, scanName: 'NCCT Face with 3D reconstruction', films: 2, contrast: 'No', totalScan: 1, estimateTime: '2 Min', charges: 720 },
    { id: 16, scanName: 'NCCT TM Joint', films: 2, contrast: 'No', totalScan: 1, estimateTime: '2 Min', charges: 720 },
    { id: 17, scanName: 'CECT TM Joint (Both)', films: 2, contrast: 'Yes', totalScan: 1, estimateTime: '2 Min', charges: 2100 },
    { id: 18, scanName: 'NCCT Upper Abdomen', films: 2, contrast: 'No', totalScan: 1, estimateTime: '2 Min', charges: 770 },
    { id: 19, scanName: 'NCCT Lower Abdomen', films: 2, contrast: 'No', totalScan: 1, estimateTime: '2 Min', charges: 770 },
    { id: 20, scanName: 'NCCT Whole Abdomen', films: 2, contrast: 'No', totalScan: 1, estimateTime: '2 Min', charges: 770 }
  ]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScan, setEditingScan] = useState<Scan | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const [formData, setFormData] = useState({
    scanName: '',
    films: '',
    contrast: 'No',
    totalScan: '1',
    estimateTime: 'Please select',
    charges: ''
  });
  const itemsPerPage = 10;

  const filteredScans = scans.filter((scan) =>
    scan.scanName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredScans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedScans = filteredScans.slice(startIndex, startIndex + itemsPerPage);

  const handleSubmit = (data: any) => {
    const newScan: Scan = {
      id: editingScan ? editingScan.id : scans.length + 1,
      scanName: data.scanName,
      films: parseInt(data.films),
      contrast: data.contrast,
      totalScan: parseInt(data.totalScan),
      estimateTime: data.estimateTime,
      charges: parseInt(data.charges)
    };
    
    if (editingScan) {
      setScans(scans.map(scan => scan.id === editingScan.id ? newScan : scan));
      showToast('Scan updated successfully!', 'success');
    } else {
      setScans([...scans, newScan]);
      showToast('Scan added successfully!', 'success');
    }
    
    setEditingScan(null);
  };

  const handleEdit = (scan: Scan) => {
    setEditingScan(scan);
    setIsFormOpen(true);
  };

  const contrastOptions = [
    { value: 'No', label: 'No' },
    { value: 'Yes', label: 'Yes' }
  ];

  const timeOptions = [
    { value: 'Please select', label: 'Please select' },
    { value: '2 Min', label: '2 Min' },
    { value: '5 Min', label: '5 Min' },
    { value: '10 Min', label: '10 Min' },
    { value: '15 Min', label: '15 Min' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-normal text-gray-800">Scans</h1>
          <FormButton onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Add Scan</span>
          </FormButton>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Show</span>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Search:</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Films</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Scan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedScans.map((scan, index) => (
                  <tr key={scan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{startIndex + index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{scan.scanName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scan.films}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scan.totalScan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scan.estimateTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scan.charges}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(scan)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this scan?')) {
                              setScans(scans.filter(s => s.id !== scan.id));
                              showToast('Scan deleted successfully!', 'success');
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredScans.length)} of {filteredScans.length}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === page
                        ? 'bg-sky-500 text-white border-sky-500'
                        : 'border-gray-300 hover:bg-gray-50'
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
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        <ScanForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingScan(null);
          }}
          onSubmit={handleSubmit}
          initialData={editingScan}
        />

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