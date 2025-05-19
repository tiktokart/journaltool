
import React from 'react';
import { format } from 'date-fns';

interface ResolvedEntriesProps {
  entries: Array<{
    id: string;
    text: string;
    date: string;
  }>;
}

const ResolvedEntries: React.FC<ResolvedEntriesProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No resolved entries yet</p>
        <p className="text-sm mt-1">Pop bubbles to resolve journal entries</p>
      </div>
    );
  }

  return (
    <div className="max-h-[300px] overflow-y-auto">
      {entries.map(entry => (
        <div key={entry.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
          <div className="flex justify-between items-start">
            <span className="text-xs text-gray-500">
              {format(new Date(entry.date), 'MMM d, yyyy - h:mm a')}
            </span>
            <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
              Resolved
            </span>
          </div>
          <p className="text-sm mt-1 line-clamp-2">{entry.text}</p>
        </div>
      ))}
    </div>
  );
};

export default ResolvedEntries;
