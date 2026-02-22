import { useState } from 'react';
import { useAppStore, getFilteredChannels } from '../../../store';
import { ChannelCard } from '../components/ChannelCard';
import { FilterPanel } from '../components/FilterPanel';
import { Icon } from '../components/Icon';

export function BrowsePage() {
  const { data, loading } = useAppStore();
  const channels = useAppStore(getFilteredChannels);
  const [displayCount, setDisplayCount] = useState(24);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Icon name="loader" size={28} className="text-sky-500 animate-spin" />
          <p className="text-white/40 text-sm">Loading channels…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white/30 text-sm">No data available</p>
      </div>
    );
  }

  const displayed = channels.slice(0, displayCount);
  const hasMore = displayCount < channels.length;

  return (
    <div className="px-3 sm:px-5 py-4 max-w-[1600px] mx-auto">
      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white">Browse</h1>
        <p className="text-xs text-white/35 mt-0.5">
          {channels.length.toLocaleString()} channels
        </p>
      </div>

      <FilterPanel />

      {channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
            <Icon name="search" size={22} className="text-white/25" />
          </div>
          <div className="text-center">
            <p className="text-white/60 font-medium">No channels found</p>
            <p className="text-white/25 text-sm mt-0.5">Try adjusting your filters</p>
          </div>
        </div>
      ) : (
        <>
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
