'use client';

import React, { useState, useEffect } from 'react';
import { AIMetrics, AIModelStatus } from '../../types';
import { MockDataGenerator } from '../../mock/MockDataGenerator';
import AIModelPerformanceCard from './AIModelPerformanceCard';
import AITrainingCostDisplay from './AITrainingCostDisplay';
import AIDeploymentMetrics from './AIDeploymentMetrics';
import AIResourceUtilization from './AIResourceUtilization';
import AIPerformanceAlerts from './AIPerformanceAlerts';
import { 
  CpuChipIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface AIDashboardProps {
  refreshInterval?: number;
}

const AIDashboard: React.FC<AIDashboardProps> = ({ 
  refreshInterval = 30000 
}) => {
  const [aiMetrics, setAIMetrics] = useState<AIMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const mockGenerator = new MockDataGenerator();

  const fetchAIMetrics = async () => {
    try {
      setError(null);
      const metrics = mockGenerator.generateAIMetrics();
      setAIMetrics(metrics);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch AI department metrics');
      console.error('Error fetching AI metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIMetrics();
    const interval = setInterval(fetchAIMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    if (!aiMetrics.length) return null;

    const deployedModels = aiMetrics.filter(m => m.status === AIModelStatus.DEPLOYED).length;
    const trainingModels = aiMetrics.filter(m => m.status === AIModelStatus.TRAINING).length;
    const avgAccuracy = aiMetrics.reduce((sum, m) => sum + m.accuracy, 0) / aiMetrics.length;
    const totalBudgetUsed = aiMetrics.reduce((sum, m) => sum + m.resourceUtilization.budgetUsed, 0);
    const totalAnomalies = aiMetrics.reduce((sum, m) => sum + m.performanceAnomalies.length, 0);
    const avgInferenceTime = aiMetrics.reduce((sum, m) => sum + m.inferenceTime, 0) / aiMetrics.length;

    return {
      deployedModels,
      trainingModels,
      avgAccuracy: Math.round(avgAccuracy * 100),
      totalBudgetUsed: Math.round(totalBudgetUsed),
      totalAnomalies,
      avgInferenceTime: Math.round(avgInferenceTime)
    };
  }, [aiMetrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button 
              onClick={fetchAIMetrics}
              className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Department Monitoring</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor AI model performance, training costs, deployments, and resource utilization
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-sm font-medium text-gray-900">
              {lastUpdated.toLocaleTimeString()}
            </p>
            <button 
              onClick={fetchAIMetrics}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CpuChipIcon className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">{summaryStats.deployedModels}</div>
                <div className="text-sm text-gray-600">Deployed Models</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">{summaryStats.trainingModels}</div>
                <div className="text-sm text-gray-600">Training Models</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">{summaryStats.avgAccuracy}%</div>
                <div className="text-sm text-gray-600">Avg Accuracy</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">${(summaryStats.totalBudgetUsed / 1000).toFixed(1)}K</div>
                <div className="text-sm text-gray-600">Budget Used</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">{summaryStats.totalAnomalies}</div>
                <div className="text-sm text-gray-600">Anomalies</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-indigo-500" />
              <div className="ml-3">
                <div className="text-2xl font-bold text-gray-900">{summaryStats.avgInferenceTime}ms</div>
                <div className="text-sm text-gray-600">Avg Inference</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Alerts */}
      <AIPerformanceAlerts aiMetrics={aiMetrics} />

      {/* Model Performance Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Performance Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accuracy Distribution */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Accuracy Distribution</h3>
            <div className="space-y-2">
              {aiMetrics.map((model, index) => (
                <div key={model.modelId} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">{model.modelName}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${model.accuracy * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12">
                      {Math.round(model.accuracy * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inference Time Distribution */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Inference Time (ms)</h3>
            <div className="space-y-2">
              {aiMetrics.map((model, index) => (
                <div key={model.modelId} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">{model.modelName}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          model.inferenceTime < 100 ? 'bg-green-500' :
                          model.inferenceTime < 300 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, (model.inferenceTime / 500) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12">
                      {model.inferenceTime}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Model Performance Cards */}
      <AIModelPerformanceCard aiMetrics={aiMetrics} />

      {/* Resource Utilization and Training Costs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIResourceUtilization aiMetrics={aiMetrics} />
        <AITrainingCostDisplay aiMetrics={aiMetrics} />
      </div>

      {/* Deployment Metrics */}
      <AIDeploymentMetrics aiMetrics={aiMetrics} />

      {/* Model Status Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Status Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(AIModelStatus).map(status => {
            const count = aiMetrics.filter(m => m.status === status).length;
            const percentage = aiMetrics.length > 0 ? Math.round((count / aiMetrics.length) * 100) : 0;
            
            return (
              <div key={status} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</div>
                <div className="text-xs text-gray-500">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;