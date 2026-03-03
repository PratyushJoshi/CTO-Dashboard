import React from 'react';
import { AIMetrics } from '../../types';

interface AIDeploymentMetricsProps {
  aiMetrics: AIMetrics[];
}

const AIDeploymentMetrics: React.FC<AIDeploymentMetricsProps> = ({ aiMetrics }) => {
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateBarColor = (rate: number): string => {
    if (rate >= 95) return 'bg-green-500';
    if (rate >= 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRollbackColor = (frequency: number): string => {
    if (frequency <= 0.1) return 'text-green-600';
    if (frequency <= 0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calculate aggregate deployment metrics
  const aggregateMetrics = aiMetrics.reduce((acc, metric) => {
    const deployment = metric.deploymentMetrics;
    return {
      totalSuccessRate: acc.totalSuccessRate + deployment.successRate,
      totalRollbackFrequency: acc.totalRollbackFrequency + deployment.rollbackFrequency,
      totalDeploymentTime: acc.totalDeploymentTime + deployment.deploymentTime,
      modelCount: acc.modelCount + 1,
      recentDeployments: [...acc.recentDeployments, {
        modelName: metric.modelName,
        modelId: metric.modelId,
        ...deployment
      }]
    };
  }, {
    totalSuccessRate: 0,
    totalRollbackFrequency: 0,
    totalDeploymentTime: 0,
    modelCount: 0,
    recentDeployments: [] as Array<any>
  });

  const averageSuccessRate = aggregateMetrics.modelCount > 0 
    ? aggregateMetrics.totalSuccessRate / aggregateMetrics.modelCount 
    : 0;

  const averageRollbackFrequency = aggregateMetrics.modelCount > 0 
    ? aggregateMetrics.totalRollbackFrequency / aggregateMetrics.modelCount 
    : 0;

  const averageDeploymentTime = aggregateMetrics.modelCount > 0 
    ? aggregateMetrics.totalDeploymentTime / aggregateMetrics.modelCount 
    : 0;

  // Sort deployments by most recent
  const sortedDeployments = aggregateMetrics.recentDeployments
    .sort((a, b) => new Date(b.lastDeployment).getTime() - new Date(a.lastDeployment).getTime());

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">AI Deployment Metrics</h2>
        <p className="text-sm text-gray-600 mt-1">
          Deployment success rates, rollback frequency, and deployment times
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Success Rate */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Average Success Rate</h3>
            <span className={`text-lg font-bold ${getSuccessRateColor(averageSuccessRate)}`}>
              {formatPercentage(averageSuccessRate)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getSuccessRateBarColor(averageSuccessRate)}`}
              style={{ width: `${averageSuccessRate}%` }}
            ></div>
          </div>
        </div>

        {/* Rollback Frequency */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Avg Rollback Frequency</h3>
            <span className={`text-lg font-bold ${getRollbackColor(averageRollbackFrequency)}`}>
              {averageRollbackFrequency.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-600">rollbacks per deployment</p>
        </div>

        {/* Deployment Time */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Avg Deployment Time</h3>
            <span className="text-lg font-bold text-gray-900">
              {formatDuration(averageDeploymentTime)}
            </span>
          </div>
          <p className="text-xs text-gray-600">average time to deploy</p>
        </div>
      </div>

      {/* Detailed Deployment List */}
      <div>
        <h3 className="font-medium text-gray-900 mb-4">Recent Deployments</h3>
        <div className="space-y-3">
          {sortedDeployments.slice(0, 8).map((deployment, index) => (
            <div key={deployment.modelId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{deployment.modelName}</h4>
                  <p className="text-sm text-gray-600">
                    Deployment ID: {deployment.deploymentId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last Deployment</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(deployment.lastDeployment).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Success Rate */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">Success Rate</span>
                    <span className={`text-sm font-semibold ${getSuccessRateColor(deployment.successRate)}`}>
                      {formatPercentage(deployment.successRate)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${getSuccessRateBarColor(deployment.successRate)}`}
                      style={{ width: `${deployment.successRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Rollback Frequency */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Rollback Frequency</span>
                    <span className={`text-sm font-semibold ${getRollbackColor(deployment.rollbackFrequency)}`}>
                      {deployment.rollbackFrequency.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Deployment Time */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Deployment Time</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDuration(deployment.deploymentTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-1 ${
                      deployment.successRate >= 95 ? 'bg-green-500' :
                      deployment.successRate >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-gray-600">
                      {deployment.successRate >= 95 ? 'Excellent' :
                       deployment.successRate >= 85 ? 'Good' : 'Needs Attention'}
                    </span>
                  </div>
                  
                  {deployment.rollbackFrequency > 0.3 && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-1 bg-orange-500"></div>
                      <span className="text-gray-600">High Rollback Rate</span>
                    </div>
                  )}
                  
                  {deployment.deploymentTime > 30 && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-1 bg-blue-500"></div>
                      <span className="text-gray-600">Long Deployment Time</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Models</p>
            <p className="text-lg font-semibold text-gray-900">{aggregateMetrics.modelCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">High Success Rate</p>
            <p className="text-lg font-semibold text-green-600">
              {sortedDeployments.filter(d => d.successRate >= 95).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Low Rollback Rate</p>
            <p className="text-lg font-semibold text-green-600">
              {sortedDeployments.filter(d => d.rollbackFrequency <= 0.1).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fast Deployments</p>
            <p className="text-lg font-semibold text-blue-600">
              {sortedDeployments.filter(d => d.deploymentTime <= 15).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDeploymentMetrics;