'use client';

import React, { useState, useEffect } from 'react';
import { BusinessCostMetrics, BusinessUnit } from '../../types';
import { MockDataGenerator } from '../../mock/MockDataGenerator';

interface BusinessCostWidgetProps {
  refreshInterval?: number;
}

const BusinessCostWidget: React.FC<BusinessCostWidgetProps> = ({ 
  refreshInterval = 30000 
}) => {
  const [costMetrics, setCostMetrics] = useState<BusinessCostMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const mockGenerator = new MockDataGenerator();

  const fetchCostMetrics = async () => {
    try {
      const metrics = mockGenerator.generateBusinessCostMetrics();
      setCostMetrics(metrics);
    } catch (err) {
      console.error('Error fetching cost metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostMetrics();
    const interval = setInterval(fetchCostMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getBusinessUnitColor = (businessUnit: BusinessUnit): string => {
    switch (businessUnit) {
      case BusinessUnit.FASHION:
        return 'text-purple-600';
      case BusinessUnit.BEAUTY:
        return 'text-pink-600';
      case BusinessUnit.SUPERSTORE:
        return 'text-blue-600';
      default:
        return 'text-gray-600';
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalCost = costMetrics.reduce((sum, metric) => sum + metric.totalCost, 0);
  const totalOrders = costMetrics.reduce((sum, metric) => sum + metric.orderVolume, 0);
  const averageCostPerOrder = totalOrders > 0 ? totalCost / totalOrders : 0;

  const totalOptimizationSavings = costMetrics.reduce((sum, metric) => 
    sum + metric.optimizationOpportunities.reduce((opSum, opp) => opSum + opp.potentialSavings, 0), 0
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Business Costs</h3>
        <span className="text-2xl">💰</span>
      </div>

      {/* Summary Metrics */}
      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">Average Cost Per Order</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageCostPerOrder)}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Orders</p>
            <p className="font-semibold text-gray-900">
              {new Intl.NumberFormat('en-US').format(totalOrders)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Total Cost</p>
            <p className="font-semibold text-gray-900">{formatCurrency(totalCost)}</p>
          </div>
        </div>
      </div>

      {/* Business Unit Breakdown */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-900">By Business Unit</h4>
        {costMetrics.map((metric) => (
          <div key={metric.businessUnit} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">{getBusinessUnitIcon(metric.businessUnit)}</span>
              <span className="text-sm capitalize">{metric.businessUnit}</span>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${getBusinessUnitColor(metric.businessUnit)}`}>
                {formatCurrency(metric.costPerOrder)}
              </p>
              <p className="text-xs text-gray-500">
                {new Intl.NumberFormat('en-US').format(metric.orderVolume)} orders
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Optimization Opportunities */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Optimization Potential</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(totalOptimizationSavings)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Monthly Savings</p>
            <p className="text-xs text-green-600">
              {Math.round((totalOptimizationSavings / totalCost) * 100)}% reduction
            </p>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Cost Status</span>
          <div className="flex items-center">
            {averageCostPerOrder > 2.5 ? (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                <span className="text-red-600">High</span>
              </>
            ) : averageCostPerOrder > 2.0 ? (
              <>
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                <span className="text-yellow-600">Medium</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-green-600">Optimal</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCostWidget;