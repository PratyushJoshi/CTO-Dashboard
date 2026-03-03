import React from 'react';
import { BusinessCostMetrics } from '../../types';

interface CostOptimizationOpportunitiesProps {
  costMetrics: BusinessCostMetrics[];
}

const CostOptimizationOpportunities: React.FC<CostOptimizationOpportunitiesProps> = ({ 
  costMetrics 
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getEffortColor = (effort: string): string => {
    switch (effort) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'infrastructure':
        return '🏗️';
      case 'api':
        return '🔌';
      case 'caching':
        return '💾';
      case 'third_party':
        return '🔗';
      default:
        return '💡';
    }
  };

  // Aggregate all optimization opportunities
  const allOpportunities = costMetrics.flatMap(metric => 
    metric.optimizationOpportunities.map(opp => ({
      ...opp,
      businessUnit: metric.businessUnit
    }))
  );

  // Sort by potential savings (highest first)
  const sortedOpportunities = allOpportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);

  const totalPotentialSavings = allOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Cost Optimization Opportunities</h2>
        <p className="text-sm text-gray-600 mt-1">
          Identified opportunities to reduce technology expenses
        </p>
      </div>

      {/* Total Savings Potential */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">Total Potential Savings</h3>
            <p className="text-sm text-blue-700">Across all business units and categories</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalPotentialSavings)}</p>
            <p className="text-sm text-blue-700">per month</p>
          </div>
        </div>
      </div>

      {/* Optimization Opportunities List */}
      <div className="space-y-4">
        {sortedOpportunities.map((opportunity, index) => (
          <div
            key={`${opportunity.businessUnit}-${opportunity.category}-${index}`}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">{getCategoryIcon(opportunity.category)}</span>
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {opportunity.category.replace('_', ' ')} Optimization
                  </h3>
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                    {opportunity.businessUnit}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{opportunity.recommendation}</p>
                
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-xs text-gray-500">Current Cost</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(opportunity.currentCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Potential Savings</p>
                    <p className="font-semibold text-green-600">{formatCurrency(opportunity.potentialSavings)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Savings %</p>
                    <p className="font-semibold text-green-600">
                      {Math.round((opportunity.potentialSavings / opportunity.currentCost) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEffortColor(opportunity.implementationEffort)}`}>
                  {opportunity.implementationEffort} effort
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary by Category */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Savings by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(
            allOpportunities.reduce((acc, opp) => {
              if (!acc[opp.category]) {
                acc[opp.category] = { total: 0, count: 0 };
              }
              acc[opp.category].total += opp.potentialSavings;
              acc[opp.category].count += 1;
              return acc;
            }, {} as Record<string, { total: number; count: number }>)
          ).map(([category, data]) => (
            <div key={category} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{getCategoryIcon(category)}</span>
                  <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatCurrency(data.total)}</p>
                  <p className="text-xs text-gray-500">{data.count} opportunities</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Implementation Priority */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Implementation Priority</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              High Impact, Low Effort
            </span>
            <span className="font-medium">
              {sortedOpportunities.filter(o => o.implementationEffort === 'low' && o.potentialSavings > 1000).length} opportunities
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              Medium Impact/Effort
            </span>
            <span className="font-medium">
              {sortedOpportunities.filter(o => o.implementationEffort === 'medium').length} opportunities
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              High Effort Required
            </span>
            <span className="font-medium">
              {sortedOpportunities.filter(o => o.implementationEffort === 'high').length} opportunities
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostOptimizationOpportunities;