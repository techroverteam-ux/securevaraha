'use client';

import Layout from '@/components/layout/Layout';
import { FormInput, FormButton } from '@/components/ui/FormComponents';
import { Toast, useToast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function PatientCategory() {
  const params = useParams();
  const role = params.role as string;
  const [categories, setCategories] = useState([
    { id: 1, name: 'General', description: 'General patients', status: 'Active' },
    { id: 2, name: 'Emergency', description: 'Emergency cases', status: 'Active' },
    { id: 3, name: 'VIP', description: 'VIP patients', status: 'Active' },
    { id: 4, name: 'Insurance', description: 'Insurance patients', status: 'Active' }
  ]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Active' });
  const { toast, showToast, hideToast } = useToast();
  const itemsPerPage = 10;

  const filteredCategories = categories.filter((category: any) =>
    category.name?.toLowerCase().includes(search.toLowerCase()) ||
    category.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory?.id ? { ...editingCategory, ...formData } : cat
      ));
      showToast('Category updated successfully!', 'success');
    } else {
      const newCategory = { 
        id: Date.now(), 
        ...formData 
      };
      setCategories([...categories, newCategory]);
      showToast('Category added successfully!', 'success');
    }
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', status: 'Active' });
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description, status: category.status });
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
      showToast('Category deleted successfully!', 'success');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Patient Categories - {role}</h1>
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
                <span>Add Category</span>
              </FormButton>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">S.No.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Category Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((category: any, index) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700 border-b">{startIndex + index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-b font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-b">{category.description}</td>
                    <td className="px-4 py-3 text-sm border-b">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm border-b">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(category)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)}
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
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCategories.length)} of {filteredCategories.length}
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
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label="Category Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <FormInput
                  label="Description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <FormButton type="submit" className="flex-1">
                    {editingCategory ? 'Update' : 'Add'} Category
                  </FormButton>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingCategory(null);
                      setFormData({ name: '', description: '', status: 'Active' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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