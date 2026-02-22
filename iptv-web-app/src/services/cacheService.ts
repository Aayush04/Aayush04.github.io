import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type {
  Channel,
  Stream,
  Favorite,
  RecentlyPlayed,
  AppSettings,
  CacheMetadata
} from '../types';

interface IPTVDatabase extends DBSchema {
  channels: {
    key: string;
    value: Channel;
    indexes: { 'by-country': string; 'by-category': string };
  };
  streams: {
    key: string;
    value: { channelId: string; streams: Stream[] };
  };
  favorites: {
    key: string;
    value: Favorite;
    indexes: { 'by-date': number };
  };
  recentlyPlayed: {
    key: string;
    value: RecentlyPlayed;
    indexes: { 'by-date': number };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  metadata: {
    key: string;
    value: CacheMetadata;
  };
}

const DB_NAME = 'iptv-app-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<IPTVDatabase> | null = null;

export async function getDB(): Promise<IDBPDatabase<IPTVDatabase>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<IPTVDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Channels store
      if (!db.objectStoreNames.contains('channels')) {
        const channelStore = db.createObjectStore('channels', { keyPath: 'id' });
        channelStore.createIndex('by-country', 'country');
        channelStore.createIndex('by-category', 'categories', { multiEntry: true });
      }

      // Streams store
      if (!db.objectStoreNames.contains('streams')) {
        db.createObjectStore('streams', { keyPath: 'channelId' });
      }

      // Favorites store
      if (!db.objectStoreNames.contains('favorites')) {
        const favStore = db.createObjectStore('favorites', { keyPath: 'channelId' });
        favStore.createIndex('by-date', 'addedAt');
      }

      // Recently played store
      if (!db.objectStoreNames.contains('recentlyPlayed')) {
        const recentStore = db.createObjectStore('recentlyPlayed', { keyPath: 'channelId' });
        recentStore.createIndex('by-date', 'playedAt');
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }

      // Metadata store
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata');
      }
    },
  });

  return dbInstance;
}

// Cache operations
export async function saveChannelsToCache(channels: Channel[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('channels', 'readwrite');
  await Promise.all([
    ...channels.map(channel => tx.store.put(channel)),
    tx.done
  ]);
}

export async function saveStreamsToCache(channelId: string, streams: Stream[]): Promise<void> {
  const db = await getDB();
  await db.put('streams', { channelId, streams });
}

export async function getChannelsFromCache(): Promise<Channel[]> {
  const db = await getDB();
  return db.getAll('channels');
}

export async function getStreamsFromCache(channelId: string): Promise<Stream[] | undefined> {
  const db = await getDB();
  const result = await db.get('streams', channelId);
  return result?.streams;
}

export async function getAllStreamsFromCache(): Promise<Stream[]> {
  const db = await getDB();
  const all = await db.getAll('streams');
  return all.flatMap(entry => entry.streams);
}

export async function getCacheMetadata(): Promise<CacheMetadata | undefined> {
  const db = await getDB();
  return db.get('metadata', 'cache-info');
}

export async function saveCacheMetadata(metadata: CacheMetadata): Promise<void> {
  const db = await getDB();
  await db.put('metadata', metadata, 'cache-info');
}

export async function clearDataCache(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['channels', 'streams', 'metadata'], 'readwrite');
  await Promise.all([
    tx.objectStore('channels').clear(),
    tx.objectStore('streams').clear(),
    tx.objectStore('metadata').clear(),
    tx.done
  ]);
}

// Favorites operations
export async function addFavorite(channelId: string): Promise<void> {
  const db = await getDB();
  await db.put('favorites', { channelId, addedAt: Date.now() });
}

export async function removeFavorite(channelId: string): Promise<void> {
  const db = await getDB();
  await db.delete('favorites', channelId);
}

export async function getFavorites(): Promise<Favorite[]> {
  const db = await getDB();
  return db.getAllFromIndex('favorites', 'by-date');
}

export async function isFavorite(channelId: string): Promise<boolean> {
  const db = await getDB();
  const fav = await db.get('favorites', channelId);
  return !!fav;
}

// Recently played operations
export async function addRecentlyPlayed(
  channelId: string,
  streamUrl: string,
  duration?: number
): Promise<void> {
  const db = await getDB();
  await db.put('recentlyPlayed', {
    channelId,
    streamUrl,
    playedAt: Date.now(),
    duration
  });
}

export async function getRecentlyPlayed(limit = 20): Promise<RecentlyPlayed[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('recentlyPlayed', 'by-date');
  return all.reverse().slice(0, limit);
}

// Settings operations
const DEFAULT_SETTINGS: AppSettings = {
  hideHttpStreamsOnHttps: true,
  autoplay: false,
  volume: 0.8,
  preferredLanguages: [],
  dataRefreshInterval: 24
};

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'app-settings');
  return settings || DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const db = await getDB();
  const current = await getSettings();
  await db.put('settings', { ...current, ...settings }, 'app-settings');
}
