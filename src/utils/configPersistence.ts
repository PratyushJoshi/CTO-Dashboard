import React from 'react';
import { DashboardConfig, WidgetType, MetricType } from '@/types';

const CONFIG_STORAGE_KEY = 'cto-dashboard-config';
const USER_PREFERENCES_KEY = 'cto-dashboard-preferences';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  defaultRefreshInterval: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  timezone: string;
}

// Default dashboard configuration
export const getDefaultDashboardConfig = (): DashboardConfig => ({
  id: 'default-dashboard',
  userId: 'cto-user',
  name: 'Executive Dashboard',
  layout: [
    {
      id: 'overview-metrics',
      type: WidgetType.METRIC_CARD,
      position: { x: 0, y: 0, width: 4, height: 2 },
      config: {
        title: 'System Overview',
        metricTypes: [MetricType.INFRASTRUCTURE, MetricType.API_PERFORMANCE],
        timeRange: '1h',
        refreshInterval: 30,
      },
    },
    {
      id: 'infrastructure-health',
      type: WidgetType.GAUGE,
      position: { x: 4, y: 0, width: 4, height: 2 },
      config: {
        title: 'Infrastructure Health',
        metricTypes: [MetricType.INFRASTRUCTURE],
        timeRange: '1h',
        refreshInterval: 30,
      },
    },
    {
      id: 'api-performance-chart',
      type: WidgetType.LINE_CHART,
      position: { x: 0, y: 2, width: 6, height: 3 },
      config: {
        title: 'API Performance Trends',
        metricTypes: [MetricType.API_PERFORMANCE],
        timeRange: '24h',
        refreshInterval: 60,
      },
    },
    {
      id: 'recent-alerts',
      type: WidgetType.TABLE,
      position: { x: 6, y: 2, width: 2, height: 3 },
      config: {
        title: 'Recent Alerts',
        metricTypes: [],
        timeRange: '1h',
        refreshInterval: 15,
      },
    },
  ],
  filters: [],
  refreshInterval: 30,
  isDefault: true,
});

// Default user preferences
export const getDefaultUserPreferences = (): UserPreferences => ({
  theme: 'system',
  sidebarCollapsed: false,
  defaultRefreshInterval: 30,
  notificationsEnabled: true,
  soundEnabled: false,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

// Configuration persistence functions
export class ConfigPersistence {
  /**
   * Save dashboard configuration to localStorage
   */
  static saveDashboardConfig(config: DashboardConfig): void {
    try {
      const configData = {
        ...config,
        lastModified: new Date().toISOString(),
      };
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configData));
    } catch (error) {
      console.error('Failed to save dashboard configuration:', error);
    }
  }

  /**
   * Load dashboard configuration from localStorage
   */
  static loadDashboardConfig(): DashboardConfig | null {
    try {
      const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        // Validate the configuration structure
        if (this.validateDashboardConfig(parsedConfig)) {
          return parsedConfig;
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard configuration:', error);
    }
    return null;
  }

  /**
   * Save user preferences to localStorage
   */
  static saveUserPreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  /**
   * Load user preferences from localStorage
   */
  static loadUserPreferences(): UserPreferences {
    try {
      const savedPreferences = localStorage.getItem(USER_PREFERENCES_KEY);
      if (savedPreferences) {
        const parsedPreferences = JSON.parse(savedPreferences);
        // Merge with defaults to handle missing properties
        return { ...getDefaultUserPreferences(), ...parsedPreferences };
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
    return getDefaultUserPreferences();
  }

  /**
   * Reset dashboard configuration to default
   */
  static resetDashboardConfig(): DashboardConfig {
    const defaultConfig = getDefaultDashboardConfig();
    this.saveDashboardConfig(defaultConfig);
    return defaultConfig;
  }

  /**
   * Reset user preferences to default
   */
  static resetUserPreferences(): UserPreferences {
    const defaultPreferences = getDefaultUserPreferences();
    this.saveUserPreferences(defaultPreferences);
    return defaultPreferences;
  }

  /**
   * Export dashboard configuration as JSON
   */
  static exportDashboardConfig(): string {
    const config = this.loadDashboardConfig() || getDefaultDashboardConfig();
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import dashboard configuration from JSON
   */
  static importDashboardConfig(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson);
      if (this.validateDashboardConfig(config)) {
        this.saveDashboardConfig(config);
        return true;
      }
    } catch (error) {
      console.error('Failed to import dashboard configuration:', error);
    }
    return false;
  }

  /**
   * Validate dashboard configuration structure
   */
  private static validateDashboardConfig(config: any): config is DashboardConfig {
    return (
      config &&
      typeof config.id === 'string' &&
      typeof config.userId === 'string' &&
      typeof config.name === 'string' &&
      Array.isArray(config.layout) &&
      Array.isArray(config.filters) &&
      typeof config.refreshInterval === 'number' &&
      typeof config.isDefault === 'boolean'
    );
  }

  /**
   * Get configuration with fallback to default
   */
  static getConfigWithFallback(): DashboardConfig {
    return this.loadDashboardConfig() || getDefaultDashboardConfig();
  }

  /**
   * Update specific widget in configuration
   */
  static updateWidget(widgetId: string, updates: Partial<any>): void {
    const config = this.getConfigWithFallback();
    const widgetIndex = config.layout.findIndex(widget => widget.id === widgetId);
    
    if (widgetIndex !== -1) {
      config.layout[widgetIndex] = { ...config.layout[widgetIndex], ...updates };
      this.saveDashboardConfig(config);
    }
  }

  /**
   * Add new widget to configuration
   */
  static addWidget(widget: any): void {
    const config = this.getConfigWithFallback();
    config.layout.push(widget);
    this.saveDashboardConfig(config);
  }

  /**
   * Remove widget from configuration
   */
  static removeWidget(widgetId: string): void {
    const config = this.getConfigWithFallback();
    config.layout = config.layout.filter(widget => widget.id !== widgetId);
    this.saveDashboardConfig(config);
  }

  /**
   * Update dashboard filters
   */
  static updateFilters(filters: any[]): void {
    const config = this.getConfigWithFallback();
    config.filters = filters;
    this.saveDashboardConfig(config);
  }

  /**
   * Update refresh interval
   */
  static updateRefreshInterval(interval: number): void {
    const config = this.getConfigWithFallback();
    config.refreshInterval = interval;
    this.saveDashboardConfig(config);
  }
}

// Hook for React components to use configuration persistence
export const useDashboardConfig = () => {
  const [config, setConfigState] = React.useState<DashboardConfig>(() => 
    ConfigPersistence.getConfigWithFallback()
  );

  const updateConfig = React.useCallback((newConfig: DashboardConfig) => {
    ConfigPersistence.saveDashboardConfig(newConfig);
    setConfigState(newConfig);
  }, []);

  const resetConfig = React.useCallback(() => {
    const defaultConfig = ConfigPersistence.resetDashboardConfig();
    setConfigState(defaultConfig);
  }, []);

  return {
    config,
    updateConfig,
    resetConfig,
    exportConfig: ConfigPersistence.exportDashboardConfig,
    importConfig: ConfigPersistence.importDashboardConfig,
  };
};

// Hook for user preferences
export const useUserPreferences = () => {
  const [preferences, setPreferencesState] = React.useState<UserPreferences>(() => 
    ConfigPersistence.loadUserPreferences()
  );

  const updatePreferences = React.useCallback((newPreferences: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    ConfigPersistence.saveUserPreferences(updatedPreferences);
    setPreferencesState(updatedPreferences);
  }, [preferences]);

  const resetPreferences = React.useCallback(() => {
    const defaultPreferences = ConfigPersistence.resetUserPreferences();
    setPreferencesState(defaultPreferences);
  }, []);

  return {
    preferences,
    updatePreferences,
    resetPreferences,
  };
};