import React from 'react';

/**
 * EmptyState component for displaying empty states
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.icon] - Icon to display
 * @param {string} props.title - Empty state title
 * @param {string} [props.description] - Empty state description
 * @param {React.ReactNode} [props.action] - Action button or element
 * @returns {JSX.Element} The EmptyState component
 */
export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="flex justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
