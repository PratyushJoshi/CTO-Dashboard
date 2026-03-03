'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardConfig, MetricType } from '@/types';
import { 
  HomeIcon,
  ServerIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  CurrencyDollarIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CircleStackIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  metricType?: MetricType;
  href: string;
  badge?: number;
  status?: 'healthy' | 'warning' | 'critical';
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
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

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      name: 'Overview',
      href: '/',
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      href: '/infrastructure-performance',
      metricType: MetricType.INFRASTRUCTURE,
      status: 'warning',
      badge: 3,
      icon: <ServerIcon className="w-5 h-5" />,
    },
    {
      id: 'api-performance',
      name: 'API Performance',
      href: '/api-performance',
      metricType: MetricType.API_PERFORMANCE,
      status: 'healthy',
      icon: <BoltIcon className="w-5 h-5" />,
    },
    {
      id: 'app-performance',
      name: 'App Performance',
      href: '/app-performance',
      metricType: MetricType.APP_PERFORMANCE,
      status: 'healthy',
      icon: <DevicePhoneMobileIcon className="w-5 h-5" />,
    },
    {
      id: 'business-cost',
      name: 'Business Costs',
      href: '/business-cost',
      metricType: MetricType.BUSINESS_COST,
      status: 'critical',
      badge: 1,
      icon: <CurrencyDollarIcon className="w-5 h-5" />,
    },
    {
      id: 'ai-metrics',
      name: 'AI Department',
      href: '/ai-performance',
      metricType: MetricType.AI_METRICS,
      status: 'healthy',
      icon: <CpuChipIcon className="w-5 h-5" />,
    },
    {
      id: 'qa-metrics',
      name: 'QA Department',
      href: '/qa-performance',
      metricType: MetricType.QA_METRICS,
      status: 'warning',
      badge: 2,
      icon: <CheckCircleIcon className="w-5 h-5" />,
    },
    {
      id: 'analytics',
      name: 'Business Analytics',
      href: '/business-analytics',
      metricType: MetricType.ANALYTICS,
      status: 'healthy',
      icon: <ChartBarIcon className="w-5 h-5" />,
    },
    {
      id: 'data-integration',
      name: 'Data Integration',
      href: '/data-integration',
      status: 'healthy',
      icon: <CircleStackIcon className="w-5 h-5" />,
    },
  ];

  const systemManagementItems = [
    {
      id: 'alerts',
      name: 'Alerts & Notifications',
      href: '/alerts',
      badge: 5,
      icon: <BellIcon className="w-5 h-5" />,
    },
    {
      id: 'settings',
      name: 'Settings',
      href: '/settings',
      icon: <Cog6ToothIcon className="w-5 h-5" />,
    },
  ];

  const quickActions = [
    {
      id: 'export',
      name: 'Export Report',
      action: () => console.log('Export report'),
      icon: <ArrowDownTrayIcon className="w-5 h-5" />,
    },
    {
      id: 'share',
      name: 'Share Dashboard',
      action: () => console.log('Share dashboard'),
      icon: <ShareIcon className="w-5 h-5" />,
    },
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity lg:hidden z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out z-40 w-64 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
      <div className="flex flex-col h-full">
        {/* Navigation sections */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {/* Main Dashboard Sections */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Dashboard Modules
            </h3>
            <div className="mt-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      onClose?.();
                    }
                  }}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActiveRoute(item.href)
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className={`mr-3 ${getStatusColor(item.status)}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Alerts and Settings */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              System Management
            </h3>
            <div className="mt-3 space-y-1">
              {systemManagementItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose?.();
                    }
                  }}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActiveRoute(item.href)
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3 text-gray-400">
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="mt-3 space-y-1">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="mr-3 text-gray-400">
                    {action.icon}
                  </span>
                  {action.name}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer with system status */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>System Status</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Operational</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Last updated: {currentTime || '--:--:--'}
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}