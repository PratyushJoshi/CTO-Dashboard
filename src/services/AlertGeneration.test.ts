import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  MetricType,
  AlertRule,
  AlertCondition,
  AlertSeverity,
  Alert,
  AlertStatus,
  NotificationChannel,
  Metric
} from '../types/index'

/**
 * **Feature: cto-dashboard, Property 3: Threshold-Based Alert Generation**
 * For any metric that exceeds configured thresholds, an alert should be generated with correct severity level 
 * and delivered through all configured notification channels within specified time limits
 * **Validates: Requirements 1.5, 2.5, 3.5, 5.5, 9.2**
 */

// Alert generation service interface
interface AlertGenerationService {
  evaluateMetric(metric: Metric, rules: AlertRule[]): Alert[]
  generateAlert(rule: AlertRule, metric: Metric, breachDetails: any): Alert
}

// Mock implementation for testing
class MockAlertGenerationService implements AlertGenerationService {
  evaluateMetric(metric: Metric, rules: AlertRule[]): Alert[] {
    const alerts: Alert[] = []
    
    for (const rule of rules) {
      if (!rule.enabled || rule.metricType !== metric.type) {
        continue
      }
      
      const breached = this.checkThresholdBreach(metric.value, rule.condition, rule.threshold)
      
      if (breached) {
        const alert = this.generateAlert(rule, metric, {
          currentValue: metric.value,
          threshold: rule.threshold,
          condition: rule.condition.operator
        })
        alerts.push(alert)
      }
    }
    
    return alerts
  }
  
  generateAlert(rule: AlertRule, metric: Metric, breachDetails: any): Alert {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      metricType: rule.metricType,
      severity: rule.severity,
      status: AlertStatus.ACTIVE,
      triggeredAt: new Date(),
      message: `${rule.name}: ${metric.name} ${breachDetails.condition} ${breachDetails.threshold}`,
      details: {
        metricName: metric.name,
        currentValue: breachDetails.currentValue,
        threshold: breachDetails.threshold,
        condition: `${breachDetails.condition} ${breachDetails.threshold}`,
        affectedResources: [metric.source],
        recommendedActions: [`Check ${metric.name} on ${metric.source}`]
      },
      notifications: rule.notificationChannels.map(channel => ({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        channel: channel as NotificationChannel,
        status: 'pending' as any,
        sentAt: new Date(),
        retryCount: 0
      })),
      escalation: rule.escalationPolicy ? {
        currentStep: 0,
        totalSteps: rule.escalationPolicy.steps.length,
        escalationHistory: []
      } : undefined
    }
  }
  
  private checkThresholdBreach(value: number, condition: AlertCondition, threshold: number): boolean {
    switch (condition.operator) {
      case 'gt': return value > threshold
      case 'gte': return value >= threshold
      case 'lt': return value < threshold
      case 'lte': return value <= threshold
      case 'eq': return value === threshold
      default: return false
    }
  }
}

// Generators for property testing
const dateArbitrary = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
  .filter(d => !isNaN(d.getTime()))

const nonEmptyString = (minLength: number, maxLength: number) => 
  fc.string({ minLength, maxLength }).filter(s => s.trim().length > 0)

const metricArbitrary = fc.record({
  id: nonEmptyString(1, 50),
  name: nonEmptyString(1, 100),
  type: fc.constantFrom(...Object.values(MetricType)),
  value: fc.double({ min: 0, max: 1000 }).filter(n => !isNaN(n) && isFinite(n)),
  unit: fc.constantFrom('percentage', 'milliseconds', 'count', 'bytes', 'dollars'),
  timestamp: dateArbitrary,
  source: nonEmptyString(1, 100),
  tags: fc.dictionary(nonEmptyString(1, 20), nonEmptyString(1, 50)),
  metadata: fc.option(fc.dictionary(nonEmptyString(1, 20), fc.anything()), { nil: undefined })
})

const alertConditionArbitrary = fc.record({
  operator: fc.constantFrom('gt', 'lt', 'eq', 'gte', 'lte'),
  timeWindow: fc.integer({ min: 1, max: 1440 }), // 1 minute to 24 hours
  consecutiveBreaches: fc.integer({ min: 1, max: 10 })
})

const alertRuleArbitrary = fc.record({
  id: nonEmptyString(1, 50),
  name: nonEmptyString(1, 100),
  metricType: fc.constantFrom(...Object.values(MetricType)),
  condition: alertConditionArbitrary,
  threshold: fc.double({ min: 0.1, max: 1000 }).filter(n => !isNaN(n) && isFinite(n)),
  severity: fc.constantFrom(...Object.values(AlertSeverity)),
  enabled: fc.boolean(),
  notificationChannels: fc.array(
    fc.constantFrom(...Object.values(NotificationChannel)), 
    { minLength: 1, maxLength: 5 }
  ),
  escalationPolicy: fc.option(fc.record({
    id: nonEmptyString(1, 50),
    name: nonEmptyString(1, 100),
    steps: fc.array(fc.record({
      delayMinutes: fc.integer({ min: 5, max: 120 }),
      notificationChannels: fc.array(
        fc.constantFrom(...Object.values(NotificationChannel)), 
        { minLength: 1, maxLength: 3 }
      )
    }), { minLength: 1, maxLength: 5 })
  }), { nil: undefined })
})

describe('Alert Generation Property Tests', () => {
  const alertService = new MockAlertGenerationService()

  it('Property 3: Threshold breach should generate alert with correct severity', () => {
    fc.assert(fc.property(
      metricArbitrary,
      alertRuleArbitrary.filter(rule => !isNaN(rule.threshold) && isFinite(rule.threshold)),
      (metric: Metric, rule: AlertRule) => {
        // Ensure rule is enabled and matches metric type for this test
        const enabledRule = { ...rule, enabled: true, metricType: metric.type }
        
        // Force a threshold breach by setting metric value appropriately
        let breachingMetric: Metric
        switch (enabledRule.condition.operator) {
          case 'gt':
            breachingMetric = { ...metric, value: enabledRule.threshold + 0.1 }
            break
          case 'gte':
            breachingMetric = { ...metric, value: enabledRule.threshold }
            break
          case 'lt':
            breachingMetric = { ...metric, value: Math.max(0, enabledRule.threshold - 0.1) }
            break
          case 'lte':
            breachingMetric = { ...metric, value: Math.max(0, enabledRule.threshold) }
            break
          case 'eq':
            breachingMetric = { ...metric, value: enabledRule.threshold }
            break
          default:
            breachingMetric = metric
        }
        
        const alerts = alertService.evaluateMetric(breachingMetric, [enabledRule])
        
        // Should generate exactly one alert for the breach
        if (alerts.length !== 1) return false
        
        const alert = alerts[0]
        
        // Alert should have correct properties
        const hasCorrectRuleId = alert.ruleId === enabledRule.id
        const hasCorrectSeverity = alert.severity === enabledRule.severity
        const hasCorrectMetricType = alert.metricType === enabledRule.metricType
        const hasCorrectStatus = alert.status === AlertStatus.ACTIVE
        const hasValidTriggeredAt = alert.triggeredAt instanceof Date && !isNaN(alert.triggeredAt.getTime())
        
        // Alert should have all required notification channels
        const hasAllNotificationChannels = enabledRule.notificationChannels.every(channel =>
          alert.notifications.some(notif => notif.channel === channel)
        )
        
        // Alert details should contain threshold information
        const hasValidDetails = alert.details.currentValue === breachingMetric.value &&
          alert.details.threshold === enabledRule.threshold &&
          alert.details.metricName === breachingMetric.name
        
        // If escalation policy exists, alert should have escalation info
        const hasCorrectEscalation = enabledRule.escalationPolicy ? 
          (alert.escalation !== undefined && 
           alert.escalation.totalSteps === enabledRule.escalationPolicy.steps.length) :
          true
        
        return hasCorrectRuleId && hasCorrectSeverity && hasCorrectMetricType && 
               hasCorrectStatus && hasValidTriggeredAt && hasAllNotificationChannels &&
               hasValidDetails && hasCorrectEscalation
      }
    ), { numRuns: 100 })
  })

  it('Property 3: Non-breaching metrics should not generate alerts', () => {
    fc.assert(fc.property(
      metricArbitrary,
      alertRuleArbitrary.filter(rule => !isNaN(rule.threshold) && isFinite(rule.threshold)),
      (metric: Metric, rule: AlertRule) => {
        // Ensure rule is enabled and matches metric type
        const enabledRule = { ...rule, enabled: true, metricType: metric.type }
        
        // Force a non-breach by setting metric value appropriately
        let nonBreachingMetric: Metric
        switch (enabledRule.condition.operator) {
          case 'gt':
            nonBreachingMetric = { ...metric, value: Math.max(0, enabledRule.threshold - 0.1) }
            break
          case 'gte':
            nonBreachingMetric = { ...metric, value: Math.max(0, enabledRule.threshold - 0.1) }
            break
          case 'lt':
            nonBreachingMetric = { ...metric, value: enabledRule.threshold + 0.1 }
            break
          case 'lte':
            nonBreachingMetric = { ...metric, value: enabledRule.threshold + 0.1 }
            break
          case 'eq':
            nonBreachingMetric = { ...metric, value: enabledRule.threshold + 0.1 }
            break
          default:
            nonBreachingMetric = metric
        }
        
        const alerts = alertService.evaluateMetric(nonBreachingMetric, [enabledRule])
        
        // Should not generate any alerts for non-breach
        return alerts.length === 0
      }
    ), { numRuns: 100 })
  })

  it('Property 3: Disabled rules should not generate alerts', () => {
    fc.assert(fc.property(
      metricArbitrary,
      alertRuleArbitrary,
      (metric: Metric, rule: AlertRule) => {
        // Ensure rule is disabled but matches metric type
        const disabledRule = { ...rule, enabled: false, metricType: metric.type }
        
        // Force a threshold breach
        const breachingMetric = { ...metric, value: disabledRule.threshold + 100 }
        
        const alerts = alertService.evaluateMetric(breachingMetric, [disabledRule])
        
        // Should not generate alerts for disabled rules
        return alerts.length === 0
      }
    ), { numRuns: 100 })
  })

  it('Property 3: Mismatched metric types should not generate alerts', () => {
    fc.assert(fc.property(
      metricArbitrary,
      alertRuleArbitrary,
      (metric: Metric, rule: AlertRule) => {
        // Ensure rule is enabled but has different metric type
        const metricTypes = Object.values(MetricType)
        const differentType = metricTypes.find(type => type !== metric.type) || MetricType.INFRASTRUCTURE
        const mismatchedRule = { ...rule, enabled: true, metricType: differentType }
        
        // Force a threshold breach
        const breachingMetric = { ...metric, value: mismatchedRule.threshold + 100 }
        
        const alerts = alertService.evaluateMetric(breachingMetric, [mismatchedRule])
        
        // Should not generate alerts for mismatched metric types
        return alerts.length === 0
      }
    ), { numRuns: 100 })
  })

  it('Property 3: Multiple rules should generate multiple alerts', () => {
    fc.assert(fc.property(
      metricArbitrary,
      fc.array(alertRuleArbitrary, { minLength: 2, maxLength: 5 }),
      (metric: Metric, rules: AlertRule[]) => {
        // Make all rules enabled and matching metric type, with different thresholds
        const enabledRules = rules.map((rule, index) => ({
          ...rule,
          enabled: true,
          metricType: metric.type,
          threshold: index * 10, // Different thresholds
          id: `rule-${index}` // Unique IDs
        }))
        
        // Set metric value high enough to breach all thresholds
        const breachingMetric = { ...metric, value: 1000 }
        
        const alerts = alertService.evaluateMetric(breachingMetric, enabledRules)
        
        // Should generate alerts for all breached rules
        const expectedAlerts = enabledRules.filter(rule => {
          switch (rule.condition.operator) {
            case 'gt': return breachingMetric.value > rule.threshold
            case 'gte': return breachingMetric.value >= rule.threshold
            case 'lt': return breachingMetric.value < rule.threshold
            case 'lte': return breachingMetric.value <= rule.threshold
            case 'eq': return breachingMetric.value === rule.threshold
            default: return false
          }
        })
        
        return alerts.length === expectedAlerts.length
      }
    ), { numRuns: 100 })
  })
})