import React from 'react';
import { AIMetrics } from '../../types';

interface AITrainingCostDisplayProps {
  aiMetrics: AIMetrics[];
}

const AITrainingCostDisplay: React.FC<AITrainingCostDisplayProps> = ({ aiMetrics }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDuration = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  // Calculate aggregate training costs and budget metrics
  const aggregateData = aiMetrics.reduce((acc, metric) => {
    // Sum up recent training costs (last 5 sessions)
    const recentTrainingCost = metric.trainingCosts.reduce((sum, cost) => sum + cost.computeCost, 0);
    
    return {
      totalTrainingCost: acc.totalTrainingCost + recentTrainingCost,
      totalBudget: acc.totalBudget + metric.resourceUtilization.monthlyBudget,
      totalBudgetUsed: acc.totalBudgetUsed + metric.resourceUtilization.budgetUsed,
      totalBudgetRemaining: acc.totalBudgetRemaining + metric.resourceUtilization.budgetRemaining,
      modelCount: acc.modelCount + 1
    };
  }, {
    totalTrainingCost: 0,
    totalBudget: 0,
    totalBudgetUsed: 0,
    totalBudgetRemaining: 0,
    modelCount: 0
  });

  const budgetUtilizationPercentage = aggregateData.totalBudget > 0 
    ? (aggregateData.totalBudgetUsed / aggregateData.totalBudget) * 100 
    : 0;

  const getBudgetColor = (percentage: number): string => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBudgetTextColor = (percentage: number): string => {
    if (percentage < 70) return 'text-green-600';
    if (percentage < 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">AI Training Costs & Budget</h2>
        <p className="text-sm text-gray-600 mt-1">
          Monthly budget tracking and training session costs
        </p>
      </div>

      {/* Budget Overview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Monthly Budget Overview</h3>
          <span className={`text-sm font-semibold ${getBudgetTextColor(budgetUtilizationPercentage)}`}>
            {budgetUtilizationPercentage.toFixed(1)}% Used
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div
            className={`h-3 rounded-full ${getBudgetColor(budgetUtilizationPercentage)}`}
            style={{ width: `${Math.min(budgetUtilizationPercentage, 100)}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600">Total Budget</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(aggregateData.totalBudget)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Used</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(aggregateData.totalBudgetUsed)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Remaining</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(aggregateData.totalBudgetRemaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Training Sessions */}
      <div>
        <h3 className="font-medium text-gray-900 mb-4">Recent Training Sessions</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {aiMetrics.flatMap(metric => 
            metric.trainingCosts.slice(0, 2).map(cost => ({
              ...cost,
              modelName: metric.modelName,
              modelId: metric.modelId
            }))
          )
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 8)
          .map((session, index) => (
            <div key={`${session.modelId}-${session.sessionId}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate" title={session.modelName}>
                    {session.modelName}
                  </p>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(session.computeCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-600">
                    Duration: {formatDuration(session.duration)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(session.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1" title={session.resourcesUsed}>
                  {session.resourcesUsed}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Training Cost Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Training Cost</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(aggregateData.totalTrainingCost)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Cost per Model</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(aggregateData.totalTrainingCost / Math.max(aggregateData.modelCount, 1))}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Models in Training</p>
            <p className="text-lg font-semibold text-blue-600">
              {aiMetrics.filter(m => m.status === 'training').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITrainingCostDisplay;