import React, { useState, useEffect } from 'react'
import { Alert, AlertSeverity, AlertStatus } from '../../types/index'

interface AlertNotificationsProps {
  alerts: Alert[]
  onDismiss: (alertId: string) => void
  onAcknowledge: (alertId: string) => void
  maxVisible?: number
}

export const AlertNotifications: React.FC<AlertNotificationsProps> = ({
  alerts,
  onDismiss,
  onAcknowledge,
  maxVisible = 5
}) => {
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Sort alerts by severity and timestamp (most critical and recent first)
    const sortedAlerts = [...alerts].sort((a, b) => {
      const severityOrder = {
        [AlertSeverity.CRITICAL]: 4,
        [AlertSeverity.HIGH]: 3,
        [AlertSeverity.MEDIUM]: 2,
        [AlertSeverity.LOW]: 1
      }
      
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
      if (severityDiff !== 0) return severityDiff
      
      return b.triggeredAt.getTime() - a.triggeredAt.getTime()
    })

    setVisibleAlerts(isExpanded ? sortedAlerts : sortedAlerts.slice(0, maxVisible))
  }, [alerts, isExpanded, maxVisible])

  const getSeverityIcon = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return '🚨'
      case AlertSeverity.HIGH:
        return '⚠️'
      case AlertSeverity.MEDIUM:
        return '⚡'
      case AlertSeverity.LOW:
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'bg-red-500 border-red-600'
      case AlertSeverity.HIGH:
        return 'bg-orange-500 border-orange-600'
      case AlertSeverity.MEDIUM:
        return 'bg-yellow-500 border-yellow-600'
      case AlertSeverity.LOW:
        return 'bg-blue-500 border-blue-600'
      default:
        return 'bg-gray-500 border-gray-600'
    }
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-full">
      {/* Alert Counter */}
      {alerts.length > maxVisible && !isExpanded && (
        <div className="mb-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            {alerts.length} active alerts • Click to expand
          </button>
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-2 max-h-screen overflow-y-auto">
        {visibleAlerts.map((alert, index) => (
          <div
            key={alert.id}
            className={`${getSeverityColor(alert.severity)} text-white p-4 rounded-lg shadow-lg border-l-4 animate-slide-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-xl">{getSeverityIcon(alert.severity)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm uppercase tracking-wide">
                      {alert.severity}
                    </span>
                    <span className="text-xs opacity-75">
                      {formatTimeAgo(alert.triggeredAt)}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1 leading-tight">
                    {alert.message}
                  </h4>
                  
                  <p className="text-xs opacity-90 mb-2">
                    {alert.details.metricName}: {alert.details.currentValue}
                    {alert.details.threshold && (
                      <span> (threshold: {alert.details.threshold})</span>
                    )}
                  </p>

                  {alert.details.recommendedActions.length > 0 && (
                    <div className="text-xs opacity-90">
                      <span className="font-medium">Action: </span>
                      {alert.details.recommendedActions[0]}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-1 ml-2">
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="text-white hover:text-gray-200 transition-colors"
                  title="Dismiss"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {alert.status === AlertStatus.ACTIVE && (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="text-white hover:text-gray-200 transition-colors text-xs"
                    title="Acknowledge"
                  >
                    ✓
                  </button>
                )}
              </div>
            </div>

            {/* Notification Status */}
            {alert.notifications.length > 0 && (
              <div className="mt-3 pt-2 border-t border-white border-opacity-20">
                <div className="flex flex-wrap gap-1">
                  {alert.notifications.slice(0, 3).map(notif => (
                    <span
                      key={notif.id}
                      className={`px-2 py-1 rounded text-xs ${
                        notif.status === 'delivered' ? 'bg-green-600 bg-opacity-80' :
                        notif.status === 'failed' ? 'bg-red-600 bg-opacity-80' :
                        'bg-gray-600 bg-opacity-80'
                      }`}
                    >
                      {notif.channel}
                    </span>
                  ))}
                  {alert.notifications.length > 3 && (
                    <span className="px-2 py-1 rounded text-xs bg-gray-600 bg-opacity-80">
                      +{alert.notifications.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Collapse Button */}
      {isExpanded && alerts.length > maxVisible && (
        <div className="mt-2">
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            Collapse alerts
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default AlertNotifications