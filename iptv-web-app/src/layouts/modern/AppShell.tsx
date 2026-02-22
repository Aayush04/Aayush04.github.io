import { Outlet, Link, useLocation } from 'react-router-dom';
import { useIPTVData } from '../../hooks/useIPTVData';
import { Icon } from './components/Icon';

const NAV_ITEMS = [
  { to: '/',          label: 'Browse',    icon: 'home'     as const },
  { to: '/search',    label: 'Search',    icon: 'search'   as const },
  { to: '/favorites', label: 'Favorites', icon: 'heart'    as const },
  { to: '/settings',  label: 'Settings',  icon: 'settings' as const },
  { to: '/about',     label: 'About',     icon: 'info'     as const },
];

export function AppShell() {
  const location = useLocation();
  const { loading, data, error, dataSource } = useIPTVData();

  const sourceLabel =
    dataSource === 'json-api'     ? 'JSON API' :
    dataSource === 'm3u-playlist' ? 'M3U Playlist' : 'Custom Playlist';

  if (loading || (!data && !error)) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Animated logo */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 opacity-20 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl border-2 border-sky-500/30 animate-ping" />
            <div className="relative flex items-center justify-center w-full h-full rounded-2xl bg-gradient-to-br from-sky-500/10 to-violet-600/10 border border-white/10">
              <Icon name="tv" size={32} className="text-sky-400" />
            </div>
          </div>
          <div>
            <p className="text-white font-semibold text-lg">Loading channels</p>
            <p className="text-white/40 text-sm mt-1">Fetching from {sourceLabel}…</p>
          </div>
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Icon name="alert-triangle" size={28} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Failed to load</h1>
            <p className="text-white/50 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Icon name="refresh" size={15} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 w-60 h-screen z-30
                        bg-[#111118]/80 backdrop-blur-xl border-r border-white/[0.06]">
        {/* Brand */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
              <Icon name="tv" size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight">IPTV</span>
              <span className="font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent"> Player</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-gradient-to-r from-sky-500/20 to-violet-500/10 text-white border border-white/10 shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon
                  name={item.icon}
                  size={17}
                  className={active ? 'text-sky-400' : 'text-current'}
                />
                {item.label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <p className="text-[10px] text-white/25 uppercase tracking-widest">iptv-org/iptv</p>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="flex-1 md:ml-60 pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>

      {/* ── Mobile Bottom Nav ────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30
                      bg-[#111118]/90 backdrop-blur-xl border-t border-white/[0.06]
                      safe-bottom">
        <div className="flex justify-around items-center h-16">
          {NAV_ITEMS.filter(n => n.to !== '/about').map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
                  active ? 'text-sky-400' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Icon name={active && item.icon === 'heart' ? 'heart-filled' : item.icon} size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
