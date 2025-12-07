'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, Edit, ArrowLeft, Save } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import { useRouter, useSearchParams } from 'next/navigation';

interface ConsoleRecord {
  con_id: number;
  c_p_cro: string;
  patient_name: string;
  pre: string;
  doctor_name: string;
  status: string;
  start_time: string;
  stop_time: string;
  added_on: string;
  date: string;
  scan_date: string;
  allot_date: string;
  examination_id: number;
  number_scan: string;
  number_film: string;
  number_films: number;
  number_contrast: string;
  technician_name: string;
  nursing_name: string;
  issue_cd: string;
  remark: string;
}

export default function ConsoleUpdate() {
  const toast = useToastContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [records, setRecords] = useState<ConsoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Calcutta' })
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editingRecord, setEditingRecord] = useState<ConsoleRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return '-';
    
    // Handle ISO date format (2025-10-01T02:33:50.000Z)
    if (dateStr.includes('T')) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { timeZone: 'Asia/Calcutta' }).replace(/\//g, '-');
    }
    
    // Handle YYYY-MM-DD format
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr.split('-').reverse().join('-');
    }
    
    // Handle DD-MM-YYYY format (already correct)
    if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
      return dateStr;
    }
    
    return dateStr;
  };

  const convertToInputDate = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return '';
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const parts = dateStr.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedDate]);

  useEffect(() => {
    if (editId && records.length > 0) {
      const recordToEdit = records.find(r => r.con_id.toString() === editId);
      if (recordToEdit) {
        setEditingRecord({
          ...recordToEdit,
          date: convertToInputDate(recordToEdit.date),
          scan_date: convertToInputDate(recordToEdit.scan_date),
          allot_date: convertToInputDate(recordToEdit.allot_date),
          added_on: convertToInputDate(recordToEdit.added_on),
          number_film: recordToEdit.number_film?.toString() || recordToEdit.number_films?.toString() || ''
        });
      }
    }
  }, [editId, records]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        fromDate: selectedDate.split('-').reverse().join('-'),
        toDate: selectedDate.split('-').reverse().join('-')
      });
      
      const response = await fetch(`https://varahasdc.co.in/api/console/detail-report?${params}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRecords(data.data || []);
        if (data.data && data.data.length > 0) {
          toast.success(`Found ${data.data.length} console records`);
        } else {
          toast.error('No console records found for selected date');
        }
      } else {
        toast.error('Failed to fetch console records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Error loading console records');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: ConsoleRecord) => {
    router.push(`/console/update?edit=${record.con_id}`);
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;

    setSaving(true);
    try {
      const response = await fetch('https://varahasdc.co.in/api/console/update-console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          con_id: editingRecord.con_id,
          scan_date: editingRecord.scan_date,
          allot_date: editingRecord.allot_date,
          date: editingRecord.date,
          examination_id: editingRecord.examination_id,
          status: editingRecord.status,
          number_scan: editingRecord.number_scan,
          number_films: editingRecord.number_film,
          number_contrast: editingRecord.number_contrast,
          technician_name: editingRecord.technician_name,
          issue_cd: editingRecord.issue_cd
        })
      });

      if (response.ok) {
        toast.success('Console record updated successfully');
        // Refresh the records data
        await fetchRecords();
        // Navigate back to list view
        router.push('/console/update');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update console record');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Error updating console record');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/console/update');
  };

  const filteredRecords = records.filter(record =>
    record.c_p_cro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate]);

  // If in edit mode, show edit form
  if (editId && editingRecord) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold mb-2">Edit Console Record</h1>
                <p className="text-sky-100">CRO: {editingRecord.c_p_cro}</p>
              </div>
            </div>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className={`h-5 w-5 ${saving ? 'animate-spin' : ''}`} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Information - Read Only */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CRO Number</label>
                <input
                  type="text"
                  value={editingRecord.c_p_cro}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={`${editingRecord.pre} ${editingRecord.patient_name}`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <input
                  type="text"
                  value={editingRecord.doctor_name || '-'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Console Details - Editable */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Console Details (Editable)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examination ID</label>
                  <input
                    type="number"
                    value={editingRecord.examination_id || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, examination_id: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingRecord.status || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Scans</label>
                  <input
                    type="number"
                    value={editingRecord.number_scan || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, number_scan: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Films</label>
                  <input
                    type="number"
                    value={editingRecord.number_film || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, number_film: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Contrast</label>
                  <input
                    type="number"
                    value={editingRecord.number_contrast || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, number_contrast: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technician Name</label>
                  <input
                    type="text"
                    value={editingRecord.technician_name || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, technician_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue CD/DVD</label>
                  <select
                    value={editingRecord.issue_cd || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, issue_cd: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">Select Option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Editable Date Fields */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Editable Date Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
              <input
                type="date"
                value={editingRecord.date}
                onChange={(e) => setEditingRecord({...editingRecord, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allot Date</label>
              <input
                type="date"
                value={editingRecord.allot_date}
                onChange={(e) => setEditingRecord({...editingRecord, allot_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scan Date</label>
              <input
                type="date"
                value={editingRecord.scan_date}
                onChange={(e) => setEditingRecord({...editingRecord, scan_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Console Date & Time - Read Only */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Console Date & Time (Read Only)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Console Date</label>
              <input
                type="text"
                value={formatDate(editingRecord.added_on)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={editingRecord.start_time}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stop Time</label>
              <input
                type="time"
                value={editingRecord.stop_time}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold mb-2">Console Update</h1>
            <p className="text-sky-100 text-sm sm:text-base">Update console records after completion</p>
          </div>
          <button
            onClick={fetchRecords}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 w-full sm:w-auto border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by CRO or Patient Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Console Records</h2>
          <p className="text-sm text-gray-600 mt-1">
            Date: {selectedDate.split('-').reverse().join('-')} | Total: {filteredRecords.length} records | Page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allot Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Console Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-sky-500" />
                      <span className="text-gray-500">Loading console records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    No console records found
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record.con_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-sky-600">{record.c_p_cro}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">{record.pre} {record.patient_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {record.doctor_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {formatDate(record.allot_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {formatDate(record.scan_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {formatDate(record.added_on)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        record.status === 'Complete' 
                          ? 'bg-green-100 text-green-900 border-green-300' 
                          : record.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                          : 'bg-gray-100 text-gray-900 border-gray-300'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {record.start_time} - {record.stop_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(record)}
                        className="inline-flex items-center space-x-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Client-side Pagination */}
        {filteredRecords.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages} | Total: {filteredRecords.length} records
              </div>
              <div className="flex items-center space-x-2">
                {currentPage > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Previous
                    </button>
                  </>
                )}
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const startPage = Math.max(1, currentPage - 2);
                    const page = startPage + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === page
                            ? 'bg-sky-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                {currentPage < totalPages && (
                  <>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Last
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}