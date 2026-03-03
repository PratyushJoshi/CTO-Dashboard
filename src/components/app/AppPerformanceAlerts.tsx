'use client';

import React from 'react';
import { AppPerformanceMetrics, AlertSeverity } from '../../types';

interface AppPerformanceAlertsProps {
  appMetrics: AppPerformanceMetrics[];
}

const AppPerformanceAlerts: React.FC<AppPerformanceAlertsProps> = ({ appMetrics }) => {
  // Collect all threshold breaches from all applications
  const allBreaches = appMetrics.flatMap(app => 
    app.thresholdBreaches.map(breach => ({
      ...breach,
      applicationName: app.applicationName,
      applicationId: app.applicationId
    }))
  );

  // Sort by severity and timestamp
  const sortedBreaches = allBreaches.sort((a, b) => {
    const severityOrder = {
      [AlertSeverity.CRITICAL]: 4,
      [AlertSeverity.HIGH]: 3,
      [AlertSeverity.MEDIUM]: 2,
      [AlertSeverity.LOW]: 1
    };
    
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'bg-red-50 border-red-200 text-red-800';
      case AlertSeverity.HIGH:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case AlertSeverity.MEDIUM:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case AlertSeverity.LOW:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case AlertSeverity.HIGH:
        return (
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case AlertSeverity.MEDIUM:
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatMetricValue = (metricName: string, value: number) => {
    if (metricName.toLowerCase().includes('crash')) {
      return `${value.toFixed(1)} crashes/hour`;
    }
    if (metricName.toLowerCase().includes('load') || metricName.toLowerCase().includes('time')) {
      return `${(value / 1000).toFixed(1)}s`;
    }
    return value.toFixed(1);
  };

  const formatThreshold = (metricName: string, threshold: number) => {
    if (metricName.toLowerCase().includes('crash')) {
      return `${threshold} crashes/hour`;
    }
    if (metricName.toLowerCase().includes('load') || metricName.toLowerCase().includes('time')) {
      return `${(threshold / 1000).toFixed(1)}s`;
    }
    return threshold.toString();
  };

  const getRecommendation = (metricName: string, severity: AlertSeverity) => {
    if (metricName.toLowerCase().includes('crash')) {
      if (severity === AlertSeverity.CRITICAL) {
        return 'Immediate investigation required. Check error logs and recent deployments.';
      }
      return 'Monitor crash patterns and review application stability.';
    }
    
    if (metricName.toLowerCase().includes('load') || metricName.toLowerCase().includes('time')) {
      if (severity === AlertSeverity.CRITICAL) {
        return 'Performance critically degraded. Check server resources and optimize code paths.';
      }
      return 'Consider performance optimization and resource scaling.';
    }
    
    return 'Review application metrics and investigate potential issues.';
  };

  if (sortedBreaches.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-green-800">All Applications Performing Well</h3>
            <p className="text-sm text-green-700 mt-1">
              No performance threshold breaches detected across all applications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Performance Alerts</h3>
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {sortedBreaches.length} active alert{sortedBreaches.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {sortedBreaches.map((breach, index) => (
          <div key={`${breach.applicationId}-${breach.metricName}-${index}`} 
               className={`border rounded-lg p-4 ${getSeverityColor(breach.severity)}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getSeverityIcon(breach.severity)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium">
                      {breach.applicationName}
                    </h4>
                    <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                      {breach.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs opacity-75">
                    {breach.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm">
                    <span className="font-medium">{breach.metricName}</span> threshold exceeded
                  </p>
                  <div className="flex items-center space-x-4 mt-1 text-xs">
                    <span>
                      Current: <span className="font-medium">{formatMetricValue(breach.metricName, breach.actualValue)}</span>
                    </span>
                    <span>
                      Threshold: <span className="font-medium">{formatThreshold(breach.metricName, breach.threshold)}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs">
                  <p className="font-medium mb-1">Recommended Action:</p>
                  <p>{getRecommendation(breach.metricName, breach.severity)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Alert Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Critical:</span>
            <span className="ml-2 font-medium text-red-600">
              {sortedBreaches.filter(b => b.severity === AlertSeverity.CRITICAL).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">High:</span>
            <span className="ml-2 font-medium text-orange-600">
              {sortedBreaches.filter(b => b.severity === AlertSeverity.HIGH).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Medium:</span>
            <span className="ml-2 font-medium text-yellow-600">
              {sortedBreaches.filter(b => b.severity === AlertSeverity.MEDIUM).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Low:</span>
            <span className="ml-2 font-medium text-blue-600">
              {sortedBreaches.filter(b => b.severity === AlertSeverity.LOW).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPerformanceAlerts;