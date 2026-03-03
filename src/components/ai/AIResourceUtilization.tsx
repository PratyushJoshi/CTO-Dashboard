import React from 'react';
import { AIMetrics } from '../../types';

interface AIResourceUtilizationProps {
  aiMetrics: AIMetrics[];
}

const AIResourceUtilization: React.FC<AIResourceUtilizationProps> = ({ aiMetrics }) => {
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Calculate aggregate resource utilization
  const aggregateResources = aiMetrics.reduce((acc, metric) => {
    const resources = metric.resourceUtilization;
    return {
      totalGpuUsage: acc.totalGpuUsage + resources.gpuUsage,
      totalQueueLength: acc.totalQueueLength + resources.trainingQueueLength,
      totalServingCapacity: acc.totalServingCapacity + resources.servingCapacity,
      modelCount: acc.modelCount + 1,
      resources: [...acc.resources, {
        modelName: metric.modelName,
        modelId: metric.modelId,
        ...resources
      }]
    };
  }, {
    totalGpuUsage: 0,
    totalQueueLength: 0,
    totalServingCapacity: 0,
    modelCount: 0,
    resources: [] as Array<any>
  });

  const averageGpuUsage = aggregateResources.modelCount > 0 
    ? aggregateResources.totalGpuUsage / aggregateResources.modelCount 
    : 0;

  const getUtilizationColor = (usage: number): string => {
    if (usage < 60) return 'text-yellow-600';
    if (usage < 85) return 'text-green-600';
    return 'text-red-600';
  };

  const getUtilizationBarColor = (usage: number): string => {
    if (usage < 60) return 'bg-yellow-500';
    if (usage < 85) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getQueueColor = (queueLength: number): string => {
    if (queueLength === 0) return 'text-green-600';
    if (queueLength <= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">AI Resource Utilization</h2>
        <p className="text-sm text-gray-600 mt-1">
          GPU usage, training queues, and serving capacity across all AI models
        </p>
      </div>

      {/* Overall Resource Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* GPU Usage */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Average GPU Usage</h3>
            <span className={`text-lg font-bold ${getUtilizationColor(averageGpuUsage)}`}>
              {formatPercentage(averageGpuUsage)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${getUtilizationBarColor(averageGpuUsage)}`}
              style={{ width: `${averageGpuUsage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600">
            {averageGpuUsage < 60 ? 'Underutilized' : 
             averageGpuUsage < 85 ? 'Optimal' : 'High Usage'}
          </p>
        </div>

        {/* Training Queue */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Total Queue Length</h3>
            <span className={`text-lg font-bold ${getQueueColor(aggregateResources.totalQueueLength)}`}>
              {aggregateResources.totalQueueLength}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {aggregateResources.totalQueueLength === 0 ? 'No queued jobs' :
             aggregateResources.totalQueueLength <= 3 ? 'Normal queue' : 'High queue'}
          </p>
        </div>

        {/* Serving Capacity */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Total Serving Capacity</h3>
            <span className="text-lg font-bold text-gray-900">
              {formatNumber(aggregateResources.totalServingCapacity)}
            </span>
          </div>
          <p className="text-xs text-gray-600">requests per second</p>
        </div>
      </div>

      {/* Individual Model Resources */}
      <div>
        <h3 className="font-medium text-gray-900 mb-4">Resource Usage by Model</h3>
        <div className="space-y-3">
          {aggregateResources.resources
            .sort((a, b) => b.gpuUsage - a.gpuUsage)
            .slice(0, 8)
            .map((resource, index) => (
            <div key={resource.modelId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{resource.modelName}</h4>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`font-semibold ${getUtilizationColor(resource.gpuUsage)}`}>
                    GPU: {formatPercentage(resource.gpuUsage)}
                  </span>
                  <span className={`font-semibold ${getQueueColor(resource.trainingQueueLength)}`}>
                    Queue: {resource.trainingQueueLength}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* GPU Usage Bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">GPU Usage</span>
                    <span className={`text-sm font-semibold ${getUtilizationColor(resource.gpuUsage)}`}>
                      {formatPercentage(resource.gpuUsage)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${getUtilizationBarColor(resource.gpuUsage)}`}
                      style={{ width: `${resource.gpuUsage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Training Queue */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Training Queue</span>
                    <span className={`text-sm font-semibold ${getQueueColor(resource.trainingQueueLength)}`}>
                      {resource.trainingQueueLength} jobs
                    </span>
                  </div>
                </div>

                {/* Serving Capacity */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Serving Capacity</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatNumber(resource.servingCapacity)} RPS
                    </span>
                  </div>
                </div>

                {/* Budget Status */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Budget Used</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPercentage((resource.budgetUsed / resource.monthlyBudget) * 100)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resource Status Indicators */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-xs">
                  {resource.gpuUsage > 90 && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-1 bg-red-500"></div>
                      <span className="text-gray-600">High GPU Usage</span>
                    </div>
                  )}
                  
                  {resource.trainingQueueLength > 5 && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-1 bg-orange-500"></div>
                      <span className="text-gray-600">Long Training Queue</span>
                    </div>
                  )}
                  
                  {resource.gpuUsage < 30 && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-1 bg-yellow-500"></div>
                      <span className="text-gray-600">Underutilized</span>
                    </div>
                  )}
                  
                  {resource.budgetUsed / resource.monthlyBudget > 0.9 && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-1 bg-purple-500"></div>
                      <span className="text-gray-600">Budget Alert</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">High GPU Usage</p>
            <p className="text-lg font-semibold text-red-600">
              {aggregateResources.resources.filter(r => r.gpuUsage > 85).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Queued Jobs</p>
            <p className="text-lg font-semibold text-yellow-600">
              {aggregateResources.totalQueueLength}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Underutilized GPUs</p>
            <p className="text-lg font-semibold text-yellow-600">
              {aggregateResources.resources.filter(r => r.gpuUsage < 60).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Budget Alerts</p>
            <p className="text-lg font-semibold text-purple-600">
              {aggregateResources.resources.filter(r => (r.budgetUsed / r.monthlyBudget) > 0.9).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResourceUtilization;