'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  Hospital, 
  Users, 
  UserPlus, 
  FileText, 
  Calendar,
  Receipt,
  ClipboardList,
  Stethoscope,
  Monitor,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const roleNavigation = {
  'super_admin': [
    { name: 'Dashboard', href: '/super_admin', icon: LayoutDashboard },
    { name: 'Patient Report', href: '/super_admin/patient-report', icon: FileText },
    { name: 'Revenue Report', href: '/super_admin/revenue-report', icon: Receipt },
    { name: 'Console Report', href: '/super_admin/console-report', icon: Monitor },
    { 
      name: 'Doctor Report', 
      icon: Stethoscope,
      submenu: [
        { name: 'Pending Reports', href: '/super_admin/doctor-report/pending' },
        { name: 'View Report', href: '/super_admin/doctor-report/view' }
      ]
    }
  ],
  'admin': [
    { name: 'Hospital', href: '/admin/hospitals', icon: Hospital },
    { name: 'Category', href: '/admin/patient-category', icon: ClipboardList },
    { name: 'Patient Edit', href: '/admin/patient-modify', icon: UserPlus },
    { name: 'Patient Re Print', href: '/admin/patient-reprint-old', icon: Receipt },
    { 
      name: 'Report', 
      icon: FileText,
      submenu: [
        { name: 'Daily Report', href: '/admin/reports/daily' },
        { name: 'Appointment Report', href: '/admin/reports/appointment' },
        { name: 'Console Report', href: '/admin/reports/console' }
      ]
    },
    { 
      name: 'Add', 
      icon: UserPlus,
      submenu: [
        { name: 'Patient Registration (New)', href: '/admin/patient-registration/new' },
        { name: 'Patient Registration (List)', href: '/admin/patient-registration/list' }
      ]
    }
  ],
  'reception': [
    { name: 'Dashboard', href: '/reception', icon: LayoutDashboard },
    { name: 'Hospital', href: '/reception/hospitals', icon: Hospital },
    { name: 'Doctor', href: '/reception/doctors', icon: Users },
    { name: 'Scan', href: '/reception/scans', icon: Monitor },
    { name: 'Patient Re Print OLD', href: '/reception/patient-reprint-old', icon: Receipt },
    { name: 'Pending Patient', href: '/reception/pending-patient', icon: ClipboardList },
    { name: 'Patient Category', href: '/reception/patient-category', icon: ClipboardList },
    { 
      name: 'Patient Registration', 
      icon: UserPlus,
      submenu: [
        { name: 'Patient Registration (New)', href: '/reception/patient-registration/new' },
        { name: 'Patient Edit (New)', href: '/reception/patient-registration/edit' },
        { name: 'Patient Registration (Back - Entry)', href: '/reception/patient-registration/back-entry' },
        { name: 'Patient Registration (List)', href: '/reception/patient-registration/list' }
      ]
    },
    { 
      name: 'Voucher', 
      icon: Receipt,
      submenu: [
        { name: 'Vouchers', href: '/reception/voucher' },
        { name: 'Vouchers List', href: '/reception/voucher/list' }
      ]
    },
    { 
      name: 'Report Section', 
      icon: FileText,
      submenu: [
        { name: 'Daily Report', href: '/reception/reports/daily' },
        { name: 'Revenue Report', href: '/reception/reports/revenue' },
        { name: 'Appointment Report', href: '/reception/reports/appointment' }
      ]
    },
    { 
      name: 'Doctor Report Section', 
      icon: Stethoscope,
      submenu: [
        { name: 'Daily Report', href: '/reception/doctor-report/daily' }
      ]
    },
    { name: 'Patient Modify', href: '/reception/patient-modify', icon: UserPlus }
  ],
  'doctor': [
    { name: 'Dashboard', href: '/doctor', icon: LayoutDashboard },
    { name: 'Doctor', href: '/doctor/doctors', icon: Users },
    { 
      name: 'Patient Report', 
      icon: FileText,
      submenu: [
        { name: 'Pending Reports', href: '/doctor/reports/pending' },
        { name: 'View Report', href: '/doctor/reports/view' }
      ]
    }
  ],
  'console': [
    { name: 'Dashboard', href: '/console', icon: LayoutDashboard },
    { name: 'Dashboard After', href: '/console/dashboard-after', icon: LayoutDashboard },
    { 
      name: 'Console Report', 
      icon: Monitor,
      submenu: [
        { name: 'Daily Report', href: '/console/reports/daily' }
      ]
    }
  ],
  'nursing': [
    { name: 'Dashboard', href: '/nursing', icon: LayoutDashboard },
    { name: 'Nursing Registration', href: '/nursing/registration', icon: UserPlus },
    { name: 'Pending List', href: '/nursing/pending-list', icon: ClipboardList },
    { name: 'Doctor', href: '/nursing/doctors', icon: Users }
  ]
};

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const role = params?.role as string || 'reception';
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  
  const navigation = roleNavigation[role as keyof typeof roleNavigation] || roleNavigation.reception;

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  return (
    <div className="flex h-full w-64 flex-col bg-sky-900">
      <div className="flex h-16 shrink-0 items-center px-4">
        <h1 className="text-xl font-bold text-white">VDC - {role.toUpperCase()}</h1>
      </div>
      <nav className="flex flex-1 flex-col overflow-y-auto">
        <ul role="list" className="flex flex-1 flex-col gap-y-1 px-2">
          <li>
            <ul role="list" className="space-y-1">
              {navigation.map((item) => {
                if ('submenu' in item && item.submenu) {
                  const isOpen = openMenus.includes(item.name);
                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className="group flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-medium text-sky-100 hover:bg-sky-800 hover:text-white"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="flex-1 text-left">{item.name}</span>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {isOpen && (
                        <ul className="mt-1 space-y-1 pl-8">
                          {item.submenu.map((subItem) => {
                            const isActive = pathname === subItem.href;
                            return (
                              <li key={subItem.name}>
                                <Link
                                  href={subItem.href}
                                  className={`group flex gap-x-3 rounded-md p-2 text-sm font-medium ${
                                    isActive
                                      ? 'bg-sky-800 text-white'
                                      : 'text-sky-200 hover:text-white hover:bg-sky-800'
                                  }`}
                                >
                                  {subItem.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                } else {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm font-medium ${
                          isActive
                            ? 'bg-sky-800 text-white'
                            : 'text-sky-100 hover:text-white hover:bg-sky-800'
                        }`}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  );
                }
              })}
            </ul>
          </li>
          <li className="mt-auto">
            <button className="group flex w-full gap-x-3 rounded-md p-2 text-sm font-medium text-sky-200 hover:bg-sky-800 hover:text-white">
              <LogOut className="h-5 w-5 shrink-0" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}