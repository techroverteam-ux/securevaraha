'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, DollarSign, Wallet, HandCoins, Calculator } from 'lucide-react';
import SuperAdminLayout, { Card } from '@/components/SuperAdminLayout';

interface SuperAdminStats {
  todayScans: number;
  todayReceived: number;
  todayDue: number;
  todayWithdraw: number;
  cashInHand: number;
  totalAmount: number;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<SuperAdminStats>({
    todayScans: 115,
    todayReceived: 1350,
    todayDue: 0,
    todayWithdraw: 0,
    cashInHand: 1350,
    totalAmount: 247820
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://varahasdc.co.in/api';
      const response = await fetch(`${API_BASE_URL}/superadmin/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <SuperAdminLayout 
      title="Dashboard" 
      subtitle="Super Administrator Overview"
    >
      <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CT-Scan</p>
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-2xl font-bold text-blue-600">{stats.todayScans}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Received Amount</p>
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.todayReceived.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due Amount</p>
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-2xl font-bold text-orange-600">₹{stats.todayDue.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Wallet className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Withdraw</p>
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-2xl font-bold text-red-600">₹{stats.todayWithdraw.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <HandCoins className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cash In Hand</p>
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-2xl font-bold text-purple-600">₹{stats.cashInHand.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wallet className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-2xl font-bold text-indigo-600">₹{stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calculator className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <a
            href="/superadmin/patient-report"
            className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="p-1.5 rounded bg-blue-500">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Patient Reports</span>
          </a>
          <a
            href="/superadmin/revenue-report"
            className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <div className="p-1.5 rounded bg-green-500">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Revenue Report</span>
          </a>
          <a
            href="/superadmin/con-r-report"
            className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <div className="p-1.5 rounded bg-purple-500">
              <Calculator className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Console Report</span>
          </a>
          <a
            href="/superadmin/report-pending-list"
            className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <div className="p-1.5 rounded bg-orange-500">
              <HandCoins className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Pending Reports</span>
          </a>
        </div>
      </Card>
      </div>
    </SuperAdminLayout>
  );
}