'use client';

import React, { useState, useEffect } from 'react';
import { AppPerformanceMetrics } from '../../types';
import { MockDataGenerator } from '../../mock/MockDataGenerator';
import AppCrashRateCard from './AppCrashRateCard';
import AppPageLoadChart from './AppPageLoadChart';
import AppDevicePerformance from './AppDevicePerformance';
import AppPerformanceTrends from './AppPerformanceTrends';
import AppPerformanceAlerts from './AppPerformanceAlerts';
import AppScreenPerformance from './AppScreenPerformance';

interface AppPerformanceDashboardProps {
  refreshInterval?: number;
}

const AppPerformanceDashboard: React.FC<AppPerformanceDashboardProps> = ({
  refreshInterval = 30000 // 30 seconds default
}) => {
  const [appMetrics, setAppMetrics] = useState<AppPerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const mockGenerator = new MockDataGenerator();
    
    const fetchAppPerformanceData = async () => {
      try {
        setError(null);
        const metrics = mockGenerator.generateAppPerformanceMetrics();
        setAppMetrics(metrics);
        setLastUpdated(new Date());
      } catch (err) {
        setError('Failed to fetch application performance data');
        console.error('Error fetching app performance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppPerformanceData();
    
    const interval = setInterval(fetchAppPerformanceData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Performance</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor application crash rates, page load times, and performance across devices
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">
              {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Alerts */}
      <AppPerformanceAlerts appMetrics={appMetrics} />

      {/* Crash Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appMetrics.map((app) => (
          <AppCrashRateCard key={app.applicationId} appMetric={app} />
        ))}
      </div>

      {/* Page Load Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppPageLoadChart appMetrics={appMetrics} />
        <AppScreenPerformance appMetrics={appMetrics} />
      </div>

      {/* Device Performance Segmentation */}
      <AppDevicePerformance appMetrics={appMetrics} />

      {/* Performance Trends */}
      <AppPerformanceTrends appMetrics={appMetrics} />
    </div>
  );
};

export default AppPerformanceDashboard;