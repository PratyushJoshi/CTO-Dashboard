'use client';

import React from 'react';
import { AppPerformanceMetrics } from '../../types';

interface AppScreenPerformanceProps {
  appMetrics: AppPerformanceMetrics[];
}

const AppScreenPerformance: React.FC<AppScreenPerformanceProps> = ({ appMetrics }) => {
  // Aggregate screen performance data across all applications
  const aggregateScreenData = () => {
    const screenMap = new Map<string, {
      totalLoadTime: number;
      totalRenderTime: number;
      count: number;
      applications: string[];
    }>();

    appMetrics.forEach(app => {
      app.screenLoadTimes.forEach(screen => {
        const existing = screenMap.get(screen.screenName);
        
        if (existing) {
          existing.totalLoadTime += screen.loadTime;
          existing.totalRenderTime += screen.renderTime;
          existing.count += 1;
          if (!existing.applications.includes(app.applicationName)) {
            existing.applications.push(app.applicationName);
          }
        } else {
          screenMap.set(screen.screenName, {
            totalLoadTime: screen.loadTime,
            totalRenderTime: screen.renderTime,
            count: 1,
            applications: [app.applicationName]
          });
        }
      });
    });

    return Array.from(screenMap.entries()).map(([screenName, data]) => ({
      screenName,
      averageLoadTime: Math.round(data.totalLoadTime / data.count),
      averageRenderTime: Math.round(data.totalRenderTime / data.count),
      applicationCount: data.applications.length,
      applications: data.applications
    })).sort((a, b) => b.averageLoadTime - a.averageLoadTime); // Sort by load time descending
  };

  const screenData = aggregateScreenData();

  const getPerformanceColor = (loadTime: number) => {
    if (loadTime < 1000) return 'text-green-600';
    if (loadTime < 2000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBarColor = (loadTime: number) => {
    if (loadTime < 1000) return 'bg-green-500';
    if (loadTime < 2000) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerformanceLabel = (loadTime: number) => {
    if (loadTime < 1000) return 'Fast';
    if (loadTime < 2000) return 'Moderate';
    return 'Slow';
  };

  const formatTime = (timeMs: number) => {
    if (timeMs < 1000) {
      return `${timeMs}ms`;
    }
    return `${(timeMs / 1000).toFixed(1)}s`;
  };

  if (screenData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Screen Performance</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          No screen performance data available
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalScreens = screenData.length;
  const averageLoadTime = screenData.reduce((sum, screen) => sum + screen.averageLoadTime, 0) / totalScreens;
  const fastScreens = screenData.filter(screen => screen.averageLoadTime < 1000).length;
  const slowScreens = screenData.filter(screen => screen.averageLoadTime >= 2000).length;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Screen Performance</h3>
        <div className="text-sm text-gray-500">
          {totalScreens} screen types
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{fastScreens}</div>
          <div className="text-sm text-gray-500">Fast (&lt;1s)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{totalScreens - fastScreens - slowScreens}</div>
          <div className="text-sm text-gray-500">Moderate (1-2s)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{slowScreens}</div>
          <div className="text-sm text-gray-500">Slow (&gt;2s)</div>
        </div>
      </div>

      {/* Screen Performance List */}
      <div className="space-y-4">
        {screenData.map((screen, index) => (
          <div key={screen.screenName} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{screen.screenName}</h4>
                  <p className="text-sm text-gray-500">
                    Used in {screen.applicationCount} application{screen.applicationCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getPerformanceColor(screen.averageLoadTime)}`}>
                  {formatTime(screen.averageLoadTime)}
                </div>
                <div className="text-sm text-gray-500">
                  {getPerformanceLabel(screen.averageLoadTime)}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Load Time</span>
                  <span className="font-medium">{formatTime(screen.averageLoadTime)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getPerformanceBarColor(screen.averageLoadTime)}`}
                    style={{ 
                      width: `${Math.min(100, Math.max(10, (3000 - screen.averageLoadTime) / 3000 * 100))}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Render Time</span>
                  <span className="font-medium">{formatTime(screen.averageRenderTime)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getPerformanceBarColor(screen.averageRenderTime)}`}
                    style={{ 
                      width: `${Math.min(100, Math.max(10, (1000 - screen.averageRenderTime) / 1000 * 100))}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Applications */}
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Applications:</span>
              <div className="flex flex-wrap gap-1">
                {screen.applications.map((app, appIndex) => (
                  <span key={appIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Insights */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Performance Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Average Load Time:</span>
            <span className="ml-2 font-medium">{formatTime(Math.round(averageLoadTime))}</span>
          </div>
          <div>
            <span className="text-gray-600">Slowest Screen:</span>
            <span className="ml-2 font-medium text-red-600">
              {screenData[0]?.screenName} ({formatTime(screenData[0]?.averageLoadTime || 0)})
            </span>
          </div>
        </div>
        
        {slowScreens > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-yellow-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Performance Optimization Needed
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {slowScreens} screen{slowScreens !== 1 ? 's' : ''} {slowScreens === 1 ? 'is' : 'are'} loading slowly (&gt;2s). 
                  Consider optimizing these screens to improve user experience.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppScreenPerformance;