'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ResponsiveChartProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: number;
  aspectRatio?: number;
}

export function ResponsiveChart({ 
  children, 
  className = '', 
  minHeight = 200,
  aspectRatio = 16/9 
}: ResponsiveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const calculatedHeight = Math.max(width / aspectRatio, minHeight);
        setDimensions({ width, height: calculatedHeight });
      }
    };

    // Initial measurement
    updateDimensions();

    // Set up resize observer for responsive updates
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback for older browsers
    const handleResize = () => {
      setTimeout(updateDimensions, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [aspectRatio, minHeight]);

  return (
    <div 
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ 
        minHeight: `${minHeight}px`,
        height: dimensions.height > 0 ? `${dimensions.height}px` : 'auto'
      }}
    >
      <div 
        className="w-full h-full"
        style={{ 
          width: dimensions.width > 0 ? `${dimensions.width}px` : '100%',
          height: dimensions.height > 0 ? `${dimensions.height}px` : '100%'
        }}
      >
        {children}
      </div>
    </div>
  );
}