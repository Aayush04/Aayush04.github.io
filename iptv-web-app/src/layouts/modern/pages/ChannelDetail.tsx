import { useParams, Link } from 'react-router-dom';
import { useChannelDetail } from '../../../hooks/useChannelDetail';
import { getCountryName, getCountryFlag } from '../../../services/countries';
import { VideoPlayer } from '../components/VideoPlayer';
import { Icon } from '../components/Icon';

export function ChannelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    channel,
    streams,
    selectedStream,
    setSelectedStream,
    isFav,
    toggleFavorite,
    loading,
  } = useChannelDetail(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Icon name="loader" size={28} className="text-sky-500 animate-spin" />
          <p className="text-white/40 text-sm">Loading channel…</p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
            <Icon name="wifi-off" size={26} className="text-white/20" />
          </div>
          <div className="text-center">
            <h2 className="text-white font-semibold mb-1">Channel not found</h2>
            <Link to="/" className="text-sky-400 hover:text-sky-300 text-sm transition-colors">
              Back to Browse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5 py-4 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/80
                   text-sm mb-4 transition-colors group"
      >
        <Icon name="arrow-left" size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Browse
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          {channel.logo && (
            <div className="w-12 h-12 rounded-xl bg-[#111118] border border-white/[0.07] flex-shrink-0 overflow-hidden">
              <img src={channel.logo} alt="" className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{channel.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {channel.country && (
                <span className="text-xs text-white/40 flex items-center gap-1">
                  <span>{getCountryFlag(channel.country)}</span>
                  <span>{getCountryName(channel.country)}</span>
                </span>
              )}
              {channel.network && (
                <span className="text-xs text-white/30">{channel.network}</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={toggleFavorite}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            isFav
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-white/[0.06] text-white/50 border border-white/[0.08] hover:bg-white/[0.10] hover:text-white/80'
          }`}
        >
          <Icon name={isFav ? 'heart-filled' : 'heart'} size={15} />
          <span className="hidden sm:inline">{isFav ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Categories */}
      {channel.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {channel.categories.map(cat => (
            <span key={cat} className="px-2.5 py-1 bg-white/[0.06] border border-white/[0.08] rounded-lg text-[11px] text-white/50">
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Player or No-streams */}
      {streams.length > 0 && selectedStream ? (
        <div className="mb-5">
          <VideoPlayer stream={selectedStream} channelName={channel.name} channelLogo={channel.logo} />

          {/* Stream selector */}
          {streams.length > 1 && (
            <div className="mt-3 bg-[#111118] border border-white/[0.06] rounded-2xl p-3">
              <p className="text-[11px] text-white/35 font-medium uppercase tracking-wide mb-2 px-0.5">
                Streams · {streams.length}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {streams.map((stream, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedStream(stream)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      selectedStream === stream
                        ? 'bg-sky-500/20 border border-sky-500/40 text-sky-300'
                        : 'bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.08] hover:text-white/80'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon name="signal" size={11} className={selectedStream === stream ? 'text-sky-400' : 'text-white/25'} />
                      Stream {index + 1}
                    </span>
                    {stream.quality && (
                      <span className={`text-[10px] ${selectedStream === stream ? 'text-sky-400/80' : 'text-white/25'}`}>
                        {stream.quality}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stream URL */}
          <div className="mt-3 bg-[#111118] border border-white/[0.06] rounded-2xl p-3">
            <p className="text-[11px] text-white/35 font-medium uppercase tracking-wide mb-2 px-0.5">Stream URL</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/40 text-white/50 text-[11px] px-3 py-2 rounded-xl overflow-x-auto whitespace-nowrap border border-white/[0.05]">
                {selectedStream.url}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(selectedStream.url)}
                title="Copy URL"
                className="flex-shrink-0 p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/50 hover:text-white transition-all"
              >
                <Icon name="copy" size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 mb-5 bg-[#111118] border border-white/[0.06] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-3">
            <Icon name="satellite" size={22} className="text-white/20" />
          </div>
          <p className="text-white/40 font-medium">No streams available</p>
          <p className="text-white/25 text-sm mt-0.5">This channel has no playable streams</p>
        </div>
      )}

      {/* Info card */}
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-4">
        <p className="text-[11px] text-white/35 font-medium uppercase tracking-wide mb-3">Channel Info</p>
        <dl className="space-y-3">
          {channel.website && (
            <div className="flex items-center justify-between">
              <dt className="text-xs text-white/35 flex items-center gap-1.5">
                <Icon name="globe" size={12} />Website
              </dt>
              <dd>
                <a href={channel.website} target="_blank" rel="noopener noreferrer"
                   className="text-sky-400 hover:text-sky-300 text-xs flex items-center gap-1 transition-colors">
                  <span className="max-w-[200px] truncate">{channel.website.replace(/^https?:\/\//, '')}</span>
                  <Icon name="external-link" size={11} />
                </a>
              </dd>
            </div>
          )}
          {channel.languages && channel.languages.length > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-xs text-white/35 flex items-center gap-1.5">
                <Icon name="layers" size={12} />Languages
              </dt>
              <dd className="text-xs text-white/60">{channel.languages.join(', ')}</dd>
            </div>
          )}
          {streams.length > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-xs text-white/35 flex items-center gap-1.5">
                <Icon name="signal" size={12} />Streams
              </dt>
              <dd className="text-xs text-emerald-400">{streams.length} available</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
