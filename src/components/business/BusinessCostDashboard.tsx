'use client';

import React, { useState, useEffect } from 'react';
import { BusinessCostMetrics } from '../../types';
import { MockDataGenerator } from '../../mock/MockDataGenerator';
import CostPerOrderDisplay from './CostPerOrderDisplay';
import MonthlyCostTrends from './MonthlyCostTrends';
import CostOptimizationOpportunities from './CostOptimizationOpportunities';
import APIImprovementSuggestions from './APIImprovementSuggestions';
import ThirdPartyAnalysis from './ThirdPartyAnalysis';

interface BusinessCostDashboardProps {
  refreshInterval?: number;
}

const BusinessCostDashboard: React.FC<BusinessCostDashboardProps> = ({ 
  refreshInterval = 30000 
}) => {
  const [costMetrics, setCostMetrics] = useState<BusinessCostMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const mockGenerator = new MockDataGenerator();

  const fetchCostMetrics = async () => {
    try {
      setError(null);
      const metrics = mockGenerator.generateBusinessCostMetrics();
      setCostMetrics(metrics);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch business cost metrics');
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
              onClick={fetchCostMetrics}
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
            <h1 className="text-2xl font-bold text-gray-900">Business Cost Analysis</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor cost per order, trends, and optimization opportunities across business units
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-sm font-medium text-gray-900">
              {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Cost Per Order Display */}
      <CostPerOrderDisplay costMetrics={costMetrics} />

      {/* Monthly Cost Trends */}
      <MonthlyCostTrends costMetrics={costMetrics} />

      {/* Cost Optimization and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostOptimizationOpportunities costMetrics={costMetrics} />
        <APIImprovementSuggestions costMetrics={costMetrics} />
      </div>

      {/* Third Party Analysis */}
      <ThirdPartyAnalysis costMetrics={costMetrics} />
    </div>
  );
};

export default BusinessCostDashboard;