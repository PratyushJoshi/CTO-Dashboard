/**
 * Vendor Integration Service
 * Handles connections to various monitoring and analytics vendors
 */

export enum VendorType {
  PROMETHEUS = 'prometheus',
  NEW_RELIC = 'new_relic',
  DATADOG = 'datadog',
  GRAFANA = 'grafana',
  SPLUNK = 'splunk',
  ELASTIC = 'elastic',
  CLOUDWATCH = 'cloudwatch',
  AZURE_MONITOR = 'azure_monitor',
  GOOGLE_CLOUD_MONITORING = 'google_cloud_monitoring',
  CUSTOM_API = 'custom_api'
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  ERROR = 'error',
  CONFIGURED = 'configured'
}

export interface VendorCredentials {
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  username?: string;
  password?: string;
  token?: string;
  region?: string;
  accountId?: string;
  customHeaders?: Record<string, string>;
}

export interface VendorConnection {
  id: string;
  vendorType: VendorType;
  name: string;
  description: string;
  credentials: VendorCredentials;
  status: ConnectionStatus;
  lastSync?: Date;
  dataTypes: string[];
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MetricData {
  timestamp: Date;
  metricName: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  source: string;
}

export interface VendorCapabilities {
  supportsRealTime: boolean;
  supportsHistorical: boolean;
  supportedMetrics: string[];
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  authentication: string[];
}

export class VendorIntegrationService {
  private connections: Map<string, VendorConnection> = new Map();
  private static instance: VendorIntegrationService;

  private constructor() {
    this.loadConnections();
  }

  static getInstance(): VendorIntegrationService {
    if (!VendorIntegrationService.instance) {
      VendorIntegrationService.instance = new VendorIntegrationService();
    }
    return VendorIntegrationService.instance;
  }

  /**
   * Get vendor capabilities
   */
  getVendorCapabilities(vendorType: VendorType): VendorCapabilities {
    const capabilities: Record<VendorType, VendorCapabilities> = {
      [VendorType.PROMETHEUS]: {
        supportsRealTime: true,
        supportsHistorical: true,
        supportedMetrics: ['cpu', 'memory', 'disk', 'network', 'custom'],
        rateLimit: { requestsPerMinute: 60, requestsPerHour: 3600 },
        authentication: ['basic', 'bearer_token']
      },
      [VendorType.NEW_RELIC]: {
        supportsRealTime: true,
        supportsHistorical: true,
        supportedMetrics: ['apm', 'infrastructure', 'browser', 'mobile', 'synthetics'],
        rateLimit: { requestsPerMinute: 100, requestsPerHour: 6000 },
        authentication: ['api_key']
      },
      [VendorType.DATADOG]: {
        supportsRealTime: true,
        supportsHistorical: true,
        supportedMetrics: ['infrastructure', 'apm', 'logs', 'rum', 'synthetics'],
        rateLimit: { requestsPerMinute: 300, requestsPerHour: 18000 },
        authentication: ['api_key', 'app_key']
      },
      [VendorType.GRAFANA]: {
        supportsRealTime: true,
        supportsHistorical: true,
        supportedMetrics: ['custom', 'prometheus', 'influxdb', 'elasticsearch'],
        rateLimit: { requestsPerMinute: 120, requestsPerHour: 7200 },
        authentication: ['api_key', 'basic']
      },
      [VendorType.SPLUNK]: {
        supportsRealTime: true,
        supportsHistorical: true,
        supportedMetrics: ['logs', 'metrics', 'traces', 'events'],
        rateLimit: { requestsPerMinute: 50, requestsPerHour: 3000 },
        authentication: ['bearer_token']
      },
      [VendorType.ELASTIC]: {
        supportsRealTime: true,
        supportsHistorical: true,
        supportedMetrics: ['logs', 'metrics', 'apm', 'uptime'],
        rateLimit: { requestsPerMinute: 200, requestsPerHour: 12000 },
        authentication: ['api_key', 'basic']
      },
      [VendorType.CLOUDWATCH]: {
        supportsRealTime: true,
        supportsHistorical: true,
        supportedMetrics: ['ec2', 'rds', 'lambda', 'custom'],
        rateLimit: { requestsPerMinute: 400, requestsPerHour: 24000 },
        authentication: ['aws_credentials']
      },
      [VendorType.AZURE_MONITOR]: {
        supportsRealTime: true,
        supportsHistorical: true,
        supportedMetrics: ['vm', 'app_service', 'sql', 'custom'],
        rateLimit: { requestsPerMinute: 300, requestsPerHour: 18000 },
        authentication: ['azure_credentials']
      },
      [VendorType.GOOGLE_CLOUD_MONITORING]: {
        supportsRealTime: true,
        supportsHistorical: true,
        supportedMetrics: ['compute', 'app_engine', 'cloud_sql', 'custom'],
        rateLimit: { requestsPerMinute: 300, requestsPerHour: 18000 },
        authentication: ['service_account']
      },
      [VendorType.CUSTOM_API]: {
        supportsRealTime: true,
        supportsHistorical: true,
        supportedMetrics: ['custom'],
        authentication: ['api_key', 'bearer_token', 'basic', 'oauth']
      }
    };

    return capabilities[vendorType];
  }

  /**
   * Create a new vendor connection
   */
  async createConnection(
    vendorType: VendorType,
    name: string,
    credentials: VendorCredentials,
    config: Record<string, any> = {}
  ): Promise<VendorConnection> {
    const connection: VendorConnection = {
      id: `${vendorType}-${Date.now()}`,
      vendorType,
      name,
      description: `${vendorType} integration`,
      credentials,
      status: ConnectionStatus.CONFIGURED,
      dataTypes: this.getVendorCapabilities(vendorType).supportedMetrics,
      config,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.connections.set(connection.id, connection);
    this.saveConnections();

    return connection;
  }

  /**
   * Test vendor connection
   */
  async testConnection(connectionId: string): Promise<{ success: boolean; message: string; latency?: number }> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return { success: false, message: 'Connection not found' };
    }

    const startTime = Date.now();

    try {
      // Simulate API call based on vendor type
      await this.simulateVendorApiCall(connection);
      
      const latency = Date.now() - startTime;
      
      connection.status = ConnectionStatus.CONNECTED;
      connection.lastSync = new Date();
      connection.updatedAt = new Date();
      this.saveConnections();

      return {
        success: true,
        message: 'Connection successful',
        latency
      };
    } catch (error) {
      connection.status = ConnectionStatus.ERROR;
      connection.updatedAt = new Date();
      this.saveConnections();

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  /**
   * Fetch metrics from vendor
   */
  async fetchMetrics(
    connectionId: string,
    metricNames: string[],
    startTime: Date,
    endTime: Date
  ): Promise<MetricData[]> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    if (connection.status !== ConnectionStatus.CONNECTED) {
      throw new Error('Connection is not active');
    }

    // Simulate fetching metrics
    return this.simulateFetchMetrics(connection, metricNames, startTime, endTime);
  }

  /**
   * Get all connections
   */
  getAllConnections(): VendorConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get connection by ID
   */
  getConnection(connectionId: string): VendorConnection | undefined {
    return this.connections.get(connectionId);
  }

  /**
   * Update connection
   */
  async updateConnection(
    connectionId: string,
    updates: Partial<VendorConnection>
  ): Promise<VendorConnection> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    const updated = {
      ...connection,
      ...updates,
      updatedAt: new Date()
    };

    this.connections.set(connectionId, updated);
    this.saveConnections();

    return updated;
  }

  /**
   * Delete connection
   */
  async deleteConnection(connectionId: string): Promise<boolean> {
    const deleted = this.connections.delete(connectionId);
    if (deleted) {
      this.saveConnections();
    }
    return deleted;
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    const connections = this.getAllConnections();
    return {
      total: connections.length,
      connected: connections.filter(c => c.status === ConnectionStatus.CONNECTED).length,
      disconnected: connections.filter(c => c.status === ConnectionStatus.DISCONNECTED).length,
      error: connections.filter(c => c.status === ConnectionStatus.ERROR).length,
      byVendor: connections.reduce((acc, conn) => {
        acc[conn.vendorType] = (acc[conn.vendorType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Private helper methods

  private async simulateVendorApiCall(connection: VendorConnection): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));

    // Simulate occasional failures
    if (Math.random() < 0.05) {
      throw new Error('Connection timeout');
    }

    // Validate credentials based on vendor type
    if (!connection.credentials.apiKey && !connection.credentials.token) {
      throw new Error('Missing authentication credentials');
    }
  }

  private async simulateFetchMetrics(
    connection: VendorConnection,
    metricNames: string[],
    startTime: Date,
    endTime: Date
  ): Promise<MetricData[]> {
    const metrics: MetricData[] = [];
    const timeRange = endTime.getTime() - startTime.getTime();
    const dataPoints = Math.min(100, Math.floor(timeRange / (60 * 1000))); // One point per minute, max 100

    for (const metricName of metricNames) {
      for (let i = 0; i < dataPoints; i++) {
        const timestamp = new Date(startTime.getTime() + (timeRange / dataPoints) * i);
        metrics.push({
          timestamp,
          metricName,
          value: 50 + Math.random() * 50,
          unit: this.getMetricUnit(metricName),
          tags: {
            source: connection.vendorType,
            connection: connection.name
          },
          source: connection.vendorType
        });
      }
    }

    return metrics;
  }

  private getMetricUnit(metricName: string): string {
    if (metricName.includes('cpu') || metricName.includes('memory')) return 'percent';
    if (metricName.includes('latency') || metricName.includes('time')) return 'ms';
    if (metricName.includes('rate') || metricName.includes('count')) return 'count';
    if (metricName.includes('bytes')) return 'bytes';
    return 'unit';
  }

  private loadConnections(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('vendor_connections');
      if (stored) {
        const connections = JSON.parse(stored);
        connections.forEach((conn: VendorConnection) => {
          // Convert date strings back to Date objects
          conn.createdAt = new Date(conn.createdAt);
          conn.updatedAt = new Date(conn.updatedAt);
          if (conn.lastSync) conn.lastSync = new Date(conn.lastSync);
          this.connections.set(conn.id, conn);
        });
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
  }

  private saveConnections(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const connections = Array.from(this.connections.values());
      localStorage.setItem('vendor_connections', JSON.stringify(connections));
    } catch (error) {
      console.error('Failed to save connections:', error);
    }
  }
}

export default VendorIntegrationService;
