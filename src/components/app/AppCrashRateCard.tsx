'use client';

import React from 'react';
import { AppPerformanceMetrics, AlertSeverity } from '../../types';

interface AppCrashRateCardProps {
  appMetric: AppPerformanceMetrics;
}

const AppCrashRateCard: React.FC<AppCrashRateCardProps> = ({ appMetric }) => {
  const { applicationName, crashRatePerHour, thresholdBreaches } = appMetric;

  // Determine status based on crash rate and threshold breaches
  const getCrashRateStatus = () => {
    const crashBreach = thresholdBreaches.find(breach => breach.metricName === 'Crash Rate');
    if (crashBreach) {
      if (crashBreach.severity === AlertSeverity.CRITICAL) return 'critical';
      if (crashBreach.severity === AlertSeverity.HIGH) return 'high';
      return 'warning';
    }
    
    if (crashRatePerHour > 2) return 'warning';
    if (crashRatePerHour > 1) return 'caution';
    return 'healthy';
  };

  const status = getCrashRateStatus();

  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-red-400';
      case 'warning': return 'bg-yellow-500';
      case 'caution': return 'bg-yellow-400';
      default: return 'bg-green-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'critical': return 'Critical';
      case 'high': return 'High Risk';
      case 'warning': return 'Warning';
      case 'caution': return 'Caution';
      default: return 'Healthy';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'critical': return 'border-red-200';
      case 'high': return 'border-red-200';
      case 'warning': return 'border-yellow-200';
      case 'caution': return 'border-yellow-200';
      default: return 'border-green-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow border-l-4 ${getBorderColor()} p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{applicationName}</h3>
          
          {/* Crash Rate Display */}
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {crashRatePerHour.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500">crashes/hour</p>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor()}`}>
              {getStatusText()}
            </div>
          </div>

          {/* Threshold Breach Info */}
          {thresholdBreaches.length > 0 && (
            <div className="mt-4 space-y-2">
              {thresholdBreaches.map((breach, index) => (
                <div key={index} className="flex items-center text-sm">
                  <svg className="h-4 w-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">
                    {breach.metricName}: {breach.actualValue.toFixed(1)} exceeds threshold of {breach.threshold}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Performance Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Stability</span>
              <span>{crashRatePerHour < 1 ? 'Excellent' : crashRatePerHour < 2 ? 'Good' : 'Needs Attention'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  crashRatePerHour < 1 ? 'bg-green-500' : 
                  crashRatePerHour < 2 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min(100, Math.max(10, (5 - crashRatePerHour) / 5 * 100))}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Application Icon */}
        <div className="ml-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppCrashRateCard;