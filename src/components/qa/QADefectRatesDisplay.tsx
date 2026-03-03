'use client';

import React from 'react';
import { QAMetrics, DefectSeverity } from '../../types';

interface QADefectRatesDisplayProps {
  qaMetrics: QAMetrics[];
}

const QADefectRatesDisplay: React.FC<QADefectRatesDisplayProps> = ({ qaMetrics }) => {
  if (!qaMetrics || qaMetrics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Defect Rates</h3>
        <p className="text-gray-500">No defect data available</p>
      </div>
    );
  }

  // Calculate aggregate defect metrics
  const totalBugs = qaMetrics.reduce((sum, m) => sum + m.defectRates.bugsPerRelease, 0);
  const avgBugsPerRelease = totalBugs / qaMetrics.length;
  const avgResolutionTime = qaMetrics.reduce((sum, m) => sum + m.defectRates.averageResolutionTime, 0) / qaMetrics.length;
  const avgDefectDensity = qaMetrics.reduce((sum, m) => sum + m.defectRates.defectDensity, 0) / qaMetrics.length;
  const avgEscapeRate = qaMetrics.reduce((sum, m) => sum + m.defectRates.escapeRate, 0) / qaMetrics.length;

  // Calculate severity distribution across all projects
  const totalSeverityDistribution = qaMetrics.reduce((acc, m) => {
    Object.entries(m.defectRates.severityDistribution).forEach(([severity, count]) => {
      acc[severity as DefectSeverity] = (acc[severity as DefectSeverity] || 0) + count;
    });
    return acc;
  }, {} as Record<DefectSeverity, number>);

  const getSeverityColor = (severity: DefectSeverity) => {
    switch (severity) {
      case DefectSeverity.CRITICAL: return 'bg-red-500';
      case DefectSeverity.HIGH: return 'bg-orange-500';
      case DefectSeverity.MEDIUM: return 'bg-yellow-500';
      case DefectSeverity.LOW: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityTextColor = (severity: DefectSeverity) => {
    switch (severity) {
      case DefectSeverity.CRITICAL: return 'text-red-600';
      case DefectSeverity.HIGH: return 'text-orange-600';
      case DefectSeverity.MEDIUM: return 'text-yellow-600';
      case DefectSeverity.LOW: return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getMetricStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600 bg-green-100';
    if (value <= thresholds.warning) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Defect Rates & Resolution</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMetricStatus(avgBugsPerRelease, { good: 5, warning: 10 })}`}>
          {avgBugsPerRelease.toFixed(1)} avg bugs/release
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{avgResolutionTime.toFixed(1)}h</p>
          <p className="text-sm text-gray-600">Avg Resolution Time</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{avgEscapeRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Escape Rate</p>
        </div>
      </div>

      {/* Severity Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Defect Severity Distribution</h4>
        <div className="space-y-3">
          {Object.entries(totalSeverityDistribution).map(([severity, count]) => {
            const percentage = totalBugs > 0 ? (count / totalBugs) * 100 : 0;
            return (
              <div key={severity} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity as DefectSeverity)}`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{severity}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <span className={`text-xs font-medium ${getSeverityTextColor(severity as DefectSeverity)}`}>
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Defect Density</span>
            <span className="text-sm font-medium text-gray-900">
              {avgDefectDensity.toFixed(2)} bugs/KLOC
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Total Active Projects</span>
            <span className="text-sm font-medium text-gray-900">
              {qaMetrics.length}
            </span>
          </div>
        </div>
      </div>

      {/* Project-wise Breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Project Defect Summary</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {qaMetrics.map((metric) => (
            <div key={metric.projectId} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 truncate">{metric.projectName}</span>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  getMetricStatus(metric.defectRates.bugsPerRelease, { good: 5, warning: 10 })
                }`}>
                  {metric.defectRates.bugsPerRelease} bugs
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QADefectRatesDisplay;