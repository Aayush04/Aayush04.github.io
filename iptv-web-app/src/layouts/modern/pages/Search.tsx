import { useState } from 'react';
import { useAppStore, getFilteredChannels } from '../../../store';
import { ChannelCard } from '../components/ChannelCard';
import { Icon } from '../components/Icon';

export function SearchPage() {
  const { searchQuery, setSearchQuery, data } = useAppStore();
  const channels = useAppStore(getFilteredChannels);
  const [displayCount, setDisplayCount] = useState(24);

  const displayed = channels.slice(0, displayCount);
  const hasMore = displayCount < channels.length;

  return (
    <div className="px-3 sm:px-5 py-4 max-w-[1600px] mx-auto">
      {/* Search input */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white mb-3">Search</h1>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name="search" size={16} className="text-white/30" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Channel name, network, or category…"
            className="w-full bg-white/[0.05] border border-white/[0.08] text-white text-sm
                       rounded-2xl pl-10 pr-10 py-3
                       focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40
                       placeholder-white/25 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg
                         text-white/30 hover:text-white/70 transition-colors"
            >
              <Icon name="x" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* States */}
      {!data ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="loader" size={24} className="text-sky-500 animate-spin" />
        </div>
      ) : searchQuery === '' ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
            <Icon name="search" size={22} className="text-white/20" />
          </div>
          <div className="text-center">
            <p className="text-white/50 font-medium">Start typing to search</p>
            <p className="text-white/25 text-sm mt-0.5">Channel name, network, or category</p>
          </div>
        </div>
      ) : channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
            <Icon name="wifi-off" size={22} className="text-white/20" />
          </div>
          <div className="text-center">
            <p className="text-white/50 font-medium">No results for "{searchQuery}"</p>
            <p className="text-white/25 text-sm mt-0.5">Try a different term</p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs text-white/35 mb-3">
            {channels.length.toLocaleString()} result{channels.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3">
            {displayed.map(ch => <ChannelCard key={ch.id} channel={ch} />)}
          </div>
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={() => setDisplayCount(n => n + 24)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                           bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08]
                           text-white/70 text-sm font-medium transition-all"
              >
                <Icon name="chevron-down" size={15} />
                Load more · {channels.length - displayCount} remaining
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
