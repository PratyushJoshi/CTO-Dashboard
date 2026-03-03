'use client';

import React from 'react';
import { QAMetrics, QualityGateStatus } from '../../types';

interface QAQualityGateStatusProps {
  qaMetrics: QAMetrics[];
}

const QAQualityGateStatusComponent: React.FC<QAQualityGateStatusProps> = ({ qaMetrics }) => {
  if (!qaMetrics || qaMetrics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Gate Status</h3>
        <p className="text-gray-500">No quality gate data available</p>
      </div>
    );
  }

  // Aggregate all quality gates across projects
  const allQualityGates = qaMetrics.flatMap(m => 
    m.qualityGates.map(gate => ({
      ...gate,
      projectName: m.projectName,
      projectId: m.projectId
    }))
  );

  // Count gate statuses
  const statusCounts = allQualityGates.reduce((acc, gate) => {
    acc[gate.status] = (acc[gate.status] || 0) + 1;
    return acc;
  }, {} as Record<QualityGateStatus, number>);

  // Get unique gate names and their overall status
  const gateNames = Array.from(new Set(allQualityGates.map(g => g.name)));
  const gateStatusSummary = gateNames.map(gateName => {
    const gatesForName = allQualityGates.filter(g => g.name === gateName);
    const passedCount = gatesForName.filter(g => g.status === QualityGateStatus.PASSED).length;
    const failedCount = gatesForName.filter(g => g.status === QualityGateStatus.FAILED).length;
    const warningCount = gatesForName.filter(g => g.status === QualityGateStatus.WARNING).length;
    
    let overallStatus: QualityGateStatus;
    if (failedCount > 0) overallStatus = QualityGateStatus.FAILED;
    else if (warningCount > 0) overallStatus = QualityGateStatus.WARNING;
    else overallStatus = QualityGateStatus.PASSED;

    return {
      name: gateName,
      total: gatesForName.length,
      passed: passedCount,
      failed: failedCount,
      warning: warningCount,
      overallStatus,
      passRate: (passedCount / gatesForName.length) * 100
    };
  });

  const getStatusColor = (status: QualityGateStatus) => {
    switch (status) {
      case QualityGateStatus.PASSED: return 'text-green-600 bg-green-100';
      case QualityGateStatus.WARNING: return 'text-yellow-600 bg-yellow-100';
      case QualityGateStatus.FAILED: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: QualityGateStatus) => {
    switch (status) {
      case QualityGateStatus.PASSED: return '✅';
      case QualityGateStatus.WARNING: return '⚠️';
      case QualityGateStatus.FAILED: return '❌';
      default: return '❓';
    }
  };

  const getStatusBadgeColor = (status: QualityGateStatus) => {
    switch (status) {
      case QualityGateStatus.PASSED: return 'bg-green-500';
      case QualityGateStatus.WARNING: return 'bg-yellow-500';
      case QualityGateStatus.FAILED: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const overallPassRate = allQualityGates.length > 0 ? 
    (allQualityGates.filter(g => g.status === QualityGateStatus.PASSED).length / allQualityGates.length) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quality Gate Evaluation</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          overallPassRate >= 90 ? 'text-green-600 bg-green-100' :
          overallPassRate >= 75 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100'
        }`}>
          {overallPassRate.toFixed(1)}% Pass Rate
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`p-3 rounded-lg ${getStatusColor(QualityGateStatus.PASSED)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getStatusIcon(QualityGateStatus.PASSED)}</span>
              <span className="text-sm font-medium">Passed</span>
            </div>
            <span className="text-lg font-bold">{statusCounts[QualityGateStatus.PASSED] || 0}</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${getStatusColor(QualityGateStatus.WARNING)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getStatusIcon(QualityGateStatus.WARNING)}</span>
              <span className="text-sm font-medium">Warning</span>
            </div>
            <span className="text-lg font-bold">{statusCounts[QualityGateStatus.WARNING] || 0}</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${getStatusColor(QualityGateStatus.FAILED)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getStatusIcon(QualityGateStatus.FAILED)}</span>
              <span className="text-sm font-medium">Failed</span>
            </div>
            <span className="text-lg font-bold">{statusCounts[QualityGateStatus.FAILED] || 0}</span>
          </div>
        </div>
      </div>

      {/* Gate Type Summary */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quality Gate Performance</h4>
        <div className="space-y-3">
          {gateStatusSummary.map((gate) => (
            <div key={gate.name} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getStatusIcon(gate.overallStatus)}</span>
                  <span className="text-sm font-medium text-gray-900">{gate.name}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(gate.overallStatus)}`}>
                  {gate.passRate.toFixed(1)}% pass rate
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span>Total: {gate.total}</span>
                <span className="text-green-600">Passed: {gate.passed}</span>
                {gate.warning > 0 && <span className="text-yellow-600">Warning: {gate.warning}</span>}
                {gate.failed > 0 && <span className="text-red-600">Failed: {gate.failed}</span>}
              </div>
              
              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${getStatusBadgeColor(gate.overallStatus)}`}
                  style={{ width: `${gate.passRate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Gate Status */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Project Quality Gate Status</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {qaMetrics.map((metric) => {
            const projectPassedGates = metric.qualityGates.filter(g => g.status === QualityGateStatus.PASSED).length;
            const projectTotalGates = metric.qualityGates.length;
            const projectPassRate = projectTotalGates > 0 ? (projectPassedGates / projectTotalGates) * 100 : 0;
            
            return (
              <div key={metric.projectId} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate">{metric.projectName}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {projectPassedGates}/{projectTotalGates}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    projectPassRate === 100 ? 'text-green-600 bg-green-100' :
                    projectPassRate >= 75 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100'
                  }`}>
                    {projectPassRate.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QAQualityGateStatusComponent;