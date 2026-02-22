/**
 * useIPTVData
 *
 * Bridges TanStack Query + Zustand store.
 * Any layout can call this hook to trigger data loading and read status —
 * with zero knowledge of *how* data is fetched or cached.
 */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchIPTVData } from '../services/iptvService';
import { useAppStore } from '../store';

export function useIPTVData() {
  const { setData, setLoading, setError, dataSource, customM3uUrl } = useAppStore();

  const { data: fetchResult, isLoading, isFetching, error } = useQuery({
    queryKey: ['iptv-data', dataSource, customM3uUrl],
    queryFn: () => fetchIPTVData(false, dataSource, customM3uUrl || undefined),
    staleTime: 24 * 60 * 60 * 1000,
  });

  useEffect(() => {
    if (fetchResult?.data) {
      setData(fetchResult.data);
    }
  }, [fetchResult, setData]);

  useEffect(() => {
    setLoading(isLoading || isFetching);
  }, [isLoading, isFetching, setLoading]);

  useEffect(() => {
    if (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    }
  }, [error, setError]);

  const loading = useAppStore(s => s.loading);
  const data    = useAppStore(s => s.data);
  const storeError = useAppStore(s => s.error);

  return { loading, data, error: storeError, dataSource };
}
