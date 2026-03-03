import { describe, it, expect } from 'vitest';
import { MockDataGenerator } from '../../mock/MockDataGenerator';

describe('AI Components Import Test', () => {
  it('should be able to import AI components without errors', async () => {
    // Test that we can import all AI components
    const { default: AIWidget } = await import('./AIWidget');
    const { default: AIModelPerformanceCard } = await import('./AIModelPerformanceCard');
    const { default: AITrainingCostDisplay } = await import('./AITrainingCostDisplay');
    const { default: AIDeploymentMetrics } = await import('./AIDeploymentMetrics');
    const { default: AIResourceUtilization } = await import('./AIResourceUtilization');
    const { default: AIPerformanceAlerts } = await import('./AIPerformanceAlerts');
    const { default: AIDashboard } = await import('./AIDashboard');

    expect(AIWidget).toBeDefined();
    expect(AIModelPerformanceCard).toBeDefined();
    expect(AITrainingCostDisplay).toBeDefined();
    expect(AIDeploymentMetrics).toBeDefined();
    expect(AIResourceUtilization).toBeDefined();
    expect(AIPerformanceAlerts).toBeDefined();
    expect(AIDashboard).toBeDefined();
  });

  it('should generate AI metrics without errors', () => {
    const mockGenerator = new MockDataGenerator();
    const aiMetrics = mockGenerator.generateAIMetrics();
    
    expect(aiMetrics).toBeDefined();
    expect(Array.isArray(aiMetrics)).toBe(true);
    expect(aiMetrics.length).toBeGreaterThan(0);
    
    // Check that each metric has required properties
    aiMetrics.forEach(metric => {
      expect(metric.modelId).toBeDefined();
      expect(metric.modelName).toBeDefined();
      expect(metric.accuracy).toBeGreaterThanOrEqual(0);
      expect(metric.accuracy).toBeLessThanOrEqual(1);
      expect(metric.inferenceTime).toBeGreaterThan(0);
      expect(metric.driftScore).toBeGreaterThanOrEqual(0);
      expect(metric.status).toBeDefined();
      expect(metric.trainingCosts).toBeDefined();
      expect(metric.deploymentMetrics).toBeDefined();
      expect(metric.resourceUtilization).toBeDefined();
      expect(metric.performanceAnomalies).toBeDefined();
    });
  });

  it('should have proper AI metric structure for dashboard display', () => {
    const mockGenerator = new MockDataGenerator();
    const aiMetrics = mockGenerator.generateAIMetrics();
    
    const deployedModels = aiMetrics.filter(m => m.status === 'deployed');
    const averageAccuracy = aiMetrics.reduce((sum, m) => sum + m.accuracy, 0) / aiMetrics.length;
    const totalAnomalies = aiMetrics.reduce((sum, m) => sum + m.performanceAnomalies.filter(a => !a.resolved).length, 0);
    
    expect(deployedModels.length).toBeGreaterThanOrEqual(0);
    expect(averageAccuracy).toBeGreaterThan(0);
    expect(averageAccuracy).toBeLessThanOrEqual(1);
    expect(totalAnomalies).toBeGreaterThanOrEqual(0);
  });
});