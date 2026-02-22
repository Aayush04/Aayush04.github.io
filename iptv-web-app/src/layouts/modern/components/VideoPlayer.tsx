import { useState, useRef, useEffect } from 'react';
import { detectMixedContent } from '../../../services/iptvService';
import type { Stream } from '../../../types';
import { Icon } from './Icon';

interface VideoPlayerProps {
  stream: Stream;
  channelName: string;
  channelLogo?: string;
}

export function VideoPlayer({ stream, channelName, channelLogo }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mixedContent = detectMixedContent(stream.url);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const showControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2500);
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) await containerRef.current.requestFullscreen();
      else await document.exitFullscreen();
    } catch { /* ignore */ }
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl overflow-hidden bg-black border border-white/[0.07] ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : ''}`}
    >
      <div
        className={`relative ${isFullscreen ? 'h-screen' : 'aspect-video'}`}
        onMouseMove={isPlaying ? showControls : undefined}
        onTouchStart={isPlaying ? showControls : undefined}
      >
        {!isPlaying ? (
          /* ── Pre-play screen ─────────────────────────── */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0d0d18] to-[#0a0a12] gap-4 px-6">
            {/* Logo / icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-sky-500/20 blur-2xl" />
              {channelLogo ? (
                <img
                  src={channelLogo}
                  alt={channelName}
                  className="relative h-20 w-auto max-w-[180px] object-contain rounded-xl"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="relative w-20 h-20 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  <Icon name="tv" size={36} className="text-white/30" />
                </div>
              )}
            </div>

            <div className="text-center">
              <h3 className="text-white font-semibold text-lg">{channelName}</h3>
              {stream.quality && (
                <span className="text-xs text-white/40 mt-0.5 block">{stream.quality}</span>
              )}
            </div>

            {/* Mixed content warning */}
            {mixedContent.isMixedContent && (
              <div className="flex items-start gap-2.5 max-w-sm bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <Icon name="alert-triangle" size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  This HTTP stream may be blocked on HTTPS. Run locally for best compatibility.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsPlaying(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                           bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400
                           text-white text-sm font-semibold shadow-lg shadow-sky-500/25
                           transition-all active:scale-95"
              >
                <Icon name="play" size={14} />
                Play Stream
              </button>
              <button
                onClick={() => window.open(stream.url, '_blank', 'noopener,noreferrer')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                           bg-white/[0.07] hover:bg-white/[0.12] border border-white/10
                           text-white/70 text-sm font-medium transition-all active:scale-95"
              >
                <Icon name="external-link" size={14} />
                Open tab
              </button>
            </div>
          </div>
        ) : (
          /* ── Playing ─────────────────────────────────── */
          <>
            <iframe
              src={stream.url}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={channelName}
            />

            {/* Control bar — visible on hover/touch */}
            <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
              controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}>
              <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pt-10 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20
                                 text-white text-xs font-medium transition-colors"
                    >
                      <Icon name="stop" size={13} />
                      <span className="hidden sm:inline">Stop</span>
                    </button>
                    <button
                      onClick={() => window.open(stream.url, '_blank', 'noopener,noreferrer')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20
                                 text-white text-xs font-medium transition-colors"
                    >
                      <Icon name="external-link" size={13} />
                    </button>
                  </div>
                  <button
                    onClick={handleFullscreen}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20
                               text-white text-xs font-medium transition-colors"
                  >
                    <Icon name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} size={13} />
                    <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Full'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quality badge */}
            {stream.quality && !isFullscreen && (
              <div className="absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-lg
                              bg-black/70 text-white/70 border border-white/10">
                {stream.quality}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
