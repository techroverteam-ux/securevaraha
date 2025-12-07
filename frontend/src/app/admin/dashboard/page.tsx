'use client';

import { useState, useEffect } from 'react';
import { Users, Activity, TrendingUp, FileText, Hospital, Calendar } from 'lucide-react';

interface DashboardStats {
  totalPatients: number; // Patient Registered (total scans)
  todayPatients: number; // Total MRI (patient count)
  totalRevenue: number; // Received Amount
  todayRevenue: number; // Due Amount
  todayWithdraw: number; // Withdraw
  cashInHand: number; // Cash In Hand
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayPatients: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    todayWithdraw: 0,
    cashInHand: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const quickActions = [
    { label: 'Add New Patient', href: '/admin/patient-new', icon: Users, color: 'bg-blue-500' },
    { label: 'Patient List', href: '/admin/patient-list', icon: FileText, color: 'bg-green-500' },
    { label: 'Daily Report', href: '/admin/daily-revenue-report', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Manage Hospitals', href: '/admin/hospital', icon: Hospital, color: 'bg-orange-500' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Patient Registered</p>
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalPatients}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total CT Scan</p>
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-3xl font-bold text-green-600">{stats.todayPatients}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Received Amount</p>
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-3xl font-bold text-purple-600">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due Amount</p>
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-3xl font-bold text-orange-600">₹{(stats.todayRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Withdraw</p>
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-3xl font-bold text-red-600">₹{(stats.todayWithdraw || 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Hospital className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cash In Hand</p>
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-3xl font-bold text-indigo-600">₹{(stats.cashInHand || 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-gray-700">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}