'use client';

import React, { useMemo } from 'react';
import { MinimalLayout } from '@/components/layout/MinimalLayout';
import { AlertDashboard } from '@/components/alerts/AlertDashboard';
import { AlertService } from '@/services/AlertService';

export default function AlertsPage() {
  const alertService = useMemo(() => new AlertService(), []);

  return (
    <MinimalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alerts & Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage alert rules, view notifications, and configure escalation policies
          </p>
        </div>
        
        <AlertDashboard alertService={alertService} />
      </div>
    </MinimalLayout>
  );
}
