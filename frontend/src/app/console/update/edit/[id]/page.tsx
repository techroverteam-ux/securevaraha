'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

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
  number_contrast: string;
  technician_name: string;
  nursing_name: string;
  issue_cd: string;
  remark: string;
}

export default function EditConsoleRecord({ params }: { params: Promise<{ id: string }> }) {
  const toast = useToastContext();
  const router = useRouter();
  const [record, setRecord] = useState<ConsoleRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState<string>('');

  useEffect(() => {
    console.log('Edit page loaded, params:', params);
    params.then(({ id }) => {
      console.log('ID extracted from params:', id);
      setId(id);
    });
  }, [params]);

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
    if (id) {
      fetchRecord();
    }
  }, [id]);

  const fetchRecord = async () => {
    try {
      const response = await fetch(`https://varahasdc.co.in/api/console/detail-report`);
      if (response.ok) {
        const data = await response.json();
        const foundRecord = data.data?.find((r: ConsoleRecord) => r.con_id.toString() === id);
        if (foundRecord) {
          setRecord({
            ...foundRecord,
            date: convertToInputDate(foundRecord.date),
            scan_date: convertToInputDate(foundRecord.scan_date),
            allot_date: convertToInputDate(foundRecord.allot_date),
            added_on: convertToInputDate(foundRecord.added_on)
          });
        } else {
          toast.error('Console record not found');
          router.push('/console/update');
        }
      } else {
        toast.error('Failed to fetch console record');
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      toast.error('Error loading console record');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!record) return;

    setSaving(true);
    try {
      const response = await fetch('https://varahasdc.co.in/api/console/update-console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          con_id: record.con_id,
          scan_date: record.scan_date,
          allot_date: record.allot_date,
          date: record.date,
          examination_id: record.examination_id,
          status: record.status,
          number_scan: record.number_scan,
          number_film: record.number_film,
          number_contrast: record.number_contrast,
          technician_name: record.technician_name,
          issue_cd: record.issue_cd,
          remark: record.remark
        })
      });

      if (response.ok) {
        toast.success('Console record updated successfully');
        router.push('/console/update');
      } else {
        toast.error('Failed to update console record');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Error updating console record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading console record...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Console record not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/console/update')}
              className="p-2 bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold mb-2">Edit Console Record</h1>
              <p className="text-sky-100">CRO: {record.c_p_cro}</p>
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
                value={record.c_p_cro}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
              <input
                type="text"
                value={`${record.pre} ${record.patient_name}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <input
                type="text"
                value={record.doctor_name || '-'}
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
                  value={record.examination_id || ''}
                  onChange={(e) => setRecord({...record, examination_id: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={record.status || ''}
                  onChange={(e) => setRecord({...record, status: e.target.value})}
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
                  value={record.number_scan || ''}
                  onChange={(e) => setRecord({...record, number_scan: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Films</label>
                <input
                  type="number"
                  value={record.number_film || ''}
                  onChange={(e) => setRecord({...record, number_film: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Contrast</label>
                <input
                  type="number"
                  value={record.number_contrast || ''}
                  onChange={(e) => setRecord({...record, number_contrast: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician Name</label>
                <input
                  type="text"
                  value={record.technician_name || ''}
                  onChange={(e) => setRecord({...record, technician_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue CD/DVD</label>
                <select
                  value={record.issue_cd || ''}
                  onChange={(e) => setRecord({...record, issue_cd: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">Select Option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
              <textarea
                value={record.remark || ''}
                onChange={(e) => setRecord({...record, remark: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Enter any remarks..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Date Settings - Editable */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Date Settings (Editable)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
              <input
                type="date"
                value={record.date}
                onChange={(e) => setRecord({...record, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allot Date</label>
              <input
                type="date"
                value={record.allot_date}
                onChange={(e) => setRecord({...record, allot_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scan Date</label>
              <input
                type="date"
                value={record.scan_date}
                onChange={(e) => setRecord({...record, scan_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Console Date & Time - Read Only */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Console Date & Time (Read Only)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Console Date</label>
              <input
                type="date"
                value={record.added_on}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={record.start_time}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stop Time</label>
              <input
                type="time"
                value={record.stop_time}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}