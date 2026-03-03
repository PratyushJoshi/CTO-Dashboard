import React from 'react';
import { useDataIntegration, useInfrastructureMetrics } from '../hooks/useDataIntegration';

/**
 * Example component demonstrating how to use the data integration system
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5 - Data integration and real-time updates
 */
export function DataIntegrationExample() {
  const {
    metrics,
    isLoading,
    error,
    lastUpdated,
    isRealTime,
    refreshMetrics,
    setRealTimeMode,
    activateScenario,
    deactivateScenario,
    testConnections,
    getDataQuality
  } = useDataIntegration();

  const {
    data: infrastructureData,
    isLoading: infraLoading,
    error: infraError,
    refresh: refreshInfra
  } = useInfrastructureMetrics();

  const handleTestConnections = async () => {
    try {
      const results = await testConnections();
      console.log('Connection test results:', results);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  const handleDataQualityCheck = async () => {
    try {
      const quality = await getDataQuality();
      console.log('Data quality metrics:', quality);
    } catch (error) {
      console.error('Data quality check failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Data Integration Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={refreshMetrics}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Data Integration Dashboard</h2>
        
        {/* Status Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Real-time Status</h3>
            <p className="text-blue-600">
              {isRealTime ? 'Active (30s refresh)' : 'Disabled'}
            </p>
            <button
              onClick={() => setRealTimeMode(!isRealTime)}
              className={`mt-2 px-3 py-1 rounded text-sm ${
                isRealTime 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isRealTime ? 'Disable' : 'Enable'} Real-time
            </button>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Last Updated</h3>
            <p className="text-green-600">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
            </p>
            <button
              onClick={refreshMetrics}
              className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Refresh Now
            </button>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Data Sources</h3>
            <p className="text-purple-600">
              {metrics?.aggregationStats ? 
                `${metrics.aggregationStats.successfulSources} / ${
                  metrics.aggregationStats.successfulSources + metrics.aggregationStats.failedSources
                } Connected` : 
                'Loading...'
              }
            </p>
            <button
              onClick={handleTestConnections}
              className="mt-2 px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              Test Connections
            </button>
          </div>
        </div>

        {/* Aggregation Statistics */}
        {metrics?.aggregationStats && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">Aggregation Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Metrics Processed:</span>
                <div className="font-semibold">{metrics.aggregationStats.totalMetricsProcessed}</div>
              </div>
              <div>
                <span className="text-gray-600">Timestamp Consistency:</span>
                <div className="font-semibold">{metrics.aggregationStats.timestampConsistency.toFixed(1)}%</div>
              </div>
              <div>
                <span className="text-gray-600">Data Loss:</span>
                <div className="font-semibold">{metrics.aggregationStats.dataLossPercentage.toFixed(2)}%</div>
              </div>
              <div>
                <span className="text-gray-600">Latency:</span>
                <div className="font-semibold">{metrics.aggregationStats.aggregationLatency}ms</div>
              </div>
            </div>
          </div>
        )}

        {/* Scenario Testing */}
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-yellow-800 mb-3">Test Scenarios</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => activateScenario('High Load Event')}
              className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
            >
              High Load
            </button>
            <button
              onClick={() => activateScenario('Infrastructure Issues')}
              className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
            >
              Infrastructure Issues
            </button>
            <button
              onClick={() => activateScenario('Data Pipeline Problems')}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Pipeline Problems
            </button>
            <button
              onClick={deactivateScenario}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Normal Operations
            </button>
          </div>
        </div>

        {/* Data Quality */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="font-semibold text-indigo-800 mb-3">Data Quality</h3>
          <button
            onClick={handleDataQualityCheck}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Check Data Quality
          </button>
        </div>
      </div>

      {/* Infrastructure Metrics Example */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Infrastructure Metrics Sample</h3>
        {infraLoading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ) : infraError ? (
          <div className="text-red-600">Error: {infraError}</div>
        ) : infrastructureData && infrastructureData.length > 0 ? (
          <div className="space-y-2">
            {infrastructureData.slice(0, 3).map((server, index) => (
              <div key={server.serverId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{server.serverName}</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    server.status === 'healthy' ? 'bg-green-100 text-green-800' :
                    server.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {server.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  CPU: {server.cpuUtilization.toFixed(1)}% | 
                  Memory: {server.memoryUtilization.toFixed(1)}%
                </div>
              </div>
            ))}
            <button
              onClick={refreshInfra}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Refresh Infrastructure Data
            </button>
          </div>
        ) : (
          <div className="text-gray-500">No infrastructure data available</div>
        )}
      </div>
    </div>
  );
}