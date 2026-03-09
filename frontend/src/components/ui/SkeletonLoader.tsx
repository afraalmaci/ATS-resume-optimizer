"use client";

export const SkeletonLoader = ({ lines = 3 }: { lines?: number }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md h-6 w-full"
          style={{ maxWidth: `${80 - i * 10}%` }}
        />
      ))}
    </div>
  );
};