import { useState } from 'react';
import { useAppStore, getFilteredChannels } from '../../../store';
import { ChannelCard } from '../components/ChannelCard';

export function SearchPage() {
  const { searchQuery, setSearchQuery, data } = useAppStore();
  const channels = useAppStore(getFilteredChannels);
  const [displayCount, setDisplayCount] = useState(24);

  const displayedChannels = channels.slice(0, displayCount);
  const hasMore = displayCount < channels.length;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">Search Channels</h1>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by channel name, network, or category..."
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 pl-12 focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {!data ? (
        <div className="text-center py-12"><p className="text-gray-400">Loading...</p></div>
      ) : searchQuery === '' ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-white mb-2">Start Searching</h2>
          <p className="text-gray-400">Enter a channel name, network, or category to search</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-white mb-2">No results found</h2>
          <p className="text-gray-400">Try a different search term for "{searchQuery}"</p>
        </div>
      ) : (
        <>
          <p className="text-gray-400 mb-4">
            Found {channels.length.toLocaleString()} channel{channels.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 mb-6">
            {displayedChannels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center">
              <button
                onClick={() => setDisplayCount(prev => prev + 24)}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
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
