'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { InfrastructureMetrics, Alert } from '@/types';
import { MockDataGenerator } from '@/mock/MockDataGenerator';
import { InfrastructureOverview } from './InfrastructureOverview';
import { ServerHealthCard } from './ServerHealthCard';
import { InfrastructureAlerts } from './InfrastructureAlerts';

interface InfrastructureDashboardProps {
  className?: string;
}

export function InfrastructureDashboard({ className = '' }: InfrastructureDashboardProps) {
  const [servers, setServers] = useState<InfrastructureMetrics[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const mockGenerator = useMemo(() => new MockDataGenerator(), []);

  const refreshData = useCallback(() => {
    setLoading(true);
    try {
      const infrastructureData = mockGenerator.generateInfrastructureMetrics();
      const alertData = mockGenerator.generateAlerts();
      
      setServers(infrastructureData);
      setAlerts(alertData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error generating infrastructure data:', error);
    } finally {
      setLoading(false);
    }
  }, [mockGenerator]);

  useEffect(() => {
    refreshData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    
    return () => clearInterval(interval);
  }, [refreshData]);

  if (loading && servers.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infrastructure Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Real-time server health and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Refreshing...</span>
              </div>
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>

      {/* Overview Section */}
      <InfrastructureOverview servers={servers} />

      {/* Alerts Section */}
      <InfrastructureAlerts servers={servers} alerts={alerts} />

      {/* Server Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Server Health Details</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {servers.map((server) => (
            <ServerHealthCard
              key={server.serverId}
              server={server}
            />
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {servers.length}
            </div>
            <div className="text-sm text-gray-600">Total Servers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {servers.filter(s => s.status === 'healthy').length}
            </div>
            <div className="text-sm text-gray-600">Healthy Servers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {servers.reduce((sum, s) => sum + s.apiTrafficCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Running APIs</div>
          </div>
        </div>
      </div>
    </div>
  );
}