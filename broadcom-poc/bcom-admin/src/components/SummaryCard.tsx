import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, change, isPositive }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-primary-500'}`}>
          {change}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-2">vs. previous period</p>
    </div>
  );
};

export default SummaryCard;