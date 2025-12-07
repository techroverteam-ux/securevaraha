'use client';

import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, Users, Stethoscope, UserPlus, TrendingUp, Calendar, Eye, AlertCircle } from 'lucide-react';

interface DoctorStats {
  todayPatients: number;
  pendingReports: number;
  completedReports: number;
  totalReports: number;
  weeklyPatients: number;
  monthlyPatients: number;
  completionRate: number;
  avgReportsPerDay: number;
}

interface RecentActivity {
  patient_id: number;
  cro: string;
  patient_name: string;
  scan_name: string;
  date: string;
  c_status: number;
}

export default function DoctorDashboard() {
  const [stats, setStats] = useState<DoctorStats>({
    todayPatients: 0,
    pendingReports: 0,
    completedReports: 0,
    totalReports: 0,
    weeklyPatients: 0,
    monthlyPatients: 0,
    completionRate: 0,
    avgReportsPerDay: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pendingRes, completedRes] = await Promise.all([
        fetch('/api/doctor/stats'),
        fetch('/api/doctor/pending-patients'),
        fetch('/api/doctor/completed-reports')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(prev => ({ ...prev, ...statsData }));
      }

      if (pendingRes.ok && completedRes.ok) {
        const [pendingData, completedData] = await Promise.all([
          pendingRes.json(),
          completedRes.json()
        ]);
        
        const pending = pendingData.data || [];
        const completed = (completedData.data || []).slice(0, 10);
        
        setRecentActivity(completed);
        
        // Calculate additional stats
        const total = pending.length + completed.length;
        const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
        
        setStats(prev => ({
          ...prev,
          pendingReports: pending.length,
          completedReports: completed.length,
          totalReports: total,
          completionRate,
          avgReportsPerDay: Math.round(completed.length / 7)
        }));
      }
    } catch {
      console.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
        <p className="text-emerald-100 text-lg">Patient Reports & Medical Review</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-3xl font-bold text-orange-600">{loading ? '...' : stats.pendingReports}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting Review</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-3xl font-bold text-green-600">{loading ? '...' : stats.completedReports}</p>
              <p className="text-xs text-gray-500 mt-1">Reports Reviewed</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-blue-600">{loading ? '...' : stats.completionRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Overall Progress</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Daily Average</p>
              <p className="text-3xl font-bold text-purple-600">{loading ? '...' : stats.avgReportsPerDay}</p>
              <p className="text-xs text-gray-500 mt-1">Reports/Day</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading recent activity...</div>
            ) : recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div key={activity.patient_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.patient_name}</p>
                    <p className="text-sm text-gray-600">{activity.cro} • {activity.scan_name || 'Scan'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      activity.c_status === 1 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {activity.c_status === 1 ? 'Completed' : 'Pending'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No recent activity</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Priority Actions
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="font-medium text-red-900">Urgent Reports</p>
                <p className="text-sm text-red-700">{stats.pendingReports} reports need immediate attention</p>
              </div>
              <a href="/doctor/report-pending-list" className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                Review
              </a>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-blue-900">CT Scan Queue</p>
                <p className="text-sm text-blue-700">Check patient queue for CT scans</p>
              </div>
              <a href="/doctor/ct-scan-doctor-list" className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                View
              </a>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-900">Completed Reports</p>
                <p className="text-sm text-green-700">Review all completed reports</p>
              </div>
              <a href="/doctor/view-report" className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                View All
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/doctor/report-pending-list"
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-orange-500">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-medium text-gray-700">Pending Reports</span>
              <p className="text-xs text-gray-500">{stats.pendingReports} waiting</p>
            </div>
          </a>
          <a
            href="/doctor/view-report"
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-green-500">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-medium text-gray-700">View Reports</span>
              <p className="text-xs text-gray-500">{stats.completedReports} completed</p>
            </div>
          </a>
          <a
            href="/doctor/ct-scan-doctor-list"
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-blue-500">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-medium text-gray-700">Patient Queue</span>
              <p className="text-xs text-gray-500">CT Scan List</p>
            </div>
          </a>
          <a
            href="/doctor/ct-scan-doctors"
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-purple-500">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-medium text-gray-700">Manage Doctors</span>
              <p className="text-xs text-gray-500">Add/Edit</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}