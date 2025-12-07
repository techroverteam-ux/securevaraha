'use client';

import { FormInput, FormSelect, FormTextarea, FormButton } from './FormComponents';
import Modal from './Modal';
import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

interface DoctorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function DoctorForm({ isOpen, onClose, onSubmit, initialData }: DoctorFormProps) {
  const [formData, setFormData] = useState({
    doctorName: '',
    age: '',
    gender: 'Male',
    specialist: '',
    clinicName: '',
    contact: '',
    clinicAddress: '',
    registerAddress: ''
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        doctorName: initialData.dname || '',
        age: initialData.age || '',
        gender: initialData.gender || 'Male',
        specialist: initialData.specialization || '',
        clinicName: initialData.clinicName || '',
        contact: initialData.contact || '',
        clinicAddress: initialData.clinicAddress || '',
        registerAddress: initialData.address || ''
      });
    } else {
      setFormData({
        doctorName: '',
        age: '',
        gender: 'Male',
        specialist: '',
        clinicName: '',
        contact: '',
        clinicAddress: '',
        registerAddress: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.doctorName.trim()) newErrors.doctorName = 'Doctor name is required';
    if (!formData.age || parseInt(formData.age) < 18 || parseInt(formData.age) > 100) newErrors.age = 'Age must be between 18-100';
    if (!formData.contact.trim()) newErrors.contact = 'Contact is required';
    if (formData.contact && !/^[0-9]{10}$/.test(formData.contact)) newErrors.contact = 'Contact must be 10 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Doctor Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Doctor Name"
            type="text"
            value={formData.doctorName}
            onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
            placeholder="Doctor Name"
            error={errors.doctorName}
            required
          />
          
          <FormInput
            label="Age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            placeholder="Age"
            error={errors.age}
            required
          />

          <FormSelect
            label="Gender"
            value={formData.gender}
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
            options={genderOptions}
          />

          <FormInput
            label="Specialist"
            type="text"
            value={formData.specialist}
            onChange={(e) => setFormData({...formData, specialist: e.target.value})}
            placeholder="Specialist"
          />

          <FormInput
            label="Clinic Name"
            type="text"
            value={formData.clinicName}
            onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
            placeholder="Clinic Name"
          />

          <FormInput
            label="Contact No."
            type="tel"
            value={formData.contact}
            onChange={(e) => setFormData({...formData, contact: e.target.value})}
            placeholder="Contact"
            error={errors.contact}
            required
          />

          <FormTextarea
            label="Clinic Address"
            value={formData.clinicAddress}
            onChange={(e) => setFormData({...formData, clinicAddress: e.target.value})}
            placeholder="Clinic"
            rows={3}
          />

          <FormTextarea
            label="Register Address"
            value={formData.registerAddress}
            onChange={(e) => setFormData({...formData, registerAddress: e.target.value})}
            placeholder="Address"
            rows={3}
          />

          <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
            <FormButton type="button" variant="secondary" onClick={onClose}>
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </FormButton>
            <FormButton type="submit">
              <Save className="h-4 w-4" />
              <span>Save Doctor</span>
            </FormButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}