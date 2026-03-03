import React, { useState } from 'react'
import {
  AlertRule,
  AlertSeverity,
  MetricType,
  NotificationChannel,
  AlertCondition
} from '../../types/index'

interface AlertRuleFormProps {
  rule?: AlertRule
  onSave: (rule: AlertRule) => void
  onCancel: () => void
}

export const AlertRuleForm: React.FC<AlertRuleFormProps> = ({
  rule,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<AlertRule>>({
    id: rule?.id || '',
    name: rule?.name || '',
    metricType: rule?.metricType || MetricType.INFRASTRUCTURE,
    condition: rule?.condition || {
      operator: 'gt',
      timeWindow: 5,
      consecutiveBreaches: 1
    },
    threshold: rule?.threshold || 0,
    severity: rule?.severity || AlertSeverity.MEDIUM,
    enabled: rule?.enabled ?? true,
    notificationChannels: rule?.notificationChannels || [NotificationChannel.IN_DASHBOARD],
    escalationPolicy: rule?.escalationPolicy
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Rule name is required'
    }

    if (!formData.id?.trim()) {
      newErrors.id = 'Rule ID is required'
    }

    if (formData.threshold === undefined || formData.threshold < 0) {
      newErrors.threshold = 'Threshold must be a non-negative number'
    }

    if (!formData.condition?.timeWindow || formData.condition.timeWindow <= 0) {
      newErrors.timeWindow = 'Time window must be positive'
    }

    if (!formData.condition?.consecutiveBreaches || formData.condition.consecutiveBreaches <= 0) {
      newErrors.consecutiveBreaches = 'Consecutive breaches must be positive'
    }

    if (!formData.notificationChannels?.length) {
      newErrors.notificationChannels = 'At least one notification channel is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const alertRule: AlertRule = {
      id: formData.id!,
      name: formData.name!,
      metricType: formData.metricType!,
      condition: formData.condition!,
      threshold: formData.threshold!,
      severity: formData.severity!,
      enabled: formData.enabled!,
      notificationChannels: formData.notificationChannels!,
      escalationPolicy: formData.escalationPolicy
    }

    onSave(alertRule)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateCondition = (field: keyof AlertCondition, value: any) => {
    setFormData(prev => ({
      ...prev,
      condition: {
        ...prev.condition!,
        [field]: value
      }
    }))
  }

  const toggleNotificationChannel = (channel: NotificationChannel) => {
    const channels = formData.notificationChannels || []
    const newChannels = channels.includes(channel)
      ? channels.filter(c => c !== channel)
      : [...channels, channel]
    
    updateFormData('notificationChannels', newChannels)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6">
        {rule ? 'Edit Alert Rule' : 'Create Alert Rule'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Rule ID</label>
            <input
              type="text"
              value={formData.id || ''}
              onChange={(e) => updateFormData('id', e.target.value)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.id ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="unique-rule-id"
              disabled={!!rule} // Don't allow editing ID for existing rules
            />
            {errors.id && <p className="text-red-500 text-sm mt-1">{errors.id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rule Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => updateFormData('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="High CPU Usage Alert"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
        </div>

        {/* Metric Type and Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Metric Type</label>
            <select
              value={formData.metricType || ''}
              onChange={(e) => updateFormData('metricType', e.target.value as MetricType)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(MetricType).map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Severity</label>
            <select
              value={formData.severity || ''}
              onChange={(e) => updateFormData('severity', e.target.value as AlertSeverity)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(AlertSeverity).map(severity => (
                <option key={severity} value={severity}>
                  {severity.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Threshold Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select
              value={formData.condition?.operator || 'gt'}
              onChange={(e) => updateCondition('operator', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="gt">Greater than (&gt;)</option>
              <option value="gte">Greater than or equal (≥)</option>
              <option value="lt">Less than (&lt;)</option>
              <option value="lte">Less than or equal (≤)</option>
              <option value="eq">Equal to (=)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Threshold</label>
            <input
              type="number"
              step="0.01"
              value={formData.threshold || ''}
              onChange={(e) => updateFormData('threshold', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.threshold ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="80"
            />
            {errors.threshold && <p className="text-red-500 text-sm mt-1">{errors.threshold}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              <input
                type="checkbox"
                checked={formData.enabled || false}
                onChange={(e) => updateFormData('enabled', e.target.checked)}
                className="mr-2"
              />
              Rule Enabled
            </label>
          </div>
        </div>

        {/* Time Window and Consecutive Breaches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Time Window (minutes)</label>
            <input
              type="number"
              min="1"
              value={formData.condition?.timeWindow || ''}
              onChange={(e) => updateCondition('timeWindow', parseInt(e.target.value) || 1)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.timeWindow ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="5"
            />
            {errors.timeWindow && <p className="text-red-500 text-sm mt-1">{errors.timeWindow}</p>}
            <p className="text-sm text-gray-500 mt-1">
              How long the condition must persist before triggering
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Consecutive Breaches</label>
            <input
              type="number"
              min="1"
              value={formData.condition?.consecutiveBreaches || ''}
              onChange={(e) => updateCondition('consecutiveBreaches', parseInt(e.target.value) || 1)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.consecutiveBreaches ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1"
            />
            {errors.consecutiveBreaches && <p className="text-red-500 text-sm mt-1">{errors.consecutiveBreaches}</p>}
            <p className="text-sm text-gray-500 mt-1">
              Number of consecutive threshold breaches required
            </p>
          </div>
        </div>

        {/* Notification Channels */}
        <div>
          <label className="block text-sm font-medium mb-2">Notification Channels</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.values(NotificationChannel).map(channel => (
              <label key={channel} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.notificationChannels?.includes(channel) || false}
                  onChange={() => toggleNotificationChannel(channel)}
                  className="rounded"
                />
                <span className="text-sm capitalize">
                  {channel.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
          {errors.notificationChannels && (
            <p className="text-red-500 text-sm mt-1">{errors.notificationChannels}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {rule ? 'Update Rule' : 'Create Rule'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AlertRuleForm