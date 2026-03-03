import React from 'react';
import { APIPerformanceMetrics } from '../../types';

interface APIUptimeDisplayProps {
  apiMetrics: APIPerformanceMetrics[];
}

const APIUptimeDisplay: React.FC<APIUptimeDisplayProps> = ({ apiMetrics }) => {
  // Sort APIs by uptime (lowest first to highlight issues)
  const sortedAPIs = [...apiMetrics].sort((a, b) => a.uptime - b.uptime);

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return 'text-green-600 bg-green-50';
    if (uptime >= 99.5) return 'text-green-600 bg-green-50';
    if (uptime >= 99.0) return 'text-yellow-600 bg-yellow-50';
    if (uptime >= 98.0) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getUptimeStatus = (uptime: number) => {
    if (uptime >= 99.9) return 'Excellent';
    if (uptime >= 99.5) return 'Good';
    if (uptime >= 99.0) return 'Fair';
    if (uptime >= 98.0) return 'Poor';
    return 'Critical';
  };

  const getUptimeBarColor = (uptime: number) => {
    if (uptime >= 99.9) return 'bg-green-500';
    if (uptime >= 99.5) return 'bg-green-400';
    if (uptime >= 99.0) return 'bg-yellow-400';
    if (uptime >= 98.0) return 'bg-orange-400';
    return 'bg-red-500';
  };

  // Calculate overall uptime statistics
  const averageUptime = apiMetrics.reduce((sum, api) => sum + api.uptime, 0) / apiMetrics.length;
  const criticalAPIs = apiMetrics.filter(api => api.uptime < 99.0).length;
  const excellentAPIs = apiMetrics.filter(api => api.uptime >= 99.9).length;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">API Uptime Status</h3>
        <div className="flex space-x-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600">Average Uptime</p>
            <p className="text-lg font-bold text-gray-900">{averageUptime.toFixed(2)}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Excellent (≥99.9%)</p>
            <p className="text-lg font-bold text-green-600">{excellentAPIs}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Critical (&lt;99%)</p>
            <p className="text-lg font-bold text-red-600">{criticalAPIs}</p>
          </div>
        </div>
      </div>

      {/* Uptime Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAPIs.map((api) => (
          <div key={api.endpointId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* API Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {api.endpointName}
                </h4>
                <p className="text-xs text-gray-500">{api.endpointId}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUptimeColor(api.uptime)}`}>
                {getUptimeStatus(api.uptime)}
              </div>
            </div>

            {/* Uptime Percentage */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Uptime ({api.uptimeWindow})</span>
                <span className="text-sm font-bold text-gray-900">{api.uptime.toFixed(3)}%</span>
              </div>
              
              {/* Uptime Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUptimeBarColor(api.uptime)}`}
                  style={{ width: `${Math.max(api.uptime, 0)}%` }}
                ></div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-500">Success Rate</p>
                <p className="font-medium text-gray-900">{api.successRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-500">Avg Latency</p>
                <p className="font-medium text-gray-900">{Math.round(api.averageLatency)}ms</p>
              </div>
            </div>

            {/* Downtime Calculation */}
            {api.uptime < 100 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">
                  Estimated downtime: {((100 - api.uptime) * 0.24).toFixed(1)} min/day
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rolling Time Window Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Rolling Time Window</h4>
            <p className="text-sm text-blue-700 mt-1">
              Uptime percentages are calculated over a {apiMetrics[0]?.uptimeWindow || '24h'} rolling window. 
              This provides a real-time view of API availability and helps identify recent issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIUptimeDisplay;