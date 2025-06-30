import React from 'react';
import { ChartDataItem } from '../../types';

interface BarChartProps {
  title: string;
  data: ChartDataItem[];
  orientation?: 'vertical' | 'horizontal';
}

const BarChart: React.FC<BarChartProps> = ({ title, data, orientation = 'vertical' }) => {
  const maxValue = Math.max(...data.map(d => d.value), 0);
  const safeMaxValue = maxValue === 0 ? 1 : maxValue; // Avoid division by zero

  const VerticalChart = () => (
    <div className="flex justify-around items-end h-64 pt-4 space-x-2">
      {data.map(item => (
        <div key={item.label} className="flex flex-col items-center flex-1">
          <div className="relative w-full h-full flex items-end">
            <div
              className="w-3/4 mx-auto bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-colors"
              style={{ height: `${(item.value / safeMaxValue) * 100}%` }}
              title={`${item.label}: ${item.value}`}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate">{item.label}</p>
        </div>
      ))}
    </div>
  );

  const HorizontalChart = () => (
    <div className="space-y-3 p-4 h-64 overflow-y-auto">
        {data.map(item => (
            <div key={item.label} className="grid grid-cols-4 items-center gap-2">
                <p className="col-span-1 text-xs text-slate-600 truncate text-right pr-2">{item.label}</p>
                <div className="col-span-3 bg-slate-200 rounded-full h-4">
                    <div 
                        className="bg-teal-500 h-4 rounded-full flex items-center justify-end px-2"
                        style={{ width: `${(item.value / safeMaxValue) * 100}%` }}
                        title={`${item.label}: ${item.value}`}
                    >
                         <span className="text-white text-[10px] font-medium">{item.value}</span>
                    </div>
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow h-full">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {data.length > 0 ? (
        orientation === 'vertical' ? <VerticalChart /> : <HorizontalChart />
      ) : (
        <div className="flex items-center justify-center h-64">
            <p className="text-slate-500">No data available.</p>
        </div>
      )}
    </div>
  );
};

export default BarChart;
