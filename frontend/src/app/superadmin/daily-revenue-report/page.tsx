'use client';

import { useState } from 'react';
import { Calendar, Download, FileText, Filter } from 'lucide-react';

export default function DailyRevenueReport() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<'detail' | 'summary'>('detail');

  const handleDownload = async (type: 'detail' | 'summary') => {
    const url = type === 'detail' 
      ? `/api/reports/daily-revenue-excel?date=${selectedDate}&type=detail`
      : `/api/reports/daily-revenue-excel?date=${selectedDate}&type=summary`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Daily Revenue Report</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Revenue Report Section</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold">Daily Revenue Report</h2>
          <p className="text-blue-100">Generate and download daily revenue reports</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="h-4 w-4 inline mr-2" />
                Report Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="detail"
                    checked={reportType === 'detail'}
                    onChange={(e) => setReportType(e.target.value as 'detail' | 'summary')}
                    className="mr-2"
                  />
                  Detail Report
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="summary"
                    checked={reportType === 'summary'}
                    onChange={(e) => setReportType(e.target.value as 'detail' | 'summary')}
                    className="mr-2"
                  />
                  Summary Report
                </label>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => handleDownload('detail')}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Download Detail Report</span>
            </button>

            <button
              onClick={() => handleDownload('summary')}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText className="h-5 w-5" />
              <span>Download Summary Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900">Detail Report includes:</h4>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Patient-wise scan details</li>
              <li>Hospital-wise categorization</li>
              <li>Category-wise breakdown</li>
              <li>Individual scan amounts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Summary Report includes:</h4>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Total scans and amounts</li>
              <li>Hospital-wise summary</li>
              <li>Category-wise totals</li>
              <li>Net receivable amounts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}