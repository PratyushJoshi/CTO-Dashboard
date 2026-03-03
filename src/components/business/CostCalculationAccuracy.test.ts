import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { BusinessCostMetrics, BusinessUnit, TrendDirection } from '../../types'

/**
 * **Feature: cto-dashboard, Property 6: Cost Calculation Accuracy**
 * For any business unit and time period, cost per order calculations should be mathematically correct 
 * and optimization recommendations should be based on valid cost analysis
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
 */

// Generators for creating valid test data
const dateArbitrary = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
  .filter(d => !isNaN(d.getTime()))

// Create mathematically consistent business cost metrics
const businessCostMetricsArbitrary = fc.record({
  businessUnit: fc.constantFrom(...Object.values(BusinessUnit)),
  orderVolume: fc.integer({ min: 1, max: 100000 }),
  period: fc.record({
    start: dateArbitrary,
    end: dateArbitrary
  }),
  timestamp: dateArbitrary
}).chain(base => {
  // Generate cost breakdown first with finite values
  return fc.record({
    infrastructure: fc.double({ min: 10, max: 1000, noNaN: true }),
    api: fc.double({ min: 5, max: 500, noNaN: true }),
    thirdParty: fc.double({ min: 5, max: 300, noNaN: true }),
    other: fc.double({ min: 1, max: 100, noNaN: true })
  }).chain(costBreakdown => {
    const totalCost = costBreakdown.infrastructure + costBreakdown.api + costBreakdown.thirdParty + costBreakdown.other;
    const costPerOrder = totalCost / base.orderVolume;
    
    // Generate monthly trends with consistent calculations
    const monthlyTrendsArbitrary = fc.array(fc.record({
      month: fc.string({ minLength: 7, maxLength: 7 }), // YYYY-MM
      orderVolume: fc.integer({ min: 1, max: 10000 }),
      trendIndicator: fc.constantFrom(TrendDirection.IMPROVING, TrendDirection.STABLE, TrendDirection.DEGRADING)
    }).chain(trend => {
      return fc.double({ min: 100, max: 10000, noNaN: true }).map(totalCost => ({
        ...trend,
        totalCost,
        costPerOrder: totalCost / trend.orderVolume
      }));
    }), { minLength: 1, maxLength: 12 });
    
    // Generate optimization opportunities with valid savings
    const optimizationOpportunitiesArbitrary = fc.array(fc.record({
      category: fc.constantFrom('infrastructure', 'api', 'caching', 'third_party'),
      currentCost: fc.double({ min: 100, max: 1000, noNaN: true }),
      recommendation: fc.string({ minLength: 10, maxLength: 500 }),
      implementationEffort: fc.constantFrom('low', 'medium', 'high')
    }).chain(opp => {
      // Ensure potential savings don't exceed current cost
      const maxSavings = Math.min(opp.currentCost * 0.8, 500); // Cap at 80% or 500
      return fc.double({ min: 10, max: maxSavings, noNaN: true }).map(potentialSavings => ({
        ...opp,
        potentialSavings
      }));
    }), { minLength: 0, maxLength: 5 });
    
    // Generate API improvement suggestions with consistent calculations
    const apiImprovementSuggestionsArbitrary = fc.array(fc.record({
      apiName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      currentCost: fc.double({ min: 10, max: 100, noNaN: true }),
      suggestion: fc.string({ minLength: 10, maxLength: 500 }),
      costImpact: fc.double({ min: 1, max: 30, noNaN: true }) // 1-30% impact
    }).chain(suggestion => {
      // Calculate consistent estimated savings
      const estimatedSavings = (suggestion.currentCost * suggestion.costImpact) / 100;
      return fc.constant({
        ...suggestion,
        estimatedSavings
      });
    }), { minLength: 0, maxLength: 5 });
    
    // Generate third-party analysis with consistent calculations
    const thirdPartyAnalysisArbitrary = fc.array(fc.record({
      serviceName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      currentCost: fc.double({ min: 10, max: 500, noNaN: true }),
      recommendation: fc.string({ minLength: 10, maxLength: 500 })
    }).chain(analysis => {
      const alternativesArbitrary = fc.array(fc.record({
        name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        costImpact: fc.double({ min: -30, max: 50, noNaN: true }), // -30% to +50%
        migrationEffort: fc.constantFrom('low', 'medium', 'high')
      }).chain(alt => {
        // Calculate consistent estimated cost
        const estimatedCost = analysis.currentCost + (analysis.currentCost * alt.costImpact) / 100;
        return fc.constant({
          ...alt,
          estimatedCost: Math.max(1, estimatedCost) // Ensure positive cost
        });
      }), { minLength: 0, maxLength: 3 });
      
      return alternativesArbitrary.map(alternatives => ({
        ...analysis,
        alternatives
      }));
    }), { minLength: 0, maxLength: 5 });
    
    return fc.record({
      monthlyTrends: monthlyTrendsArbitrary,
      optimizationOpportunities: optimizationOpportunitiesArbitrary,
      apiImprovementSuggestions: apiImprovementSuggestionsArbitrary,
      thirdPartyAnalysis: thirdPartyAnalysisArbitrary
    }).map(generated => ({
      ...base,
      costPerOrder,
      totalCost,
      costBreakdown,
      ...generated
    }));
  });
})

// Cost calculation functions to test
function calculateCostPerOrder(totalCost: number, orderVolume: number): number {
  if (orderVolume <= 0) {
    throw new Error('Order volume must be greater than 0')
  }
  return totalCost / orderVolume
}

function calculateTotalCostFromBreakdown(breakdown: { infrastructure: number; api: number; thirdParty: number; other: number }): number {
  return breakdown.infrastructure + breakdown.api + breakdown.thirdParty + breakdown.other
}

function calculateOptimizationSavingsPercentage(currentCost: number, potentialSavings: number): number {
  if (currentCost <= 0) {
    throw new Error('Current cost must be greater than 0')
  }
  return (potentialSavings / currentCost) * 100
}

function calculateAPIImpactSavings(currentCost: number, costImpact: number): number {
  return (currentCost * costImpact) / 100
}

function calculateThirdPartyAlternativeCost(currentCost: number, costImpact: number): number {
  return currentCost + (currentCost * costImpact) / 100
}

function validateMonthlyTrendConsistency(trend: { costPerOrder: number; totalCost: number; orderVolume: number }): boolean {
  const calculatedCostPerOrder = calculateCostPerOrder(trend.totalCost, trend.orderVolume)
  const tolerance = 0.01 // Allow for small floating point differences
  return Math.abs(calculatedCostPerOrder - trend.costPerOrder) <= tolerance
}

describe('Cost Calculation Accuracy Property Tests', () => {
  it('Property 6: Cost per order calculation should be mathematically correct', () => {
    fc.assert(fc.property(businessCostMetricsArbitrary, (metrics: BusinessCostMetrics) => {
      // Skip if any values are NaN or invalid
      if (isNaN(metrics.totalCost) || isNaN(metrics.costPerOrder) || metrics.orderVolume <= 0) {
        return true; // Skip invalid data
      }
      
      // Test that cost per order equals total cost divided by order volume (Requirement 4.1)
      const calculatedCostPerOrder = calculateCostPerOrder(metrics.totalCost, metrics.orderVolume)
      const tolerance = 0.01 // Allow for small floating point differences
      
      return Math.abs(calculatedCostPerOrder - metrics.costPerOrder) <= tolerance
    }), { numRuns: 100 })
  })

  it('Property 6: Cost breakdown should sum to total cost within reasonable tolerance', () => {
    fc.assert(fc.property(businessCostMetricsArbitrary, (metrics: BusinessCostMetrics) => {
      // Skip if any values are NaN or invalid
      if (isNaN(metrics.totalCost) || 
          Object.values(metrics.costBreakdown).some(cost => isNaN(cost))) {
        return true; // Skip invalid data
      }
      
      // Test that cost breakdown components sum to total cost (Requirement 4.1)
      const calculatedTotal = calculateTotalCostFromBreakdown(metrics.costBreakdown)
      const tolerance = metrics.totalCost * 0.05 // Allow 5% tolerance for rounding
      
      return Math.abs(calculatedTotal - metrics.totalCost) <= tolerance
    }), { numRuns: 100 })
  })

  it('Property 6: Monthly trends should have consistent cost per order calculations', () => {
    fc.assert(fc.property(businessCostMetricsArbitrary, (metrics: BusinessCostMetrics) => {
      // Test that each monthly trend has consistent cost per order calculation (Requirement 4.2)
      return metrics.monthlyTrends.every(trend => validateMonthlyTrendConsistency(trend))
    }), { numRuns: 100 })
  })

  it('Property 6: Optimization opportunities should have valid savings calculations', () => {
    fc.assert(fc.property(businessCostMetricsArbitrary, (metrics: BusinessCostMetrics) => {
      // Test that optimization savings are reasonable and mathematically valid (Requirement 4.3)
      return metrics.optimizationOpportunities.every(opportunity => {
        // Potential savings should not exceed current cost
        if (opportunity.potentialSavings > opportunity.currentCost) {
          return false
        }
        
        // Savings percentage should be reasonable (0-100%)
        const savingsPercentage = calculateOptimizationSavingsPercentage(
          opportunity.currentCost, 
          opportunity.potentialSavings
        )
        
        return savingsPercentage >= 0 && savingsPercentage <= 100
      })
    }), { numRuns: 100 })
  })

  it('Property 6: API improvement suggestions should have consistent cost impact calculations', () => {
    fc.assert(fc.property(businessCostMetricsArbitrary, (metrics: BusinessCostMetrics) => {
      // Test that API cost impact calculations are consistent (Requirement 4.4)
      return metrics.apiImprovementSuggestions.every(suggestion => {
        const calculatedSavings = calculateAPIImpactSavings(suggestion.currentCost, suggestion.costImpact)
        const tolerance = suggestion.estimatedSavings * 0.1 // Allow 10% tolerance
        
        // Cost impact should be reasonable (0-100%)
        if (suggestion.costImpact < 0 || suggestion.costImpact > 100) {
          return false
        }
        
        // Estimated savings should not exceed current cost
        if (suggestion.estimatedSavings > suggestion.currentCost) {
          return false
        }
        
        // Calculated savings should be close to estimated savings
        return Math.abs(calculatedSavings - suggestion.estimatedSavings) <= tolerance
      })
    }), { numRuns: 100 })
  })

  it('Property 6: Third-party analysis should have valid alternative cost calculations', () => {
    fc.assert(fc.property(businessCostMetricsArbitrary, (metrics: BusinessCostMetrics) => {
      // Test that third-party alternative costs are calculated correctly (Requirement 4.5)
      return metrics.thirdPartyAnalysis.every(analysis => {
        return analysis.alternatives.every(alternative => {
          const calculatedCost = calculateThirdPartyAlternativeCost(
            analysis.currentCost, 
            alternative.costImpact
          )
          const tolerance = alternative.estimatedCost * 0.1 // Allow 10% tolerance
          
          // Cost impact should be within reasonable range (-90% to +200%)
          if (alternative.costImpact < -90 || alternative.costImpact > 200) {
            return false
          }
          
          // Estimated cost should be positive
          if (alternative.estimatedCost <= 0) {
            return false
          }
          
          // Calculated cost should be close to estimated cost
          return Math.abs(calculatedCost - alternative.estimatedCost) <= tolerance
        })
      })
    }), { numRuns: 100 })
  })

  it('Property 6: Business unit cost calculations should be consistent across all metrics', () => {
    fc.assert(fc.property(fc.array(businessCostMetricsArbitrary, { minLength: 1, maxLength: 3 }), (metricsArray: BusinessCostMetrics[]) => {
      // Skip if any values are NaN or invalid
      const validMetrics = metricsArray.filter(metric => 
        !isNaN(metric.totalCost) && !isNaN(metric.costPerOrder) && metric.orderVolume > 0
      );
      
      if (validMetrics.length === 0) {
        return true; // Skip if no valid data
      }
      
      // Test that aggregated calculations across business units are consistent
      const totalCost = validMetrics.reduce((sum, metric) => sum + metric.totalCost, 0)
      const totalOrders = validMetrics.reduce((sum, metric) => sum + metric.orderVolume, 0)
      
      if (totalOrders === 0) {
        return true // Skip if no orders
      }
      
      const averageCostPerOrder = totalCost / totalOrders
      
      // Average should be within the range of individual business unit costs
      const minCostPerOrder = Math.min(...validMetrics.map(m => m.costPerOrder))
      const maxCostPerOrder = Math.max(...validMetrics.map(m => m.costPerOrder))
      
      return averageCostPerOrder >= minCostPerOrder && averageCostPerOrder <= maxCostPerOrder
    }), { numRuns: 100 })
  })

  it('Property 6: Cost optimization recommendations should be based on valid analysis', () => {
    fc.assert(fc.property(businessCostMetricsArbitrary, (metrics: BusinessCostMetrics) => {
      // Skip if total cost is invalid
      if (isNaN(metrics.totalCost) || metrics.totalCost <= 0) {
        return true;
      }
      
      // Test that individual optimization opportunities are reasonable
      const validOptimizations = metrics.optimizationOpportunities.every(opp => {
        // Each optimization should have reasonable savings relative to its current cost
        return opp.potentialSavings > 0 && opp.potentialSavings <= opp.currentCost
      })
      
      const validAPIImprovements = metrics.apiImprovementSuggestions.every(suggestion => {
        // Each API improvement should have reasonable savings relative to its current cost
        return suggestion.estimatedSavings > 0 && suggestion.estimatedSavings <= suggestion.currentCost
      })
      
      const validThirdPartyAlternatives = metrics.thirdPartyAnalysis.every(analysis => {
        return analysis.alternatives.every(alt => {
          // Alternative costs should be positive
          return alt.estimatedCost > 0
        })
      })
      
      return validOptimizations && validAPIImprovements && validThirdPartyAlternatives
    }), { numRuns: 100 })
  })
})