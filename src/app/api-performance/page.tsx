'use client';

import React from 'react';
import { MinimalLayout } from '@/components/layout/MinimalLayout';
import { APIPerformanceDashboard } from '@/components/api';

export default function APIPerformancePage() {
  return (
    <MinimalLayout>
      <APIPerformanceDashboard refreshInterval={30000} />
    </MinimalLayout>
  );
}
