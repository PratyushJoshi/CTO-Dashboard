'use client';

import React from 'react';
import { Navbar } from './Navbar';

interface MinimalLayoutProps {
  children: React.ReactNode;
}

export function MinimalLayout({ children }: MinimalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
