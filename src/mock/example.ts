import { MockDataGenerator } from './MockDataGenerator';

// Example usage of the MockDataGenerator
const generator = new MockDataGenerator();

// Generate all metrics for the dashboard
const allMetrics = generator.generateAllMetrics();

console.log('Generated Mock Data:');
console.log('Infrastructure Servers:', allMetrics.infrastructure.length);
console.log('API Endpoints:', allMetrics.apiPerformance.length);
console.log('Applications:', allMetrics.appPerformance.length);
console.log('Business Units:', allMetrics.businessCost.length);
console.log('AI Models:', allMetrics.aiMetrics.length);
console.log('QA Projects:', allMetrics.qaMetrics.length);
console.log('Analytics Pipelines:', allMetrics.businessAnalytics.length);
console.log('Data Sources:', allMetrics.dataIntegration.length);
console.log('Active Alerts:', allMetrics.alerts.length);

// Example of activating a scenario
const scenarios = generator.getPredefinedScenarios();
console.log('\nAvailable Scenarios:');
scenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}: ${scenario.description}`);
});

// Activate high load scenario
generator.activateScenario(scenarios[1]); // High Load Event
console.log('\nActivated High Load Event scenario');

// Generate metrics with scenario effects
const scenarioMetrics = generator.generateAllMetrics();
console.log('Metrics generated with High Load scenario active');

// Example of time series generation
const timeSeries = generator.generateTimeSeries(50, 0.2, 0.1, 24, true);
console.log('\nTime Series (24 hours with seasonality):', timeSeries.slice(0, 5), '...');

// Example of correlated metrics
const cpuData = [45, 67, 23, 89, 34];
const memoryData = generator.generateCorrelatedMetrics(cpuData, 0.8);
console.log('\nCorrelated Metrics:');
console.log('CPU:', cpuData);
console.log('Memory (correlated):', memoryData);

export { generator, allMetrics };