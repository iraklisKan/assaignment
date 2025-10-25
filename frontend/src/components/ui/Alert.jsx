import React from 'react';

/**
 * Alert component for displaying messages
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Alert content
 * @param {string} [props.variant='info'] - Alert variant (success, error, warning, info)
 * @param {Function} [props.onClose] - Close handler function
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} The Alert component
 */
export const Alert = ({ children, variant = 'info', onClose, className = '' }) => {
  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  
  return (
    <div className={`px-4 py-3 rounded-lg border ${variants[variant]} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
