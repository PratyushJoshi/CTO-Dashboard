import React, { useState, useEffect } from 'react';
import { APIPerformanceMetrics } from '../../types';
import { MockDataGenerator } from '../../mock/MockDataGenerator';

const mockGenerator = new MockDataGenerator();

export function APIPerformanceWidget() {
  const [apiMetrics, setApiMetrics] = useState<APIPerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      try {
        const metrics = mockGenerator.generateAPIPerformanceMetrics();
        setApiMetrics(metrics);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching API metrics:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Calculate summary metrics
  const totalAPIs = apiMetrics.length;
  const averageSuccessRate = apiMetrics.reduce((sum, api) => sum + api.successRate, 0) / totalAPIs;
  const averageLatency = apiMetrics.reduce((sum, api) => sum + api.averageLatency, 0) / totalAPIs;
  const problematicAPIs = apiMetrics.filter(api => 
    api.successRate < 95 || api.averageLatency > 500 || api.uptime < 99
  ).length;

  // Get top 5 APIs by request volume
  const topAPIs = [...apiMetrics]
    .sort((a, b) => b.requestsPerMinute - a.requestsPerMinute)
    .slice(0, 5);

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          API Performance Overview
        </h3>
        <a 
          href="/api-performance" 
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View Details →
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Total APIs */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalAPIs}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total APIs</div>
        </div>

        {/* Average Success Rate */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            averageSuccessRate >= 98 ? 'text-green-600' : 
            averageSuccessRate >= 95 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {averageSuccessRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Success Rate</div>
        </div>

        {/* Average Latency */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            averageLatency <= 200 ? 'text-green-600' : 
            averageLatency <= 500 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {Math.round(averageLatency)}ms
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg Latency</div>
        </div>

        {/* Issues */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            problematicAPIs === 0 ? 'text-green-600' : 
            problematicAPIs <= 2 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {problematicAPIs}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Issues</div>
        </div>
      </div>

      {/* Top APIs by Traffic */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Top APIs by Traffic</h4>
        {topAPIs.map((api, index) => (
          <div key={api.endpointId} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 dark:text-gray-400 w-4">#{index + 1}</span>
              <span className="text-gray-900 dark:text-white truncate max-w-32">
                {api.endpointName}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-600 dark:text-gray-400">
                {api.requestsPerMinute}/min
              </span>
              <div className={`w-2 h-2 rounded-full ${
                api.successRate >= 98 && api.averageLatency <= 200 ? 'bg-green-500' :
                api.successRate >= 95 && api.averageLatency <= 500 ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
            </div>
          </div>
        ))}
      </div>

      {/* Alert if there are issues */}
      {problematicAPIs > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              {problematicAPIs} API{problematicAPIs > 1 ? 's' : ''} need{problematicAPIs === 1 ? 's' : ''} attention
            </span>
          </div>
        </div>
      )}
    </div>
  );
}