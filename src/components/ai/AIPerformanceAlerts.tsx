import React from 'react';
import { AIMetrics, AlertSeverity } from '../../types';

interface AIPerformanceAlertsProps {
  aiMetrics: AIMetrics[];
}

const AIPerformanceAlerts: React.FC<AIPerformanceAlertsProps> = ({ aiMetrics }) => {
  // Collect all performance anomalies from all models
  const allAnomalies = aiMetrics.flatMap(metric => 
    metric.performanceAnomalies.map(anomaly => ({
      ...anomaly,
      modelName: metric.modelName,
      modelId: metric.modelId,
      modelAccuracy: metric.accuracy,
      modelDrift: metric.driftScore
    }))
  );

  // Filter for unresolved anomalies and sort by severity and time
  const activeAnomalies = allAnomalies
    .filter(anomaly => !anomaly.resolved)
    .sort((a, b) => {
      // Sort by severity first (critical > high > medium > low)
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      // Then by detection time (most recent first)
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
    });

  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200';
      case AlertSeverity.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case AlertSeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case AlertSeverity.LOW:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return '🚨';
      case AlertSeverity.HIGH:
        return '⚠️';
      case AlertSeverity.MEDIUM:
        return '⚡';
      case AlertSeverity.LOW:
        return 'ℹ️';
      default:
        return '📊';
    }
  };

  const getAnomalyTypeIcon = (type: string): string => {
    switch (type) {
      case 'model_degradation':
        return '📉';
      case 'resource_spike':
        return '📈';
      case 'drift_detected':
        return '🔄';
      default:
        return '⚠️';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Generate additional alerts based on model metrics
  const generateMetricAlerts = () => {
    const metricAlerts: Array<{
      type: string;
      severity: AlertSeverity;
      description: string;
      detectedAt: Date;
      resolved: boolean;
      modelName: string;
      modelId: string;
      modelAccuracy: number;
      modelDrift: number;
    }> = [];
    
    aiMetrics.forEach(metric => {
      // Low accuracy alert
      if (metric.accuracy < 0.90) {
        metricAlerts.push({
          type: 'model_degradation',
          severity: metric.accuracy < 0.85 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
          description: `Model accuracy dropped to ${(metric.accuracy * 100).toFixed(1)}%`,
          detectedAt: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000), // Within last 2 hours
          resolved: false,
          modelName: metric.modelName,
          modelId: metric.modelId,
          modelAccuracy: metric.accuracy,
          modelDrift: metric.driftScore
        });
      }

      // High drift alert
      if (metric.driftScore > 0.25) {
        metricAlerts.push({
          type: 'drift_detected',
          severity: metric.driftScore > 0.3 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
          description: `High model drift detected: ${(metric.driftScore * 100).toFixed(1)}%`,
          detectedAt: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000), // Within last 4 hours
          resolved: false,
          modelName: metric.modelName,
          modelId: metric.modelId,
          modelAccuracy: metric.accuracy,
          modelDrift: metric.driftScore
        });
      }

      // High GPU usage alert
      if (metric.resourceUtilization.gpuUsage > 95) {
        metricAlerts.push({
          type: 'resource_spike',
          severity: AlertSeverity.MEDIUM,
          description: `GPU usage at ${metric.resourceUtilization.gpuUsage.toFixed(1)}%`,
          detectedAt: new Date(Date.now() - Math.random() * 1 * 60 * 60 * 1000), // Within last hour
          resolved: false,
          modelName: metric.modelName,
          modelId: metric.modelId,
          modelAccuracy: metric.accuracy,
          modelDrift: metric.driftScore
        });
      }

      // Budget alert
      const budgetUsagePercent = (metric.resourceUtilization.budgetUsed / metric.resourceUtilization.monthlyBudget) * 100;
      if (budgetUsagePercent > 90) {
        metricAlerts.push({
          type: 'resource_spike',
          severity: budgetUsagePercent > 95 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
          description: `Monthly budget ${budgetUsagePercent.toFixed(1)}% used`,
          detectedAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000), // Within last 6 hours
          resolved: false,
          modelName: metric.modelName,
          modelId: metric.modelId,
          modelAccuracy: metric.accuracy,
          modelDrift: metric.driftScore
        });
      }
    });

    return metricAlerts;
  };

  const combinedAlerts = [...activeAnomalies, ...generateMetricAlerts()]
    .sort((a, b) => {
      const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
    })
    .slice(0, 10); // Show top 10 alerts

  if (combinedAlerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">All AI Systems Healthy</h3>
            <p className="text-sm text-green-700 mt-1">No active performance anomalies detected</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Performance Alerts</h2>
            <p className="text-sm text-gray-600 mt-1">
              Active anomalies and performance issues across AI models
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {combinedAlerts.filter(a => a.severity === AlertSeverity.CRITICAL).length} Critical
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {combinedAlerts.filter(a => a.severity === AlertSeverity.HIGH).length} High
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {combinedAlerts.map((alert, index) => (
          <div
            key={`${alert.modelId}-${alert.type}-${index}`}
            className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <span className="text-lg">
                    {getSeverityIcon(alert.severity)}
                    {getAnomalyTypeIcon(alert.type)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{alert.modelName}</h3>
                    <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{alert.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs">
                    <span>Detected: {formatTimeAgo(alert.detectedAt)}</span>
                    <span>Accuracy: {(alert.modelAccuracy * 100).toFixed(1)}%</span>
                    <span>Drift: {(alert.modelDrift * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button className="text-xs px-3 py-1 bg-white bg-opacity-70 hover:bg-opacity-90 rounded transition-colors">
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Active Alerts</p>
            <p className="text-lg font-semibold text-gray-900">{combinedAlerts.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Critical Alerts</p>
            <p className="text-lg font-semibold text-red-600">
              {combinedAlerts.filter(a => a.severity === AlertSeverity.CRITICAL).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Models with Issues</p>
            <p className="text-lg font-semibold text-orange-600">
              {new Set(combinedAlerts.map(a => a.modelId)).size}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Response Time</p>
            <p className="text-lg font-semibold text-gray-900">
              {Math.round(Math.random() * 10 + 5)}m
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPerformanceAlerts;