import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './layouts/modern/AppShell';
import { BrowsePage } from './layouts/modern/pages/Browse';
import { ChannelDetailPage } from './layouts/modern/pages/ChannelDetail';
import { FavoritesPage } from './layouts/modern/pages/Favorites';
import { SearchPage } from './layouts/modern/pages/Search';
import { SettingsPage } from './layouts/modern/pages/Settings';
import { AboutPage } from './layouts/modern/pages/About';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
      gcTime: 48 * 60 * 60 * 1000, // 48 hours (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<BrowsePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="channel/:id" element={<ChannelDetailPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
