import React from 'react';
import { BusinessAnalyticsMetrics } from '../../types';

interface DataPipelineHealthCardProps {
  pipeline: BusinessAnalyticsMetrics;
}

const DataPipelineHealthCard: React.FC<DataPipelineHealthCardProps> = ({ pipeline }) => {
  const { dataHealth, pipelineErrors } = pipeline;
  
  // Determine overall health status
  const getHealthStatus = () => {
    if (dataHealth.successRate >= 95 && dataHealth.dataQualityScore >= 95) {
      return { status: 'Healthy', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-800', borderColor: 'border-green-200' };
    } else if (dataHealth.successRate >= 90 && dataHealth.dataQualityScore >= 90) {
      return { status: 'Warning', color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-800', borderColor: 'border-yellow-200' };
    } else {
      return { status: 'Critical', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-800', borderColor: 'border-red-200' };
    }
  };

  const healthStatus = getHealthStatus();
  const activeErrors = pipelineErrors.filter(error => !error.resolved).length;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${healthStatus.borderColor} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {pipeline.pipelineName}
          </h3>
          <p className="text-sm text-gray-500">ID: {pipeline.pipelineId}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${healthStatus.bgColor} ${healthStatus.textColor}`}>
          {healthStatus.status}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Success Rate</p>
          <div className="flex items-center space-x-2">
            <p className="text-xl font-bold text-gray-900">
              {dataHealth.successRate.toFixed(1)}%
            </p>
            <div className={`w-2 h-2 rounded-full bg-${healthStatus.color}-500`}></div>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">Quality Score</p>
          <p className="text-xl font-bold text-gray-900">
            {dataHealth.dataQualityScore.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Data Health Metrics */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Data Freshness</span>
          <span className={`text-sm font-medium ${
            dataHealth.dataFreshness <= 5 ? 'text-green-600' : 
            dataHealth.dataFreshness <= 15 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {dataHealth.dataFreshness} min
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Processing Latency</span>
          <span className={`text-sm font-medium ${
            dataHealth.processingLatency <= 30 ? 'text-green-600' : 
            dataHealth.processingLatency <= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {dataHealth.processingLatency} min
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Records Processed</span>
          <span className="text-sm font-medium text-gray-900">
            {dataHealth.recordsProcessed.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Progress Bar for Success Rate */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Success Rate</span>
          <span>{dataHealth.successRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full bg-${healthStatus.color}-500`}
            style={{ width: `${dataHealth.successRate}%` }}
          ></div>
        </div>
      </div>

      {/* Active Errors */}
      {activeErrors > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-red-800">
              {activeErrors} Active Error{activeErrors !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {pipelineErrors
              .filter(error => !error.resolved)
              .slice(0, 2)
              .map((error) => (
                <p key={error.errorId} className="text-xs text-red-700 truncate">
                  {error.description}
                </p>
              ))}
            {activeErrors > 2 && (
              <p className="text-xs text-red-600">
                +{activeErrors - 2} more errors
              </p>
            )}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Last updated: {pipeline.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default DataPipelineHealthCard;