import React from "react";

const Skeleton = ({ className }) => {
  return <div className={`animate-pulse rounded bg-gray-200 dark:bg-white/5 ${className}`} />;
};

export const SkeletonStat = () => (
  <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-12" />
      </div>
    </div>
  </div>
);

export const SkeletonTableRow = ({ columns = 5 }) => (
  <tr className="border-b border-white/5">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton className={`h-4 ${i === 0 ? "w-16" : "w-full"}`} />
      </td>
    ))}
  </tr>
);

export const SkeletonGridItem = () => (
  <Skeleton className="h-10 w-full rounded-lg" />
);

export const SkeletonForm = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  </div>
);

export default Skeleton;
