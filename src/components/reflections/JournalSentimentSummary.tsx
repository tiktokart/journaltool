
interface JournalSentimentSummaryProps {
  overallSentimentChange: string;
  averageSentiment: number;
  journalEntryCount: number;
  getSentimentColor: (sentiment: number) => string;
}

const JournalSentimentSummary = ({
  overallSentimentChange,
  averageSentiment,
  journalEntryCount,
  getSentimentColor
}: JournalSentimentSummaryProps) => {
  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2 text-black">Monthly Sentiment Summary</h3>
      <div className="bg-white p-3 rounded-md shadow-sm">
        <p className="text-sm mb-2 text-black">
          <span className="font-semibold">Overall Trend: </span> 
          {overallSentimentChange}
        </p>
        <p className="text-sm mb-2 text-black">
          <span className="font-semibold">Average Sentiment: </span> 
          {averageSentiment} 
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs text-white" 
            style={{backgroundColor: getSentimentColor(averageSentiment)}}>
            {averageSentiment >= 0.7 ? "Very Positive" : 
             averageSentiment >= 0.5 ? "Positive" : 
             averageSentiment >= 0.4 ? "Neutral" : 
             averageSentiment >= 0.3 ? "Negative" : "Very Negative"}
          </span>
        </p>
        <p className="text-sm text-black">
          <span className="font-semibold">Journal Entries Analyzed: </span> 
          {journalEntryCount}
        </p>
      </div>
    </div>
  );
};

export default JournalSentimentSummary;
