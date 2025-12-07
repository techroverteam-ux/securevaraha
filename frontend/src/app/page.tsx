'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hospital, Shield, Users, Activity, BarChart3, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Route users based on their role
        switch(user.role || user.admin_type) {
          case 'superadmin':
            router.push('/superadmin/dashboard');
            break;
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'doctor':
            router.push('/doctor/dashboard');
            break;
          case 'reception':
            router.push('/reception/dashboard');
            break;
          case 'console':
            router.push('/console/dashboard');
            break;

          default:
            router.push('/dashboard');
        }
      } catch (error) {
        // If user data is corrupted, clear it and stay on landing page
        localStorage.removeItem('user');
      }
    }
  }, [router]);

  const features = [
    { icon: Shield, title: 'Secure Access', desc: 'Enterprise-grade security with role-based authentication', color: 'from-blue-500 to-blue-600' },
    { icon: Users, title: 'Multi-Role System', desc: 'Admin, Doctor, Nurse, and Console management', color: 'from-emerald-500 to-emerald-600' },
    { icon: Activity, title: 'Real-time Monitoring', desc: 'Live system status and patient tracking', color: 'from-violet-500 to-violet-600' },
    { icon: BarChart3, title: 'Advanced Analytics', desc: 'Comprehensive reports and insights', color: 'from-amber-500 to-amber-600' }
  ];

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-64 h-64 bg-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="relative">
                <div className="p-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl shadow-lg">
                  <Hospital className="h-16 w-16 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Varaha SDC
                </h1>
                <p className="text-gray-500 text-2xl font-medium">CT Scan Management System</p>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
                <h2 className="text-4xl font-bold text-gray-900">Modern Healthcare Management</h2>
                <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
              </div>
              <p className="text-xl text-gray-600 leading-relaxed">
                Experience the future of hospital administration with our secure, intuitive, and powerful platform designed for modern healthcare professionals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <button
                  onClick={() => router.push('/login')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center space-x-2">
                    <span className="text-lg">Access System</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Secure SSL Connection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}