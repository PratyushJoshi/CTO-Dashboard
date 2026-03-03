import { MockDataGenerator } from '../mock/MockDataGenerator';
import { DataIntegrationService, AggregatedMetrics } from './DataIntegrationService';
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

/**
 * Service that aggregates data from multiple sources and provides a unified interface
 * for the CTO dashboard. Integrates with both mock data and real data sources.
 */
export class DataAggregationService {
  private mockDataGenerator: MockDataGenerator;
  private dataIntegrationService: DataIntegrationService;
  private isUsingMockData: boolean = true; // Default to mock data for development

  constructor() {
    this.mockDataGenerator = new MockDataGenerator();
    this.dataIntegrationService = new DataIntegrationService();
  }

  /**
   * Switch between mock data and real data sources
   */
  public setDataMode(useMockData: boolean): void {
    this.isUsingMockData = useMockData;
  }

  /**
   * Get current data mode
   */
  public isUsingMockDataMode(): boolean {
    return this.isUsingMockData;
  }

  /**
   * Get all metrics with consistent aggregation
   * Requirements: 8.2, 8.3, 8.4 - Aggregate metrics with consistent timestamps and data quality validation
   */
  public async getAllMetrics(): Promise<AggregatedMetrics> {
    if (this.isUsingMockData) {
      return this.getMockAggregatedMetrics();
    } else {
      return this.dataIntegrationService.getMetrics();
    }
  }

  /**
   * Generate mock aggregated metrics for development and testing
   */
  private getMockAggregatedMetrics(): AggregatedMetrics {
    const mockData = this.mockDataGenerator.generateAllMetrics();
    
    return {
      infrastructure: mockData.infrastructure,
      apiPerformance: mockData.apiPerformance,
      appPerformance: mockData.appPerformance,
      businessCost: mockData.businessCost,
      aiMetrics: mockData.aiMetrics,
      qaMetrics: mockData.qaMetrics,
      businessAnalytics: mockData.businessAnalytics,
      dataIntegration: mockData.dataIntegration,
      lastUpdated: mockData.timestamp,
      aggregationStats: {
        totalMetricsProcessed: this.calculateTotalMetrics(mockData),
        successfulSources: 6, // All mock sources successful
        failedSources: 0,
        timestampConsistency: 99.5, // Mock data has consistent timestamps
        dataLossPercentage: 0.1, // Minimal data loss in mock scenario
        aggregationLatency: 150 + Math.random() * 100 // 150-250ms
      }
    };
  }

  /**
   * Calculate total metrics from mock data
   */
  private calculateTotalMetrics(mockData: any): number {
    return (
      mockData.infrastructure.length +
      mockData.apiPerformance.length +
      mockData.appPerformance.length +
      mockData.businessCost.length +
      mockData.aiMetrics.length +
      mockData.qaMetrics.length +
      mockData.businessAnalytics.length +
      mockData.dataIntegration.length
    );
  }

  /**
   * Get infrastructure metrics
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
   */
  public async getInfrastructureMetrics(): Promise<InfrastructureMetrics[]> {
    if (this.isUsingMockData) {
      return this.mockDataGenerator.generateInfrastructureMetrics();
    } else {
      const metrics = await this.dataIntegrationService.getMetrics();
      return metrics.infrastructure;
    }
  }

  /**
   * Get API performance metrics
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
   */
  public async getAPIPerformanceMetrics(): Promise<APIPerformanceMetrics[]> {
    if (this.isUsingMockData) {
      return this.mockDataGenerator.generateAPIPerformanceMetrics();
    } else {
      const metrics = await this.dataIntegrationService.getMetrics();
      return metrics.apiPerformance;
    }
  }

  /**
   * Get application performance metrics
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
   */
  public async getAppPerformanceMetrics(): Promise<AppPerformanceMetrics[]> {
    if (this.isUsingMockData) {
      return this.mockDataGenerator.generateAppPerformanceMetrics();
    } else {
      const metrics = await this.dataIntegrationService.getMetrics();
      return metrics.appPerformance;
    }
  }

  /**
   * Get business cost metrics
   * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
   */
  public async getBusinessCostMetrics(): Promise<BusinessCostMetrics[]> {
    if (this.isUsingMockData) {
      return this.mockDataGenerator.generateBusinessCostMetrics();
    } else {
      const metrics = await this.dataIntegrationService.getMetrics();
      return metrics.businessCost;
    }
  }

  /**
   * Get AI metrics
   * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
   */
  public async getAIMetrics(): Promise<AIMetrics[]> {
    if (this.isUsingMockData) {
      return this.mockDataGenerator.generateAIMetrics();
    } else {
      const metrics = await this.dataIntegrationService.getMetrics();
      return metrics.aiMetrics;
    }
  }

  /**
   * Get QA metrics
   * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
   */
  public async getQAMetrics(): Promise<QAMetrics[]> {
    if (this.isUsingMockData) {
      return this.mockDataGenerator.generateQAMetrics();
    } else {
      const metrics = await this.dataIntegrationService.getMetrics();
      return metrics.qaMetrics;
    }
  }

  /**
   * Get business analytics metrics
   * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
   */
  public async getBusinessAnalyticsMetrics(): Promise<BusinessAnalyticsMetrics[]> {
    if (this.isUsingMockData) {
      return this.mockDataGenerator.generateBusinessAnalyticsMetrics();
    } else {
      const metrics = await this.dataIntegrationService.getMetrics();
      return metrics.businessAnalytics;
    }
  }

  /**
   * Get data integration health metrics
   * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
   */
  public async getDataIntegrationMetrics(): Promise<DataIntegrationMetrics[]> {
    if (this.isUsingMockData) {
      return this.mockDataGenerator.generateDataIntegrationMetrics();
    } else {
      return this.dataIntegrationService.getIntegrationHealth();
    }
  }

  /**
   * Get historical metrics for trend analysis
   * Requirements: 8.2 - Consistent timestamp handling for historical data
   */
  public async getHistoricalMetrics(
    metricType: MetricType,
    startDate: Date,
    endDate: Date,
    intervalMinutes: number = 30
  ): Promise<any[]> {
    const intervals = Math.ceil((endDate.getTime() - startDate.getTime()) / (intervalMinutes * 60 * 1000));
    const historicalData: any[] = [];

    for (let i = 0; i < intervals; i++) {
      const timestamp = new Date(startDate.getTime() + i * intervalMinutes * 60 * 1000);
      
      // Set mock data generator time to historical point
      const originalTime = this.mockDataGenerator.getCurrentTime();
      this.mockDataGenerator.advanceTime(-(originalTime.getTime() - timestamp.getTime()) / (60 * 1000));

      let metrics: any[];
      switch (metricType) {
        case MetricType.INFRASTRUCTURE:
          metrics = await this.getInfrastructureMetrics();
          break;
        case MetricType.API_PERFORMANCE:
          metrics = await this.getAPIPerformanceMetrics();
          break;
        case MetricType.APP_PERFORMANCE:
          metrics = await this.getAppPerformanceMetrics();
          break;
        case MetricType.BUSINESS_COST:
          metrics = await this.getBusinessCostMetrics();
          break;
        case MetricType.AI_METRICS:
          metrics = await this.getAIMetrics();
          break;
        case MetricType.QA_METRICS:
          metrics = await this.getQAMetrics();
          break;
        case MetricType.ANALYTICS:
          metrics = await this.getBusinessAnalyticsMetrics();
          break;
        default:
          metrics = [];
      }

      historicalData.push({
        timestamp,
        metrics: metrics.map(m => ({ ...m, timestamp }))
      });
    }

    return historicalData;
  }

  /**
   * Activate a scenario for testing different conditions
   * Requirements: Mock data scenarios for POC demonstrations
   */
  public activateScenario(scenarioName: string): void {
    if (this.isUsingMockData) {
      const scenarios = this.mockDataGenerator.getPredefinedScenarios();
      const scenario = scenarios.find(s => s.name === scenarioName);
      if (scenario) {
        this.mockDataGenerator.activateScenario(scenario);
      }
    }
  }

  /**
   * Deactivate current scenario
   */
  public deactivateScenario(): void {
    if (this.isUsingMockData) {
      this.mockDataGenerator.deactivateScenario();
    }
  }

  /**
   * Get available scenarios for testing
   */
  public getAvailableScenarios(): string[] {
    if (this.isUsingMockData) {
      return this.mockDataGenerator.getPredefinedScenarios().map(s => s.name);
    }
    return [];
  }

  /**
   * Get real-time update status
   * Requirements: 8.4 - Real-time updates within 30 seconds
   */
  public getRealTimeStatus(): {
    isRealTime: boolean;
    lastUpdate: Date;
    nextUpdate: Date;
    updateInterval: number;
  } {
    const now = new Date();
    const updateInterval = 30; // 30 seconds

    return {
      isRealTime: true,
      lastUpdate: now,
      nextUpdate: new Date(now.getTime() + updateInterval * 1000),
      updateInterval
    };
  }

  /**
   * Test data source connections
   * Requirements: 8.1 - Data source connection management
   */
  public async testAllConnections(): Promise<Map<string, boolean>> {
    if (this.isUsingMockData) {
      // Mock successful connections for development
      const mockResults = new Map<string, boolean>();
      mockResults.set('prometheus-monitoring', true);
      mockResults.set('newrelic-apm', true);
      mockResults.set('tableau-bi', true);
      mockResults.set('mlflow-platform', true);
      mockResults.set('jenkins-qa', true);
      mockResults.set('snowflake-analytics', true);
      return mockResults;
    } else {
      const sources = this.dataIntegrationService.getDataSources();
      const results = new Map<string, boolean>();
      
      for (const source of sources) {
        try {
          const isConnected = await this.dataIntegrationService.testConnection(source.id);
          results.set(source.id, isConnected);
        } catch (error) {
          results.set(source.id, false);
        }
      }
      
      return results;
    }
  }

  /**
   * Get data quality metrics across all sources
   * Requirements: 8.3 - Data quality validation
   */
  public async getDataQualityMetrics(): Promise<{
    overallScore: number;
    sourceScores: Map<string, number>;
    issues: string[];
    recommendations: string[];
  }> {
    const integrationMetrics = await this.getDataIntegrationMetrics();
    
    let totalScore = 0;
    const sourceScores = new Map<string, number>();
    const issues: string[] = [];
    const recommendations: string[] = [];

    for (const metric of integrationMetrics) {
      const score = metric.dataQuality.validationScore;
      totalScore += score;
      sourceScores.set(metric.sourceName, score);

      if (score < 95) {
        issues.push(`${metric.sourceName}: Data quality below threshold (${score}%)`);
        recommendations.push(`Review data validation rules for ${metric.sourceName}`);
      }

      if (metric.dataQuality.missingDataPercentage > 5) {
        issues.push(`${metric.sourceName}: High missing data rate (${metric.dataQuality.missingDataPercentage}%)`);
        recommendations.push(`Investigate data collection issues for ${metric.sourceName}`);
      }
    }

    const overallScore = integrationMetrics.length > 0 ? totalScore / integrationMetrics.length : 100;

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      sourceScores,
      issues,
      recommendations
    };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.dataIntegrationService.destroy();
  }
}

// Singleton instance for application-wide use
export const dataAggregationService = new DataAggregationService();