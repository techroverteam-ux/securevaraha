'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/superadmin/dashboard');
  }, [router]);

  return (
    <div className="p-6 flex items-center justify-center">
      <div className="text-lg text-gray-600">Redirecting to Super Admin Dashboard...</div>
    </div>
  );
}