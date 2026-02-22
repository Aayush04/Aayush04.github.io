import { useParams, Link } from 'react-router-dom';
import { useChannelDetail } from '../../../hooks/useChannelDetail';
import { getCountryName, getCountryFlag } from '../../../services/countries';
import { VideoPlayer } from '../components/VideoPlayer';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-white mb-2">Channel not found</h2>
          <Link to="/" className="text-primary-400 hover:underline">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="text-primary-400 hover:underline mb-4 inline-block">
          ← Back to Browse
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{channel.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-400">
              {channel.country && (
                <span className="flex items-center gap-1">
                  <span>{getCountryFlag(channel.country)}</span>
                  <span>{getCountryName(channel.country)}</span>
                </span>
              )}
              {channel.network && <span>Network: {channel.network}</span>}
            </div>
          </div>

          <button
            onClick={toggleFavorite}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isFav
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {isFav ? '⭐ Favorited' : '☆ Add to Favorites'}
          </button>
        </div>
      </div>

      {/* Categories */}
      {channel.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {channel.categories.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Player */}
      {streams.length > 0 && selectedStream ? (
        <div className="mb-6">
          <VideoPlayer stream={selectedStream} channelName={channel.name} channelLogo={channel.logo} />

          {/* Stream Selection */}
          {streams.length > 1 && (
            <div className="bg-gray-800 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-white mb-3">Available Streams ({streams.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {streams.map((stream, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedStream(stream)}
                    className={`px-4 py-2 rounded text-sm transition-colors text-left ${
                      selectedStream === stream
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Stream {index + 1}</span>
                      {stream.quality && (
                        <span className="text-xs opacity-75">{stream.quality}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stream Info */}
          <div className="bg-gray-800 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-white mb-2">Stream URL</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-900 text-gray-300 px-3 py-2 rounded text-sm overflow-x-auto">
                {selectedStream.url}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(selectedStream.url)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                title="Copy URL"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center mb-6">
          <div className="text-5xl mb-4">📡</div>
          <p className="text-gray-400">No streams available for this channel</p>
        </div>
      )}

      {/* Channel Info */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Channel Information</h2>
        <dl className="space-y-3">
          {channel.website && (
            <div>
              <dt className="text-gray-400 text-sm">Website</dt>
              <dd>
                <a
                  href={channel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:underline"
                >
                  {channel.website}
                </a>
              </dd>
            </div>
          )}
          {channel.languages && channel.languages.length > 0 && (
            <div>
              <dt className="text-gray-400 text-sm">Languages</dt>
              <dd className="text-white">{channel.languages.join(', ')}</dd>
            </div>
          )}
          {streams.length > 0 && (
            <div>
              <dt className="text-gray-400 text-sm">Available Streams</dt>
              <dd className="text-white">{streams.length} stream{streams.length !== 1 ? 's' : ''}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
