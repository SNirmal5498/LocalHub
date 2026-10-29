import React from 'react';

export const BusinessCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs animate-pulse">
      {/* Cover image placeholder */}
      <div className="relative aspect-[16/10] bg-neutral-200 dark:bg-neutral-800">
        <div className="absolute top-3 left-3 w-24 h-6 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <div className="absolute top-3 right-3 w-20 h-6 rounded-full bg-neutral-300 dark:bg-neutral-700" />
      </div>

      {/* Card body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="w-3/4 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          <div className="w-1/3 h-4 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-3 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            <div className="w-4/5 h-3 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-1/2 h-3 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            <div className="w-16 h-3 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="w-full h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    </div>
  );
};
