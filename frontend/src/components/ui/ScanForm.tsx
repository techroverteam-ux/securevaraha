'use client';

import { FormInput, FormSelect, FormButton } from './FormComponents';
import Modal from './Modal';
import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

interface ScanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function ScanForm({ isOpen, onClose, onSubmit, initialData }: ScanFormProps) {
  const [formData, setFormData] = useState({
    scanName: '',
    films: '',
    contrast: 'No',
    totalScan: '1',
    estimateTime: 'Please select',
    charges: ''
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        scanName: initialData.scanName || '',
        films: initialData.films?.toString() || '',
        contrast: initialData.contrast || 'No',
        totalScan: initialData.totalScan?.toString() || '1',
        estimateTime: initialData.estimateTime || 'Please select',
        charges: initialData.charges?.toString() || ''
      });
    } else {
      setFormData({
        scanName: '',
        films: '',
        contrast: 'No',
        totalScan: '1',
        estimateTime: 'Please select',
        charges: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.scanName.trim()) newErrors.scanName = 'Scan name is required';
    if (!formData.films || parseInt(formData.films) < 1) newErrors.films = 'Films must be at least 1';
    if (!formData.charges || parseInt(formData.charges) < 1) newErrors.charges = 'Charges must be greater than 0';
    if (formData.estimateTime === 'Please select') newErrors.estimateTime = 'Please select estimate time';
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

  const contrastOptions = [
    { value: 'No', label: 'No' },
    { value: 'Yes', label: 'Yes' }
  ];

  const timeOptions = [
    { value: 'Please select', label: 'Please select' },
    { value: '2 Min', label: '2 Min' },
    { value: '5 Min', label: '5 Min' },
    { value: '10 Min', label: '10 Min' },
    { value: '15 Min', label: '15 Min' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-normal text-gray-800">Scan Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Scan Name"
            type="text"
            value={formData.scanName}
            onChange={(e) => setFormData({...formData, scanName: e.target.value})}
            placeholder="Scan Name"
            error={errors.scanName}
            required
          />
          
          <FormInput
            label="No of Films"
            type="number"
            value={formData.films}
            onChange={(e) => setFormData({...formData, films: e.target.value})}
            placeholder="Films"
            error={errors.films}
            required
          />

          <FormSelect
            label="Contrast"
            value={formData.contrast}
            onChange={(e) => setFormData({...formData, contrast: e.target.value})}
            options={contrastOptions}
          />

          <FormInput
            label="Total Scan"
            type="number"
            value={formData.totalScan}
            onChange={(e) => setFormData({...formData, totalScan: e.target.value})}
            placeholder="Total Scan"
            required
          />

          <FormSelect
            label="Estimate Time"
            value={formData.estimateTime}
            onChange={(e) => setFormData({...formData, estimateTime: e.target.value})}
            options={timeOptions}
            error={errors.estimateTime}
          />

          <FormInput
            label="Charges"
            type="number"
            value={formData.charges}
            onChange={(e) => setFormData({...formData, charges: e.target.value})}
            placeholder="Charges"
            error={errors.charges}
            required
          />

          <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
            <FormButton type="button" variant="secondary" onClick={onClose}>
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </FormButton>
            <FormButton type="submit">
              <Save className="h-4 w-4" />
              <span>Save Scan</span>
            </FormButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}