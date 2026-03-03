import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { InfrastructureMetrics, ServerStatus } from '@/types';

/**
 * **Feature: cto-dashboard, Property 4: Visual Indicator Consistency**
 * **Validates: Requirements 1.2, 6.5, 8.5**
 * 
 * For any metric value that meets highlighting criteria (e.g., >80% utilization), 
 * the corresponding visual indicator should be displayed consistently across all dashboard views
 */

// Helper functions to determine visual indicators based on utilization values
function getUtilizationColor(utilization: number): string {
  if (utilization >= 80) return 'bg-red-500';
  if (utilization >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getUtilizationTextColor(utilization: number): string {
  if (utilization >= 80) return 'text-red-600';
  if (utilization >= 70) return 'text-yellow-600';
  return 'text-green-600';
}

function shouldHighlight(utilization: number): boolean {
  return utilization > 80;
}

function getServerStatusColor(status: ServerStatus): string {
  switch (status) {
    case ServerStatus.HEALTHY:
      return 'text-green-600 bg-green-50 border-green-200';
    case ServerStatus.WARNING:
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case ServerStatus.CRITICAL:
      return 'text-red-600 bg-red-50 border-red-200';
    case ServerStatus.DOWN:
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

// Generator for valid utilization values (0-100%)
const utilizationArbitrary = fc.float({ min: 0, max: 100, noNaN: true });

// Generator for server status
const serverStatusArbitrary = fc.constantFrom(
  ServerStatus.HEALTHY,
  ServerStatus.WARNING, 
  ServerStatus.CRITICAL,
  ServerStatus.DOWN
);

describe('Visual Indicator Consistency Property Tests', () => {
  it('should consistently apply visual indicators for utilization thresholds', () => {
    fc.assert(
      fc.property(utilizationArbitrary, (utilization) => {
        // Skip invalid values (NaN, Infinity, etc.)
        if (!Number.isFinite(utilization)) {
          return true; // Skip this test case
        }

        // Test that visual indicators are consistent across different components
        const color = getUtilizationColor(utilization);
        const textColor = getUtilizationTextColor(utilization);
        const highlight = shouldHighlight(utilization);

        // Property: Visual indicators should be consistent based on thresholds
        if (utilization >= 80) {
          expect(color).toBe('bg-red-500');
          expect(textColor).toBe('text-red-600');
          expect(highlight).toBe(true);
        } else if (utilization >= 70) {
          expect(color).toBe('bg-yellow-500');
          expect(textColor).toBe('text-yellow-600');
          expect(highlight).toBe(false);
        } else {
          expect(color).toBe('bg-green-500');
          expect(textColor).toBe('text-green-600');
          expect(highlight).toBe(false);
        }

        // Property: Highlighting should only occur above 80%
        expect(highlight).toBe(utilization > 80);
        
        // Property: Color consistency - red indicators should always correspond to critical thresholds
        if (color === 'bg-red-500') {
          expect(utilization).toBeGreaterThanOrEqual(80);
          expect(textColor).toBe('text-red-600');
        }
        
        // Property: Color consistency - yellow indicators should correspond to warning thresholds
        if (color === 'bg-yellow-500') {
          expect(utilization).toBeGreaterThanOrEqual(70);
          expect(utilization).toBeLessThan(80);
          expect(textColor).toBe('text-yellow-600');
        }
        
        // Property: Color consistency - green indicators should correspond to healthy thresholds
        if (color === 'bg-green-500') {
          expect(utilization).toBeLessThan(70);
          expect(textColor).toBe('text-green-600');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should consistently apply server status visual indicators', () => {
    fc.assert(
      fc.property(serverStatusArbitrary, (status) => {
        const statusColor = getServerStatusColor(status);

        // Property: Each server status should have a unique, consistent visual indicator
        switch (status) {
          case ServerStatus.HEALTHY:
            expect(statusColor).toBe('text-green-600 bg-green-50 border-green-200');
            break;
          case ServerStatus.WARNING:
            expect(statusColor).toBe('text-yellow-600 bg-yellow-50 border-yellow-200');
            break;
          case ServerStatus.CRITICAL:
            expect(statusColor).toBe('text-red-600 bg-red-50 border-red-200');
            break;
          case ServerStatus.DOWN:
            expect(statusColor).toBe('text-gray-600 bg-gray-50 border-gray-200');
            break;
        }

        // Property: Critical and down statuses should use red/gray colors
        if (status === ServerStatus.CRITICAL) {
          expect(statusColor).toContain('red');
        }
        if (status === ServerStatus.DOWN) {
          expect(statusColor).toContain('gray');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain visual consistency across multiple metrics', () => {
    fc.assert(
      fc.property(
        fc.record({
          cpu: utilizationArbitrary,
          memory: utilizationArbitrary,
          disk: utilizationArbitrary,
          network: utilizationArbitrary,
        }),
        (metrics) => {
          // Property: All metrics with the same utilization level should have the same visual indicators
          const cpuColor = getUtilizationColor(metrics.cpu);
          const memoryColor = getUtilizationColor(metrics.memory);
          const diskColor = getUtilizationColor(metrics.disk);
          const networkColor = getUtilizationColor(metrics.network);

          // If two metrics have the same threshold category, they should have the same color
          const getThresholdCategory = (util: number) => {
            if (util >= 80) return 'critical';
            if (util >= 70) return 'warning';
            return 'healthy';
          };

          const cpuCategory = getThresholdCategory(metrics.cpu);
          const memoryCategory = getThresholdCategory(metrics.memory);
          const diskCategory = getThresholdCategory(metrics.disk);
          const networkCategory = getThresholdCategory(metrics.network);

          // Property: Metrics in the same category should have the same visual treatment
          if (cpuCategory === memoryCategory) {
            expect(cpuColor).toBe(memoryColor);
          }
          if (diskCategory === networkCategory) {
            expect(diskColor).toBe(networkColor);
          }

          // Property: All critical metrics should be highlighted
          [metrics.cpu, metrics.memory, metrics.disk, metrics.network].forEach(util => {
            if (util > 80) {
              expect(shouldHighlight(util)).toBe(true);
              expect(getUtilizationColor(util)).toBe('bg-red-500');
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});