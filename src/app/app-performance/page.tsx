'use client';

import React from 'react';
import { MinimalLayout } from '@/components/layout/MinimalLayout';
import { AppPerformanceDashboard } from '@/components/app';

export default function AppPerformancePage() {
  return (
    <MinimalLayout>
      <AppPerformanceDashboard />
    </MinimalLayout>
  );
}
