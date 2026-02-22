import { useState } from 'react';
import { useAppStore } from '../../../store';
import { useQueryClient } from '@tanstack/react-query';
import { DATA_SOURCES } from '../../../services/iptvService';
import { Icon } from '../components/Icon';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${
        checked ? 'bg-sky-500' : 'bg-white/[0.12]'
      }`}
      style={{ height: '22px' }}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

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
  const [pendingSource, setPendingSource] = useState(dataSource);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleRefreshData = async () => {
    if (!confirm('Reload all channel data from the server?')) return;
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['iptv-data'] });
    window.location.reload();
  };

  const handleClearCache = async () => {
    if (!confirm('Clear all cached data including favorites? This cannot be undone.')) return;
    setClearing(true);
    const databases = await window.indexedDB.databases();
    databases.forEach(db => { if (db.name) window.indexedDB.deleteDatabase(db.name); });
    queryClient.clear();
    window.location.reload();
  };

  const sectionCls = 'bg-[#111118] border border-white/[0.06] rounded-2xl p-4 sm:p-5 space-y-4';
  const sectionTitle = (icon: React.ReactNode, label: string) => (
    <div className="flex items-center gap-2 mb-1">
      <div className="text-sky-400">{icon}</div>
      <h2 className="text-sm font-semibold text-white">{label}</h2>
    </div>
  );

  const rowCls = 'flex items-center justify-between gap-4 py-1';
  const labelCls = (sub?: boolean) =>
    sub ? 'text-xs text-white/35 mt-0.5 leading-relaxed' : 'text-sm text-white font-medium';

  return (
    <div className="px-3 sm:px-5 py-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-5">Settings</h1>

      <div className="space-y-4">
        {/* ── Data Source ── */}
        <section className={sectionCls}>
          {sectionTitle(<Icon name="satellite" size={15} />, 'Data Source')}
          <p className="text-xs text-white/35 -mt-2">Choose where channel data is fetched from</p>

          <div className="space-y-2">
            {(Object.entries(DATA_SOURCES) as [keyof typeof DATA_SOURCES, typeof DATA_SOURCES[keyof typeof DATA_SOURCES]][]).map(([key, source]) => (
              <label
                key={key}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  pendingSource === key
                    ? 'bg-sky-500/[0.08] border border-sky-500/40'
                    : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]'
                }`}
              >
                <input
                  type="radio"
                  name="dataSource"
                  value={key}
                  checked={pendingSource === key}
                  onChange={() => setPendingSource(key)}
                  className="sr-only"
                />
                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  pendingSource === key ? 'border-sky-500 bg-sky-500' : 'border-white/20 bg-transparent'
                }`}>
                  {pendingSource === key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{source.name}</p>
                  <p className="text-xs text-white/35 mt-0.5">{source.description}</p>
                  {key !== 'custom-m3u' && 'url' in source && source.url && (
                    <p className="text-[10px] text-white/20 font-mono mt-1 truncate">{source.url}</p>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Apply button */}
          {pendingSource !== dataSource && pendingSource !== 'custom-m3u' && (
            <button
              onClick={() => setDataSource(pendingSource)}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400
                         text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Icon name="check" size={15} />
              Apply &amp; Load "{DATA_SOURCES[pendingSource as keyof typeof DATA_SOURCES].name}"
            </button>
          )}

          {/* Custom M3U */}
          {pendingSource === 'custom-m3u' && (
            <div className="space-y-2">
              <label className="block">
                <span className="text-xs text-white/50 font-medium block mb-1.5">Playlist URL</span>
                <input
                  type="url"
                  value={m3uUrlInput}
                  onChange={e => setM3uUrlInput(e.target.value)}
                  placeholder="https://example.com/playlist.m3u"
                  className="w-full bg-white/[0.05] border border-white/[0.08] text-white text-sm
                             rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/40
                             focus:border-sky-500/40 placeholder-white/20 transition-all"
                />
              </label>
              <button
                onClick={() => { if (m3uUrlInput.trim()) setCustomM3uUrl(m3uUrlInput.trim()); }}
                disabled={!m3uUrlInput.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400
                           disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold
                           rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Icon name="play" size={14} />
                Load Custom Playlist
              </button>
              <p className="text-xs text-white/25">Supports .m3u and .m3u8 files</p>
            </div>
          )}

          {/* Cache actions */}
          <div className="border-t border-white/[0.06] pt-4 space-y-2">
            <button
              onClick={handleRefreshData}
              disabled={refreshing}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                         bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.07]
                         text-white/70 text-sm transition-all disabled:opacity-40"
            >
              <Icon name="refresh" size={15} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh Channel Data</span>
            </button>
            <button
              onClick={handleClearCache}
              disabled={clearing}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                         bg-red-500/[0.08] hover:bg-red-500/[0.15] border border-red-500/20
                         text-red-400 text-sm transition-all disabled:opacity-40"
            >
              <Icon name="trash" size={15} />
              <span>Clear All Cache &amp; Favorites</span>
            </button>
          </div>
        </section>

        {/* ── Content Filters ── */}
        <section className={sectionCls}>
          {sectionTitle(<Icon name="sliders" size={15} />, 'Content Filters')}

          <div className={rowCls}>
            <div>
              <p className={labelCls()}>Hide NSFW Content</p>
              <p className={labelCls(true)}>Hide adult / 18+ channels</p>
            </div>
            <Toggle checked={hideNsfw} onChange={setHideNsfw} />
          </div>

          <div className="border-t border-white/[0.05]" />

          <div className={rowCls}>
            <div>
              <p className={labelCls()}>Hide HTTP Streams</p>
              <p className={labelCls(true)}>
                Filter HTTP streams when on HTTPS (recommended for GitHub Pages)
              </p>
            </div>
            <Toggle checked={hideHttpStreams} onChange={setHideHttpStreams} />
          </div>
        </section>

        {/* ── Video Player ── */}
        <section className={sectionCls}>
          {sectionTitle(<Icon name="tv" size={15} />, 'Video Player')}

          <div className={rowCls}>
            <div>
              <p className={labelCls()}>Autoplay</p>
              <p className={labelCls(true)}>Start playing when a channel opens</p>
            </div>
            <Toggle checked={settings.autoplay} onChange={v => updateSettings({ autoplay: v })} />
          </div>

          <div className="border-t border-white/[0.05]" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className={labelCls()}>Volume</p>
              <span className="text-xs text-white/40">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.volume * 100}
              onChange={e => updateSettings({ volume: parseInt(e.target.value) / 100 })}
              className="w-full accent-sky-500 h-1.5 rounded-full cursor-pointer"
            />
          </div>
        </section>

        {/* ── App Info ── */}
        <section className={sectionCls}>
          {sectionTitle(<Icon name="info" size={15} />, 'App Info')}
          <div className="space-y-1.5 text-xs text-white/30">
            <p>IPTV Web Player · v1.0.0</p>
            <p>Data cached for 24 hours</p>
            <p className="flex items-center gap-1">
              Source:&nbsp;
              <a href="https://github.com/iptv-org/iptv" target="_blank" rel="noopener noreferrer"
                 className="text-sky-400/80 hover:text-sky-400 flex items-center gap-0.5 transition-colors">
                iptv-org/iptv <Icon name="external-link" size={10} />
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
