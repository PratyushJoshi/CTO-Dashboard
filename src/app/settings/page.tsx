'use client';

import React, { useState } from 'react';
import { MinimalLayout } from '@/components/layout/MinimalLayout';
import { 
  Cog6ToothIcon,
  BellIcon,
  UserIcon,
  ShieldCheckIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'account', name: 'Account', icon: UserIcon },
  ];

  return (
    <MinimalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your dashboard preferences and system settings
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">General Settings</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Configure basic dashboard preferences</p>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard Title</label>
                    <input
                      type="text"
                      defaultValue="CTO Dashboard"
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Refresh Interval</label>
                    <select className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                      <option value="300">5 minutes</option>
                      <option value="600">10 minutes</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="auto-refresh"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="auto-refresh" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable auto-refresh
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                Cancel
              </button>
              <button className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </MinimalLayout>
  );
}
