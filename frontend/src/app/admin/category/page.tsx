'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Search, X } from 'lucide-react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { useToastContext } from '@/context/ToastContext';

interface Category {
  cat_id: number;
  cat_name: string;
  cat_type: string;
}

export default function CategoryManagement() {
  const toast = useToastContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ cat_name: '', cat_type: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ cat_name: '', cat_type: '' });
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ cat_name: category.cat_name, cat_type: category.cat_type });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategory ? `https://varahasdc.co.in/api/admin/categories/${editingCategory.cat_id}` : 'https://varahasdc.co.in/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.error(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        fetchCategories();
      }
    } catch (error) {
      toast.error('Error saving category');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.cat_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <SuperAdminLayout 
      title="Patient Category" 
      subtitle="Manage patient categories and types"
    >
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center space-x-2 shadow-md font-medium">
              <Plus className="h-5 w-5" />
              <span>Add Category</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading categories...</p>
            </div>
          ) : (

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedCategories.map((category, index) => (
                    <tr key={category.cat_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{startIndex + index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.cat_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-bold rounded-full border bg-red-100 text-red-900 border-red-300">
                          {category.cat_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleEdit(category)} className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-xs font-medium shadow-md">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages} | Total: {filteredCategories.length} records
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
                                  : 'bg-gray-400 text-white hover:bg-gray-500'
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
              )}
            </div>
          )}
        </div>
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={formData.cat_name}
                  onChange={(e) => setFormData({...formData, cat_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Category Type"
                  value={formData.cat_type}
                  onChange={(e) => setFormData({...formData, cat_type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                />
                <div className="flex space-x-2">
                  <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md font-medium">
                    {editingCategory ? 'Update' : 'Create'}
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