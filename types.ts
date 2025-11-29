export interface WebtoonImage {
  id: string;
  file?: File; // URL読み込みの場合はFileオブジェクトがないためOptionalに変更
  previewUrl: string;
  name: string;
}

export enum ViewMode {
  UPLOAD = 'UPLOAD',
  READER = 'READER'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}