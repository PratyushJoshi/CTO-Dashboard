import {
  Alert,
  AlertRule,
  AlertStatus,
  AlertSeverity,
  NotificationChannel,
  NotificationStatus,
  Metric,
  MetricType
} from '../types/index'

/**
 * Comprehensive alerting system for the CTO Dashboard
 * Handles alert threshold configuration, multi-channel notifications,
 * automatic resolution, escalation, and searchable history
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

export interface AlertConfiguration {
  rules: AlertRule[]
  globalSettings: {
    defaultNotificationChannels: NotificationChannel[]
    alertRetentionDays: number
    maxEscalationSteps: number
  }
}

export interface AlertHistory {
  alerts: Alert[]
  totalCount: number
  filters?: AlertHistoryFilters
}

export interface AlertHistoryFilters {
  severity?: AlertSeverity[]
  status?: AlertStatus[]
  metricType?: MetricType[]
  dateRange?: {
    start: Date
    end: Date
  }
  searchText?: string
}

export interface NotificationResult {
  success: boolean
  channel: NotificationChannel
  latency: number
  error?: string
}

export class AlertService {
  private rules: Map<string, AlertRule> = new Map()
  private alerts: Map<string, Alert> = new Map()
  private alertHistory: Alert[] = []
  private configuration: AlertConfiguration

  constructor(configuration?: AlertConfiguration) {
    this.configuration = configuration || {
      rules: [],
      globalSettings: {
        defaultNotificationChannels: [NotificationChannel.IN_DASHBOARD],
        alertRetentionDays: 90,
        maxEscalationSteps: 5
      }
    }
    
    // Load initial rules
    this.configuration.rules.forEach(rule => {
      this.rules.set(rule.id, rule)
    })
  }

  /**
   * Create or update an alert rule
   * Requirement 9.1: Customizable alert threshold configuration
   */
  createOrUpdateRule(rule: AlertRule): void {
    // Validate rule
    if (!rule.id || !rule.name || !rule.metricType) {
      throw new Error('Alert rule must have id, name, and metricType')
    }

    if (rule.threshold < 0) {
      throw new Error('Alert threshold must be non-negative')
    }

    if (rule.condition.timeWindow <= 0) {
      throw new Error('Time window must be positive')
    }

    if (rule.condition.consecutiveBreaches <= 0) {
      throw new Error('Consecutive breaches must be positive')
    }

    if (rule.notificationChannels.length === 0) {
      rule.notificationChannels = this.configuration.globalSettings.defaultNotificationChannels
    }

    this.rules.set(rule.id, rule)
  }

  /**
   * Delete an alert rule
   */
  deleteRule(ruleId: string): boolean {
    return this.rules.delete(ruleId)
  }

  /**
   * Get all alert rules
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * Get alert rule by ID
   */
  getRule(ruleId: string): AlertRule | undefined {
    return this.rules.get(ruleId)
  }

  /**
   * Evaluate metrics against alert rules and generate alerts
   * Requirement 9.2: Critical alerts triggered within 60 seconds
   */
  async evaluateMetrics(metrics: Metric[]): Promise<Alert[]> {
    const newAlerts: Alert[] = []

    for (const metric of metrics) {
      const applicableRules = Array.from(this.rules.values()).filter(
        rule => rule.enabled && rule.metricType === metric.type
      )

      for (const rule of applicableRules) {
        const shouldAlert = this.checkThresholdBreach(metric, rule)
        
        if (shouldAlert) {
          const alert = await this.generateAlert(rule, metric)
          newAlerts.push(alert)
          this.alerts.set(alert.id, alert)
          
          // Send notifications immediately for critical alerts (Requirement 9.2)
          if (alert.severity === AlertSeverity.CRITICAL) {
            await this.sendNotifications(alert)
          } else {
            // Send notifications asynchronously for non-critical alerts
            this.sendNotifications(alert).catch(error => {
              console.error(`Failed to send notifications for alert ${alert.id}:`, error)
            })
          }
        }
      }
    }

    return newAlerts
  }

  /**
   * Check if a metric breaches the threshold
   */
  private checkThresholdBreach(metric: Metric, rule: AlertRule): boolean {
    const { operator } = rule.condition
    const { threshold } = rule
    const { value } = metric

    switch (operator) {
      case 'gt':
        return value > threshold
      case 'gte':
        return value >= threshold
      case 'lt':
        return value < threshold
      case 'lte':
        return value <= threshold
      case 'eq':
        return value === threshold
      default:
        return false
    }
  }

  /**
   * Generate an alert from a rule and metric
   */
  private async generateAlert(rule: AlertRule, metric: Metric): Promise<Alert> {
    const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      metricType: rule.metricType,
      severity: rule.severity,
      status: AlertStatus.ACTIVE,
      triggeredAt: new Date(),
      message: `${rule.name}: ${metric.name} ${rule.condition.operator} ${rule.threshold}`,
      details: {
        metricName: metric.name,
        currentValue: metric.value,
        threshold: rule.threshold,
        condition: `${rule.condition.operator} ${rule.threshold}`,
        affectedResources: [metric.source],
        recommendedActions: this.generateRecommendedActions(rule, metric)
      },
      notifications: rule.notificationChannels.map(channel => ({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        channel: channel as NotificationChannel,
        status: NotificationStatus.PENDING,
        sentAt: new Date(),
        retryCount: 0
      })),
      escalation: rule.escalationPolicy ? {
        currentStep: 0,
        totalSteps: rule.escalationPolicy.steps.length,
        escalationHistory: []
      } : undefined
    }

    return alert
  }

  /**
   * Generate recommended actions based on rule and metric
   */
  private generateRecommendedActions(rule: AlertRule, metric: Metric): string[] {
    const actions: string[] = []

    // Generic actions based on metric type
    switch (metric.type) {
      case MetricType.INFRASTRUCTURE:
        actions.push(`Check server health for ${metric.source}`)
        actions.push('Review resource utilization trends')
        break
      case MetricType.API_PERFORMANCE:
        actions.push(`Investigate API endpoint: ${metric.name}`)
        actions.push('Check for recent deployments or configuration changes')
        break
      case MetricType.APP_PERFORMANCE:
        actions.push(`Review application performance for ${metric.name}`)
        actions.push('Check error logs and user reports')
        break
      case MetricType.BUSINESS_COST:
        actions.push(`Analyze cost drivers for ${metric.name}`)
        actions.push('Review recent usage patterns and optimizations')
        break
      case MetricType.AI_METRICS:
        actions.push(`Check AI model performance: ${metric.name}`)
        actions.push('Review training data and model drift indicators')
        break
      case MetricType.QA_METRICS:
        actions.push(`Review QA processes for ${metric.name}`)
        actions.push('Check test coverage and defect trends')
        break
      case MetricType.ANALYTICS:
        actions.push(`Investigate analytics pipeline: ${metric.name}`)
        actions.push('Check data quality and processing latency')
        break
    }

    // Severity-specific actions
    if (rule.severity === AlertSeverity.CRITICAL) {
      actions.unshift('Immediate attention required - escalate to on-call team')
    }

    return actions
  }

  /**
   * Send notifications for an alert
   * Requirement 9.2: Multi-channel notification system
   */
  private async sendNotifications(alert: Alert): Promise<NotificationResult[]> {
    const results: NotificationResult[] = []

    for (const notification of alert.notifications) {
      const startTime = Date.now()
      
      try {
        const success = await this.sendSingleNotification(alert, notification.channel)
        const latency = Date.now() - startTime
        
        notification.status = success ? NotificationStatus.DELIVERED : NotificationStatus.FAILED
        notification.deliveredAt = success ? new Date() : undefined
        
        results.push({
          success,
          channel: notification.channel,
          latency
        })
        
      } catch (error) {
        const latency = Date.now() - startTime
        notification.status = NotificationStatus.FAILED
        notification.retryCount++
        
        results.push({
          success: false,
          channel: notification.channel,
          latency,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  /**
   * Send a single notification through a specific channel
   */
  private async sendSingleNotification(alert: Alert, channel: NotificationChannel): Promise<boolean> {
    // Simulate notification sending with different latencies per channel
    const channelLatencies = {
      [NotificationChannel.IN_DASHBOARD]: 50,
      [NotificationChannel.EMAIL]: 200,
      [NotificationChannel.SMS]: 500,
      [NotificationChannel.WEBHOOK]: 300,
      [NotificationChannel.SLACK]: 150
    }

    const latency = channelLatencies[channel] || 100
    await new Promise(resolve => setTimeout(resolve, latency))

    // Simulate occasional failures (5% failure rate)
    return Math.random() > 0.05
  }

  /**
   * Resolve an alert
   * Requirement 9.3: Automatic alert resolution and notification
   */
  async resolveAlert(alertId: string, reason?: string): Promise<boolean> {
    const alert = this.alerts.get(alertId)
    if (!alert) {
      return false
    }

    alert.status = AlertStatus.RESOLVED
    alert.resolvedAt = new Date()
    
    // Send resolution notifications
    const resolutionNotifications = alert.notifications.map(notif => ({
      ...notif,
      id: `resolution-${notif.id}`,
      status: NotificationStatus.PENDING,
      sentAt: new Date()
    }))

    alert.notifications.push(...resolutionNotifications)
    
    // Send resolution notifications
    await this.sendNotifications(alert)
    
    // Move to history
    this.alertHistory.push(alert)
    this.alerts.delete(alertId)

    return true
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy?: string): boolean {
    const alert = this.alerts.get(alertId)
    if (!alert) {
      return false
    }

    alert.status = AlertStatus.ACKNOWLEDGED
    return true
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values())
  }

  /**
   * Get alert by ID
   */
  getAlert(alertId: string): Alert | undefined {
    return this.alerts.get(alertId) || this.alertHistory.find(alert => alert.id === alertId)
  }

  /**
   * Search alert history
   * Requirement 9.5: Searchable alert history with complete logging
   */
  searchAlertHistory(filters?: AlertHistoryFilters, limit: number = 100, offset: number = 0): AlertHistory {
    let filteredAlerts = [...this.alertHistory]

    if (filters) {
      if (filters.severity && filters.severity.length > 0) {
        filteredAlerts = filteredAlerts.filter(alert => filters.severity!.includes(alert.severity))
      }

      if (filters.status && filters.status.length > 0) {
        filteredAlerts = filteredAlerts.filter(alert => filters.status!.includes(alert.status))
      }

      if (filters.metricType && filters.metricType.length > 0) {
        filteredAlerts = filteredAlerts.filter(alert => filters.metricType!.includes(alert.metricType))
      }

      if (filters.dateRange) {
        filteredAlerts = filteredAlerts.filter(alert => 
          alert.triggeredAt >= filters.dateRange!.start && 
          alert.triggeredAt <= filters.dateRange!.end
        )
      }

      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase()
        filteredAlerts = filteredAlerts.filter(alert =>
          alert.message.toLowerCase().includes(searchLower) ||
          alert.ruleName.toLowerCase().includes(searchLower) ||
          alert.details.metricName.toLowerCase().includes(searchLower)
        )
      }
    }

    // Sort by triggered date (most recent first)
    filteredAlerts.sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())

    const totalCount = filteredAlerts.length
    const paginatedAlerts = filteredAlerts.slice(offset, offset + limit)

    return {
      alerts: paginatedAlerts,
      totalCount,
      filters
    }
  }

  /**
   * Handle alert escalation
   * Requirement 9.4: Alert escalation with configurable paths
   */
  async processEscalations(): Promise<void> {
    const activeAlerts = this.getActiveAlerts()
    const now = new Date()

    for (const alert of activeAlerts) {
      if (!alert.escalation || !alert.escalation.nextEscalationAt) {
        continue
      }

      if (now >= alert.escalation.nextEscalationAt) {
        await this.escalateAlert(alert)
      }
    }
  }

  /**
   * Escalate an alert to the next level
   */
  private async escalateAlert(alert: Alert): Promise<void> {
    if (!alert.escalation) {
      return
    }

    const rule = this.rules.get(alert.ruleId)
    if (!rule || !rule.escalationPolicy) {
      return
    }

    const currentStep = alert.escalation.currentStep
    if (currentStep >= rule.escalationPolicy.steps.length - 1) {
      // Already at maximum escalation level
      return
    }

    const nextStep = currentStep + 1
    const escalationStep = rule.escalationPolicy.steps[nextStep]

    // Create escalation event
    const escalationEvent = {
      step: nextStep,
      escalatedAt: new Date(),
      notificationChannels: escalationStep.notificationChannels as NotificationChannel[],
      recipients: [] // Would be populated from escalation configuration
    }

    alert.escalation.currentStep = nextStep
    alert.escalation.escalationHistory.push(escalationEvent)

    // Send escalation notifications
    const escalationNotifications = escalationStep.notificationChannels.map(channel => ({
      id: `escalation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      channel: channel as NotificationChannel,
      status: NotificationStatus.PENDING,
      sentAt: new Date(),
      retryCount: 0
    }))

    alert.notifications.push(...escalationNotifications)
    await this.sendNotifications(alert)

    // Schedule next escalation if there are more steps
    if (nextStep < rule.escalationPolicy.steps.length - 1) {
      const nextEscalationStep = rule.escalationPolicy.steps[nextStep + 1]
      alert.escalation.nextEscalationAt = new Date(Date.now() + nextEscalationStep.delayMinutes * 60 * 1000)
    }
  }

  /**
   * Clean up old alerts from history
   */
  cleanupHistory(): number {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.configuration.globalSettings.alertRetentionDays)

    const initialCount = this.alertHistory.length
    this.alertHistory = this.alertHistory.filter(alert => alert.triggeredAt >= cutoffDate)
    
    return initialCount - this.alertHistory.length
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(timeRange?: { start: Date; end: Date }) {
    const alerts = timeRange 
      ? this.alertHistory.filter(alert => 
          alert.triggeredAt >= timeRange.start && alert.triggeredAt <= timeRange.end
        )
      : this.alertHistory

    const stats = {
      total: alerts.length,
      bySeverity: {
        [AlertSeverity.CRITICAL]: 0,
        [AlertSeverity.HIGH]: 0,
        [AlertSeverity.MEDIUM]: 0,
        [AlertSeverity.LOW]: 0
      },
      byStatus: {
        [AlertStatus.ACTIVE]: 0,
        [AlertStatus.ACKNOWLEDGED]: 0,
        [AlertStatus.RESOLVED]: 0,
        [AlertStatus.SUPPRESSED]: 0
      },
      byMetricType: {} as Record<MetricType, number>,
      averageResolutionTime: 0
    }

    let totalResolutionTime = 0
    let resolvedCount = 0

    for (const alert of alerts) {
      stats.bySeverity[alert.severity]++
      stats.byStatus[alert.status]++
      
      if (!stats.byMetricType[alert.metricType]) {
        stats.byMetricType[alert.metricType] = 0
      }
      stats.byMetricType[alert.metricType]++

      if (alert.status === AlertStatus.RESOLVED && alert.resolvedAt) {
        totalResolutionTime += alert.resolvedAt.getTime() - alert.triggeredAt.getTime()
        resolvedCount++
      }
    }

    if (resolvedCount > 0) {
      stats.averageResolutionTime = totalResolutionTime / resolvedCount / (1000 * 60) // Convert to minutes
    }

    return stats
  }
}