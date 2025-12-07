'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, Stethoscope, UserCheck, Monitor, 
  Users, Calendar, FileText, BarChart3, 
  Hospital, Settings, ChevronDown, ChevronRight,
  Activity, ClipboardList, UserPlus, Search, Camera,
  Clock, Edit, Tag, RotateCcw, TrendingUp, Scan,
  Package, Plus, List, ArrowDown, ArrowUp
} from 'lucide-react';

interface SidebarProps {
  userRole: string;
  onClose?: () => void;
}

export default function RoleBasedSidebar({ userRole, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? []
        : [menuId]
    );
  };

  const roleConfigs = {
    superadmin: {
      icon: Shield,
      color: 'from-red-600 to-red-700',
      bgColor: 'bg-red-50',
      menus: [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/superadmin/dashboard' },
        { id: 'patient-report', label: 'Patient Report', icon: FileText, href: '/superadmin/patient-report' },
        { id: 'revenue-report', label: 'Revenue Report', icon: TrendingUp, href: '/superadmin/revenue-report' },
        { id: 'console-report', label: 'Console Report', icon: Monitor, href: '/superadmin/con-r-report' },
        { id: 'doctor-scan-report', label: 'Doctor Scan Report', icon: Stethoscope, href: '/superadmin/doctor-scan-report' },
        { 
          id: 'doctor-reports', 
          label: 'Doctor Reports', 
          icon: Stethoscope, 
          submenu: [
            { label: 'Pending Reports', href: '/superadmin/report-pending-list', icon: Clock },
            { label: 'View Reports', href: '/superadmin/view-report', icon: FileText }
          ]
        }
      ]
    },
    admin: {
      icon: Shield,
      color: 'from-sky-500 to-sky-600',
      bgColor: 'bg-sky-50',
      menus: [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/admin/dashboard' },
        { id: 'hospital', label: 'Hospital', icon: Hospital, href: '/admin/hospital' },
        { id: 'category', label: 'Category', icon: Tag, href: '/admin/category' },
        { id: 'scan-head', label: 'Scan Head Wise', icon: Scan, href: '/admin/scan-head' },
        { id: 'patient-edit', label: 'Patient Edit', icon: Edit, href: '/admin/patient-edit' },
        { id: 'patient-reprint', label: 'Patient Reprint', icon: FileText, href: '/admin/patient-reprint' },
        { 
          id: 'reports', 
          label: 'Reports', 
          icon: FileText, 
          submenu: [
            { label: 'Daily Report', href: '/admin/daily-revenue-report', icon: Calendar },
            { label: 'Appointment Report', href: '/admin/appointment-report', icon: ClipboardList },
            { label: 'Console Report', href: '/admin/console-report', icon: Monitor }
          ]
        },
        { 
          id: 'patient', 
          label: 'Add', 
          icon: UserPlus, 
          submenu: [
            { label: 'Patient Registration (New)', href: '/admin/patient-new', icon: UserPlus },
            { label: 'Patient Registration (List)', href: '/admin/patient-list', icon: ClipboardList }
          ]
        }
      ]
    },
    reception: {
      icon: UserCheck,
      color: 'from-sky-500 to-sky-600',
      bgColor: 'bg-sky-50',
      menus: [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/reception/dashboard' },
        { id: 'hospital', label: 'Hospital', icon: Hospital, href: '/reception/hospitals' },
        { id: 'doctor', label: 'Doctor', icon: Stethoscope, href: '/reception/doctors' },
        { id: 'scans', label: 'Scans', icon: Camera, href: '/reception/scans' },
        { id: 'patient-reprint-old', label: 'Patient Reprint OLD', icon: FileText, href: '/reception/patient-reprint-old' },
        { id: 'pending-patient', label: 'Pending Patient', icon: Clock, href: '/reception/pending-patient' },
        { id: 'patient-category', label: 'Patient Category', icon: Tag, href: '/reception/patient-category' },
        { 
          id: 'patient-registration', 
          label: 'Patient Registration', 
          icon: UserPlus, 
          submenu: [
            { label: 'Patient Registration (New)', href: '/reception/patient-registration/new', icon: UserPlus },
            { label: 'Patient Edit (New)', href: '/reception/patient-registration/edit', icon: Edit },
            { label: 'Patient Registration (Back-Entry)', href: '/reception/patient-registration/back-entry', icon: RotateCcw },
            { label: 'Patient Registration (List)', href: '/reception/patient-registration/list', icon: ClipboardList }
          ]
        },
        { 
          id: 'voucher', 
          label: 'Voucher', 
          icon: FileText, 
          submenu: [
            { label: 'Vouchers', href: '/reception/voucher', icon: FileText },
            { label: 'Vouchers List', href: '/reception/voucher/list', icon: ClipboardList }
          ]
        },
        { 
          id: 'reports', 
          label: 'Reports', 
          icon: BarChart3, 
          submenu: [
            { label: 'Daily Reports', href: '/reception/reports/daily', icon: Calendar },
            { label: 'Revenue Reports', href: '/reception/reports/revenue', icon: TrendingUp },
            { label: 'Appointment Reports', href: '/reception/reports/appointment', icon: ClipboardList }
          ]
        },
        { 
          id: 'doctor-report-section', 
          label: 'Doctor Report', 
          icon: Stethoscope, 
          submenu: [
            { label: 'Daily Reports', href: '/reception/doctor-report/daily', icon: Calendar }
          ]
        }//,
       // { id: 'patient-modify', label: 'Patient Modify', icon: Edit, href: '/reception/patient-modify' }
      ]
    },
    doctor: {
      icon: Stethoscope,
      color: 'from-emerald-600 to-emerald-700',
      bgColor: 'bg-emerald-50',
      menus: [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/doctor/dashboard' },
        { id: 'doctor', label: 'Patient In Queue', icon: Stethoscope, href: '/doctor/ct-scan-doctor-list' },
        { id: 'ct-scan-doctors', label: 'CT Scan Doctors', icon: UserPlus, href: '/doctor/ct-scan-doctors' },
        { 
          id: 'patient-report', 
          label: 'Patient Report', 
          icon: FileText, 
          submenu: [
            { label: 'Pending Reports', href: '/doctor/report-pending-list', icon: Clock },
            { label: 'View Reports', href: '/doctor/view-report', icon: FileText }
          ]
        }
      ]
    },
    console: {
      icon: Monitor,
      color: 'from-sky-500 to-sky-600',
      bgColor: 'bg-sky-50',
      menus: [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/console/dashboard' },
        { id: 'patient-queue', label: 'Patient In Queue', icon: Users, href: '/console' },
        { id: 'queue-after', label: 'Patient Queue - After', icon: Clock, href: '/console/queue-after' },
        { id: 'console-edit', label: 'Console Edit', icon: Edit, href: '/console/update' },
        { id: 'daily-report', label: 'Day Wise Report', icon: FileText, href: '/console/daily-report' },
        { id: 'detail-report', label: 'Detail Report', icon: ClipboardList, href: '/console/detail-report' }
      ]
    },
    inventory: {
      icon: Package,
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-50',
      menus: [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/inventory/dashboard' },
        { id: 'stock-list', label: 'Stock List', icon: List, href: '/inventory/stock' },
        { id: 'add-item', label: 'Add Item', icon: Plus, href: '/inventory/add' },
        { id: 'inward', label: 'Inward', icon: ArrowDown, href: '/inventory/inward' },
        { id: 'outward', label: 'Outward', icon: ArrowUp, href: '/inventory/outward' },
        { id: 'transactions', label: 'Transactions', icon: Activity, href: '/inventory/transactions' },
        { id: 'report', label: 'Report', icon: FileText, href: '/inventory/report' },
        { id: 'analysis', label: 'Analysis', icon: TrendingUp, href: '/inventory/analysis' }
      ]
    }
  };

  const config = roleConfigs[userRole as keyof typeof roleConfigs] || roleConfigs.superadmin;
  const RoleIcon = config.icon;

  return (
    <div className="w-64 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-white/20 h-screen flex flex-col">
      {/* Header */}
      <div className={`p-6 bg-gradient-to-r ${config.color} text-white sticky top-0 z-10`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <RoleIcon className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold capitalize">{userRole}</h2>
            <p className="text-white/80 text-sm">Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {config.menus.map((menu) => {
          const MenuIcon = menu.icon;
          const isActive = pathname === menu.href;
          const isExpanded = expandedMenus.includes(menu.id);
          const hasSubmenu = 'submenu' in menu && menu.submenu && menu.submenu.length > 0;

          return (
            <div key={menu.id}>
              {hasSubmenu ? (
                <button
                  onClick={() => toggleMenu(menu.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive || isExpanded
                      ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MenuIcon className="h-5 w-5" />
                    <span className="font-medium">{menu.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <Link
                  href={menu.href || '#'}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MenuIcon className="h-5 w-5" />
                  <span className="font-medium">{menu.label}</span>
                </Link>
              )}

              {/* Submenu */}
              {hasSubmenu && isExpanded && 'submenu' in menu && (
                <div className="ml-4 mt-2 space-y-1">
                  {menu.submenu?.map((submenuItem) => {
                    const SubmenuIcon = submenuItem.icon;
                    const isSubmenuActive = pathname === submenuItem.href;
                    
                    return (
                      <Link
                        key={submenuItem.href}
                        href={submenuItem.href}
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                          isSubmenuActive
                            ? `bg-gradient-to-r ${config.color} text-white shadow-md`
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <SubmenuIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{submenuItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}