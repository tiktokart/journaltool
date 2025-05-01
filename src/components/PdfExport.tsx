
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Point } from "@/types/embedding";
import { getEmotionColor } from "@/utils/embeddingUtils";

interface PdfExportProps {
  sentimentData: any;
}

export const PdfExport = ({ sentimentData }: PdfExportProps) => {
  const { t } = useLanguage();

  const exportToPdf = () => {
    if (!sentimentData) {
      toast.error(t("noDataToExport"));
      return;
    }

    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(18);
      doc.text(t("documentAnalysisReport"), pageWidth / 2, 20, { align: "center" });
      
      // Add file information
      doc.setFontSize(14);
      doc.text(t("fileInformation"), 14, 35);
      doc.setFontSize(12);
      doc.text(`${t("fileName")}: ${sentimentData.fileName || "Unknown"}`, 14, 45);
      doc.text(`${t("fileSize")}: ${((sentimentData.fileSize || 0) / 1024 / 1024).toFixed(2)} MB`, 14, 52);
      doc.text(`${t("wordCount")}: ${sentimentData.wordCount || 0}`, 14, 59);
      
      // Add summary
      doc.setFontSize(14);
      doc.text(t("documentSummary"), 14, 70);
      doc.setFontSize(12);
      const splitSummary = doc.splitTextToSize(
        sentimentData.summary || t("noSummaryAvailable"), 
        pageWidth - 30
      );
      doc.text(splitSummary, 14, 80);
      
      // Add sentiment information
      const yPos = 80 + splitSummary.length * 7;
      doc.setFontSize(14);
      doc.text(t("sentimentAnalysis"), 14, yPos);
      doc.setFontSize(12);
      
      if (sentimentData.overallSentiment) {
        doc.text(
          `${t("overallSentiment")}: ${sentimentData.overallSentiment.label || "Unknown"} (${(sentimentData.overallSentiment.score * 10).toFixed(1)}/10)`, 
          14, 
          yPos + 10
        );
      }
      
      // Add sentiment distribution
      if (sentimentData.distribution) {
        doc.text(t("sentimentDistribution"), 14, yPos + 20);
        doc.text(`${t("positive")}: ${sentimentData.distribution.positive || 0}%`, 20, yPos + 30);
        doc.text(`${t("neutral")}: ${sentimentData.distribution.neutral || 0}%`, 20, yPos + 37);
        doc.text(`${t("negative")}: ${sentimentData.distribution.negative || 0}%`, 20, yPos + 44);
      }
      
      // Add key phrases if available
      if (sentimentData.keyPhrases && sentimentData.keyPhrases.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text(t("keyPhrases"), 14, 20);
        doc.setFontSize(12);
        
        // Create table for key phrases
        autoTable(doc, {
          startY: 30,
          head: [[t("phrase"), t("sentiment"), t("frequency")]],
          body: sentimentData.keyPhrases.slice(0, 20).map((phrase: any) => [
            phrase.text,
            t(phrase.sentiment),
            phrase.count
          ]),
          theme: 'grid',
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255
          }
        });
      }
      
      // Add entities/themes if available
      if (sentimentData.entities && sentimentData.entities.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text(t("themeAnalysisTitle"), 14, 20);
        doc.setFontSize(12);
        
        // Create table for entities/themes
        autoTable(doc, {
          startY: 30,
          head: [[t("theme"), t("score"), t("mentions")]],
          body: sentimentData.entities.map((entity: any) => [
            entity.name,
            (entity.score * 10).toFixed(1) + "/10",
            entity.mentions
          ]),
          theme: 'grid',
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255
          }
        });
      }
      
      // Add emotional tones if available
      if (sentimentData.embeddingPoints && sentimentData.embeddingPoints.length > 0) {
        // Count occurrences of each emotional tone
        const emotionalToneCounts = sentimentData.embeddingPoints.reduce((acc: any, point: any) => {
          const tone = point.emotionalTone || "Neutral";
          acc[tone] = (acc[tone] || 0) + 1;
          return acc;
        }, {});
        
        // Sort by count
        const sortedTones = Object.entries(emotionalToneCounts)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 10);
        
        if (sortedTones.length > 0) {
          doc.addPage();
          doc.setFontSize(14);
          doc.text(t("emotionalTones"), 14, 20);
          doc.setFontSize(12);
          
          // Create table for emotional tones
          autoTable(doc, {
            startY: 30,
            head: [[t("emotion"), t("occurrences")]],
            body: sortedTones.map(([tone, count]) => [
              t(tone.toLowerCase()) || tone,
              count
            ]),
            theme: 'grid',
            headStyles: {
              fillColor: [41, 128, 185],
              textColor: 255
            }
          });
        }
      }
      
      // Add document text with emotional highlights
      if (sentimentData.embeddingPoints && sentimentData.embeddingPoints.length > 0 && sentimentData.pdfTextLength > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text(t("documentTextVisualization"), 14, 20);
        doc.setFontSize(12);
        
        // Add a legend for emotional tones
        doc.text(t("emotionColorLegend"), 14, 30);
        
        // Get unique emotional tones
        const uniqueTones = Array.from(new Set(
          sentimentData.embeddingPoints
            .filter((point: Point) => point.emotionalTone)
            .map((point: Point) => point.emotionalTone)
        )).slice(0, 8); // Limit to top 8 emotions
        
        // Draw the color legend
        uniqueTones.forEach((tone, index) => {
          const color = getEmotionColor(tone as string, 1);
          // Convert color from rgba to rgb format for jsPDF
          const rgbColor = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)?.slice(1).map(Number);
          
          if (rgbColor) {
            // Draw colored rectangle
            doc.setFillColor(rgbColor[0], rgbColor[1], rgbColor[2]);
            doc.rect(14, 34 + index * 7, 5, 5, 'F');
            
            // Add emotion label
            doc.text(tone as string, 24, 38 + index * 7);
          }
        });
        
        // Create word emotion map
        const wordEmotionMap = new Map();
        sentimentData.embeddingPoints.forEach((point: Point) => {
          if (point.word && point.emotionalTone) {
            wordEmotionMap.set(point.word.toLowerCase(), point.emotionalTone);
          }
        });
        
        // Process the text content for the PDF
        const pdfText = sentimentData.pdfText || "";
        const pageMaxHeight = doc.internal.pageSize.getHeight() - 20; // Bottom margin
        const maxWidth = pageWidth - 30; // Left and right margins
        let startY = 50; // Start position after the legend
        
        // Split text into chunks that will fit on pages
        const words = pdfText.split(/\s+/);
        let currentLine = "";
        let currentLineWords = [];
        
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const emotion = wordEmotionMap.get(word.toLowerCase());
          
          // If adding this word would make the line too long, start a new line
          if (doc.getStringUnitWidth(currentLine + " " + word) * doc.internal.getFontSize() / doc.internal.scaleFactor > maxWidth) {
            // If we need a new page
            if (startY > pageMaxHeight) {
              doc.addPage();
              startY = 20; // Reset to top of new page
            }
            
            // Print current line with emotional highlighting
            printLineWithEmotions(doc, currentLineWords, wordEmotionMap, 14, startY, maxWidth);
            
            currentLine = word;
            currentLineWords = [word];
            startY += 7; // Line height
          } else {
            currentLine += (currentLine ? " " : "") + word;
            currentLineWords.push(word);
          }
        }
        
        // Print the last line if there's anything left
        if (currentLineWords.length > 0) {
          if (startY > pageMaxHeight) {
            doc.addPage();
            startY = 20;
          }
          printLineWithEmotions(doc, currentLineWords, wordEmotionMap, 14, startY, maxWidth);
        }
      }
      
      // Add source information in footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `${sentimentData.sourceDescription || t("documentAnalysis")} - ${t("generatedOn")} ${new Date().toLocaleDateString()}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
        doc.text(
          `${t("page")} ${i} ${t("of")} ${totalPages}`,
          pageWidth - 20,
          doc.internal.pageSize.getHeight() - 10
        );
      }
      
      // Save the PDF
      doc.save(`${sentimentData.fileName || "document"}_analysis.pdf`);
      
      toast.success(t("exportSuccess"));
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error(t("exportError"));
    }
  };
  
  // Helper function to print a line with emotional highlighting
  const printLineWithEmotions = (
    doc: jsPDF, 
    words: string[], 
    wordEmotionMap: Map<string, string>,
    x: number,
    y: number,
    maxWidth: number
  ) => {
    let currentX = x;
    const fontSize = doc.internal.getFontSize();
    
    words.forEach((word, index) => {
      const emotion = wordEmotionMap.get(word.toLowerCase());
      const spaceWidth = doc.getStringUnitWidth(" ") * fontSize / doc.internal.scaleFactor;
      const wordWidth = doc.getStringUnitWidth(word) * fontSize / doc.internal.scaleFactor;
      
      // Add space before words (except first word)
      if (index > 0) {
        currentX += spaceWidth;
      }
      
      // Check if word would go beyond page width and wrap if needed
      if (currentX + wordWidth > x + maxWidth) {
        y += 7; // Move to next line
        currentX = x; // Reset x position
      }
      
      // If word has an emotion, highlight it
      if (emotion) {
        const color = getEmotionColor(emotion, 0.3);
        const rgbColor = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)?.slice(1).map(Number);
        
        if (rgbColor) {
          // Add highlight
          doc.setFillColor(rgbColor[0], rgbColor[1], rgbColor[2]);
          // Add padding around text
          const padding = 1;
          doc.rect(currentX - padding, y - fontSize + padding, wordWidth + (padding * 2), fontSize + (padding * 2), 'F');
        }
      }
      
      // Add word text
      doc.text(word, currentX, y);
      
      // Move position forward
      currentX += wordWidth;
    });
  };

  return (
    <Card className="border border-border shadow-md bg-card mt-8">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          {t("exportAnalysis")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground mb-4">
            {t("exportDescription")}
          </p>
          <Button 
            onClick={exportToPdf} 
            className="self-start"
          >
            <FileText className="h-4 w-4 mr-2" />
            {t("exportToPdf")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
