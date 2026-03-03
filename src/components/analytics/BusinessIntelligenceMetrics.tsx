import React from 'react';
import { BusinessAnalyticsMetrics } from '../../types';

interface BusinessIntelligenceMetricsProps {
  analyticsData: BusinessAnalyticsMetrics[];
}

const BusinessIntelligenceMetrics: React.FC<BusinessIntelligenceMetricsProps> = ({ analyticsData }) => {
  // Aggregate BI metrics across all pipelines
  const avgDataAccuracy = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.businessIntelligence.dataAccuracyScore, 0) / analyticsData.length;
  
  const totalInsightGeneration = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.businessIntelligence.insightGenerationRate, 0);
  
  // Aggregate user engagement metrics
  const totalActiveUsers = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.businessIntelligence.userEngagementMetrics.activeUsers, 0);
  
  const avgSessionDuration = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.businessIntelligence.userEngagementMetrics.sessionDuration, 0) / analyticsData.length;
  
  const avgInteractionRate = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.businessIntelligence.userEngagementMetrics.interactionRate, 0) / analyticsData.length;
  
  const avgRetentionRate = analyticsData.reduce((sum, pipeline) => 
    sum + pipeline.businessIntelligence.userEngagementMetrics.retentionRate, 0) / analyticsData.length;

  // Aggregate report usage statistics
  const allReports = analyticsData.flatMap(pipeline => 
    pipeline.businessIntelligence.reportUsageStatistics
  );
  
  const totalReportViews = allReports.reduce((sum, report) => sum + report.viewCount, 0);
  const totalUniqueUsers = allReports.reduce((sum, report) => sum + report.uniqueUsers, 0);
  const avgViewTime = allReports.reduce((sum, report) => sum + report.averageViewTime, 0) / allReports.length;

  // Sort reports by popularity
  const popularReports = allReports
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  const getAccuracyColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementColor = (rate: number, threshold: number) => {
    if (rate >= threshold) return 'text-green-600';
    if (rate >= threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Business Intelligence Metrics</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            avgDataAccuracy >= 95 ? 'bg-green-500' : 
            avgDataAccuracy >= 90 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            {avgDataAccuracy >= 95 ? 'Excellent' : 
             avgDataAccuracy >= 90 ? 'Good' : 'Needs Attention'}
          </span>
        </div>
      </div>

      {/* Key BI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Data Accuracy</p>
          <p className={`text-2xl font-bold ${getAccuracyColor(avgDataAccuracy)}`}>
            {avgDataAccuracy.toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Insights/Day</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalInsightGeneration.toFixed(1)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Active Users</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalActiveUsers}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Retention Rate</p>
          <p className={`text-2xl font-bold ${getEngagementColor(avgRetentionRate, 80)}`}>
            {avgRetentionRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* User Engagement Metrics */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">User Engagement</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Session Duration</span>
              <span className={`text-lg font-bold ${getEngagementColor(avgSessionDuration, 20)}`}>
                {avgSessionDuration.toFixed(1)}m
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  avgSessionDuration >= 20 ? 'bg-green-500' : 
                  avgSessionDuration >= 15 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (avgSessionDuration / 30) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Target: 20+ minutes</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Interaction Rate</span>
              <span className={`text-lg font-bold ${getEngagementColor(avgInteractionRate, 10)}`}>
                {avgInteractionRate.toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  avgInteractionRate >= 10 ? 'bg-green-500' : 
                  avgInteractionRate >= 7 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (avgInteractionRate / 20) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Clicks per session</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Report Views</span>
              <span className="text-lg font-bold text-gray-900">
                {totalReportViews.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Unique Users: {totalUniqueUsers}</span>
              <span>Avg Time: {avgViewTime.toFixed(1)}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Reports */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Most Popular Reports</h4>
        <div className="space-y-3">
          {popularReports.map((report, index) => (
            <div key={`${report.reportName}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-gray-300 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{report.reportName}</p>
                  <p className="text-xs text-gray-600">
                    {report.uniqueUsers} users • Avg {report.averageViewTime.toFixed(1)}m view time
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{report.viewCount}</p>
                <p className="text-xs text-gray-600">views</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Quality Indicators */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-md font-medium text-gray-900 mb-4">Data Quality by Pipeline</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analyticsData.slice(0, 4).map((pipeline) => (
            <div key={pipeline.pipelineId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {pipeline.pipelineName}
                </p>
                <p className="text-xs text-gray-600">
                  {pipeline.businessIntelligence.insightGenerationRate.toFixed(1)} insights/day
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${getAccuracyColor(pipeline.businessIntelligence.dataAccuracyScore)}`}>
                  {pipeline.businessIntelligence.dataAccuracyScore.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600">accuracy</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligenceMetrics;