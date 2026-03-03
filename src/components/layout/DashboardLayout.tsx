'use client';

import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DashboardConfig } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  config?: DashboardConfig;
  onConfigChange?: (config: DashboardConfig) => void;
}

export function DashboardLayout({ 
  children, 
  config,
  onConfigChange 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<DashboardConfig | null>(config || null);

  useEffect(() => {
    // Set sidebar open by default on desktop
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (config) {
      setCurrentConfig(config);
    }
  }, [config]);

  const handleConfigChange = (newConfig: DashboardConfig) => {
    setCurrentConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        config={currentConfig}
        onConfigChange={handleConfigChange}
      />
      
      <div className="flex h-screen pt-16">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}>
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}