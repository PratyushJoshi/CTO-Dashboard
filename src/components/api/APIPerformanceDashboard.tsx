import React, { useState, useEffect, useCallback } from 'react';
import { APIPerformanceMetrics } from '../../types';
import { MockDataGenerator } from '../../mock/MockDataGenerator';
import APIEndpointCard from './APIEndpointCard';
import APILatencyChart from './APILatencyChart';
import APIErrorChart from './APIErrorChart';
import APIUptimeDisplay from './APIUptimeDisplay';
import APIAlerts from './APIAlerts';

interface APIPerformanceDashboardProps {
  refreshInterval?: number;
}

const mockGenerator = new MockDataGenerator();

const APIPerformanceDashboard: React.FC<APIPerformanceDashboardProps> = ({ 
  refreshInterval = 30000 
}) => {
  const [apiMetrics, setApiMetrics] = useState<APIPerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAPIMetrics = useCallback(() => {
    try {
      const metrics = mockGenerator.generateAPIPerformanceMetrics();
      setApiMetrics(metrics);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching API metrics:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAPIMetrics();
    const interval = setInterval(fetchAPIMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, fetchAPIMetrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate aggregate metrics
  const totalAPIs = apiMetrics.length;
  const averageSuccessRate = apiMetrics.reduce((sum, api) => sum + api.successRate, 0) / totalAPIs;
  const averageLatency = apiMetrics.reduce((sum, api) => sum + api.averageLatency, 0) / totalAPIs;
  const totalRequests = apiMetrics.reduce((sum, api) => sum + api.requestsPerMinute, 0);

  // Identify problematic APIs
  const problematicAPIs = apiMetrics.filter(api => 
    api.successRate < 95 || api.averageLatency > 500 || api.uptime < 99
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Performance Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchAPIMetrics}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total APIs</p>
              <p className="text-2xl font-bold text-gray-900">{totalAPIs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${averageSuccessRate >= 98 ? 'bg-green-100' : averageSuccessRate >= 95 ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{averageSuccessRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${averageLatency <= 200 ? 'bg-green-100' : averageLatency <= 500 ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Latency</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(averageLatency)}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests/min</p>
              <p className="text-2xl font-bold text-gray-900">{totalRequests.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {problematicAPIs.length > 0 && (
        <APIAlerts problematicAPIs={problematicAPIs} />
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <APILatencyChart apiMetrics={apiMetrics} />
        <APIErrorChart apiMetrics={apiMetrics} />
      </div>

      {/* Uptime Display */}
      <APIUptimeDisplay apiMetrics={apiMetrics} />

      {/* API Endpoints Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">API Endpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apiMetrics.map((api) => (
            <APIEndpointCard key={api.endpointId} apiMetric={api} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default APIPerformanceDashboard;