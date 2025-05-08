
// Since we can't modify PdfExport.tsx (it's in read-only-files),
// let's create a patch component that can be used instead

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLanguage } from "@/contexts/LanguageContext";

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
      
      // Summary
      doc.setFontSize(14);
      doc.text("Document Summary", 20, doc.lastAutoTable.finalY + 10);
      doc.setFontSize(11);
      doc.text(sentimentData.summary || "No summary available", 20, doc.lastAutoTable.finalY + 20, {
        maxWidth: 170,
      });
      
      // Sentiment Overview
      let yPos = doc.lastAutoTable.finalY + 50;
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
        yPos = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.text("Sentiment Distribution", 20, yPos);
        
        autoTable(doc, {
          startY: yPos + 5,
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
        yPos = doc.lastAutoTable.finalY + 10;
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
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
        yPos = doc.lastAutoTable.finalY + 10;
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
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
  
  return (
    <Card className="border border-border shadow-md bg-white">
      <CardHeader>
        <CardTitle>Export Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t("exportDescription")}
        </p>
        <Button
          onClick={exportToPdf}
          className="w-full"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export to PDF
        </Button>
      </CardContent>
    </Card>
  );
};
