import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return {
    ...state,
    execute,
  };
}

// Role-specific hooks
export function useSuperadminApi() {
  const { execute, ...state } = useApi();

  const getStats = useCallback(() => 
    execute(() => api.getSuperadminStats()), [execute]);

  const getPatientReport = useCallback((fromDate?: string, toDate?: string) => 
    execute(() => api.getSuperadminPatientReport(fromDate, toDate)), [execute]);

  return { ...state, getStats, getPatientReport };
}

export function useAdminApi() {
  const { execute, ...state } = useApi();

  const getStats = useCallback(() => 
    execute(() => api.getAdminStats()), [execute]);

  const getHospitals = useCallback(() => 
    execute(() => api.getAdminHospitals()), [execute]);

  const getDoctors = useCallback(() => 
    execute(() => api.getAdminDoctors()), [execute]);

  return { ...state, getStats, getHospitals, getDoctors };
}

export function useDoctorApi() {
  const { execute, ...state } = useApi();

  const getStats = useCallback(() => 
    execute(() => api.getDoctorStats()), [execute]);

  const getPendingPatients = useCallback(() => 
    execute(() => api.getDoctorPendingPatients()), [execute]);

  return { ...state, getStats, getPendingPatients };
}

export function useConsoleApi() {
  const { execute, ...state } = useApi();

  const getStats = useCallback(() => 
    execute(() => api.getConsoleStats()), [execute]);

  const getQueue = useCallback((status?: string) => 
    execute(() => api.getConsoleQueue(status)), [execute]);

  return { ...state, getStats, getQueue };
}

