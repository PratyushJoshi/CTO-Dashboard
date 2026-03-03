'use client';

import React from 'react';
import { InfrastructureMetrics, ServerStatus } from '@/types';

interface ServerHealthCardProps {
  server: InfrastructureMetrics;
  className?: string;
}

export function ServerHealthCard({ server, className = '' }: ServerHealthCardProps) {
  const getStatusColor = (status: ServerStatus) => {
    switch (status) {
      case ServerStatus.HEALTHY:
        return 'text-green-600 bg-green-50 border-green-200';
      case ServerStatus.WARNING:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case ServerStatus.CRITICAL:
        return 'text-red-600 bg-red-50 border-red-200';
      case ServerStatus.DOWN:
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'bg-red-500';
    if (utilization >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUtilizationTextColor = (utilization: number) => {
    if (utilization >= 80) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const shouldHighlight = (utilization: number) => {
    return utilization > 80;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${className}`}>
      {/* Server Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{server.serverName}</h3>
          <p className="text-sm text-gray-500">ID: {server.serverId}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(server.status)}`}>
          {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
        </div>
      </div>

      {/* Utilization Metrics */}
      <div className="space-y-3">
        {/* CPU Utilization */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">CPU</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getUtilizationColor(server.cpuUtilization)}`}
                style={{ width: `${Math.min(100, server.cpuUtilization)}%` }}
              />
            </div>
            <span className={`text-sm font-medium min-w-[3rem] text-right ${
              shouldHighlight(server.cpuUtilization) ? getUtilizationTextColor(server.cpuUtilization) : 'text-gray-900'
            }`}>
              {server.cpuUtilization.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Memory Utilization */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Memory</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getUtilizationColor(server.memoryUtilization)}`}
                style={{ width: `${Math.min(100, server.memoryUtilization)}%` }}
              />
            </div>
            <span className={`text-sm font-medium min-w-[3rem] text-right ${
              shouldHighlight(server.memoryUtilization) ? getUtilizationTextColor(server.memoryUtilization) : 'text-gray-900'
            }`}>
              {server.memoryUtilization.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Disk Utilization */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Disk</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getUtilizationColor(server.diskUtilization)}`}
                style={{ width: `${Math.min(100, server.diskUtilization)}%` }}
              />
            </div>
            <span className={`text-sm font-medium min-w-[3rem] text-right ${
              shouldHighlight(server.diskUtilization) ? getUtilizationTextColor(server.diskUtilization) : 'text-gray-900'
            }`}>
              {server.diskUtilization.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Network Utilization */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Network</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getUtilizationColor(server.networkUtilization)}`}
                style={{ width: `${Math.min(100, server.networkUtilization)}%` }}
              />
            </div>
            <span className={`text-sm font-medium min-w-[3rem] text-right ${
              shouldHighlight(server.networkUtilization) ? getUtilizationTextColor(server.networkUtilization) : 'text-gray-900'
            }`}>
              {server.networkUtilization.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Server Load and API Traffic */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Server Load</p>
            <p className={`text-lg font-semibold ${
              shouldHighlight(server.loadPercentage) ? getUtilizationTextColor(server.loadPercentage) : 'text-gray-900'
            }`}>
              {server.loadPercentage.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">API Traffic</p>
            <p className="text-lg font-semibold text-gray-900">
              {server.apiTrafficCount} APIs
            </p>
            <p className="text-xs text-gray-500">
              {server.trafficVolume} RPM
            </p>
          </div>
        </div>
      </div>

      {/* Uptime */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Uptime</span>
          <span className="text-sm font-medium text-gray-900">
            {server.uptime < 24 
              ? `${server.uptime.toFixed(1)}h`
              : `${Math.floor(server.uptime / 24)}d ${(server.uptime % 24).toFixed(0)}h`
            }
          </span>
        </div>
      </div>
    </div>
  );
}