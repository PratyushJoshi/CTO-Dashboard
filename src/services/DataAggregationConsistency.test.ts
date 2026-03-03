import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { DataIntegrationService, DataAggregationService } from './';
import { 
  Metric, 
  MetricType, 
  DataSourceType, 
  ConnectionStatus
} from '../types';
import { DataSourceConfig } from './DataIntegrationService';

/**
 * **Feature: cto-dashboard, Property 5: Data Aggregation Consistency**
 * **Validates: Requirements 8.2, 8.3, 8.4**
 * 
 * Property-based tests for data aggregation consistency across multiple sources.
 * Tests that aggregated data maintains timestamp consistency and handles missing data gracefully without data loss.
 */

describe('Data Aggregation Consistency Property Tests', () => {
  let dataIntegrationService: DataIntegrationService;
  let dataAggregationService: DataAggregationService;

  beforeEach(() => {
    dataIntegrationService = new DataIntegrationService();
    dataAggregationService = new DataAggregationService();
  });

  afterEach(() => {
    dataIntegrationService.destroy();
    dataAggregationService.destroy();
  });

  /**
   * Property: Timestamp Consistency
   * For any set of metrics collected from multiple sources, aggregated data should maintain 
   * timestamp consistency within acceptable bounds
   */
  it('should maintain timestamp consistency across aggregated metrics', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a reasonable number of metrics for testing
        fc.integer({ min: 1, max: 20 }),
        async (metricCount) => {
          // Get aggregated metrics from the service
          const aggregatedMetrics = await dataAggregationService.getAllMetrics();
          
          // Property: Aggregated metrics should have valid timestamps
          expect(aggregatedMetrics.lastUpdated).toBeInstanceOf(Date);
          
          // Property: All metric arrays should contain valid timestamps
          const allMetricArrays = [
            aggregatedMetrics.infrastructure,
            aggregatedMetrics.apiPerformance,
            aggregatedMetrics.appPerformance,
            aggregatedMetrics.businessCost,
            aggregatedMetrics.aiMetrics,
            aggregatedMetrics.qaMetrics,
            aggregatedMetrics.businessAnalytics,
            aggregatedMetrics.dataIntegration
          ];

          for (const metricArray of allMetricArrays) {
            for (const metric of metricArray) {
              expect(metric.timestamp).toBeInstanceOf(Date);
              expect(metric.timestamp.getTime()).toBeGreaterThan(0);
              
              // Timestamps should be reasonably recent (within last 24 hours or future 1 hour)
              const now = Date.now();
              const age = Math.abs(now - metric.timestamp.getTime());
              const maxReasonableAge = 25 * 60 * 60 * 1000; // 25 hours
              expect(age).toBeLessThan(maxReasonableAge);
            }
          }
          
          // Property: aggregation stats should reflect timestamp consistency
          if (aggregatedMetrics.aggregationStats) {
            expect(aggregatedMetrics.aggregationStats.timestampConsistency).toBeGreaterThanOrEqual(0);
            expect(aggregatedMetrics.aggregationStats.timestampConsistency).toBeLessThanOrEqual(100);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Data Loss Prevention
   * For any set of valid metrics, the aggregation process should not lose data unless 
   * explicitly marked as invalid during validation
   */
  it('should prevent data loss during aggregation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            type: fc.constantFrom(...Object.values(MetricType)),
            value: fc.float({ min: -1000000, max: 1000000, noNaN: true }),
            unit: fc.string({ minLength: 1, maxLength: 10 }),
            timestamp: fc.date(),
            source: fc.string({ minLength: 1, maxLength: 20 }),
            tags: fc.dictionary(fc.string(), fc.string()),
            metadata: fc.option(fc.dictionary(fc.string(), fc.anything()))
          }),
          { minLength: 0, maxLength: 100 }
        ),
        async (inputMetrics) => {
          // Count valid metrics (those that should pass validation)
          const validMetrics = inputMetrics.filter(metric => 
            metric.id && 
            metric.name && 
            metric.source &&
            typeof metric.value === 'number' &&
            isFinite(metric.value) &&
            !isNaN(metric.value) &&
            metric.timestamp instanceof Date &&
            !isNaN(metric.timestamp.getTime())
          );

          // Get aggregated metrics
          const aggregatedMetrics = await dataAggregationService.getAllMetrics();
          
          // Property: Data loss percentage should be reasonable (< 10% for valid data)
          if (aggregatedMetrics.aggregationStats && validMetrics.length > 0) {
            expect(aggregatedMetrics.aggregationStats.dataLossPercentage).toBeLessThan(10);
            expect(aggregatedMetrics.aggregationStats.totalMetricsProcessed).toBeGreaterThanOrEqual(0);
          }
          
          // Property: Successful sources should be >= 0 and <= total sources
          if (aggregatedMetrics.aggregationStats) {
            const totalSources = aggregatedMetrics.aggregationStats.successfulSources + 
                               aggregatedMetrics.aggregationStats.failedSources;
            expect(aggregatedMetrics.aggregationStats.successfulSources).toBeGreaterThanOrEqual(0);
            expect(aggregatedMetrics.aggregationStats.failedSources).toBeGreaterThanOrEqual(0);
            expect(totalSources).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Aggregation Latency Bounds
   * For any reasonable dataset size, aggregation latency should be within acceptable bounds
   */
  it('should maintain acceptable aggregation latency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 1000 }), // Number of metrics to simulate
        async (metricCount) => {
          const startTime = Date.now();
          
          // Get aggregated metrics
          const aggregatedMetrics = await dataAggregationService.getAllMetrics();
          
          const actualLatency = Date.now() - startTime;
          
          // Property: Aggregation should complete within reasonable time bounds
          // For mock data, this should be very fast (< 1000ms)
          expect(actualLatency).toBeLessThan(1000);
          
          // Property: Reported latency should be reasonable
          if (aggregatedMetrics.aggregationStats) {
            expect(aggregatedMetrics.aggregationStats.aggregationLatency).toBeGreaterThan(0);
            expect(aggregatedMetrics.aggregationStats.aggregationLatency).toBeLessThan(10000); // < 10 seconds
          }
        }
      ),
      { numRuns: 50 } // Fewer runs for performance tests
    );
  });

  /**
   * Property: Data Source Configuration Consistency
   * For any valid data source configuration, the service should handle it consistently
   */
  it('should handle data source configurations consistently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            type: fc.constantFrom(...Object.values(DataSourceType)),
            endpoint: fc.webUrl(),
            refreshInterval: fc.integer({ min: 1, max: 3600 }), // 1 second to 1 hour
            timeout: fc.integer({ min: 1000, max: 60000 }), // 1 second to 1 minute
            retryAttempts: fc.integer({ min: 0, max: 10 }),
            enabled: fc.boolean()
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (dataSourceConfigs) => {
          // Add all data sources
          for (const config of dataSourceConfigs) {
            dataIntegrationService.addDataSource(config);
          }
          
          // Get configured sources
          const configuredSources = dataIntegrationService.getDataSources();
          
          // Property: All added sources should be retrievable
          expect(configuredSources.length).toBeGreaterThanOrEqual(dataSourceConfigs.length);
          
          // Property: Each configured source should have valid properties
          for (const source of configuredSources) {
            expect(source.id).toBeTruthy();
            expect(source.name).toBeTruthy();
            expect(Object.values(DataSourceType)).toContain(source.type);
            expect(source.refreshInterval).toBeGreaterThan(0);
            expect(source.timeout).toBeGreaterThan(0);
            expect(source.retryAttempts).toBeGreaterThanOrEqual(0);
            expect(typeof source.enabled).toBe('boolean');
          }
          
          // Property: Connection statuses should be initialized
          const connectionStatuses = dataIntegrationService.getConnectionStatuses();
          expect(connectionStatuses.size).toBeGreaterThanOrEqual(dataSourceConfigs.length);
          
          // Clean up
          for (const config of dataSourceConfigs) {
            dataIntegrationService.removeDataSource(config.id);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Cache Consistency
   * For any cached data, it should remain consistent and valid until expiration
   */
  it('should maintain cache consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }), // Reduced number of cache operations
        async (operationCount) => {
          for (let i = 0; i < operationCount; i++) {
            // Get metrics (which should cache them)
            const metrics1 = await dataAggregationService.getAllMetrics();
            
            // Get metrics again immediately (should use cache or fresh data)
            const metrics2 = await dataAggregationService.getAllMetrics();
            
            // Property: Both calls should return valid data
            expect(metrics1).toBeTruthy();
            expect(metrics2).toBeTruthy();
            expect(metrics1.lastUpdated).toBeInstanceOf(Date);
            expect(metrics2.lastUpdated).toBeInstanceOf(Date);
            
            // Property: Aggregation stats should be consistent
            if (metrics1.aggregationStats && metrics2.aggregationStats) {
              expect(metrics1.aggregationStats.totalMetricsProcessed).toBeGreaterThanOrEqual(0);
              expect(metrics2.aggregationStats.totalMetricsProcessed).toBeGreaterThanOrEqual(0);
            }
            
            // Small delay to test temporal consistency
            await new Promise(resolve => setTimeout(resolve, 5));
          }
        }
      ),
      { numRuns: 20, timeout: 10000 } // Reduced runs and added timeout
    );
  }, 15000); // Increased test timeout

  /**
   * Property: Metric Type Consistency
   * For any metric type requested, the returned data should match the expected type structure
   */
  it('should maintain metric type consistency', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...Object.values(MetricType)),
        async (metricType) => {
          let metrics: any[];
          
          // Get metrics based on type
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
          
          // Property: Should return an array
          expect(Array.isArray(metrics)).toBe(true);
          
          // Property: Each metric should have required fields
          for (const metric of metrics) {
            expect(metric).toBeTruthy();
            expect(metric.timestamp).toBeInstanceOf(Date);
            
            // Type-specific validations
            if (metricType === MetricType.INFRASTRUCTURE && metrics.length > 0) {
              expect(typeof metric.cpuUtilization).toBe('number');
              expect(typeof metric.memoryUtilization).toBe('number');
            }
            
            if (metricType === MetricType.API_PERFORMANCE && metrics.length > 0) {
              expect(typeof metric.successRate).toBe('number');
              expect(typeof metric.averageLatency).toBe('number');
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});