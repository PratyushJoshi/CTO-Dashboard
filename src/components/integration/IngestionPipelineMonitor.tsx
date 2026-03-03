import React, { useState, useEffect } from 'react';
import { 
  CloudArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface PipelineStage {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  duration: number; // milliseconds
  recordsProcessed: number;
  errorCount: number;
  throughput: number; // records per second
}

interface IngestionPipelineMonitorProps {
  pipelineId: string;
  pipelineName: string;
  isRealTime?: boolean;
}

export function IngestionPipelineMonitor({ 
  pipelineId, 
  pipelineName, 
  isRealTime = true 
}: IngestionPipelineMonitorProps) {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalRecords: 0,
    totalErrors: 0,
    averageThroughput: 0,
    totalDuration: 0,
    successRate: 0
  });

  useEffect(() => {
    const generateMockStages = (): PipelineStage[] => {
      const stageTemplates = [
        { name: 'Data Extraction', baseRecords: 10000, baseDuration: 2000 },
        { name: 'Data Validation', baseRecords: 9950, baseDuration: 1500 },
        { name: 'Data Transformation', baseRecords: 9900, baseDuration: 3000 },
        { name: 'Data Enrichment', baseRecords: 9900, baseDuration: 2500 },
        { name: 'Data Loading', baseRecords: 9850, baseDuration: 1800 },
        { name: 'Index Update', baseRecords: 9850, baseDuration: 1200 }
      ];

      return stageTemplates.map((template, index) => {
        const variance = 0.1; // 10% variance
        const records = Math.floor(template.baseRecords * (1 + (Math.random() - 0.5) * variance));
        const duration = Math.floor(template.baseDuration * (1 + (Math.random() - 0.5) * variance));
        const errors = Math.floor(Math.random() * 50);
        const throughput = records / (duration / 1000);

        // Simulate different statuses
        let status: PipelineStage['status'];
        if (index < 4) {
          status = 'completed';
        } else if (index === 4) {
          status = Math.random() > 0.3 ? 'running' : 'completed';
        } else {
          status = Math.random() > 0.7 ? 'failed' : 'pending';
        }

        return {
          id: `stage-${index}`,
          name: template.name,
          status,
          duration,
          recordsProcessed: records,
          errorCount: errors,
          throughput
        };
      });
    };

    const updateStages = () => {
      const newStages = generateMockStages();
      setStages(newStages);

      // Calculate overall statistics
      const totalRecords = newStages.reduce((sum, stage) => sum + stage.recordsProcessed, 0);
      const totalErrors = newStages.reduce((sum, stage) => sum + stage.errorCount, 0);
      const totalDuration = newStages.reduce((sum, stage) => sum + stage.duration, 0);
      const averageThroughput = newStages.reduce((sum, stage) => sum + stage.throughput, 0) / newStages.length;
      const successRate = totalRecords > 0 ? ((totalRecords - totalErrors) / totalRecords) * 100 : 0;

      setOverallStats({
        totalRecords,
        totalErrors,
        averageThroughput,
        totalDuration,
        successRate
      });
    };

    updateStages();

    if (isRealTime) {
      const interval = setInterval(updateStages, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isRealTime]);

  const getStatusIcon = (status: PipelineStage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'running':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: PipelineStage['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatThroughput = (throughput: number) => {
    if (throughput > 1000) {
      return `${(throughput / 1000).toFixed(1)}K/s`;
    }
    return `${Math.round(throughput)}/s`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Cog6ToothIcon className="h-6 w-6 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{pipelineName}</h2>
            <p className="text-sm text-gray-500">Pipeline ID: {pipelineId}</p>
          </div>
        </div>
        {isRealTime && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time monitoring</span>
          </div>
        )}
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <CloudArrowDownIcon className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-800">Records</span>
          </div>
          <div className="text-lg font-bold text-blue-900 mt-1">
            {(overallStats.totalRecords / 1000).toFixed(1)}K
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-800">Success Rate</span>
          </div>
          <div className="text-lg font-bold text-green-900 mt-1">
            {overallStats.successRate.toFixed(1)}%
          </div>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-800">Throughput</span>
          </div>
          <div className="text-lg font-bold text-purple-900 mt-1">
            {formatThroughput(overallStats.averageThroughput)}
          </div>
        </div>

        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-800">Duration</span>
          </div>
          <div className="text-lg font-bold text-orange-900 mt-1">
            {formatDuration(overallStats.totalDuration)}
          </div>
        </div>

        <div className="bg-red-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-800">Errors</span>
          </div>
          <div className="text-lg font-bold text-red-900 mt-1">
            {overallStats.totalErrors}
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Pipeline Stages</h3>
        {stages.map((stage, index) => (
          <div key={stage.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{stage.name}</h4>
                  <p className="text-sm text-gray-500">Stage {index + 1}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(stage.status)}
                <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(stage.status)}`}>
                  {stage.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Records Processed</div>
                <div className="font-semibold">{stage.recordsProcessed.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-600">Duration</div>
                <div className="font-semibold">{formatDuration(stage.duration)}</div>
              </div>
              <div>
                <div className="text-gray-600">Throughput</div>
                <div className="font-semibold">{formatThroughput(stage.throughput)}</div>
              </div>
              <div>
                <div className="text-gray-600">Errors</div>
                <div className={`font-semibold ${stage.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stage.errorCount}
                </div>
              </div>
            </div>

            {/* Progress bar for running stages */}
            {stage.status === 'running' && (
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>Processing...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pipeline Flow Visualization */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Data Flow</h3>
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  stage.status === 'completed' ? 'bg-green-500' :
                  stage.status === 'running' ? 'bg-blue-500' :
                  stage.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                }`}></div>
                <div className="text-xs text-gray-600 mt-1 text-center max-w-16">
                  {stage.name.split(' ')[0]}
                </div>
              </div>
              {index < stages.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}