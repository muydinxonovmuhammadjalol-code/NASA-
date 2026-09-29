export type Language = 'uz' | 'en' | 'ru';

export type AppTab = 'chat' | 'studio' | 'tools' | 'gallery';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  groundingSources?: GroundingSource[];
  isVoiceInput?: boolean;
}

export interface VideoJob {
  id: string;
  operationName?: string;
  prompt: string;
  imageUrl?: string;
  status: 'idle' | 'generating' | 'rendering' | 'completed' | 'failed';
  videoUrl?: string;
  duration?: number;
  aspectRatio?: '16:9' | '9:16';
  style?: string;
  progress?: number;
  error?: string;
}

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  prompt: string;
  timestamp: number;
  title: string;
}
