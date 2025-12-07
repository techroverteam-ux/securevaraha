'use client';

import { useState, useEffect } from 'react';
import { Hospital, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import LastEnrolledPatient from '@/components/LastEnrolledPatient';

interface HospitalData {
  h_id: number;
  h_name: string;
  h_short: string;
  h_address: string;
  h_contact: string;
  h_type: string;
}

export default function ReceptionHospitals() {
  const toast = useToastContext();
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState<HospitalData | null>(null);
  const [formData, setFormData] = useState({ h_name: '', h_short: '', h_type: 'Private', h_address: '', h_contact: '' });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/admin/hospitals');
      if (response.ok) {
        const data = await response.json();
        setHospitals(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingHospital(null);
    setFormData({ h_name: '', h_short: '', h_type: 'Private', h_address: '', h_contact: '' });
    setShowModal(true);
  };

  const handleEdit = (hospital: HospitalData) => {
    setEditingHospital(hospital);
    setFormData({ h_name: hospital.h_name, h_short: hospital.h_short || '', h_type: hospital.h_type || 'Private', h_address: hospital.h_address || '', h_contact: hospital.h_contact || '' });
    setShowModal(true);
  };

  const handleDelete = async (hospital: HospitalData) => {
    if (confirm(`Are you sure you want to delete ${hospital.h_name}?`)) {
      try {
        const response = await fetch(`https://varahasdc.co.in/api/admin/hospitals/${hospital.h_id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.error('Hospital deleted successfully!');
          fetchHospitals();
        }
      } catch (error) {
        toast.error('Error deleting hospital');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingHospital ? `https://varahasdc.co.in/api/admin/hospitals/${editingHospital.h_id}` : 'https://varahasdc.co.in/api/admin/hospitals';
      const method = editingHospital ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.error(`Hospital ${editingHospital ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        fetchHospitals();
      }
    } catch (error) {
      toast.error('Error saving hospital');
    }
  };

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.h_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.h_short.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHospitals = filteredHospitals.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-start"><div><h1 className="text-3xl font-bold mb-2">Hospital Management</h1>
        <p className="text-blue-100 text-lg">Manage hospitals and their information</p></div><div className="ml-6"><LastEnrolledPatient /></div></div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search hospitals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchHospitals}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 shadow-md font-medium"
            >
              <Search className="h-5 w-5" />
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
          <button onClick={handleAdd} className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md font-medium">
            <Plus className="h-5 w-5" />
            <span>Add Hospital</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedHospitals.map((hospital, index) => (
                <tr key={hospital.h_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">{startIndex + index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-black">{hospital.h_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{hospital.h_short || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full border ${
                      hospital.h_type === 'Private' ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-green-100 text-green-900 border-green-300'
                    }`}>
                      {hospital.h_type || 'Private'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{hospital.h_contact || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{hospital.h_address || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(hospital)} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-xs font-medium shadow-md">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(hospital)} className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 text-xs font-medium shadow-md">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {paginatedHospitals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {loading ? 'Loading hospitals...' : 'No hospitals found'}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages} | Total: {filteredHospitals.length} records
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
                          ? 'bg-blue-600 text-white'
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
              <h3 className="text-lg font-semibold">{editingHospital ? 'Edit Hospital' : 'Add Hospital'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label block text-sm font-medium text-gray-700 mb-1">Hospital Full Name</label>
                <input
                  type="text"
                  name="h_name"
                  value={formData.h_name}
                  onChange={(e) => setFormData({...formData, h_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hospital Name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label block text-sm font-medium text-gray-700 mb-1">Hospital Short Name</label>
                <input
                  type="text"
                  name="h_short"
                  value={formData.h_short}
                  onChange={(e) => setFormData({...formData, h_short: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hospital Short Name"
                />
              </div>
              <div className="form-group">
                <label className="form-label block text-sm font-medium text-gray-700 mb-2">Hospital Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="h_type"
                      value="Private"
                      checked={formData.h_type === 'Private'}
                      onChange={(e) => setFormData({...formData, h_type: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-sm">Private</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="h_type"
                      value="Government"
                      checked={formData.h_type === 'Government'}
                      onChange={(e) => setFormData({...formData, h_type: e.target.value})}
                      className="mr-2"
                    />
                    <span className="text-sm">Government</span>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="h_address"
                  value={formData.h_address}
                  onChange={(e) => setFormData({...formData, h_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Address"
                />
              </div>
              <div className="form-group">
                <label className="form-label block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="h_contact"
                  value={formData.h_contact}
                  onChange={(e) => setFormData({...formData, h_contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contact"
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md font-medium">
                  {editingHospital ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md font-medium">
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