import { useState } from 'react';
import { useAppStore, getFilteredChannels } from '../../../store';
import { ChannelCard } from '../components/ChannelCard';
import { FilterPanel } from '../components/FilterPanel';

export function BrowsePage() {
  const { data, loading } = useAppStore();
  const channels = useAppStore(getFilteredChannels);
  const [displayCount, setDisplayCount] = useState(24);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading channels...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  const displayedChannels = channels.slice(0, displayCount);
  const hasMore = displayCount < channels.length;

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">Browse Channels</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{channels.length.toLocaleString()} channels available</p>
      </div>

      <FilterPanel />

      {channels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-white mb-2">No channels found</h2>
          <p className="text-gray-400">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 mb-4">
            {displayedChannels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center">
              <button
                onClick={() => setDisplayCount(prev => prev + 24)}
                className="px-5 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Load More ({channels.length - displayCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
