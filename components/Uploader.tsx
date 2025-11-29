import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from './Button';

interface UploaderProps {
  onImagesSelected: (files: File[]) => void;
}

export const Uploader: React.FC<UploaderProps> = ({ onImagesSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImagesSelected(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImagesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      const encodedUrl = encodeURIComponent(urlInput.trim());
      window.location.href = `?src=${encodedUrl}`;
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center h-full w-full p-6 animate-fade-in overflow-y-auto"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="max-w-md w-full text-center space-y-8 my-auto">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Webtoon Reader
          </h1>
          <p className="text-gray-400">
            Webtoon形式の画像をアップロードするか、URLを入力してください。
          </p>
        </div>

        {/* Local File Upload */}
        <div 
          className="border-2 border-dashed border-gray-700 rounded-2xl p-8 hover:border-blue-500 transition-colors cursor-pointer bg-gray-800/50 group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-700 group-hover:bg-gray-600 rounded-full transition-colors">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-lg text-gray-200">画像ファイルを選択</p>
              <p className="text-sm text-gray-500">768x8000px などの縦長画像に対応</p>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            multiple 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-500">または URL から読み込む</span>
          </div>
        </div>

        {/* URL Input */}
        <form onSubmit={handleUrlSubmit} className="bg-gray-800/30 p-1 rounded-xl border border-gray-700 flex focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <div className="pl-3 pr-2 flex items-center justify-center text-gray-500">
            <LinkIcon className="w-5 h-5" />
          </div>
          <input 
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="画像のURL (例: https://.../comic.png)"
            className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 text-sm py-3"
          />
          <Button 
            type="submit" 
            disabled={!urlInput.trim()}
            className="rounded-lg m-1 px-3"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        </form>

        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/50 text-left flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
          <div className="text-sm text-blue-200 space-y-1">
            <p className="font-semibold">友達に共有する方法:</p>
            <ol className="list-decimal list-inside opacity-80 space-y-1">
              <li>このアプリをデプロイ（公開）します。</li>
              <li>画像ファイル(png等)をアプリと同じ場所に置きます。</li>
              <li><code>?src=/あなたの画像名.png</code> をURLの末尾につけて友達に送ります。</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};