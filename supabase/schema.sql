-- CTO Dashboard Supabase Schema
-- This schema supports multi-tenant architecture with user authentication

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    company_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- VENDOR INTEGRATIONS
-- ============================================================================

CREATE TABLE public.vendor_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vendor_type TEXT NOT NULL CHECK (vendor_type IN (
        'prometheus', 'new_relic', 'datadog', 'grafana', 'splunk',
        'elastic', 'cloudwatch', 'azure_monitor', 'google_cloud_monitoring', 'custom_api'
    )),
    name TEXT NOT NULL,
    description TEXT,
    credentials JSONB NOT NULL, -- Encrypted credentials
    endpoint TEXT,
    status TEXT DEFAULT 'configured' CHECK (status IN ('connected', 'disconnected', 'connecting', 'error', 'configured')),
    last_sync_at TIMESTAMPTZ,
    sync_frequency_minutes INTEGER DEFAULT 5,
    data_types TEXT[] DEFAULT '{}',
    config JSONB DEFAULT '{}',
    error_message TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE INDEX idx_vendor_integrations_user_id ON public.vendor_integrations(user_id);
CREATE INDEX idx_vendor_integrations_status ON public.vendor_integrations(status);
CREATE INDEX idx_vendor_integrations_vendor_type ON public.vendor_integrations(vendor_type);

-- ============================================================================
-- METRICS DATA
-- ============================================================================

CREATE TABLE public.metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.vendor_integrations(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN (
        'infrastructure', 'api_performance', 'app_performance', 
        'business_cost', 'ai_metrics', 'qa_metrics', 'analytics'
    )),
    metric_name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    unit TEXT,
    tags JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metrics_user_id ON public.metrics(user_id);
CREATE INDEX idx_metrics_integration_id ON public.metrics(integration_id);
CREATE INDEX idx_metrics_type ON public.metrics(metric_type);
CREATE INDEX idx_metrics_timestamp ON public.metrics(timestamp DESC);
CREATE INDEX idx_metrics_name ON public.metrics(metric_name);

-- Hypertable for time-series data (if using TimescaleDB extension)
-- SELECT create_hypertable('metrics', 'timestamp', if_not_exists => TRUE);

-- ============================================================================
-- INFRASTRUCTURE METRICS
-- ============================================================================

CREATE TABLE public.infrastructure_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.vendor_integrations(id) ON DELETE CASCADE,
    server_id TEXT NOT NULL,
    server_name TEXT NOT NULL,
    cpu_utilization NUMERIC CHECK (cpu_utilization >= 0 AND cpu_utilization <= 100),
    memory_utilization NUMERIC CHECK (memory_utilization >= 0 AND memory_utilization <= 100),
    disk_utilization NUMERIC CHECK (disk_utilization >= 0 AND disk_utilization <= 100),
    network_utilization NUMERIC CHECK (network_utilization >= 0 AND network_utilization <= 100),
    load_percentage NUMERIC,
    status TEXT CHECK (status IN ('healthy', 'warning', 'critical', 'down')),
    uptime_hours NUMERIC,
    api_traffic_count INTEGER,
    traffic_volume NUMERIC,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_infra_metrics_user_id ON public.infrastructure_metrics(user_id);
CREATE INDEX idx_infra_metrics_timestamp ON public.infrastructure_metrics(timestamp DESC);
CREATE INDEX idx_infra_metrics_server_id ON public.infrastructure_metrics(server_id);

-- ============================================================================
-- API PERFORMANCE METRICS
-- ============================================================================

CREATE TABLE public.api_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.vendor_integrations(id) ON DELETE CASCADE,
    endpoint_id TEXT NOT NULL,
    endpoint_name TEXT NOT NULL,
    success_rate NUMERIC CHECK (success_rate >= 0 AND success_rate <= 100),
    failure_rate NUMERIC CHECK (failure_rate >= 0 AND failure_rate <= 100),
    average_latency NUMERIC,
    median_latency NUMERIC,
    p95_latency NUMERIC,
    p99_latency NUMERIC,
    errors_by_status_code JSONB DEFAULT '{}',
    requests_per_minute NUMERIC,
    uptime NUMERIC CHECK (uptime >= 0 AND uptime <= 100),
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_metrics_user_id ON public.api_performance_metrics(user_id);
CREATE INDEX idx_api_metrics_timestamp ON public.api_performance_metrics(timestamp DESC);
CREATE INDEX idx_api_metrics_endpoint_id ON public.api_performance_metrics(endpoint_id);

-- ============================================================================
-- BUSINESS COST METRICS
-- ============================================================================

CREATE TABLE public.business_cost_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.vendor_integrations(id) ON DELETE CASCADE,
    business_unit TEXT CHECK (business_unit IN ('fashion', 'beauty', 'superstore', 'other')),
    cost_per_order NUMERIC,
    total_cost NUMERIC,
    order_volume INTEGER,
    period_start DATE,
    period_end DATE,
    cost_breakdown JSONB DEFAULT '{}',
    optimization_opportunities JSONB DEFAULT '[]',
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cost_metrics_user_id ON public.business_cost_metrics(user_id);
CREATE INDEX idx_cost_metrics_timestamp ON public.business_cost_metrics(timestamp DESC);
CREATE INDEX idx_cost_metrics_business_unit ON public.business_cost_metrics(business_unit);

-- ============================================================================
-- ALERTS
-- ============================================================================

CREATE TABLE public.alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    condition_operator TEXT NOT NULL CHECK (condition_operator IN ('gt', 'lt', 'eq', 'gte', 'lte')),
    threshold NUMERIC NOT NULL,
    time_window_minutes INTEGER DEFAULT 5,
    consecutive_breaches INTEGER DEFAULT 1,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    notification_channels TEXT[] DEFAULT '{}',
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alert_rules_user_id ON public.alert_rules(user_id);
CREATE INDEX idx_alert_rules_enabled ON public.alert_rules(is_enabled);

CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES public.alert_rules(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    current_value NUMERIC NOT NULL,
    threshold NUMERIC NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'suppressed')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    triggered_at TIMESTAMPTZ NOT NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_severity ON public.alerts(severity);
CREATE INDEX idx_alerts_triggered_at ON public.alerts(triggered_at DESC);

-- ============================================================================
-- DASHBOARDS & WIDGETS
-- ============================================================================

CREATE TABLE public.dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    layout JSONB DEFAULT '[]',
    filters JSONB DEFAULT '{}',
    refresh_interval_seconds INTEGER DEFAULT 30,
    is_default BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    share_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dashboards_user_id ON public.dashboards(user_id);
CREATE INDEX idx_dashboards_is_default ON public.dashboards(is_default);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_cost_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Vendor Integrations Policies
CREATE POLICY "Users can view own integrations" ON public.vendor_integrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON public.vendor_integrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON public.vendor_integrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON public.vendor_integrations
    FOR DELETE USING (auth.uid() = user_id);

-- Metrics Policies
CREATE POLICY "Users can view own metrics" ON public.metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" ON public.metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Infrastructure Metrics Policies
CREATE POLICY "Users can view own infrastructure metrics" ON public.infrastructure_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own infrastructure metrics" ON public.infrastructure_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- API Performance Metrics Policies
CREATE POLICY "Users can view own API metrics" ON public.api_performance_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API metrics" ON public.api_performance_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Business Cost Metrics Policies
CREATE POLICY "Users can view own cost metrics" ON public.business_cost_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cost metrics" ON public.business_cost_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Alert Rules Policies
CREATE POLICY "Users can view own alert rules" ON public.alert_rules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own alert rules" ON public.alert_rules
    FOR ALL USING (auth.uid() = user_id);

-- Alerts Policies
CREATE POLICY "Users can view own alerts" ON public.alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own alerts" ON public.alerts
    FOR ALL USING (auth.uid() = user_id);

-- Dashboards Policies
CREATE POLICY "Users can view own dashboards" ON public.dashboards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own dashboards" ON public.dashboards
    FOR ALL USING (auth.uid() = user_id);

-- Audit Logs Policies
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_integrations_updated_at BEFORE UPDATE ON public.vendor_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON public.alert_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON public.dashboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details)
    VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details)
    RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.infrastructure_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.api_performance_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_cost_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_integrations;

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Latest metrics per integration
CREATE OR REPLACE VIEW public.latest_metrics AS
SELECT DISTINCT ON (integration_id, metric_name)
    *
FROM public.metrics
ORDER BY integration_id, metric_name, timestamp DESC;

-- Active alerts summary
CREATE OR REPLACE VIEW public.active_alerts_summary AS
SELECT 
    user_id,
    severity,
    COUNT(*) as count
FROM public.alerts
WHERE status = 'active'
GROUP BY user_id, severity;

-- Integration health status
CREATE OR REPLACE VIEW public.integration_health AS
SELECT 
    vi.id,
    vi.user_id,
    vi.name,
    vi.vendor_type,
    vi.status,
    vi.last_sync_at,
    COUNT(m.id) as metric_count,
    MAX(m.timestamp) as latest_metric_timestamp
FROM public.vendor_integrations vi
LEFT JOIN public.metrics m ON vi.id = m.integration_id
GROUP BY vi.id, vi.user_id, vi.name, vi.vendor_type, vi.status, vi.last_sync_at;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample alert rules (will be user-specific in production)
-- INSERT INTO public.alert_rules (user_id, name, metric_type, metric_name, condition_operator, threshold, severity)
-- VALUES 
--     (auth.uid(), 'High CPU Usage', 'infrastructure', 'cpu_utilization', 'gt', 80, 'high'),
--     (auth.uid(), 'API Latency Spike', 'api_performance', 'average_latency', 'gt', 1000, 'critical');

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.user_profiles IS 'Extended user profile information';
COMMENT ON TABLE public.vendor_integrations IS 'Third-party vendor integration configurations';
COMMENT ON TABLE public.metrics IS 'Generic metrics storage for all metric types';
COMMENT ON TABLE public.infrastructure_metrics IS 'Infrastructure-specific metrics';
COMMENT ON TABLE public.api_performance_metrics IS 'API performance metrics';
COMMENT ON TABLE public.business_cost_metrics IS 'Business cost and financial metrics';
COMMENT ON TABLE public.alert_rules IS 'User-defined alert rules';
COMMENT ON TABLE public.alerts IS 'Triggered alerts based on rules';
COMMENT ON TABLE public.dashboards IS 'Custom dashboard configurations';
COMMENT ON TABLE public.audit_logs IS 'Audit trail of user actions';
