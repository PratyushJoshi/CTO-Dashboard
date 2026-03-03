import React from 'react';
import { APIPerformanceMetrics } from '../../types';

interface APIEndpointCardProps {
  apiMetric: APIPerformanceMetrics;
}

const APIEndpointCard: React.FC<APIEndpointCardProps> = ({ apiMetric }) => {
  const getStatusColor = (successRate: number, latency: number, uptime: number) => {
    if (successRate >= 98 && latency <= 200 && uptime >= 99.5) return 'green';
    if (successRate >= 95 && latency <= 500 && uptime >= 99) return 'yellow';
    return 'red';
  };

  const statusColor = getStatusColor(apiMetric.successRate, apiMetric.averageLatency, apiMetric.uptime);
  
  const statusColors = {
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200'
  };

  const statusDots = {
    green: 'bg-green-400',
    yellow: 'bg-yellow-400',
    red: 'bg-red-400'
  };

  const totalErrors = Object.values(apiMetric.errorsByStatusCode).reduce((sum, count) => sum + count, 0);

  return (
    <div className={`bg-white rounded-lg shadow border-2 ${statusColors[statusColor]} p-6 hover:shadow-lg transition-shadow`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${statusDots[statusColor]} mr-2`}></div>
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {apiMetric.endpointName}
          </h3>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {apiMetric.endpointId}
        </span>
      </div>

      {/* Success/Failure Rates */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Success Rate</span>
          <span className={`text-sm font-bold ${
            apiMetric.successRate >= 98 ? 'text-green-600' : 
            apiMetric.successRate >= 95 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {apiMetric.successRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              apiMetric.successRate >= 98 ? 'bg-green-500' : 
              apiMetric.successRate >= 95 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${apiMetric.successRate}%` }}
          ></div>
        </div>
      </div>

      {/* Latency Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">Avg</p>
          <p className="text-sm font-semibold text-gray-900">{Math.round(apiMetric.averageLatency)}ms</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Median</p>
          <p className="text-sm font-semibold text-gray-900">{Math.round(apiMetric.medianLatency)}ms</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">P95</p>
          <p className="text-sm font-semibold text-gray-900">{Math.round(apiMetric.p95Latency)}ms</p>
        </div>
      </div>

      {/* Traffic and Uptime */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Requests/min</p>
          <p className="text-sm font-semibold text-gray-900">{apiMetric.requestsPerMinute}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Uptime ({apiMetric.uptimeWindow})</p>
          <p className="text-sm font-semibold text-gray-900">{apiMetric.uptime.toFixed(2)}%</p>
        </div>
      </div>

      {/* Error Summary */}
      {totalErrors > 0 && (
        <div className="border-t pt-3">
          <p className="text-xs text-gray-500 mb-2">Recent Errors</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(apiMetric.errorsByStatusCode)
              .filter(([_, count]) => count > 0)
              .slice(0, 3)
              .map(([statusCode, count]) => (
                <span 
                  key={statusCode}
                  className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                >
                  {statusCode}: {count}
                </span>
              ))}
            {Object.keys(apiMetric.errorsByStatusCode).length > 3 && (
              <span className="text-xs text-gray-500">+more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default APIEndpointCard;