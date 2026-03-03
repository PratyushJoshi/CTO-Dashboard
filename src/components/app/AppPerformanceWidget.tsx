'use client';

import React, { useState, useEffect } from 'react';
import { AppPerformanceMetrics, AlertSeverity } from '../../types';
import { MockDataGenerator } from '../../mock/MockDataGenerator';

interface AppPerformanceWidgetProps {
  refreshInterval?: number;
}

const AppPerformanceWidget: React.FC<AppPerformanceWidgetProps> = ({
  refreshInterval = 30000 // 30 seconds default
}) => {
  const [appMetrics, setAppMetrics] = useState<AppPerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockGenerator = new MockDataGenerator();
    
    const fetchData = async () => {
      try {
        const metrics = mockGenerator.generateAppPerformanceMetrics();
        setAppMetrics(metrics);
      } catch (error) {
        console.error('Error fetching app performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalApps = appMetrics.length;
  const averageCrashRate = appMetrics.reduce((sum, app) => sum + app.crashRatePerHour, 0) / totalApps;
  const averageLoadTime = appMetrics.reduce((sum, app) => sum + app.averagePageLoadTime, 0) / totalApps;
  const criticalAlerts = appMetrics.reduce((sum, app) => 
    sum + app.thresholdBreaches.filter(breach => breach.severity === AlertSeverity.CRITICAL).length, 0
  );
  const healthyApps = appMetrics.filter(app => 
    app.crashRatePerHour < 1 && app.averagePageLoadTime < 3000 && app.thresholdBreaches.length === 0
  ).length;

  const getOverallStatus = () => {
    if (criticalAlerts > 0) return 'critical';
    if (averageCrashRate > 2 || averageLoadTime > 4000) return 'warning';
    if (averageCrashRate > 1 || averageLoadTime > 3000) return 'caution';
    return 'healthy';
  };

  const status = getOverallStatus();

  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      case 'caution': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getStatusBgColor = () => {
    switch (status) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'caution': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-green-50 border-green-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'critical': return 'Critical Issues';
      case 'warning': return 'Performance Issues';
      case 'caution': return 'Needs Attention';
      default: return 'All Systems Healthy';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow border-l-4 p-6 ${getStatusBgColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">App Performance</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()} bg-opacity-10`}>
          {getStatusText()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {averageCrashRate.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500">Avg Crashes/Hour</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {(averageLoadTime / 1000).toFixed(1)}s
          </div>
          <div className="text-sm text-gray-500">Avg Load Time</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Healthy Applications</span>
          <span className="font-medium text-green-600">
            {healthyApps}/{totalApps}
          </span>
        </div>
        
        {criticalAlerts > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Critical Alerts</span>
            <span className="font-medium text-red-600">{criticalAlerts}</span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Performance Status</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                status === 'healthy' ? 'bg-green-500' :
                status === 'caution' ? 'bg-yellow-500' :
                status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
              }`}></div>
              <span className={`font-medium ${getStatusColor()}`}>
                {status === 'healthy' ? 'Excellent' :
                 status === 'caution' ? 'Good' :
                 status === 'warning' ? 'Fair' : 'Poor'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Quick Actions</span>
          <div className="flex space-x-2">
            <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              View Details
            </button>
            <button className="text-xs text-gray-600 hover:text-gray-800 font-medium">
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPerformanceWidget;