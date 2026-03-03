'use client';

import React from 'react';
import { QAMetrics, ApprovalStatus } from '../../types';

interface QAReleaseQualityMetricsProps {
  qaMetrics: QAMetrics[];
}

const QAReleaseQualityMetrics: React.FC<QAReleaseQualityMetricsProps> = ({ qaMetrics }) => {
  if (!qaMetrics || qaMetrics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Release Quality</h3>
        <p className="text-gray-500">No release quality data available</p>
      </div>
    );
  }

  // Calculate aggregate release quality metrics
  const avgPassRate = qaMetrics.reduce((sum, m) => sum + m.releaseQuality.automatedTestPassRate, 0) / qaMetrics.length;
  const avgCompletion = qaMetrics.reduce((sum, m) => sum + m.releaseQuality.manualTestingCompletion, 0) / qaMetrics.length;
  const avgReadiness = qaMetrics.reduce((sum, m) => sum + m.releaseQuality.releaseReadinessScore, 0) / qaMetrics.length;

  // Count approval statuses
  const approvalCounts = qaMetrics.reduce((acc, m) => {
    acc[m.releaseQuality.approvalStatus] = (acc[m.releaseQuality.approvalStatus] || 0) + 1;
    return acc;
  }, {} as Record<ApprovalStatus, number>);

  // Collect all quality concerns
  const allConcerns = qaMetrics.flatMap(m => m.releaseQuality.qualityConcerns);
  const uniqueConcerns = Array.from(new Set(allConcerns));

  const getApprovalStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.APPROVED: return 'text-green-600 bg-green-100';
      case ApprovalStatus.CONDITIONAL: return 'text-yellow-600 bg-yellow-100';
      case ApprovalStatus.PENDING: return 'text-blue-600 bg-blue-100';
      case ApprovalStatus.REJECTED: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getApprovalStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.APPROVED: return '✅';
      case ApprovalStatus.CONDITIONAL: return '⚠️';
      case ApprovalStatus.PENDING: return '⏳';
      case ApprovalStatus.REJECTED: return '❌';
      default: return '❓';
    }
  };

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Release Quality Metrics</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          avgReadiness >= 90 ? 'text-green-600 bg-green-100' :
          avgReadiness >= 80 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100'
        }`}>
          {avgReadiness.toFixed(1)}% Ready
        </div>
      </div>

      {/* Key Quality Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className={`text-2xl font-bold ${getMetricColor(avgPassRate, { good: 95, warning: 90 })}`}>
            {avgPassRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Test Pass Rate</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${getMetricColor(avgCompletion, { good: 95, warning: 85 })}`}>
            {avgCompletion.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Manual Testing</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${getMetricColor(avgReadiness, { good: 90, warning: 80 })}`}>
            {avgReadiness.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Readiness Score</p>
        </div>
      </div>

      {/* Approval Status Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Release Approval Status</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(approvalCounts).map(([status, count]) => (
            <div key={status} className={`p-3 rounded-lg ${getApprovalStatusColor(status as ApprovalStatus)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getApprovalStatusIcon(status as ApprovalStatus)}</span>
                  <span className="text-sm font-medium capitalize">{status}</span>
                </div>
                <span className="text-lg font-bold">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Concerns */}
      {uniqueConcerns.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Active Quality Concerns</h4>
          <div className="space-y-2">
            {uniqueConcerns.map((concern, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">{concern}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Release Status */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Project Release Status</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {qaMetrics.map((metric) => (
            <div key={metric.projectId} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 truncate">{metric.projectName}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs">{getApprovalStatusIcon(metric.releaseQuality.approvalStatus)}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getApprovalStatusColor(metric.releaseQuality.approvalStatus)}`}>
                  {metric.releaseQuality.approvalStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QAReleaseQualityMetrics;