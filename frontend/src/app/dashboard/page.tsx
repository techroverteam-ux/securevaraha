'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, DollarSign, Wallet, HandCoins, Calculator } from 'lucide-react';

interface DashboardStats {
  currentMonthTotal: number;
  lastMonthTotal: number;
  todayScans: number;
  todayReceived: number;
  todayDue: number;
  todayWithdraw: number;
  cashInHand: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    currentMonthTotal: 0,
    lastMonthTotal: 0,
    todayScans: 0,
    todayReceived: 0,
    todayDue: 0,
    todayWithdraw: 0,
    cashInHand: 0
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-blue-100 text-lg">Welcome {user?.username} ({user?.role})</p>
      </div>

      {/* Monthly Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Month Total</p>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.lastMonthTotal)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Month Total</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.currentMonthTotal)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calculator className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Scans</p>
              <p className="text-2xl font-bold text-blue-600">{stats.todayScans}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Received</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.todayReceived)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due Amount</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.todayDue)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cash in Hand</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.cashInHand)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Wallet className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/patient-report"
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="p-2 rounded-lg bg-blue-500">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-700">Patient Reports</span>
          </a>
          <a
            href="/revenue-report"
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="p-2 rounded-lg bg-green-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-700">Revenue Report</span>
          </a>
          <a
            href="/console-report"
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="p-2 rounded-lg bg-purple-500">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-700">Console Report</span>
          </a>
          <a
            href="/pending-reports"
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="p-2 rounded-lg bg-orange-500">
              <HandCoins className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-700">Pending Reports</span>
          </a>
        </div>
      </div>
    </div>
  );
}