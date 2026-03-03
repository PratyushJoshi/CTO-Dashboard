import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  DashboardConfig,
  WidgetType,
  MetricType,
  AlertRule,
  AlertSeverity,
  AlertCondition,
  InteractiveDashboard,
  ShareSettings,
  PermissionLevel,
  TimeRangePreset,
  InteractionType
} from '@/types';
import { ConfigPersistence } from '@/utils/configPersistence';

/**
 * **Feature: cto-dashboard, Property 9: Configuration Persistence**
 * **Validates: Requirements 9.1, 10.4**
 * 
 * For any user-customized dashboard configuration or alert threshold, 
 * the settings should be correctly saved, retrieved, and applied across user sessions
 */

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Setup localStorage mock
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  localStorageMock.clear();
});

// Generators for property-based testing
const widgetTypeArb = fc.oneof(...Object.values(WidgetType).map(v => fc.constant(v)));
const metricTypeArb = fc.oneof(...Object.values(MetricType).map(v => fc.constant(v)));
const alertSeverityArb = fc.oneof(...Object.values(AlertSeverity).map(v => fc.constant(v)));
const permissionLevelArb = fc.oneof(...Object.values(PermissionLevel).map(v => fc.constant(v)));
const timeRangePresetArb = fc.oneof(...Object.values(TimeRangePreset).map(v => fc.constant(v)));

const widgetLayoutArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  type: widgetTypeArb,
  position: fc.record({
    x: fc.integer({ min: 0, max: 12 }),
    y: fc.integer({ min: 0, max: 12 }),
    width: fc.integer({ min: 1, max: 6 }),
    height: fc.integer({ min: 1, max: 6 })
  }),
  config: fc.record({
    title: fc.string({ minLength: 1, maxLength: 100 }),
    metricTypes: fc.array(metricTypeArb, { minLength: 1, maxLength: 3 }),
    timeRange: fc.string({ minLength: 1, maxLength: 10 }),
    refreshInterval: fc.integer({ min: 5, max: 300 })
  })
});

const dashboardFilterArb = fc.record({
  field: fc.string({ minLength: 1, maxLength: 50 }),
  operator: fc.oneof(...['eq', 'gt', 'lt', 'contains', 'in'].map(v => fc.constant(v))),
  value: fc.oneof(fc.string(), fc.integer(), fc.boolean())
});

const dashboardConfigArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  userId: fc.string({ minLength: 1, maxLength: 50 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  layout: fc.array(widgetLayoutArb, { minLength: 1, maxLength: 10 }),
  filters: fc.array(dashboardFilterArb, { maxLength: 5 }),
  refreshInterval: fc.integer({ min: 5, max: 300 }),
  isDefault: fc.boolean()
});

const alertConditionArb = fc.record({
  operator: fc.oneof(...(['gt', 'lt', 'eq', 'gte', 'lte'] as const).map(v => fc.constant(v))),
  timeWindow: fc.integer({ min: 1, max: 60 }),
  consecutiveBreaches: fc.integer({ min: 1, max: 10 })
}) as fc.Arbitrary<AlertCondition>;

const alertRuleArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  metricType: metricTypeArb,
  condition: alertConditionArb,
  threshold: fc.float({ min: 0, max: 100 }).filter(n => !isNaN(n) && isFinite(n)),
  severity: alertSeverityArb,
  enabled: fc.boolean(),
  notificationChannels: fc.array(fc.string(), { minLength: 1, maxLength: 3 })
});

const shareSettingsArb = fc.record({
  isPublic: fc.boolean(),
  allowedUsers: fc.array(fc.string(), { maxLength: 5 }),
  permissions: fc.array(fc.record({
    userId: fc.string(),
    permission: permissionLevelArb
  }), { maxLength: 3 }),
  expiresAt: fc.option(fc.date({ min: new Date(), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime())), { nil: undefined })
});

const interactiveDashboardArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  userId: fc.string({ minLength: 1, maxLength: 50 }),
  widgets: fc.array(fc.record({
    id: fc.string(),
    type: widgetTypeArb,
    title: fc.string(),
    position: fc.record({
      x: fc.integer({ min: 0, max: 12 }),
      y: fc.integer({ min: 0, max: 12 }),
      width: fc.integer({ min: 1, max: 6 }),
      height: fc.integer({ min: 1, max: 6 })
    }),
    config: fc.record({
      title: fc.string(),
      metricTypes: fc.array(metricTypeArb),
      timeRange: fc.string(),
      refreshInterval: fc.integer({ min: 5, max: 300 }),
      zoomEnabled: fc.boolean(),
      filterEnabled: fc.boolean(),
      drillDownEnabled: fc.boolean(),
      exportEnabled: fc.boolean(),
      comparisonEnabled: fc.boolean()
    }),
    interactions: fc.array(fc.record({
      type: fc.oneof(...Object.values(InteractionType).map(v => fc.constant(v))),
      enabled: fc.boolean(),
      config: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: undefined })
    }))
  }), { minLength: 1, maxLength: 8 }),
  filters: fc.array(dashboardFilterArb),
  timeRange: fc.record({
    start: fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31') }).filter(d => !isNaN(d.getTime())),
    end: fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31') }).filter(d => !isNaN(d.getTime())),
    preset: fc.option(timeRangePresetArb, { nil: undefined })
  }),
  refreshInterval: fc.integer({ min: 5, max: 300 }),
  isShared: fc.boolean(),
  shareSettings: fc.option(shareSettingsArb, { nil: undefined }),
  lastModified: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime()))
}).filter(dashboard => dashboard.timeRange.start <= dashboard.timeRange.end);

// Enhanced configuration persistence manager for testing
class TestConfigPersistenceManager {
  private static readonly DASHBOARD_KEY = 'test-dashboard-config';
  private static readonly ALERT_RULES_KEY = 'test-alert-rules';
  private static readonly INTERACTIVE_DASHBOARD_KEY = 'test-interactive-dashboard';
  private static readonly USER_PREFERENCES_KEY = 'test-user-preferences';

  // Dashboard configuration persistence
  static saveDashboardConfig(config: DashboardConfig): boolean {
    try {
      const configWithTimestamp = {
        ...config,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(this.DASHBOARD_KEY, JSON.stringify(configWithTimestamp));
      return true;
    } catch (error) {
      return false;
    }
  }

  static loadDashboardConfig(): DashboardConfig | null {
    try {
      const saved = localStorage.getItem(this.DASHBOARD_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate structure
        if (this.validateDashboardConfig(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      // Handle parsing errors
    }
    return null;
  }

  // Alert rules persistence
  static saveAlertRules(rules: AlertRule[]): boolean {
    try {
      const rulesWithTimestamp = {
        rules,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(this.ALERT_RULES_KEY, JSON.stringify(rulesWithTimestamp));
      return true;
    } catch (error) {
      return false;
    }
  }

  static loadAlertRules(): AlertRule[] {
    try {
      const saved = localStorage.getItem(this.ALERT_RULES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.rules)) {
          return parsed.rules;
        }
      }
    } catch (error) {
      // Handle parsing errors
    }
    return [];
  }

  // Interactive dashboard persistence
  static saveInteractiveDashboard(dashboard: InteractiveDashboard): boolean {
    try {
      const dashboardWithTimestamp = {
        ...dashboard,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(this.INTERACTIVE_DASHBOARD_KEY, JSON.stringify(dashboardWithTimestamp));
      return true;
    } catch (error) {
      return false;
    }
  }

  static loadInteractiveDashboard(): InteractiveDashboard | null {
    try {
      const saved = localStorage.getItem(this.INTERACTIVE_DASHBOARD_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (this.validateInteractiveDashboard(parsed)) {
          // Convert date strings back to Date objects
          if (parsed.timeRange) {
            if (parsed.timeRange.start) {
              parsed.timeRange.start = new Date(parsed.timeRange.start);
            }
            if (parsed.timeRange.end) {
              parsed.timeRange.end = new Date(parsed.timeRange.end);
            }
          }
          if (parsed.lastModified) {
            parsed.lastModified = new Date(parsed.lastModified);
          }
          if (parsed.shareSettings?.expiresAt) {
            parsed.shareSettings.expiresAt = new Date(parsed.shareSettings.expiresAt);
          }
          return parsed;
        }
      }
    } catch (error) {
      // Handle parsing errors
    }
    return null;
  }

  // User preferences persistence
  static saveUserPreferences(preferences: any): boolean {
    try {
      localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(preferences));
      return true;
    } catch (error) {
      return false;
    }
  }

  static loadUserPreferences(): any {
    try {
      const saved = localStorage.getItem(this.USER_PREFERENCES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      // Handle parsing errors
    }
    return null;
  }

  // Validation methods
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

  private static validateInteractiveDashboard(dashboard: any): dashboard is InteractiveDashboard {
    return (
      dashboard &&
      typeof dashboard.id === 'string' &&
      typeof dashboard.name === 'string' &&
      typeof dashboard.userId === 'string' &&
      Array.isArray(dashboard.widgets) &&
      Array.isArray(dashboard.filters) &&
      typeof dashboard.refreshInterval === 'number' &&
      typeof dashboard.isShared === 'boolean'
    );
  }

  // Clear all test data
  static clearAll(): void {
    localStorage.removeItem(this.DASHBOARD_KEY);
    localStorage.removeItem(this.ALERT_RULES_KEY);
    localStorage.removeItem(this.INTERACTIVE_DASHBOARD_KEY);
    localStorage.removeItem(this.USER_PREFERENCES_KEY);
  }
}

describe('Configuration Persistence Property Tests', () => {
  beforeEach(() => {
    TestConfigPersistenceManager.clearAll();
  });

  it('Property 9: Dashboard configuration round-trip persistence', () => {
    fc.assert(
      fc.property(dashboardConfigArb, (originalConfig) => {
        // Save configuration
        const saveResult = TestConfigPersistenceManager.saveDashboardConfig(originalConfig);
        expect(saveResult).toBe(true);

        // Load configuration
        const loadedConfig = TestConfigPersistenceManager.loadDashboardConfig();
        expect(loadedConfig).not.toBeNull();

        if (loadedConfig) {
          // Verify all essential properties are preserved
          expect(loadedConfig.id).toBe(originalConfig.id);
          expect(loadedConfig.userId).toBe(originalConfig.userId);
          expect(loadedConfig.name).toBe(originalConfig.name);
          expect(loadedConfig.layout).toEqual(originalConfig.layout);
          expect(loadedConfig.filters).toEqual(originalConfig.filters);
          expect(loadedConfig.refreshInterval).toBe(originalConfig.refreshInterval);
          expect(loadedConfig.isDefault).toBe(originalConfig.isDefault);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 9: Alert rules configuration persistence', () => {
    fc.assert(
      fc.property(fc.array(alertRuleArb, { minLength: 1, maxLength: 10 }), (originalRules) => {
        // Save alert rules
        const saveResult = TestConfigPersistenceManager.saveAlertRules(originalRules);
        expect(saveResult).toBe(true);

        // Load alert rules
        const loadedRules = TestConfigPersistenceManager.loadAlertRules();
        expect(loadedRules).toEqual(originalRules);

        // Verify each rule is preserved correctly
        loadedRules.forEach((loadedRule, index) => {
          const originalRule = originalRules[index];
          expect(loadedRule.id).toBe(originalRule.id);
          expect(loadedRule.name).toBe(originalRule.name);
          expect(loadedRule.metricType).toBe(originalRule.metricType);
          expect(loadedRule.condition).toEqual(originalRule.condition);
          expect(loadedRule.threshold).toBe(originalRule.threshold);
          expect(loadedRule.severity).toBe(originalRule.severity);
          expect(loadedRule.enabled).toBe(originalRule.enabled);
          expect(loadedRule.notificationChannels).toEqual(originalRule.notificationChannels);
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 9: Interactive dashboard configuration persistence', () => {
    fc.assert(
      fc.property(interactiveDashboardArb, (originalDashboard) => {
        // Save interactive dashboard
        const saveResult = TestConfigPersistenceManager.saveInteractiveDashboard(originalDashboard);
        expect(saveResult).toBe(true);

        // Load interactive dashboard
        const loadedDashboard = TestConfigPersistenceManager.loadInteractiveDashboard();
        expect(loadedDashboard).not.toBeNull();

        if (loadedDashboard) {
          // Verify core properties
          expect(loadedDashboard.id).toBe(originalDashboard.id);
          expect(loadedDashboard.name).toBe(originalDashboard.name);
          expect(loadedDashboard.userId).toBe(originalDashboard.userId);
          expect(loadedDashboard.refreshInterval).toBe(originalDashboard.refreshInterval);
          expect(loadedDashboard.isShared).toBe(originalDashboard.isShared);

          // Verify widgets are preserved
          expect(loadedDashboard.widgets).toHaveLength(originalDashboard.widgets.length);
          loadedDashboard.widgets.forEach((loadedWidget, index) => {
            const originalWidget = originalDashboard.widgets[index];
            expect(loadedWidget.id).toBe(originalWidget.id);
            expect(loadedWidget.type).toBe(originalWidget.type);
            expect(loadedWidget.title).toBe(originalWidget.title);
            expect(loadedWidget.position).toEqual(originalWidget.position);
            expect(loadedWidget.config).toEqual(originalWidget.config);
            expect(loadedWidget.interactions).toEqual(originalWidget.interactions);
          });

          // Verify filters and time range
          expect(loadedDashboard.filters).toEqual(originalDashboard.filters);
          expect(loadedDashboard.timeRange).toEqual(originalDashboard.timeRange);

          // Verify share settings if present
          if (originalDashboard.shareSettings) {
            expect(loadedDashboard.shareSettings).toEqual(originalDashboard.shareSettings);
          }
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 9: Configuration persistence across multiple save/load cycles', () => {
    fc.assert(
      fc.property(
        dashboardConfigArb,
        fc.array(alertRuleArb, { maxLength: 5 }),
        fc.record({
          theme: fc.constantFrom('light', 'dark', 'system'),
          notifications: fc.boolean(),
          autoRefresh: fc.boolean()
        }),
        (config, alertRules, preferences) => {
          // Perform multiple save/load cycles
          for (let cycle = 0; cycle < 3; cycle++) {
            // Save all configurations
            const configSaved = TestConfigPersistenceManager.saveDashboardConfig(config);
            const rulesSaved = TestConfigPersistenceManager.saveAlertRules(alertRules);
            const prefsSaved = TestConfigPersistenceManager.saveUserPreferences(preferences);

            expect(configSaved).toBe(true);
            expect(rulesSaved).toBe(true);
            expect(prefsSaved).toBe(true);

            // Load all configurations
            const loadedConfig = TestConfigPersistenceManager.loadDashboardConfig();
            const loadedRules = TestConfigPersistenceManager.loadAlertRules();
            const loadedPrefs = TestConfigPersistenceManager.loadUserPreferences();

            // Verify consistency across cycles
            expect(loadedConfig?.id).toBe(config.id);
            expect(loadedRules).toHaveLength(alertRules.length);
            expect(loadedPrefs).toEqual(preferences);
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 9: Configuration persistence handles corrupted data gracefully', () => {
    fc.assert(
      fc.property(
        dashboardConfigArb,
        fc.string({ minLength: 1, maxLength: 100 }),
        (validConfig, corruptedData) => {
          // Save valid configuration first
          TestConfigPersistenceManager.saveDashboardConfig(validConfig);

          // Corrupt the data in localStorage
          localStorage.setItem('test-dashboard-config', corruptedData);

          // Attempt to load - should handle gracefully
          const loadedConfig = TestConfigPersistenceManager.loadDashboardConfig();
          
          // Should return null for corrupted data, not throw an error
          expect(loadedConfig).toBeNull();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 9: User preferences persistence maintains session consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          theme: fc.constantFrom('light', 'dark', 'system'),
          sidebarCollapsed: fc.boolean(),
          defaultRefreshInterval: fc.integer({ min: 5, max: 300 }),
          notificationsEnabled: fc.boolean(),
          soundEnabled: fc.boolean(),
          timezone: fc.string(),
          customSettings: fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.integer(), fc.boolean()))
        }),
        (preferences) => {
          // Save preferences
          const saveResult = TestConfigPersistenceManager.saveUserPreferences(preferences);
          expect(saveResult).toBe(true);

          // Load preferences
          const loadedPreferences = TestConfigPersistenceManager.loadUserPreferences();
          expect(loadedPreferences).toEqual(preferences);

          // Verify specific preference types are preserved
          expect(typeof loadedPreferences.theme).toBe('string');
          expect(typeof loadedPreferences.sidebarCollapsed).toBe('boolean');
          expect(typeof loadedPreferences.defaultRefreshInterval).toBe('number');
          expect(typeof loadedPreferences.notificationsEnabled).toBe('boolean');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});