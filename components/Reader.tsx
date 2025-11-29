import React, { useRef, useState } from 'react';
import { WebtoonImage } from '../types';
import { ChevronLeft, ZoomIn, ZoomOut, Maximize, Share2, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ReaderProps {
  images: WebtoonImage[];
  onBack: () => void;
}

export const Reader: React.FC<ReaderProps> = ({ images, onBack }) => {
  const [showControls, setShowControls] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // 画面タップでコントロールの表示/非表示を切り替え
  const handleToggleControls = () => {
    setShowControls(prev => !prev);
  };

  const isSharedLink = window.location.search.includes('src=');

  // コントロール用の共通クラス（アニメーション付き）
  const controlClass = `pointer-events-auto transition-all duration-300 ${
    showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
  }`;

  return (
    <div className="relative h-full w-full flex overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col h-full bg-black">
        
        {/* Top Controls Toolbar (Sticky Overlay) */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-start pointer-events-none">
          {/* Back Button - 共有リンクからのアクセス時は非表示 */}
          {!isSharedLink && (
            <div className={controlClass}>
              <Button variant="secondary" onClick={(e) => { e.stopPropagation(); onBack(); }} className="shadow-lg backdrop-blur-md bg-gray-900/80">
                <ChevronLeft className="w-4 h-4 mr-1" /> Library
              </Button>
            </div>
          )}

          {/* Right Controls (Zoom & Share) */}
          <div className={`flex flex-col gap-2 items-end ${controlClass}`}>
            <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-1 shadow-lg flex flex-col gap-1 pointer-events-auto" onClick={e => e.stopPropagation()}>
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

            {isSharedLink && (
              <Button 
                variant="secondary"
                onClick={handleShare}
                className="shadow-lg shadow-blue-900/50 pointer-events-auto"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Reader */}
        <div 
          ref={scrollContainerRef}
          onClick={handleToggleControls}
          className="h-full overflow-y-auto no-scrollbar scroll-smooth bg-[#121212] cursor-pointer"
        >
          <div 
            className="mx-auto transition-transform duration-200 origin-top min-h-screen"
            style={{ 
              maxWidth: '768px', 
              width: '100%',
              transform: `scale(${zoom})`,
              marginBottom: '50vh'
            }}
          >
            {images.map((img) => (
              <ImageLoader key={img.id} src={img.previewUrl} alt={img.name} />
            ))}
            
            {/* End of Content Marker */}
            <div className="py-12 text-center text-gray-600">
              <p className="text-sm">End of Episode</p>
              <div className="w-12 h-1 bg-gray-700 mx-auto mt-4 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component to handle individual image loading states
const ImageLoader: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [status, setStatus] = useState<'loading' | 'error' | 'loaded'>('loading');

  return (
    <div className="relative w-full min-h-[300px] bg-gray-900">
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      )}
      
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2 p-4 text-center border border-gray-800">
          <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-sm font-medium text-white">Load Failed</p>
          <Button 
            variant="secondary" 
            onClick={(e) => {
              e.stopPropagation();
              setStatus('loading');
              const newSrc = src.includes('?') ? `${src}&t=${Date.now()}` : `${src}?t=${Date.now()}`;
              const img = new Image();
              img.src = newSrc;
              img.onload = () => setStatus('loaded');
              img.onerror = () => setStatus('error');
            }}
            className="mt-2 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Retry
          </Button>
        </div>
      )}

      <img 
        src={src}
        alt={alt}
        className={`w-full h-auto block transition-opacity duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        loading="eager"
      />
    </div>
  );
};
