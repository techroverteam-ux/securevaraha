import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent = ({ toast, onRemove }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-700" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-700" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-700" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-700" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`flex items-center p-4 border rounded-lg shadow-lg ${getStyles()} animate-in slide-in-from-right duration-300`}>
      {getIcon()}
      <span className="ml-3 text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-3 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Toast component for displaying individual toasts
const Toast = ({ message, type, isVisible, onClose }: {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
}) => {
  if (!isVisible) return null;
  
  const toast = {
    id: 'single-toast',
    type,
    message
  };
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <ToastComponent toast={toast} onRemove={onClose} />
    </div>
  );
};

export default ToastComponent;
// Custom hook that provides the expected API for compatibility
const useToastCompat = () => {
  const [toast, setToast] = useState({
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    isVisible: false
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  return { toast, showToast, hideToast };
};

export { Toast };
export { useToastCompat as useToast };
export type { Toast as ToastType } from '../../hooks/useToast';