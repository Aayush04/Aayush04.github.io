// Core data models

export interface Channel {
  id: string;
  name: string;
  network?: string;
  country: string;
  subdivision?: string;
  city?: string;
  broadcast_area: string[];
  languages: string[];
  categories: string[];
  is_nsfw: boolean;
  launched?: string;
  closed?: string;
  replaced_by?: string;
  website?: string;
  logo?: string;
}

export interface Stream {
  channel: string | null; // channel id
  url: string;
  feed?: string | null;
  title?: string | null;
  quality?: string | null;
  http_referrer?: string;
  referrer?: string | null;
  user_agent?: string;
  timeshift?: string;
  status?: 'online' | 'error' | 'timeout' | 'offline';
}

export interface Country {
  name: string;
  code: string;
  languages: string[];
  flag: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface StreamTest {
  url: string;
  status: 'testing' | 'success' | 'failed';
  error?: string;
  timestamp: number;
}

// Normalized data structure
export interface NormalizedData {
  channels: Map<string, Channel>;
  streamsByChannel: Map<string, Stream[]>;
  countries: Map<string, Country>;
  categories: Set<string>;
  languages: Map<string, Language>;
  channelsByCountry: Map<string, string[]>;
  channelsByCategory: Map<string, string[]>;
  channelsByLanguage: Map<string, string[]>;
  lastUpdated: number;
}

// Cache metadata
export interface CacheMetadata {
  version: number;
  lastUpdated: number;
  dataSource: string;
  ttl: number; // milliseconds
}

// Favorites and history
export interface Favorite {
  channelId: string;
  addedAt: number;
}

export interface RecentlyPlayed {
  channelId: string;
  streamUrl: string;
  playedAt: number;
  duration?: number; // seconds
}

// App settings
export interface AppSettings {
  hideHttpStreamsOnHttps: boolean;
  autoplay: boolean;
  volume: number;
  preferredLanguages: string[];
  dataRefreshInterval: number; // hours
}

export interface Settings {
  autoplay: boolean;
  quality: 'auto' | '1080p' | '720p' | '480p';
  volume: number;
  hideHttpStreams: boolean;
  hideNsfw: boolean;
  theme: 'light' | 'dark';
}

// Mixed content detection
export interface MixedContentInfo {
  appProtocol: 'http:' | 'https:';
  streamProtocol: 'http:' | 'https:';
  isMixedContent: boolean;
  warning?: string;
}

// Video player state
export interface PlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  error?: PlayerError;
}

export interface PlayerError {
  code: string;
  message: string;
  fatal: boolean;
  retry?: () => void;
}

// Search
export interface SearchFilters {
  country?: string;
  category?: string;
  language?: string;
  query?: string;
  hideNsfw?: boolean;
}
