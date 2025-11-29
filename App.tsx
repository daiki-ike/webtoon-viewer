import React, { useState, useEffect } from 'react';
import { Uploader } from './components/Uploader';
import { Reader } from './components/Reader';
import { WebtoonImage, ViewMode } from './types';
import { v4 as uuidv4 } from 'uuid';

// あなたのGitHub画像の直リンク
const DEFAULT_COMIC_URL = 'https://raw.githubusercontent.com/daiki-ike/webtoon-viewer/main/comic.png';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.UPLOAD);
  const [images, setImages] = useState<WebtoonImage[]>([]);
  // 初期読み込み中かどうかを判定するフラグ
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initApp = () => {
      // 1. URLパラメータ(?src=...)があるか確認
      const params = new URLSearchParams(window.location.search);
      const srcParam = params.get('src');

      // 2. パラメータがあればそれを、なければデフォルト画像(comic.png)を使用
      const targetUrl = srcParam ? decodeURIComponent(srcParam) : DEFAULT_COMIC_URL;

      if (targetUrl) {
        console.log("Loading target URL:", targetUrl);
        // カンマ区切りで複数画像にも対応
        const urls = targetUrl.split(',');
        const loadedImages: WebtoonImage[] = urls.map((url, index) => ({
          id: `url-${index}-${Date.now()}`,
          previewUrl: url.trim(),
          name: `Page ${index + 1}`
        }));
        
        setImages(loadedImages);
        setViewMode(ViewMode.READER);
      }
      
      // 読み込み完了（少しだけ待機してLoadingを見せる）
      setTimeout(() => {
        setIsInitializing(false);
      }, 800);
    };

    initApp();
  }, []);

  const handleImagesSelected = (files: File[]) => {
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
    // 戻るボタンを押したときはURLパラメータを消してアップロード画面に戻す
    window.history.pushState({}, '', window.location.pathname);
    setImages([]);
    setViewMode(ViewMode.UPLOAD);
  };

  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.file) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [images]);

  // 初期化中（ローディング画面）
  if (isInitializing) {
    return (
      <div className="h-full w-full bg-gray-900 text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center space-y-2">
          <p className="text-xl font-bold animate-pulse">Loading Comic...</p>
          <p className="text-sm text-gray-400">Please wait a moment</p>
        </div>
      </div>
    );
  }

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
