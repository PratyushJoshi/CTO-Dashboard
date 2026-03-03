'use client';

import React from 'react';
import { InfrastructureMetrics, ServerStatus } from '@/types';

interface InfrastructureOverviewProps {
  servers: InfrastructureMetrics[];
  className?: string;
}

export function InfrastructureOverview({ servers, className = '' }: InfrastructureOverviewProps) {
  const getServerStatusCounts = () => {
    const counts = {
      [ServerStatus.HEALTHY]: 0,
      [ServerStatus.WARNING]: 0,
      [ServerStatus.CRITICAL]: 0,
      [ServerStatus.DOWN]: 0,
    };

    servers.forEach(server => {
      counts[server.status]++;
    });

    return counts;
  };

  const getAverageUtilization = () => {
    if (servers.length === 0) return { cpu: 0, memory: 0, disk: 0, network: 0 };

    const totals = servers.reduce(
      (acc, server) => ({
        cpu: acc.cpu + server.cpuUtilization,
        memory: acc.memory + server.memoryUtilization,
        disk: acc.disk + server.diskUtilization,
        network: acc.network + server.networkUtilization,
      }),
      { cpu: 0, memory: 0, disk: 0, network: 0 }
    );

    return {
      cpu: totals.cpu / servers.length,
      memory: totals.memory / servers.length,
      disk: totals.disk / servers.length,
      network: totals.network / servers.length,
    };
  };

  const getTotalAPITraffic = () => {
    return servers.reduce((total, server) => ({
      apiCount: total.apiCount + server.apiTrafficCount,
      trafficVolume: total.trafficVolume + server.trafficVolume,
    }), { apiCount: 0, trafficVolume: 0 });
  };

  const statusCounts = getServerStatusCounts();
  const avgUtilization = getAverageUtilization();
  const totalTraffic = getTotalAPITraffic();

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const shouldHighlight = (utilization: number) => {
    return utilization > 80;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Infrastructure Overview</h2>
      
      {/* Server Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{statusCounts[ServerStatus.HEALTHY]}</div>
          <div className="text-sm text-green-700">Healthy</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{statusCounts[ServerStatus.WARNING]}</div>
          <div className="text-sm text-yellow-700">Warning</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">{statusCounts[ServerStatus.CRITICAL]}</div>
          <div className="text-sm text-red-700">Critical</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{statusCounts[ServerStatus.DOWN]}</div>
          <div className="text-sm text-gray-700">Down</div>
        </div>
      </div>

      {/* Average Utilization */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Average Resource Utilization</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              shouldHighlight(avgUtilization.cpu) ? getUtilizationColor(avgUtilization.cpu) : 'text-gray-900'
            }`}>
              {avgUtilization.cpu.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">CPU</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              shouldHighlight(avgUtilization.memory) ? getUtilizationColor(avgUtilization.memory) : 'text-gray-900'
            }`}>
              {avgUtilization.memory.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Memory</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              shouldHighlight(avgUtilization.disk) ? getUtilizationColor(avgUtilization.disk) : 'text-gray-900'
            }`}>
              {avgUtilization.disk.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Disk</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              shouldHighlight(avgUtilization.network) ? getUtilizationColor(avgUtilization.network) : 'text-gray-900'
            }`}>
              {avgUtilization.network.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Network</div>
          </div>
        </div>
      </div>

      {/* API Traffic Summary */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Traffic Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{totalTraffic.apiCount}</div>
            <div className="text-sm text-blue-700">Total Running APIs</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{totalTraffic.trafficVolume.toLocaleString()}</div>
            <div className="text-sm text-purple-700">Total RPM</div>
          </div>
        </div>
      </div>
    </div>
  );
}