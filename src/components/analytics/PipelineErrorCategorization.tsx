import React from 'react';
import { BusinessAnalyticsMetrics, PipelineErrorCategory, AlertSeverity } from '../../types';

interface PipelineErrorCategorizationProps {
  analyticsData: BusinessAnalyticsMetrics[];
}

const PipelineErrorCategorization: React.FC<PipelineErrorCategorizationProps> = ({ analyticsData }) => {
  // Aggregate all errors by category
  const errorStats = analyticsData.reduce((acc, pipeline) => {
    pipeline.pipelineErrors.forEach(error => {
      if (!acc[error.category]) {
        acc[error.category] = {
          total: 0,
          resolved: 0,
          active: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        };
      }
      
      acc[error.category].total += 1;
      if (error.resolved) {
        acc[error.category].resolved += 1;
      } else {
        acc[error.category].active += 1;
      }
      
      // Count by severity
      switch (error.severity) {
        case AlertSeverity.CRITICAL:
          acc[error.category].critical += 1;
          break;
        case AlertSeverity.HIGH:
          acc[error.category].high += 1;
          break;
        case AlertSeverity.MEDIUM:
          acc[error.category].medium += 1;
          break;
        case AlertSeverity.LOW:
          acc[error.category].low += 1;
          break;
      }
    });
    return acc;
  }, {} as Record<PipelineErrorCategory, {
    total: number;
    resolved: number;
    active: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }>);

  const totalErrors = Object.values(errorStats).reduce((sum, stats) => sum + stats.total, 0);
  const totalActiveErrors = Object.values(errorStats).reduce((sum, stats) => sum + stats.active, 0);
  const totalResolvedErrors = Object.values(errorStats).reduce((sum, stats) => sum + stats.resolved, 0);

  const getCategoryIcon = (category: PipelineErrorCategory) => {
    switch (category) {
      case PipelineErrorCategory.DATA_QUALITY:
        return '🔍';
      case PipelineErrorCategory.TRANSFORMATION_FAILURE:
        return '⚙️';
      case PipelineErrorCategory.CONNECTIVITY_PROBLEM:
        return '🔌';
      case PipelineErrorCategory.RESOURCE_EXHAUSTION:
        return '💾';
      default:
        return '❗';
    }
  };

  const getCategoryDescription = (category: PipelineErrorCategory) => {
    switch (category) {
      case PipelineErrorCategory.DATA_QUALITY:
        return 'Data validation and quality issues';
      case PipelineErrorCategory.TRANSFORMATION_FAILURE:
        return 'ETL transformation and processing errors';
      case PipelineErrorCategory.CONNECTIVITY_PROBLEM:
        return 'Network and connection issues';
      case PipelineErrorCategory.RESOURCE_EXHAUSTION:
        return 'Memory and compute resource limits';
      default:
        return 'Other pipeline errors';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Pipeline Error Analysis</h3>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Errors</p>
            <p className="text-lg font-bold text-gray-900">{totalErrors}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-lg font-bold text-red-600">{totalActiveErrors}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-lg font-bold text-green-600">{totalResolvedErrors}</p>
          </div>
        </div>
      </div>

      {/* Error Categories */}
      <div className="space-y-4 mb-6">
        {Object.entries(errorStats).map(([category, stats]) => {
          const categoryKey = category as PipelineErrorCategory;
          const resolutionRate = stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0;
          
          return (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(categoryKey)}</span>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 capitalize">
                      {category.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getCategoryDescription(categoryKey)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">total errors</p>
                </div>
              </div>

              {/* Error Status */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active:</span>
                  <span className={`text-sm font-medium ${stats.active > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {stats.active}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Resolved:</span>
                  <span className="text-sm font-medium text-green-600">{stats.resolved}</span>
                </div>
              </div>

              {/* Resolution Rate Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Resolution Rate</span>
                  <span>{resolutionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      resolutionRate >= 80 ? 'bg-green-500' : 
                      resolutionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${resolutionRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Severity Breakdown */}
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Critical: {stats.critical}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>High: {stats.high}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Medium: {stats.medium}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Low: {stats.low}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Errors */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-md font-medium text-gray-900 mb-4">Recent Active Errors</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {analyticsData
            .flatMap(pipeline => 
              pipeline.pipelineErrors
                .filter(error => !error.resolved)
                .map(error => ({ ...error, pipelineName: pipeline.pipelineName }))
            )
            .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
            .slice(0, 5)
            .map((error) => (
              <div key={error.errorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getSeverityColor(error.severity)}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {error.description}
                    </p>
                    <p className="text-xs text-gray-600">
                      {error.pipelineName} • {error.occurredAt.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  error.severity === AlertSeverity.CRITICAL ? 'bg-red-100 text-red-800' :
                  error.severity === AlertSeverity.HIGH ? 'bg-orange-100 text-orange-800' :
                  error.severity === AlertSeverity.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {error.severity}
                </div>
              </div>
            ))}
        </div>
        
        {totalActiveErrors === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No active errors</p>
            <p className="text-sm text-gray-400">All pipeline errors have been resolved</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineErrorCategorization;