import React, { useRef, useEffect } from 'react';
import { APIPerformanceMetrics } from '../../types';

interface APILatencyChartProps {
  apiMetrics: APIPerformanceMetrics[];
}

const APILatencyChart: React.FC<APILatencyChartProps> = ({ apiMetrics }) => {
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

    // Chart dimensions
    const padding = 60;
    const chartWidth = rect.width - 2 * padding;
    const chartHeight = rect.height - 2 * padding;

    // Sort APIs by average latency for better visualization
    const sortedAPIs = [...apiMetrics].sort((a, b) => a.averageLatency - b.averageLatency);
    
    // Find max latency for scaling
    const maxLatency = Math.max(...sortedAPIs.map(api => api.p95Latency));
    const yScale = chartHeight / maxLatency;
    const barWidth = chartWidth / sortedAPIs.length;

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();

    // Draw Y-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = padding + chartHeight - (i * chartHeight / ySteps);
      const value = (i * maxLatency / ySteps).toFixed(0);
      ctx.fillText(`${value}ms`, padding - 10, y + 4);
      
      // Draw grid lines
      if (i > 0) {
        ctx.strokeStyle = '#f3f4f6';
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
      }
    }

    // Draw bars for each API
    sortedAPIs.forEach((api, index) => {
      const x = padding + index * barWidth;
      const barPadding = barWidth * 0.1;
      const actualBarWidth = barWidth - 2 * barPadding;

      // Average latency bar (darker)
      const avgHeight = api.averageLatency * yScale;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x + barPadding, padding + chartHeight - avgHeight, actualBarWidth * 0.6, avgHeight);

      // P95 latency bar (lighter)
      const p95Height = api.p95Latency * yScale;
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(x + barPadding + actualBarWidth * 0.6, padding + chartHeight - p95Height, actualBarWidth * 0.4, p95Height);

      // Median latency line
      const medianY = padding + chartHeight - (api.medianLatency * yScale);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + barPadding, medianY);
      ctx.lineTo(x + barPadding + actualBarWidth, medianY);
      ctx.stroke();
    });

    // Draw X-axis labels (API names)
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    sortedAPIs.forEach((api, index) => {
      const x = padding + index * barWidth + barWidth / 2;
      const shortName = api.endpointName.length > 8 ? 
        api.endpointName.substring(0, 8) + '...' : 
        api.endpointName;
      ctx.fillText(shortName, x, padding + chartHeight + 20);
    });

    // Draw legend
    const legendY = 20;
    const legendItems = [
      { color: '#3b82f6', label: 'Average' },
      { color: '#93c5fd', label: 'P95' },
      { color: '#ef4444', label: 'Median' }
    ];

    legendItems.forEach((item, index) => {
      const x = rect.width - 150 + index * 50;
      
      if (item.label === 'Median') {
        // Draw line for median
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, legendY);
        ctx.lineTo(x + 15, legendY);
        ctx.stroke();
      } else {
        // Draw rectangle for bars
        ctx.fillStyle = item.color;
        ctx.fillRect(x, legendY - 5, 15, 10);
      }
      
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, x + 20, legendY + 4);
    });

  }, [apiMetrics]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">API Latency Distribution</h3>
      <div className="relative h-64">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Latency metrics across all API endpoints. Lower values indicate better performance.
      </p>
    </div>
  );
};

export default APILatencyChart;