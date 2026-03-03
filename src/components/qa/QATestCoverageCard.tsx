'use client';

import React from 'react';
import { QAMetrics } from '../../types';

interface QATestCoverageCardProps {
  qaMetrics: QAMetrics[];
}

const QATestCoverageCard: React.FC<QATestCoverageCardProps> = ({ qaMetrics }) => {
  if (!qaMetrics || qaMetrics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Coverage</h3>
        <p className="text-gray-500">No test coverage data available</p>
      </div>
    );
  }

  // Calculate average coverage across all projects
  const avgOverallCoverage = qaMetrics.reduce((sum, m) => sum + m.testCoverage.overallPercentage, 0) / qaMetrics.length;
  const avgUnitCoverage = qaMetrics.reduce((sum, m) => sum + m.testCoverage.unitTestCoverage, 0) / qaMetrics.length;
  const avgIntegrationCoverage = qaMetrics.reduce((sum, m) => sum + m.testCoverage.integrationTestCoverage, 0) / qaMetrics.length;
  const avgE2ECoverage = qaMetrics.reduce((sum, m) => sum + m.testCoverage.e2eTestCoverage, 0) / qaMetrics.length;
  const avgCodeQuality = qaMetrics.reduce((sum, m) => sum + m.testCoverage.codeQualityScore, 0) / qaMetrics.length;

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getCoverageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Test Coverage Across Projects</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCoverageColor(avgOverallCoverage)}`}>
          {avgOverallCoverage.toFixed(1)}% Overall
        </div>
      </div>

      {/* Coverage Types */}
      <div className="space-y-4">
        {/* Unit Test Coverage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Unit Tests</span>
            <span className="text-sm text-gray-600">{avgUnitCoverage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getCoverageBarColor(avgUnitCoverage)}`}
              style={{ width: `${Math.min(100, avgUnitCoverage)}%` }}
            ></div>
          </div>
        </div>

        {/* Integration Test Coverage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Integration Tests</span>
            <span className="text-sm text-gray-600">{avgIntegrationCoverage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getCoverageBarColor(avgIntegrationCoverage)}`}
              style={{ width: `${Math.min(100, avgIntegrationCoverage)}%` }}
            ></div>
          </div>
        </div>

        {/* E2E Test Coverage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">End-to-End Tests</span>
            <span className="text-sm text-gray-600">{avgE2ECoverage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getCoverageBarColor(avgE2ECoverage)}`}
              style={{ width: `${Math.min(100, avgE2ECoverage)}%` }}
            ></div>
          </div>
        </div>

        {/* Code Quality Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Code Quality Score</span>
            <span className="text-sm text-gray-600">{avgCodeQuality.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getCoverageBarColor(avgCodeQuality)}`}
              style={{ width: `${Math.min(100, avgCodeQuality)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Project Breakdown */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Project Coverage Breakdown</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {qaMetrics.map((metric) => (
            <div key={metric.projectId} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 truncate">{metric.projectName}</span>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getCoverageColor(metric.testCoverage.overallPercentage)}`}>
                  {metric.testCoverage.overallPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QATestCoverageCard;