'use client';

import React from 'react';
import { MinimalLayout } from '@/components/layout/MinimalLayout';
import { BusinessCostDashboard } from '@/components/business';

export default function BusinessCostPage() {
  return (
    <MinimalLayout>
      <BusinessCostDashboard />
    </MinimalLayout>
  );
}
