# Data Integration Guide

## Overview

The CTO Dashboard now features a minimalistic navbar design with a powerful vendor integration system that allows you to connect to various monitoring and analytics platforms.

## New Features

### 1. Minimalistic Navbar
- **Clean Design**: Top navigation bar with all key sections
- **Responsive**: Works seamlessly on mobile and desktop
- **Always Visible**: No sidebar to toggle, navigation is always accessible
- **Quick Access**: Direct links to all dashboard sections

### 2. Vendor Integration System

Connect your dashboard to popular monitoring and analytics vendors:

#### Supported Vendors

1. **Prometheus** - Open-source monitoring system
2. **New Relic** - Full-stack observability platform
3. **Datadog** - Monitoring and analytics platform
4. **Grafana** - Analytics and monitoring solution
5. **Splunk** - Data platform for security and observability
6. **Elasticsearch** - Search and analytics engine
7. **AWS CloudWatch** - AWS monitoring service
8. **Azure Monitor** - Azure monitoring service
9. **Google Cloud Monitoring** - GCP monitoring service
10. **Custom API** - Custom REST API integration

## Getting Started

### Adding a Vendor Integration

1. Navigate to **Data Integration** page
2. Click **Add Integration** button
3. Select your vendor from the list
4. Configure the connection:
   - **Integration Name**: Give it a descriptive name
   - **API Key/Token**: Enter your vendor's API credentials
   - **Endpoint URL**: (Optional) Custom endpoint if needed
5. Click **Add Integration**

### Testing Connections

After adding an integration:
1. Find your integration in the list
2. Click the **Test** button
3. The system will verify the connection and show:
   - Success/Failure status
   - Connection latency
   - Any error messages

### Managing Integrations

- **View Status**: See real-time connection status for each vendor
- **Last Sync**: Check when data was last synchronized
- **Data Types**: View what types of metrics are available
- **Delete**: Remove integrations you no longer need

## API Integration Details

### VendorIntegrationService

The core service that handles all vendor connections:

```typescript
import VendorIntegrationService, { VendorType } from '@/services/VendorIntegrationService';

const service = VendorIntegrationService.getInstance();

// Create a connection
const connection = await service.createConnection(
  VendorType.PROMETHEUS,
  'My Prometheus Server',
  {
    apiKey: 'your-api-key',
    endpoint: 'https://prometheus.example.com'
  }
);

// Test connection
const result = await service.testConnection(connection.id);

// Fetch metrics
const metrics = await service.fetchMetrics(
  connection.id,
  ['cpu_usage', 'memory_usage'],
  new Date(Date.now() - 3600000), // 1 hour ago
  new Date()
);
```

### Vendor Capabilities

Each vendor has specific capabilities:

```typescript
const capabilities = service.getVendorCapabilities(VendorType.DATADOG);
// Returns:
// {
//   supportsRealTime: true,
//   supportsHistorical: true,
//   supportedMetrics: ['infrastructure', 'apm', 'logs', 'rum', 'synthetics'],
//   rateLimit: { requestsPerMinute: 300, requestsPerHour: 18000 },
//   authentication: ['api_key', 'app_key']
// }
```

## Authentication Methods

### API Key Authentication
Most vendors support API key authentication:
```typescript
{
  apiKey: 'your-api-key-here'
}
```

### Bearer Token
For token-based authentication:
```typescript
{
  token: 'your-bearer-token'
}
```

### Basic Authentication
Username and password:
```typescript
{
  username: 'your-username',
  password: 'your-password'
}
```

### AWS Credentials
For AWS CloudWatch:
```typescript
{
  apiKey: 'AWS_ACCESS_KEY_ID',
  apiSecret: 'AWS_SECRET_ACCESS_KEY',
  region: 'us-east-1'
}
```

### Azure Credentials
For Azure Monitor:
```typescript
{
  apiKey: 'client-id',
  apiSecret: 'client-secret',
  accountId: 'tenant-id'
}
```

## Data Flow

```
┌─────────────────┐
│  Vendor APIs    │
│  (Prometheus,   │
│   Datadog, etc) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Integration    │
│  Service        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CTO Dashboard  │
│  Visualizations │
└─────────────────┘
```

## Configuration Storage

Integrations are stored locally in the browser's localStorage:
- **Key**: `vendor_connections`
- **Format**: JSON array of connection objects
- **Persistence**: Survives page refreshes
- **Privacy**: Data stays in your browser

## Rate Limiting

Each vendor has rate limits to prevent API abuse:

| Vendor | Requests/Minute | Requests/Hour |
|--------|----------------|---------------|
| Prometheus | 60 | 3,600 |
| New Relic | 100 | 6,000 |
| Datadog | 300 | 18,000 |
| Grafana | 120 | 7,200 |
| Splunk | 50 | 3,000 |
| Elastic | 200 | 12,000 |
| CloudWatch | 400 | 24,000 |
| Azure Monitor | 300 | 18,000 |
| GCP Monitoring | 300 | 18,000 |

## Metrics Collection

### Supported Metric Types

- **Infrastructure**: CPU, memory, disk, network
- **APM**: Application performance metrics
- **Logs**: Log aggregation and analysis
- **RUM**: Real user monitoring
- **Synthetics**: Synthetic monitoring
- **Custom**: Custom metrics from your applications

### Fetching Metrics

```typescript
const metrics = await service.fetchMetrics(
  connectionId,
  ['cpu_usage', 'memory_usage'],
  startTime,
  endTime
);

// Returns array of MetricData:
// [
//   {
//     timestamp: Date,
//     metricName: 'cpu_usage',
//     value: 75.2,
//     unit: 'percent',
//     tags: { source: 'prometheus', connection: 'My Server' },
//     source: 'prometheus'
//   }
// ]
```

## Error Handling

The service handles various error scenarios:

- **Connection Timeout**: Retries with exponential backoff
- **Invalid Credentials**: Clear error message
- **Rate Limit Exceeded**: Queues requests
- **Network Errors**: Graceful degradation

## Best Practices

1. **Test Connections Regularly**: Verify your integrations are working
2. **Use Descriptive Names**: Make it easy to identify integrations
3. **Monitor Rate Limits**: Stay within vendor limits
4. **Secure Credentials**: Never commit API keys to version control
5. **Regular Sync**: Keep data fresh with appropriate refresh intervals

## Troubleshooting

### Connection Failed
- Verify API credentials are correct
- Check endpoint URL is accessible
- Ensure firewall allows outbound connections
- Verify vendor service is operational

### No Data Showing
- Check connection status is "Connected"
- Verify time range includes data
- Ensure metric names are correct
- Check vendor has data for requested metrics

### Slow Performance
- Reduce number of metrics fetched
- Increase refresh interval
- Check network latency
- Verify vendor API is responsive

## Future Enhancements

- [ ] Real-time data streaming via WebSockets
- [ ] Advanced metric transformations
- [ ] Custom alerting rules per vendor
- [ ] Data aggregation across vendors
- [ ] Historical data export
- [ ] Automated failover between vendors
- [ ] Machine learning anomaly detection
- [ ] Custom dashboard widgets per vendor

## Support

For issues or questions:
1. Check vendor documentation for API details
2. Verify credentials and permissions
3. Test connection using vendor's native tools
4. Review browser console for error messages

## Security Notes

- API keys are stored in browser localStorage
- Credentials are never sent to external servers (except vendor APIs)
- Use environment variables for production deployments
- Implement proper authentication for dashboard access
- Regular rotate API keys and tokens
- Use read-only API keys when possible
