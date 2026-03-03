'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MinimalLayout } from '@/components/layout/MinimalLayout';
import { MockDataGenerator } from '@/mock/MockDataGenerator';
import { AlertSeverity } from '@/types';
import { 
  ServerIcon, 
  CloudIcon, 
  DevicePhoneMobileIcon, 
  CurrencyDollarIcon,
  CpuChipIcon,
  BeakerIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const [mockData, setMockData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const generator = new MockDataGenerator();
    const data = generator.generateAllMetrics();
    setMockData(data);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const getSummaryStats = () => {
    if (!mockData) return null;

    const criticalAlerts = mockData.alerts?.filter((alert: any) => 
      alert.severity === AlertSeverity.CRITICAL && alert.status === 'active'
    ).length || 0;

    const highAlerts = mockData.alerts?.filter((alert: any) => 
      alert.severity === AlertSeverity.HIGH && alert.status === 'active'
    ).length || 0;

    const healthyServers = mockData.infrastructure?.filter((server: any) => 
      server.status === 'healthy'
    ).length || 0;

    const totalServers = mockData.infrastructure?.length || 0;

    const avgApiLatency = mockData.apiPerformance?.reduce((sum: number, api: any) => 
      sum + api.averageLatency, 0
    ) / (mockData.apiPerformance?.length || 1);

    const totalCost = mockData.businessCost?.reduce((sum: number, cost: any) => 
      sum + cost.totalCost, 0
    ) || 0;

    return {
      criticalAlerts,
      highAlerts,
      healthyServers,
      totalServers,
      avgApiLatency: Math.round(avgApiLatency),
      totalCost: Math.round(totalCost)
    };
  };

  const stats = getSummaryStats();

  const departmentCards = [
    {
      title: 'Infrastructure',
      description: 'Server health and system performance',
      href: '/infrastructure-performance',
      icon: ServerIcon,
      color: 'bg-blue-500',
      stats: stats ? `${stats.healthyServers}/${stats.totalServers} Healthy` : 'Loading...'
    },
    {
      title: 'API Performance',
      description: 'API latency and error tracking',
      href: '/api-performance',
      icon: CloudIcon,
      color: 'bg-green-500',
      stats: stats ? `${stats.avgApiLatency}ms Avg` : 'Loading...'
    },
    {
      title: 'App Performance',
      description: 'App crashes and load times',
      href: '/app-performance',
      icon: DevicePhoneMobileIcon,
      color: 'bg-purple-500',
      stats: mockData?.appPerformance ? `${mockData.appPerformance.length} Apps` : 'Loading...'
    },
    {
      title: 'Business Cost',
      description: 'Cost analysis and optimization',
      href: '/business-cost',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      stats: stats ? `$${(stats.totalCost / 1000).toFixed(1)}K` : 'Loading...'
    },
    {
      title: 'AI Department',
      description: 'AI model performance and costs',
      href: '/ai-performance',
      icon: CpuChipIcon,
      color: 'bg-indigo-500',
      stats: mockData?.aiMetrics ? `${mockData.aiMetrics.length} Models` : 'Loading...'
    },
    {
      title: 'QA Department',
      description: 'Test coverage and defect rates',
      href: '/qa-performance',
      icon: BeakerIcon,
      color: 'bg-pink-500',
      stats: mockData?.qaMetrics ? `${mockData.qaMetrics.length} Projects` : 'Loading...'
    },
    {
      title: 'Business Analytics',
      description: 'Data pipelines and reporting',
      href: '/business-analytics',
      icon: ChartBarIcon,
      color: 'bg-teal-500',
      stats: mockData?.businessAnalytics ? `${mockData.businessAnalytics.length} Pipelines` : 'Loading...'
    }
  ];

  return (
    <MinimalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Executive Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive technology performance and business impact overview
          </p>
        </div>

        {/* Alert Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.criticalAlerts}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Critical Alerts</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.highAlerts}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">High Priority</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round((stats.healthyServers / stats.totalServers) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">System Health</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Cards */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Department Dashboards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {departmentCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <Link key={card.href} href={card.href}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer h-full">
                    <div className="flex items-center mb-4">
                      <div className={`${card.color} rounded-lg p-3`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{card.description}</p>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{card.stats}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Metrics */}
        {mockData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">System Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{mockData.infrastructure?.length || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Servers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{mockData.apiPerformance?.length || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">APIs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{mockData.appPerformance?.length || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Applications</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">{mockData.businessAnalytics?.length || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pipelines</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MinimalLayout>
  );
}
