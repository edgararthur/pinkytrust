'use client';

import React from 'react';

interface DataVisualizationProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
  height?: number;
  className?: string;
}

export function DataVisualization({
  type,
  data,
  xKey,
  yKey,
  title,
  height = 300,
  className = ''
}: DataVisualizationProps) {
  // This is a placeholder component for data visualization
  // In a real implementation, you would use a charting library like Chart.js, D3, or Recharts

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <div className="bg-gray-100 rounded-lg p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-700 mb-2">
            {title || `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`}
          </div>
          <div className="text-sm text-gray-500">
            Chart visualization with {data.length} data points
          </div>
          <div className="mt-4 text-xs text-gray-400">
            {type.toUpperCase()} • {xKey} vs {yKey}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataVisualization; 