import React from 'react';
import { BusinessAnalyticsMetrics, QueryComplexity } from '../../types';

interface ReportingPerformanceChartProps {
  analyticsData: BusinessAnalyticsMetrics[];
}

const ReportingPerformanceChart: React.FC<ReportingPerformanceChartProps> = ({ analyticsData }) => {
  // Calculate aggregate reporting metrics
  const avgReportGenerationTime = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.reportingPerformance.reportGenerationTime, 0) / analyticsData.length;
  
  const avgDashboardLoadTime = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.reportingPerformance.dashboardLoadTime, 0) / analyticsData.length;
  
  const totalConcurrentUsers = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.reportingPerformance.concurrentUsers, 0);
  
  const avgCacheHitRate = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.reportingPerformance.cacheHitRate, 0) / analyticsData.length;

  // Aggregate query performance by complexity
  const queryStats = analyticsData.reduce((acc, pipeline) => {
    pipeline.reportingPerformance.queryPerformance.forEach(query => {
      if (!acc[query.complexity]) {
        acc[query.complexity] = { totalTime: 0, count: 0, totalResource: 0 };
      }
      acc[query.complexity].totalTime += query.executionTime;
      acc[query.complexity].totalResource += query.resourceUsage;
      acc[query.complexity].count += 1;
    });
    return acc;
  }, {} as Record<QueryComplexity, { totalTime: number; count: number; totalResource: number }>);

  const getPerformanceColor = (time: number, threshold: number) => {
    if (time <= threshold) return 'text-green-600';
    if (time <= threshold * 1.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBarColor = (time: number, threshold: number) => {
    if (time <= threshold) return 'bg-green-500';
    if (time <= threshold * 1.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Reporting Performance</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            avgReportGenerationTime <= 10 ? 'bg-green-500' : 
            avgReportGenerationTime <= 20 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            {avgReportGenerationTime <= 10 ? 'Optimal' : 
             avgReportGenerationTime <= 20 ? 'Acceptable' : 'Slow'}
          </span>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Avg Report Generation</p>
          <p className={`text-2xl font-bold ${getPerformanceColor(avgReportGenerationTime, 10)}`}>
            {avgReportGenerationTime.toFixed(1)}s
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Dashboard Load Time</p>
          <p className={`text-2xl font-bold ${getPerformanceColor(avgDashboardLoadTime, 3)}`}>
            {avgDashboardLoadTime.toFixed(1)}s
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Concurrent Users</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalConcurrentUsers}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Cache Hit Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {avgCacheHitRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Query Performance by Complexity */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Query Performance by Complexity</h4>
        <div className="space-y-4">
          {Object.entries(queryStats).map(([complexity, stats]) => {
            const avgTime = stats.totalTime / stats.count;
            const avgResource = stats.totalResource / stats.count;
            const threshold = complexity === QueryComplexity.SIMPLE ? 500 : 
                            complexity === QueryComplexity.MEDIUM ? 2000 : 5000;
            
            return (
              <div key={complexity} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {complexity} Queries ({stats.count})
                  </span>
                  <span className={`text-sm font-medium ${getPerformanceColor(avgTime, threshold)}`}>
                    {avgTime.toFixed(0)}ms avg
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${getPerformanceBarColor(avgTime, threshold)}`}
                    style={{ width: `${Math.min(100, (avgTime / (threshold * 2)) * 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Resource Usage: {avgResource.toFixed(1)} CPU-sec</span>
                  <span>Target: &lt;{threshold}ms</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Trends */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-md font-medium text-gray-900 mb-4">Performance Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analyticsData.slice(0, 4).map((pipeline) => (
            <div key={pipeline.pipelineId} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {pipeline.pipelineName}
                </span>
                <span className={`text-xs font-medium ${
                  getPerformanceColor(pipeline.reportingPerformance.reportGenerationTime, 10)
                }`}>
                  {pipeline.reportingPerformance.reportGenerationTime.toFixed(1)}s
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Dashboard Load</span>
                  <span>{pipeline.reportingPerformance.dashboardLoadTime.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Users</span>
                  <span>{pipeline.reportingPerformance.concurrentUsers}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Cache Hit</span>
                  <span>{pipeline.reportingPerformance.cacheHitRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportingPerformanceChart;