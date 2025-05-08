import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLanguage } from "@/contexts/LanguageContext";
import { v4 as uuidv4 } from 'uuid';

interface PdfExportProps {
  sentimentData: any;
}

export const PdfExport = ({ sentimentData }: PdfExportProps) => {
  const { t } = useLanguage();
  
  const exportToPdf = () => {
    try {
      toast.info("Preparing PDF export...");
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text("Document Analysis Report", 20, 20);
      
      // File Information
      doc.setFontSize(14);
      doc.text("File Information", 20, 30);
      
      autoTable(doc, {
        startY: 35,
        head: [["Property", "Value"]],
        body: [
          ["File Name", sentimentData.fileName || "Unknown"],
          ["File Size", `${(sentimentData.fileSize / 1024 / 1024).toFixed(2)} MB`],
          ["Word Count", sentimentData.wordCount?.toString() || "0"],
        ],
      });
      
      // Get the final Y position after the table
      const firstTableEndY = (doc as any).lastAutoTable?.finalY || 60;
      
      // Summary
      doc.setFontSize(14);
      doc.text("Document Summary", 20, firstTableEndY + 10);
      doc.setFontSize(11);
      doc.text(sentimentData.summary || "No summary available", 20, firstTableEndY + 20, {
        maxWidth: 170,
      });
      
      // Sentiment Overview
      let yPos = firstTableEndY + 50;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.text("Sentiment Overview", 20, yPos);
      
      if (sentimentData.overallSentiment) {
        autoTable(doc, {
          startY: yPos + 5,
          head: [["Sentiment", "Score"]],
          body: [
            [
              sentimentData.overallSentiment.label || "Neutral", 
              (sentimentData.overallSentiment.score * 10).toFixed(1) + "/10"
            ],
          ],
        });
      }
      
      // Distribution
      if (sentimentData.distribution) {
        const overviewTableEndY = (doc as any).lastAutoTable?.finalY || (yPos + 20);
        doc.setFontSize(14);
        doc.text("Sentiment Distribution", 20, overviewTableEndY + 10);
        
        autoTable(doc, {
          startY: overviewTableEndY + 15,
          head: [["Category", "Percentage"]],
          body: [
            ["Positive", `${sentimentData.distribution.positive}%`],
            ["Neutral", `${sentimentData.distribution.neutral}%`],
            ["Negative", `${sentimentData.distribution.negative}%`],
          ],
        });
      }
      
      // Key Phrases
      if (sentimentData.keyPhrases && sentimentData.keyPhrases.length > 0) {
        const distributionTableEndY = (doc as any).lastAutoTable?.finalY || (yPos + 40);
        if (distributionTableEndY > 250) {
          doc.addPage();
          yPos = 20;
        } else {
          yPos = distributionTableEndY + 10;
        }
        
        doc.setFontSize(14);
        doc.text("Key Phrases", 20, yPos);
        
        const keyPhraseRows = sentimentData.keyPhrases.map((phrase: string) => [phrase]);
        
        autoTable(doc, {
          startY: yPos + 5,
          head: [["Phrase"]],
          body: keyPhraseRows.slice(0, 10), // Limit to 10 key phrases
        });
      }
      
      // Entities
      if (sentimentData.entities && sentimentData.entities.length > 0) {
        const keyPhrasesTableEndY = (doc as any).lastAutoTable?.finalY || (yPos + 20);
        if (keyPhrasesTableEndY > 250) {
          doc.addPage();
          yPos = 20;
        } else {
          yPos = keyPhrasesTableEndY + 10;
        }
        
        doc.setFontSize(14);
        doc.text("Entities", 20, yPos);
        
        const entityRows = sentimentData.entities.map((entity: any) => [
          entity.name,
          entity.type,
          entity.sentiment ? (entity.sentiment * 10).toFixed(1) + "/10" : "N/A",
        ]);
        
        autoTable(doc, {
          startY: yPos + 5,
          head: [["Name", "Type", "Sentiment"]],
          body: entityRows.slice(0, 10), // Limit to 10 entities
        });
      }
      
      // Analysis Source
      doc.setFontSize(10);
      doc.text(
        `Analysis Source: ${sentimentData.sourceDescription || "Default Analysis"}`,
        20,
        285
      );
      
      // Save the PDF
      doc.save("document-analysis.pdf");
      
      toast.success("PDF export completed successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    }
  };
  
  const addToJournalEntries = () => {
    try {
      if (!sentimentData.text && !sentimentData.pdfText) {
        toast.error("No text content available to add to journal entries");
        return;
      }
      
      const textContent = sentimentData.text || sentimentData.pdfText;
      
      const entry = {
        id: uuidv4(),
        text: textContent,
        date: new Date().toISOString()
      };
      
      const storedEntries = localStorage.getItem('journalEntries');
      const entries = storedEntries ? JSON.parse(storedEntries) : [];
      entries.push(entry);
      
      localStorage.setItem('journalEntries', JSON.stringify(entries));
      toast.success("Added to journal entries");
    } catch (error) {
      console.error("Error adding to journal entries:", error);
      toast.error("Failed to add to journal entries");
    }
  };
  
  const addToMonthlyReflections = () => {
    try {
      if (!sentimentData.text && !sentimentData.pdfText) {
        toast.error("No text content available to add to monthly reflections");
        return;
      }
      
      const textContent = sentimentData.text || sentimentData.pdfText;
      
      const reflection = {
        id: uuidv4(),
        text: textContent,
        date: new Date().toISOString()
      };
      
      const storedReflections = localStorage.getItem('monthlyReflections');
      const reflections = storedReflections ? JSON.parse(storedReflections) : [];
      reflections.push(reflection);
      
      localStorage.setItem('monthlyReflections', JSON.stringify(reflections));
      toast.success("Added to monthly reflections");
    } catch (error) {
      console.error("Error adding to monthly reflections:", error);
      toast.error("Failed to add to monthly reflections");
    }
  };
  
  return (
    <Card className="border border-border shadow-md bg-white">
      <CardHeader>
        <CardTitle>Export Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <Button
            onClick={exportToPdf}
            className="w-full"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
          
          <Button
            onClick={addToJournalEntries}
            variant="outline"
            className="w-full border-orange text-orange hover:bg-orange/10"
          >
            <FileText className="mr-2 h-4 w-4" />
            Add to Journal Entries
          </Button>
          
          <Button
            onClick={addToMonthlyReflections}
            variant="outline"
            className="w-full border-orange text-orange hover:bg-orange/10"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Add to Monthly Reflections
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
