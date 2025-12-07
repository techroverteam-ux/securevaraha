'use client';

import { useState, useEffect } from 'react';
import { User, ChevronRight } from 'lucide-react';

interface LastPatient {
  cro: string;
  patient_name: string;
}

export default function LastEnrolledPatient() {
  const [lastPatient, setLastPatient] = useState<LastPatient | null>(null);

  useEffect(() => {
    fetchLastPatient();
  }, []);

  const fetchLastPatient = async () => {
    try {
      const response = await fetch('https://varahasdc.co.in/api/reception/patients/last-enrolled');
      if (response.ok) {
        const data = await response.json();
        setLastPatient(data.data);
      }
    } catch (error) {
      console.error('Error fetching last patient:', error);
    }
  };

  if (!lastPatient) return null;

  return (
    <div className="bg-blue-600 bg-opacity-20 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center space-x-2 text-white">
        <User className="h-4 w-4" />
        <span className="text-sm font-medium text-white">Last Enrolled Patient</span>
        <ChevronRight className="h-3 w-3 text-white" />
        <span className="text-sm font-bold text-white">{lastPatient.cro}</span>
        <ChevronRight className="h-3 w-3 text-white" />
        <span className="text-sm font-medium text-white">{lastPatient.patient_name}</span>
      </div>
    </div>
  );
}