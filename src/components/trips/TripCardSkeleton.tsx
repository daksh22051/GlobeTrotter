import React from 'react';

interface TripCardSkeletonProps {
  viewMode?: 'grid' | 'list';
  count?: number;
}

export const TripCardSkeleton: React.FC<TripCardSkeletonProps> = ({
  viewMode = 'grid',
  count = 3,
}) => {
  const items = Array.from({ length: count });

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {items.map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#EAE6DD] rounded-2xl p-4 flex items-center gap-4 animate-pulse"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F4F1EA] rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#F4F1EA] rounded-md w-1/3" />
              <div className="h-5 bg-[#F4F1EA] rounded-md w-2/3" />
              <div className="h-3 bg-[#F4F1EA] rounded-md w-1/2" />
            </div>
            <div className="hidden sm:block w-28 h-8 bg-[#F4F1EA] rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl border border-[#EAE6DD] overflow-hidden animate-pulse flex flex-col"
        >
          <div className="h-48 bg-[#F4F1EA] w-full" />
          <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-3.5 bg-[#F4F1EA] rounded-md w-1/3" />
              <div className="h-5 bg-[#F4F1EA] rounded-md w-3/4" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 bg-[#F4F1EA] rounded-xl" />
              <div className="h-12 bg-[#F4F1EA] rounded-xl" />
            </div>
            <div className="h-2 bg-[#F4F1EA] rounded-full w-full" />
            <div className="h-9 bg-[#F4F1EA] rounded-2xl w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
