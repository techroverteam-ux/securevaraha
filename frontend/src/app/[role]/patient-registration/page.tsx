'use client';

import Layout from '@/components/layout/Layout';
import { useState, useEffect } from 'react';
import { User, Plus, Calendar, Phone, MapPin } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Hospital {
  h_id: number;
  h_name: string;
  h_short: string;
}

interface Doctor {
  d_id: number;
  dname: string;
}

export default function PatientRegistration() {
  const params = useParams();
  const role = params.role as string;
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [formData, setFormData] = useState({
    pre: 'Mr.',
    patient_name: '',
    hospital_id: '',
    doctor_name: '',
    age: '',
    gender: 'Male',
    category: 'General',
    p_uni_id_submit: '',
    p_uni_id_name: '',
    contact_number: '',
    address: '',
    city: '',
    scan_type: '',
    total_scan: 1,
    amount: 0,
    discount: 0,
    amount_reci: 0,
    amount_due: 0,
    allot_date: '',
    allot_time: '',
    scan_date: '',
    admin_id: 1
  });

  useEffect(() => {
    fetchHospitals();
    fetchDoctors();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await fetch('/api/hospitals');
      const data = await response.json();
      setHospitals(data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({message, type});
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        showToast(`Patient registered successfully! CRO: ${result.cro}`, 'success');
        setFormData({
          pre: 'Mr.',
          patient_name: '',
          hospital_id: '',
          doctor_name: '',
          age: '',
          gender: 'Male',
          category: 'General',
          p_uni_id_submit: '',
          p_uni_id_name: '',
          contact_number: '',
          address: '',
          city: '',
          scan_type: '',
          total_scan: 1,
          amount: 0,
          discount: 0,
          amount_reci: 0,
          amount_due: 0,
          allot_date: '',
          allot_time: '',
          scan_date: '',
          admin_id: 1
        });
      } else {
        showToast('Failed to register patient', 'error');
      }
    } catch (error) {
      showToast('Error registering patient', 'error');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Patient Registration</h1>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Prefix</label>
              <select
                value={formData.pre}
                onChange={(e) => setFormData({...formData, pre: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
              >
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
                <option value="Dr.">Dr.</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Patient Name</label>
              <input
                type="text"
                value={formData.patient_name}
                onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Hospital</label>
              <select
                value={formData.hospital_id}
                onChange={(e) => setFormData({...formData, hospital_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
                required
              >
                <option value="">Select Hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.h_id} value={hospital.h_id}>
                    {hospital.h_name} ({hospital.h_short})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Doctor</label>
              <select
                value={formData.doctor_name}
                onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.d_id} value={doctor.d_id}>
                    {doctor.dname}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Age</label>
              <input
                type="text"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
                placeholder="e.g., 25Y or 6M"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
              >
                <option value="General">General</option>
                <option value="Chiranjeevi">Chiranjeevi</option>
                <option value="RGHS">RGHS</option>
                <option value="RTA">RTA</option>
                <option value="OPD FREE">OPD FREE</option>
                <option value="IPD FREE">IPD FREE</option>
                <option value="BPL/POOR">BPL/POOR</option>
                <option value="Sn. CITIZEN">Sn. CITIZEN</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Contact Number</label>
              <input
                type="tel"
                value={formData.contact_number}
                onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Scan Type</label>
              <input
                type="text"
                value={formData.scan_type}
                onChange={(e) => setFormData({...formData, scan_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
                placeholder="CT Scan, MRI, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => {
                  const amount = parseFloat(e.target.value) || 0;
                  const due = amount - formData.amount_reci;
                  setFormData({...formData, amount, amount_due: due});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Received Amount</label>
              <input
                type="number"
                value={formData.amount_reci}
                onChange={(e) => {
                  const received = parseFloat(e.target.value) || 0;
                  const due = formData.amount - received;
                  setFormData({...formData, amount_reci: received, amount_due: due});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Due Amount</label>
              <input
                type="number"
                value={formData.amount_due}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-black font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Appointment Date</label>
              <input
                type="date"
                value={formData.allot_date}
                onChange={(e) => setFormData({...formData, allot_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Appointment Time</label>
              <input
                type="time"
                value={formData.allot_time}
                onChange={(e) => setFormData({...formData, allot_time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black font-bold"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 text-black font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors"
              >
                <User className="h-4 w-4 mr-2 inline" />
                Register Patient
              </button>
            </div>
          </form>
        </div>

        {toast && (
          <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-8 py-4 rounded-lg shadow-xl z-[60] font-bold text-lg ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    </Layout>
  );
}