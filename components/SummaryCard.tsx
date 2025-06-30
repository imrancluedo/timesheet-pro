import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  colorClass?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, colorClass }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      {colorClass ? (
         <p className={`mt-1 text-xs font-semibold rounded-full px-2 py-1 inline-block ${colorClass}`}>
            {value}
        </p>
      ) : (
        <p className="mt-1 text-2xl font-semibold text-slate-800">{value}</p>
      )}
    </div>
  );
};

export default SummaryCard;
