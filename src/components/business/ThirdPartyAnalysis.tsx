import React from 'react';
import { BusinessCostMetrics } from '../../types';

interface ThirdPartyAnalysisProps {
  costMetrics: BusinessCostMetrics[];
}

const ThirdPartyAnalysis: React.FC<ThirdPartyAnalysisProps> = ({ costMetrics }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getServiceIcon = (serviceName: string): string => {
    if (serviceName.toLowerCase().includes('payment')) return '💳';
    if (serviceName.toLowerCase().includes('email')) return '📧';
    if (serviceName.toLowerCase().includes('sms')) return '📱';
    if (serviceName.toLowerCase().includes('storage')) return '💾';
    if (serviceName.toLowerCase().includes('cdn')) return '🌐';
    if (serviceName.toLowerCase().includes('analytics')) return '📊';
    if (serviceName.toLowerCase().includes('monitoring')) return '📈';
    if (serviceName.toLowerCase().includes('auth')) return '🔐';
    return '🔗';
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

  const getImpactColor = (impact: number): string => {
    if (impact < -10) return 'text-green-600'; // Savings
    if (impact > 10) return 'text-red-600'; // Cost increase
    return 'text-yellow-600'; // Neutral
  };

  // Aggregate all third-party analyses
  const allAnalyses = costMetrics.flatMap(metric => 
    metric.thirdPartyAnalysis.map(analysis => ({
      ...analysis,
      businessUnit: metric.businessUnit
    }))
  );

  const totalCurrentCost = allAnalyses.reduce((sum, analysis) => sum + analysis.currentCost, 0);
  const totalPotentialSavings = allAnalyses.reduce((sum, analysis) => {
    const bestAlternative = analysis.alternatives.reduce((best, alt) => 
      alt.costImpact < best.costImpact ? alt : best, analysis.alternatives[0]
    );
    return sum + (bestAlternative ? Math.abs(bestAlternative.costImpact * analysis.currentCost / 100) : 0);
  }, 0);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Third-Party Dependency Analysis</h2>
        <p className="text-sm text-gray-600 mt-1">
          Cost analysis and alternatives for third-party services
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900">Total Third-Party Costs</h3>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(totalCurrentCost)}</p>
          <p className="text-sm text-blue-700">per month</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900">Potential Savings</h3>
          <p className="text-xl font-bold text-green-900">{formatCurrency(totalPotentialSavings)}</p>
          <p className="text-sm text-green-700">with alternatives</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900">Services Analyzed</h3>
          <p className="text-xl font-bold text-purple-900">{allAnalyses.length}</p>
          <p className="text-sm text-purple-700">third-party services</p>
        </div>
      </div>

      {/* Third-Party Service Analysis */}
      <div className="space-y-6">
        {allAnalyses.map((analysis, index) => (
          <div
            key={`${analysis.businessUnit}-${analysis.serviceName}-${index}`}
            className="border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getServiceIcon(analysis.serviceName)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{analysis.serviceName}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                    {analysis.businessUnit}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Cost</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(analysis.currentCost)}</p>
              </div>
            </div>

            {/* Current Service Recommendation */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Recommendation</h4>
              <p className="text-sm text-gray-700">{analysis.recommendation}</p>
            </div>

            {/* Alternatives */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Alternative Options</h4>
              <div className="space-y-3">
                {analysis.alternatives.map((alternative, altIndex) => (
                  <div
                    key={altIndex}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{alternative.name}</h5>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEffortColor(alternative.migrationEffort)}`}>
                        {alternative.migrationEffort} migration
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Estimated Cost</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(alternative.estimatedCost)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cost Impact</p>
                        <p className={`font-semibold ${getImpactColor(alternative.costImpact)}`}>
                          {alternative.costImpact > 0 ? '+' : ''}{alternative.costImpact}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Monthly Difference</p>
                        <p className={`font-semibold ${getImpactColor(alternative.costImpact)}`}>
                          {alternative.costImpact < 0 ? '-' : '+'}
                          {formatCurrency(Math.abs(alternative.costImpact * analysis.currentCost / 100))}
                        </p>
                      </div>
                    </div>

                    {/* Savings/Cost Indicator */}
                    {alternative.costImpact < 0 && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                        💰 Potential savings: {formatCurrency(Math.abs(alternative.costImpact * analysis.currentCost / 100))} per month
                      </div>
                    )}
                    {alternative.costImpact > 0 && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        ⚠️ Additional cost: {formatCurrency(alternative.costImpact * analysis.currentCost / 100)} per month
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Migration Priority Matrix */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Migration Priority Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* High Savings, Low Effort */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">🎯 Quick Wins</h4>
            <p className="text-xs text-green-700 mb-3">High savings, low migration effort</p>
            <div className="space-y-2">
              {allAnalyses
                .filter(analysis => {
                  const bestAlt = analysis.alternatives.find(alt => alt.costImpact < -10 && alt.migrationEffort === 'low');
                  return bestAlt;
                })
                .map((analysis, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{analysis.serviceName}</span>
                    <span className="text-green-600 ml-2">
                      ({Math.abs(analysis.alternatives.find(alt => alt.costImpact < -10 && alt.migrationEffort === 'low')?.costImpact || 0)}% savings)
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Medium Priority */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">⚖️ Consider Later</h4>
            <p className="text-xs text-yellow-700 mb-3">Medium savings or effort required</p>
            <div className="space-y-2">
              {allAnalyses
                .filter(analysis => {
                  const hasQuickWin = analysis.alternatives.find(alt => alt.costImpact < -10 && alt.migrationEffort === 'low');
                  const hasMediumOption = analysis.alternatives.find(alt => 
                    (alt.costImpact < -5 && alt.migrationEffort === 'medium') || 
                    (alt.costImpact < -10 && alt.migrationEffort === 'medium')
                  );
                  return !hasQuickWin && hasMediumOption;
                })
                .map((analysis, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{analysis.serviceName}</span>
                    <span className="text-yellow-600 ml-2">
                      (medium effort)
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Low Priority */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📋 Monitor</h4>
            <p className="text-xs text-gray-700 mb-3">Low savings or high migration effort</p>
            <div className="space-y-2">
              {allAnalyses
                .filter(analysis => {
                  const bestSavings = Math.min(...analysis.alternatives.map(alt => alt.costImpact));
                  const hasHighEffort = analysis.alternatives.every(alt => alt.migrationEffort === 'high');
                  return bestSavings > -5 || hasHighEffort;
                })
                .map((analysis, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{analysis.serviceName}</span>
                    <span className="text-gray-600 ml-2">
                      (low impact)
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Business Unit Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Third-Party Costs by Business Unit</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(
            allAnalyses.reduce((acc, analysis) => {
              if (!acc[analysis.businessUnit]) {
                acc[analysis.businessUnit] = { cost: 0, services: 0 };
              }
              acc[analysis.businessUnit].cost += analysis.currentCost;
              acc[analysis.businessUnit].services += 1;
              return acc;
            }, {} as Record<string, { cost: number; services: number }>)
          ).map(([businessUnit, data]) => (
            <div key={businessUnit} className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium capitalize mb-2">{businessUnit}</h4>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(data.cost)}</p>
              <p className="text-xs text-gray-500">{data.services} services</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThirdPartyAnalysis;