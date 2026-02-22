/**
 * useChannelDetail
 *
 * Encapsulates all data logic for a single channel:
 * stream loading (cache → store fallback), favorite toggle.
 * Any layout's channel-detail page calls this hook — zero UI code here.
 */
import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { getStreamsFromCache, addFavorite, removeFavorite, isFavorite } from '../services/cacheService';
import type { Stream } from '../types';

export function useChannelDetail(id: string | undefined) {
  const { data } = useAppStore();

  const [streams, setStreams]               = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [isFav, setIsFav]                   = useState(false);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  const channel = id ? data?.channels.get(id) : null;

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Prefer cached streams; fall back to in-memory store
        const cached = await getStreamsFromCache(id!);
        const resolved =
          cached && cached.length > 0
            ? cached
            : (data?.streamsByChannel.get(id!) ?? []);

        setStreams(resolved);
        if (resolved.length > 0) setSelectedStream(resolved[0]);

        setIsFav(await isFavorite(id!));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load channel');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, data]);

  async function toggleFavorite() {
    if (!id) return;
    if (isFav) {
      await removeFavorite(id);
      setIsFav(false);
    } else {
      await addFavorite(id);
      setIsFav(true);
    }
  }

  return {
    channel,
    streams,
    selectedStream,
    setSelectedStream,
    isFav,
    toggleFavorite,
    loading,
    error,
  };
}
