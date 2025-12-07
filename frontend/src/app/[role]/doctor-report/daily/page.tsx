'use client';

import Layout from '@/components/layout/Layout';
import { useParams } from 'next/navigation';

export default function DoctorReportDaily() {
  const params = useParams();
  const role = params.role as string;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">Doctor Report Daily - {role}</h1>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <p className="text-gray-600">Doctor daily report functionality will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
}