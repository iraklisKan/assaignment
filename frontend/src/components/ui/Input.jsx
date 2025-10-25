import React from 'react';

/**
 * Input component with label, error, and helper text support
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.label] - Input label
 * @param {string} [props.error] - Error message to display
 * @param {string} [props.helperText] - Helper text to display below input
 * @param {string} [props.className=''] - Additional CSS classes for input
 * @param {string} [props.containerClassName=''] - Additional CSS classes for container
 * @returns {JSX.Element} The Input component
 */
export const Input = ({ 
  label, 
  error, 
  helperText,
  className = '',
  containerClassName = '',
  ...props 
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
