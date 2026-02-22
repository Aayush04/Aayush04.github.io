import { useState, useRef, useEffect } from 'react';
import { detectMixedContent } from '../../../services/iptvService';
import type { Stream } from '../../../types';

interface VideoPlayerProps {
  stream: Stream;
  channelName: string;
  channelLogo?: string;
}

export function VideoPlayer({ stream, channelName, channelLogo }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const mixedContent = detectMixedContent(stream.url);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleOpenNewTab = () => {
    window.open(stream.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      ref={containerRef}
      className={`bg-gray-900 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      <div className={`relative ${isFullscreen ? 'h-screen' : 'aspect-video'}`}>
        {!isPlaying ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
            {channelLogo ? (
              <img
                src={channelLogo}
                alt={channelName}
                className="h-24 w-auto max-w-xs object-contain mb-4"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="text-6xl mb-4">📺</div>
            )}
            <h3 className="text-xl font-semibold text-white mb-2">{channelName}</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-md text-center px-4">
              Click play to start streaming
            </p>

            {mixedContent.isMixedContent && (
              <div className="mb-4 mx-4 max-w-md bg-yellow-900/50 border border-yellow-600 rounded-lg p-3">
                <div className="flex items-start gap-2 text-sm text-yellow-200">
                  <span className="text-lg">⚠️</span>
                  <p>
                    This HTTP stream may be blocked by your browser on HTTPS.
                    Consider running locally on http://localhost for best compatibility.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setIsPlaying(true)}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <span>▶️</span>
                <span>Play Stream</span>
              </button>
              <button
                onClick={handleOpenNewTab}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <span>🔗</span>
                <span>Open in New Tab</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <iframe
              ref={iframeRef}
              src={stream.url}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={channelName}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity pointer-events-none hover:pointer-events-auto">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="px-3 py-2 bg-gray-800/90 hover:bg-gray-700 text-white rounded transition-colors text-sm flex items-center gap-1"
                    title="Stop"
                  >
                    <span>⏹️</span>
                    <span className="hidden sm:inline">Stop</span>
                  </button>
                  <button
                    onClick={handleOpenNewTab}
                    className="px-3 py-2 bg-gray-800/90 hover:bg-gray-700 text-white rounded transition-colors text-sm"
                    title="Open in new tab"
                  >
                    🔗
                  </button>
                </div>
                <button
                  onClick={handleFullscreen}
                  className="px-3 py-2 bg-gray-800/90 hover:bg-gray-700 text-white rounded transition-colors text-sm flex items-center gap-1"
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  <span>⛶</span>
                  <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Full'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isPlaying && stream.quality && !isFullscreen && (
        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {stream.quality}
        </div>
      )}
    </div>
  );
}
