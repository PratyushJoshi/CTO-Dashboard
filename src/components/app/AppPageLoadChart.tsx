'use client';

import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { AppPerformanceMetrics } from '../../types';

interface AppPageLoadChartProps {
  appMetrics: AppPerformanceMetrics[];
}

const AppPageLoadChart: React.FC<AppPageLoadChartProps> = ({ appMetrics }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || appMetrics.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Prepare data for the chart
    const labels = appMetrics.map(app => app.applicationName);
    const pageLoadTimes = appMetrics.map(app => app.averagePageLoadTime);

    // Color coding based on performance
    const backgroundColors = pageLoadTimes.map(time => {
      if (time < 2000) return 'rgba(34, 197, 94, 0.8)'; // Green - Fast
      if (time < 4000) return 'rgba(251, 191, 36, 0.8)'; // Yellow - Moderate
      return 'rgba(239, 68, 68, 0.8)'; // Red - Slow
    });

    const borderColors = pageLoadTimes.map(time => {
      if (time < 2000) return 'rgba(34, 197, 94, 1)';
      if (time < 4000) return 'rgba(251, 191, 36, 1)';
      return 'rgba(239, 68, 68, 1)';
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Average Page Load Time (ms)',
            data: pageLoadTimes,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Application Page Load Performance',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                if (value === null || value === undefined) return '';
                const performance = value < 2000 ? 'Fast' : value < 4000 ? 'Moderate' : 'Slow';
                return `${value.toLocaleString()}ms (${performance})`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Load Time (milliseconds)'
            },
            ticks: {
              callback: function(value) {
                return `${value}ms`;
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Applications'
            }
          }
        },
        elements: {
          bar: {
            borderWidth: 2,
          }
        }
      }
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [appMetrics]);

  if (appMetrics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Load Performance</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No application performance data available
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalApps = appMetrics.length;
  const averageLoadTime = appMetrics.reduce((sum, app) => sum + app.averagePageLoadTime, 0) / totalApps;
  const fastApps = appMetrics.filter(app => app.averagePageLoadTime < 2000).length;
  const slowApps = appMetrics.filter(app => app.averagePageLoadTime >= 4000).length;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Page Load Performance</h3>
        <div className="text-sm text-gray-500">
          Avg: {Math.round(averageLoadTime)}ms
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{fastApps}</div>
          <div className="text-sm text-gray-500">Fast (&lt;2s)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{totalApps - fastApps - slowApps}</div>
          <div className="text-sm text-gray-500">Moderate (2-4s)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{slowApps}</div>
          <div className="text-sm text-gray-500">Slow (&gt;4s)</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>

      {/* Performance Guidelines */}
      <div className="mt-4 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>Fast: &lt;2s</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span>Moderate: 2-4s</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>Slow: &gt;4s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPageLoadChart;