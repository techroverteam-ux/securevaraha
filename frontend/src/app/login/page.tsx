'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hospital, User, Lock, Eye, EyeOff, Shield, Stethoscope, UserCheck, Monitor, Sparkles, Package } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const roles = [
    { id: 'superadmin', name: 'Super Admin', icon: Shield, color: 'from-red-500 to-red-600' },
    { id: 'admin', name: 'Admin', icon: Shield, color: 'from-blue-500 to-blue-600' },
    { id: 'reception', name: 'Reception', icon: UserCheck, color: 'from-rose-500 to-rose-600' },
    { id: 'doctor', name: 'Doctor', icon: Stethoscope, color: 'from-emerald-500 to-emerald-600' },
    { id: 'console', name: 'Console', icon: Monitor, color: 'from-violet-500 to-violet-600' },
    { id: 'inventory', name: 'Inventory', icon: Package, color: 'from-orange-500 to-orange-600' },
  ];

  const handleRoleSelect = (role: any) => {
    setSelectedRole(role.id);
    setFormData({ username: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://varahasdc.co.in/api';
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Route users based on their role from database
        switch(data.user.role) {
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
          case 'inventory':
            router.push('/inventory/dashboard');
            break;

          default:
            router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-2 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-4 items-center">
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left space-y-8">
            <div className="flex items-center justify-center lg:justify-start space-x-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl shadow-md">
                  <Hospital className="h-10 w-10 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Varaha SDC
                </h1>
                <p className="text-gray-500 text-lg font-medium">CT Scan Management System</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
              </div>
              <p className="text-gray-600 leading-relaxed max-w-lg">
                Secure access to CT scan management system.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-sm mx-auto">
            <div className="relative">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl mb-3">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">Sign In</h3>
                  <p className="text-gray-500 text-sm">Enter your credentials to access</p>
                </div>

                {/* Enhanced Role Selection */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {roles.map((role) => {
                    const IconComponent = role.icon;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleSelect(role)}
                        className={`group relative p-2.5 rounded-lg border transition-all duration-200 ${
                          selectedRole === role.id
                            ? `bg-gradient-to-r ${role.color} text-white border-transparent shadow-md`
                            : `bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600 hover:border-gray-300`
                        }`}
                      >
                        <div className="relative z-10">
                          <IconComponent className="h-5 w-5 mx-auto mb-1" />
                          <div className="text-xs font-medium">{role.name}</div>
                        </div>
                        {selectedRole === role.id && (
                          <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <div className="flex">
                      <div className="text-red-700 text-sm">{error}</div>
                    </div>
                  </div>
                )}

                {/* Username Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 block">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                      placeholder="Enter username"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 block">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Enhanced Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !selectedRole}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

                {/* Footer */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">Secure Connection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}