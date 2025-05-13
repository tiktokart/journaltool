
import React from 'react';

interface FullTextSectionProps {
  entryText: string;
}

const FullTextSection: React.FC<FullTextSectionProps> = ({ entryText }) => {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-3 font-pacifico">Full Text</h3>
      <div className="p-4 bg-gray-50 rounded-lg border">
        <pre className="whitespace-pre-wrap text-sm font-georgia">{entryText}</pre>
      </div>
    </div>
  );
};

export default FullTextSection;
