'use client';

import React, { useState, useEffect } from 'react';
import { QAMetrics } from '../../types';
import { MockDataGenerator } from '../../mock/MockDataGenerator';

interface QAWidgetProps {
  refreshInterval?: number;
}

const QAWidget: React.FC<QAWidgetProps> = ({ refreshInterval = 30000 }) => {
  const [qaMetrics, setQAMetrics] = useState<QAMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const mockGenerator = new MockDataGenerator();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const metrics = mockGenerator.generateQAMetrics();
        setQAMetrics(metrics);
      } catch (error) {
        console.error('Error fetching QA metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary metrics
  const averageCoverage = qaMetrics.reduce((sum, m) => sum + m.testCoverage.overallPercentage, 0) / qaMetrics.length;
  const totalDefects = qaMetrics.reduce((sum, m) => sum + m.defectRates.bugsPerRelease, 0);
  const approvedProjects = qaMetrics.filter(m => m.releaseQuality.approvalStatus === 'approved').length;
  const failedGates = qaMetrics.reduce((sum, m) => sum + m.qualityGates.filter(g => g.status === 'failed').length, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">QA Department</h3>
        <span className="text-2xl">🧪</span>
      </div>

      <div className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Avg Coverage</p>
            <p className="text-xl font-bold text-green-600">
              {averageCoverage.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Approved Releases</p>
            <p className="text-xl font-bold text-blue-600">
              {approvedProjects}/{qaMetrics.length}
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Total Defects</span>
            <span className={`text-sm font-semibold ${totalDefects > 50 ? 'text-red-600' : 'text-green-600'}`}>
              {totalDefects}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Failed Gates</span>
            <span className={`text-sm font-semibold ${failedGates > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {failedGates}
            </span>
          </div>
        </div>

        {/* Quick Status */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              failedGates === 0 && averageCoverage > 80 ? 'bg-green-500' : 
              failedGates > 0 || averageCoverage < 70 ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-xs text-gray-600">
              {failedGates === 0 && averageCoverage > 80 ? 'Quality standards met' : 
               failedGates > 0 ? `${failedGates} quality gates failed` : 
               'Coverage below target'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAWidget;