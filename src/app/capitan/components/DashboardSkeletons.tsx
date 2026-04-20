import React from 'react';

export function MetricSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-[32px]" />
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="h-[520px] w-full bg-white border border-gray-100 rounded-[40px] p-8 flex flex-col gap-6">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 w-32 bg-gray-100 animate-pulse rounded-lg" />
        <div className="h-6 w-24 bg-gray-100 animate-pulse rounded-lg" />
      </div>
      <div className="grid grid-cols-7 gap-3 flex-1">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function RadarSkeleton() {
  return (
    <div className="h-[400px] w-full bg-white border border-gray-100 rounded-[40px] relative overflow-hidden">
      <div className="absolute top-6 left-6 h-4 w-32 bg-gray-100 animate-pulse rounded-lg z-10" />
      <div className="w-full h-full bg-gray-50 animate-pulse flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-ios-blue animate-spin" />
      </div>
    </div>
  );
}
