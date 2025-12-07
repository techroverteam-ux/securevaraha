import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block font-medium text-gray-600" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 font-normal focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 mobile-px-3 ${className}`}
        style={{ fontSize: '14px', fontFamily: 'sans-serif' }}
      />
      {error && <p className="text-red-600" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>{error}</p>}
    </div>
  );
};

export const FormSelect: React.FC<FormSelectProps> = ({ label, error, options, className = '', ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block font-medium text-gray-600" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
          {label}
        </label>
      )}
      <select
        {...props}
        className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 font-normal focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 mobile-px-3 ${className}`}
        style={{ fontSize: '14px', fontFamily: 'sans-serif' }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-gray-700">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>{error}</p>}
    </div>
  );
};

export const FormTextarea: React.FC<FormTextareaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block font-medium text-gray-600" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 font-normal focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 resize-vertical mobile-px-3 ${className}`}
        style={{ fontSize: '14px', fontFamily: 'sans-serif' }}
      />
      {error && <p className="text-red-600" style={{ fontSize: '12px', fontFamily: 'sans-serif' }}>{error}</p>}
    </div>
  );
};

export const FormButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseClasses = "px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 mobile-px-3 mobile-p-2";
  const variantClasses = variant === 'primary' 
    ? "bg-sky-500 text-white hover:bg-sky-600 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2" 
    : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2";
  
  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={{ fontSize: '14px', fontFamily: 'sans-serif' }}
    >
      {children}
    </button>
  );
};