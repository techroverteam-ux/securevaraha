'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, Activity, CheckCircle } from 'lucide-react';

interface DashboardStats {
  todayPatients: number;
  completedToday: number;
  pendingQueue: number;
  totalProcessed: number;
}

export default function ConsoleDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayPatients: 0,
    completedToday: 0,
    pendingQueue: 0,
    totalProcessed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/console/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Console stats API error:', errorData);
        console.log('Full stats API error response:', errorData);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
      }
    } catch (error) {
      console.error('Error fetching console stats:', error);
      console.log('Fetch error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Today\'s Patients',
      value: stats.todayPatients,
      icon: Users,
      color: 'bg-sky-500',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600'
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: CheckCircle,
      color: 'bg-sky-400',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600'
    },
    {
      title: 'Pending Queue',
      value: stats.pendingQueue,
      icon: Clock,
      color: 'bg-sky-600',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600'
    },
    {
      title: 'Total Processed',
      value: stats.totalProcessed,
      icon: Activity,
      color: 'bg-sky-700',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Console Dashboard</h1>
            <p className="text-sky-100">Welcome to Console Management System</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <a
              key={index}
              href="/console/daily-report"
              className={`${card.bgColor} p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.textColor}`}>
                    {loading ? '...' : (card.value || 0).toLocaleString()}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/console"
            className="flex items-center space-x-3 p-4 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
          >
            <Users className="h-8 w-8 text-sky-600" />
            <div>
              <h3 className="font-medium text-gray-900">Patient Queue</h3>
              <p className="text-sm text-gray-600">Manage patient queue</p>
            </div>
          </a>
          
          <a
            href="/console/daily-report"
            className="flex items-center space-x-3 p-4 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
          >
            <Activity className="h-8 w-8 text-sky-600" />
            <div>
              <h3 className="font-medium text-gray-900">Daily Report</h3>
              <p className="text-sm text-gray-600">View daily activities</p>
            </div>
          </a>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Clock className="h-8 w-8 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-900">Current Time</h3>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Calcutta' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}