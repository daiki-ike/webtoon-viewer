import React, { useEffect, useRef, useState } from 'react';
import { WebtoonImage } from '../types';
import { ChevronLeft, MessageSquare, ZoomIn, ZoomOut, Maximize, Share2, Check } from 'lucide-react';
import { GeminiAssistant } from './GeminiAssistant';
import { Button } from './Button';

interface ReaderProps {
  images: WebtoonImage[];
  onBack: () => void;
}

export const Reader: React.FC<ReaderProps> = ({ images, onBack }) => {
  const [showAssistant, setShowAssistant] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Convert current view to base64 for AI context if needed
  const [currentBase64, setCurrentBase64] = useState<string | null>(null);

  // Helper to capture base64 of the first image for Gemini
  useEffect(() => {
    if (images.length > 0) {
      const img = images[0];
      
      // If we have the file object (Upload mode)
      if (img.file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCurrentBase64(reader.result as string);
        };
        reader.readAsDataURL(img.file);
      } 
      // If we only have URL (Shared/Hosted mode)
      else if (img.previewUrl) {
        fetch(img.previewUrl)
          .then(res => res.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => setCurrentBase64(reader.result as string);
            reader.readAsDataURL(blob);
          })
          .catch(err => {
            console.error("Failed to fetch image for AI analysis (likely CORS)", err);
            // Fallback or error handling could go here
          });
      }
    }
  }, [images]);

  const handleShare = async () => {
    // If we are in "URL mode", the URL is already shareable. 
    // If we are in "Upload mode", we can't share the local file easily.
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const isShareable = window.location.search.includes('src=');

  return (
    <div className="relative h-full w-full flex overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col h-full bg-black">
        
        {/* Top Controls Toolbar (Sticky) */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-start pointer-events-none">
          <Button variant="secondary" onClick={onBack} className="pointer-events-auto shadow-lg backdrop-blur-md bg-gray-900/80">
            <ChevronLeft className="w-4 h-4 mr-1" /> Library
          </Button>

          <div className="flex flex-col gap-2 items-end pointer-events-auto">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-1 shadow-lg flex flex-col gap-1">
               <button onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))} className="p-2 hover:bg-white/10 rounded" aria-label="Zoom In">
                 <ZoomIn className="w-5 h-5" />
               </button>
               <button onClick={() => setZoom(1)} className="p-2 hover:bg-white/10 rounded" aria-label="Reset Zoom">
                 <Maximize className="w-5 h-5" />
               </button>
               <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="p-2 hover:bg-white/10 rounded" aria-label="Zoom Out">
                 <ZoomOut className="w-5 h-5" />
               </button>
            </div>

            <div className="flex gap-2">
              {isShareable && (
                <Button 
                  variant="secondary"
                  onClick={handleShare}
                  className="shadow-lg shadow-blue-900/50"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                </Button>
              )}
              
              <Button 
                variant="primary" 
                onClick={() => setShowAssistant(!showAssistant)}
                className="shadow-lg shadow-blue-900/50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Analyze
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Reader */}
        <div 
          ref={scrollContainerRef}
          className="h-full overflow-y-auto no-scrollbar scroll-smooth bg-[#121212]"
        >
          <div 
            className="mx-auto transition-transform duration-200 origin-top"
            style={{ 
              maxWidth: '768px', 
              width: '100%',
              transform: `scale(${zoom})`,
              marginBottom: '50vh' // Extra space at bottom
            }}
          >
            {images.map((img) => (
              <img 
                key={img.id}
                src={img.previewUrl}
                alt={img.name}
                className="w-full h-auto block"
                // Webtoons must have 0 gap, handled by block display
                loading="lazy"
              />
            ))}
            
            {/* End of Content Marker */}
            <div className="py-12 text-center text-gray-600">
              <p className="text-sm">End of Episode</p>
              <div className="w-12 h-1 bg-gray-700 mx-auto mt-4 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Side Panel */}
      {showAssistant && (
        <GeminiAssistant 
          currentImageBase64={currentBase64} 
          onClose={() => setShowAssistant(false)} 
        />
      )}
    </div>
  );
};