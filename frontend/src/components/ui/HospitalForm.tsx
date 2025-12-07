'use client';

import { FormInput, FormSelect, FormButton } from './FormComponents';
import Modal from './Modal';
import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

interface HospitalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function HospitalForm({ isOpen, onClose, onSubmit, initialData }: HospitalFormProps) {
  const [formData, setFormData] = useState({
    hospitalFullName: '',
    hospitalName: '',
    hospitalShortName: '',
    hospitalType: 'Private',
    address: '',
    phone: ''
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        hospitalFullName: initialData.hospital || '',
        hospitalName: initialData.hospital || '',
        hospitalShortName: initialData.shortName || '',
        hospitalType: initialData.type || 'Private',
        address: initialData.address || '',
        phone: initialData.contact || ''
      });
    } else {
      setFormData({
        hospitalFullName: '',
        hospitalName: '',
        hospitalShortName: '',
        hospitalType: 'Private',
        address: '',
        phone: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.hospitalFullName.trim()) newErrors.hospitalFullName = 'Hospital full name is required';
    if (!formData.hospitalShortName.trim()) newErrors.hospitalShortName = 'Hospital short name is required';
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
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

  const typeOptions = [
    { value: 'Private', label: 'Private' },
    { value: 'Government', label: 'Government' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-gray-800">{initialData ? 'Edit Hospital' : 'Add Hospital In Record'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Hospital Full Name"
            type="text"
            value={formData.hospitalFullName}
            onChange={(e) => setFormData({...formData, hospitalFullName: e.target.value})}
            error={errors.hospitalFullName}
            required
          />
          
          <FormInput
            label="Hospital Name"
            type="text"
            value={formData.hospitalName}
            onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
          />

          <FormInput
            label="Hospital Short Name"
            type="text"
            value={formData.hospitalShortName}
            onChange={(e) => setFormData({...formData, hospitalShortName: e.target.value})}
            error={errors.hospitalShortName}
            required
          />

          <FormSelect
            label="Hospital Type"
            value={formData.hospitalType}
            onChange={(e) => setFormData({...formData, hospitalType: e.target.value})}
            options={typeOptions}
          />

          <FormInput
            label="Address"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />

          <FormInput
            label="Phone Contact"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            error={errors.phone}
            placeholder="10 digit phone number"
          />

          <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
            <FormButton type="button" variant="secondary" onClick={onClose}>
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </FormButton>
            <FormButton type="submit">
              <Save className="h-4 w-4" />
              <span>{initialData ? 'Update Hospital' : 'Add Hospital'}</span>
            </FormButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}