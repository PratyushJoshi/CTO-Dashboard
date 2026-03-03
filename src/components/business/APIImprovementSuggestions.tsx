import React from 'react';
import { BusinessCostMetrics } from '../../types';

interface APIImprovementSuggestionsProps {
  costMetrics: BusinessCostMetrics[];
}

const APIImprovementSuggestions: React.FC<APIImprovementSuggestionsProps> = ({ 
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

  const getImpactColor = (impact: number): string => {
    if (impact >= 15) return 'text-green-600 bg-green-50 border-green-200';
    if (impact >= 10) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getAPIIcon = (apiName: string): string => {
    if (apiName.includes('product') || apiName.includes('catalog')) return '📦';
    if (apiName.includes('recommendation') || apiName.includes('engine')) return '🎯';
    if (apiName.includes('payment') || apiName.includes('gateway')) return '💳';
    if (apiName.includes('user') || apiName.includes('auth')) return '👤';
    if (apiName.includes('search')) return '🔍';
    if (apiName.includes('notification')) return '🔔';
    if (apiName.includes('analytics')) return '📊';
    if (apiName.includes('image')) return '🖼️';
    return '🔌';
  };

  // Aggregate all API improvement suggestions
  const allSuggestions = costMetrics.flatMap(metric => 
    metric.apiImprovementSuggestions.map(suggestion => ({
      ...suggestion,
      businessUnit: metric.businessUnit
    }))
  );

  // Sort by estimated savings (highest first)
  const sortedSuggestions = allSuggestions.sort((a, b) => b.estimatedSavings - a.estimatedSavings);

  const totalCurrentCost = allSuggestions.reduce((sum, suggestion) => sum + suggestion.currentCost, 0);
  const totalEstimatedSavings = allSuggestions.reduce((sum, suggestion) => sum + suggestion.estimatedSavings, 0);
  const averageImpact = allSuggestions.reduce((sum, suggestion) => sum + suggestion.costImpact, 0) / allSuggestions.length;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">API Improvement Suggestions</h2>
        <p className="text-sm text-gray-600 mt-1">
          Specific API optimizations with estimated cost impact
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900">Total API Costs</h3>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(totalCurrentCost)}</p>
          <p className="text-sm text-blue-700">per month</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900">Potential Savings</h3>
          <p className="text-xl font-bold text-green-900">{formatCurrency(totalEstimatedSavings)}</p>
          <p className="text-sm text-green-700">per month</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900">Average Impact</h3>
          <p className="text-xl font-bold text-purple-900">{Math.round(averageImpact)}%</p>
          <p className="text-sm text-purple-700">cost reduction</p>
        </div>
      </div>

      {/* API Improvement Suggestions */}
      <div className="space-y-4">
        {sortedSuggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.businessUnit}-${suggestion.apiName}-${index}`}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">{getAPIIcon(suggestion.apiName)}</span>
                  <h3 className="font-semibold text-gray-900">{suggestion.apiName}</h3>
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                    {suggestion.businessUnit}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{suggestion.suggestion}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Current Cost</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(suggestion.currentCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Estimated Savings</p>
                    <p className="font-semibold text-green-600">{formatCurrency(suggestion.estimatedSavings)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cost Impact</p>
                    <p className="font-semibold text-green-600">{suggestion.costImpact}% reduction</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">New Monthly Cost</p>
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(suggestion.currentCost - suggestion.estimatedSavings)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getImpactColor(suggestion.costImpact)}`}>
                  {suggestion.costImpact >= 15 ? 'High' : suggestion.costImpact >= 10 ? 'Medium' : 'Low'} Impact
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Implementation Roadmap */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Implementation Roadmap</h3>
        <div className="space-y-3">
          {/* Phase 1: High Impact APIs */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Phase 1: High Impact (≥15% savings)</h4>
            <div className="space-y-1">
              {sortedSuggestions
                .filter(s => s.costImpact >= 15)
                .map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2">{getAPIIcon(suggestion.apiName)}</span>
                      {suggestion.apiName}
                    </span>
                    <span className="font-medium text-green-700">
                      {formatCurrency(suggestion.estimatedSavings)} savings
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Phase 2: Medium Impact APIs */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Phase 2: Medium Impact (10-14% savings)</h4>
            <div className="space-y-1">
              {sortedSuggestions
                .filter(s => s.costImpact >= 10 && s.costImpact < 15)
                .map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2">{getAPIIcon(suggestion.apiName)}</span>
                      {suggestion.apiName}
                    </span>
                    <span className="font-medium text-yellow-700">
                      {formatCurrency(suggestion.estimatedSavings)} savings
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Phase 3: Lower Impact APIs */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Phase 3: Lower Impact (&lt;10% savings)</h4>
            <div className="space-y-1">
              {sortedSuggestions
                .filter(s => s.costImpact < 10)
                .map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2">{getAPIIcon(suggestion.apiName)}</span>
                      {suggestion.apiName}
                    </span>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(suggestion.estimatedSavings)} savings
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Business Unit Breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Savings by Business Unit</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(
            allSuggestions.reduce((acc, suggestion) => {
              if (!acc[suggestion.businessUnit]) {
                acc[suggestion.businessUnit] = { savings: 0, count: 0 };
              }
              acc[suggestion.businessUnit].savings += suggestion.estimatedSavings;
              acc[suggestion.businessUnit].count += 1;
              return acc;
            }, {} as Record<string, { savings: number; count: number }>)
          ).map(([businessUnit, data]) => (
            <div key={businessUnit} className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium capitalize mb-2">{businessUnit}</h4>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(data.savings)}</p>
              <p className="text-xs text-gray-500">{data.count} API improvements</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default APIImprovementSuggestions;