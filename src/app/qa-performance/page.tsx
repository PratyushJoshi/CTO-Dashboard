'use client';

import React from 'react';
import { MinimalLayout } from '@/components/layout/MinimalLayout';
import { QADashboard } from '@/components/qa';

export default function QAPerformancePage() {
  return (
    <MinimalLayout>
      <QADashboard />
    </MinimalLayout>
  );
}
