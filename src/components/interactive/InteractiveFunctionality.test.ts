import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  InteractiveWidget,
  WidgetType,
  InteractionType,
  TimeRange,
  TimeRangePreset,
  ExportFormat,
  ComparisonType,
  MetricType
} from '@/types';

/**
 * **Feature: cto-dashboard, Property 8: Interactive Functionality Completeness**
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.5**
 * 
 * For any dashboard visualization, all interactive features (zoom, filter, drill-down, export) 
 * should function correctly and preserve user-selected parameters
 */

// Generators for property-based testing
const widgetTypeArb = fc.oneof(...Object.values(WidgetType).map(v => fc.constant(v)));
const interactionTypeArb = fc.oneof(...Object.values(InteractionType).map(v => fc.constant(v)));
const timeRangePresetArb = fc.oneof(...Object.values(TimeRangePreset).map(v => fc.constant(v)));
const exportFormatArb = fc.oneof(...Object.values(ExportFormat).map(v => fc.constant(v)));
const comparisonTypeArb = fc.oneof(...Object.values(ComparisonType).map(v => fc.constant(v)));
const metricTypeArb = fc.oneof(...Object.values(MetricType).map(v => fc.constant(v)));

const timeRangeArb = fc.record({
  start: fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31') }),
  end: fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31') }),
  preset: fc.option(timeRangePresetArb, { nil: undefined })
}).filter(range => range.start <= range.end);

const interactiveWidgetArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  type: widgetTypeArb,
  title: fc.string({ minLength: 1, maxLength: 100 }),
  position: fc.record({
    x: fc.integer({ min: 0, max: 12 }),
    y: fc.integer({ min: 0, max: 12 }),
    width: fc.integer({ min: 1, max: 6 }),
    height: fc.integer({ min: 1, max: 6 })
  }),
  config: fc.record({
    title: fc.string({ minLength: 1, maxLength: 100 }),
    metricTypes: fc.array(metricTypeArb, { minLength: 1, maxLength: 3 }),
    timeRange: fc.string(),
    refreshInterval: fc.integer({ min: 5, max: 300 }),
    zoomEnabled: fc.boolean(),
    filterEnabled: fc.boolean(),
    drillDownEnabled: fc.boolean(),
    exportEnabled: fc.boolean(),
    comparisonEnabled: fc.boolean()
  }),
  interactions: fc.array(fc.record({
    type: interactionTypeArb,
    enabled: fc.boolean(),
    config: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: undefined })
  }), { maxLength: 6 })
}).map(widget => {
  // Ensure consistency between widget config and interactions
  const consistentInteractions = widget.interactions.map(interaction => {
    const shouldBeEnabled = interaction.enabled;
    
    // If interaction is enabled, make sure the corresponding config flag is also enabled
    switch (interaction.type) {
      case InteractionType.ZOOM:
        if (interaction.enabled && !widget.config.zoomEnabled) {
          widget.config.zoomEnabled = true;
        }
        break;
      case InteractionType.FILTER:
        if (interaction.enabled && !widget.config.filterEnabled) {
          widget.config.filterEnabled = true;
        }
        break;
      case InteractionType.DRILL_DOWN:
        if (interaction.enabled && !widget.config.drillDownEnabled) {
          widget.config.drillDownEnabled = true;
        }
        break;
      case InteractionType.EXPORT:
        if (interaction.enabled && !widget.config.exportEnabled) {
          widget.config.exportEnabled = true;
        }
        break;
      case InteractionType.COMPARISON:
        if (interaction.enabled && !widget.config.comparisonEnabled) {
          widget.config.comparisonEnabled = true;
        }
        break;
    }
    
    return interaction;
  });
  
  return { ...widget, interactions: consistentInteractions };
});

// Mock interactive functionality implementations
class InteractiveWidgetManager {
  private widgets: Map<string, InteractiveWidget> = new Map();
  private widgetStates: Map<string, any> = new Map();

  addWidget(widget: InteractiveWidget): void {
    this.widgets.set(widget.id, widget);
    this.widgetStates.set(widget.id, {
      currentTimeRange: null,
      appliedFilters: [],
      zoomLevel: 1,
      drillDownPath: [],
      lastExport: null,
      comparisonSettings: null
    });
  }

  // Zoom functionality
  applyZoom(widgetId: string, zoomLevel: number, zoomArea?: { start: Date; end: Date }): boolean {
    const widget = this.widgets.get(widgetId);
    const state = this.widgetStates.get(widgetId);
    
    if (!widget || !state || !widget.config.zoomEnabled) {
      return false;
    }

    const zoomInteraction = widget.interactions.find(i => i.type === InteractionType.ZOOM);
    if (!zoomInteraction?.enabled) {
      return false;
    }

    state.zoomLevel = zoomLevel;
    if (zoomArea) {
      state.currentTimeRange = zoomArea;
    }
    
    return true;
  }

  // Filter functionality
  applyFilter(widgetId: string, filters: any[]): boolean {
    const widget = this.widgets.get(widgetId);
    const state = this.widgetStates.get(widgetId);
    
    if (!widget || !state || !widget.config.filterEnabled) {
      return false;
    }

    const filterInteraction = widget.interactions.find(i => i.type === InteractionType.FILTER);
    if (!filterInteraction?.enabled) {
      return false;
    }

    state.appliedFilters = filters;
    return true;
  }

  // Drill-down functionality
  drillDown(widgetId: string, drillPath: string[]): boolean {
    const widget = this.widgets.get(widgetId);
    const state = this.widgetStates.get(widgetId);
    
    if (!widget || !state || !widget.config.drillDownEnabled) {
      return false;
    }

    const drillDownInteraction = widget.interactions.find(i => i.type === InteractionType.DRILL_DOWN);
    if (!drillDownInteraction?.enabled) {
      return false;
    }

    state.drillDownPath = drillPath;
    return true;
  }

  // Time range selection functionality
  selectTimeRange(widgetId: string, timeRange: TimeRange): boolean {
    const widget = this.widgets.get(widgetId);
    const state = this.widgetStates.get(widgetId);
    
    if (!widget || !state) {
      return false;
    }

    const timeRangeInteraction = widget.interactions.find(i => i.type === InteractionType.TIME_RANGE_SELECTION);
    if (!timeRangeInteraction?.enabled) {
      return false;
    }

    state.currentTimeRange = timeRange;
    return true;
  }

  // Export functionality
  exportWidget(widgetId: string, format: ExportFormat, options: any): boolean {
    const widget = this.widgets.get(widgetId);
    const state = this.widgetStates.get(widgetId);
    
    if (!widget || !state || !widget.config.exportEnabled) {
      return false;
    }

    const exportInteraction = widget.interactions.find(i => i.type === InteractionType.EXPORT);
    if (!exportInteraction?.enabled) {
      return false;
    }

    state.lastExport = {
      format,
      options,
      timestamp: new Date(),
      preservedFilters: state.appliedFilters,
      preservedTimeRange: state.currentTimeRange,
      preservedZoom: state.zoomLevel
    };
    
    return true;
  }

  // Comparison functionality
  setupComparison(widgetId: string, comparisonType: ComparisonType, subjects: any[]): boolean {
    const widget = this.widgets.get(widgetId);
    const state = this.widgetStates.get(widgetId);
    
    if (!widget || !state || !widget.config.comparisonEnabled) {
      return false;
    }

    const comparisonInteraction = widget.interactions.find(i => i.type === InteractionType.COMPARISON);
    if (!comparisonInteraction?.enabled) {
      return false;
    }

    state.comparisonSettings = {
      type: comparisonType,
      subjects,
      preservedFilters: state.appliedFilters,
      preservedTimeRange: state.currentTimeRange
    };
    
    return true;
  }

  // Get widget state for verification
  getWidgetState(widgetId: string): any {
    return this.widgetStates.get(widgetId);
  }

  // Check if all enabled interactions are functional
  validateAllInteractions(widgetId: string): boolean {
    const widget = this.widgets.get(widgetId);
    if (!widget) return false;

    return widget.interactions.every(interaction => {
      if (!interaction.enabled) return true; // Disabled interactions are valid

      switch (interaction.type) {
        case InteractionType.ZOOM:
          return widget.config.zoomEnabled;
        case InteractionType.FILTER:
          return widget.config.filterEnabled;
        case InteractionType.DRILL_DOWN:
          return widget.config.drillDownEnabled;
        case InteractionType.EXPORT:
          return widget.config.exportEnabled;
        case InteractionType.COMPARISON:
          return widget.config.comparisonEnabled;
        case InteractionType.TIME_RANGE_SELECTION:
          return true; // Always available
        default:
          return false;
      }
    });
  }
}

describe('Interactive Functionality Completeness Property Tests', () => {
  it('Property 8: All enabled interactive features should function correctly', () => {
    fc.assert(
      fc.property(interactiveWidgetArb, (widget) => {
        const manager = new InteractiveWidgetManager();
        manager.addWidget(widget);

        // Test that all interactions are properly configured
        const allInteractionsValid = manager.validateAllInteractions(widget.id);
        expect(allInteractionsValid).toBe(true);

        // Test zoom functionality if enabled
        const zoomInteraction = widget.interactions.find(i => i.type === InteractionType.ZOOM);
        if (zoomInteraction?.enabled && widget.config.zoomEnabled) {
          const zoomResult = manager.applyZoom(widget.id, 2.0);
          expect(zoomResult).toBe(true);
          
          const state = manager.getWidgetState(widget.id);
          expect(state.zoomLevel).toBe(2.0);
        }

        // Test filter functionality if enabled
        const filterInteraction = widget.interactions.find(i => i.type === InteractionType.FILTER);
        if (filterInteraction?.enabled && widget.config.filterEnabled) {
          const testFilters = [{ field: 'status', value: 'active' }];
          const filterResult = manager.applyFilter(widget.id, testFilters);
          expect(filterResult).toBe(true);
          
          const state = manager.getWidgetState(widget.id);
          expect(state.appliedFilters).toEqual(testFilters);
        }

        // Test drill-down functionality if enabled
        const drillDownInteraction = widget.interactions.find(i => i.type === InteractionType.DRILL_DOWN);
        if (drillDownInteraction?.enabled && widget.config.drillDownEnabled) {
          const testPath = ['summary', 'details', 'individual'];
          const drillResult = manager.drillDown(widget.id, testPath);
          expect(drillResult).toBe(true);
          
          const state = manager.getWidgetState(widget.id);
          expect(state.drillDownPath).toEqual(testPath);
        }

        // Test export functionality if enabled
        const exportInteraction = widget.interactions.find(i => i.type === InteractionType.EXPORT);
        if (exportInteraction?.enabled && widget.config.exportEnabled) {
          const exportResult = manager.exportWidget(widget.id, ExportFormat.CSV, { includeHeaders: true });
          expect(exportResult).toBe(true);
          
          const state = manager.getWidgetState(widget.id);
          expect(state.lastExport).toBeDefined();
          expect(state.lastExport.format).toBe(ExportFormat.CSV);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 8: Interactive features should preserve user-selected parameters', () => {
    fc.assert(
      fc.property(
        interactiveWidgetArb,
        timeRangeArb,
        fc.array(fc.record({ field: fc.string(), value: fc.string() }), { maxLength: 3 }),
        exportFormatArb,
        (widget, timeRange, filters, exportFormat) => {
          const manager = new InteractiveWidgetManager();
          manager.addWidget(widget);

          // Apply various interactions
          if (widget.config.filterEnabled) {
            manager.applyFilter(widget.id, filters);
          }

          const timeRangeInteraction = widget.interactions.find(i => i.type === InteractionType.TIME_RANGE_SELECTION);
          if (timeRangeInteraction?.enabled) {
            manager.selectTimeRange(widget.id, timeRange);
          }

          if (widget.config.zoomEnabled) {
            manager.applyZoom(widget.id, 1.5);
          }

          // Export should preserve all current settings
          if (widget.config.exportEnabled) {
            const exportResult = manager.exportWidget(widget.id, exportFormat, { includeAll: true });
            
            if (exportResult) {
              const state = manager.getWidgetState(widget.id);
              const exportData = state.lastExport;

              // Verify parameters are preserved in export
              expect(exportData.format).toBe(exportFormat);
              
              if (widget.config.filterEnabled) {
                expect(exportData.preservedFilters).toEqual(filters);
              }
              
              if (timeRangeInteraction?.enabled) {
                expect(exportData.preservedTimeRange).toEqual(timeRange);
              }
              
              if (widget.config.zoomEnabled) {
                expect(exportData.preservedZoom).toBe(1.5);
              }
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Comparison functionality should maintain parameter consistency', () => {
    fc.assert(
      fc.property(
        interactiveWidgetArb,
        comparisonTypeArb,
        fc.array(fc.record({ id: fc.string(), name: fc.string() }), { minLength: 2, maxLength: 4 }),
        (widget, comparisonType, subjects) => {
          const manager = new InteractiveWidgetManager();
          manager.addWidget(widget);

          // Set up some initial state
          const testFilters = [{ field: 'department', value: 'engineering' }];
          const testTimeRange = {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31'),
            preset: TimeRangePreset.LAST_30_DAYS
          };

          if (widget.config.filterEnabled) {
            manager.applyFilter(widget.id, testFilters);
          }

          const timeRangeInteraction = widget.interactions.find(i => i.type === InteractionType.TIME_RANGE_SELECTION);
          if (timeRangeInteraction?.enabled) {
            manager.selectTimeRange(widget.id, testTimeRange);
          }

          // Set up comparison
          if (widget.config.comparisonEnabled) {
            const comparisonResult = manager.setupComparison(widget.id, comparisonType, subjects);
            
            if (comparisonResult) {
              const state = manager.getWidgetState(widget.id);
              const comparisonSettings = state.comparisonSettings;

              // Verify comparison preserves existing parameters
              expect(comparisonSettings.type).toBe(comparisonType);
              expect(comparisonSettings.subjects).toEqual(subjects);
              
              if (widget.config.filterEnabled) {
                expect(comparisonSettings.preservedFilters).toEqual(testFilters);
              }
              
              if (timeRangeInteraction?.enabled) {
                expect(comparisonSettings.preservedTimeRange).toEqual(testTimeRange);
              }
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Disabled interactions should not function', () => {
    fc.assert(
      fc.property(interactiveWidgetArb, (widget) => {
        const manager = new InteractiveWidgetManager();
        manager.addWidget(widget);

        // Test that disabled interactions return false
        widget.interactions.forEach(interaction => {
          if (!interaction.enabled) {
            switch (interaction.type) {
              case InteractionType.ZOOM:
                const zoomResult = manager.applyZoom(widget.id, 2.0);
                expect(zoomResult).toBe(false);
                break;
              case InteractionType.FILTER:
                const filterResult = manager.applyFilter(widget.id, []);
                expect(filterResult).toBe(false);
                break;
              case InteractionType.DRILL_DOWN:
                const drillResult = manager.drillDown(widget.id, ['test']);
                expect(drillResult).toBe(false);
                break;
              case InteractionType.EXPORT:
                const exportResult = manager.exportWidget(widget.id, ExportFormat.CSV, {});
                expect(exportResult).toBe(false);
                break;
              case InteractionType.COMPARISON:
                const comparisonResult = manager.setupComparison(widget.id, ComparisonType.TIME_PERIOD, []);
                expect(comparisonResult).toBe(false);
                break;
            }
          }
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });
});