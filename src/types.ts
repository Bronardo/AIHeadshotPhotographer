export type StyleCategory = 'all' | 'corporate' | 'tech' | 'outdoor' | 'editorial';

export type AspectRatioType = '1:1' | '3:4';

export interface HeadshotStyle {
  id: string;
  title: string;
  category: 'corporate' | 'tech' | 'outdoor' | 'editorial';
  tagline: string;
  description: string;
  backdrop: string;
  attire: string;
  lighting: string;
  previewUrl: string;
  tags: string[];
  recommendedExpression: string;
}

export interface GenerationSettings {
  styleId: string;
  attire: string;
  expression: string;
  aspectRatio: AspectRatioType;
  customNotes: string;
}

export interface HeadshotResult {
  id: string;
  createdAt: number;
  originalImage: string;
  generatedImage: string;
  styleTitle: string;
  styleId: string;
  aspectRatio: AspectRatioType;
  attire: string;
  expression: string;
  promptUsed?: string;
}

export interface SampleSelfie {
  id: string;
  name: string;
  description: string;
  url: string;
}
