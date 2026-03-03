import React, { useState } from 'react';
import { APIPerformanceMetrics } from '../../types';

interface APIAlertsProps {
  problematicAPIs: APIPerformanceMetrics[];
}

const APIAlerts: React.FC<APIAlertsProps> = ({ problematicAPIs }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const getAlertSeverity = (api: APIPerformanceMetrics) => {
    if (api.successRate < 90 || api.averageLatency > 1000 || api.uptime < 98) {
      return 'critical';
    }
    if (api.successRate < 95 || api.averageLatency > 500 || api.uptime < 99) {
      return 'high';
    }
    return 'medium';
  };

  const getAlertMessage = (api: APIPerformanceMetrics) => {
    const issues = [];
    
    if (api.successRate < 95) {
      issues.push(`Low success rate: ${api.successRate.toFixed(1)}%`);
    }
    if (api.averageLatency > 500) {
      issues.push(`High latency: ${Math.round(api.averageLatency)}ms`);
    }
    if (api.uptime < 99) {
      issues.push(`Low uptime: ${api.uptime.toFixed(2)}%`);
    }

    return issues.join(', ');
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700'
        };
      case 'high':
        return {
          container: 'bg-orange-50 border-orange-200',
          icon: 'text-orange-600',
          title: 'text-orange-800',
          message: 'text-orange-700'
        };
      default:
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700'
        };
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'high':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const dismissAlert = (apiId: string) => {
    setDismissedAlerts(prev => new Set([...Array.from(prev), apiId]));
  };

  const visibleAlerts = problematicAPIs.filter(api => !dismissedAlerts.has(api.endpointId));

  if (visibleAlerts.length === 0) {
    return null;
  }

  // Group alerts by severity
  const alertsBySeverity = visibleAlerts.reduce((acc, api) => {
    const severity = getAlertSeverity(api);
    if (!acc[severity]) acc[severity] = [];
    acc[severity].push(api);
    return acc;
  }, {} as Record<string, APIPerformanceMetrics[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">API Performance Alerts</h2>
        <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {visibleAlerts.length} Active
        </span>
      </div>

      {/* Critical Alerts */}
      {alertsBySeverity.critical && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-red-800">Critical Issues</h3>
          {alertsBySeverity.critical.map((api) => {
            const severity = 'critical';
            const styles = getSeverityStyles(severity);
            return (
              <div key={api.endpointId} className={`border rounded-lg p-4 ${styles.container}`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${styles.icon}`}>
                    {getSeverityIcon(severity)}
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className={`text-sm font-medium ${styles.title}`}>
                      {api.endpointName} - Critical Performance Degradation
                    </h4>
                    <p className={`text-sm mt-1 ${styles.message}`}>
                      {getAlertMessage(api)}
                    </p>
                    <div className="mt-2 flex space-x-4 text-xs">
                      <span>Requests/min: {api.requestsPerMinute}</span>
                      <span>Last updated: {api.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissAlert(api.endpointId)}
                    className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* High Priority Alerts */}
      {alertsBySeverity.high && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-orange-800">High Priority Issues</h3>
          {alertsBySeverity.high.map((api) => {
            const severity = 'high';
            const styles = getSeverityStyles(severity);
            return (
              <div key={api.endpointId} className={`border rounded-lg p-4 ${styles.container}`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${styles.icon}`}>
                    {getSeverityIcon(severity)}
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className={`text-sm font-medium ${styles.title}`}>
                      {api.endpointName} - Performance Issues Detected
                    </h4>
                    <p className={`text-sm mt-1 ${styles.message}`}>
                      {getAlertMessage(api)}
                    </p>
                    <div className="mt-2 flex space-x-4 text-xs">
                      <span>Requests/min: {api.requestsPerMinute}</span>
                      <span>Last updated: {api.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissAlert(api.endpointId)}
                    className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Medium Priority Alerts */}
      {alertsBySeverity.medium && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-yellow-800">Monitoring Alerts</h3>
          {alertsBySeverity.medium.map((api) => {
            const severity = 'medium';
            const styles = getSeverityStyles(severity);
            return (
              <div key={api.endpointId} className={`border rounded-lg p-4 ${styles.container}`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${styles.icon}`}>
                    {getSeverityIcon(severity)}
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className={`text-sm font-medium ${styles.title}`}>
                      {api.endpointName} - Performance Warning
                    </h4>
                    <p className={`text-sm mt-1 ${styles.message}`}>
                      {getAlertMessage(api)}
                    </p>
                    <div className="mt-2 flex space-x-4 text-xs">
                      <span>Requests/min: {api.requestsPerMinute}</span>
                      <span>Last updated: {api.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissAlert(api.endpointId)}
                    className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alert Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Alert Thresholds</h4>
            <p className="text-sm text-gray-600 mt-1">
              Critical: Success rate &lt;90%, Latency &gt;1000ms, Uptime &lt;98% • 
              High: Success rate &lt;95%, Latency &gt;500ms, Uptime &lt;99% • 
              Medium: Below optimal performance levels
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIAlerts;