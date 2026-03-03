import React from 'react';
import { BusinessAnalyticsMetrics } from '../../types';

interface AnalyticsInfrastructureMonitoringProps {
  analyticsData: BusinessAnalyticsMetrics[];
}

const AnalyticsInfrastructureMonitoring: React.FC<AnalyticsInfrastructureMonitoringProps> = ({ analyticsData }) => {
  // Aggregate infrastructure metrics
  const avgWarehouseUtilization = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.analyticsInfrastructure.dataWarehouseUtilization, 0) / analyticsData.length;
  
  const avgComputeUsage = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.analyticsInfrastructure.computeResourceUsage, 0) / analyticsData.length;

  // Aggregate ETL job performance
  const allETLJobs = analyticsData.flatMap(pipeline => 
    pipeline.analyticsInfrastructure.etlJobPerformance
  );
  
  const avgETLExecutionTime = allETLJobs.reduce((sum, job) => sum + job.executionTime, 0) / allETLJobs.length;
  const avgETLSuccessRate = allETLJobs.reduce((sum, job) => sum + job.successRate, 0) / allETLJobs.length;
  const totalResourceConsumption = allETLJobs.reduce((sum, job) => sum + job.resourceConsumption, 0);

  // Aggregate storage costs
  const allStorageCosts = analyticsData.flatMap(pipeline => 
    pipeline.analyticsInfrastructure.storageCosts
  );
  
  const storageByType = allStorageCosts.reduce((acc, storage) => {
    if (!acc[storage.storageType]) {
      acc[storage.storageType] = { totalSize: 0, totalCost: 0, avgGrowthRate: 0, count: 0 };
    }
    acc[storage.storageType].totalSize += storage.sizeGB;
    acc[storage.storageType].totalCost += storage.monthlyCost;
    acc[storage.storageType].avgGrowthRate += storage.growthRate;
    acc[storage.storageType].count += 1;
    return acc;
  }, {} as Record<string, { totalSize: number; totalCost: number; avgGrowthRate: number; count: number }>);

  // Calculate averages for storage growth rates
  Object.keys(storageByType).forEach(type => {
    storageByType[type].avgGrowthRate = storageByType[type].avgGrowthRate / storageByType[type].count;
  });

  const totalStorageCost = Object.values(storageByType).reduce((sum, storage) => sum + storage.totalCost, 0);
  const totalStorageSize = Object.values(storageByType).reduce((sum, storage) => sum + storage.totalSize, 0);

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 70) return 'text-green-600';
    if (utilization <= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUtilizationBarColor = (utilization: number) => {
    if (utilization <= 70) return 'bg-green-500';
    if (utilization <= 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStorageTypeIcon = (type: string) => {
    switch (type) {
      case 'hot': return '🔥';
      case 'warm': return '🌡️';
      case 'cold': return '❄️';
      case 'archive': return '📦';
      default: return '💾';
    }
  };

  const getStorageTypeColor = (type: string) => {
    switch (type) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-orange-100 text-orange-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      case 'archive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Analytics Infrastructure</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            avgWarehouseUtilization <= 70 ? 'bg-green-500' : 
            avgWarehouseUtilization <= 85 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            {avgWarehouseUtilization <= 70 ? 'Optimal' : 
             avgWarehouseUtilization <= 85 ? 'High Usage' : 'Critical'}
          </span>
        </div>
      </div>

      {/* Resource Utilization Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Warehouse Utilization</p>
          <p className={`text-2xl font-bold ${getUtilizationColor(avgWarehouseUtilization)}`}>
            {avgWarehouseUtilization.toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Compute Usage</p>
          <p className={`text-2xl font-bold ${getUtilizationColor(avgComputeUsage)}`}>
            {avgComputeUsage.toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Storage Cost</p>
          <p className="text-2xl font-bold text-gray-900">
            ${totalStorageCost.toFixed(0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total Storage</p>
          <p className="text-2xl font-bold text-gray-900">
            {(totalStorageSize / 1000).toFixed(1)}TB
          </p>
        </div>
      </div>

      {/* Utilization Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-900">Data Warehouse Utilization</span>
            <span className={`text-sm font-bold ${getUtilizationColor(avgWarehouseUtilization)}`}>
              {avgWarehouseUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${getUtilizationBarColor(avgWarehouseUtilization)}`}
              style={{ width: `${avgWarehouseUtilization}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {avgWarehouseUtilization <= 70 ? 'Healthy utilization' : 
             avgWarehouseUtilization <= 85 ? 'Consider scaling' : 'Immediate scaling needed'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-900">Compute Resource Usage</span>
            <span className={`text-sm font-bold ${getUtilizationColor(avgComputeUsage)}`}>
              {avgComputeUsage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${getUtilizationBarColor(avgComputeUsage)}`}
              style={{ width: `${avgComputeUsage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            CPU and memory utilization across analytics workloads
          </p>
        </div>
      </div>

      {/* ETL Job Performance */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">ETL Job Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Avg Execution Time</p>
            <p className="text-lg font-bold text-gray-900">{avgETLExecutionTime.toFixed(0)}m</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Avg Success Rate</p>
            <p className={`text-lg font-bold ${avgETLSuccessRate >= 95 ? 'text-green-600' : avgETLSuccessRate >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
              {avgETLSuccessRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Resource Consumption</p>
            <p className="text-lg font-bold text-gray-900">{totalResourceConsumption.toFixed(1)}h</p>
          </div>
        </div>

        {/* Individual ETL Jobs */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {allETLJobs.slice(0, 6).map((job, index) => (
            <div key={`${job.jobName}-${index}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">{job.jobName}</p>
                <p className="text-xs text-gray-600">
                  Last run: {job.lastRun.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Time</p>
                  <p className="font-medium">{job.executionTime}m</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Success</p>
                  <p className={`font-medium ${job.successRate >= 95 ? 'text-green-600' : job.successRate >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {job.successRate.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">CPU-h</p>
                  <p className="font-medium">{job.resourceConsumption.toFixed(1)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Cost Breakdown */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-md font-medium text-gray-900 mb-4">Storage Cost Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(storageByType).map(([type, data]) => (
            <div key={type} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getStorageTypeIcon(type)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStorageTypeColor(type)}`}>
                    {type.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">${data.totalCost.toFixed(0)}</p>
                  <p className="text-xs text-gray-600">monthly</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{(data.totalSize / 1000).toFixed(1)} TB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Growth Rate:</span>
                  <span className={`font-medium ${
                    data.avgGrowthRate <= 5 ? 'text-green-600' : 
                    data.avgGrowthRate <= 10 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    +{data.avgGrowthRate.toFixed(1)}%/month
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cost/GB:</span>
                  <span className="font-medium">
                    ${(data.totalCost / data.totalSize).toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsInfrastructureMonitoring;