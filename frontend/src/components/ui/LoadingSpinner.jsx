import React from 'react';

/**
 * LoadingSpinner component for indicating loading states
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Spinner size (sm, md, lg)
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} The LoadingSpinner component
 */
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizes[size]} ${className}`} />
    </div>
  );
};

export default LoadingSpinner;
