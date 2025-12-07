'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, Minus } from 'lucide-react';

interface InventoryItem {
  id: number;
  item_name: string;
  quantity: number;
  opening_stock: number;
  inward_qty: number;
  outward_qty: number;
  date_added: string;
}

export default function OutwardPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [outwardQty, setOutwardQty] = useState(0);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/inventory/items');
      const data = await response.json();
      if (data.success) {
        setItems(data.data.filter((item: InventoryItem) => item.quantity > 0));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOutward = async () => {
    if (!selectedItem || outwardQty <= 0) return;

    const item = items.find(i => i.id === selectedItem);
    if (!item || outwardQty > item.quantity) {
      alert('Insufficient stock available');
      return;
    }

    try {
      const response = await fetch(`https://varahasdc.co.in/api/inventory/items/${selectedItem}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: item.item_name,
          quantity: item.quantity - outwardQty,
          opening_stock: item.opening_stock,
          inward_qty: item.inward_qty || 0,
          outward_qty: (item.outward_qty || 0) + outwardQty
        })
      });

      if (response.ok) {
        setSelectedItem(null);
        setOutwardQty(0);
        fetchItems();
        alert('Outward stock updated successfully');
      }
    } catch (error) {
      console.error('Error updating outward stock:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex items-center">
          <ArrowUp className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">Outward Stock</h1>
            <p className="text-red-100">Issue stock from inventory</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold">Select Item (Available Stock Only)</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item.id)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedItem === item.id ? 'bg-red-50 border-red-200' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{item.item_name}</h3>
                    <p className="text-sm text-gray-600">Available: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Outward: {item.outward_qty || 0}</p>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No items with available stock
              </div>
            )}
          </div>
        </div>

        {/* Outward Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Issue Outward Stock</h2>
          
          {selectedItem ? (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Item
                </label>
                <input
                  type="text"
                  value={items.find(i => i.id === selectedItem)?.item_name || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Stock
                </label>
                <input
                  type="number"
                  value={items.find(i => i.id === selectedItem)?.quantity || 0}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outward Quantity
                </label>
                <input
                  type="number"
                  value={outwardQty}
                  onChange={(e) => setOutwardQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  min="1"
                  max={items.find(i => i.id === selectedItem)?.quantity || 0}
                />
              </div>

              <button
                onClick={handleOutward}
                disabled={outwardQty <= 0 || outwardQty > (items.find(i => i.id === selectedItem)?.quantity || 0)}
                className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Minus className="h-5 w-5 mr-2" />
                Issue Outward Stock
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Select an item to issue outward stock</p>
          )}
        </div>
      </div>
    </div>
  );
}