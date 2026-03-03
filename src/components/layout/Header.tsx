'use client';

import React, { useState, useEffect } from 'react';
import { DashboardConfig } from '@/types';
import { Bars3Icon, Cog6ToothIcon, BellIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  config?: DashboardConfig | null;
  onConfigChange?: (config: DashboardConfig) => void;
}

export function Header({ 
  onToggleSidebar, 
  sidebarOpen, 
  config, 
  onConfigChange 
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showConfigMenu, setShowConfigMenu] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu') && !target.closest('.config-menu')) {
        setShowUserMenu(false);
        setShowConfigMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleRefreshIntervalChange = (interval: number) => {
    if (config && onConfigChange) {
      const updatedConfig = {
        ...config,
        refreshInterval: interval
      };
      onConfigChange(updatedConfig);
    }
    setShowConfigMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section - Logo and menu toggle */}
        <div className="flex items-center space-x-4">
          {/* Sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CTO</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                CTO Dashboard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Executive Technology Monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Center section - Status indicators */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Live Data
            </span>
          </div>
          
          {config && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Refresh: {config.refreshInterval}s
            </div>
          )}
        </div>

        {/* Right section - User controls */}
        <div className="flex items-center space-x-2">
          {/* Configuration menu */}
          <div className="relative config-menu">
            <button
              onClick={() => setShowConfigMenu(!showConfigMenu)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Dashboard settings"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>

            {showConfigMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    Refresh Interval
                  </div>
                  {[5, 10, 30, 60].map((interval) => (
                    <button
                      key={interval}
                      onClick={() => handleRefreshIntervalChange(interval)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        config?.refreshInterval === interval
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {interval} seconds
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 relative transition-colors"
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative user-menu">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">CTO</span>
              </div>
              <ChevronDownIcon className="w-4 h-4 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-medium">Chief Technology Officer</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">cto@company.com</div>
                  </div>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Profile Settings
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Dashboard Preferences
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}