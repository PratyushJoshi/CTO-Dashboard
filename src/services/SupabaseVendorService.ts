/**
 * Supabase Vendor Integration Service
 * Handles vendor connections using Supabase database
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import VendorIntegrationService, {
  VendorType,
  VendorConnection,
  ConnectionStatus,
  VendorCredentials,
  MetricData,
} from './VendorIntegrationService';

export class SupabaseVendorService {
  private static instance: SupabaseVendorService;
  private fallbackService: VendorIntegrationService;

  private constructor() {
    this.fallbackService = VendorIntegrationService.getInstance();
  }

  static getInstance(): SupabaseVendorService {
    if (!SupabaseVendorService.instance) {
      SupabaseVendorService.instance = new SupabaseVendorService();
    }
    return SupabaseVendorService.instance;
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
    if (!isSupabaseConfigured()) {
      return this.fallbackService.createConnection(vendorType, name, credentials, config);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const capabilities = this.fallbackService.getVendorCapabilities(vendorType);

    const { data, error } = await supabase
      .from('vendor_integrations')
      .insert([{
        user_id: user.id,
        vendor_type: vendorType,
        name,
        description: `${vendorType} integration`,
        credentials: credentials as any,
        endpoint: credentials.endpoint || null,
        status: ConnectionStatus.CONFIGURED,
        data_types: capabilities.supportedMetrics,
        config: config as any,
      }])
      .select()
      .single();

    if (error) throw error;

    return this.mapToVendorConnection(data);
  }

  /**
   * Test vendor connection
   */
  async testConnection(connectionId: string): Promise<{ success: boolean; message: string; latency?: number }> {
    if (!isSupabaseConfigured()) {
      return this.fallbackService.testConnection(connectionId);
    }

    const connection = await this.getConnection(connectionId);
    if (!connection) {
      return { success: false, message: 'Connection not found' };
    }

    const startTime = Date.now();

    try {
      // Use the fallback service's test logic
      await this.simulateVendorApiCall(connection);

      const latency = Date.now() - startTime;

      // Update connection status in Supabase
      await supabase
        .from('vendor_integrations')
        .update({
          status: ConnectionStatus.CONNECTED,
          last_sync_at: new Date().toISOString(),
          error_message: null,
        } as any)
        .eq('id', connectionId);

      return {
        success: true,
        message: 'Connection successful',
        latency,
      };
    } catch (error) {
      await supabase
        .from('vendor_integrations')
        .update({
          status: ConnectionStatus.ERROR,
          error_message: error instanceof Error ? error.message : 'Connection failed',
        } as any)
        .eq('id', connectionId);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Fetch metrics from vendor and store in Supabase
   */
  async fetchMetrics(
    connectionId: string,
    metricNames: string[],
    startTime: Date,
    endTime: Date
  ): Promise<MetricData[]> {
    if (!isSupabaseConfigured()) {
      return this.fallbackService.fetchMetrics(connectionId, metricNames, startTime, endTime);
    }

    const connection = await this.getConnection(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    if (connection.status !== ConnectionStatus.CONNECTED) {
      throw new Error('Connection is not active');
    }

    // Simulate fetching metrics (in production, this would call the actual vendor API)
    const metrics = await this.simulateFetchMetrics(connection, metricNames, startTime, endTime);

    // Store metrics in Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const metricsToInsert = metrics.map((metric) => ({
        user_id: user.id,
        integration_id: connectionId,
        metric_type: this.getMetricType(metric.metricName),
        metric_name: metric.metricName,
        value: metric.value,
        unit: metric.unit,
        tags: metric.tags as any,
        metadata: { source: metric.source } as any,
        timestamp: metric.timestamp.toISOString(),
      }));

      await supabase.from('metrics').insert(metricsToInsert as any);
    }

    return metrics;
  }

  /**
   * Get all connections for current user
   */
  async getAllConnections(): Promise<VendorConnection[]> {
    if (!isSupabaseConfigured()) {
      return this.fallbackService.getAllConnections();
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('vendor_integrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(this.mapToVendorConnection);
  }

  /**
   * Get connection by ID
   */
  async getConnection(connectionId: string): Promise<VendorConnection | undefined> {
    if (!isSupabaseConfigured()) {
      return this.fallbackService.getConnection(connectionId);
    }

    const { data, error } = await supabase
      .from('vendor_integrations')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (error || !data) return undefined;

    return this.mapToVendorConnection(data);
  }

  /**
   * Update connection
   */
  async updateConnection(connectionId: string, updates: Partial<VendorConnection>): Promise<VendorConnection> {
    if (!isSupabaseConfigured()) {
      return this.fallbackService.updateConnection(connectionId, updates);
    }

    const { data, error } = await supabase
      .from('vendor_integrations')
      .update({
        name: updates.name,
        description: updates.description,
        credentials: updates.credentials as any,
        endpoint: updates.credentials?.endpoint,
        status: updates.status,
        config: updates.config as any,
        data_types: updates.dataTypes,
      } as any)
      .eq('id', connectionId)
      .select()
      .single();

    if (error) throw error;

    return this.mapToVendorConnection(data);
  }

  /**
   * Delete connection
   */
  async deleteConnection(connectionId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return this.fallbackService.deleteConnection(connectionId);
    }

    const { error } = await supabase.from('vendor_integrations').delete().eq('id', connectionId);

    return !error;
  }

  /**
   * Get connection statistics
   */
  async getConnectionStats() {
    if (!isSupabaseConfigured()) {
      return this.fallbackService.getConnectionStats();
    }

    const connections = await this.getAllConnections();

    return {
      total: connections.length,
      connected: connections.filter((c) => c.status === ConnectionStatus.CONNECTED).length,
      disconnected: connections.filter((c) => c.status === ConnectionStatus.DISCONNECTED).length,
      error: connections.filter((c) => c.status === ConnectionStatus.ERROR).length,
      byVendor: connections.reduce((acc, conn) => {
        acc[conn.vendorType] = (acc[conn.vendorType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Subscribe to real-time connection updates
   */
  subscribeToConnections(callback: (connections: VendorConnection[]) => void) {
    if (!isSupabaseConfigured()) {
      return { unsubscribe: () => {} };
    }

    const channel = supabase
      .channel('vendor_integrations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendor_integrations',
        },
        async () => {
          const connections = await this.getAllConnections();
          callback(connections);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  }

  // Private helper methods

  private mapToVendorConnection(data: any): VendorConnection {
    return {
      id: data.id,
      vendorType: data.vendor_type as VendorType,
      name: data.name,
      description: data.description || '',
      credentials: data.credentials as VendorCredentials,
      status: data.status as ConnectionStatus,
      lastSync: data.last_sync_at ? new Date(data.last_sync_at) : undefined,
      dataTypes: data.data_types || [],
      config: data.config || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private async simulateVendorApiCall(connection: VendorConnection): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 400));

    if (Math.random() < 0.05) {
      throw new Error('Connection timeout');
    }

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
    const dataPoints = Math.min(100, Math.floor(timeRange / (60 * 1000)));

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
            connection: connection.name,
          },
          source: connection.vendorType,
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

  private getMetricType(metricName: string): 'infrastructure' | 'api_performance' | 'app_performance' | 'business_cost' | 'ai_metrics' | 'qa_metrics' | 'analytics' {
    if (metricName.includes('cpu') || metricName.includes('memory') || metricName.includes('disk')) {
      return 'infrastructure';
    }
    if (metricName.includes('api') || metricName.includes('latency')) {
      return 'api_performance';
    }
    if (metricName.includes('app') || metricName.includes('crash')) {
      return 'app_performance';
    }
    if (metricName.includes('cost') || metricName.includes('price')) {
      return 'business_cost';
    }
    if (metricName.includes('ai') || metricName.includes('model')) {
      return 'ai_metrics';
    }
    if (metricName.includes('test') || metricName.includes('qa')) {
      return 'qa_metrics';
    }
    return 'analytics';
  }
}

export default SupabaseVendorService;
