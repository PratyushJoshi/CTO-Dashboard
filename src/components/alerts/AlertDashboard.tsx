import React, { useState, useEffect } from 'react'
import { AlertService, AlertHistoryFilters } from '../../services/AlertService'
import {
  Alert,
  AlertRule,
  AlertSeverity,
  AlertStatus,
  MetricType,
  NotificationChannel
} from '../../types/index'

interface AlertDashboardProps {
  alertService: AlertService
}

export const AlertDashboard: React.FC<AlertDashboardProps> = ({ alertService }) => {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([])
  const [alertHistory, setAlertHistory] = useState<Alert[]>([])
  const [rules, setRules] = useState<AlertRule[]>([])
  const [selectedTab, setSelectedTab] = useState<'active' | 'history' | 'rules'>('active')
  const [historyFilters, setHistoryFilters] = useState<AlertHistoryFilters>({})
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    setActiveAlerts(alertService.getActiveAlerts())
    setRules(alertService.getRules())
    
    const history = alertService.searchAlertHistory(historyFilters, 50)
    setAlertHistory(history.alerts)
  }

  const handleResolveAlert = async (alertId: string) => {
    await alertService.resolveAlert(alertId, 'Resolved by user')
    loadData()
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    alertService.acknowledgeAlert(alertId, 'Current user')
    loadData()
  }

  const handleSearchHistory = () => {
    const filters: AlertHistoryFilters = {
      ...historyFilters,
      searchText: searchText || undefined
    }
    
    const history = alertService.searchAlertHistory(filters, 50)
    setAlertHistory(history.alerts)
  }

  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'text-red-600 bg-red-100'
      case AlertSeverity.HIGH:
        return 'text-orange-600 bg-orange-100'
      case AlertSeverity.MEDIUM:
        return 'text-yellow-600 bg-yellow-100'
      case AlertSeverity.LOW:
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: AlertStatus): string => {
    switch (status) {
      case AlertStatus.ACTIVE:
        return 'text-red-600 bg-red-100'
      case AlertStatus.ACKNOWLEDGED:
        return 'text-yellow-600 bg-yellow-100'
      case AlertStatus.RESOLVED:
        return 'text-green-600 bg-green-100'
      case AlertStatus.SUPPRESSED:
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const renderActiveAlerts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Active Alerts ({activeAlerts.length})</h2>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      {activeAlerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No active alerts
        </div>
      ) : (
        <div className="space-y-3">
          {activeAlerts.map(alert => (
            <div key={alert.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(alert.status)}`}>
                      {alert.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {alert.metricType}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-lg mb-1">{alert.message}</h3>
                  <p className="text-gray-600 mb-2">
                    {alert.details.metricName}: {alert.details.currentValue} (threshold: {alert.details.threshold})
                  </p>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    Triggered: {formatDate(alert.triggeredAt)}
                  </div>
                  
                  {alert.details.recommendedActions.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-medium text-sm mb-1">Recommended Actions:</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {alert.details.recommendedActions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  {alert.status === AlertStatus.ACTIVE && (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    Resolve
                  </button>
                </div>
              </div>
              
              {alert.notifications.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <h4 className="font-medium text-sm mb-2">Notifications:</h4>
                  <div className="flex flex-wrap gap-2">
                    {alert.notifications.map(notif => (
                      <span
                        key={notif.id}
                        className={`px-2 py-1 rounded text-xs ${
                          notif.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          notif.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {notif.channel}: {notif.status}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderAlertHistory = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Alert History</h2>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search alerts..."
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Severity</label>
            <select
              value={historyFilters.severity?.[0] || ''}
              onChange={(e) => setHistoryFilters({
                ...historyFilters,
                severity: e.target.value ? [e.target.value as AlertSeverity] : undefined
              })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Severities</option>
              {Object.values(AlertSeverity).map(severity => (
                <option key={severity} value={severity}>{severity.toUpperCase()}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={historyFilters.status?.[0] || ''}
              onChange={(e) => setHistoryFilters({
                ...historyFilters,
                status: e.target.value ? [e.target.value as AlertStatus] : undefined
              })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {Object.values(AlertStatus).map(status => (
                <option key={status} value={status}>{status.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={handleSearchHistory}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>
      
      {/* History Results */}
      <div className="space-y-3">
        {alertHistory.map(alert => (
          <div key={alert.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(alert.status)}`}>
                    {alert.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {alert.metricType}
                  </span>
                </div>
                
                <h3 className="font-medium mb-1">{alert.message}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {alert.details.metricName}: {alert.details.currentValue} (threshold: {alert.details.threshold})
                </p>
                
                <div className="text-sm text-gray-500">
                  Triggered: {formatDate(alert.triggeredAt)}
                  {alert.resolvedAt && (
                    <span className="ml-4">
                      Resolved: {formatDate(alert.resolvedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderRules = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Alert Rules ({rules.length})</h2>
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Add Rule
        </button>
      </div>
      
      <div className="space-y-3">
        {rules.map(rule => (
          <div key={rule.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getSeverityColor(rule.severity)}`}>
                    {rule.severity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${rule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {rule.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {rule.metricType}
                  </span>
                </div>
                
                <h3 className="font-medium mb-1">{rule.name}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Threshold: {rule.condition.operator} {rule.threshold}
                </p>
                
                <div className="text-sm text-gray-500 mb-2">
                  Time window: {rule.condition.timeWindow} minutes | 
                  Consecutive breaches: {rule.condition.consecutiveBreaches}
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">Channels: </span>
                  {rule.notificationChannels.join(', ')}
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                  Edit
                </button>
                <button className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Alert Management</h1>
        
        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'active', label: 'Active Alerts', count: activeAlerts.length },
              { key: 'history', label: 'History', count: null },
              { key: 'rules', label: 'Rules', count: rules.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Tab Content */}
      <div>
        {selectedTab === 'active' && renderActiveAlerts()}
        {selectedTab === 'history' && renderAlertHistory()}
        {selectedTab === 'rules' && renderRules()}
      </div>
    </div>
  )
}

export default AlertDashboard