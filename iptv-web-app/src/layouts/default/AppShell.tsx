import { Outlet, Link, useLocation } from 'react-router-dom';
import { useIPTVData } from '../../hooks/useIPTVData';

export function AppShell() {
  const location = useLocation();
  const { loading, data, error, dataSource } = useIPTVData();

  if (loading || (!data && !error)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading IPTV channels…</p>
          <p className="text-gray-500 text-sm mt-2">
            {dataSource === 'json-api'      && 'Fetching from JSON API'}
            {dataSource === 'm3u-playlist'  && 'Fetching M3U playlist'}
            {dataSource === 'custom-m3u'    && 'Fetching custom playlist'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Error Loading Data</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 w-64 h-screen bg-gray-800 border-r border-gray-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-400">📺 IPTV Player</h1>
        </div>
        <nav className="px-4">
          <NavLink to="/"         active={location.pathname === '/'}>🏠 Browse</NavLink>
          <NavLink to="/search"   active={location.pathname === '/search'}>🔍 Search</NavLink>
          <NavLink to="/favorites" active={location.pathname === '/favorites'}>⭐ Favorites</NavLink>
          <NavLink to="/settings" active={location.pathname === '/settings'}>⚙️ Settings</NavLink>
          <NavLink to="/about"    active={location.pathname === '/about'}>ℹ️ About</NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 safe-bottom">
        <div className="flex justify-around">
          <MobileNavLink to="/"          active={location.pathname === '/'}><span className="text-2xl">🏠</span><span className="text-xs">Browse</span></MobileNavLink>
          <MobileNavLink to="/search"    active={location.pathname === '/search'}><span className="text-2xl">🔍</span><span className="text-xs">Search</span></MobileNavLink>
          <MobileNavLink to="/favorites" active={location.pathname === '/favorites'}><span className="text-2xl">⭐</span><span className="text-xs">Favorites</span></MobileNavLink>
          <MobileNavLink to="/settings"  active={location.pathname === '/settings'}><span className="text-2xl">⚙️</span><span className="text-xs">Settings</span></MobileNavLink>
        </div>
      </nav>
    </div>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`block px-4 py-3 rounded-lg mb-2 transition-colors ${
        active ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center py-2 px-6 ${active ? 'text-primary-400' : 'text-gray-400'}`}
    >
      {children}
    </Link>
  );
}
