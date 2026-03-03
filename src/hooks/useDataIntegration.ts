import { useState, useEffect, useCallback, useRef } from 'react';
import { dataAggregationService, DataAggregationService } from '../services/DataAggregationService';
import { AggregatedMetrics } from '../services/DataIntegrationService';
import {
  InfrastructureMetrics,
  APIPerformanceMetrics,
  AppPerformanceMetrics,
  BusinessCostMetrics,
  AIMetrics,
  QAMetrics,
  BusinessAnalyticsMetrics,
  DataIntegrationMetrics,
  MetricType
} from '../types';

export interface DataIntegrationState {
  metrics: AggregatedMetrics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isRealTime: boolean;
}

export interface DataIntegrationActions {
  refreshMetrics: () => Promise<void>;
  setRealTimeMode: (enabled: boolean) => void;
  activateScenario: (scenarioName: string) => void;
  deactivateScenario: () => void;
  testConnections: () => Promise<Map<string, boolean>>;
  getDataQuality: () => Promise<any>;
}

/**
 * React hook for data integration and real-time metrics
 * Requirements: 8.4 - Real-time updates within 30 seconds
 */
export function useDataIntegration(): DataIntegrationState & DataIntegrationActions {
  const [state, setState] = useState<DataIntegrationState>({
    metrics: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
    isRealTime: true
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  /**
   * Fetch metrics with error handling
   */
  const fetchMetrics = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const metrics = await dataAggregationService.getAllMetrics();
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          metrics,
          isLoading: false,
          lastUpdated: new Date(),
          error: null
        }));
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch metrics'
        }));
      }
    }
  }, []);

  /**
   * Refresh metrics manually
   */
  const refreshMetrics = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  /**
   * Set real-time mode
   * Requirements: 8.4 - 30-second refresh capability
   */
  const setRealTimeMode = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, isRealTime: enabled }));
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (enabled) {
      // Start real-time updates every 30 seconds
      intervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          fetchMetrics();
        }
      }, 30000); // 30 seconds
    }
  }, [fetchMetrics]);

  /**
   * Activate a test scenario
   */
  const activateScenario = useCallback((scenarioName: string) => {
    dataAggregationService.activateScenario(scenarioName);
    // Refresh metrics to show scenario effects
    fetchMetrics();
  }, [fetchMetrics]);

  /**
   * Deactivate current scenario
   */
  const deactivateScenario = useCallback(() => {
    dataAggregationService.deactivateScenario();
    // Refresh metrics to show normal state
    fetchMetrics();
  }, [fetchMetrics]);

  /**
   * Test all data source connections
   */
  const testConnections = useCallback(async (): Promise<Map<string, boolean>> => {
    return await dataAggregationService.testAllConnections();
  }, []);

  /**
   * Get data quality metrics
   */
  const getDataQuality = useCallback(async () => {
    return await dataAggregationService.getDataQualityMetrics();
  }, []);

  // Initialize and cleanup
  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    fetchMetrics();
    
    // Start real-time updates if enabled
    if (state.isRealTime) {
      setRealTimeMode(true);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refreshMetrics,
    setRealTimeMode,
    activateScenario,
    deactivateScenario,
    testConnections,
    getDataQuality
  };
}

/**
 * Hook for specific metric types with caching
 */
export function useMetricsByType<T>(
  metricType: MetricType,
  refreshInterval: number = 30000
): {
  data: T[] | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let metrics: any[];
      
      switch (metricType) {
        case MetricType.INFRASTRUCTURE:
          metrics = await dataAggregationService.getInfrastructureMetrics();
          break;
        case MetricType.API_PERFORMANCE:
          metrics = await dataAggregationService.getAPIPerformanceMetrics();
          break;
        case MetricType.APP_PERFORMANCE:
          metrics = await dataAggregationService.getAppPerformanceMetrics();
          break;
        case MetricType.BUSINESS_COST:
          metrics = await dataAggregationService.getBusinessCostMetrics();
          break;
        case MetricType.AI_METRICS:
          metrics = await dataAggregationService.getAIMetrics();
          break;
        case MetricType.QA_METRICS:
          metrics = await dataAggregationService.getQAMetrics();
          break;
        case MetricType.ANALYTICS:
          metrics = await dataAggregationService.getBusinessAnalyticsMetrics();
          break;
        default:
          metrics = [];
      }

      if (mountedRef.current) {
        setData(metrics as T[]);
        setLastUpdated(new Date());
        setIsLoading(false);
      }
    } catch (err) {
      console.error(`Failed to fetch ${metricType} metrics:`, err);
      
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
        setIsLoading(false);
      }
    }
  }, [metricType]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    fetchData();
    
    // Set up refresh interval
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          fetchData();
        }
      }, refreshInterval);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, refreshInterval]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh
  };
}

/**
 * Hook for infrastructure metrics
 */
export function useInfrastructureMetrics() {
  return useMetricsByType<InfrastructureMetrics>(MetricType.INFRASTRUCTURE);
}

/**
 * Hook for API performance metrics
 */
export function useAPIPerformanceMetrics() {
  return useMetricsByType<APIPerformanceMetrics>(MetricType.API_PERFORMANCE);
}

/**
 * Hook for application performance metrics
 */
export function useAppPerformanceMetrics() {
  return useMetricsByType<AppPerformanceMetrics>(MetricType.APP_PERFORMANCE);
}

/**
 * Hook for business cost metrics
 */
export function useBusinessCostMetrics() {
  return useMetricsByType<BusinessCostMetrics>(MetricType.BUSINESS_COST);
}

/**
 * Hook for AI metrics
 */
export function useAIMetrics() {
  return useMetricsByType<AIMetrics>(MetricType.AI_METRICS);
}

/**
 * Hook for QA metrics
 */
export function useQAMetrics() {
  return useMetricsByType<QAMetrics>(MetricType.QA_METRICS);
}

/**
 * Hook for business analytics metrics
 */
export function useBusinessAnalyticsMetrics() {
  return useMetricsByType<BusinessAnalyticsMetrics>(MetricType.ANALYTICS);
}

/**
 * Hook for data integration health metrics
 */
export function useDataIntegrationHealth() {
  return useMetricsByType<DataIntegrationMetrics>(MetricType.ANALYTICS, 60000); // 1 minute refresh
}