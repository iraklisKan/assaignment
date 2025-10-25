import React from 'react';

/**
 * Card component with Header and Content sub-components
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} The Card component
 */
const CardComponent = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Header sub-component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Header content
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} The CardHeader component
 */
const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card Content sub-component
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} The CardContent component
 */
const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

// Attach sub-components to Card
CardComponent.Header = CardHeader;
CardComponent.Content = CardContent;

export const Card = CardComponent;
export default Card;
