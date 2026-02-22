import type { Channel, Stream, NormalizedData, CacheMetadata } from '../types';
import {
  getChannelsFromCache,
  getAllStreamsFromCache,
  saveChannelsToCache,
  saveStreamsToCache,
  getCacheMetadata,
  saveCacheMetadata
} from './cacheService';
import { getCountryName, getCountryFlag } from './countries';
import { parseM3U, m3uToChannelsAndStreams } from './m3uParser';

// Data source options
export type DataSource = 'json-api' | 'm3u-playlist' | 'custom-m3u';

export const DATA_SOURCES = {
  'json-api': {
    name: 'JSON API (Recommended)',
    description: 'Complete database with rich metadata',
    channelsUrl: 'https://iptv-org.github.io/api/channels.json',
    streamsUrl: 'https://iptv-org.github.io/api/streams.json',
    categoriesUrl: 'https://iptv-org.github.io/api/categories.json',
    countriesUrl: 'https://iptv-org.github.io/api/countries.json',
    languagesUrl: 'https://iptv-org.github.io/api/languages.json',
    regionsUrl: 'https://iptv-org.github.io/api/regions.json',
    logosUrl: 'https://iptv-org.github.io/api/logos.json',
  },
  'm3u-playlist': {
    name: 'M3U Playlist (Official)',
    description: 'Single consolidated M3U file',
    url: 'https://iptv-org.github.io/iptv/index.m3u',
  },
  'custom-m3u': {
    name: 'Custom M3U URL',
    description: 'Add your own M3U playlist URL',
    url: '',
  },
};

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_VERSION = 2; // bump when cached data shape changes (e.g. logos added)

export interface FetchDataResult {
  data: NormalizedData;
  fromCache: boolean;
  cacheDate?: Date;
  error?: string;
}

/**
 * Fetch and normalize IPTV data from iptv-org/iptv repository
 * Implements caching with TTL and fallback strategies
 */
export async function fetchIPTVData(
  forceRefresh = false,
  dataSource: DataSource = 'json-api',
  customM3uUrl?: string
): Promise<FetchDataResult> {
  try {
    // Check cache first
    if (!forceRefresh) {
      const cached = await loadFromCache();
      if (cached) {
        return cached;
      }
    }

    // Fetch fresh data based on source
    console.log(`Fetching fresh data from ${dataSource}...`);
    let channels: Channel[];
    let streams: Stream[];

    if (dataSource === 'm3u-playlist' || dataSource === 'custom-m3u') {
      const m3uUrl =
        dataSource === 'custom-m3u' && customM3uUrl
          ? customM3uUrl
          : DATA_SOURCES['m3u-playlist'].url;
      const response = await fetch(m3uUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch M3U playlist');
      }
      const m3uContent = await response.text();
      const entries = parseM3U(m3uContent);
      const result = m3uToChannelsAndStreams(entries);
      channels = result.channels;
      streams = result.streams;
    } else {
      // Fetch JSON API with all endpoints
      const apiConfig = DATA_SOURCES['json-api'];
      const [channelsRes, streamsRes, categoriesRes, countriesRes, languagesRes, logosRes] =
        await Promise.all([
          fetch(apiConfig.channelsUrl),
          fetch(apiConfig.streamsUrl),
          fetch(apiConfig.categoriesUrl || ''),
          fetch(apiConfig.countriesUrl || ''),
          fetch(apiConfig.languagesUrl || ''),
          fetch(apiConfig.logosUrl || ''),
        ]);

      if (!channelsRes.ok || !streamsRes.ok) {
        throw new Error('Failed to fetch data from GitHub API');
      }

      channels = await channelsRes.json();
      streams = await streamsRes.json();

      if (categoriesRes.ok) {
        const categories = await categoriesRes.json();
        console.log(`Loaded ${categories.length} categories`);
      }
      if (countriesRes.ok) {
        const countries = await countriesRes.json();
        console.log(`Loaded ${countries.length} countries`);
      }
      if (languagesRes.ok) {
        const languages = await languagesRes.json();
        console.log(`Loaded ${languages.length} languages`);
      }

      // Stamp logo URLs onto channels from logos.json
      if (logosRes.ok) {
        const logos: { channel: string; url: string }[] = await logosRes.json();
        console.log(`Loaded ${logos.length} logos`);
        const logoMap = new Map<string, string>();
        for (const logo of logos) {
          if (logo.channel && logo.url && !logoMap.has(logo.channel)) {
            logoMap.set(logo.channel, logo.url);
          }
        }
        channels = channels.map(ch => ({
          ...ch,
          logo: ch.logo || logoMap.get(ch.id) || undefined,
        }));
      }
    }

    const normalized = normalizeData(channels, streams);
    await saveToCache(channels, streams, dataSource);

    return { data: normalized, fromCache: false };
  } catch (error) {
    console.error('Error fetching IPTV data:', error);

    const cached = await loadFromCache();
    if (cached) {
      return { ...cached, error: 'Using cached data due to network error' };
    }

    throw new Error('Failed to load data and no cache available');
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────

async function loadFromCache(): Promise<FetchDataResult | null> {
  const metadata = await getCacheMetadata();
  if (!metadata) return null;

  if (!metadata.version || metadata.version < CACHE_VERSION) {
    console.log('Cache version outdated, forcing refresh');
    return null;
  }

  const age = Date.now() - metadata.lastUpdated;
  if (age > metadata.ttl) {
    console.log('Cache expired');
    return null;
  }

  let channels = await getChannelsFromCache();
  if (!channels || channels.length === 0) return null;

  const missingLogos = channels.some(ch => !ch.logo);
  if (missingLogos) {
    try {
      const logosRes = await fetch(DATA_SOURCES['json-api'].logosUrl);
      if (logosRes.ok) {
        const logos: { channel: string; url: string }[] = await logosRes.json();
        const logoMap = new Map<string, string>();
        for (const logo of logos) {
          if (logo.channel && logo.url && !logoMap.has(logo.channel)) {
            logoMap.set(logo.channel, logo.url);
          }
        }
        channels = channels.map(ch => ({
          ...ch,
          logo: ch.logo || logoMap.get(ch.id) || undefined,
        }));
        await saveChannelsToCache(channels);
      }
    } catch {
      // Non-fatal
    }
  }

  const cachedStreams = await getAllStreamsFromCache();
  const normalized = normalizeData(channels, cachedStreams);
  console.log(`Loaded ${channels.length} channels and ${cachedStreams.length} streams from cache`);
  return { data: normalized, fromCache: true, cacheDate: new Date(metadata.lastUpdated) };
}

async function saveToCache(
  channels: Channel[],
  streams: Stream[],
  dataSource: DataSource = 'json-api'
): Promise<void> {
  await saveChannelsToCache(channels);

  const streamsByChannel = new Map<string, Stream[]>();
  for (const stream of streams) {
    if (!stream.channel) continue;
    const existing = streamsByChannel.get(stream.channel) || [];
    existing.push(stream);
    streamsByChannel.set(stream.channel, existing);
  }

  await Promise.all(
    Array.from(streamsByChannel.entries()).map(([channelId, channelStreams]) =>
      saveStreamsToCache(channelId, channelStreams)
    )
  );

  const sourceName =
    dataSource === 'custom-m3u' ? 'Custom M3U Playlist' : DATA_SOURCES[dataSource].name;

  const metadata: CacheMetadata = {
    version: CACHE_VERSION,
    lastUpdated: Date.now(),
    dataSource: sourceName,
    ttl: CACHE_TTL,
  };
  await saveCacheMetadata(metadata);
  console.log('Data cached successfully');
}

// ── Pure data functions (no side effects) ────────────────────────────────

export function normalizeData(channels: Channel[], streams: Stream[]): NormalizedData {
  const data: NormalizedData = {
    channels: new Map(),
    streamsByChannel: new Map(),
    countries: new Map(),
    categories: new Set(),
    languages: new Map(),
    channelsByCountry: new Map(),
    channelsByCategory: new Map(),
    channelsByLanguage: new Map(),
    lastUpdated: Date.now(),
  };

  for (const channel of channels) {
    data.channels.set(channel.id, channel);

    if (channel.country) {
      const countryChannels = data.channelsByCountry.get(channel.country) || [];
      countryChannels.push(channel.id);
      data.channelsByCountry.set(channel.country, countryChannels);

      if (!data.countries.has(channel.country)) {
        data.countries.set(channel.country, {
          name: getCountryName(channel.country),
          code: channel.country,
          languages: [],
          flag: getCountryFlag(channel.country),
        });
      }
    }

    for (const category of channel.categories || []) {
      data.categories.add(category);
      const categoryChannels = data.channelsByCategory.get(category) || [];
      categoryChannels.push(channel.id);
      data.channelsByCategory.set(category, categoryChannels);
    }

    for (const lang of channel.languages || []) {
      const langChannels = data.channelsByLanguage.get(lang) || [];
      langChannels.push(channel.id);
      data.channelsByLanguage.set(lang, langChannels);

      if (!data.languages.has(lang)) {
        data.languages.set(lang, { code: lang, name: lang });
      }
    }
  }

  for (const stream of streams) {
    if (!stream.channel) continue;
    const existing = data.streamsByChannel.get(stream.channel) || [];
    existing.push(stream);
    data.streamsByChannel.set(stream.channel, existing);
  }

  return data;
}

export function filterChannels(
  channels: Channel[],
  query?: string,
  country?: string,
  category?: string,
  language?: string,
  hideNsfw = true
): Channel[] {
  return channels.filter(channel => {
    if (hideNsfw && channel.is_nsfw) return false;
    if (country && channel.country !== country) return false;
    if (category && !channel.categories.includes(category)) return false;
    if (language && !channel.languages.includes(language)) return false;

    if (query) {
      const q = query.toLowerCase();
      return (
        channel.name.toLowerCase().includes(q) ||
        channel.network?.toLowerCase().includes(q) ||
        channel.categories.some(cat => cat.toLowerCase().includes(q))
      );
    }

    return true;
  });
}

export function detectMixedContent(streamUrl: string) {
  const appProtocol = window.location.protocol as 'http:' | 'https:';
  const streamProtocol = streamUrl.startsWith('https://') ? 'https:' : 'http:';
  const isMixedContent = appProtocol === 'https:' && streamProtocol === 'http:';

  return {
    appProtocol,
    streamProtocol,
    isMixedContent,
    warning: isMixedContent
      ? 'This stream uses HTTP and may be blocked by your browser on HTTPS. Run locally on http://localhost for best compatibility.'
      : undefined,
  };
}
