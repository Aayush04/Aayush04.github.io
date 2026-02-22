import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store';
import { ChannelCard } from '../components/ChannelCard';
import { getFavorites } from '../../../services/cacheService';
import type { Channel } from '../../../types';

export function FavoritesPage() {
  const { data } = useAppStore();
  const [favoriteChannels, setFavoriteChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (!data) return;

      try {
        const favorites = await getFavorites();
        const channels = favorites
          .map(fav => data.channels.get(fav.channelId))
          .filter((ch): ch is Channel => ch !== undefined)
          .sort((a, b) => a.name.localeCompare(b.name));

        setFavoriteChannels(channels);
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [data]);

  if (!data || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Favorites</h1>
        <p className="text-gray-400">
          {favoriteChannels.length} favorite channel{favoriteChannels.length !== 1 ? 's' : ''}
        </p>
      </div>

      {favoriteChannels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-xl font-semibold text-white mb-2">No favorites yet</h2>
          <p className="text-gray-400 mb-6">
            Start adding channels to your favorites to see them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {favoriteChannels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}
    </div>
  );
}
