import React, { useState, useEffect } from 'react';
import { Uploader } from './components/Uploader';
import { Reader } from './components/Reader';
import { WebtoonImage, ViewMode } from './types';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.UPLOAD);
  const [images, setImages] = useState<WebtoonImage[]>([]);

  useEffect(() => {
    // Check for query parameters to load images from URL (Deep Linking)
    const params = new URLSearchParams(window.location.search);
    const srcParam = params.get('src');

    if (srcParam) {
      // Decode the URL in case it was encoded
      const decodedSrc = decodeURIComponent(srcParam);
      
      // Handle comma-separated URLs for multiple slices
      const urls = decodedSrc.split(',');
      const loadedImages: WebtoonImage[] = urls.map((url, index) => ({
        id: `url-${index}-${Date.now()}`,
        previewUrl: url.trim(),
        name: `Page ${index + 1}`
      }));
      
      setImages(loadedImages);
      setViewMode(ViewMode.READER);
    }
  }, []);

  const handleImagesSelected = (files: File[]) => {
    // Sort files by name to ensure correct order
    const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const newImages: WebtoonImage[] = sortedFiles.map(file => ({
      id: uuidv4(),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name
    }));

    setImages(newImages);
    setViewMode(ViewMode.READER);
  };

  const handleBack = () => {
    // Clear URL params when going back so refreshing doesn't lock user in reader
    window.history.pushState({}, '', window.location.pathname);
    setImages([]);
    setViewMode(ViewMode.UPLOAD);
  };

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.file) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [images]);

  return (
    <div className="h-full w-full bg-gray-900 text-white font-sans antialiased selection:bg-blue-500/30">
      {viewMode === ViewMode.UPLOAD ? (
        <Uploader onImagesSelected={handleImagesSelected} />
      ) : (
        <Reader images={images} onBack={handleBack} />
      )}
    </div>
  );
};

export default App;