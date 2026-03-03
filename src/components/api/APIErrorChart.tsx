import React, { useRef, useEffect } from 'react';
import { APIPerformanceMetrics } from '../../types';

interface APIErrorChartProps {
  apiMetrics: APIPerformanceMetrics[];
}

const APIErrorChart: React.FC<APIErrorChartProps> = ({ apiMetrics }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || apiMetrics.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Aggregate error counts by status code
    const errorCounts: Record<string, number> = {};
    apiMetrics.forEach(api => {
      Object.entries(api.errorsByStatusCode).forEach(([statusCode, count]) => {
        errorCounts[statusCode] = (errorCounts[statusCode] || 0) + count;
      });
    });

    const errorEntries = Object.entries(errorCounts)
      .filter(([_, count]) => count > 0)
      .sort(([, a], [, b]) => b - a); // Sort by count descending

    if (errorEntries.length === 0) {
      // No errors to display
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No errors detected', rect.width / 2, rect.height / 2);
      return;
    }

    // Chart dimensions
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) / 3;

    // Calculate total errors
    const totalErrors = errorEntries.reduce((sum, [_, count]) => sum + count, 0);

    // Color palette for different status codes
    const getStatusCodeColor = (statusCode: string): string => {
      const colors: Record<string, string> = {
        '400': '#f59e0b', // amber
        '401': '#ef4444', // red
        '403': '#dc2626', // red-600
        '404': '#f97316', // orange
        '429': '#8b5cf6', // violet
        '500': '#dc2626', // red-600
        '502': '#7c3aed', // violet-600
        '503': '#6366f1', // indigo
        '504': '#4f46e5'  // indigo-600
      };
      return colors[statusCode] || '#6b7280'; // gray as fallback
    };

    // Draw pie chart
    let currentAngle = -Math.PI / 2; // Start from top

    errorEntries.forEach(([statusCode, count], index) => {
      const sliceAngle = (count / totalErrors) * 2 * Math.PI;
      const color = getStatusCodeColor(statusCode);

      // Draw slice
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Draw slice border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(statusCode, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Draw legend
    const legendStartX = rect.width - 120;
    const legendStartY = 30;
    const legendItemHeight = 20;

    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Error Codes', legendStartX, legendStartY);

    errorEntries.forEach(([statusCode, count], index) => {
      const y = legendStartY + 25 + index * legendItemHeight;
      const color = getStatusCodeColor(statusCode);
      const percentage = ((count / totalErrors) * 100).toFixed(1);

      // Draw color box
      ctx.fillStyle = color;
      ctx.fillRect(legendStartX, y - 8, 12, 12);

      // Draw text
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${statusCode}: ${count} (${percentage}%)`, legendStartX + 18, y + 2);
    });

    // Draw center text with total
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Total Errors', centerX, centerY - 10);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(totalErrors.toString(), centerX, centerY + 10);

  }, [apiMetrics]);

  // Calculate error statistics
  const totalErrors = apiMetrics.reduce((sum, api) => 
    sum + Object.values(api.errorsByStatusCode).reduce((apiSum, count) => apiSum + count, 0), 0
  );

  const errorRate = apiMetrics.length > 0 ? 
    (totalErrors / apiMetrics.reduce((sum, api) => sum + api.requestsPerMinute, 0) * 100).toFixed(2) : '0.00';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Error Distribution by HTTP Status</h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">Error Rate</p>
          <p className="text-lg font-bold text-red-600">{errorRate}%</p>
        </div>
      </div>
      
      <div className="relative h-64">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      
      <p className="text-sm text-gray-600 mt-2">
        Distribution of HTTP error status codes across all API endpoints. 
        {totalErrors === 0 ? ' All APIs are operating without errors.' : ` Total: ${totalErrors} errors detected.`}
      </p>
    </div>
  );
};

export default APIErrorChart;