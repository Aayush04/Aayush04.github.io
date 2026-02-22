import { useState } from 'react';
import { useAppStore } from '../../../store';
import { useQueryClient } from '@tanstack/react-query';
import { DATA_SOURCES } from '../../../services/iptvService';

export function SettingsPage() {
  const {
    settings,
    updateSettings,
    hideNsfw,
    setHideNsfw,
    hideHttpStreams,
    setHideHttpStreams,
    dataSource,
    setDataSource,
    customM3uUrl,
    setCustomM3uUrl,
  } = useAppStore();
  const queryClient = useQueryClient();
  const [m3uUrlInput, setM3uUrlInput] = useState(customM3uUrl || '');
  // Pending selection — only committed when user clicks "Apply & Load"
  const [pendingSource, setPendingSource] = useState(dataSource);

  const handleRefreshData = async () => {
    if (confirm('This will reload all channel data from the server. Continue?')) {
      await queryClient.invalidateQueries({ queryKey: ['iptv-data'] });
      window.location.reload();
    }
  };

  const handleClearCache = async () => {
    if (confirm('This will clear all cached data including favorites. Continue?')) {
      // Clear IndexedDB
      const databases = await window.indexedDB.databases();
      databases.forEach(db => {
        if (db.name) window.indexedDB.deleteDatabase(db.name);
      });

      // Clear React Query cache
      queryClient.clear();

      // Reload
      window.location.reload();
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Data Source & Management */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-1">Data Source &amp; Management</h2>
          <p className="text-sm text-gray-400 mb-4">Choose a source and manage cached data</p>

          {/* Source picker */}
          <div className="space-y-3">
            {(Object.entries(DATA_SOURCES) as [keyof typeof DATA_SOURCES, typeof DATA_SOURCES[keyof typeof DATA_SOURCES]][]).map(([key, source]) => (
              <label key={key} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="radio"
                  name="dataSource"
                  value={key}
                  checked={pendingSource === key}
                  onChange={(e) => setPendingSource(e.target.value as typeof dataSource)}
                  className="mt-1 w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-white">{source.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{source.description}</div>
                  {key !== 'custom-m3u' && 'url' in source && source.url && (
                    <div className="text-xs text-gray-500 mt-1 font-mono">{source.url}</div>
                  )}
                  {key === 'json-api' && 'channelsUrl' in source && (
                    <div className="text-xs text-gray-500 mt-1">
                      Channels, Streams, Categories, Countries, Languages, Regions
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Apply button — shown when pending differs from active (non-custom) */}
          {pendingSource !== dataSource && pendingSource !== 'custom-m3u' && (
            <button
              onClick={() => setDataSource(pendingSource)}
              className="w-full mt-4 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              ✅ Apply &amp; Load "{DATA_SOURCES[pendingSource as keyof typeof DATA_SOURCES].name}"
            </button>
          )}

          {/* Custom M3U URL input */}
          {pendingSource === 'custom-m3u' && (
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-white mb-2 block">Custom M3U Playlist URL</span>
                <input
                  type="url"
                  value={m3uUrlInput}
                  onChange={(e) => setM3uUrlInput(e.target.value)}
                  placeholder="https://example.com/playlist.m3u or .m3u8"
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </label>
              <button
                onClick={() => {
                  if (m3uUrlInput.trim()) {
                    setCustomM3uUrl(m3uUrlInput.trim());
                  }
                }}
                disabled={!m3uUrlInput.trim()}
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                Load Custom Playlist
              </button>
              <p className="text-xs text-gray-400">
                Enter a URL to any M3U or M3U8 playlist file. The playlist will be fetched and parsed.
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-700 my-5" />

          {/* Cache actions */}
          <div className="space-y-3">
            <div>
              <button
                onClick={handleRefreshData}
                className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                🔄 Refresh Channel Data
              </button>
              <p className="text-xs text-gray-500 mt-1">Force-reload all channels from the current source</p>
            </div>
            <div>
              <button
                onClick={handleClearCache}
                className="w-full px-4 py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                🗑️ Clear All Cache
              </button>
              <p className="text-xs text-gray-500 mt-1">Wipe cached data including favorites and recent history</p>
            </div>
          </div>
        </section>

        {/* Content Filters */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Content Filters</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Hide NSFW Content</div>
                <div className="text-sm text-gray-400">Hide adult/18+ channels</div>
              </div>
              <input
                type="checkbox"
                checked={hideNsfw}
                onChange={(e) => setHideNsfw(e.target.checked)}
                className="w-5 h-5 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Hide HTTP Streams on HTTPS</div>
                <div className="text-sm text-gray-400">
                  Filter out HTTP streams when app is accessed via HTTPS (recommended for GitHub Pages)
                </div>
              </div>
              <input
                type="checkbox"
                checked={hideHttpStreams}
                onChange={(e) => setHideHttpStreams(e.target.checked)}
                className="w-5 h-5 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
              />
            </label>
          </div>
        </section>

        {/* Video Player */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Video Player</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Autoplay</div>
                <div className="text-sm text-gray-400">Automatically play when channel loads</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoplay}
                onChange={(e) => updateSettings({ autoplay: e.target.checked })}
                className="w-5 h-5 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
              />
            </label>

            <div>
              <label className="block font-medium text-white mb-2">Volume</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume * 100}
                onChange={(e) => updateSettings({ volume: parseInt(e.target.value) / 100 })}
                className="w-full"
              />
              <div className="text-sm text-gray-400 mt-1">{Math.round(settings.volume * 100)}%</div>
            </div>
          </div>
        </section>

        {/* App Info */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">About</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p>IPTV Web Player v1.0.0</p>
            <p>Data cached for 24 hours</p>
            <p>
              Source:{' '}
              <a
                href="https://github.com/iptv-org/iptv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:underline"
              >
                iptv-org/iptv
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
