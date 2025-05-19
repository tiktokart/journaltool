
import React from 'react';
import { format } from 'date-fns';

interface WeekNavigatorProps {
  currentWeekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  currentWeekStart,
  onPreviousWeek,
  onNextWeek
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <button
        onClick={onPreviousWeek}
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        &larr; Previous
      </button>
      <h3 className="font-medium">
        Week of {format(currentWeekStart, 'MMMM d, yyyy')}
      </h3>
      <button
        onClick={onNextWeek}
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        Next &rarr;
      </button>
    </div>
  );
};

export default WeekNavigator;
