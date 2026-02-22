import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store';
import { ChannelCard } from '../components/ChannelCard';
import { getFavorites } from '../../../services/cacheService';
import { Icon } from '../components/Icon';
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
      } catch (err) {
        console.error('Error loading favorites:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, [data]);

  return (
    <div className="px-3 sm:px-5 py-4 max-w-[1600px] mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">Favorites</h1>
        {!loading && (
          <p className="text-xs text-white/35 mt-0.5">
            {favoriteChannels.length} channel{favoriteChannels.length !== 1 ? 's' : ''} saved
          </p>
        )}
      </div>

      {!data || loading ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="loader" size={24} className="text-sky-500 animate-spin" />
        </div>
      ) : favoriteChannels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
            <Icon name="heart" size={26} className="text-white/20" />
          </div>
          <div className="text-center">
            <p className="text-white/50 font-medium">No favorites yet</p>
            <p className="text-white/25 text-sm mt-0.5">Open a channel and tap the heart to save it</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3">
          {favoriteChannels.map(channel => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}
    </div>
  );
}
