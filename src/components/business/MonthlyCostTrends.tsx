import React from 'react';
import { BusinessCostMetrics, BusinessUnit, TrendDirection } from '../../types';

interface MonthlyCostTrendsProps {
  costMetrics: BusinessCostMetrics[];
}

const MonthlyCostTrends: React.FC<MonthlyCostTrendsProps> = ({ costMetrics }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getTrendIcon = (trend: TrendDirection): string => {
    switch (trend) {
      case TrendDirection.IMPROVING:
        return '📈';
      case TrendDirection.STABLE:
        return '➡️';
      case TrendDirection.DEGRADING:
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: TrendDirection): string => {
    switch (trend) {
      case TrendDirection.IMPROVING:
        return 'text-green-600';
      case TrendDirection.STABLE:
        return 'text-yellow-600';
      case TrendDirection.DEGRADING:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBusinessUnitColor = (businessUnit: BusinessUnit): string => {
    switch (businessUnit) {
      case BusinessUnit.FASHION:
        return 'border-purple-200 bg-purple-50';
      case BusinessUnit.BEAUTY:
        return 'border-pink-200 bg-pink-50';
      case BusinessUnit.SUPERSTORE:
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  // Get the last 6 months for display
  const getRecentTrends = (trends: any[]) => {
    return trends.slice(-6);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Monthly Cost Trends</h2>
        <p className="text-sm text-gray-600 mt-1">
          12-month cost progression with trend indicators across business units
        </p>
      </div>

      <div className="space-y-6">
        {costMetrics.map((metric) => (
          <div
            key={metric.businessUnit}
            className={`border rounded-lg p-4 ${getBusinessUnitColor(metric.businessUnit)}`}
          >
            <div className="mb-4">
              <h3 className="font-semibold text-lg capitalize">{metric.businessUnit}</h3>
              <p className="text-sm text-gray-600">
                Current: {formatCurrency(metric.costPerOrder)} per order
              </p>
            </div>

            {/* Recent Trends Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {getRecentTrends(metric.monthlyTrends).map((trend, index) => (
                <div
                  key={trend.month}
                  className="bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="text-xs text-gray-500 mb-1">{trend.month}</div>
                  <div className="font-semibold text-sm">
                    {formatCurrency(trend.costPerOrder)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {new Intl.NumberFormat('en-US').format(trend.orderVolume)} orders
                  </div>
                  <div className={`flex items-center mt-1 ${getTrendColor(trend.trendIndicator)}`}>
                    <span className="text-xs mr-1">{getTrendIcon(trend.trendIndicator)}</span>
                    <span className="text-xs capitalize">{trend.trendIndicator}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Trend Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">6-Month Average</p>
                  <p className="font-semibold">
                    {formatCurrency(
                      getRecentTrends(metric.monthlyTrends).reduce(
                        (sum, trend) => sum + trend.costPerOrder, 0
                      ) / getRecentTrends(metric.monthlyTrends).length
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Orders (6M)</p>
                  <p className="font-semibold">
                    {new Intl.NumberFormat('en-US').format(
                      getRecentTrends(metric.monthlyTrends).reduce(
                        (sum, trend) => sum + trend.orderVolume, 0
                      )
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Cost (6M)</p>
                  <p className="font-semibold">
                    {formatCurrency(
                      getRecentTrends(metric.monthlyTrends).reduce(
                        (sum, trend) => sum + trend.totalCost, 0
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Trend Analysis */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Trend Analysis Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {costMetrics.map((metric) => {
            const recentTrends = getRecentTrends(metric.monthlyTrends);
            const improvingCount = recentTrends.filter(t => t.trendIndicator === TrendDirection.IMPROVING).length;
            const stableCount = recentTrends.filter(t => t.trendIndicator === TrendDirection.STABLE).length;
            const degradingCount = recentTrends.filter(t => t.trendIndicator === TrendDirection.DEGRADING).length;

            return (
              <div key={metric.businessUnit} className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium capitalize mb-2">{metric.businessUnit}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">📈 Improving:</span>
                    <span className="font-medium">{improvingCount} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">➡️ Stable:</span>
                    <span className="font-medium">{stableCount} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">📉 Degrading:</span>
                    <span className="font-medium">{degradingCount} months</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCostTrends;