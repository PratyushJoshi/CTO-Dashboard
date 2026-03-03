import React from 'react';
import { DataIntegrationMetrics, ConnectionStatus, DataSourceType } from '../../types';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ServerIcon,
  ChartBarIcon,
  CircleStackIcon,
  CpuChipIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface DataSourceCardProps {
  source: DataIntegrationMetrics;
  isSelected?: boolean;
  onClick?: () => void;
}

export function DataSourceCard({ source, isSelected = false, onClick }: DataSourceCardProps) {
  const getStatusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case ConnectionStatus.DEGRADED:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case ConnectionStatus.RECONNECTING:
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getSourceTypeIcon = (type: DataSourceType) => {
    switch (type) {
      case DataSourceType.INFRASTRUCTURE_MONITORING:
        return <ServerIcon className="h-6 w-6 text-blue-500" />;
      case DataSourceType.APM_SYSTEM:
        return <ChartBarIcon className="h-6 w-6 text-green-500" />;
      case DataSourceType.BUSINESS_INTELLIGENCE:
        return <CircleStackIcon className="h-6 w-6 text-purple-500" />;
      case DataSourceType.AI_PLATFORM:
        return <CpuChipIcon className="h-6 w-6 text-orange-500" />;
      case DataSourceType.QA_TOOLS:
        return <Cog6ToothIcon className="h-6 w-6 text-indigo-500" />;
      case DataSourceType.ANALYTICS_SYSTEM:
        return <ChartBarIcon className="h-6 w-6 text-pink-500" />;
      default:
        return <CircleStackIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return 'bg-green-100 text-green-800';
      case ConnectionStatus.DEGRADED:
        return 'bg-yellow-100 text-yellow-800';
      case ConnectionStatus.RECONNECTING:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getSourceTypeIcon(source.sourceType)}
          <div>
            <h3 className="text-lg font-medium text-gray-900">{source.sourceName}</h3>
            <p className="text-sm text-gray-500 capitalize">
              {source.sourceType.replace(/_/g, ' ').toLowerCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(source.connectionStatus)}
          <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(source.connectionStatus)}`}>
            {source.connectionStatus}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600">Data Quality</div>
          <div className="font-semibold">{source.dataQuality.validationScore.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-gray-600">Latency</div>
          <div className="font-semibold">{source.aggregationMetrics.aggregationLatency}ms</div>
        </div>
        <div>
          <div className="text-gray-600">Records/hr</div>
          <div className="font-semibold">{(source.aggregationMetrics.metricsAggregated / 1000).toFixed(1)}K</div>
        </div>
        <div>
          <div className="text-gray-600">Availability</div>
          <div className="font-semibold">{source.faultTolerance.serviceAvailability.toFixed(1)}%</div>
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Data Quality Metrics</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Missing Data:</span>
                  <span>{source.dataQuality.missingDataPercentage.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Corrupted Records:</span>
                  <span>{source.dataQuality.corruptedDataCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Schema Compliance:</span>
                  <span>{source.dataQuality.schemaComplianceScore.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Real-time Performance</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Update Frequency:</span>
                  <span>{source.realTimeMetrics.updateFrequency}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Critical Latency:</span>
                  <span>{source.realTimeMetrics.criticalMetricLatency}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Points:</span>
                  <span>{(source.realTimeMetrics.realTimeDataPoints / 1000).toFixed(1)}K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}