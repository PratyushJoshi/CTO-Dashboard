import React, { useState, useEffect } from 'react';
import { AIMetrics } from '../../types';
import { MockDataGenerator } from '../../mock/MockDataGenerator';

interface AIWidgetProps {
  refreshInterval?: number;
}

const AIWidget: React.FC<AIWidgetProps> = ({ refreshInterval = 30000 }) => {
  const [aiMetrics, setAIMetrics] = useState<AIMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const mockGenerator = new MockDataGenerator();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const metrics = mockGenerator.generateAIMetrics();
        setAIMetrics(metrics);
      } catch (error) {
        console.error('Error fetching AI metrics:', error);
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
  const deployedModels = aiMetrics.filter(m => m.status === 'deployed').length;
  const averageAccuracy = aiMetrics.reduce((sum, m) => sum + m.accuracy, 0) / aiMetrics.length;
  const totalAnomalies = aiMetrics.reduce((sum, m) => sum + m.performanceAnomalies.filter(a => !a.resolved).length, 0);
  const totalBudgetUsed = aiMetrics.reduce((sum, m) => sum + m.resourceUtilization.budgetUsed, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">AI Department</h3>
        <span className="text-2xl">🤖</span>
      </div>

      <div className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Deployed Models</p>
            <p className="text-xl font-bold text-green-600">{deployedModels}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Accuracy</p>
            <p className="text-xl font-bold text-blue-600">
              {(averageAccuracy * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Active Anomalies</span>
            <span className={`text-sm font-semibold ${totalAnomalies > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totalAnomalies}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Budget Used</span>
            <span className="text-sm font-semibold text-gray-900">
              ${Math.round(totalBudgetUsed).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quick Status */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${totalAnomalies === 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-xs text-gray-600">
              {totalAnomalies === 0 ? 'All systems healthy' : `${totalAnomalies} issues detected`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWidget;