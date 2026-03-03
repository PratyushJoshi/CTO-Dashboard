'use client';

import React from 'react';
import { MinimalLayout } from '@/components/layout/MinimalLayout';
import AIDashboard from '@/components/ai/AIDashboard';

export default function AIPerformancePage() {
  return (
    <MinimalLayout>
      <AIDashboard />
    </MinimalLayout>
  );
}
