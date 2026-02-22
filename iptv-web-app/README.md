# IPTV Web Player 📺

A modern, responsive web application for browsing and playing IPTV channels from around the world.

## Features

✨ **Browse Channels** - Explore thousands of IPTV channels organized by country, category, and language  
🔍 **Search** - Quickly find channels with real-time search  
⭐ **Favorites** - Save your favorite channels for quick access  
📱 **Responsive Design** - Optimized for both desktop and mobile devices  
💾 **Offline Support** - PWA with 24-hour data caching for offline browsing  
🔒 **Privacy First** - All data stored locally in your browser, no tracking  

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router 6 (HashRouter for GitHub Pages compatibility)
- **State Management**: Zustand + TanStack Query
- **Video Player**: HLS.js for adaptive streaming
- **Storage**: IndexedDB via idb
- **Styling**: TailwindCSS 3
- **PWA**: vite-plugin-pwa with Workbox

## Data Source

All channel and stream data is fetched from the community-maintained [iptv-org/iptv](https://github.com/iptv-org/iptv) repository via their GitHub Pages API at `https://iptv-org.github.io/api/`. This app does not host or provide any streams directly.

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd iptv-web-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to GitHub Pages

1. Update `vite.config.ts` if needed (already configured)
2. Build the project: `npm run build`
3. Deploy the `dist` folder to GitHub Pages

## Project Structure

```
src/
├── components/       # Reusable UI components
│   └── AppShell.tsx  # Main layout with navigation
├── lib/              # Utilities and helpers
│   ├── data.ts       # Data fetching and normalization
│   └── db.ts         # IndexedDB operations
├── pages/            # Page components
│   ├── Browse.tsx    # Browse by countries/categories
│   ├── Search.tsx    # Search channels
│   ├── ChannelDetail.tsx  # Channel details & player
│   ├── Favorites.tsx # Favorite channels
│   ├── Settings.tsx  # App settings
│   └── About.tsx     # About & disclaimer
├── store/            # Zustand state management
│   └── index.ts      # Global app state
├── types/            # TypeScript type definitions
│   └── index.ts      # Type definitions
├── App.tsx           # Main app component with routing
├── main.tsx          # App entry point
└── index.css         # Global styles & Tailwind
```

## Mixed Content Warning

When accessing this app over HTTPS (e.g., on GitHub Pages), some streams using HTTP may be blocked by your browser's security policy. This is a browser security feature called "mixed content blocking".

**Workaround**: Run the app locally on `http://localhost` for the best compatibility with all streams.

The app includes:
- Automatic detection of mixed content scenarios
- Visual warnings when HTTP streams are accessed on HTTPS
- Optional setting to hide HTTP streams when on HTTPS

## Features Roadmap

- [x] Basic app structure and routing
- [x] Data fetching from iptv-org repository
- [x] IndexedDB caching with TTL
- [x] Responsive navigation (desktop sidebar + mobile bottom nav)
- [ ] Channel grid with infinite scroll
- [ ] Filter by country, category, language
- [ ] Fuzzy search implementation
- [ ] Video player with HLS support
- [ ] Favorites management
- [ ] Recently played history
- [ ] Stream quality selector
- [ ] PWA manifest and service worker
- [ ] Settings persistence
- [ ] Dark/Light theme toggle

## Disclaimer

This application is an IPTV player for personal use only. It fetches publicly available channel and stream data from the [iptv-org/iptv](https://github.com/iptv-org/iptv) repository on GitHub. This app does not host, provide, or distribute any streams. All streams are provided by third parties and are publicly accessible.

This application is intended for educational and research purposes. Users are responsible for ensuring they have the legal right to access any content. The developers of this application are not responsible for the content accessed through this player.

## Privacy

This application runs entirely in your browser. No personal data is collected or transmitted to any external servers except for fetching the public IPTV data from GitHub.

## License

MIT License - feel free to use this project for personal or educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using React, TypeScript, and Vite
