import React from 'react';

/**
 * Badge component for status indicators
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} [props.variant='default'] - Badge variant (success, danger, warning, info, default)
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} The Badge component
 */
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-gray-100 text-gray-800',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
