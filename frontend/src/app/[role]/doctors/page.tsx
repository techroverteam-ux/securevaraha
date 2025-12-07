'use client';

import Layout from '@/components/layout/Layout';
import { FormInput, FormButton } from '@/components/ui/FormComponents';
import DoctorForm from '@/components/ui/DoctorForm';
import { Toast, useToast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function Doctors() {
  const params = useParams();
  const role = params.role as string;
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const { toast, showToast, hideToast } = useToast();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors');
      const data = await response.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor: any) =>
    doctor.dname?.toLowerCase().includes(search.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Doctors - {role}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Show</span>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search:"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <FormButton onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4" />
                <span>Add Doctor</span>
              </FormButton>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading doctors...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">S.No.</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Doctor Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Age</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Gender</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Specialist</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Contact</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDoctors.map((doctor: any, index) => (
                      <tr key={doctor.did || `doctor-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{startIndex + index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b font-medium">{doctor.dname}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{doctor.age || '30'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{doctor.gender || 'Male'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{doctor.specialization || 'NA'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b">{doctor.contact || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm border-b">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setEditingDoctor(doctor);
                                setIsFormOpen(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this doctor?')) {
                                  showToast('Doctor deleted successfully!', 'success');
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

              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredDoctors.length)} of {filteredDoctors.length}
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

          {!loading && filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No doctors found</p>
            </div>
          )}
        </div>

        <DoctorForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingDoctor(null);
          }}
          onSubmit={(data) => {
            if (editingDoctor) {
              showToast('Doctor updated successfully!', 'success');
            } else {
              showToast('Doctor added successfully!', 'success');
            }
            setIsFormOpen(false);
            setEditingDoctor(null);
          }}
          initialData={editingDoctor}
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