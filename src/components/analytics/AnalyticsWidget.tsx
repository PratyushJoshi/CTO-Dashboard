import React, { useState, useEffect } from 'react';
import { BusinessAnalyticsMetrics } from '../../types';
import { MockDataGenerator } from '../../mock/MockDataGenerator';

interface AnalyticsWidgetProps {
  className?: string;
}

const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ className = '' }) => {
  const [analyticsData, setAnalyticsData] = useState<BusinessAnalyticsMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockGenerator = new MockDataGenerator();
    
    const fetchData = () => {
      try {
        const data = mockGenerator.generateBusinessAnalyticsMetrics();
        setAnalyticsData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Calculate aggregate metrics
  const totalPipelines = analyticsData.length;
  const avgSuccessRate = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.dataHealth.successRate, 0) / totalPipelines;
  const avgDataFreshness = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.dataHealth.dataFreshness, 0) / totalPipelines;
  const totalRecordsProcessed = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.dataHealth.recordsProcessed, 0);
  const avgQualityScore = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.dataHealth.dataQualityScore, 0) / totalPipelines;

  // Count active errors
  const activeErrors = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.pipelineErrors.filter(error => !error.resolved).length, 0);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Business Analytics</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${avgSuccessRate >= 95 ? 'bg-green-500' : avgSuccessRate >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {avgSuccessRate >= 95 ? 'Healthy' : avgSuccessRate >= 90 ? 'Warning' : 'Critical'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Success Rate</p>
          <p className="text-2xl font-bold text-gray-900">{avgSuccessRate.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Active Pipelines</p>
          <p className="text-2xl font-bold text-gray-900">{totalPipelines}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Data Freshness</span>
          <span className="text-sm font-medium text-gray-900">
            {avgDataFreshness.toFixed(1)} min
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Records Processed</span>
          <span className="text-sm font-medium text-gray-900">
            {totalRecordsProcessed.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Quality Score</span>
          <span className="text-sm font-medium text-gray-900">
            {avgQualityScore.toFixed(1)}
          </span>
        </div>
        
        {activeErrors > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active Errors</span>
            <span className="text-sm font-medium text-red-600">
              {activeErrors}
            </span>
          </div>
        )}
      </div>

      {/* Mini chart showing pipeline health */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Pipeline Health Overview</p>
        <div className="flex space-x-1">
          {analyticsData.slice(0, 8).map((pipeline, index) => (
            <div
              key={pipeline.pipelineId}
              className={`flex-1 h-2 rounded-sm ${
                pipeline.dataHealth.successRate >= 95
                  ? 'bg-green-500'
                  : pipeline.dataHealth.successRate >= 90
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              title={`${pipeline.pipelineName}: ${pipeline.dataHealth.successRate.toFixed(1)}%`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidget;