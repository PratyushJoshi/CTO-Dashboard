import React from 'react';
import { AIMetrics, AIModelStatus } from '../../types';

interface AIModelPerformanceCardProps {
  aiMetrics: AIMetrics[];
}

const AIModelPerformanceCard: React.FC<AIModelPerformanceCardProps> = ({ aiMetrics }) => {
  const getStatusColor = (status: AIModelStatus): string => {
    switch (status) {
      case AIModelStatus.DEPLOYED:
        return 'bg-green-100 text-green-800 border-green-200';
      case AIModelStatus.TRAINING:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case AIModelStatus.DEPRECATED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case AIModelStatus.FAILED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: AIModelStatus): string => {
    switch (status) {
      case AIModelStatus.DEPLOYED:
        return '✅';
      case AIModelStatus.TRAINING:
        return '🔄';
      case AIModelStatus.DEPRECATED:
        return '⚠️';
      case AIModelStatus.FAILED:
        return '❌';
      default:
        return '❓';
    }
  };

  const getDriftIndicator = (driftScore: number): { color: string; label: string } => {
    if (driftScore < 0.1) return { color: 'text-green-600', label: 'Low' };
    if (driftScore < 0.2) return { color: 'text-yellow-600', label: 'Medium' };
    return { color: 'text-red-600', label: 'High' };
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 0.95) return 'text-green-600';
    if (accuracy >= 0.90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">AI Model Performance</h2>
        <p className="text-sm text-gray-600 mt-1">
          Accuracy, inference times, and drift indicators for all AI models
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiMetrics.map((metric) => {
          const driftIndicator = getDriftIndicator(metric.driftScore);
          
          return (
            <div
              key={metric.modelId}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Model Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 truncate" title={metric.modelName}>
                    {metric.modelName}
                  </h3>
                  <p className="text-xs text-gray-500">{metric.version}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(metric.status)}`}>
                  <span className="mr-1">{getStatusIcon(metric.status)}</span>
                  {metric.status}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-3">
                {/* Accuracy */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Accuracy</span>
                    <span className={`text-sm font-bold ${getAccuracyColor(metric.accuracy)}`}>
                      {formatPercentage(metric.accuracy)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${
                        metric.accuracy >= 0.95 ? 'bg-green-500' :
                        metric.accuracy >= 0.90 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metric.accuracy * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Inference Time */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Inference Time</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatTime(metric.inferenceTime)}
                    </span>
                  </div>
                </div>

                {/* Drift Score */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Model Drift</span>
                    <span className={`text-sm font-semibold ${driftIndicator.color}`}>
                      {driftIndicator.label} ({formatPercentage(metric.driftScore)})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${
                        metric.driftScore < 0.1 ? 'bg-green-500' :
                        metric.driftScore < 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(metric.driftScore * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Performance Anomalies */}
                {metric.performanceAnomalies.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700 mb-1">Active Anomalies</p>
                    <div className="space-y-1">
                      {metric.performanceAnomalies.slice(0, 2).map((anomaly, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            anomaly.severity === 'critical' ? 'bg-red-500' :
                            anomaly.severity === 'high' ? 'bg-orange-500' :
                            anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></span>
                          <span className="text-gray-600 truncate" title={anomaly.description}>
                            {anomaly.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                      {metric.performanceAnomalies.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{metric.performanceAnomalies.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Models</p>
            <p className="text-lg font-semibold text-gray-900">{aiMetrics.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Deployed Models</p>
            <p className="text-lg font-semibold text-green-600">
              {aiMetrics.filter(m => m.status === AIModelStatus.DEPLOYED).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Accuracy</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatPercentage(
                aiMetrics.reduce((sum, m) => sum + m.accuracy, 0) / aiMetrics.length
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Models with High Drift</p>
            <p className="text-lg font-semibold text-red-600">
              {aiMetrics.filter(m => m.driftScore > 0.2).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModelPerformanceCard;