import React, { useState, useEffect } from 'react';
import { BusinessAnalyticsMetrics } from '../../types';
import { MockDataGenerator } from '../../mock/MockDataGenerator';
import DataPipelineHealthCard from './DataPipelineHealthCard';
import ReportingPerformanceChart from './ReportingPerformanceChart';
import PipelineErrorCategorization from './PipelineErrorCategorization';
import BusinessIntelligenceMetrics from './BusinessIntelligenceMetrics';
import AnalyticsInfrastructureMonitoring from './AnalyticsInfrastructureMonitoring';

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<BusinessAnalyticsMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const mockGenerator = new MockDataGenerator();
    
    const fetchData = () => {
      try {
        const data = mockGenerator.generateBusinessAnalyticsMetrics();
        setAnalyticsData(data);
        setLastUpdated(new Date());
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Analytics Monitoring</h1>
            <p className="text-gray-600 mt-1">
              Monitor data pipeline health, reporting performance, and analytics infrastructure
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

      {/* Data Pipeline Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsData.map((pipeline) => (
          <DataPipelineHealthCard
            key={pipeline.pipelineId}
            pipeline={pipeline}
          />
        ))}
      </div>

      {/* Reporting Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportingPerformanceChart analyticsData={analyticsData} />
        <PipelineErrorCategorization analyticsData={analyticsData} />
      </div>

      {/* Business Intelligence and Infrastructure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BusinessIntelligenceMetrics analyticsData={analyticsData} />
        <AnalyticsInfrastructureMonitoring analyticsData={analyticsData} />
      </div>

      {/* Pipeline Details Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pipeline Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pipeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Freshness
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processing Latency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Records Processed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.map((pipeline) => (
                <tr key={pipeline.pipelineId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {pipeline.pipelineName}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {pipeline.pipelineId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pipeline.dataHealth.successRate >= 95
                            ? 'bg-green-100 text-green-800'
                            : pipeline.dataHealth.successRate >= 90
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {pipeline.dataHealth.successRate.toFixed(1)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pipeline.dataHealth.dataFreshness} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pipeline.dataHealth.processingLatency} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pipeline.dataHealth.recordsProcessed.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pipeline.dataHealth.dataQualityScore >= 95
                          ? 'bg-green-100 text-green-800'
                          : pipeline.dataHealth.dataQualityScore >= 90
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {pipeline.dataHealth.dataQualityScore.toFixed(1)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;