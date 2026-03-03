import { useState, useEffect, useCallback } from 'react'
import { AlertService, AlertConfiguration } from '../services/AlertService'
import { Alert, AlertRule, Metric } from '../types/index'

export interface UseAlertServiceOptions {
  configuration?: AlertConfiguration
  autoEvaluateInterval?: number // milliseconds
  escalationCheckInterval?: number // milliseconds
}

export const useAlertService = (options: UseAlertServiceOptions = {}) => {
  const [alertService] = useState(() => new AlertService(options.configuration))
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([])
  const [rules, setRules] = useState<AlertRule[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refresh data from alert service
  const refreshData = useCallback(() => {
    try {
      setActiveAlerts(alertService.getActiveAlerts())
      setRules(alertService.getRules())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [alertService])

  // Evaluate metrics against alert rules
  const evaluateMetrics = useCallback(async (metrics: Metric[]) => {
    setIsLoading(true)
    try {
      const newAlerts = await alertService.evaluateMetrics(metrics)
      refreshData()
      return newAlerts
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate metrics')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [alertService, refreshData])

  // Create or update alert rule
  const createOrUpdateRule = useCallback((rule: AlertRule) => {
    try {
      alertService.createOrUpdateRule(rule)
      refreshData()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rule')
      return false
    }
  }, [alertService, refreshData])

  // Delete alert rule
  const deleteRule = useCallback((ruleId: string) => {
    try {
      const success = alertService.deleteRule(ruleId)
      if (success) {
        refreshData()
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule')
      return false
    }
  }, [alertService, refreshData])

  // Resolve alert
  const resolveAlert = useCallback(async (alertId: string, reason?: string) => {
    setIsLoading(true)
    try {
      const success = await alertService.resolveAlert(alertId, reason)
      if (success) {
        refreshData()
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [alertService, refreshData])

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string, acknowledgedBy?: string) => {
    try {
      const success = alertService.acknowledgeAlert(alertId, acknowledgedBy)
      if (success) {
        refreshData()
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert')
      return false
    }
  }, [alertService, refreshData])

  // Get alert statistics
  const getStatistics = useCallback((timeRange?: { start: Date; end: Date }) => {
    try {
      return alertService.getAlertStatistics(timeRange)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get statistics')
      return null
    }
  }, [alertService])

  // Search alert history
  const searchHistory = useCallback((filters?: any, limit?: number, offset?: number) => {
    try {
      return alertService.searchAlertHistory(filters, limit, offset)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search history')
      return { alerts: [], totalCount: 0 }
    }
  }, [alertService])

  // Process escalations
  const processEscalations = useCallback(async () => {
    try {
      await alertService.processEscalations()
      refreshData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process escalations')
    }
  }, [alertService, refreshData])

  // Clean up old alerts
  const cleanupHistory = useCallback(() => {
    try {
      const removedCount = alertService.cleanupHistory()
      return removedCount
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cleanup history')
      return 0
    }
  }, [alertService])

  // Set up automatic evaluation interval
  useEffect(() => {
    if (options.autoEvaluateInterval && options.autoEvaluateInterval > 0) {
      const interval = setInterval(() => {
        // This would typically be called with real metrics from your data source
        // For now, we just refresh the data
        refreshData()
      }, options.autoEvaluateInterval)

      return () => clearInterval(interval)
    }
  }, [options.autoEvaluateInterval, refreshData])

  // Set up escalation check interval
  useEffect(() => {
    if (options.escalationCheckInterval && options.escalationCheckInterval > 0) {
      const interval = setInterval(() => {
        processEscalations()
      }, options.escalationCheckInterval)

      return () => clearInterval(interval)
    }
  }, [options.escalationCheckInterval, processEscalations])

  // Initial data load
  useEffect(() => {
    refreshData()
  }, [refreshData])

  return {
    // Service instance
    alertService,
    
    // State
    activeAlerts,
    rules,
    isLoading,
    error,
    
    // Actions
    evaluateMetrics,
    createOrUpdateRule,
    deleteRule,
    resolveAlert,
    acknowledgeAlert,
    processEscalations,
    cleanupHistory,
    refreshData,
    
    // Queries
    getStatistics,
    searchHistory,
    
    // Utilities
    clearError: () => setError(null)
  }
}

export default useAlertService