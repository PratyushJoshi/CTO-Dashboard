'use client';

import React from 'react';
import { MinimalLayout } from '@/components/layout/MinimalLayout';
import { InfrastructureDashboard } from '@/components/infrastructure';

export default function InfrastructurePerformancePage() {
  return (
    <MinimalLayout>
      <InfrastructureDashboard />
    </MinimalLayout>
  );
}