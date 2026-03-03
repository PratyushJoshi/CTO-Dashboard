'use client';

import React from 'react';
import { InfrastructureMetrics, Alert, AlertSeverity } from '@/types';

interface InfrastructureAlertsProps {
  servers: InfrastructureMetrics[];
  alerts: Alert[];
  className?: string;
}

export function InfrastructureAlerts({ servers, alerts, className = '' }: InfrastructureAlertsProps) {
  // Generate infrastructure-specific alerts based on server metrics
  const generateInfrastructureAlerts = (): Alert[] => {
    const infraAlerts: Alert[] = [];
    const currentTime = new Date();

    servers.forEach(server => {
      // CPU utilization alert
      if (server.cpuUtilization > 80) {
        infraAlerts.push({
          id: `cpu-alert-${server.serverId}`,
          ruleId: 'cpu-threshold-rule',
          ruleName: 'CPU Utilization Threshold',
          metricType: 'infrastructure' as any,
          severity: server.cpuUtilization > 90 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
          status: 'active' as any,
          triggeredAt: currentTime,
          message: `High CPU utilization on ${server.serverName}: ${server.cpuUtilization.toFixed(1)}%`,
          details: {
            metricName: 'CPU Utilization',
            currentValue: server.cpuUtilization,
            threshold: 80,
            condition: 'greater than',
            affectedResources: [server.serverId],
            recommendedActions: [
              'Check running processes',
              'Consider scaling resources',
              'Review recent deployments'
            ]
          },
          notifications: []
        });
      }

      // Memory utilization alert
      if (server.memoryUtilization > 85) {
        infraAlerts.push({
          id: `memory-alert-${server.serverId}`,
          ruleId: 'memory-threshold-rule',
          ruleName: 'Memory Utilization Threshold',
          metricType: 'infrastructure' as any,
          severity: server.memoryUtilization > 95 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
          status: 'active' as any,
          triggeredAt: currentTime,
          message: `High memory utilization on ${server.serverName}: ${server.memoryUtilization.toFixed(1)}%`,
          details: {
            metricName: 'Memory Utilization',
            currentValue: server.memoryUtilization,
            threshold: 85,
            condition: 'greater than',
            affectedResources: [server.serverId],
            recommendedActions: [
              'Check memory-intensive processes',
              'Clear cache if applicable',
              'Consider memory upgrade'
            ]
          },
          notifications: []
        });
      }

      // Server load alert
      if (server.loadPercentage > 80) {
        infraAlerts.push({
          id: `load-alert-${server.serverId}`,
          ruleId: 'server-load-rule',
          ruleName: 'Server Load Threshold',
          metricType: 'infrastructure' as any,
          severity: server.loadPercentage > 90 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
          status: 'active' as any,
          triggeredAt: currentTime,
          message: `High server load on ${server.serverName}: ${server.loadPercentage.toFixed(1)}%`,
          details: {
            metricName: 'Server Load',
            currentValue: server.loadPercentage,
            threshold: 80,
            condition: 'greater than',
            affectedResources: [server.serverId],
            recommendedActions: [
              'Distribute load across servers',
              'Check for resource bottlenecks',
              'Scale infrastructure if needed'
            ]
          },
          notifications: []
        });
      }
    });

    return infraAlerts;
  };

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
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case AlertSeverity.HIGH:
        return (
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const infraAlerts = generateInfrastructureAlerts();
  const allInfraAlerts = [...infraAlerts, ...alerts.filter(alert => alert.metricType === 'infrastructure')];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Infrastructure Alerts</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">{allInfraAlerts.length} Active</span>
        </div>
      </div>

      {allInfraAlerts.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">No infrastructure alerts at this time</p>
          <p className="text-sm text-gray-400 mt-1">All systems are operating normally</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allInfraAlerts.slice(0, 10).map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs mt-1 opacity-75">
                    Triggered: {alert.triggeredAt.toLocaleTimeString()}
                  </p>
                  {alert.details.recommendedActions && alert.details.recommendedActions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Recommended Actions:</p>
                      <ul className="text-xs space-y-1">
                        {alert.details.recommendedActions.slice(0, 2).map((action, index) => (
                          <li key={index} className="flex items-center space-x-1">
                            <span className="w-1 h-1 bg-current rounded-full"></span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {allInfraAlerts.length > 10 && (
            <div className="text-center pt-4 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View {allInfraAlerts.length - 10} more alerts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}