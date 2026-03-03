import { describe, it, expect } from 'vitest';
import QAWidget from './QAWidget';
import QATestCoverageCard from './QATestCoverageCard';
import QADefectRatesDisplay from './QADefectRatesDisplay';
import QAReleaseQualityMetrics from './QAReleaseQualityMetrics';
import QATestingEfficiency from './QATestingEfficiency';
import QAQualityGateStatus from './QAQualityGateStatus';
import QADashboard from './QADashboard';
import { MockDataGenerator } from '../../mock/MockDataGenerator';

describe('QA Components', () => {
  const mockGenerator = new MockDataGenerator();
  const mockQAMetrics = mockGenerator.generateQAMetrics();

  it('should import QA components without errors', () => {
    expect(QAWidget).toBeDefined();
    expect(QATestCoverageCard).toBeDefined();
    expect(QADefectRatesDisplay).toBeDefined();
    expect(QAReleaseQualityMetrics).toBeDefined();
    expect(QATestingEfficiency).toBeDefined();
    expect(QAQualityGateStatus).toBeDefined();
    expect(QADashboard).toBeDefined();
  });

  it('should generate QA metrics without errors', () => {
    expect(mockQAMetrics).toBeDefined();
    expect(Array.isArray(mockQAMetrics)).toBe(true);
    expect(mockQAMetrics.length).toBeGreaterThan(0);
  });

  it('should have valid QA metrics structure', () => {
    const metric = mockQAMetrics[0];
    expect(metric).toHaveProperty('projectId');
    expect(metric).toHaveProperty('projectName');
    expect(metric).toHaveProperty('testCoverage');
    expect(metric).toHaveProperty('defectRates');
    expect(metric).toHaveProperty('releaseQuality');
    expect(metric).toHaveProperty('testingEfficiency');
    expect(metric).toHaveProperty('qualityGates');
    expect(metric).toHaveProperty('timestamp');
  });

  it('should have valid test coverage structure', () => {
    const coverage = mockQAMetrics[0].testCoverage;
    expect(coverage).toHaveProperty('overallPercentage');
    expect(coverage).toHaveProperty('unitTestCoverage');
    expect(coverage).toHaveProperty('integrationTestCoverage');
    expect(coverage).toHaveProperty('e2eTestCoverage');
    expect(coverage).toHaveProperty('codeQualityScore');
    expect(typeof coverage.overallPercentage).toBe('number');
  });

  it('should have valid defect rates structure', () => {
    const defects = mockQAMetrics[0].defectRates;
    expect(defects).toHaveProperty('bugsPerRelease');
    expect(defects).toHaveProperty('severityDistribution');
    expect(defects).toHaveProperty('averageResolutionTime');
    expect(defects).toHaveProperty('defectDensity');
    expect(defects).toHaveProperty('escapeRate');
    expect(typeof defects.bugsPerRelease).toBe('number');
  });

  it('should have valid quality gates structure', () => {
    const gates = mockQAMetrics[0].qualityGates;
    expect(Array.isArray(gates)).toBe(true);
    if (gates.length > 0) {
      const gate = gates[0];
      expect(gate).toHaveProperty('name');
      expect(gate).toHaveProperty('criteria');
      expect(gate).toHaveProperty('status');
      expect(gate).toHaveProperty('lastEvaluation');
    }
  });
});