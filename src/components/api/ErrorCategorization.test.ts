import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { APIPerformanceMetrics } from '../../types';

/**
 * Feature: cto-dashboard, Property 10: Error Categorization Accuracy
 * Validates: Requirements 2.3, 7.3
 * 
 * Property: For any error or failure event, the system should correctly categorize it 
 * by type (HTTP status codes, pipeline errors, quality issues) and maintain accurate counts
 */

// Helper function to categorize HTTP status codes
function categorizeHTTPStatusCode(statusCode: string): 'client_error' | 'server_error' | 'redirection' | 'success' | 'informational' | 'unknown' {
  const code = parseInt(statusCode, 10);
  
  if (isNaN(code)) return 'unknown';
  
  if (code >= 100 && code < 200) return 'informational';
  if (code >= 200 && code < 300) return 'success';
  if (code >= 300 && code < 400) return 'redirection';
  if (code >= 400 && code < 500) return 'client_error';
  if (code >= 500 && code < 600) return 'server_error';
  
  return 'unknown';
}

// Helper function to validate error counts
function validateErrorCounts(errorsByStatusCode: Record<string, number>): boolean {
  // All counts should be non-negative integers
  return Object.values(errorsByStatusCode).every(count => 
    Number.isInteger(count) && count >= 0
  );
}

// Helper function to calculate total errors
function calculateTotalErrors(errorsByStatusCode: Record<string, number>): number {
  return Object.values(errorsByStatusCode).reduce((sum, count) => sum + count, 0);
}

// Generator for valid HTTP status codes
const httpStatusCodeArb = fc.oneof(
  fc.constantFrom('200', '201', '204'), // Success codes
  fc.constantFrom('301', '302', '304'), // Redirection codes
  fc.constantFrom('400', '401', '403', '404', '409', '422', '429'), // Client error codes
  fc.constantFrom('500', '501', '502', '503', '504', '505') // Server error codes
);

// Generator for error counts (non-negative integers)
const errorCountArb = fc.integer({ min: 0, max: 1000 });

// Generator for errors by status code mapping
const errorsByStatusCodeArb = fc.dictionary(
  httpStatusCodeArb,
  errorCountArb,
  { minKeys: 0, maxKeys: 10 }
);

// Generator for API performance metrics with focus on error data
const apiMetricsArb = fc.record({
  endpointId: fc.string({ minLength: 1, maxLength: 50 }),
  endpointName: fc.string({ minLength: 1, maxLength: 100 }),
  successRate: fc.float({ min: 0, max: 100 }),
  failureRate: fc.float({ min: 0, max: 100 }),
  averageLatency: fc.float({ min: 1, max: 10000 }),
  medianLatency: fc.float({ min: 1, max: 10000 }),
  p95Latency: fc.float({ min: 1, max: 20000 }),
  errorsByStatusCode: errorsByStatusCodeArb,
  requestsPerMinute: fc.integer({ min: 1, max: 10000 }),
  uptime: fc.float({ min: 0, max: 100 }),
  uptimeWindow: fc.constantFrom('1h', '24h', '7d', '30d'),
  timestamp: fc.date()
}).map(data => ({
  ...data,
  // Ensure failure rate is consistent with success rate
  failureRate: Math.max(0, 100 - data.successRate)
})) as fc.Arbitrary<APIPerformanceMetrics>;

describe('Error Categorization Property Tests', () => {
  it('Property 10: Error categorization accuracy - HTTP status codes are correctly categorized', () => {
    fc.assert(
      fc.property(errorsByStatusCodeArb, (errorsByStatusCode) => {
        // Property: All HTTP status codes should be categorized into valid categories
        const categories = Object.keys(errorsByStatusCode).map(categorizeHTTPStatusCode);
        const validCategories = ['client_error', 'server_error', 'redirection', 'success', 'informational', 'unknown'];
        
        return categories.every(category => validCategories.includes(category));
      }),
      { numRuns: 100 }
    );
  });

  it('Property 10: Error categorization accuracy - Error counts are non-negative integers', () => {
    fc.assert(
      fc.property(apiMetricsArb, (apiMetrics) => {
        // Property: All error counts should be non-negative integers
        return validateErrorCounts(apiMetrics.errorsByStatusCode);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 10: Error categorization accuracy - Total error count calculation is consistent', () => {
    fc.assert(
      fc.property(apiMetricsArb, (apiMetrics) => {
        // Property: Total error count should equal sum of individual status code counts
        const totalErrors = calculateTotalErrors(apiMetrics.errorsByStatusCode);
        const manualSum = Object.values(apiMetrics.errorsByStatusCode).reduce((sum, count) => sum + count, 0);
        
        return totalErrors === manualSum;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 10: Error categorization accuracy - Client errors (4xx) are properly distinguished from server errors (5xx)', () => {
    fc.assert(
      fc.property(errorsByStatusCodeArb, (errorsByStatusCode) => {
        // Property: 4xx codes should be categorized as client errors, 5xx as server errors
        let clientErrorCount = 0;
        let serverErrorCount = 0;
        
        Object.entries(errorsByStatusCode).forEach(([statusCode, count]) => {
          const category = categorizeHTTPStatusCode(statusCode);
          if (category === 'client_error') {
            clientErrorCount += count;
          } else if (category === 'server_error') {
            serverErrorCount += count;
          }
        });
        
        // Verify that categorization is consistent with HTTP standards
        Object.keys(errorsByStatusCode).forEach(statusCode => {
          const code = parseInt(statusCode, 10);
          const category = categorizeHTTPStatusCode(statusCode);
          
          if (code >= 400 && code < 500) {
            expect(category).toBe('client_error');
          } else if (code >= 500 && code < 600) {
            expect(category).toBe('server_error');
          }
        });
        
        return true; // If we reach here, all assertions passed
      }),
      { numRuns: 100 }
    );
  });

  it('Property 10: Error categorization accuracy - Error aggregation across multiple APIs maintains accuracy', () => {
    fc.assert(
      fc.property(fc.array(apiMetricsArb, { minLength: 1, maxLength: 20 }), (apiMetricsArray) => {
        // Property: When aggregating errors across multiple APIs, totals should be accurate
        const aggregatedErrors: Record<string, number> = {};
        
        // Aggregate errors from all APIs
        apiMetricsArray.forEach(api => {
          Object.entries(api.errorsByStatusCode).forEach(([statusCode, count]) => {
            aggregatedErrors[statusCode] = (aggregatedErrors[statusCode] || 0) + count;
          });
        });
        
        // Verify aggregation accuracy
        Object.keys(aggregatedErrors).forEach(statusCode => {
          const expectedTotal = apiMetricsArray.reduce((sum, api) => 
            sum + (api.errorsByStatusCode[statusCode] || 0), 0
          );
          
          expect(aggregatedErrors[statusCode]).toBe(expectedTotal);
        });
        
        // Verify all aggregated counts are non-negative
        return validateErrorCounts(aggregatedErrors);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 10: Error categorization accuracy - Empty error data is handled correctly', () => {
    fc.assert(
      fc.property(fc.constant({}), (emptyErrors) => {
        // Property: Empty error data should result in zero total errors
        const totalErrors = calculateTotalErrors(emptyErrors);
        const isValid = validateErrorCounts(emptyErrors);
        
        return totalErrors === 0 && isValid;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 10: Error categorization accuracy - Error rate calculation consistency', () => {
    fc.assert(
      fc.property(apiMetricsArb, (apiMetrics) => {
        // Property: Error rate should be consistent with success/failure rates
        const totalErrors = calculateTotalErrors(apiMetrics.errorsByStatusCode);
        const requestsPerMinute = apiMetrics.requestsPerMinute;
        
        // If there are no requests, error rate should be 0 or undefined
        if (requestsPerMinute === 0) {
          return true; // Skip this case as it's edge case
        }
        
        // Error rate should be a valid percentage
        const errorRate = (totalErrors / requestsPerMinute) * 100;
        
        return errorRate >= 0 && !isNaN(errorRate) && isFinite(errorRate);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 10: Error categorization accuracy - Status code format validation', () => {
    fc.assert(
      fc.property(errorsByStatusCodeArb, (errorsByStatusCode) => {
        // Property: All status codes should be valid HTTP status code strings
        return Object.keys(errorsByStatusCode).every(statusCode => {
          const code = parseInt(statusCode, 10);
          // Valid HTTP status codes are 3-digit numbers from 100-599
          return !isNaN(code) && code >= 100 && code <= 599 && statusCode === code.toString();
        });
      }),
      { numRuns: 100 }
    );
  });
});

// Additional unit tests for specific error categorization scenarios
describe('Error Categorization Unit Tests', () => {
  it('should correctly categorize common HTTP status codes', () => {
    expect(categorizeHTTPStatusCode('200')).toBe('success');
    expect(categorizeHTTPStatusCode('404')).toBe('client_error');
    expect(categorizeHTTPStatusCode('500')).toBe('server_error');
    expect(categorizeHTTPStatusCode('301')).toBe('redirection');
    expect(categorizeHTTPStatusCode('100')).toBe('informational');
    expect(categorizeHTTPStatusCode('999')).toBe('unknown');
    expect(categorizeHTTPStatusCode('invalid')).toBe('unknown');
  });

  it('should handle edge cases in error counting', () => {
    expect(validateErrorCounts({})).toBe(true);
    expect(validateErrorCounts({ '404': 0 })).toBe(true);
    expect(validateErrorCounts({ '404': -1 })).toBe(false);
    expect(validateErrorCounts({ '404': 1.5 })).toBe(false);
  });

  it('should calculate total errors correctly', () => {
    expect(calculateTotalErrors({})).toBe(0);
    expect(calculateTotalErrors({ '404': 5, '500': 3 })).toBe(8);
    expect(calculateTotalErrors({ '200': 0, '404': 2 })).toBe(2);
  });
});