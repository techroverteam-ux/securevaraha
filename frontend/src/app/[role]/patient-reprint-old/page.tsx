'use client';

import Layout from '@/components/layout/Layout';
import CROSearchForm from '@/components/ui/CROSearchForm';
import { useParams } from 'next/navigation';

export default function PatientReprintOld() {
  const params = useParams();
  const role = params.role as string;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Patient Re Print OLD - {role}</h1>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Welcome to Patient Re-Print</span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <CROSearchForm />
        </div>
      </div>
    </Layout>
  );
}