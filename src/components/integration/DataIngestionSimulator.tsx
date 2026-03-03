import React, { useState, useEffect } from 'react';
import { 
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  CloudArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface IngestionEvent {
  id: string;
  timestamp: Date;
  source: string;
  format: string;
  recordCount: number;
  status: 'success' | 'warning' | 'error';
  processingTime: number;
  message: string;
}

interface DataIngestionSimulatorProps {
  isActive?: boolean;
  onToggle?: (active: boolean) => void;
}

export function DataIngestionSimulator({ 
  isActive = false, 
  onToggle 
}: DataIngestionSimulatorProps) {
  const [events, setEvents] = useState<IngestionEvent[]>([]);
  const [isRunning, setIsRunning] = useState(isActive);
  const [stats, setStats] = useState({
    totalEvents: 0,
    successRate: 0,
    avgProcessingTime: 0,
    recordsPerSecond: 0
  });

  const dataSources = [
    'Prometheus Monitoring',
    'New Relic APM',
    'Tableau BI',
    'MLflow Platform',
    'Jenkins QA',
    'Snowflake Analytics'
  ];

  const dataFormats = ['JSON', 'CSV', 'XML', 'Prometheus', 'Avro', 'Protobuf'];

  const generateEvent = (): IngestionEvent => {
    const source = dataSources[Math.floor(Math.random() * dataSources.length)];
    const format = dataFormats[Math.floor(Math.random() * dataFormats.length)];
    const recordCount = Math.floor(Math.random() * 1000) + 50;
    const processingTime = Math.floor(Math.random() * 500) + 50;
    
    // Simulate different outcomes
    const rand = Math.random();
    let status: IngestionEvent['status'];
    let message: string;
    
    if (rand > 0.85) {
      status = 'error';
      message = 'Connection timeout or data validation failed';
    } else if (rand > 0.75) {
      status = 'warning';
      message = 'Partial data ingested with minor issues';
    } else {
      status = 'success';
      message = 'Data successfully ingested and validated';
    }

    return {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      source,
      format,
      recordCount,
      status,
      processingTime,
      message
    };
  };

  const updateStats = (eventList: IngestionEvent[]) => {
    if (eventList.length === 0) return;

    const successCount = eventList.filter(e => e.status === 'success').length;
    const successRate = (successCount / eventList.length) * 100;
    const avgProcessingTime = eventList.reduce((sum, e) => sum + e.processingTime, 0) / eventList.length;
    const totalRecords = eventList.reduce((sum, e) => sum + e.recordCount, 0);
    const timeSpan = eventList.length > 1 ? 
      (eventList[eventList.length - 1].timestamp.getTime() - eventList[0].timestamp.getTime()) / 1000 : 1;
    const recordsPerSecond = totalRecords / Math.max(timeSpan, 1);

    setStats({
      totalEvents: eventList.length,
      successRate,
      avgProcessingTime,
      recordsPerSecond
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        const newEvent = generateEvent();
        setEvents(prev => {
          const updated = [newEvent, ...prev].slice(0, 50); // Keep last 50 events
          updateStats(updated);
          return updated;
        });
      }, 1000 + Math.random() * 2000); // Random interval between 1-3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleToggle = () => {
    const newState = !isRunning;
    setIsRunning(newState);
    if (onToggle) onToggle(newState);
  };

  const handleStop = () => {
    setIsRunning(false);
    setEvents([]);
    setStats({
      totalEvents: 0,
      successRate: 0,
      avgProcessingTime: 0,
      recordsPerSecond: 0
    });
    if (onToggle) onToggle(false);
  };

  const getStatusIcon = (status: IngestionEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: IngestionEvent['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <CloudArrowDownIcon className="h-6 w-6 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Data Ingestion Simulator</h2>
            <p className="text-sm text-gray-500">Real-time data ingestion monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggle}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRunning 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isRunning ? (
              <>
                <PauseIcon className="h-4 w-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                <span>Start</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleStop}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            <StopIcon className="h-4 w-4" />
            <span>Stop</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-blue-800">Total Events</div>
          <div className="text-2xl font-bold text-blue-900">{stats.totalEvents}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-green-800">Success Rate</div>
          <div className="text-2xl font-bold text-green-900">{stats.successRate.toFixed(1)}%</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-purple-800">Avg Processing</div>
          <div className="text-2xl font-bold text-purple-900">{stats.avgProcessingTime.toFixed(0)}ms</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-orange-800">Records/sec</div>
          <div className="text-2xl font-bold text-orange-900">{stats.recordsPerSecond.toFixed(1)}</div>
        </div>
      </div>

      {/* Event Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Live Event Stream</h3>
          {isRunning && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              <span>Live monitoring</span>
            </div>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isRunning ? 'Waiting for events...' : 'Click Start to begin data ingestion simulation'}
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(event.status)}
                    <div>
                      <div className="font-medium text-gray-900">{event.source}</div>
                      <div className="text-sm text-gray-500">
                        {event.timestamp.toLocaleTimeString()} • {event.format} format
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                  <div>
                    <span className="text-gray-600">Records:</span>
                    <span className="font-medium ml-1">{event.recordCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Processing:</span>
                    <span className="font-medium ml-1">{event.processingTime}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Throughput:</span>
                    <span className="font-medium ml-1">
                      {(event.recordCount / (event.processingTime / 1000)).toFixed(0)}/s
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">{event.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}