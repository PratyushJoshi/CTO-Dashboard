import React from 'react';
import { BusinessCostMetrics, BusinessUnit } from '../../types';

interface CostPerOrderDisplayProps {
  costMetrics: BusinessCostMetrics[];
}

const CostPerOrderDisplay: React.FC<CostPerOrderDisplayProps> = ({ costMetrics }) => {
  const getBusinessUnitColor = (businessUnit: BusinessUnit): string => {
    switch (businessUnit) {
      case BusinessUnit.FASHION:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case BusinessUnit.BEAUTY:
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case BusinessUnit.SUPERSTORE:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBusinessUnitIcon = (businessUnit: BusinessUnit): string => {
    switch (businessUnit) {
      case BusinessUnit.FASHION:
        return '👗';
      case BusinessUnit.BEAUTY:
        return '💄';
      case BusinessUnit.SUPERSTORE:
        return '🏪';
      default:
        return '📊';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Cost Per Order by Business Unit</h2>
        <p className="text-sm text-gray-600 mt-1">
          Current cost per order across Fashion, Beauty, and Superstore divisions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {costMetrics.map((metric) => (
          <div
            key={metric.businessUnit}
            className={`border rounded-lg p-4 ${getBusinessUnitColor(metric.businessUnit)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{getBusinessUnitIcon(metric.businessUnit)}</span>
                <h3 className="font-semibold capitalize">{metric.businessUnit}</h3>
              </div>
            </div>

            <div className="space-y-3">
              {/* Cost Per Order */}
              <div>
                <p className="text-sm font-medium">Cost Per Order</p>
                <p className="text-2xl font-bold">{formatCurrency(metric.costPerOrder)}</p>
              </div>

              {/* Order Volume */}
              <div>
                <p className="text-sm font-medium">Order Volume</p>
                <p className="text-lg font-semibold">{formatNumber(metric.orderVolume)}</p>
              </div>

              {/* Total Cost */}
              <div>
                <p className="text-sm font-medium">Total Cost</p>
                <p className="text-lg font-semibold">{formatCurrency(metric.totalCost)}</p>
              </div>

              {/* Cost Breakdown */}
              <div className="pt-3 border-t border-current border-opacity-20">
                <p className="text-sm font-medium mb-2">Cost Breakdown</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Infrastructure:</span>
                    <span className="font-medium">{formatCurrency(metric.costBreakdown.infrastructure)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API:</span>
                    <span className="font-medium">{formatCurrency(metric.costBreakdown.api)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Third Party:</span>
                    <span className="font-medium">{formatCurrency(metric.costBreakdown.thirdParty)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other:</span>
                    <span className="font-medium">{formatCurrency(metric.costBreakdown.other)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Average Cost Per Order</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(
                costMetrics.reduce((sum, metric) => sum + metric.costPerOrder, 0) / costMetrics.length
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatNumber(
                costMetrics.reduce((sum, metric) => sum + metric.orderVolume, 0)
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Cost</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(
                costMetrics.reduce((sum, metric) => sum + metric.totalCost, 0)
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostPerOrderDisplay;