'use client';

import Layout from '@/components/layout/Layout';
import HospitalForm from '@/components/ui/HospitalForm';
import { Toast, useToast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Hospital {
  id: number;
  hospital: string;
  shortName: string;
  type: string;
  contact: string;
  address: string;
}

export default function Hospitals() {
  const params = useParams();
  const role = params.role as string;
  const { toast, showToast, hideToast } = useToast();
  const [hospitals, setHospitals] = useState<Hospital[]>([
    { id: 1, hospital: 'MAHATMA GANDHI HOSPITAL', shortName: 'MGH', type: 'Government', contact: '02912636903', address: 'JALORI GATE Jodhpur' },
    { id: 2, hospital: 'MATHURA DAS MATHUR', shortName: 'MDM', type: 'Government', contact: '0291', address: 'SHASHTRI NAGAR' },
    { id: 3, hospital: 'UMAID HOSPITAL', shortName: 'UMD', type: 'Government', contact: '0291', address: 'SHIWANJI GATE JODHPUR' },
    { id: 4, hospital: 'All India Institute of Medical Sciences', shortName: 'AIIMS', type: 'Government', contact: '0291', address: 'BASNI JODHPUR' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedHospitals = filteredHospitals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage);

  const handleSubmit = (data: any) => {
    if (editingHospital) {
      setHospitals(hospitals.map(h => h.id === editingHospital.id ? {
        ...h,
        hospital: data.hospitalFullName,
        shortName: data.hospitalShortName,
        type: data.hospitalType,
        contact: data.phone,
        address: data.address
      } : h));
      showToast('Hospital updated successfully!', 'success');
    } else {
      const newHospital: Hospital = {
        id: Math.max(...hospitals.map(h => h.id)) + 1,
        hospital: data.hospitalFullName,
        shortName: data.hospitalShortName,
        type: data.hospitalType,
        contact: data.phone,
        address: data.address
      };
      setHospitals([...hospitals, newHospital]);
      showToast('Hospital added successfully!', 'success');
    }
    setEditingHospital(null);
  };

  const handleEdit = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this hospital?')) {
      setHospitals(hospitals.filter(h => h.id !== id));
      showToast('Hospital deleted successfully!', 'success');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="font-semibold text-gray-700" style={{ fontSize: '16px', fontFamily: 'sans-serif' }}>Hospitals</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 sm:px-6 sm:py-3 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-all duration-200 flex items-center justify-center space-x-2 mobile-px-3"
          >
            <Plus className="h-4 w-4" />
            <span>Add Hospital</span>
          </button>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <span className="font-medium text-gray-700" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>{itemsPerPage}</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>Search:</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 mobile-px-3"
                  style={{ fontSize: '14px', fontFamily: 'sans-serif' }}
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>S.No.</th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>Hospital</th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>Short Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>Type</th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>Contact</th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>Address</th>
                  <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedHospitals.map((hospital, index) => (
                  <tr key={hospital.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-normal text-gray-700" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-3 sm:px-6 py-4 font-normal text-gray-700" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>{hospital.hospital}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-normal text-gray-700" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>{hospital.shortName}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-normal text-gray-700" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>{hospital.type}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-normal text-gray-700" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>{hospital.contact}</td>
                    <td className="px-3 sm:px-6 py-4 font-normal text-gray-700" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>{hospital.address}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(hospital)}
                          className="text-sky-600 hover:text-sky-900 p-1 rounded hover:bg-sky-50"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(hospital.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete"
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
            <span className="font-normal text-gray-600" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredHospitals.length)} of {filteredHospitals.length}
            </span>
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded transition-colors ${
                    currentPage === page
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  style={{ fontSize: '12px', fontFamily: 'sans-serif' }}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>

        <HospitalForm
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingHospital(null);
          }}
          onSubmit={handleSubmit}
          initialData={editingHospital}
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