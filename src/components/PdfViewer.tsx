
import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PdfViewerProps {
  pdfUrl: string;
  className?: string;
}

export const PdfViewer = ({ pdfUrl, className = '' }: PdfViewerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Clean up URL object when component unmounts
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Ensure the iframe has a unique title to avoid conflicts
  const iframeTitle = `pdf-viewer-${Date.now()}`;

  if (!pdfUrl) {
    return (
      <Card className={`border border-border ${className}`}>
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-muted-foreground">No PDF selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border border-border overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <iframe
          ref={iframeRef}
          src={pdfUrl}
          className="w-full h-[500px]"
          title={iframeTitle}
          sandbox="allow-scripts allow-same-origin"
          // Prevent iframe from capturing keyboard/mouse events that might interfere with 3D canvas
          tabIndex={-1}
          style={{ pointerEvents: 'auto' }}
        />
      </CardContent>
    </Card>
  );
};
