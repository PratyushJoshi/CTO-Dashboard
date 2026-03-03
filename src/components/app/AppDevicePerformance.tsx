'use client';

import React from 'react';
import { AppPerformanceMetrics, DeviceType, NetworkCondition } from '../../types';

interface AppDevicePerformanceProps {
  appMetrics: AppPerformanceMetrics[];
}

const AppDevicePerformance: React.FC<AppDevicePerformanceProps> = ({ appMetrics }) => {
  // Aggregate device performance data across all applications
  const aggregateDeviceData = () => {
    const deviceData = new Map<string, {
      totalLoadTime: number;
      totalScore: number;
      count: number;
      deviceType: DeviceType;
      networkCondition: NetworkCondition;
    }>();

    appMetrics.forEach(app => {
      app.devicePerformance.forEach(device => {
        const key = `${device.deviceType}-${device.networkCondition}`;
        const existing = deviceData.get(key);
        
        if (existing) {
          existing.totalLoadTime += device.averageLoadTime;
          existing.totalScore += device.performanceScore;
          existing.count += 1;
        } else {
          deviceData.set(key, {
            totalLoadTime: device.averageLoadTime,
            totalScore: device.performanceScore,
            count: 1,
            deviceType: device.deviceType,
            networkCondition: device.networkCondition
          });
        }
      });
    });

    return Array.from(deviceData.entries()).map(([key, data]) => ({
      key,
      deviceType: data.deviceType,
      networkCondition: data.networkCondition,
      averageLoadTime: Math.round(data.totalLoadTime / data.count),
      averageScore: Math.round(data.totalScore / data.count),
      appCount: data.count
    }));
  };

  const deviceData = aggregateDeviceData();

  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case DeviceType.DESKTOP:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case DeviceType.TABLET:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
          </svg>
        );
      case DeviceType.MOBILE:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getNetworkBadgeColor = (networkCondition: NetworkCondition) => {
    switch (networkCondition) {
      case NetworkCondition.ETHERNET:
        return 'bg-green-100 text-green-800';
      case NetworkCondition.WIFI:
        return 'bg-blue-100 text-blue-800';
      case NetworkCondition.FAST_3G:
        return 'bg-yellow-100 text-yellow-800';
      case NetworkCondition.SLOW_3G:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBarColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDeviceType = (deviceType: DeviceType) => {
    return deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
  };

  const formatNetworkCondition = (networkCondition: NetworkCondition) => {
    switch (networkCondition) {
      case NetworkCondition.ETHERNET:
        return 'Ethernet';
      case NetworkCondition.WIFI:
        return 'WiFi';
      case NetworkCondition.FAST_3G:
        return 'Fast 3G';
      case NetworkCondition.SLOW_3G:
        return 'Slow 3G';
      default:
        return networkCondition;
    }
  };

  if (deviceData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Performance Segmentation</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          No device performance data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Device Performance Segmentation</h3>
        <p className="text-sm text-gray-500">Performance by device type and network conditions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deviceData.map((device) => (
          <div key={device.key} className="border border-gray-200 rounded-lg p-4">
            {/* Device Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-gray-600">
                  {getDeviceIcon(device.deviceType)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {formatDeviceType(device.deviceType)}
                  </h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNetworkBadgeColor(device.networkCondition)}`}>
                    {formatNetworkCondition(device.networkCondition)}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              {/* Load Time */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Avg Load Time</span>
                  <span className="font-medium text-gray-900">
                    {(device.averageLoadTime / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      device.averageLoadTime < 2000 ? 'bg-green-500' : 
                      device.averageLoadTime < 4000 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.max(10, (8000 - device.averageLoadTime) / 8000 * 100))}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Performance Score */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Performance Score</span>
                  <span className={`font-medium ${getPerformanceColor(device.averageScore)}`}>
                    {device.averageScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getPerformanceBarColor(device.averageScore)}`}
                    style={{ width: `${device.averageScore}%` }}
                  ></div>
                </div>
              </div>

              {/* App Count */}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                <span className="text-gray-600">Applications</span>
                <span className="font-medium text-gray-900">{device.appCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Performance Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Best Performance:</span>
            <span className="ml-2 font-medium text-green-600">
              {deviceData.reduce((best, current) => 
                current.averageScore > best.averageScore ? current : best
              ).deviceType} on {formatNetworkCondition(
                deviceData.reduce((best, current) => 
                  current.averageScore > best.averageScore ? current : best
                ).networkCondition
              )}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Fastest Load:</span>
            <span className="ml-2 font-medium text-blue-600">
              {(deviceData.reduce((fastest, current) => 
                current.averageLoadTime < fastest.averageLoadTime ? current : fastest
              ).averageLoadTime / 1000).toFixed(1)}s
            </span>
          </div>
          <div>
            <span className="text-gray-600">Needs Optimization:</span>
            <span className="ml-2 font-medium text-red-600">
              {deviceData.filter(d => d.averageScore < 70).length} configurations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDevicePerformance;