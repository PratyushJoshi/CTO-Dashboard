'use client';

import React from 'react';
import { MinimalLayout } from '@/components/layout/MinimalLayout';
import { AnalyticsDashboard } from '@/components/analytics';

export default function BusinessAnalyticsPage() {
  return (
    <MinimalLayout>
      <AnalyticsDashboard />
    </MinimalLayout>
  );
}
