'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, User, LogOut, Settings, Menu } from 'lucide-react';

interface HeaderProps {
  user: any;
  onMenuClick?: () => void;
}




export default function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'from-blue-500 to-blue-600',
      doctor: 'from-emerald-500 to-emerald-600',
      reception: 'from-rose-500 to-rose-600',
      console: 'from-violet-500 to-violet-600'
    };
    return colors[role as keyof typeof colors] || colors.admin;
  };

  return (
    <header className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-white/20 relative z-30 isolate">
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>
            
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients, reports..."
                className="pl-8 sm:pl-10 pr-4 py-2 w-48 sm:w-64 lg:w-80 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Button */}
            <button className="sm:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Search className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 sm:space-x-3 p-1 sm:p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className={`p-1.5 sm:p-2 bg-gradient-to-r ${getRoleColor(user.admin_type)} rounded-lg`}>
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.admin_type}</p>
                </div>
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[9999]">
                  {/* Mobile user info */}
                  <div className="sm:hidden px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.admin_type}</p>
                  </div>
                  
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}