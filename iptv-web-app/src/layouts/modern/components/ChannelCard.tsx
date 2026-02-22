import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { getCountryFlag } from '../../../services/countries';
import { addFavorite, removeFavorite, isFavorite } from '../../../services/cacheService';
import { Icon } from './Icon';
import type { Channel } from '../../../types';

interface ChannelCardProps {
  channel: Channel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const streamsByChannel = useAppStore(s => s.data?.streamsByChannel);
  const streamCount = streamsByChannel?.get(channel.id)?.length ?? 0;
  const hasStreams = streamCount > 0;

  const [fav, setFav] = useState(false);

  useEffect(() => {
    isFavorite(channel.id).then(setFav);
  }, [channel.id]);

  const handleFavToggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();   // don't navigate to channel page
    e.stopPropagation();
    if (fav) {
      await removeFavorite(channel.id);
      setFav(false);
    } else {
      await addFavorite(channel.id);
      setFav(true);
    }
  }, [fav, channel.id]);

  return (
    <Link
      to={`/channel/${channel.id}`}
      className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-200
        ${hasStreams
          ? 'bg-[#16161f] border-white/[0.07] hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/10 hover:-translate-y-0.5'
          : 'bg-[#111118] border-white/[0.04] opacity-50 grayscale hover:opacity-70 hover:grayscale-0'
        }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#0d0d14] flex items-center justify-center overflow-hidden">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain p-3"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fb = e.currentTarget.parentElement?.querySelector('.fb');
              if (fb) (fb as HTMLElement).classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`fb flex flex-col items-center gap-1 ${channel.logo ? 'hidden' : ''}`}>
          <Icon name="tv" size={28} className="text-white/20" />
        </div>

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Star / Favourite button */}
        <button
          onClick={handleFavToggle}
          title={fav ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-1.5 left-1.5 z-10 p-1 rounded-lg transition-all
            ${fav
              ? 'opacity-100 bg-amber-500/25 text-amber-400'
              : 'opacity-0 group-hover:opacity-100 bg-black/40 text-white/50 hover:text-amber-400 hover:bg-amber-500/20'
            }`}
        >
          <Icon name={fav ? 'star-filled' : 'star'} size={13} />
        </button>

        {/* NSFW badge */}
        {channel.is_nsfw && (
          <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md
                           bg-red-500/90 text-white tracking-wide uppercase z-10">
            18+
          </span>
        )}

        {/* Country flag */}
        {channel.country && (
          <span className="absolute bottom-2 right-2 text-base leading-none opacity-80 z-10">
            {getCountryFlag(channel.country)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-2.5 py-2 flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-white/90 line-clamp-1 group-hover:text-white transition-colors">
          {channel.name}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {/* Stream count */}
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
            hasStreams
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-white/5 text-white/25'
          }`}>
            <Icon name="signal" size={9} />
            {streamCount}
          </span>

          {/* First category */}
          {channel.categories[0] && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/40 truncate max-w-[70px]">
              {channel.categories[0]}
            </span>
          )}
          {channel.categories.length > 1 && (
            <span className="text-[10px] text-white/25">+{channel.categories.length - 1}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
