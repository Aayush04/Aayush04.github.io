import { Icon } from '../components/Icon';

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-sky-400">{icon}</div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="text-sm text-white/40 leading-relaxed">{children}</div>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="px-3 sm:px-5 py-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center flex-shrink-0">
          <Icon name="tv" size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">IPTV Player</h1>
          <p className="text-xs text-white/35">Free & open source web IPTV player</p>
        </div>
      </div>

      <div className="space-y-3">
        <Section icon={<Icon name="alert-triangle" size={15} />} title="Disclaimer">
          This application is an IPTV player for personal use only. It fetches publicly available
          channel and stream data from the{' '}
          <a
            href="https://github.com/iptv-org/iptv"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            iptv-org/iptv
          </a>{' '}
          repository on GitHub. This app does not host, provide, or distribute any streams.
          All streams are provided by third parties and are publicly accessible.
        </Section>

        <Section icon={<Icon name="info" size={15} />} title="Usage">
          This application is intended for educational and research purposes. Users are responsible
          for ensuring they have the legal right to access any content. The developers are not
          responsible for the content accessed through this player.
        </Section>

        <Section icon={<Icon name="globe" size={15} />} title="Data Source">
          All channel and stream information is sourced from the community-maintained{' '}
          <a
            href="https://github.com/iptv-org/iptv"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            iptv-org/iptv
          </a>{' '}
          repository. Data is cached locally in your browser for up to 24 hours to reduce
          network usage.
        </Section>

        <Section icon={<Icon name="wifi-off" size={15} />} title="Mixed Content Warning">
          When accessing this app over HTTPS (e.g., on GitHub Pages), some streams using HTTP
          may be blocked by your browser's security policy. For the best experience with all streams,
          run this app locally on{' '}
          <code className="bg-white/[0.07] px-1.5 py-0.5 rounded-md text-white/60 font-mono text-xs">
            http://localhost
          </code>
          .
        </Section>

        <Section icon={<Icon name="layers" size={15} />} title="Privacy">
          This application runs entirely in your browser. No personal data is collected or
          transmitted to any external servers except for fetching the public IPTV data from GitHub.
          Favorites and settings are stored locally using IndexedDB.
        </Section>

        {/* Footer */}
        <div className="px-1 pt-1">
          <p className="text-xs text-white/20 text-center">
            Built with React · TypeScript · Vite · TailwindCSS
          </p>
        </div>
      </div>
    </div>
  );
}
