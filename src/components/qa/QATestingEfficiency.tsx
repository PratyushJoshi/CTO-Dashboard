'use client';

import React from 'react';
import { QAMetrics } from '../../types';

interface QATestingEfficiencyProps {
  qaMetrics: QAMetrics[];
}

const QATestingEfficiency: React.FC<QATestingEfficiencyProps> = ({ qaMetrics }) => {
  if (!qaMetrics || qaMetrics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Testing Efficiency</h3>
        <p className="text-gray-500">No testing efficiency data available</p>
      </div>
    );
  }

  // Calculate aggregate efficiency metrics
  const avgExecutionTime = qaMetrics.reduce((sum, m) => sum + m.testingEfficiency.testExecutionTime, 0) / qaMetrics.length;
  const avgFlakyRate = qaMetrics.reduce((sum, m) => sum + m.testingEfficiency.flakyTestRate, 0) / qaMetrics.length;
  const avgResourceUtilization = qaMetrics.reduce((sum, m) => sum + m.testingEfficiency.resourceUtilization, 0) / qaMetrics.length;
  const avgAutomationRate = qaMetrics.reduce((sum, m) => sum + m.testingEfficiency.automationRate, 0) / qaMetrics.length;
  const avgMaintenanceTime = qaMetrics.reduce((sum, m) => sum + m.testingEfficiency.testMaintenanceTime, 0) / qaMetrics.length;

  const getEfficiencyColor = (value: number, thresholds: { good: number; warning: number }, reverse = false) => {
    if (reverse) {
      // For metrics where lower is better (like flaky rate, execution time)
      if (value <= thresholds.good) return 'text-green-600 bg-green-100';
      if (value <= thresholds.warning) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    } else {
      // For metrics where higher is better (like automation rate, resource utilization)
      if (value >= thresholds.good) return 'text-green-600 bg-green-100';
      if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    }
  };

  const getProgressBarColor = (value: number, thresholds: { good: number; warning: number }, reverse = false) => {
    if (reverse) {
      if (value <= thresholds.good) return 'bg-green-500';
      if (value <= thresholds.warning) return 'bg-yellow-500';
      return 'bg-red-500';
    } else {
      if (value >= thresholds.good) return 'bg-green-500';
      if (value >= thresholds.warning) return 'bg-yellow-500';
      return 'bg-red-500';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes.toFixed(0)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toFixed(0)}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Testing Efficiency Metrics</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEfficiencyColor(avgAutomationRate, { good: 85, warning: 70 })}`}>
          {avgAutomationRate.toFixed(1)}% Automated
        </div>
      </div>

      {/* Key Efficiency Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">{formatTime(avgExecutionTime)}</p>
          <p className="text-sm text-gray-600">Avg Execution Time</p>
        </div>
        <div className="text-center">
          <p className={`text-xl font-bold ${avgFlakyRate <= 3 ? 'text-green-600' : avgFlakyRate <= 7 ? 'text-yellow-600' : 'text-red-600'}`}>
            {avgFlakyRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Flaky Test Rate</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">{avgResourceUtilization.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Resource Usage</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">{avgMaintenanceTime.toFixed(1)}h</p>
          <p className="text-sm text-gray-600">Weekly Maintenance</p>
        </div>
      </div>

      {/* Efficiency Indicators */}
      <div className="space-y-4 mb-6">
        {/* Automation Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Test Automation Rate</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${getEfficiencyColor(avgAutomationRate, { good: 85, warning: 70 })}`}>
              {avgAutomationRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressBarColor(avgAutomationRate, { good: 85, warning: 70 })}`}
              style={{ width: `${Math.min(100, avgAutomationRate)}%` }}
            ></div>
          </div>
        </div>

        {/* Resource Utilization */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Resource Utilization</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${getEfficiencyColor(avgResourceUtilization, { good: 80, warning: 60 })}`}>
              {avgResourceUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressBarColor(avgResourceUtilization, { good: 80, warning: 60 })}`}
              style={{ width: `${Math.min(100, avgResourceUtilization)}%` }}
            ></div>
          </div>
        </div>

        {/* Flaky Test Rate (lower is better) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Flaky Test Rate</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${getEfficiencyColor(avgFlakyRate, { good: 3, warning: 7 }, true)}`}>
              {avgFlakyRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressBarColor(avgFlakyRate, { good: 3, warning: 7 }, true)}`}
              style={{ width: `${Math.min(100, avgFlakyRate * 10)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Project Efficiency Breakdown */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Project Efficiency Summary</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {qaMetrics.map((metric) => (
            <div key={metric.projectId} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 truncate">{metric.projectName}</span>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Auto:</span>
                  <span className={`text-xs font-medium ${
                    metric.testingEfficiency.automationRate >= 85 ? 'text-green-600' :
                    metric.testingEfficiency.automationRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metric.testingEfficiency.automationRate.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Flaky:</span>
                  <span className={`text-xs font-medium ${
                    metric.testingEfficiency.flakyTestRate <= 3 ? 'text-green-600' :
                    metric.testingEfficiency.flakyTestRate <= 7 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metric.testingEfficiency.flakyTestRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QATestingEfficiency;