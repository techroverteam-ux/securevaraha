'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, User, FileText, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useToastContext } from '@/context/ToastContext';

interface PatientDetail {
  patient_id: number;
  cro: string;
  patient_name: string;
  age: string;
  gender: string;
  mobile: string;
  address: string;
  date: string;
  allot_date: string;
  contact_number: string;
  category: string;
  scan_type: string;
  n_patient_ct: string;
  n_patient_ct_report_date: string;
  n_patient_ct_remark: string;
  n_patient_x_ray: string;
  n_patient_x_ray_report_date: string;
  n_patient_x_ray_remark: string;
  ct_scan_doctor_id: number;
}

interface Scan {
  s_id: number;
  s_name: string;
  scan_head_id?: number;
  head_name?: string;
}

interface Doctor {
  id: number;
  doctor_name: string;
}

interface NursingData {
  patient: PatientDetail;
  scans: Scan[];
  doctors: Doctor[];
}

export default function NursingDetail() {
  const params = useParams();
  const router = useRouter();
  const toast = useToastContext();
  const cro = decodeURIComponent(params.cro as string);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '0000-00-00') return '-';
    try {
      // Handle DD-MM-YYYY format from database
      let date;
      if (dateString.includes('-') && dateString.split('-').length === 3) {
        const parts = dateString.split('-');
        if (parts[0].length === 4) {
          // YYYY-MM-DD format
          date = new Date(dateString);
        } else {
          // DD-MM-YYYY format
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) return '-';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return '-';
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString || dateString === '0000-00-00') return '';
    try {
      // Handle ISO date strings (e.g., "2025-10-07T04:00:00.000Z")
      if (dateString.includes('T') && dateString.includes('Z')) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
      }
      
      // Handle other date formats
      if (dateString.includes('-') && dateString.split('-').length === 3) {
        const parts = dateString.split('-');
        if (parts[0].length === 4) {
          // Already YYYY-MM-DD format
          return dateString.split('T')[0]; // Remove time part if present
        } else {
          // DD-MM-YYYY format, convert to YYYY-MM-DD
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const formatDateToDDMMYYYY = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } catch {
      return '';
    }
  };
  
  const [nursingData, setNursingData] = useState<NursingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<number>(0);
  const [ctScanReportDate, setCTScanReportDate] = useState<string>('');
  const [ctScan, setCTScan] = useState<string>('No');
  const [ctReportDate, setCTReportDate] = useState<string>('');
  const [ctRemark, setCTRemark] = useState<string>('');
  const [xRay, setXRay] = useState<string>('No');
  const [xRayReportDate, setXRayReportDate] = useState<string>('');
  const [xRayRemark, setXRayRemark] = useState<string>('');

  useEffect(() => {
    if (cro) {
      fetchPatientDetail();
    }
  }, [cro]);

  const fetchPatientDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/doctor/nursing/${encodeURIComponent(cro)}`);
      if (response.ok) {
        const data = await response.json();
        setNursingData(data.data);
        const patient = data.data.patient;
        setSelectedDoctor(patient.ct_scan_doctor_id || 0);
        setCTScanReportDate(formatDateForInput(patient.n_patient_ct_report_date || ''));
        setCTScan(patient.n_patient_ct || 'No');
        setCTReportDate(formatDateForInput(patient.n_patient_ct_report_date || ''));
        setCTRemark(patient.n_patient_ct_remark || '');
        setXRay(patient.n_patient_x_ray || 'No');
        setXRayReportDate(formatDateForInput(patient.n_patient_x_ray_report_date || ''));
        setXRayRemark(patient.n_patient_x_ray_remark || '');
      } else {
        toast.error('Patient not found');
        router.push('/doctor/ct-scan-doctor-list');
      }
    } catch {
      toast.error('Error loading patient details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/doctor/save-nursing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cro: cro,
          ct_scan_doctor_id: selectedDoctor || null,
          ct_scan_report_date: ctScanReportDate || null,
          n_patient_ct: ctScan,
          n_patient_ct_report_date: ctReportDate || null,
          n_patient_ct_remark: ctRemark,
          n_patient_x_ray: xRay,
          n_patient_x_ray_report_date: xRayReportDate || null,
          n_patient_x_ray_remark: xRayRemark
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('Nursing data saved successfully');
        fetchPatientDetail();
      } else {
        console.error('Save error:', result);
        toast.error(result.error || 'Failed to save nursing data');
      }
    } catch (error) {
      console.error('Save nursing error:', error);
      toast.error('Error saving nursing data');
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading patient details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!nursingData) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <p className="text-gray-500">Patient not found</p>
          <button
            onClick={() => router.push('/doctor/ct-scan-doctor-list')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 mb-6 rounded-lg">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push('/doctor/ct-scan-doctor-list')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nursing Details</h1>
            <p className="text-gray-600">Patient CRO: {nursingData.patient.cro}</p>
          </div>
        </div>
      </div>

      {/* Patient Information Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50 w-1/4">CRO Number</td>
                <td className="px-6 py-3 text-sm text-gray-900">{nursingData.patient.cro}</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50 w-1/4">Patient Name</td>
                <td className="px-6 py-3 text-sm text-gray-900">{nursingData.patient.patient_name}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Age</td>
                <td className="px-6 py-3 text-sm text-gray-900">{nursingData.patient.age}</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Gender</td>
                <td className="px-6 py-3 text-sm text-gray-900">{nursingData.patient.gender}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Mobile</td>
                <td className="px-6 py-3 text-sm text-gray-900">{nursingData.patient.mobile}</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Contact</td>
                <td className="px-6 py-3 text-sm text-gray-900">{nursingData.patient.contact_number || '-'}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Category</td>
                <td className="px-6 py-3 text-sm text-gray-900">{nursingData.patient.category || '-'}</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Date</td>
                <td className="px-6 py-3 text-sm text-gray-900">{formatDate(nursingData.patient.date)}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Address</td>
                <td className="px-6 py-3 text-sm text-gray-900" colSpan={3}>{nursingData.patient.address || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Scan Information Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Scan Information</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Head</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {nursingData.scans.map((scan, index) => (
                <tr key={scan.s_id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-3 text-sm text-gray-900">{scan.s_name}</td>
                  <td className="px-6 py-3 text-sm text-gray-900">{scan.head_name || 'Not Assigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nursing Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Nursing Information</h2>
        </div>
        
        <div className="p-6">
          {/* Doctor Selection and CT Scan Report Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CT Scan Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value={0}>--Select Doctor--</option>
                {nursingData.doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.doctor_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CT Scan Report Date
              </label>
              <input
                type="date"
                value={ctScanReportDate}
                onChange={(e) => setCTScanReportDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Form Table */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">Examination</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">Retained</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">Report Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">Remark</th>
                </tr>
              </thead>
              <tbody>
                {/* CT Scan Row */}
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 bg-blue-50">CT-Scan</td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="flex space-x-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="ct"
                          value="Yes"
                          checked={ctScan === 'Yes'}
                          onChange={(e) => setCTScan(e.target.value)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">Yes</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="ct"
                          value="No"
                          checked={ctScan === 'No'}
                          onChange={(e) => setCTScan(e.target.value)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">No</span>
                      </label>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="date"
                      value={ctReportDate}
                      onChange={(e) => setCTReportDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={ctRemark}
                      onChange={(e) => setCTRemark(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Enter CT-Scan remarks..."
                    />
                  </td>
                </tr>
                
                {/* X-Ray Row */}
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 bg-green-50">X-Ray Film</td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="flex space-x-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="xray"
                          value="Yes"
                          checked={xRay === 'Yes'}
                          onChange={(e) => setXRay(e.target.value)}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm">Yes</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="xray"
                          value="No"
                          checked={xRay === 'No'}
                          onChange={(e) => setXRay(e.target.value)}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm">No</span>
                      </label>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="date"
                      value={xRayReportDate}
                      onChange={(e) => setXRayReportDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={xRayRemark}
                      onChange={(e) => setXRayRemark(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      placeholder="Enter X-Ray film remarks..."
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveReport}
              disabled={saving}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Data'}</span>
            </button>
            
            <button
              onClick={() => router.push('/doctor/ct-scan-doctor-list')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}