import { create } from 'zustand';
import type { NormalizedData, Channel, Settings } from '../types';
import type { DataSource } from '../services/iptvService';

interface AppState {
  // Data
  data: NormalizedData | null;
  loading: boolean;
  error: string | null;
  dataSource: DataSource;
  customM3uUrl: string;
  
  // Filters
  searchQuery: string;
  selectedCountry: string | null;
  selectedCategory: string | null;
  selectedLanguage: string | null;
  streamFilter: 'all' | 'with-streams' | 'no-streams';
  
  // UI State
  hideNsfw: boolean;
  hideHttpStreams: boolean;
  
  // Settings
  settings: Settings;
  
  // Actions
  setData: (data: NormalizedData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCountry: (country: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedLanguage: (language: string | null) => void;
  setStreamFilter: (filter: 'all' | 'with-streams' | 'no-streams') => void;
  setHideNsfw: (hide: boolean) => void;
  setHideHttpStreams: (hide: boolean) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  resetFilters: () => void;
  setDataSource: (source: DataSource) => void;
  setCustomM3uUrl: (url: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  data: null,
  loading: true,
  error: null,
  dataSource: 'json-api',
  customM3uUrl: '',
  searchQuery: '',
  selectedCountry: null,
  selectedCategory: null,
  selectedLanguage: null,
  streamFilter: 'all',
  hideNsfw: true,
  hideHttpStreams: false,
  settings: {
    autoplay: true,
    quality: 'auto',
    volume: 1.0,
    hideHttpStreams: false,
    hideNsfw: true,
    theme: 'dark'
  },

  // Actions
  setData: (data) => set({ data, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCountry: (selectedCountry) => set({ selectedCountry }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedLanguage: (selectedLanguage) => set({ selectedLanguage }),
  setStreamFilter: (streamFilter) => set({ streamFilter }),
  setHideNsfw: (hideNsfw) => set({ hideNsfw }),
  setHideHttpStreams: (hideHttpStreams) => set({ hideHttpStreams }),
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    })),
  resetFilters: () =>
    set({
      searchQuery: '',
      selectedCountry: null,
      selectedCategory: null,
      selectedLanguage: null,
      streamFilter: 'all',
    }),
  // Changing source clears old data immediately and shows loading spinner
  setDataSource: (dataSource) => set({ dataSource, data: null, loading: true, error: null }),
  // Changing custom URL also clears old data
  setCustomM3uUrl: (customM3uUrl) => set({ customM3uUrl, data: null, loading: true, error: null }),
}));

// Selectors
export const getFilteredChannels = (state: AppState): Channel[] => {
  if (!state.data) return [];
  
  const allChannels = Array.from(state.data.channels.values());
  
  return allChannels.filter((channel) => {
    // NSFW filter
    if (state.hideNsfw && channel.is_nsfw) return false;
    
    // Country filter
    if (state.selectedCountry && channel.country !== state.selectedCountry) {
      return false;
    }
    
    // Category filter
    if (state.selectedCategory && !channel.categories.includes(state.selectedCategory)) {
      return false;
    }
    
    // Language filter
    if (state.selectedLanguage && !channel.languages.includes(state.selectedLanguage)) {
      return false;
    }
    
    // Stream availability filter
    if (state.streamFilter !== 'all') {
      const streamCount = state.data!.streamsByChannel.get(channel.id)?.length ?? 0;
      if (state.streamFilter === 'with-streams' && streamCount === 0) return false;
      if (state.streamFilter === 'no-streams' && streamCount > 0) return false;
    }

    // Search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      const matchesName = channel.name.toLowerCase().includes(query);
      const matchesNetwork = channel.network?.toLowerCase().includes(query);
      const matchesCategory = channel.categories.some((cat) =>
        cat.toLowerCase().includes(query)
      );
      
      if (!matchesName && !matchesNetwork && !matchesCategory) {
        return false;
      }
    }
    
    return true;
  });
};
