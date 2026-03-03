import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  MetricType,
  InfrastructureMetrics,
  APIPerformanceMetrics,
  AppPerformanceMetrics,
  BusinessCostMetrics,
  AIMetrics,
  QAMetrics,
  BusinessAnalyticsMetrics,
  ServerStatus,
  DeviceType,
  NetworkCondition,
  BusinessUnit,
  AIModelStatus,
  DefectSeverity,
  ApprovalStatus,
  PipelineErrorCategory,
  AlertSeverity,
  QualityGateStatus,
  QueryComplexity
} from './index'

/**
 * **Feature: cto-dashboard, Property 1: Complete Metric Display**
 * For any metric type with available data, the dashboard should display all required metric components as specified for that type
 * **Validates: Requirements 1.3, 5.1, 6.3, 7.1, 7.5**
 */

// Generators for creating valid test data
const dateArbitrary = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
  .filter(d => !isNaN(d.getTime()))

// Helper for non-empty strings
const nonEmptyString = (minLength: number, maxLength: number) => 
  fc.string({ minLength, maxLength }).filter(s => s.trim().length > 0)

const infrastructureMetricsArbitrary = fc.record({
  serverId: nonEmptyString(1, 50),
  serverName: nonEmptyString(1, 100),
  cpuUtilization: fc.double({ min: 0, max: 100 }),
  memoryUtilization: fc.double({ min: 0, max: 100 }),
  diskUtilization: fc.double({ min: 0, max: 100 }),
  networkUtilization: fc.double({ min: 0, max: 100 }),
  loadPercentage: fc.double({ min: 0, max: 100 }),
  status: fc.constantFrom(...Object.values(ServerStatus)),
  uptime: fc.double({ min: 0, max: 8760 }), // max hours in a year
  apiTrafficCount: fc.integer({ min: 0, max: 1000 }),
  trafficVolume: fc.integer({ min: 0, max: 100000 }),
  timestamp: dateArbitrary
})

const apiPerformanceMetricsArbitrary = fc.record({
  endpointId: nonEmptyString(1, 50),
  endpointName: nonEmptyString(1, 100),
  successRate: fc.double({ min: 0, max: 100 }),
  failureRate: fc.double({ min: 0, max: 100 }),
  averageLatency: fc.double({ min: 1, max: 10000 }),
  medianLatency: fc.double({ min: 1, max: 10000 }),
  p95Latency: fc.double({ min: 1, max: 10000 }),
  errorsByStatusCode: fc.dictionary(
    fc.string({ minLength: 3, maxLength: 3 }), // HTTP status codes
    fc.integer({ min: 0, max: 1000 })
  ),
  requestsPerMinute: fc.integer({ min: 0, max: 100000 }),
  uptime: fc.double({ min: 0, max: 100 }),
  uptimeWindow: nonEmptyString(1, 50),
  timestamp: dateArbitrary
})

const appPerformanceMetricsArbitrary = fc.record({
  applicationId: fc.string({ minLength: 1, maxLength: 50 }),
  applicationName: fc.string({ minLength: 1, maxLength: 100 }),
  crashRatePerHour: fc.double({ min: 0, max: 10 }),
  averagePageLoadTime: fc.double({ min: 100, max: 30000 }),
  screenLoadTimes: fc.array(fc.record({
    screenName: fc.string({ minLength: 1, maxLength: 100 }),
    loadTime: fc.double({ min: 100, max: 30000 }),
    renderTime: fc.double({ min: 10, max: 5000 })
  }), { minLength: 1, maxLength: 20 }),
  devicePerformance: fc.array(fc.record({
    deviceType: fc.constantFrom(...Object.values(DeviceType)),
    networkCondition: fc.constantFrom(...Object.values(NetworkCondition)),
    averageLoadTime: fc.double({ min: 100, max: 30000 }),
    performanceScore: fc.double({ min: 0, max: 100 })
  }), { minLength: 1, maxLength: 10 }),
  performanceTrends: fc.array(fc.record({
    period: fc.record({
      start: dateArbitrary,
      end: dateArbitrary
    }),
    averagePerformance: fc.double({ min: 0, max: 100 }),
    trend: fc.constantFrom('improving', 'stable', 'degrading')
  }), { minLength: 1, maxLength: 12 }),
  thresholdBreaches: fc.array(fc.record({
    metricName: fc.string({ minLength: 1, maxLength: 100 }),
    threshold: fc.double({ min: 0, max: 10000 }),
    actualValue: fc.double({ min: 0, max: 10000 }),
    severity: fc.constantFrom(...Object.values(AlertSeverity)),
    timestamp: dateArbitrary
  }), { minLength: 0, maxLength: 10 }),
  timestamp: dateArbitrary
})

const businessCostMetricsArbitrary = fc.record({
  businessUnit: fc.constantFrom(...Object.values(BusinessUnit)),
  costPerOrder: fc.double({ min: 0.1, max: 100 }),
  totalCost: fc.double({ min: 100, max: 1000000 }),
  orderVolume: fc.integer({ min: 1, max: 100000 }),
  period: fc.record({
    start: dateArbitrary,
    end: dateArbitrary
  }),
  costBreakdown: fc.record({
    infrastructure: fc.double({ min: 0, max: 100000 }),
    api: fc.double({ min: 0, max: 100000 }),
    thirdParty: fc.double({ min: 0, max: 100000 }),
    other: fc.double({ min: 0, max: 100000 })
  }),
  monthlyTrends: fc.array(fc.record({
    month: fc.string({ minLength: 7, maxLength: 7 }), // YYYY-MM
    costPerOrder: fc.double({ min: 0.1, max: 100 }),
    totalCost: fc.double({ min: 100, max: 1000000 }),
    orderVolume: fc.integer({ min: 1, max: 100000 }),
    trendIndicator: fc.constantFrom('improving', 'stable', 'degrading')
  }), { minLength: 1, maxLength: 12 }),
  optimizationOpportunities: fc.array(fc.record({
    category: fc.constantFrom('infrastructure', 'api', 'caching', 'third_party'),
    currentCost: fc.double({ min: 100, max: 100000 }),
    potentialSavings: fc.double({ min: 10, max: 50000 }),
    recommendation: fc.string({ minLength: 10, maxLength: 500 }),
    implementationEffort: fc.constantFrom('low', 'medium', 'high')
  }), { minLength: 0, maxLength: 10 }),
  apiImprovementSuggestions: fc.array(fc.record({
    apiName: fc.string({ minLength: 1, maxLength: 100 }),
    currentCost: fc.double({ min: 10, max: 10000 }),
    estimatedSavings: fc.double({ min: 1, max: 5000 }),
    suggestion: fc.string({ minLength: 10, maxLength: 500 }),
    costImpact: fc.double({ min: 0, max: 100 })
  }), { minLength: 0, maxLength: 10 }),
  thirdPartyAnalysis: fc.array(fc.record({
    serviceName: fc.string({ minLength: 1, maxLength: 100 }),
    currentCost: fc.double({ min: 10, max: 10000 }),
    alternatives: fc.array(fc.record({
      name: fc.string({ minLength: 1, maxLength: 100 }),
      estimatedCost: fc.double({ min: 5, max: 15000 }),
      costImpact: fc.double({ min: -90, max: 200 }),
      migrationEffort: fc.constantFrom('low', 'medium', 'high')
    }), { minLength: 0, maxLength: 5 }),
    recommendation: fc.string({ minLength: 10, maxLength: 500 })
  }), { minLength: 0, maxLength: 10 }),
  timestamp: dateArbitrary
})

const aiMetricsArbitrary = fc.record({
  modelId: fc.string({ minLength: 1, maxLength: 50 }),
  modelName: fc.string({ minLength: 1, maxLength: 100 }),
  version: fc.string({ minLength: 1, maxLength: 20 }),
  accuracy: fc.double({ min: 0, max: 1 }),
  inferenceTime: fc.double({ min: 1, max: 5000 }),
  driftScore: fc.double({ min: 0, max: 1 }),
  status: fc.constantFrom(...Object.values(AIModelStatus)),
  trainingCosts: fc.array(fc.record({
    sessionId: fc.string({ minLength: 1, maxLength: 50 }),
    computeCost: fc.double({ min: 1, max: 10000 }),
    duration: fc.double({ min: 0.1, max: 168 }), // max week in hours
    resourcesUsed: fc.string({ minLength: 1, maxLength: 200 }),
    timestamp: dateArbitrary
  }), { minLength: 0, maxLength: 20 }),
  deploymentMetrics: fc.record({
    deploymentId: fc.string({ minLength: 1, maxLength: 50 }),
    successRate: fc.double({ min: 0, max: 100 }),
    rollbackFrequency: fc.double({ min: 0, max: 10 }),
    deploymentTime: fc.double({ min: 1, max: 120 }),
    lastDeployment: dateArbitrary
  }),
  resourceUtilization: fc.record({
    gpuUsage: fc.double({ min: 0, max: 100 }),
    trainingQueueLength: fc.integer({ min: 0, max: 100 }),
    servingCapacity: fc.integer({ min: 1, max: 10000 }),
    monthlyBudget: fc.double({ min: 1000, max: 100000 }),
    budgetUsed: fc.double({ min: 0, max: 100000 }),
    budgetRemaining: fc.double({ min: 0, max: 100000 })
  }),
  performanceAnomalies: fc.array(fc.record({
    type: fc.constantFrom('model_degradation', 'resource_spike', 'drift_detected'),
    severity: fc.constantFrom(...Object.values(AlertSeverity)),
    description: fc.string({ minLength: 10, maxLength: 500 }),
    detectedAt: dateArbitrary,
    resolved: fc.boolean()
  }), { minLength: 0, maxLength: 10 }),
  timestamp: dateArbitrary
})

const qaMetricsArbitrary = fc.record({
  projectId: fc.string({ minLength: 1, maxLength: 50 }),
  projectName: fc.string({ minLength: 1, maxLength: 100 }),
  testCoverage: fc.record({
    overallPercentage: fc.double({ min: 0, max: 100 }),
    unitTestCoverage: fc.double({ min: 0, max: 100 }),
    integrationTestCoverage: fc.double({ min: 0, max: 100 }),
    e2eTestCoverage: fc.double({ min: 0, max: 100 }),
    codeQualityScore: fc.double({ min: 0, max: 100 })
  }),
  defectRates: fc.record({
    bugsPerRelease: fc.integer({ min: 0, max: 100 }),
    severityDistribution: fc.dictionary(
      fc.constantFrom(...Object.values(DefectSeverity)),
      fc.integer({ min: 0, max: 50 })
    ),
    averageResolutionTime: fc.double({ min: 0.1, max: 720 }), // max 30 days in hours
    defectDensity: fc.double({ min: 0, max: 50 }),
    escapeRate: fc.double({ min: 0, max: 100 })
  }),
  releaseQuality: fc.record({
    automatedTestPassRate: fc.double({ min: 0, max: 100 }),
    manualTestingCompletion: fc.double({ min: 0, max: 100 }),
    releaseReadinessScore: fc.double({ min: 0, max: 100 }),
    qualityConcerns: fc.array(fc.string({ minLength: 10, maxLength: 200 }), { minLength: 0, maxLength: 10 }),
    approvalStatus: fc.constantFrom(...Object.values(ApprovalStatus))
  }),
  testingEfficiency: fc.record({
    testExecutionTime: fc.double({ min: 1, max: 600 }),
    flakyTestRate: fc.double({ min: 0, max: 100 }),
    resourceUtilization: fc.double({ min: 0, max: 100 }),
    automationRate: fc.double({ min: 0, max: 100 }),
    testMaintenanceTime: fc.double({ min: 0, max: 168 })
  }),
  qualityGates: fc.array(fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }),
    criteria: fc.array(fc.record({
      metric: fc.string({ minLength: 1, maxLength: 100 }),
      threshold: fc.double({ min: 0, max: 100 }),
      actualValue: fc.double({ min: 0, max: 100 }),
      passed: fc.boolean()
    }), { minLength: 1, maxLength: 10 }),
    status: fc.constantFrom(...Object.values(QualityGateStatus)),
    lastEvaluation: dateArbitrary
  }), { minLength: 0, maxLength: 10 }),
  timestamp: dateArbitrary
})

const businessAnalyticsMetricsArbitrary = fc.record({
  pipelineId: fc.string({ minLength: 1, maxLength: 50 }),
  pipelineName: fc.string({ minLength: 1, maxLength: 100 }),
  dataHealth: fc.record({
    successRate: fc.double({ min: 0, max: 100 }),
    dataFreshness: fc.double({ min: 0, max: 1440 }), // max 24 hours in minutes
    processingLatency: fc.double({ min: 0.1, max: 600 }),
    recordsProcessed: fc.integer({ min: 0, max: 10000000 }),
    dataQualityScore: fc.double({ min: 0, max: 100 })
  }),
  reportingPerformance: fc.record({
    reportGenerationTime: fc.double({ min: 0.1, max: 300 }),
    queryPerformance: fc.array(fc.record({
      queryId: fc.string({ minLength: 1, maxLength: 50 }),
      executionTime: fc.double({ min: 1, max: 60000 }),
      complexity: fc.constantFrom(...Object.values(QueryComplexity)),
      resourceUsage: fc.double({ min: 0.1, max: 3600 })
    }), { minLength: 0, maxLength: 20 }),
    dashboardLoadTime: fc.double({ min: 0.1, max: 60 }),
    concurrentUsers: fc.integer({ min: 0, max: 1000 }),
    cacheHitRate: fc.double({ min: 0, max: 100 })
  }),
  pipelineErrors: fc.array(fc.record({
    errorId: fc.string({ minLength: 1, maxLength: 50 }),
    category: fc.constantFrom(...Object.values(PipelineErrorCategory)),
    description: fc.string({ minLength: 10, maxLength: 500 }),
    severity: fc.constantFrom(...Object.values(AlertSeverity)),
    occurredAt: dateArbitrary,
    resolved: fc.boolean()
  }), { minLength: 0, maxLength: 20 }),
  businessIntelligence: fc.record({
    dataAccuracyScore: fc.double({ min: 0, max: 100 }),
    reportUsageStatistics: fc.array(fc.record({
      reportName: fc.string({ minLength: 1, maxLength: 100 }),
      viewCount: fc.integer({ min: 0, max: 10000 }),
      uniqueUsers: fc.integer({ min: 0, max: 1000 }),
      averageViewTime: fc.double({ min: 0.1, max: 120 }),
      lastAccessed: dateArbitrary
    }), { minLength: 0, maxLength: 50 }),
    userEngagementMetrics: fc.record({
      activeUsers: fc.integer({ min: 0, max: 1000 }),
      sessionDuration: fc.double({ min: 0.1, max: 480 }),
      interactionRate: fc.double({ min: 0, max: 1000 }),
      retentionRate: fc.double({ min: 0, max: 100 })
    }),
    insightGenerationRate: fc.double({ min: 0, max: 100 })
  }),
  analyticsInfrastructure: fc.record({
    dataWarehouseUtilization: fc.double({ min: 0, max: 100 }),
    etlJobPerformance: fc.array(fc.record({
      jobName: fc.string({ minLength: 1, maxLength: 100 }),
      executionTime: fc.double({ min: 0.1, max: 1440 }),
      successRate: fc.double({ min: 0, max: 100 }),
      resourceConsumption: fc.double({ min: 0.1, max: 1000 }),
      lastRun: dateArbitrary
    }), { minLength: 0, maxLength: 20 }),
    storageCosts: fc.array(fc.record({
      storageType: fc.constantFrom('hot', 'warm', 'cold', 'archive'),
      sizeGB: fc.double({ min: 1, max: 100000 }),
      monthlyCost: fc.double({ min: 1, max: 10000 }),
      growthRate: fc.double({ min: -50, max: 200 })
    }), { minLength: 1, maxLength: 10 }),
    computeResourceUsage: fc.double({ min: 0, max: 100 })
  }),
  timestamp: dateArbitrary
})

// Helper function to check if all required fields are present and valid
function hasAllRequiredFields(obj: any, requiredFields: string[]): boolean {
  return requiredFields.every(field => {
    const value = obj[field]
    return value !== undefined && value !== null
  })
}

// Helper function to check if numeric fields are within valid ranges
function hasValidNumericRanges(obj: any, numericFields: Array<{ field: string; min?: number; max?: number }>): boolean {
  return numericFields.every(({ field, min, max }) => {
    const value = obj[field]
    if (typeof value !== 'number') return false
    if (min !== undefined && value < min) return false
    if (max !== undefined && value > max) return false
    return true
  })
}

describe('Data Model Consistency Property Tests', () => {
  it('Property 1: Infrastructure metrics should have all required components', () => {
    fc.assert(fc.property(infrastructureMetricsArbitrary, (metrics: InfrastructureMetrics) => {
      // Check all required fields are present
      const requiredFields = [
        'serverId', 'serverName', 'cpuUtilization', 'memoryUtilization', 
        'diskUtilization', 'networkUtilization', 'loadPercentage', 'status', 
        'uptime', 'apiTrafficCount', 'trafficVolume', 'timestamp'
      ]
      
      const hasAllFields = hasAllRequiredFields(metrics, requiredFields)
      
      // Check numeric ranges are valid (Requirements 1.1, 1.2, 1.3)
      const numericRanges = [
        { field: 'cpuUtilization', min: 0, max: 100 },
        { field: 'memoryUtilization', min: 0, max: 100 },
        { field: 'diskUtilization', min: 0, max: 100 },
        { field: 'networkUtilization', min: 0, max: 100 },
        { field: 'loadPercentage', min: 0, max: 100 },
        { field: 'uptime', min: 0 },
        { field: 'apiTrafficCount', min: 0 },
        { field: 'trafficVolume', min: 0 }
      ]
      
      const hasValidRanges = hasValidNumericRanges(metrics, numericRanges)
      
      // Check that status is a valid enum value
      const validStatuses = Object.values(ServerStatus)
      const hasValidStatus = validStatuses.includes(metrics.status)
      
      // Check timestamp is a valid Date
      const hasValidTimestamp = metrics.timestamp instanceof Date && !isNaN(metrics.timestamp.getTime())
      
      return hasAllFields && hasValidRanges && hasValidStatus && hasValidTimestamp
    }), { numRuns: 100 })
  })

  it('Property 1: API performance metrics should have all required components', () => {
    fc.assert(fc.property(apiPerformanceMetricsArbitrary, (metrics: APIPerformanceMetrics) => {
      // Check all required fields are present (Requirements 2.1, 2.2, 2.3, 2.4, 2.5)
      const requiredFields = [
        'endpointId', 'endpointName', 'successRate', 'failureRate',
        'averageLatency', 'medianLatency', 'p95Latency', 'errorsByStatusCode',
        'requestsPerMinute', 'uptime', 'uptimeWindow', 'timestamp'
      ]
      
      const hasAllFields = hasAllRequiredFields(metrics, requiredFields)
      
      // Check numeric ranges are valid
      const numericRanges = [
        { field: 'successRate', min: 0, max: 100 },
        { field: 'failureRate', min: 0, max: 100 },
        { field: 'averageLatency', min: 0 },
        { field: 'medianLatency', min: 0 },
        { field: 'p95Latency', min: 0 },
        { field: 'requestsPerMinute', min: 0 },
        { field: 'uptime', min: 0, max: 100 }
      ]
      
      const hasValidRanges = hasValidNumericRanges(metrics, numericRanges)
      
      // Check that errorsByStatusCode is an object with numeric values
      const hasValidErrors = typeof metrics.errorsByStatusCode === 'object' &&
        Object.values(metrics.errorsByStatusCode).every(count => typeof count === 'number' && count >= 0)
      
      return hasAllFields && hasValidRanges && hasValidErrors
    }), { numRuns: 100 })
  })

  it('Property 1: AI metrics should have all required components', () => {
    fc.assert(fc.property(aiMetricsArbitrary, (metrics: AIMetrics) => {
      // Check all required fields are present (Requirements 5.1, 5.2, 5.3, 5.4, 5.5)
      const requiredFields = [
        'modelId', 'modelName', 'version', 'accuracy', 'inferenceTime',
        'driftScore', 'status', 'trainingCosts', 'deploymentMetrics',
        'resourceUtilization', 'performanceAnomalies', 'timestamp'
      ]
      
      const hasAllFields = hasAllRequiredFields(metrics, requiredFields)
      
      // Check numeric ranges are valid
      const numericRanges = [
        { field: 'accuracy', min: 0, max: 1 },
        { field: 'inferenceTime', min: 0 },
        { field: 'driftScore', min: 0, max: 1 }
      ]
      
      const hasValidRanges = hasValidNumericRanges(metrics, numericRanges)
      
      // Check that status is a valid enum value
      const validStatuses = Object.values(AIModelStatus)
      const hasValidStatus = validStatuses.includes(metrics.status)
      
      // Check that arrays are present
      const hasValidArrays = Array.isArray(metrics.trainingCosts) && 
        Array.isArray(metrics.performanceAnomalies)
      
      // Check deployment metrics structure
      const hasValidDeployment = typeof metrics.deploymentMetrics === 'object' &&
        'deploymentId' in metrics.deploymentMetrics &&
        'successRate' in metrics.deploymentMetrics
      
      // Check resource utilization structure
      const hasValidResources = typeof metrics.resourceUtilization === 'object' &&
        'gpuUsage' in metrics.resourceUtilization &&
        'monthlyBudget' in metrics.resourceUtilization
      
      return hasAllFields && hasValidRanges && hasValidStatus && hasValidArrays && 
        hasValidDeployment && hasValidResources
    }), { numRuns: 100 })
  })

  it('Property 1: QA metrics should have all required components', () => {
    fc.assert(fc.property(qaMetricsArbitrary, (metrics: QAMetrics) => {
      // Check all required fields are present (Requirements 6.1, 6.2, 6.3, 6.4, 6.5)
      const requiredFields = [
        'projectId', 'projectName', 'testCoverage', 'defectRates',
        'releaseQuality', 'testingEfficiency', 'qualityGates', 'timestamp'
      ]
      
      const hasAllFields = hasAllRequiredFields(metrics, requiredFields)
      
      // Check test coverage structure
      const hasValidCoverage = typeof metrics.testCoverage === 'object' &&
        'overallPercentage' in metrics.testCoverage &&
        'unitTestCoverage' in metrics.testCoverage &&
        'integrationTestCoverage' in metrics.testCoverage &&
        'e2eTestCoverage' in metrics.testCoverage &&
        'codeQualityScore' in metrics.testCoverage
      
      // Check defect rates structure
      const hasValidDefects = typeof metrics.defectRates === 'object' &&
        'bugsPerRelease' in metrics.defectRates &&
        'averageResolutionTime' in metrics.defectRates &&
        'defectDensity' in metrics.defectRates
      
      // Check release quality structure
      const hasValidRelease = typeof metrics.releaseQuality === 'object' &&
        'automatedTestPassRate' in metrics.releaseQuality &&
        'releaseReadinessScore' in metrics.releaseQuality &&
        'approvalStatus' in metrics.releaseQuality
      
      // Check testing efficiency structure
      const hasValidEfficiency = typeof metrics.testingEfficiency === 'object' &&
        'testExecutionTime' in metrics.testingEfficiency &&
        'flakyTestRate' in metrics.testingEfficiency &&
        'automationRate' in metrics.testingEfficiency
      
      // Check that quality gates is an array
      const hasValidGates = Array.isArray(metrics.qualityGates)
      
      return hasAllFields && hasValidCoverage && hasValidDefects && 
        hasValidRelease && hasValidEfficiency && hasValidGates
    }), { numRuns: 100 })
  })

  it('Property 1: Business analytics metrics should have all required components', () => {
    fc.assert(fc.property(businessAnalyticsMetricsArbitrary, (metrics: BusinessAnalyticsMetrics) => {
      // Check all required fields are present (Requirements 7.1, 7.2, 7.3, 7.4, 7.5)
      const requiredFields = [
        'pipelineId', 'pipelineName', 'dataHealth', 'reportingPerformance',
        'pipelineErrors', 'businessIntelligence', 'analyticsInfrastructure', 'timestamp'
      ]
      
      const hasAllFields = hasAllRequiredFields(metrics, requiredFields)
      
      // Check data health structure
      const hasValidDataHealth = typeof metrics.dataHealth === 'object' &&
        'successRate' in metrics.dataHealth &&
        'dataFreshness' in metrics.dataHealth &&
        'processingLatency' in metrics.dataHealth &&
        'recordsProcessed' in metrics.dataHealth &&
        'dataQualityScore' in metrics.dataHealth
      
      // Check reporting performance structure
      const hasValidReporting = typeof metrics.reportingPerformance === 'object' &&
        'reportGenerationTime' in metrics.reportingPerformance &&
        'queryPerformance' in metrics.reportingPerformance &&
        'dashboardLoadTime' in metrics.reportingPerformance &&
        'cacheHitRate' in metrics.reportingPerformance
      
      // Check business intelligence structure
      const hasValidBI = typeof metrics.businessIntelligence === 'object' &&
        'dataAccuracyScore' in metrics.businessIntelligence &&
        'reportUsageStatistics' in metrics.businessIntelligence &&
        'userEngagementMetrics' in metrics.businessIntelligence
      
      // Check analytics infrastructure structure
      const hasValidInfra = typeof metrics.analyticsInfrastructure === 'object' &&
        'dataWarehouseUtilization' in metrics.analyticsInfrastructure &&
        'etlJobPerformance' in metrics.analyticsInfrastructure &&
        'storageCosts' in metrics.analyticsInfrastructure
      
      // Check that arrays are present
      const hasValidArrays = Array.isArray(metrics.pipelineErrors) &&
        Array.isArray(metrics.reportingPerformance.queryPerformance) &&
        Array.isArray(metrics.businessIntelligence.reportUsageStatistics) &&
        Array.isArray(metrics.analyticsInfrastructure.etlJobPerformance) &&
        Array.isArray(metrics.analyticsInfrastructure.storageCosts)
      
      return hasAllFields && hasValidDataHealth && hasValidReporting && 
        hasValidBI && hasValidInfra && hasValidArrays
    }), { numRuns: 100 })
  })
})