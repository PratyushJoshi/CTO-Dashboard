'use client';

import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { AppPerformanceMetrics, TrendDirection } from '../../types';

interface AppPerformanceTrendsProps {
  appMetrics: AppPerformanceMetrics[];
}

const AppPerformanceTrends: React.FC<AppPerformanceTrendsProps> = ({ appMetrics }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || appMetrics.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Aggregate trend data across all applications - moved inside useEffect
    const aggregateTrendData = () => {
      if (appMetrics.length === 0) return [];

      // Get all unique dates from performance trends
      const dateMap = new Map<string, {
        totalScore: number;
        count: number;
        trends: TrendDirection[];
      }>();

      appMetrics.forEach(app => {
        app.performanceTrends.forEach(trend => {
          const dateKey = trend.period.start.toDateString();
          const existing = dateMap.get(dateKey);
          
          if (existing) {
            existing.totalScore += trend.averagePerformance;
            existing.count += 1;
            existing.trends.push(trend.trend);
          } else {
            dateMap.set(dateKey, {
              totalScore: trend.averagePerformance,
              count: 1,
              trends: [trend.trend]
            });
          }
        });
      });

      // Convert to array and sort by date
      return Array.from(dateMap.entries())
        .map(([dateKey, data]) => {
          // Determine overall trend for the day
          const improvingCount = data.trends.filter(t => t === TrendDirection.IMPROVING).length;
          const degradingCount = data.trends.filter(t => t === TrendDirection.DEGRADING).length;
          
          let overallTrend: TrendDirection;
          if (improvingCount > degradingCount) {
            overallTrend = TrendDirection.IMPROVING;
          } else if (degradingCount > improvingCount) {
            overallTrend = TrendDirection.DEGRADING;
          } else {
            overallTrend = TrendDirection.STABLE;
          }

          return {
            date: new Date(dateKey),
            label: new Date(dateKey).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            averageScore: data.totalScore / data.count,
            trend: overallTrend,
            appCount: data.count
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    };

    const trendData = aggregateTrendData();
    
    if (trendData.length === 0) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: trendData.map(d => d.label),
        datasets: [
          {
            label: 'Average Performance Score',
            data: trendData.map(d => d.averageScore),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Historical Performance Trends (Last 7 Days)',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                if (value === null || value === undefined) return '';
                const trend = trendData[context.dataIndex].trend;
                const trendIcon = trend === TrendDirection.IMPROVING ? '↗️' : 
                                trend === TrendDirection.DEGRADING ? '↘️' : '→';
                return `Performance: ${value.toFixed(1)}/100 ${trendIcon}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Performance Score'
            },
            ticks: {
              callback: function(value) {
                return `${value}/100`;
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        },
        elements: {
          point: {
            hoverRadius: 8
          }
        }
      }
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [appMetrics]);

  const trendData = appMetrics.length === 0 ? [] : (() => {
    // Get all unique dates from performance trends
    const dateMap = new Map<string, {
      totalScore: number;
      count: number;
      trends: TrendDirection[];
    }>();

    appMetrics.forEach(app => {
      app.performanceTrends.forEach(trend => {
        const dateKey = trend.period.start.toDateString();
        const existing = dateMap.get(dateKey);
        
        if (existing) {
          existing.totalScore += trend.averagePerformance;
          existing.count += 1;
          existing.trends.push(trend.trend);
        } else {
          dateMap.set(dateKey, {
            totalScore: trend.averagePerformance,
            count: 1,
            trends: [trend.trend]
          });
        }
      });
    });

    // Convert to array and sort by date
    return Array.from(dateMap.entries())
      .map(([dateKey, data]) => {
        // Determine overall trend for the day
        const improvingCount = data.trends.filter(t => t === TrendDirection.IMPROVING).length;
        const degradingCount = data.trends.filter(t => t === TrendDirection.DEGRADING).length;
        
        let overallTrend: TrendDirection;
        if (improvingCount > degradingCount) {
          overallTrend = TrendDirection.IMPROVING;
        } else if (degradingCount > improvingCount) {
          overallTrend = TrendDirection.DEGRADING;
        } else {
          overallTrend = TrendDirection.STABLE;
        }

        return {
          date: new Date(dateKey),
          label: new Date(dateKey).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          averageScore: data.totalScore / data.count,
          trend: overallTrend,
          appCount: data.count
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  })();

  // Calculate trend statistics
  const calculateTrendStats = () => {
    if (trendData.length < 2) return null;

    const latest = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];
    const change = latest.averageScore - previous.averageScore;
    const changePercent = (change / previous.averageScore) * 100;

    const overallTrend = change > 1 ? TrendDirection.IMPROVING : 
                        change < -1 ? TrendDirection.DEGRADING : TrendDirection.STABLE;

    return {
      change,
      changePercent,
      trend: overallTrend,
      latest: latest.averageScore,
      previous: previous.averageScore
    };
  };

  const trendStats = calculateTrendStats();

  const getTrendIcon = (trend: TrendDirection) => {
    switch (trend) {
      case TrendDirection.IMPROVING:
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case TrendDirection.DEGRADING:
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getTrendColor = (trend: TrendDirection) => {
    switch (trend) {
      case TrendDirection.IMPROVING:
        return 'text-green-600';
      case TrendDirection.DEGRADING:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (trendData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No trend data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
        {trendStats && (
          <div className="flex items-center space-x-2">
            {getTrendIcon(trendStats.trend)}
            <span className={`text-sm font-medium ${getTrendColor(trendStats.trend)}`}>
              {trendStats.changePercent > 0 ? '+' : ''}{trendStats.changePercent.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Trend Summary Cards */}
      {trendStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Current Score</div>
            <div className="text-2xl font-bold text-gray-900">
              {trendStats.latest.toFixed(1)}/100
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Change from Yesterday</div>
            <div className={`text-2xl font-bold ${getTrendColor(trendStats.trend)}`}>
              {trendStats.change > 0 ? '+' : ''}{trendStats.change.toFixed(1)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Trend Direction</div>
            <div className={`text-lg font-medium ${getTrendColor(trendStats.trend)} flex items-center`}>
              {getTrendIcon(trendStats.trend)}
              <span className="ml-2">
                {trendStats.trend === TrendDirection.IMPROVING ? 'Improving' :
                 trendStats.trend === TrendDirection.DEGRADING ? 'Degrading' : 'Stable'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>

      {/* Trend Analysis */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          Performance trend analysis based on {appMetrics.length} applications over the last 7 days.
          {trendStats && trendStats.trend === TrendDirection.DEGRADING && (
            <span className="text-red-600 font-medium ml-1">
              Performance degradation detected - consider investigating recent changes.
            </span>
          )}
          {trendStats && trendStats.trend === TrendDirection.IMPROVING && (
            <span className="text-green-600 font-medium ml-1">
              Performance improvements observed - optimizations are working well.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default AppPerformanceTrends;