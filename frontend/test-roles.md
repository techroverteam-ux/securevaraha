# CT Scan Management System Test Guide

## 5 Roles Implementation Complete

### 1. Super Admin (super_admin)
- **Login**: username: `super_admin`, password: `Super@Admin123`
- **Access**: Full system control
- **Menu Items**:
  - Dashboard
  - Hospitals
  - Doctors
  - Patients (New Patient, Patient List)
  - Nursing
  - Console
  - Reports
  - Settings

### 2. Admin (admin)
- **Login**: username: `admin`, password: `Admin@Varaha`
- **Access**: Management functions
- **Menu Items**:
  - Dashboard
  - Hospitals
  - Doctors
  - Patients (New Patient, Patient List)
  - Reports

### 3. Receptionist (reception)
- **Login**: username: `reception`, password: `Admin@321`
- **Access**: Patient registration and management
- **Menu Items**:
  - Dashboard
  - Patients (New Patient, Patient List)
  - Patient Care

### 4. Doctor (doctor)
- **Login**: username: `doctor`, password: `Admin@321`
- **Access**: Medical reports and patient data
- **Menu Items**:
  - Dashboard
  - Patient Queue
  - Medical Reports

### 5. Console (console)
- **Login**: username: `console`, password: `Admin@321`
- **Access**: Scan operations
- **Menu Items**:
  - Dashboard
  - Console (Scan Queue, Scan Console)
  - Scan Reports

## Data Sources
- **Primary**: MySQL Database
- **Fallback**: CSV Files (`varaosrc_hospital_management.csv`)
- **Default Admin Accounts**: Built into CSV service if not found in data

## Pages Created
- `/login` - Role-based login with 5 role selection
- `/dashboard` - Role-specific dashboards
- `/doctors` - Doctor management (Admin/Super Admin)
- `/console` - Scan queue management (Console)
- `/console/scan` - Scan operations (Console)
- `/nursing/care` - Patient care (Reception/Super Admin)
- `/settings` - System settings (Super Admin only)

## API Routes
- `/api/auth/login` - Authentication with CSV fallback
- `/api/doctors` - Doctor data from CSV
- `/api/nursing/queue` - Nursing queue from CSV
- `/api/console/queue` - Console queue from CSV
- `/api/dashboard/stats` - Dashboard statistics

## Testing Steps
1. Start the application: `npm run dev`
2. Navigate to `/login`
3. Test each role login
4. Verify role-specific menus and access
5. Test CSV data fallback functionality
6. Verify all pages load correctly for each role

## Demo Ready Features
✅ 5 Role-based authentication
✅ Role-specific menus and navigation
✅ CSV data integration
✅ Responsive UI design
✅ Dashboard with role-specific content
✅ Complete page functionality
✅ Data fallback system
✅ Professional UI/UX
✅ CT Scan focused branding