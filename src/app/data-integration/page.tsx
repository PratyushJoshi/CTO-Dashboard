'use client';

import React, { useState, useEffect } from 'react';
import { MinimalLayout } from '@/components/layout/MinimalLayout';
import { SupabaseVendorService } from '@/services/SupabaseVendorService';
import { useAuth } from '@/contexts/AuthContext';
import {
  VendorType,
  VendorConnection,
  ConnectionStatus,
  VendorCredentials
} from '@/services/VendorIntegrationService';
import {
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  PencilIcon,
  CloudIcon,
  ServerIcon,
  ChartBarIcon,
  CpuChipIcon,
  CircleStackIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

export default function DataIntegrationPage() {
  const [connections, setConnections] = useState<VendorConnection[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const { user, isConfigured } = useAuth();

  const vendorService = SupabaseVendorService.getInstance();

  useEffect(() => {
    loadConnections();

    // Subscribe to real-time updates if Supabase is configured
    if (isConfigured && user) {
      const subscription = vendorService.subscribeToConnections((updatedConnections) => {
        setConnections(updatedConnections);
      });

      return () => subscription.unsubscribe();
    }
  }, [user, isConfigured]);

  const loadConnections = async () => {
    try {
      const allConnections = await vendorService.getAllConnections();
      setConnections(allConnections);
      const connectionStats = await vendorService.getConnectionStats();
      setStats(connectionStats);
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    setTestingConnection(connectionId);
    try {
      const result = await vendorService.testConnection(connectionId);
      if (result.success) {
        alert(`Connection successful! Latency: ${result.latency}ms`);
      } else {
        alert(`Connection failed: ${result.message}`);
      }
      loadConnections();
    } catch (error) {
      alert('Connection test failed');
    } finally {
      setTestingConnection(null);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (confirm('Are you sure you want to delete this connection?')) {
      await vendorService.deleteConnection(connectionId);
      loadConnections();
    }
  };

  const getVendorIcon = (vendorType: VendorType) => {
    const icons: Record<VendorType, any> = {
      [VendorType.PROMETHEUS]: ServerIcon,
      [VendorType.NEW_RELIC]: ChartBarIcon,
      [VendorType.DATADOG]: BoltIcon,
      [VendorType.GRAFANA]: ChartBarIcon,
      [VendorType.SPLUNK]: CircleStackIcon,
      [VendorType.ELASTIC]: CircleStackIcon,
      [VendorType.CLOUDWATCH]: CloudIcon,
      [VendorType.AZURE_MONITOR]: CloudIcon,
      [VendorType.GOOGLE_CLOUD_MONITORING]: CloudIcon,
      [VendorType.CUSTOM_API]: CpuChipIcon
    };
    return icons[vendorType] || ServerIcon;
  };

  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return 'text-green-500 bg-green-50';
      case ConnectionStatus.ERROR:
        return 'text-red-500 bg-red-50';
      case ConnectionStatus.CONNECTING:
        return 'text-blue-500 bg-blue-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case ConnectionStatus.ERROR:
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case ConnectionStatus.CONNECTING:
        return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <CircleStackIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const vendors = [
    { type: VendorType.PROMETHEUS, name: 'Prometheus', description: 'Open-source monitoring system' },
    { type: VendorType.NEW_RELIC, name: 'New Relic', description: 'Full-stack observability platform' },
    { type: VendorType.DATADOG, name: 'Datadog', description: 'Monitoring and analytics platform' },
    { type: VendorType.GRAFANA, name: 'Grafana', description: 'Analytics and monitoring solution' },
    { type: VendorType.SPLUNK, name: 'Splunk', description: 'Data platform for security and observability' },
    { type: VendorType.ELASTIC, name: 'Elasticsearch', description: 'Search and analytics engine' },
    { type: VendorType.CLOUDWATCH, name: 'AWS CloudWatch', description: 'AWS monitoring service' },
    { type: VendorType.AZURE_MONITOR, name: 'Azure Monitor', description: 'Azure monitoring service' },
    { type: VendorType.GOOGLE_CLOUD_MONITORING, name: 'Google Cloud Monitoring', description: 'GCP monitoring service' },
    { type: VendorType.CUSTOM_API, name: 'Custom API', description: 'Custom REST API integration' }
  ];

  return (
    <MinimalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Integration</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Connect and manage your monitoring and analytics vendors
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Integration</span>
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Integrations</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">Connected</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{stats.connected}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">Disconnected</div>
              <div className="text-3xl font-bold text-gray-600 mt-2">{stats.disconnected}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
              <div className="text-3xl font-bold text-red-600 mt-2">{stats.error}</div>
            </div>
          </div>
        )}

        {/* Connections List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Integrations</h2>
          </div>
          <div className="p-6">
            {connections.length === 0 ? (
              <div className="text-center py-12">
                <CircleStackIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No integrations yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get started by adding your first vendor integration
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Integration
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((connection) => {
                  const Icon = getVendorIcon(connection.vendorType);
                  return (
                    <div
                      key={connection.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{connection.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {connection.vendorType.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        {getStatusIcon(connection.status)}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                            {connection.status}
                          </span>
                        </div>
                        {connection.lastSync && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Last Sync</span>
                            <span className="text-gray-900 dark:text-white">
                              {new Date(connection.lastSync).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Data Types</span>
                          <span className="text-gray-900 dark:text-white">{connection.dataTypes.length}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTestConnection(connection.id)}
                          disabled={testingConnection === connection.id}
                          className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {testingConnection === connection.id ? 'Testing...' : 'Test'}
                        </button>
                        <button
                          onClick={() => handleDeleteConnection(connection.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Add Integration Modal */}
        {showAddModal && (
          <AddIntegrationModal
            vendors={vendors}
            onClose={() => {
              setShowAddModal(false);
            }}
            onAdd={async (vendorType, name, credentials) => {
              try {
                await vendorService.createConnection(vendorType, name, credentials);
                await loadConnections();
                setShowAddModal(false);
              } catch (error) {
                console.error('Failed to create connection:', error);
                alert('Failed to create connection. Please try again.');
              }
            }}
          />
        )}
      </div>
    </MinimalLayout>
  );
}

// Add Integration Modal Component
function AddIntegrationModal({
  vendors,
  onClose,
  onAdd
}: {
  vendors: any[];
  onClose: () => void;
  onAdd: (vendorType: VendorType, name: string, credentials: VendorCredentials) => Promise<void>;
}) {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedVendor, setSelectedVendor] = useState<VendorType | null>(null);
  const [name, setName] = useState('');
  const [credentials, setCredentials] = useState<VendorCredentials>({});

  const handleVendorSelect = (vendorType: VendorType) => {
    setSelectedVendor(vendorType);
    setStep('configure');
    setName(`${vendorType} Integration`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVendor && name) {
      await onAdd(selectedVendor, name, credentials);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {step === 'select' ? 'Select Vendor' : 'Configure Integration'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 'select' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendors.map((vendor) => (
                <button
                  key={vendor.type}
                  onClick={() => handleVendorSelect(vendor.type)}
                  className="text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{vendor.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{vendor.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Integration Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key / Token
                </label>
                <input
                  type="password"
                  value={credentials.apiKey || ''}
                  onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your API key"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Endpoint URL (Optional)
                </label>
                <input
                  type="url"
                  value={credentials.endpoint || ''}
                  onChange={(e) => setCredentials({ ...credentials, endpoint: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://api.vendor.com"
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Integration
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
