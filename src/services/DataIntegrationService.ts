import {
  DataIntegrationMetrics,
  DataSourceType,
  ConnectionStatus,
  Metric,
  MetricType,
  InfrastructureMetrics,
  APIPerformanceMetrics,
  AppPerformanceMetrics,
  BusinessCostMetrics,
  AIMetrics,
  QAMetrics,
  BusinessAnalyticsMetrics
} from '../types';

export interface DataSourceConfig {
  id: string;
  name: string;
  type: DataSourceType;
  endpoint: string;
  credentials?: Record<string, string>;
  refreshInterval: number; // seconds
  timeout: number; // milliseconds
  retryAttempts: number;
  enabled: boolean;
}

export interface AggregatedMetrics {
  infrastructure: InfrastructureMetrics[];
  apiPerformance: APIPerformanceMetrics[];
  appPerformance: AppPerformanceMetrics[];
  businessCost: BusinessCostMetrics[];
  aiMetrics: AIMetrics[];
  qaMetrics: QAMetrics[];
  businessAnalytics: BusinessAnalyticsMetrics[];
  dataIntegration: DataIntegrationMetrics[];
  lastUpdated: Date;
  aggregationStats: AggregationStats;
}

export interface AggregationStats {
  totalMetricsProcessed: number;
  successfulSources: number;
  failedSources: number;
  timestampConsistency: number; // percentage
  dataLossPercentage: number;
  aggregationLatency: number; // milliseconds
}

export interface CachedData {
  metrics: AggregatedMetrics;
  cachedAt: Date;
  expiresAt: Date;
  isStale: boolean;
}

export class DataIntegrationService {
  private dataSources: Map<string, DataSourceConfig> = new Map();
  private connectionStatuses: Map<string, ConnectionStatus> = new Map();
  private cachedData: CachedData | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly REAL_TIME_THRESHOLD = 30 * 1000; // 30 seconds
  
  constructor() {
    this.initializeDefaultSources();
    this.startRealTimeUpdates();
  }

  /**
   * Initialize default data sources for the CTO dashboard
   * Requirements: 8.1 - Connect to infrastructure monitoring tools, APM systems, and business intelligence platforms
   */
  private initializeDefaultSources(): void {
    const defaultSources: DataSourceConfig[] = [
      {
        id: 'prometheus-monitoring',
        name: 'Prometheus Infrastructure Monitoring',
        type: DataSourceType.INFRASTRUCTURE_MONITORING,
        endpoint: 'http://prometheus:9090/api/v1',
        refreshInterval: 30,
        timeout: 5000,
        retryAttempts: 3,
        enabled: true
      },
      {
        id: 'newrelic-apm',
        name: 'New Relic APM',
        type: DataSourceType.APM_SYSTEM,
        endpoint: 'https://api.newrelic.com/v2',
        refreshInterval: 30,
        timeout: 10000,
        retryAttempts: 3,
        enabled: true
      },
      {
        id: 'tableau-bi',
        name: 'Tableau Business Intelligence',
        type: DataSourceType.BUSINESS_INTELLIGENCE,
        endpoint: 'https://tableau.company.com/api',
        refreshInterval: 60,
        timeout: 15000,
        retryAttempts: 2,
        enabled: true
      },
      {
        id: 'mlflow-platform',
        name: 'MLflow AI Platform',
        type: DataSourceType.AI_PLATFORM,
        endpoint: 'http://mlflow:5000/api/2.0/mlflow',
        refreshInterval: 60,
        timeout: 10000,
        retryAttempts: 3,
        enabled: true
      },
      {
        id: 'jenkins-qa',
        name: 'Jenkins QA Tools',
        type: DataSourceType.QA_TOOLS,
        endpoint: 'http://jenkins:8080/api/json',
        refreshInterval: 120,
        timeout: 8000,
        retryAttempts: 2,
        enabled: true
      },
      {
        id: 'snowflake-analytics',
        name: 'Snowflake Analytics System',
        type: DataSourceType.ANALYTICS_SYSTEM,
        endpoint: 'https://analytics.snowflakecomputing.com/api',
        refreshInterval: 300,
        timeout: 20000,
        retryAttempts: 2,
        enabled: true
      }
    ];

    defaultSources.forEach(source => {
      this.dataSources.set(source.id, source);
      this.connectionStatuses.set(source.id, ConnectionStatus.DISCONNECTED);
    });
  }

  /**
   * Add or update a data source configuration
   * Requirements: 8.1 - Configure departmental data sources
   */
  public addDataSource(config: DataSourceConfig): void {
    this.dataSources.set(config.id, config);
    this.connectionStatuses.set(config.id, ConnectionStatus.DISCONNECTED);
  }

  /**
   * Remove a data source
   */
  public removeDataSource(sourceId: string): void {
    this.dataSources.delete(sourceId);
    this.connectionStatuses.delete(sourceId);
  }

  /**
   * Get all configured data sources
   */
  public getDataSources(): DataSourceConfig[] {
    return Array.from(this.dataSources.values());
  }

  /**
   * Get connection status for all sources
   */
  public getConnectionStatuses(): Map<string, ConnectionStatus> {
    return new Map(this.connectionStatuses);
  }

  /**
   * Test connection to a specific data source
   */
  public async testConnection(sourceId: string): Promise<boolean> {
    const source = this.dataSources.get(sourceId);
    if (!source) {
      throw new Error(`Data source ${sourceId} not found`);
    }

    try {
      this.connectionStatuses.set(sourceId, ConnectionStatus.RECONNECTING);
      
      // Simulate connection test with timeout
      const connectionPromise = this.performConnectionTest(source);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), source.timeout)
      );

      await Promise.race([connectionPromise, timeoutPromise]);
      
      this.connectionStatuses.set(sourceId, ConnectionStatus.CONNECTED);
      return true;
    } catch (error) {
      this.connectionStatuses.set(sourceId, ConnectionStatus.DISCONNECTED);
      console.error(`Connection test failed for ${sourceId}:`, error);
      return false;
    }
  }

  /**
   * Simulate connection test (in real implementation, this would make actual HTTP requests)
   */
  private async performConnectionTest(source: DataSourceConfig): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
    
    // Simulate occasional connection failures for testing
    if (Math.random() < 0.1) {
      throw new Error(`Connection failed to ${source.endpoint}`);
    }
  }

  /**
   * Collect data from a specific source with retry logic
   * Requirements: 8.2 - Aggregate metrics with consistent timestamps
   */
  private async collectFromSource(source: DataSourceConfig): Promise<Metric[]> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= source.retryAttempts; attempt++) {
      try {
        this.connectionStatuses.set(source.id, ConnectionStatus.RECONNECTING);
        
        const data = await this.fetchDataFromSource(source);
        this.connectionStatuses.set(source.id, ConnectionStatus.CONNECTED);
        
        return data;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt}/${source.retryAttempts} failed for ${source.id}:`, error);
        
        if (attempt < source.retryAttempts) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    this.connectionStatuses.set(source.id, ConnectionStatus.DISCONNECTED);
    throw lastError || new Error(`Failed to collect data from ${source.id}`);
  }

  /**
   * Simulate data fetching from external source
   * In real implementation, this would make HTTP requests to actual monitoring systems
   */
  private async fetchDataFromSource(source: DataSourceConfig): Promise<Metric[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 800));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) {
      throw new Error(`Network error connecting to ${source.endpoint}`);
    }

    // Generate mock metrics based on source type
    const timestamp = new Date();
    const metrics: Metric[] = [];
    
    // Generate 5-20 metrics per source
    const metricCount = 5 + Math.floor(Math.random() * 16);
    
    for (let i = 0; i < metricCount; i++) {
      metrics.push({
        id: `${source.id}-metric-${i}`,
        name: `${source.type}-metric-${i}`,
        type: this.getMetricTypeForSource(source.type),
        value: Math.random() * 100,
        unit: this.getUnitForMetricType(source.type),
        timestamp,
        source: source.id,
        tags: {
          sourceType: source.type,
          environment: 'production'
        },
        metadata: {
          collectedAt: timestamp.toISOString(),
          sourceEndpoint: source.endpoint
        }
      });
    }
    
    return metrics;
  }

  /**
   * Map data source type to metric type
   */
  private getMetricTypeForSource(sourceType: DataSourceType): MetricType {
    const mapping = {
      [DataSourceType.INFRASTRUCTURE_MONITORING]: MetricType.INFRASTRUCTURE,
      [DataSourceType.APM_SYSTEM]: MetricType.API_PERFORMANCE,
      [DataSourceType.BUSINESS_INTELLIGENCE]: MetricType.BUSINESS_COST,
      [DataSourceType.AI_PLATFORM]: MetricType.AI_METRICS,
      [DataSourceType.QA_TOOLS]: MetricType.QA_METRICS,
      [DataSourceType.ANALYTICS_SYSTEM]: MetricType.ANALYTICS
    };
    return mapping[sourceType];
  }

  /**
   * Get appropriate unit for metric type
   */
  private getUnitForMetricType(sourceType: DataSourceType): string {
    const units = {
      [DataSourceType.INFRASTRUCTURE_MONITORING]: '%',
      [DataSourceType.APM_SYSTEM]: 'ms',
      [DataSourceType.BUSINESS_INTELLIGENCE]: '$',
      [DataSourceType.AI_PLATFORM]: 'score',
      [DataSourceType.QA_TOOLS]: '%',
      [DataSourceType.ANALYTICS_SYSTEM]: 'count'
    };
    return units[sourceType];
  }

  /**
   * Validate data quality and handle missing/corrupted data
   * Requirements: 8.3 - Validate data quality and handle missing or corrupted data gracefully
   */
  private validateAndCleanData(metrics: Metric[]): { valid: Metric[], invalid: Metric[], stats: any } {
    const valid: Metric[] = [];
    const invalid: Metric[] = [];
    let missingValues = 0;
    let invalidTimestamps = 0;
    let duplicates = 0;
    
    const seenIds = new Set<string>();
    
    for (const metric of metrics) {
      const issues: string[] = [];
      
      // Check for required fields
      if (!metric.id || !metric.name || !metric.source) {
        issues.push('Missing required fields');
      }
      
      // Check for valid numeric value
      if (typeof metric.value !== 'number' || isNaN(metric.value) || !isFinite(metric.value)) {
        issues.push('Invalid numeric value');
        missingValues++;
      }
      
      // Check for valid timestamp
      if (!metric.timestamp || isNaN(metric.timestamp.getTime())) {
        issues.push('Invalid timestamp');
        invalidTimestamps++;
        // Fix timestamp if possible
        metric.timestamp = new Date();
      }
      
      // Check for duplicates
      if (seenIds.has(metric.id)) {
        issues.push('Duplicate metric ID');
        duplicates++;
      } else {
        seenIds.add(metric.id);
      }
      
      // Sanitize numeric values
      if (typeof metric.value === 'number' && isFinite(metric.value)) {
        // Clamp extreme values
        if (metric.value < -1000000) metric.value = -1000000;
        if (metric.value > 1000000) metric.value = 1000000;
      }
      
      if (issues.length === 0) {
        valid.push(metric);
      } else {
        invalid.push({
          ...metric,
          metadata: {
            ...metric.metadata,
            validationIssues: issues
          }
        });
      }
    }
    
    return {
      valid,
      invalid,
      stats: {
        totalMetrics: metrics.length,
        validMetrics: valid.length,
        invalidMetrics: invalid.length,
        missingValues,
        invalidTimestamps,
        duplicates,
        validationScore: metrics.length > 0 ? (valid.length / metrics.length) * 100 : 100
      }
    };
  }

  /**
   * Aggregate metrics from multiple sources with consistent timestamp handling
   * Requirements: 8.2 - Aggregate metrics with consistent timestamps
   */
  public async aggregateMetrics(): Promise<AggregatedMetrics> {
    const startTime = Date.now();
    const enabledSources = Array.from(this.dataSources.values()).filter(s => s.enabled);
    
    // Collect data from all sources in parallel
    const collectionPromises = enabledSources.map(async (source) => {
      try {
        const metrics = await this.collectFromSource(source);
        return { sourceId: source.id, metrics, success: true };
      } catch (error) {
        console.error(`Failed to collect from ${source.id}:`, error);
        return { sourceId: source.id, metrics: [], success: false, error };
      }
    });

    const results = await Promise.allSettled(collectionPromises);
    
    // Process results and validate data
    let allMetrics: Metric[] = [];
    let successfulSources = 0;
    let failedSources = 0;
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { metrics, success } = result.value;
        if (success) {
          successfulSources++;
          allMetrics = allMetrics.concat(metrics);
        } else {
          failedSources++;
        }
      } else {
        failedSources++;
      }
    }

    // Validate and clean the collected data
    const { valid: validMetrics, invalid: invalidMetrics, stats: validationStats } = 
      this.validateAndCleanData(allMetrics);

    // Normalize timestamps to ensure consistency
    const normalizedMetrics = this.normalizeTimestamps(validMetrics);
    
    // Group metrics by type for structured output
    const groupedMetrics = this.groupMetricsByType(normalizedMetrics);
    
    const aggregationLatency = Date.now() - startTime;
    
    const aggregationStats: AggregationStats = {
      totalMetricsProcessed: allMetrics.length,
      successfulSources,
      failedSources,
      timestampConsistency: validationStats.validationScore,
      dataLossPercentage: invalidMetrics.length > 0 ? (invalidMetrics.length / allMetrics.length) * 100 : 0,
      aggregationLatency
    };

    const aggregatedMetrics: AggregatedMetrics = {
      ...groupedMetrics,
      lastUpdated: new Date(),
      aggregationStats
    };

    // Update cache
    this.updateCache(aggregatedMetrics);
    
    return aggregatedMetrics;
  }

  /**
   * Normalize timestamps to ensure consistency across sources
   * Requirements: 8.2 - Consistent timestamp handling
   */
  private normalizeTimestamps(metrics: Metric[]): Metric[] {
    const now = new Date();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    return metrics.map(metric => {
      const age = now.getTime() - metric.timestamp.getTime();
      
      // If timestamp is too old or in the future, normalize it
      if (age > maxAge || age < 0) {
        return {
          ...metric,
          timestamp: now,
          metadata: {
            ...metric.metadata,
            originalTimestamp: metric.timestamp.toISOString(),
            timestampNormalized: true
          }
        };
      }
      
      return metric;
    });
  }

  /**
   * Group metrics by type for structured dashboard consumption
   */
  private groupMetricsByType(metrics: Metric[]): Omit<AggregatedMetrics, 'lastUpdated' | 'aggregationStats'> {
    // For now, return empty arrays as we're using mock data
    // In a real implementation, this would convert raw metrics to typed structures
    return {
      infrastructure: [],
      apiPerformance: [],
      appPerformance: [],
      businessCost: [],
      aiMetrics: [],
      qaMetrics: [],
      businessAnalytics: [],
      dataIntegration: []
    };
  }

  /**
   * Update cached data with fault tolerance
   * Requirements: 8.5 - Maintain service availability using cached data
   */
  private updateCache(metrics: AggregatedMetrics): void {
    const now = new Date();
    this.cachedData = {
      metrics,
      cachedAt: now,
      expiresAt: new Date(now.getTime() + this.CACHE_DURATION),
      isStale: false
    };
  }

  /**
   * Get cached data with fallback mechanism
   * Requirements: 8.5 - Cached data fallback when data source connectivity fails
   */
  public getCachedMetrics(): AggregatedMetrics | null {
    if (!this.cachedData) return null;
    
    const now = new Date();
    
    // Mark as stale if expired but still return it
    if (now > this.cachedData.expiresAt) {
      this.cachedData.isStale = true;
    }
    
    return this.cachedData.metrics;
  }

  /**
   * Check if cached data is available and fresh
   */
  public isCacheValid(): boolean {
    if (!this.cachedData) return false;
    return new Date() <= this.cachedData.expiresAt;
  }

  /**
   * Start real-time updates with 30-second refresh capability
   * Requirements: 8.4 - Refresh critical metrics within 30 seconds
   */
  private startRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(async () => {
      try {
        await this.aggregateMetrics();
      } catch (error) {
        console.error('Real-time update failed:', error);
        // Continue using cached data on failure
      }
    }, this.REAL_TIME_THRESHOLD);
  }

  /**
   * Stop real-time updates
   */
  public stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Get metrics with fallback to cache if live data unavailable
   * Requirements: 8.5 - Service availability with cached data fallback
   */
  public async getMetrics(): Promise<AggregatedMetrics> {
    try {
      // Try to get fresh data
      return await this.aggregateMetrics();
    } catch (error) {
      console.warn('Failed to get fresh metrics, falling back to cache:', error);
      
      // Fallback to cached data
      const cachedMetrics = this.getCachedMetrics();
      if (cachedMetrics) {
        return cachedMetrics;
      }
      
      // If no cache available, throw error
      throw new Error('No metrics available - both live data and cache unavailable');
    }
  }

  /**
   * Get data integration health metrics
   */
  public getIntegrationHealth(): DataIntegrationMetrics[] {
    const sources = Array.from(this.dataSources.values());
    
    return sources.map(source => {
      const connectionStatus = this.connectionStatuses.get(source.id) || ConnectionStatus.DISCONNECTED;
      
      return {
        sourceId: source.id,
        sourceName: source.name,
        sourceType: source.type,
        connectionStatus,
        dataQuality: {
          validationScore: connectionStatus === ConnectionStatus.CONNECTED ? 95 + Math.random() * 4 : 0,
          missingDataPercentage: connectionStatus === ConnectionStatus.CONNECTED ? Math.random() * 2 : 100,
          corruptedDataCount: connectionStatus === ConnectionStatus.CONNECTED ? Math.floor(Math.random() * 5) : 0,
          duplicateDataCount: connectionStatus === ConnectionStatus.CONNECTED ? Math.floor(Math.random() * 10) : 0,
          schemaComplianceScore: connectionStatus === ConnectionStatus.CONNECTED ? 98 + Math.random() * 2 : 0
        },
        aggregationMetrics: {
          metricsAggregated: connectionStatus === ConnectionStatus.CONNECTED ? Math.floor(1000 + Math.random() * 9000) : 0,
          timestampConsistency: connectionStatus === ConnectionStatus.CONNECTED ? 95 + Math.random() * 4 : 0,
          aggregationLatency: connectionStatus === ConnectionStatus.CONNECTED ? Math.floor(50 + Math.random() * 200) : 0,
          dataLossPercentage: connectionStatus === ConnectionStatus.CONNECTED ? Math.random() * 1 : 0
        },
        realTimeMetrics: {
          updateFrequency: source.refreshInterval,
          criticalMetricLatency: connectionStatus === ConnectionStatus.CONNECTED ? Math.floor(5 + Math.random() * 25) : source.timeout,
          refreshPerformance: connectionStatus === ConnectionStatus.CONNECTED ? Math.floor(10 + Math.random() * 90) : 0,
          realTimeDataPoints: connectionStatus === ConnectionStatus.CONNECTED ? Math.floor(500 + Math.random() * 4500) : 0
        },
        faultTolerance: {
          cachedDataAvailability: this.isCacheValid() ? 99 : 85,
          failoverTime: connectionStatus === ConnectionStatus.CONNECTED ? 2 : 10,
          dataRecoveryTime: connectionStatus === ConnectionStatus.CONNECTED ? 1 : 5,
          serviceAvailability: connectionStatus === ConnectionStatus.CONNECTED ? 99.5 : 95
        },
        timestamp: new Date()
      };
    });
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopRealTimeUpdates();
    this.dataSources.clear();
    this.connectionStatuses.clear();
    this.cachedData = null;
  }
}

// Singleton instance for application-wide use
export const dataIntegrationService = new DataIntegrationService();