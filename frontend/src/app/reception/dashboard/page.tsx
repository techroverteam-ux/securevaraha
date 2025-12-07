'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users, Hospital, Stethoscope, IndianRupee, Calendar, Clock, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LastEnrolledPatient from '@/components/LastEnrolledPatient';

interface ReceptionStats {
  todayPatients: number;
  totalPatients: number;
  pendingPatients: number;
  completedScans: number;
  totalHospitals: number;
  totalDoctors: number;
  totalScans: number;
  totalRevenue: number;
  todayRevenue: number;
  todayWithdraw: number;
  cashInHand: number;
  lastMonthRevenue: number;
  currentMonthRevenue: number;
}

export default function ReceptionDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReceptionStats>({
    todayPatients: 0,
    totalPatients: 0,
    pendingPatients: 0,
    completedScans: 0,
    totalHospitals: 0,
    totalDoctors: 0,
    totalScans: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    todayWithdraw: 0,
    cashInHand: 0,
    lastMonthRevenue: 0,
    currentMonthRevenue: 0
  });

  useEffect(() => {
    fetchReceptionStats();
  }, []);

  const fetchReceptionStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reception/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Mock data for display
        setStats({
          todayPatients: 25,
          totalPatients: 1250,
          pendingPatients: 8,
          completedScans: 45,
          totalHospitals: 5,
          totalDoctors: 10,
          totalScans: 15,
          totalRevenue: 125000,
          todayRevenue: 8500,
          todayWithdraw: 2000,
          cashInHand: 45000,
          lastMonthRevenue: 12060870,
          currentMonthRevenue: 9331810
        });
      }
    } catch (error) {
      console.error('Error fetching reception stats:', error);
      // Mock data for display
      setStats({
        todayPatients: 25,
        totalPatients: 1250,
        pendingPatients: 8,
        completedScans: 45,
        totalHospitals: 5,
        totalDoctors: 10,
        totalScans: 15,
        totalRevenue: 125000,
        todayRevenue: 8500,
        todayWithdraw: 2000,
        cashInHand: 45000,
        lastMonthRevenue: 12060870,
        currentMonthRevenue: 9331810
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Reception Dashboard</h1>
              <p className="text-blue-100 text-lg">Varaha Diagnostic Center</p>
              <div className="flex items-center mt-3 text-blue-200">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="mt-4">
                <LastEnrolledPatient />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Monthly Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div 
          onClick={() => !loading && router.push('/reception/reports/revenue')}
          className="bg-blue-50 border border-blue-200 text-blue-800 p-8 rounded-2xl shadow-lg cursor-pointer hover:bg-blue-100 transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-2">Last Month Revenue</p>
                <p className="text-4xl font-bold mb-2">₹{stats.lastMonthRevenue.toLocaleString()}.00</p>
                <div className="flex items-center">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  <span className="text-xs text-blue-600">Previous Period</span>
                </div>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <IndianRupee className="h-10 w-10 text-blue-600" />
              </div>
            </div>
          )}
        </div>

        <div 
          onClick={() => !loading && router.push('/reception/reports/revenue')}
          className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-8 rounded-2xl shadow-lg cursor-pointer hover:bg-indigo-100 transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium mb-2">Current Month Revenue</p>
                <p className="text-4xl font-bold mb-2">₹{stats.currentMonthRevenue.toLocaleString()}.00</p>
                <div className="flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-xs text-indigo-600">This Period</span>
                </div>
              </div>
              <div className="bg-indigo-100 p-4 rounded-xl">
                <Wallet className="h-10 w-10 text-indigo-600" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Today's Patients */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Today's Patients</p>
                <p className="text-3xl font-bold">{stats.todayPatients}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-xs text-blue-200">Active Today</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Users className="h-8 w-8" />
              </div>
            </div>
          )}
        </div>

        {/* Total Patients */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Total Patients</p>
                <p className="text-3xl font-bold">{stats.totalPatients}</p>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 mr-1" />
                  <span className="text-xs text-indigo-200">All Time</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Activity className="h-8 w-8" />
              </div>
            </div>
          )}
        </div>

        {/* Pending Patients */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Pending Patients</p>
                <p className="text-3xl font-bold">{stats.pendingPatients}</p>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-xs text-purple-200">Waiting</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Clock className="h-8 w-8" />
              </div>
            </div>
          )}
        </div>

        {/* Completed Scans */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Completed Scans</p>
                <p className="text-3xl font-bold">{stats.completedScans}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-xs text-green-200">Processed</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Stethoscope className="h-8 w-8" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Received</span>
                <span className="font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Due</span>
                <span className="font-bold text-red-600">₹{stats.todayRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Withdraw</span>
                <span className="font-bold text-orange-600">₹{stats.todayWithdraw.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-800">Cash in Hand</span>
                  <span className="font-bold text-blue-600">₹{stats.cashInHand.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resources Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Resources</h3>
            <Hospital className="h-6 w-6 text-blue-600" />
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                onClick={() => router.push('/reception/hospitals')}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <div className="flex items-center">
                  <Hospital className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Hospitals</span>
                </div>
                <span className="font-bold text-blue-600">{stats.totalHospitals}</span>
              </div>
              <div 
                onClick={() => router.push('/reception/doctors')}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <div className="flex items-center">
                  <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Doctors</span>
                </div>
                <span className="font-bold text-blue-600">{stats.totalDoctors}</span>
              </div>
              <div 
                onClick={() => router.push('/reception/scans')}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <div className="flex items-center">
                  <Camera className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Scans</span>
                </div>
                <span className="font-bold text-blue-600">{stats.totalScans}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/reception/patient-registration/new')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-md"
            >
              New Patient Registration
            </button>
            <button 
              onClick={() => router.push('/reception/doctor-report/daily')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-md"
            >
              View Today's Report
            </button>
            <button 
              onClick={() => router.push('/reception/patient-registration/list')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-md"
            >
              Manage Patients
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}