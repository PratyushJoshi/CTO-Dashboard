/**
 * TypeScript types for Supabase database schema
 * Generated from the schema.sql file
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'editor' | 'viewer';
          company_name: string | null;
          avatar_url: string | null;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'editor' | 'viewer';
          company_name?: string | null;
          avatar_url?: string | null;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'admin' | 'editor' | 'viewer';
          company_name?: string | null;
          avatar_url?: string | null;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      vendor_integrations: {
        Row: {
          id: string;
          user_id: string;
          vendor_type: 'prometheus' | 'new_relic' | 'datadog' | 'grafana' | 'splunk' | 'elastic' | 'cloudwatch' | 'azure_monitor' | 'google_cloud_monitoring' | 'custom_api';
          name: string;
          description: string | null;
          credentials: Json;
          endpoint: string | null;
          status: 'connected' | 'disconnected' | 'connecting' | 'error' | 'configured';
          last_sync_at: string | null;
          sync_frequency_minutes: number;
          data_types: string[];
          config: Json;
          error_message: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vendor_type: 'prometheus' | 'new_relic' | 'datadog' | 'grafana' | 'splunk' | 'elastic' | 'cloudwatch' | 'azure_monitor' | 'google_cloud_monitoring' | 'custom_api';
          name: string;
          description?: string | null;
          credentials: Json;
          endpoint?: string | null;
          status?: 'connected' | 'disconnected' | 'connecting' | 'error' | 'configured';
          last_sync_at?: string | null;
          sync_frequency_minutes?: number;
          data_types?: string[];
          config?: Json;
          error_message?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vendor_type?: 'prometheus' | 'new_relic' | 'datadog' | 'grafana' | 'splunk' | 'elastic' | 'cloudwatch' | 'azure_monitor' | 'google_cloud_monitoring' | 'custom_api';
          name?: string;
          description?: string | null;
          credentials?: Json;
          endpoint?: string | null;
          status?: 'connected' | 'disconnected' | 'connecting' | 'error' | 'configured';
          last_sync_at?: string | null;
          sync_frequency_minutes?: number;
          data_types?: string[];
          config?: Json;
          error_message?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      metrics: {
        Row: {
          id: string;
          user_id: string;
          integration_id: string | null;
          metric_type: 'infrastructure' | 'api_performance' | 'app_performance' | 'business_cost' | 'ai_metrics' | 'qa_metrics' | 'analytics';
          metric_name: string;
          value: number;
          unit: string | null;
          tags: Json;
          metadata: Json;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          integration_id?: string | null;
          metric_type: 'infrastructure' | 'api_performance' | 'app_performance' | 'business_cost' | 'ai_metrics' | 'qa_metrics' | 'analytics';
          metric_name: string;
          value: number;
          unit?: string | null;
          tags?: Json;
          metadata?: Json;
          timestamp: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          integration_id?: string | null;
          metric_type?: 'infrastructure' | 'api_performance' | 'app_performance' | 'business_cost' | 'ai_metrics' | 'qa_metrics' | 'analytics';
          metric_name?: string;
          value?: number;
          unit?: string | null;
          tags?: Json;
          metadata?: Json;
          timestamp?: string;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          rule_id: string | null;
          metric_type: string;
          metric_name: string;
          current_value: number;
          threshold: number;
          severity: 'low' | 'medium' | 'high' | 'critical';
          status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
          message: string;
          details: Json;
          triggered_at: string;
          acknowledged_at: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          rule_id?: string | null;
          metric_type: string;
          metric_name: string;
          current_value: number;
          threshold: number;
          severity: 'low' | 'medium' | 'high' | 'critical';
          status?: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
          message: string;
          details?: Json;
          triggered_at: string;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          rule_id?: string | null;
          metric_type?: string;
          metric_name?: string;
          current_value?: number;
          threshold?: number;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          status?: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
          message?: string;
          details?: Json;
          triggered_at?: string;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
