
import React from 'react';

interface ContentOverviewProps {
  documentStats: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
  };
  subjects: any[];
  actions: any[];
}

const ContentOverview: React.FC<ContentOverviewProps> = ({
  documentStats,
  subjects,
  actions
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-medium mb-3">Content Overview</h3>
        <div>
          <p className="mb-4">Document Statistics</p>
          <p className="text-gray-700 mb-1">
            This document contains {documentStats.wordCount || 0} words, 
            {documentStats.sentenceCount || 0} sentences, and 
            approximately {documentStats.paragraphCount || 0} paragraphs.
          </p>
        </div>
        
        <div className="mt-6">
          <p className="mb-4">Document Structure</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{documentStats.wordCount || 0}</p>
              <p className="text-sm text-gray-600">Words</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">{documentStats.sentenceCount || 0}</p>
              <p className="text-sm text-gray-600">Sentences</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {documentStats.paragraphCount || 0}
              </p>
              <p className="text-sm text-gray-600">Paragraphs</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-medium mb-3">Content Analysis</h3>
        
        {/* Main Subjects - Nouns, Objects, Concepts */}
        <div className="mb-5">
          <h4 className="text-md font-medium mb-2">Main Subjects</h4>
          <div className="flex flex-wrap gap-2">
            {subjects && subjects.length > 0 ? subjects.slice(0, 7).map((subject: any, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm"
              >
                {subject.word || subject.text}
              </span>
            )) : (
              <p className="text-gray-500">No main subjects detected</p>
            )}
          </div>
        </div>
        
        {/* Emotional Analysis - Actions, Verbs */}
        <div>
          <h4 className="text-md font-medium mb-2">Emotional Analysis</h4>
          <div className="flex flex-wrap gap-2">
            {actions && actions.length > 0 ? actions.slice(0, 5).map((action: any, index: number) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-sm text-white"
                style={{ 
                  backgroundColor: action.color || 
                    (action.sentiment && action.sentiment > 0.5 ? '#68D391' : '#FC8181')
                }}
              >
                {action.word || action.text}
              </span>
            )) : (
              <p className="text-gray-500">No emotional keywords detected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentOverview;
