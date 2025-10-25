import React from 'react';

/**
 * Table component for displaying tabular data
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string[]} props.headers - Array of table header labels
 * @param {React.ReactNode} props.children - Table body rows
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} The Table component
 */
export const Table = ({ headers, children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
