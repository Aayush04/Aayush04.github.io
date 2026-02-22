export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">About IPTV Web Player</h1>

      <div className="space-y-6 text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Disclaimer</h2>
          <p className="leading-relaxed">
            This application is an IPTV player for personal use only. It fetches publicly available channel
            and stream data from the{' '}
            <a href="https://github.com/iptv-org/iptv" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
              iptv-org/iptv
            </a>{' '}
            repository on GitHub. This app does not host, provide, or distribute any streams. All streams
            are provided by third parties and are publicly accessible.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Usage</h2>
          <p className="leading-relaxed">
            This application is intended for educational and research purposes. Users are responsible for
            ensuring they have the legal right to access any content. The developers of this application
            are not responsible for the content accessed through this player.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Data Source</h2>
          <p className="leading-relaxed">
            All channel and stream information is sourced from the community-maintained{' '}
            <a href="https://github.com/iptv-org/iptv" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
              iptv-org/iptv
            </a>{' '}
            repository. Data is cached locally in your browser for up to 24 hours.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Mixed Content Warning</h2>
          <p className="leading-relaxed">
            When accessing this app over HTTPS (e.g., on GitHub Pages), some streams using HTTP may be
            blocked by your browser's security policy. For the best experience with all streams, run this
            app locally on{' '}
            <code className="bg-gray-800 px-2 py-1 rounded">http://localhost</code>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Privacy</h2>
          <p className="leading-relaxed">
            This application runs entirely in your browser. No personal data is collected or transmitted
            to any external servers except for fetching the public IPTV data from GitHub.
          </p>
        </section>

        <section className="pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-500">
            Built with React, TypeScript, and Vite. Open source project.
          </p>
        </section>
      </div>
    </div>
  );
}
