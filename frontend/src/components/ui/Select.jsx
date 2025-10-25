import React from 'react';

/**
 * Select dropdown component with label and error support
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.label] - Select label
 * @param {string} [props.error] - Error message to display
 * @param {React.ReactNode} props.children - Select options
 * @param {string} [props.className=''] - Additional CSS classes for select
 * @param {string} [props.containerClassName=''] - Additional CSS classes for container
 * @returns {JSX.Element} The Select component
 */
export const Select = ({ 
  label, 
  error, 
  children,
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
      <select
        className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;
