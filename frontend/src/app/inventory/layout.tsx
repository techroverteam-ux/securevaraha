'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';
import Header from '@/components/layout/Header';

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      // Force inventory role for inventory pages
      setUser({ ...parsedUser, admin_type: 'inventory' });
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full blur opacity-75"></div>
            <div className="relative w-32 h-32 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <RoleBasedSidebar userRole="inventory" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}