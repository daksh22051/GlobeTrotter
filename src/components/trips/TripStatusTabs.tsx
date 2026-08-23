import React from 'react';
import { StatusFilter } from '../../utils/tripFilters';
import { TripStatusCounts } from '../../utils/tripStatus';
import { Compass, Calendar, Clock, CheckCircle2, FileEdit } from 'lucide-react';

interface TripStatusTabsProps {
  activeStatus: StatusFilter;
  onSelectStatus: (status: StatusFilter) => void;
  counts: TripStatusCounts;
}

export const TripStatusTabs: React.FC<TripStatusTabsProps> = ({
  activeStatus,
  onSelectStatus,
  counts,
}) => {
  const tabs: {
    id: StatusFilter;
    label: string;
    count: number;
    icon: React.ReactNode;
    activeColor: string;
  }[] = [
    {
      id: 'all',
      label: 'All Journeys',
      count: counts.all,
      icon: <Compass className="w-3.5 h-3.5" />,
      activeColor: 'bg-[#17201D] text-white',
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      count: counts.upcoming,
      icon: <Calendar className="w-3.5 h-3.5 text-[#FF6B4A]" />,
      activeColor: 'bg-[#17201D] text-white',
    },
    {
      id: 'ongoing',
      label: 'Ongoing',
      count: counts.ongoing,
      icon: <Clock className="w-3.5 h-3.5 text-[#20B8A6]" />,
      activeColor: 'bg-[#17201D] text-white',
    },
    {
      id: 'completed',
      label: 'Completed',
      count: counts.completed,
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#556960]" />,
      activeColor: 'bg-[#17201D] text-white',
    },
    {
      id: 'draft',
      label: 'Drafts',
      count: counts.drafts,
      icon: <FileEdit className="w-3.5 h-3.5 text-[#E08A00]" />,
      activeColor: 'bg-[#17201D] text-white',
    },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
      {tabs.map((tab) => {
        const isActive = activeStatus === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectStatus(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? `${tab.activeColor} shadow-sm`
                : 'bg-white border border-[#EAE6DD] text-[#556960] hover:text-[#17201D] hover:border-[#17201D]/40 hover:bg-[#F9F7F1]'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
