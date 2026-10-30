export type BlockType = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'li' | 'blockquote' | 'code' | 'table';

export interface PolishRecord {
  id: string;
  originalTranslation: string;
  polishedText: string;
  style: string;
  explanation: string;
  timestamp: number;
}

export interface DocumentBlock {
  id: string;
  type: BlockType;
  sourceText: string;
  targetText: string;
  isTranslating?: boolean;
  isPolishing?: boolean;
  notes?: string;
  polishHistory?: PolishRecord[];
  tableData?: string[][]; // For 2D table structures
}

export interface Ao3WorkMeta {
  author?: string;
  fandoms?: string[];
  rating?: string; // 'General Audiences' | 'Teen And Up Audiences' | 'Mature' | 'Explicit' | 'Not Rated'
  warnings?: string[];
  categories?: string[]; // 'M/M' | 'F/M' | 'Gen' | 'F/F' | 'Multi' | 'Other'
  relationships?: string[]; // e.g. 'Character A/Character B'
  characters?: string[];
  additionalTags?: string[];
  series?: string;
  summary?: string;
  notes?: string;
  stats?: { words?: string; chapters?: string };
}

export interface DocumentMeta {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'html' | 'text' | 'ao3' | 'epub' | 'txt' | 'md';
  sourceLang: string;
  targetLang: string;
  createdAt: number;
  updatedAt: number;
  ao3Meta?: Ao3WorkMeta;
}

export type ViewMode = 'split' | 'interlinear' | 'target-only' | 'source-only';

export interface TypographyConfig {
  fontFamily: 'sans' | 'serif' | 'kaiti' | 'mono';
  fontSize: number; // 14 to 22
  lineHeight: number; // 1.5 to 2.2
  paragraphSpacing: number; // 8 to 28
  columnRatio: '50-50' | '45-55' | '55-45';
  highlightActive: boolean;
  sourceDimming: boolean;
  showBilingualNotes: boolean;
  keepEnglishNames: boolean; // Fanfiction convenience: retain original character names
}

export interface ThemeConfig {
  id: string;
  name: string;
  tag: string;
  appBg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  activeRowBg: string;
  accent: string;
  sourceBadge: string;
  targetBadge: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  systemDirective: string;
  stylePreference: string;
  isCustom?: boolean;
}

export interface GlossaryItem {
  id: string;
  term: string;
  translation: string;
  enabled: boolean;
  notes?: string;
}

export interface Bookmark {
  id: string;
  blockId: string;
  blockIndex: number;
  previewText: string;
  sourcePreview: string;
  note?: string;
  createdAt: number;
}

export type PolishStyle =
  | 'faithfulness_elegance'
  | 'academic'
  | 'business'
  | 'colloquial'
  | 'tech_modern';

export interface BookshelfStory {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'html' | 'text' | 'ao3' | 'epub' | 'txt' | 'md';
  author?: string;
  fandoms?: string[];
  coverColor?: string;
  totalBlocks: number;
  translatedBlocks: number;
  estimatedWords?: string | number;
  updatedAt: number;
  createdAt: number;
  blocks: DocumentBlock[];
  bookmarks: Bookmark[];
  ao3Meta?: Ao3WorkMeta;
  sourceLang?: string;
  targetLang?: string;
}

export type ApiProviderType =
  | 'gemini_default'
  | 'mymemory_free'
  | 'deepseek'
  | 'groq'
  | 'siliconflow'
  | 'openrouter'
  | 'moonshot'
  | 'gemini_custom'
  | 'custom_openai';

export interface ApiProviderPreset {
  id: ApiProviderType;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  requiresKey: boolean;
  isFree: boolean;
  defaultEndpoint: string;
  defaultModel: string;
  availableModels: string[];
  keyPlaceholder: string;
  keyHelpUrl?: string;
  keyHelpText?: string;
}

export interface UserApiConfig {
  provider: ApiProviderType;
  endpoint: string;
  apiKey: string;
  model: string;
  autoFallbackToFree: boolean;
}

