'use client';

import { useState } from 'react';
import { Download, FileText, Calendar, Users, TrendingUp, Activity } from 'lucide-react';

export default function AllReportsDownload() {
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const reportTypes = [
    {
      id: 'daily-revenue-detail',
      title: 'Daily Revenue Detail',
      description: 'Detailed patient-wise revenue report',
      icon: TrendingUp,
      color: 'bg-blue-500',
      endpoint: '/api/reports/daily-revenue-excel'
    },
    {
      id: 'daily-revenue-summary',
      title: 'Daily Revenue Summary',
      description: 'Summary of daily revenue with totals',
      icon: FileText,
      color: 'bg-green-500',
      endpoint: '/api/reports/daily-revenue-summary-excel'
    },
    {
      id: 'patient-report',
      title: 'Patient Report',
      description: 'Complete patient listing with details',
      icon: Users,
      color: 'bg-purple-500',
      endpoint: '/api/reports/patient-excel'
    },
    {
      id: 'appointment-report',
      title: 'Appointment Report',
      description: 'Appointment scheduling report',
      icon: Calendar,
      color: 'bg-orange-500',
      endpoint: '/api/reports/appointment-excel'
    },
    {
      id: 'console-report',
      title: 'Console Activity Report',
      description: 'Console operations and activity log',
      icon: Activity,
      color: 'bg-teal-500',
      endpoint: '/api/reports/console-excel'
    },
    {
      id: 'doctor-report',
      title: 'Doctor Report',
      description: 'Doctor-wise patient and scan reports',
      icon: Activity,
      color: 'bg-indigo-500',
      endpoint: '/api/reports/doctor-excel'
    }
  ];

  const handleDownload = async (reportType: string, endpoint: string) => {
    const params = new URLSearchParams({
      from_date: dateRange.from,
      to_date: dateRange.to,
      type: reportType
    });
    
    const url = `${endpoint}?${params.toString()}`;
    window.open(url, '_blank');
  };

  const handleDownloadAll = async () => {
    for (const report of reportTypes) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between downloads
      handleDownload(report.id, report.endpoint);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Download All Reports</h1>
        <button
          onClick={handleDownloadAll}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Download All Reports</span>
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          return (
            <div key={report.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`p-3 rounded-full ${report.color}`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleDownload(report.id, report.endpoint)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Download Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Select the appropriate date range for your reports</li>
          <li>• Click individual download buttons for specific reports</li>
          <li>• Use "Download All Reports" to get all reports at once</li>
          <li>• Reports will be downloaded as Excel files (.xls format)</li>
          <li>• Large date ranges may take longer to process</li>
        </ul>
      </div>
    </div>
  );
}