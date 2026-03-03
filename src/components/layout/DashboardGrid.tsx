'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DashboardConfig, WidgetLayout, WidgetType } from '@/types';
import { APIPerformanceWidget } from '@/components/api';
import { AIWidget } from '@/components/ai';
import { QAWidget } from '@/components/qa';
import { BusinessCostWidget } from '@/components/business';
import { AnalyticsWidget } from '@/components/analytics';

interface DashboardGridProps {
  config?: DashboardConfig;
  onConfigChange?: (config: DashboardConfig) => void;
  children?: React.ReactNode;
}

interface GridItem {
  id: string;
  title: string;
  component: React.ReactNode;
  size: 'small' | 'medium' | 'large';
}

export function DashboardGrid({ 
  config, 
  onConfigChange, 
  children 
}: DashboardGridProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Set initial time and update every second
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    
    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  // Clean, organized grid items
  const gridItems: GridItem[] = [
    {
      id: 'system-overview',
      title: 'System Overview',
      size: 'large',
      component: (
        <div className="h-full bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">System Health</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-700 mb-1">98.5%</div>
              <div className="text-sm text-green-600">System Uptime</div>
              <div className="text-xs text-green-500 mt-1">↗ +0.2% from last week</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-700 mb-1">24</div>
              <div className="text-sm text-blue-600">Active APIs</div>
              <div className="text-xs text-blue-500 mt-1">All services operational</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'api-performance',
      title: 'API Performance',
      size: 'large',
      component: <APIPerformanceWidget />,
    },
    {
      id: 'ai-department',
      title: 'AI Department',
      size: 'medium',
      component: <AIWidget />,
    },
    {
      id: 'qa-department',
      title: 'QA Department',
      size: 'medium',
      component: <QAWidget />,
    },
    {
      id: 'infrastructure-health',
      title: 'Infrastructure Health',
      size: 'medium',
      component: (
        <div className="h-full bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">CPU Usage</span>
              <span className="text-sm text-gray-900">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Memory</span>
              <span className="text-sm text-gray-900">60%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: '60%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Disk I/O</span>
              <span className="text-sm text-gray-900">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full transition-all duration-300" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'business-costs',
      title: 'Business Costs',
      size: 'medium',
      component: <BusinessCostWidget />,
    },
    {
      id: 'business-analytics',
      title: 'Business Analytics',
      size: 'medium',
      component: <AnalyticsWidget />,
    },
    {
      id: 'recent-alerts',
      title: 'Recent Alerts',
      size: 'medium',
      component: (
        <div className="h-full bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">3 Active</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">High CPU Usage</p>
                <p className="text-xs text-gray-600">Server-01 • 2 min ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">AI Model Drift Alert</p>
                <p className="text-xs text-gray-600">Recommendation Model • 8 min ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Deployment Complete</p>
                <p className="text-xs text-gray-600">Fraud Detection v3 • 15 min ago</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const saveLayout = useCallback(() => {
    if (config && onConfigChange) {
      const widgetLayouts: WidgetLayout[] = gridItems.map((item, index) => ({
        id: item.id,
        type: WidgetType.METRIC_CARD,
        position: {
          x: index % 3,
          y: Math.floor(index / 3),
          width: item.size === 'large' ? 2 : 1,
          height: 1,
        },
        config: {
          title: item.title,
          metricTypes: [],
          timeRange: '1h',
          refreshInterval: 30,
        },
      }));

      const updatedConfig: DashboardConfig = {
        ...config,
        layout: widgetLayouts,
      };

      onConfigChange(updatedConfig);
    }
  }, [config, onConfigChange, gridItems]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header - Responsive */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CTO Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Real-time insights into your technology stack</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">Live Data • Last updated: {currentTime || '--:--:--'}</span>
              <span className="sm:hidden">Live • {currentTime || '--:--:--'}</span>
            </div>
            <button
              onClick={saveLayout}
              className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors touch-manipulation"
            >
              Save Layout
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr">
        {gridItems.map((item) => (
          <div
            key={item.id}
            className={`
              ${item.size === 'large' ? 'sm:col-span-2 lg:col-span-2 xl:col-span-2' : ''}
              ${item.size === 'medium' ? 'sm:col-span-1 lg:col-span-1 xl:col-span-1' : ''}
              ${item.size === 'small' ? 'sm:col-span-1 lg:col-span-1 xl:col-span-1' : ''}
              min-h-[280px] sm:min-h-[300px] lg:min-h-[320px] 
              transition-all duration-200 hover:shadow-lg
              touch-manipulation
            `}
          >
            {item.component}
          </div>
        ))}
      </div>

      {children}
    </div>
  );
}