'use client';

export default function AdminPatientRegistrationNew() {
  // Redirect to reception patient registration
  if (typeof window !== 'undefined') {
    window.location.href = '/reception/patient-registration/new';
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to patient registration...</p>
      </div>
    </div>
  );
}