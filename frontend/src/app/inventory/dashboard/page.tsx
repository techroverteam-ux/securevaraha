'use client';

import { useState, useEffect } from 'react';
import { Package, TrendingUp, TrendingDown, AlertTriangle, FileText, Activity, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function InventoryDashboard() {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    totalValue: 0,
    recentOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/inventory/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Add New Item',
      description: 'Add new inventory items',
      icon: Package,
      href: '/inventory/add',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'View Stock',
      description: 'View current stock levels',
      icon: BarChart3,
      href: '/inventory/stock',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Transactions',
      description: 'View inward/outward transactions',
      icon: FileText,
      href: '/inventory/transactions',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Analysis & Reports',
      description: 'Stock analysis and export',
      icon: Activity,
      href: '/inventory/analysis',
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex items-center">
          <Package className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">Inventory Management System</h1>
            <p className="text-orange-100">Comprehensive inventory tracking with inward/outward management</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.totalItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.lowStock}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : `₹${stats.totalValue.toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stats.recentOrders}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className={`${action.color} text-white p-4 rounded-lg transition-colors duration-200 block`}
              >
                <div className="flex items-center">
                  <IconComponent className="h-6 w-6" />
                  <div className="ml-3">
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Features</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Inward Stock Management</p>
                <p className="text-xs text-gray-600">Track supplier deliveries, invoices, and rates</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-red-50 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Outward Stock Management</p>
                <p className="text-xs text-gray-600">Issue stock to departments with purpose tracking</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Stock Analysis</p>
                <p className="text-xs text-gray-600">Comprehensive reports and trend analysis</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Capabilities</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Transaction Reports</p>
                <p className="text-xs text-gray-600">Export all inward/outward movements</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-orange-50 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Stock Analysis Reports</p>
                <p className="text-xs text-gray-600">Detailed analysis with low stock alerts</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Excel Export</p>
                <p className="text-xs text-gray-600">Professional formatted Excel reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}