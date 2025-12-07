'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddItem() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    item_name: '',
    opening_stock: 0,
    value_rupees: 0,
    stock_date: new Date().toISOString().split('T')[0],
    unit: 'quantity'
  });
  const [loading, setLoading] = useState(false);

  const getUnitLabel = () => {
    switch (formData.unit) {
      case 'ml': return 'ml';
      case 'liter': return 'liter';
      case 'quantity': return 'qty';
      default: return 'qty';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://varahasdc.co.in/api/inventory/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/inventory/stock');
      } else {
        alert('Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Item</h1>
      </div>

      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name
            </label>
            <select
              value={formData.item_name}
              onChange={(e) => {
                const selectedItem = e.target.value;
                let unit = 'quantity';
                if (selectedItem.toLowerCase().includes('contrast')) unit = 'ml';
                else if (selectedItem.toLowerCase().includes('diesel')) unit = 'liter';
                else if (selectedItem.toLowerCase().includes('film') || selectedItem.toLowerCase().includes('cd') || selectedItem.toLowerCase().includes('dvd')) unit = 'quantity';
                setFormData({...formData, item_name: selectedItem, unit});
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Select Item Type</option>
              <option value="Contrast">Contrast</option>
              <option value="Films">Films</option>
              <option value="CD/DVD">CD/DVD</option>
              <option value="Diesel">Diesel</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Date
            </label>
            <input
              type="date"
              value={formData.stock_date}
              onChange={(e) => setFormData({...formData, stock_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Stock ({getUnitLabel()})
            </label>
            <input
              type="number"
              value={formData.opening_stock === 0 ? '' : formData.opening_stock}
              onChange={(e) => setFormData({...formData, opening_stock: e.target.value === '' ? 0 : parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value (₹)
            </label>
            <input
              type="number"
              value={formData.value_rupees === 0 ? '' : formData.value_rupees}
              onChange={(e) => setFormData({...formData, value_rupees: e.target.value === '' ? 0 : parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  );
}