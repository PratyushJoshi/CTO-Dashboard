// Core metric types based on the design document
export interface Metric {
  id: string;
  name: string;
  type: MetricType;
  value: number;
  unit: string;
  timestamp: Date;
  source: string;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

export enum MetricType {
  INFRASTRUCTURE = 'infrastructure',
  API_PERFORMANCE = 'api_performance',
  APP_PERFORMANCE = 'app_performance',
  BUSINESS_COST = 'business_cost',
  AI_METRICS = 'ai_metrics',
  QA_METRICS = 'qa_metrics',
  ANALYTICS = 'analytics'
}

// Infrastructure Metrics (Requirements 1.1, 1.2, 1.3, 1.4, 1.5)
export interface InfrastructureMetrics {
  serverId: string;
  serverName: string;
  cpuUtilization: number; // percentage 0-100
  memoryUtilization: number; // percentage 0-100
  diskUtilization: number; // percentage 0-100
  networkUtilization: number; // percentage 0-100
  loadPercentage: number; // server load percentage
  status: ServerStatus;
  uptime: number; // hours
  apiTrafficCount: number; // number of running APIs
  trafficVolume: number; // requests per minute
  timestamp: Date;
}

export enum ServerStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  DOWN = 'down'
}

// API Performance Metrics (Requirements 2.1, 2.2, 2.3, 2.4, 2.5)
export interface APIPerformanceMetrics {
  endpointId: string;
  endpointName: string;
  successRate: number; // percentage 0-100
  failureRate: number; // percentage 0-100
  averageLatency: number; // milliseconds
  medianLatency: number; // milliseconds
  p95Latency: number; // 95th percentile latency in milliseconds
  errorsByStatusCode: Record<string, number>; // HTTP status code -> count
  requestsPerMinute: number;
  uptime: number; // percentage 0-100
  uptimeWindow: string; // rolling time window description
  timestamp: Date;
}

// Application Performance Metrics (Requirements 3.1, 3.2, 3.3, 3.4, 3.5)
export interface AppPerformanceMetrics {
  applicationId: string;
  applicationName: string;
  crashRatePerHour: number; // crashes per hour
  averagePageLoadTime: number; // milliseconds
  screenLoadTimes: ScreenPerformance[];
  devicePerformance: DevicePerformance[];
  performanceTrends: PerformanceTrend[];
  thresholdBreaches: ThresholdBreach[];
  timestamp: Date;
}

export interface ScreenPerformance {
  screenName: string;
  loadTime: number; // milliseconds
  renderTime: number; // milliseconds
}

export interface DevicePerformance {
  deviceType: DeviceType;
  networkCondition: NetworkCondition;
  averageLoadTime: number; // milliseconds
  performanceScore: number; // 0-100
}

export enum DeviceType {
  DESKTOP = 'desktop',
  TABLET = 'tablet',
  MOBILE = 'mobile'
}

export enum NetworkCondition {
  FAST_3G = 'fast_3g',
  SLOW_3G = 'slow_3g',
  WIFI = 'wifi',
  ETHERNET = 'ethernet'
}

export interface PerformanceTrend {
  period: DateRange;
  averagePerformance: number;
  trend: TrendDirection;
}

export enum TrendDirection {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DEGRADING = 'degrading'
}

export interface ThresholdBreach {
  metricName: string;
  threshold: number;
  actualValue: number;
  severity: AlertSeverity;
  timestamp: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  metricType: MetricType;
  condition: AlertCondition;
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  notificationChannels: string[];
  escalationPolicy?: EscalationPolicy;
}

export interface AlertCondition {
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  timeWindow: number; // minutes
  consecutiveBreaches: number;
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface EscalationPolicy {
  id: string;
  name: string;
  steps: EscalationStep[];
}

export interface EscalationStep {
  delayMinutes: number;
  notificationChannels: string[];
}

export interface DashboardConfig {
  id: string;
  userId: string;
  name: string;
  layout: WidgetLayout[];
  filters: DashboardFilter[];
  refreshInterval: number;
  isDefault: boolean;
}

export interface WidgetLayout {
  id: string;
  type: WidgetType;
  position: { x: number; y: number; width: number; height: number };
  config: WidgetConfig;
}

export enum WidgetType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  GAUGE = 'gauge',
  TABLE = 'table',
  METRIC_CARD = 'metric_card'
}

export interface WidgetConfig {
  title: string;
  metricTypes: MetricType[];
  timeRange: string;
  refreshInterval: number;
  [key: string]: any;
}

export interface DashboardFilter {
  field: string;
  operator: string;
  value: any;
}

export interface CostMetric {
  businessUnit: 'fashion' | 'beauty' | 'superstore';
  costPerOrder: number;
  totalCost: number;
  orderVolume: number;
  period: DateRange;
  breakdown: CostBreakdown;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface CostBreakdown {
  infrastructure: number;
  api: number;
  thirdParty: number;
  other: number;
}

export interface CostOptimization {
  category: 'infrastructure' | 'api' | 'caching' | 'third_party';
  currentCost: number;
  potentialSavings: number;
  recommendation: string;
  implementationEffort: 'low' | 'medium' | 'high';
}

// Business Cost Analysis (Requirements 4.1, 4.2, 4.3, 4.4, 4.5)
export interface BusinessCostMetrics {
  businessUnit: BusinessUnit;
  costPerOrder: number; // dollars
  totalCost: number; // dollars
  orderVolume: number;
  period: DateRange;
  costBreakdown: CostBreakdown;
  monthlyTrends: MonthlyCostTrend[];
  optimizationOpportunities: CostOptimization[];
  apiImprovementSuggestions: APIImprovement[];
  thirdPartyAnalysis: ThirdPartyAnalysis[];
  timestamp: Date;
}

export enum BusinessUnit {
  FASHION = 'fashion',
  BEAUTY = 'beauty',
  SUPERSTORE = 'superstore'
}

export interface MonthlyCostTrend {
  month: string; // YYYY-MM format
  costPerOrder: number;
  totalCost: number;
  orderVolume: number;
  trendIndicator: TrendDirection;
}

export interface APIImprovement {
  apiName: string;
  currentCost: number;
  estimatedSavings: number;
  suggestion: string;
  costImpact: number; // percentage reduction
}

export interface ThirdPartyAnalysis {
  serviceName: string;
  currentCost: number;
  alternatives: ThirdPartyAlternative[];
  recommendation: string;
}

export interface ThirdPartyAlternative {
  name: string;
  estimatedCost: number;
  costImpact: number; // percentage change (negative = savings)
  migrationEffort: 'low' | 'medium' | 'high';
}

// AI Department Metrics (Requirements 5.1, 5.2, 5.3, 5.4, 5.5)
export interface AIMetrics {
  modelId: string;
  modelName: string;
  version: string;
  accuracy: number; // 0-1
  inferenceTime: number; // milliseconds
  driftScore: number; // 0-1, higher = more drift
  status: AIModelStatus;
  trainingCosts: TrainingCost[];
  deploymentMetrics: DeploymentMetrics;
  resourceUtilization: AIResourceUtilization;
  performanceAnomalies: PerformanceAnomaly[];
  timestamp: Date;
}

export enum AIModelStatus {
  TRAINING = 'training',
  DEPLOYED = 'deployed',
  DEPRECATED = 'deprecated',
  FAILED = 'failed'
}

export interface TrainingCost {
  sessionId: string;
  computeCost: number; // dollars
  duration: number; // hours
  resourcesUsed: string;
  timestamp: Date;
}

export interface DeploymentMetrics {
  deploymentId: string;
  successRate: number; // percentage 0-100
  rollbackFrequency: number; // rollbacks per deployment
  deploymentTime: number; // minutes
  lastDeployment: Date;
}

export interface AIResourceUtilization {
  gpuUsage: number; // percentage 0-100
  trainingQueueLength: number;
  servingCapacity: number; // requests per second
  monthlyBudget: number; // dollars
  budgetUsed: number; // dollars
  budgetRemaining: number; // dollars
}

export interface PerformanceAnomaly {
  type: 'model_degradation' | 'resource_spike' | 'drift_detected';
  severity: AlertSeverity;
  description: string;
  detectedAt: Date;
  resolved: boolean;
}

// QA Department Metrics (Requirements 6.1, 6.2, 6.3, 6.4, 6.5)
export interface QAMetrics {
  projectId: string;
  projectName: string;
  testCoverage: TestCoverage;
  defectRates: DefectRates;
  releaseQuality: ReleaseQuality;
  testingEfficiency: TestingEfficiency;
  qualityGates: QualityGate[];
  timestamp: Date;
}

export interface TestCoverage {
  overallPercentage: number; // 0-100
  unitTestCoverage: number; // 0-100
  integrationTestCoverage: number; // 0-100
  e2eTestCoverage: number; // 0-100
  codeQualityScore: number; // 0-100
}

export interface DefectRates {
  bugsPerRelease: number;
  severityDistribution: Record<DefectSeverity, number>;
  averageResolutionTime: number; // hours
  defectDensity: number; // bugs per KLOC
  escapeRate: number; // percentage of bugs found in production
}

export enum DefectSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface ReleaseQuality {
  automatedTestPassRate: number; // percentage 0-100
  manualTestingCompletion: number; // percentage 0-100
  releaseReadinessScore: number; // 0-100
  qualityConcerns: string[];
  approvalStatus: ApprovalStatus;
}

export enum ApprovalStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
  CONDITIONAL = 'conditional'
}

export interface TestingEfficiency {
  testExecutionTime: number; // minutes
  flakyTestRate: number; // percentage 0-100
  resourceUtilization: number; // percentage 0-100
  automationRate: number; // percentage 0-100
  testMaintenanceTime: number; // hours per week
}

export interface QualityGate {
  name: string;
  criteria: QualityGateCriteria[];
  status: QualityGateStatus;
  lastEvaluation: Date;
}

export interface QualityGateCriteria {
  metric: string;
  threshold: number;
  actualValue: number;
  passed: boolean;
}

export enum QualityGateStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  WARNING = 'warning'
}

// Business Analytics Metrics (Requirements 7.1, 7.2, 7.3, 7.4, 7.5)
export interface BusinessAnalyticsMetrics {
  pipelineId: string;
  pipelineName: string;
  dataHealth: DataPipelineHealth;
  reportingPerformance: ReportingPerformance;
  pipelineErrors: PipelineError[];
  businessIntelligence: BusinessIntelligenceMetrics;
  analyticsInfrastructure: AnalyticsInfrastructure;
  timestamp: Date;
}

export interface DataPipelineHealth {
  successRate: number; // percentage 0-100
  dataFreshness: number; // minutes since last update
  processingLatency: number; // minutes
  recordsProcessed: number;
  dataQualityScore: number; // 0-100
}

export interface ReportingPerformance {
  reportGenerationTime: number; // seconds
  queryPerformance: QueryPerformance[];
  dashboardLoadTime: number; // seconds
  concurrentUsers: number;
  cacheHitRate: number; // percentage 0-100
}

export interface QueryPerformance {
  queryId: string;
  executionTime: number; // milliseconds
  complexity: QueryComplexity;
  resourceUsage: number; // CPU seconds
}

export enum QueryComplexity {
  SIMPLE = 'simple',
  MEDIUM = 'medium',
  COMPLEX = 'complex'
}

export interface PipelineError {
  errorId: string;
  category: PipelineErrorCategory;
  description: string;
  severity: AlertSeverity;
  occurredAt: Date;
  resolved: boolean;
}

export enum PipelineErrorCategory {
  DATA_QUALITY = 'data_quality',
  TRANSFORMATION_FAILURE = 'transformation_failure',
  CONNECTIVITY_PROBLEM = 'connectivity_problem',
  RESOURCE_EXHAUSTION = 'resource_exhaustion'
}

export interface BusinessIntelligenceMetrics {
  dataAccuracyScore: number; // 0-100
  reportUsageStatistics: ReportUsage[];
  userEngagementMetrics: UserEngagement;
  insightGenerationRate: number; // insights per day
}

export interface ReportUsage {
  reportName: string;
  viewCount: number;
  uniqueUsers: number;
  averageViewTime: number; // minutes
  lastAccessed: Date;
}

export interface UserEngagement {
  activeUsers: number;
  sessionDuration: number; // minutes
  interactionRate: number; // clicks per session
  retentionRate: number; // percentage 0-100
}

export interface AnalyticsInfrastructure {
  dataWarehouseUtilization: number; // percentage 0-100
  etlJobPerformance: ETLJobPerformance[];
  storageCosts: StorageCost[];
  computeResourceUsage: number; // percentage 0-100
}

export interface ETLJobPerformance {
  jobName: string;
  executionTime: number; // minutes
  successRate: number; // percentage 0-100
  resourceConsumption: number; // CPU hours
  lastRun: Date;
}

export interface StorageCost {
  storageType: 'hot' | 'warm' | 'cold' | 'archive';
  sizeGB: number;
  monthlyCost: number; // dollars
  growthRate: number; // percentage per month
}

// Data Integration Layer (Requirements 8.1, 8.2, 8.3, 8.4, 8.5)
export interface DataIntegrationMetrics {
  sourceId: string;
  sourceName: string;
  sourceType: DataSourceType;
  connectionStatus: ConnectionStatus;
  dataQuality: DataQualityMetrics;
  aggregationMetrics: DataAggregationMetrics;
  realTimeMetrics: RealTimeMetrics;
  faultTolerance: FaultToleranceMetrics;
  timestamp: Date;
}

export enum DataSourceType {
  INFRASTRUCTURE_MONITORING = 'infrastructure_monitoring',
  APM_SYSTEM = 'apm_system',
  BUSINESS_INTELLIGENCE = 'business_intelligence',
  AI_PLATFORM = 'ai_platform',
  QA_TOOLS = 'qa_tools',
  ANALYTICS_SYSTEM = 'analytics_system'
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  DEGRADED = 'degraded',
  RECONNECTING = 'reconnecting'
}

export interface DataQualityMetrics {
  validationScore: number; // 0-100
  missingDataPercentage: number; // 0-100
  corruptedDataCount: number;
  duplicateDataCount: number;
  schemaComplianceScore: number; // 0-100
}

export interface DataAggregationMetrics {
  metricsAggregated: number;
  timestampConsistency: number; // percentage 0-100
  aggregationLatency: number; // milliseconds
  dataLossPercentage: number; // 0-100
}

export interface RealTimeMetrics {
  updateFrequency: number; // seconds
  criticalMetricLatency: number; // seconds
  refreshPerformance: number; // updates per second
  realTimeDataPoints: number;
}

export interface FaultToleranceMetrics {
  cachedDataAvailability: number; // percentage 0-100
  failoverTime: number; // seconds
  dataRecoveryTime: number; // minutes
  serviceAvailability: number; // percentage 0-100
}

// Alert System (Requirements 9.1, 9.2, 9.3, 9.4, 9.5)
export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  metricType: MetricType;
  severity: AlertSeverity;
  status: AlertStatus;
  triggeredAt: Date;
  resolvedAt?: Date;
  message: string;
  details: AlertDetails;
  notifications: AlertNotification[];
  escalation?: AlertEscalation;
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed'
}

export interface AlertDetails {
  metricName: string;
  currentValue: number;
  threshold: number;
  condition: string;
  affectedResources: string[];
  recommendedActions: string[];
}

export interface AlertNotification {
  id: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  sentAt: Date;
  deliveredAt?: Date;
  retryCount: number;
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  IN_DASHBOARD = 'in_dashboard',
  WEBHOOK = 'webhook',
  SLACK = 'slack'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETRYING = 'retrying'
}

export interface AlertEscalation {
  currentStep: number;
  totalSteps: number;
  nextEscalationAt?: Date;
  escalationHistory: EscalationEvent[];
}

export interface EscalationEvent {
  step: number;
  escalatedAt: Date;
  notificationChannels: NotificationChannel[];
  recipients: string[];
}

// Interactive Dashboard Features (Requirements 10.1, 10.2, 10.3, 10.4, 10.5)
export interface InteractiveDashboard {
  id: string;
  name: string;
  userId: string;
  widgets: InteractiveWidget[];
  filters: DashboardFilter[];
  timeRange: TimeRange;
  refreshInterval: number;
  isShared: boolean;
  shareSettings?: ShareSettings;
  lastModified: Date;
}

export interface InteractiveWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  config: InteractiveWidgetConfig;
  interactions: WidgetInteraction[];
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
}

export interface InteractiveWidgetConfig extends WidgetConfig {
  zoomEnabled: boolean;
  filterEnabled: boolean;
  drillDownEnabled: boolean;
  exportEnabled: boolean;
  comparisonEnabled: boolean;
}

export interface WidgetInteraction {
  type: InteractionType;
  enabled: boolean;
  config?: Record<string, any>;
}

export enum InteractionType {
  ZOOM = 'zoom',
  FILTER = 'filter',
  DRILL_DOWN = 'drill_down',
  TIME_RANGE_SELECTION = 'time_range_selection',
  COMPARISON = 'comparison',
  EXPORT = 'export'
}

export interface TimeRange {
  start: Date;
  end: Date;
  preset?: TimeRangePreset;
}

export enum TimeRangePreset {
  LAST_HOUR = 'last_hour',
  LAST_24_HOURS = 'last_24_hours',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  CUSTOM = 'custom'
}

export interface ShareSettings {
  isPublic: boolean;
  allowedUsers: string[];
  permissions: SharePermission[];
  expiresAt?: Date;
}

export interface SharePermission {
  userId: string;
  permission: PermissionLevel;
}

export enum PermissionLevel {
  VIEW = 'view',
  EDIT = 'edit',
  ADMIN = 'admin'
}

export interface ExportOptions {
  format: ExportFormat;
  includeFilters: boolean;
  includeTimeRange: boolean;
  includeMetadata: boolean;
}

export enum ExportFormat {
  CSV = 'csv',
  PDF = 'pdf',
  EXCEL = 'excel',
  JSON = 'json'
}

// Comparison and Analysis Features
export interface ComparisonAnalysis {
  id: string;
  name: string;
  type: ComparisonType;
  subjects: ComparisonSubject[];
  metrics: string[];
  timeRanges: TimeRange[];
  results: ComparisonResult[];
  createdAt: Date;
}

export enum ComparisonType {
  TIME_PERIOD = 'time_period',
  DEPARTMENT = 'department',
  BUSINESS_UNIT = 'business_unit',
  METRIC_TYPE = 'metric_type'
}

export interface ComparisonSubject {
  id: string;
  name: string;
  type: string;
  metadata: Record<string, any>;
}

export interface ComparisonResult {
  metric: string;
  subjects: Record<string, number>;
  variance: number;
  trend: TrendDirection;
  significance: StatisticalSignificance;
}

export enum StatisticalSignificance {
  NOT_SIGNIFICANT = 'not_significant',
  MARGINALLY_SIGNIFICANT = 'marginally_significant',
  SIGNIFICANT = 'significant',
  HIGHLY_SIGNIFICANT = 'highly_significant'
}