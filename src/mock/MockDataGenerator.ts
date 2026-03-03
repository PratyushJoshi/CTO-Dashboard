import {
  InfrastructureMetrics,
  APIPerformanceMetrics,
  AppPerformanceMetrics,
  BusinessCostMetrics,
  AIMetrics,
  QAMetrics,
  BusinessAnalyticsMetrics,
  DataIntegrationMetrics,
  Alert,
  ServerStatus,
  BusinessUnit,
  TrendDirection,
  DeviceType,
  NetworkCondition,
  AIModelStatus,
  DefectSeverity,
  ApprovalStatus,
  QualityGateStatus,
  PipelineErrorCategory,
  QueryComplexity,
  DataSourceType,
  ConnectionStatus,
  AlertSeverity,
  AlertStatus,
  NotificationChannel,
  NotificationStatus,
  MetricType
} from '../types';

export interface MockDataScenario {
  name: string;
  description: string;
  duration: number; // minutes
  effects: ScenarioEffect[];
}

export interface ScenarioEffect {
  metricType: MetricType;
  multiplier: number; // 1.0 = normal, >1.0 = increase, <1.0 = decrease
  additive?: number; // additional value to add
  probability?: number; // 0-1, chance of effect occurring
}

export class MockDataGenerator {
  private currentTime: Date;
  private activeScenario: MockDataScenario | null = null;
  private scenarioStartTime: Date | null = null;
  private baselineData: Map<string, any> = new Map();

  constructor() {
    this.currentTime = new Date();
    this.initializeBaselines();
  }

  private initializeBaselines(): void {
    // Store baseline values for consistent data generation
    this.baselineData.set('serverCount', 25);
    this.baselineData.set('apiCount', 20);
    this.baselineData.set('appCount', 6);
    this.baselineData.set('aiModelCount', 10);
    this.baselineData.set('qaProjectCount', 8);
    this.baselineData.set('pipelineCount', 12);
  }

  // Time series generation with trends and seasonality
  generateTimeSeries(
    baseValue: number,
    variance: number,
    trend: number,
    points: number,
    seasonality: boolean = false
  ): number[] {
    // Input validation to prevent NaN values
    if (isNaN(baseValue) || isNaN(variance) || isNaN(trend) || points <= 0) {
      return [];
    }
    
    const series: number[] = [];
    let currentValue = baseValue;

    for (let i = 0; i < points; i++) {
      // Add trend
      currentValue += trend;

      // Add seasonality (daily pattern)
      let seasonalFactor = 1;
      if (seasonality) {
        const hourOfDay = (i % 24);
        // Peak during business hours (9-17), lower at night
        seasonalFactor = 0.7 + 0.6 * Math.sin((hourOfDay - 6) * Math.PI / 12);
        seasonalFactor = Math.max(0.3, Math.min(1.3, seasonalFactor));
      }

      // Add random variance
      const randomFactor = 1 + (Math.random() - 0.5) * variance;
      
      // Apply scenario effects if active
      let scenarioMultiplier = 1;
      if (this.activeScenario && this.isScenarioActive()) {
        scenarioMultiplier = this.getScenarioMultiplier(MetricType.INFRASTRUCTURE);
      }

      const value = currentValue * seasonalFactor * randomFactor * scenarioMultiplier;
      const finalValue = Math.max(0, isNaN(value) ? 0 : value);
      series.push(finalValue);
    }

    return series;
  }

  // Generate correlated metrics (e.g., high CPU correlates with high memory)
  generateCorrelatedMetrics(primaryMetric: number[], correlation: number): number[] {
    // Input validation
    if (isNaN(correlation) || primaryMetric.length === 0) {
      return [];
    }
    
    return primaryMetric.map(value => {
      // Handle NaN values in input
      if (isNaN(value)) {
        return 0;
      }
      
      const correlatedBase = value * correlation;
      const randomComponent = (Math.random() - 0.5) * 0.2 * value;
      const result = correlatedBase + randomComponent;
      
      // Ensure result is valid and within bounds
      if (isNaN(result)) {
        return 0;
      }
      
      return Math.max(0, Math.min(100, result));
    });
  }

  // Infrastructure monitoring data (Requirements 1.1, 1.2, 1.3, 1.4, 1.5)
  generateInfrastructureMetrics(): InfrastructureMetrics[] {
    const serverCount = this.baselineData.get('serverCount');
    const metrics: InfrastructureMetrics[] = [];

    for (let i = 0; i < serverCount; i++) {
      const serverId = `server-${i.toString().padStart(3, '0')}`;
      const baseCpu = 30 + Math.random() * 40; // 30-70% base
      const scenarioMultiplier = this.getScenarioMultiplier(MetricType.INFRASTRUCTURE);
      
      const cpuUtilization = Math.min(100, baseCpu * scenarioMultiplier);
      const memoryUtilization = this.generateCorrelatedMetrics([cpuUtilization], 0.8)[0];
      const diskUtilization = 40 + Math.random() * 50; // 40-90%
      const networkUtilization = 10 + Math.random() * 60; // 10-70%

      // Determine status based on utilization
      let status = ServerStatus.HEALTHY;
      if (cpuUtilization > 80 || memoryUtilization > 85) {
        status = ServerStatus.CRITICAL;
      } else if (cpuUtilization > 70 || memoryUtilization > 75) {
        status = ServerStatus.WARNING;
      }

      metrics.push({
        serverId,
        serverName: `Production Server ${i + 1}`,
        cpuUtilization: Math.round(cpuUtilization * 100) / 100,
        memoryUtilization: Math.round(memoryUtilization * 100) / 100,
        diskUtilization: Math.round(diskUtilization * 100) / 100,
        networkUtilization: Math.round(networkUtilization * 100) / 100,
        loadPercentage: Math.round((cpuUtilization + memoryUtilization) / 2 * 100) / 100,
        status,
        uptime: 24 + Math.random() * 8760, // 1 day to 1 year
        apiTrafficCount: Math.floor(5 + Math.random() * 15), // 5-20 APIs per server
        trafficVolume: Math.floor(100 + Math.random() * 900), // 100-1000 RPM
        timestamp: new Date(this.currentTime)
      });
    }

    return metrics;
  }

  // API performance monitoring (Requirements 2.1, 2.2, 2.3, 2.4, 2.5)
  generateAPIPerformanceMetrics(): APIPerformanceMetrics[] {
    const apiCount = this.baselineData.get('apiCount');
    const metrics: APIPerformanceMetrics[] = [];
    const apiNames = [
      'user-auth', 'product-catalog', 'order-processing', 'payment-gateway',
      'inventory-management', 'recommendation-engine', 'search-service',
      'notification-service', 'analytics-api', 'reporting-service',
      'image-processing', 'email-service', 'sms-gateway', 'audit-service',
      'configuration-service', 'monitoring-api', 'health-check', 'metrics-collector',
      'cache-service', 'file-storage'
    ];

    for (let i = 0; i < apiCount; i++) {
      const endpointId = `api-${i.toString().padStart(3, '0')}`;
      const scenarioMultiplier = this.getScenarioMultiplier(MetricType.API_PERFORMANCE);
      
      // Base success rate (95-99.5% for most APIs)
      const baseSuccessRate = 95 + Math.random() * 4.5;
      const successRate = Math.max(85, Math.min(100, baseSuccessRate / scenarioMultiplier));
      const failureRate = 100 - successRate;

      // Latency metrics (affected by scenario)
      const baseLatency = 50 + Math.random() * 200; // 50-250ms base
      const averageLatency = baseLatency * scenarioMultiplier;
      const medianLatency = averageLatency * 0.8;
      const p95Latency = averageLatency * 2.5;

      // Error distribution
      const totalErrors = Math.floor(failureRate * 10);
      const errorsByStatusCode: Record<string, number> = {};
      if (totalErrors > 0) {
        errorsByStatusCode['400'] = Math.floor(totalErrors * 0.3);
        errorsByStatusCode['401'] = Math.floor(totalErrors * 0.1);
        errorsByStatusCode['403'] = Math.floor(totalErrors * 0.05);
        errorsByStatusCode['404'] = Math.floor(totalErrors * 0.15);
        errorsByStatusCode['429'] = Math.floor(totalErrors * 0.1);
        errorsByStatusCode['500'] = Math.floor(totalErrors * 0.2);
        errorsByStatusCode['502'] = Math.floor(totalErrors * 0.05);
        errorsByStatusCode['503'] = Math.floor(totalErrors * 0.05);
      }

      metrics.push({
        endpointId,
        endpointName: apiNames[i] || `api-endpoint-${i}`,
        successRate: Math.round(successRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100,
        averageLatency: Math.round(averageLatency),
        medianLatency: Math.round(medianLatency),
        p95Latency: Math.round(p95Latency),
        errorsByStatusCode,
        requestsPerMinute: Math.floor(50 + Math.random() * 450), // 50-500 RPM
        uptime: Math.round((95 + Math.random() * 4.9) * 100) / 100, // 95-99.9%
        uptimeWindow: '24h rolling',
        timestamp: new Date(this.currentTime)
      });
    }

    return metrics;
  }

  // Application performance monitoring (Requirements 3.1, 3.2, 3.3, 3.4, 3.5)
  generateAppPerformanceMetrics(): AppPerformanceMetrics[] {
    const appCount = this.baselineData.get('appCount');
    const metrics: AppPerformanceMetrics[] = [];
    const appNames = ['Web Portal', 'Mobile App', 'Admin Dashboard', 'Customer Service', 'Analytics Portal', 'API Gateway'];

    for (let i = 0; i < appCount; i++) {
      const applicationId = `app-${i.toString().padStart(3, '0')}`;
      const scenarioMultiplier = this.getScenarioMultiplier(MetricType.APP_PERFORMANCE);

      // Crash rates (0-3 per hour normally, higher during issues)
      const baseCrashRate = Math.random() * 2;
      const crashRatePerHour = baseCrashRate * scenarioMultiplier;

      // Page load times
      const baseLoadTime = 1000 + Math.random() * 3000; // 1-4 seconds
      const averagePageLoadTime = baseLoadTime * scenarioMultiplier;

      // Screen performance data
      const screenNames = ['Dashboard', 'Product List', 'Checkout', 'Profile', 'Settings', 'Reports'];
      const screenLoadTimes = screenNames.map(screenName => ({
        screenName,
        loadTime: Math.round(800 + Math.random() * 2200), // 0.8-3 seconds
        renderTime: Math.round(200 + Math.random() * 800) // 0.2-1 second
      }));

      // Device performance
      const devicePerformance = [
        {
          deviceType: DeviceType.DESKTOP,
          networkCondition: NetworkCondition.ETHERNET,
          averageLoadTime: Math.round(averagePageLoadTime * 0.7),
          performanceScore: Math.round(85 + Math.random() * 15) // 85-100
        },
        {
          deviceType: DeviceType.TABLET,
          networkCondition: NetworkCondition.WIFI,
          averageLoadTime: Math.round(averagePageLoadTime * 0.9),
          performanceScore: Math.round(75 + Math.random() * 20) // 75-95
        },
        {
          deviceType: DeviceType.MOBILE,
          networkCondition: NetworkCondition.FAST_3G,
          averageLoadTime: Math.round(averagePageLoadTime * 1.3),
          performanceScore: Math.round(60 + Math.random() * 25) // 60-85
        }
      ];

      // Performance trends (last 7 days)
      const performanceTrends = [];
      for (let day = 6; day >= 0; day--) {
        const dayStart = new Date(this.currentTime.getTime() - day * 24 * 60 * 60 * 1000);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        performanceTrends.push({
          period: { start: dayStart, end: dayEnd },
          averagePerformance: Math.round(70 + Math.random() * 25), // 70-95
          trend: Math.random() > 0.7 ? TrendDirection.IMPROVING : 
                 Math.random() > 0.5 ? TrendDirection.STABLE : TrendDirection.DEGRADING
        });
      }

      // Threshold breaches
      const thresholdBreaches = [];
      if (crashRatePerHour > 2 || averagePageLoadTime > 4000) {
        thresholdBreaches.push({
          metricName: crashRatePerHour > 2 ? 'Crash Rate' : 'Page Load Time',
          threshold: crashRatePerHour > 2 ? 2 : 4000,
          actualValue: crashRatePerHour > 2 ? crashRatePerHour : averagePageLoadTime,
          severity: crashRatePerHour > 3 || averagePageLoadTime > 6000 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
          timestamp: new Date(this.currentTime)
        });
      }

      metrics.push({
        applicationId,
        applicationName: appNames[i] || `Application ${i + 1}`,
        crashRatePerHour: Math.round(crashRatePerHour * 100) / 100,
        averagePageLoadTime: Math.round(averagePageLoadTime),
        screenLoadTimes,
        devicePerformance,
        performanceTrends,
        thresholdBreaches,
        timestamp: new Date(this.currentTime)
      });
    }

    return metrics;
  }

  // Business cost analysis (Requirements 4.1, 4.2, 4.3, 4.4, 4.5)
  generateBusinessCostMetrics(): BusinessCostMetrics[] {
    const businessUnits = [BusinessUnit.FASHION, BusinessUnit.BEAUTY, BusinessUnit.SUPERSTORE];
    const metrics: BusinessCostMetrics[] = [];

    businessUnits.forEach(businessUnit => {
      // Base cost per order varies by business unit
      let baseCostPerOrder: number;
      switch (businessUnit) {
        case BusinessUnit.FASHION:
          baseCostPerOrder = 2.50 + Math.random() * 0.70; // $2.50-$3.20
          break;
        case BusinessUnit.BEAUTY:
          baseCostPerOrder = 1.80 + Math.random() * 0.60; // $1.80-$2.40
          break;
        case BusinessUnit.SUPERSTORE:
          baseCostPerOrder = 1.20 + Math.random() * 0.60; // $1.20-$1.80
          break;
      }

      const scenarioMultiplier = this.getScenarioMultiplier(MetricType.BUSINESS_COST);
      const costPerOrder = Math.round(baseCostPerOrder * scenarioMultiplier * 100) / 100;
      const orderVolume = Math.floor(1000 + Math.random() * 9000); // 1K-10K orders
      const totalCost = Math.round(costPerOrder * orderVolume);

      // Cost breakdown
      const costBreakdown = {
        infrastructure: totalCost * (0.4 + Math.random() * 0.2), // 40-60%
        api: totalCost * (0.2 + Math.random() * 0.15), // 20-35%
        thirdParty: totalCost * (0.15 + Math.random() * 0.15), // 15-30%
        other: totalCost * (0.05 + Math.random() * 0.1) // 5-15%
      };

      // Monthly trends (last 12 months)
      const monthlyTrends = [];
      for (let month = 11; month >= 0; month--) {
        const date = new Date(this.currentTime);
        date.setMonth(date.getMonth() - month);
        const monthStr = date.toISOString().substring(0, 7); // YYYY-MM

        const monthlyVariation = 0.85 + Math.random() * 0.3; // ±15% variation
        const monthlyCostPerOrder = baseCostPerOrder * monthlyVariation;
        const monthlyOrderVolume = Math.floor(orderVolume * (0.8 + Math.random() * 0.4));

        monthlyTrends.push({
          month: monthStr,
          costPerOrder: Math.round(monthlyCostPerOrder * 100) / 100,
          totalCost: Math.round(monthlyCostPerOrder * monthlyOrderVolume),
          orderVolume: monthlyOrderVolume,
          trendIndicator: Math.random() > 0.6 ? TrendDirection.IMPROVING :
                         Math.random() > 0.3 ? TrendDirection.STABLE : TrendDirection.DEGRADING
        });
      }

      // Optimization opportunities
      const optimizationOpportunities = [
        {
          category: 'infrastructure' as const,
          currentCost: costBreakdown.infrastructure,
          potentialSavings: costBreakdown.infrastructure * (0.05 + Math.random() * 0.15), // 5-20% savings
          recommendation: 'Optimize server utilization and implement auto-scaling',
          implementationEffort: 'medium' as const
        },
        {
          category: 'api' as const,
          currentCost: costBreakdown.api,
          potentialSavings: costBreakdown.api * (0.1 + Math.random() * 0.1), // 10-20% savings
          recommendation: 'Implement API caching and request optimization',
          implementationEffort: 'low' as const
        }
      ];

      // API improvement suggestions
      const apiImprovementSuggestions = [
        {
          apiName: 'product-catalog',
          currentCost: costBreakdown.api * 0.3,
          estimatedSavings: costBreakdown.api * 0.05,
          suggestion: 'Implement Redis caching for product data',
          costImpact: 15 // 15% reduction
        },
        {
          apiName: 'recommendation-engine',
          currentCost: costBreakdown.api * 0.25,
          estimatedSavings: costBreakdown.api * 0.04,
          suggestion: 'Optimize ML model inference batching',
          costImpact: 12 // 12% reduction
        }
      ];

      // Third-party analysis
      const thirdPartyAnalysis = [
        {
          serviceName: 'Payment Gateway',
          currentCost: costBreakdown.thirdParty * 0.4,
          alternatives: [
            {
              name: 'Alternative Payment Provider',
              estimatedCost: costBreakdown.thirdParty * 0.35,
              costImpact: -12.5, // 12.5% savings
              migrationEffort: 'high' as const
            }
          ],
          recommendation: 'Consider migration during next major release'
        }
      ];

      metrics.push({
        businessUnit,
        costPerOrder,
        totalCost,
        orderVolume,
        period: {
          start: new Date(this.currentTime.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          end: new Date(this.currentTime)
        },
        costBreakdown,
        monthlyTrends,
        optimizationOpportunities,
        apiImprovementSuggestions,
        thirdPartyAnalysis,
        timestamp: new Date(this.currentTime)
      });
    });

    return metrics;
  }

  // AI department monitoring (Requirements 5.1, 5.2, 5.3, 5.4, 5.5)
  generateAIMetrics(): AIMetrics[] {
    const modelCount = this.baselineData.get('aiModelCount');
    const metrics: AIMetrics[] = [];
    const modelNames = [
      'recommendation-model-v2', 'fraud-detection-v3', 'price-optimization-v1',
      'customer-segmentation-v2', 'demand-forecasting-v4', 'image-classification-v1',
      'sentiment-analysis-v2', 'chatbot-nlp-v3', 'inventory-optimization-v1', 'personalization-engine-v2'
    ];

    for (let i = 0; i < modelCount; i++) {
      const modelId = `ai-model-${i.toString().padStart(3, '0')}`;
      const scenarioMultiplier = this.getScenarioMultiplier(MetricType.AI_METRICS);

      // Model performance metrics
      const baseAccuracy = 0.85 + Math.random() * 0.13; // 85-98%
      const accuracy = Math.min(0.99, baseAccuracy / Math.max(0.8, scenarioMultiplier));
      
      const baseInferenceTime = 10 + Math.random() * 190; // 10-200ms
      const inferenceTime = baseInferenceTime * scenarioMultiplier;
      
      const driftScore = Math.random() * 0.3; // 0-30% drift
      
      // Model status
      const statusRandom = Math.random();
      let status: AIModelStatus;
      if (statusRandom > 0.8) status = AIModelStatus.TRAINING;
      else if (statusRandom > 0.1) status = AIModelStatus.DEPLOYED;
      else if (statusRandom > 0.05) status = AIModelStatus.DEPRECATED;
      else status = AIModelStatus.FAILED;

      // Training costs (last 5 sessions)
      const trainingCosts = [];
      for (let session = 0; session < 5; session++) {
        const sessionDate = new Date(this.currentTime.getTime() - session * 7 * 24 * 60 * 60 * 1000);
        trainingCosts.push({
          sessionId: `session-${modelId}-${session}`,
          computeCost: Math.round((50 + Math.random() * 1950) * 100) / 100, // $50-$2000
          duration: Math.round((1 + Math.random() * 23) * 100) / 100, // 1-24 hours
          resourcesUsed: `${Math.floor(1 + Math.random() * 8)} GPUs, ${Math.floor(16 + Math.random() * 112)}GB RAM`,
          timestamp: sessionDate
        });
      }

      // Deployment metrics
      const deploymentMetrics = {
        deploymentId: `deploy-${modelId}-latest`,
        successRate: Math.round((85 + Math.random() * 14) * 100) / 100, // 85-99%
        rollbackFrequency: Math.round((Math.random() * 0.3) * 100) / 100, // 0-0.3 rollbacks per deployment
        deploymentTime: Math.round(5 + Math.random() * 25), // 5-30 minutes
        lastDeployment: new Date(this.currentTime.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      };

      // Resource utilization
      const monthlyBudget = 5000 + Math.random() * 15000; // $5K-$20K
      const budgetUsed = monthlyBudget * (0.3 + Math.random() * 0.6); // 30-90% used
      const resourceUtilization = {
        gpuUsage: Math.round((60 + Math.random() * 35) * 100) / 100, // 60-95%
        trainingQueueLength: Math.floor(Math.random() * 10), // 0-9 jobs in queue
        servingCapacity: Math.round((50 + Math.random() * 450) * 100) / 100, // 50-500 RPS
        monthlyBudget: Math.round(monthlyBudget),
        budgetUsed: Math.round(budgetUsed),
        budgetRemaining: Math.round(monthlyBudget - budgetUsed)
      };

      // Performance anomalies
      const performanceAnomalies = [];
      if (driftScore > 0.2) {
        performanceAnomalies.push({
          type: 'drift_detected' as const,
          severity: driftScore > 0.25 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
          description: `Model drift detected: ${Math.round(driftScore * 100)}% deviation from baseline`,
          detectedAt: new Date(this.currentTime.getTime() - Math.random() * 24 * 60 * 60 * 1000),
          resolved: Math.random() > 0.7
        });
      }

      if (accuracy < 0.9) {
        performanceAnomalies.push({
          type: 'model_degradation' as const,
          severity: accuracy < 0.87 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
          description: `Model accuracy dropped to ${Math.round(accuracy * 100)}%`,
          detectedAt: new Date(this.currentTime.getTime() - Math.random() * 12 * 60 * 60 * 1000),
          resolved: false
        });
      }

      metrics.push({
        modelId,
        modelName: modelNames[i] || `ai-model-${i}`,
        version: `v${Math.floor(1 + Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
        accuracy: Math.round(accuracy * 10000) / 10000,
        inferenceTime: Math.round(inferenceTime),
        driftScore: Math.round(driftScore * 1000) / 1000,
        status,
        trainingCosts,
        deploymentMetrics,
        resourceUtilization,
        performanceAnomalies,
        timestamp: new Date(this.currentTime)
      });
    }

    return metrics;
  }

  // QA department monitoring (Requirements 6.1, 6.2, 6.3, 6.4, 6.5)
  generateQAMetrics(): QAMetrics[] {
    const projectCount = this.baselineData.get('qaProjectCount');
    const metrics: QAMetrics[] = [];
    const projectNames = [
      'Web Portal', 'Mobile App', 'Payment Service', 'User Management',
      'Product Catalog', 'Order Processing', 'Analytics Platform', 'Admin Dashboard'
    ];

    for (let i = 0; i < projectCount; i++) {
      const projectId = `qa-project-${i.toString().padStart(3, '0')}`;
      const scenarioMultiplier = this.getScenarioMultiplier(MetricType.QA_METRICS);

      // Test coverage
      const baseCoverage = 65 + Math.random() * 30; // 65-95%
      const overallPercentage = Math.min(95, baseCoverage / Math.max(0.8, scenarioMultiplier));
      const testCoverage = {
        overallPercentage: Math.round(overallPercentage * 100) / 100,
        unitTestCoverage: Math.min(100, Math.round((overallPercentage + Math.random() * 10) * 100) / 100),
        integrationTestCoverage: Math.min(100, Math.round((overallPercentage - 5 + Math.random() * 10) * 100) / 100),
        e2eTestCoverage: Math.min(100, Math.round((overallPercentage - 10 + Math.random() * 15) * 100) / 100),
        codeQualityScore: Math.round((75 + Math.random() * 20) * 100) / 100 // 75-95
      };

      // Defect rates
      const baseBugsPerRelease = 5 + Math.random() * 15; // 5-20 bugs
      const bugsPerRelease = Math.round(baseBugsPerRelease * scenarioMultiplier);
      
      const severityDistribution: Record<DefectSeverity, number> = {
        [DefectSeverity.CRITICAL]: Math.floor(bugsPerRelease * 0.1),
        [DefectSeverity.HIGH]: Math.floor(bugsPerRelease * 0.2),
        [DefectSeverity.MEDIUM]: Math.floor(bugsPerRelease * 0.4),
        [DefectSeverity.LOW]: Math.floor(bugsPerRelease * 0.3)
      };

      const defectRates = {
        bugsPerRelease,
        severityDistribution,
        averageResolutionTime: Math.round((24 + Math.random() * 96) * 100) / 100, // 24-120 hours
        defectDensity: Math.round((bugsPerRelease / 10) * 100) / 100, // bugs per KLOC
        escapeRate: Math.round((2 + Math.random() * 8) * 100) / 100 // 2-10%
      };

      // Release quality
      const basePassRate = 80 + Math.random() * 18; // 80-98%
      const automatedTestPassRate = Math.min(98, basePassRate / Math.max(0.9, scenarioMultiplier));
      
      const releaseQuality = {
        automatedTestPassRate: Math.round(automatedTestPassRate * 100) / 100,
        manualTestingCompletion: Math.round((85 + Math.random() * 15) * 100) / 100, // 85-100%
        releaseReadinessScore: Math.round((70 + Math.random() * 30) * 100) / 100, // 70-100
        qualityConcerns: bugsPerRelease > 15 ? ['High defect count', 'Test coverage gaps'] : [],
        approvalStatus: automatedTestPassRate > 95 && bugsPerRelease < 10 ? 
          ApprovalStatus.APPROVED : 
          automatedTestPassRate > 90 ? ApprovalStatus.CONDITIONAL : ApprovalStatus.PENDING
      };

      // Testing efficiency
      const testingEfficiency = {
        testExecutionTime: Math.round(30 + Math.random() * 90), // 30-120 minutes
        flakyTestRate: Math.round((1 + Math.random() * 9) * 100) / 100, // 1-10%
        resourceUtilization: Math.round((60 + Math.random() * 35) * 100) / 100, // 60-95%
        automationRate: Math.round((70 + Math.random() * 25) * 100) / 100, // 70-95%
        testMaintenanceTime: Math.round((5 + Math.random() * 15) * 100) / 100 // 5-20 hours/week
      };

      // Quality gates
      const qualityGates = [
        {
          name: 'Code Coverage Gate',
          criteria: [
            {
              metric: 'Unit Test Coverage',
              threshold: 80,
              actualValue: testCoverage.unitTestCoverage,
              passed: testCoverage.unitTestCoverage >= 80
            },
            {
              metric: 'Integration Test Coverage',
              threshold: 70,
              actualValue: testCoverage.integrationTestCoverage,
              passed: testCoverage.integrationTestCoverage >= 70
            }
          ],
          status: testCoverage.unitTestCoverage >= 80 && testCoverage.integrationTestCoverage >= 70 ?
            QualityGateStatus.PASSED : QualityGateStatus.FAILED,
          lastEvaluation: new Date(this.currentTime)
        },
        {
          name: 'Defect Rate Gate',
          criteria: [
            {
              metric: 'Critical Defects',
              threshold: 2,
              actualValue: severityDistribution[DefectSeverity.CRITICAL],
              passed: severityDistribution[DefectSeverity.CRITICAL] <= 2
            }
          ],
          status: severityDistribution[DefectSeverity.CRITICAL] <= 2 ?
            QualityGateStatus.PASSED : QualityGateStatus.FAILED,
          lastEvaluation: new Date(this.currentTime)
        }
      ];

      metrics.push({
        projectId,
        projectName: projectNames[i] || `QA Project ${i + 1}`,
        testCoverage,
        defectRates,
        releaseQuality,
        testingEfficiency,
        qualityGates,
        timestamp: new Date(this.currentTime)
      });
    }

    return metrics;
  }

  // Business analytics monitoring (Requirements 7.1, 7.2, 7.3, 7.4, 7.5)
  generateBusinessAnalyticsMetrics(): BusinessAnalyticsMetrics[] {
    const pipelineCount = this.baselineData.get('pipelineCount');
    const metrics: BusinessAnalyticsMetrics[] = [];
    const pipelineNames = [
      'Customer Data Pipeline', 'Sales Analytics Pipeline', 'Inventory ETL',
      'Marketing Attribution', 'Financial Reporting', 'Product Analytics',
      'User Behavior Tracking', 'Revenue Analytics', 'Operational Metrics',
      'Real-time Events', 'Batch Processing', 'Data Warehouse Sync'
    ];

    for (let i = 0; i < pipelineCount; i++) {
      const pipelineId = `pipeline-${i.toString().padStart(3, '0')}`;
      const scenarioMultiplier = this.getScenarioMultiplier(MetricType.ANALYTICS);

      // Data pipeline health
      const baseSuccessRate = 90 + Math.random() * 9; // 90-99%
      const successRate = Math.min(99, baseSuccessRate / Math.max(0.9, scenarioMultiplier));
      
      const dataHealth = {
        successRate: Math.round(successRate * 100) / 100,
        dataFreshness: Math.round((1 + Math.random() * 29) * scenarioMultiplier), // 1-30 minutes
        processingLatency: Math.round((5 + Math.random() * 55) * scenarioMultiplier), // 5-60 minutes
        recordsProcessed: Math.floor((10000 + Math.random() * 990000) / scenarioMultiplier), // 10K-1M records
        dataQualityScore: Math.round((85 + Math.random() * 14) * 100) / 100 // 85-99
      };

      // Reporting performance
      const baseReportTime = 2 + Math.random() * 28; // 2-30 seconds
      const reportGenerationTime = baseReportTime * scenarioMultiplier;
      
      const queryPerformance = [
        {
          queryId: `query-${pipelineId}-simple`,
          executionTime: Math.round((100 + Math.random() * 400) * scenarioMultiplier), // 100-500ms
          complexity: QueryComplexity.SIMPLE,
          resourceUsage: Math.round((0.1 + Math.random() * 0.4) * 100) / 100 // 0.1-0.5 CPU seconds
        },
        {
          queryId: `query-${pipelineId}-medium`,
          executionTime: Math.round((500 + Math.random() * 1500) * scenarioMultiplier), // 0.5-2s
          complexity: QueryComplexity.MEDIUM,
          resourceUsage: Math.round((0.5 + Math.random() * 1.5) * 100) / 100 // 0.5-2 CPU seconds
        },
        {
          queryId: `query-${pipelineId}-complex`,
          executionTime: Math.round((2000 + Math.random() * 8000) * scenarioMultiplier), // 2-10s
          complexity: QueryComplexity.COMPLEX,
          resourceUsage: Math.round((2 + Math.random() * 8) * 100) / 100 // 2-10 CPU seconds
        }
      ];

      const reportingPerformance = {
        reportGenerationTime: Math.round(reportGenerationTime),
        queryPerformance,
        dashboardLoadTime: Math.round((1 + Math.random() * 4) * scenarioMultiplier), // 1-5 seconds
        concurrentUsers: Math.floor(10 + Math.random() * 90), // 10-100 users
        cacheHitRate: Math.round((70 + Math.random() * 25) * 100) / 100 // 70-95%
      };

      // Pipeline errors
      const pipelineErrors = [];
      if (successRate < 95) {
        const errorCount = Math.floor((100 - successRate) / 5); // More errors for lower success rates
        for (let e = 0; e < errorCount; e++) {
          const errorCategories = Object.values(PipelineErrorCategory);
          const category = errorCategories[Math.floor(Math.random() * errorCategories.length)];
          
          pipelineErrors.push({
            errorId: `error-${pipelineId}-${e}`,
            category,
            description: this.getErrorDescription(category),
            severity: Math.random() > 0.7 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
            occurredAt: new Date(this.currentTime.getTime() - Math.random() * 24 * 60 * 60 * 1000),
            resolved: Math.random() > 0.3
          });
        }
      }

      // Business intelligence metrics
      const reportUsage = [
        {
          reportName: 'Daily Sales Report',
          viewCount: Math.floor(50 + Math.random() * 200), // 50-250 views
          uniqueUsers: Math.floor(20 + Math.random() * 80), // 20-100 users
          averageViewTime: Math.round((3 + Math.random() * 12) * 100) / 100, // 3-15 minutes
          lastAccessed: new Date(this.currentTime.getTime() - Math.random() * 24 * 60 * 60 * 1000)
        },
        {
          reportName: 'Customer Analytics Dashboard',
          viewCount: Math.floor(30 + Math.random() * 120), // 30-150 views
          uniqueUsers: Math.floor(15 + Math.random() * 60), // 15-75 users
          averageViewTime: Math.round((5 + Math.random() * 20) * 100) / 100, // 5-25 minutes
          lastAccessed: new Date(this.currentTime.getTime() - Math.random() * 12 * 60 * 60 * 1000)
        }
      ];

      const businessIntelligence = {
        dataAccuracyScore: Math.round((88 + Math.random() * 11) * 100) / 100, // 88-99%
        reportUsageStatistics: reportUsage,
        userEngagementMetrics: {
          activeUsers: Math.floor(50 + Math.random() * 150), // 50-200 users
          sessionDuration: Math.round((15 + Math.random() * 45) * 100) / 100, // 15-60 minutes
          interactionRate: Math.round((5 + Math.random() * 15) * 100) / 100, // 5-20 clicks per session
          retentionRate: Math.round((75 + Math.random() * 20) * 100) / 100 // 75-95%
        },
        insightGenerationRate: Math.round((2 + Math.random() * 8) * 100) / 100 // 2-10 insights per day
      };

      // Analytics infrastructure
      const etlJobPerformance = [
        {
          jobName: `ETL-${pipelineNames[i]?.replace(/\s+/g, '-') || `job-${i}`}`,
          executionTime: Math.round((30 + Math.random() * 90) * scenarioMultiplier), // 30-120 minutes
          successRate: Math.round((92 + Math.random() * 7) * 100) / 100, // 92-99%
          resourceConsumption: Math.round((2 + Math.random() * 8) * 100) / 100, // 2-10 CPU hours
          lastRun: new Date(this.currentTime.getTime() - Math.random() * 24 * 60 * 60 * 1000)
        }
      ];

      const storageCosts = [
        {
          storageType: 'hot' as const,
          sizeGB: Math.floor(100 + Math.random() * 900), // 100-1000 GB
          monthlyCost: Math.round((50 + Math.random() * 200) * 100) / 100, // $50-$250
          growthRate: Math.round((2 + Math.random() * 8) * 100) / 100 // 2-10% per month
        },
        {
          storageType: 'warm' as const,
          sizeGB: Math.floor(500 + Math.random() * 4500), // 500-5000 GB
          monthlyCost: Math.round((25 + Math.random() * 100) * 100) / 100, // $25-$125
          growthRate: Math.round((1 + Math.random() * 4) * 100) / 100 // 1-5% per month
        }
      ];

      const analyticsInfrastructure = {
        dataWarehouseUtilization: Math.round((60 + Math.random() * 25) * 100) / 100, // 60-85%
        etlJobPerformance,
        storageCosts,
        computeResourceUsage: Math.round((50 + Math.random() * 40) * 100) / 100 // 50-90%
      };

      metrics.push({
        pipelineId,
        pipelineName: pipelineNames[i] || `Analytics Pipeline ${i + 1}`,
        dataHealth,
        reportingPerformance,
        pipelineErrors,
        businessIntelligence,
        analyticsInfrastructure,
        timestamp: new Date(this.currentTime)
      });
    }

    return metrics;
  }

  // Data integration monitoring (Requirements 8.1, 8.2, 8.3, 8.4, 8.5)
  generateDataIntegrationMetrics(): DataIntegrationMetrics[] {
    const sourceTypes = Object.values(DataSourceType);
    const metrics: DataIntegrationMetrics[] = [];

    sourceTypes.forEach((sourceType, index) => {
      const sourceId = `source-${index.toString().padStart(3, '0')}`;
      const scenarioMultiplier = this.getScenarioMultiplier(MetricType.ANALYTICS);

      // Connection status
      const connectionRandom = Math.random();
      let connectionStatus: ConnectionStatus;
      if (scenarioMultiplier > 1.5) {
        // During high load scenarios, more connection issues
        connectionStatus = connectionRandom > 0.7 ? ConnectionStatus.CONNECTED :
                          connectionRandom > 0.4 ? ConnectionStatus.DEGRADED :
                          connectionRandom > 0.2 ? ConnectionStatus.RECONNECTING : ConnectionStatus.DISCONNECTED;
      } else {
        connectionStatus = connectionRandom > 0.9 ? ConnectionStatus.DEGRADED : ConnectionStatus.CONNECTED;
      }

      // Data quality metrics
      const baseValidationScore = 85 + Math.random() * 14; // 85-99%
      const validationScore = Math.min(99, baseValidationScore / Math.max(0.9, scenarioMultiplier));
      
      const dataQuality = {
        validationScore: Math.round(validationScore * 100) / 100,
        missingDataPercentage: Math.round((0.5 + Math.random() * 4.5) * scenarioMultiplier * 100) / 100, // 0.5-5%
        corruptedDataCount: Math.floor((1 + Math.random() * 19) * scenarioMultiplier), // 1-20 records
        duplicateDataCount: Math.floor((5 + Math.random() * 45) * scenarioMultiplier), // 5-50 records
        schemaComplianceScore: Math.round((90 + Math.random() * 9) * 100) / 100 // 90-99%
      };

      // Data aggregation metrics
      const aggregationMetrics = {
        metricsAggregated: Math.floor((1000 + Math.random() * 9000) / scenarioMultiplier), // 1K-10K metrics
        timestampConsistency: Math.round((95 + Math.random() * 4) * 100) / 100, // 95-99%
        aggregationLatency: Math.round((50 + Math.random() * 200) * scenarioMultiplier), // 50-250ms
        dataLossPercentage: Math.round((0.1 + Math.random() * 0.9) * scenarioMultiplier * 100) / 100 // 0.1-1%
      };

      // Real-time metrics
      const realTimeMetrics = {
        updateFrequency: Math.round((5 + Math.random() * 25) * scenarioMultiplier), // 5-30 seconds
        criticalMetricLatency: Math.round((1 + Math.random() * 29) * scenarioMultiplier), // 1-30 seconds
        refreshPerformance: Math.round((10 + Math.random() * 90) / scenarioMultiplier * 100) / 100, // 10-100 updates/sec
        realTimeDataPoints: Math.floor((500 + Math.random() * 4500) / scenarioMultiplier) // 500-5K data points
      };

      // Fault tolerance metrics
      const faultTolerance = {
        cachedDataAvailability: Math.round((85 + Math.random() * 14) * 100) / 100, // 85-99%
        failoverTime: Math.round((2 + Math.random() * 8) * scenarioMultiplier), // 2-10 seconds
        dataRecoveryTime: Math.round((1 + Math.random() * 9) * scenarioMultiplier), // 1-10 minutes
        serviceAvailability: connectionStatus === ConnectionStatus.CONNECTED ? 
          Math.round((99 + Math.random() * 0.9) * 100) / 100 : // 99-99.9%
          Math.round((95 + Math.random() * 4) * 100) / 100 // 95-99%
      };

      metrics.push({
        sourceId,
        sourceName: this.getSourceName(sourceType),
        sourceType,
        connectionStatus,
        dataQuality,
        aggregationMetrics,
        realTimeMetrics,
        faultTolerance,
        timestamp: new Date(this.currentTime)
      });
    });

    return metrics;
  }

  // Alert generation (Requirements 9.1, 9.2, 9.3, 9.4, 9.5)
  generateAlerts(): Alert[] {
    const alerts: Alert[] = [];
    const alertCount = Math.floor(Math.random() * 10); // 0-9 active alerts

    for (let i = 0; i < alertCount; i++) {
      const alertId = `alert-${Date.now()}-${i}`;
      const metricTypes = Object.values(MetricType);
      const metricType = metricTypes[Math.floor(Math.random() * metricTypes.length)];
      
      const severities = Object.values(AlertSeverity);
      const severity = severities[Math.floor(Math.random() * severities.length)];
      
      const statuses = Object.values(AlertStatus);
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const triggeredAt = new Date(this.currentTime.getTime() - Math.random() * 24 * 60 * 60 * 1000);
      const resolvedAt = status === AlertStatus.RESOLVED ? 
        new Date(triggeredAt.getTime() + Math.random() * 12 * 60 * 60 * 1000) : undefined;

      // Alert details
      const details = {
        metricName: this.getMetricNameForType(metricType),
        currentValue: Math.round((50 + Math.random() * 50) * 100) / 100,
        threshold: Math.round((40 + Math.random() * 40) * 100) / 100,
        condition: 'greater than',
        affectedResources: [`resource-${Math.floor(Math.random() * 100)}`],
        recommendedActions: [
          'Check system resources',
          'Review recent deployments',
          'Scale infrastructure if needed'
        ]
      };

      // Notifications
      const notifications = [
        {
          id: `notification-${alertId}-email`,
          channel: NotificationChannel.EMAIL,
          status: NotificationStatus.DELIVERED,
          sentAt: new Date(triggeredAt.getTime() + 30000), // 30 seconds after trigger
          deliveredAt: new Date(triggeredAt.getTime() + 45000), // 45 seconds after trigger
          retryCount: 0
        },
        {
          id: `notification-${alertId}-dashboard`,
          channel: NotificationChannel.IN_DASHBOARD,
          status: NotificationStatus.DELIVERED,
          sentAt: triggeredAt,
          deliveredAt: triggeredAt,
          retryCount: 0
        }
      ];

      alerts.push({
        id: alertId,
        ruleId: `rule-${metricType}-threshold`,
        ruleName: `${metricType} Threshold Alert`,
        metricType,
        severity,
        status,
        triggeredAt,
        resolvedAt,
        message: `${details.metricName} exceeded threshold: ${details.currentValue} > ${details.threshold}`,
        details,
        notifications
      });
    }

    return alerts;
  }

  // Predefined scenarios for POC demonstrations
  getPredefinedScenarios(): MockDataScenario[] {
    return [
      {
        name: 'Normal Operations',
        description: 'All systems healthy, metrics within normal ranges',
        duration: 60, // 1 hour
        effects: []
      },
      {
        name: 'High Load Event',
        description: 'Simulated traffic spike affecting multiple systems',
        duration: 30, // 30 minutes
        effects: [
          { metricType: MetricType.INFRASTRUCTURE, multiplier: 1.8, probability: 0.9 },
          { metricType: MetricType.API_PERFORMANCE, multiplier: 1.5, probability: 0.8 },
          { metricType: MetricType.APP_PERFORMANCE, multiplier: 1.4, probability: 0.7 }
        ]
      },
      {
        name: 'Infrastructure Issues',
        description: 'Server problems cascading to application performance',
        duration: 45, // 45 minutes
        effects: [
          { metricType: MetricType.INFRASTRUCTURE, multiplier: 2.2, probability: 1.0 },
          { metricType: MetricType.API_PERFORMANCE, multiplier: 1.8, probability: 0.9 },
          { metricType: MetricType.APP_PERFORMANCE, multiplier: 1.6, probability: 0.8 }
        ]
      },
      {
        name: 'Cost Spike',
        description: 'Unusual cost increases requiring investigation',
        duration: 120, // 2 hours
        effects: [
          { metricType: MetricType.BUSINESS_COST, multiplier: 1.6, probability: 1.0 },
          { metricType: MetricType.AI_METRICS, multiplier: 1.3, probability: 0.7 }
        ]
      },
      {
        name: 'AI Model Drift',
        description: 'Model performance degradation requiring retraining',
        duration: 180, // 3 hours
        effects: [
          { metricType: MetricType.AI_METRICS, multiplier: 1.8, additive: 0.2, probability: 1.0 }
        ]
      },
      {
        name: 'Quality Issues',
        description: 'Test failures and defect spikes during release cycle',
        duration: 90, // 1.5 hours
        effects: [
          { metricType: MetricType.QA_METRICS, multiplier: 1.7, probability: 1.0 }
        ]
      },
      {
        name: 'Data Pipeline Problems',
        description: 'Analytics pipeline failures affecting reporting',
        duration: 60, // 1 hour
        effects: [
          { metricType: MetricType.ANALYTICS, multiplier: 1.9, probability: 1.0 }
        ]
      }
    ];
  }

  // Scenario management
  activateScenario(scenario: MockDataScenario): void {
    this.activeScenario = scenario;
    this.scenarioStartTime = new Date(this.currentTime);
  }

  deactivateScenario(): void {
    this.activeScenario = null;
    this.scenarioStartTime = null;
  }

  private isScenarioActive(): boolean {
    if (!this.activeScenario || !this.scenarioStartTime) return false;
    
    const elapsedMinutes = (this.currentTime.getTime() - this.scenarioStartTime.getTime()) / (1000 * 60);
    return elapsedMinutes < this.activeScenario.duration;
  }

  private getScenarioMultiplier(metricType: MetricType): number {
    if (!this.activeScenario || !this.isScenarioActive()) return 1.0;

    const effect = this.activeScenario.effects.find(e => e.metricType === metricType);
    if (!effect) return 1.0;

    // Apply probability
    if (effect.probability && Math.random() > effect.probability) return 1.0;

    return effect.multiplier;
  }

  // Real-time simulation - advance time and refresh data
  advanceTime(minutes: number = 1): void {
    this.currentTime = new Date(this.currentTime.getTime() + minutes * 60 * 1000);
  }

  getCurrentTime(): Date {
    return new Date(this.currentTime);
  }

  // Helper methods
  private getErrorDescription(category: PipelineErrorCategory): string {
    const descriptions = {
      [PipelineErrorCategory.DATA_QUALITY]: 'Data validation failed: missing required fields',
      [PipelineErrorCategory.TRANSFORMATION_FAILURE]: 'ETL transformation error: invalid data format',
      [PipelineErrorCategory.CONNECTIVITY_PROBLEM]: 'Unable to connect to data source',
      [PipelineErrorCategory.RESOURCE_EXHAUSTION]: 'Insufficient memory for processing large dataset'
    };
    return descriptions[category];
  }

  private getSourceName(sourceType: DataSourceType): string {
    const names = {
      [DataSourceType.INFRASTRUCTURE_MONITORING]: 'Prometheus Monitoring',
      [DataSourceType.APM_SYSTEM]: 'New Relic APM',
      [DataSourceType.BUSINESS_INTELLIGENCE]: 'Tableau Analytics',
      [DataSourceType.AI_PLATFORM]: 'MLflow Platform',
      [DataSourceType.QA_TOOLS]: 'Jenkins CI/CD',
      [DataSourceType.ANALYTICS_SYSTEM]: 'Snowflake Warehouse'
    };
    return names[sourceType];
  }

  private getMetricNameForType(metricType: MetricType): string {
    const names = {
      [MetricType.INFRASTRUCTURE]: 'CPU Utilization',
      [MetricType.API_PERFORMANCE]: 'API Response Time',
      [MetricType.APP_PERFORMANCE]: 'Page Load Time',
      [MetricType.BUSINESS_COST]: 'Cost Per Order',
      [MetricType.AI_METRICS]: 'Model Accuracy',
      [MetricType.QA_METRICS]: 'Test Coverage',
      [MetricType.ANALYTICS]: 'Pipeline Success Rate'
    };
    return names[metricType];
  }

  // Generate all metrics at once for dashboard
  generateAllMetrics() {
    return {
      infrastructure: this.generateInfrastructureMetrics(),
      apiPerformance: this.generateAPIPerformanceMetrics(),
      appPerformance: this.generateAppPerformanceMetrics(),
      businessCost: this.generateBusinessCostMetrics(),
      aiMetrics: this.generateAIMetrics(),
      qaMetrics: this.generateQAMetrics(),
      businessAnalytics: this.generateBusinessAnalyticsMetrics(),
      dataIntegration: this.generateDataIntegrationMetrics(),
      alerts: this.generateAlerts(),
      timestamp: new Date(this.currentTime)
    };
  }
}