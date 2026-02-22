import { Channel } from '../../../types';
import { Link } from 'react-router-dom';
import { getCountryName, getCountryFlag } from '../../../services/countries';
import { useAppStore } from '../../../store';

interface ChannelCardProps {
  channel: Channel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const streamsByChannel = useAppStore(s => s.data?.streamsByChannel);
  const streamCount = streamsByChannel?.get(channel.id)?.length ?? 0;
  const hasNoStreams = streamCount === 0;

  return (
    <Link
      to={`/channel/${channel.id}`}
      className={`bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all group flex flex-col ${
        hasNoStreams ? 'opacity-50 grayscale hover:opacity-75 hover:grayscale-0' : ''
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-700 flex items-center justify-center relative overflow-hidden shrink-0">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain p-3 bg-gray-800"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.parentElement?.querySelector('.fallback-icon');
              if (fallback) (fallback as HTMLElement).classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`fallback-icon text-4xl ${channel.logo ? 'hidden' : ''}`}>📺</div>

        {channel.is_nsfw && (
          <div className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded z-10">
            18+
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1 group-hover:text-primary-400 transition-colors">
          {channel.name}
        </h3>

        {channel.country && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>{getCountryFlag(channel.country)}</span>
            <span className="truncate">{getCountryName(channel.country)}</span>
          </div>
        )}

        {/* Tags row: stream badge first, then categories */}
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              streamCount > 0
                ? 'bg-green-700/60 text-green-300'
                : 'bg-gray-700 text-gray-500'
            }`}
          >
            📡 {streamCount}
          </span>
          {channel.categories.slice(0, 1).map((cat) => (
            <span key={cat} className="text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded truncate max-w-[80px]">
              {cat}
            </span>
          ))}
          {channel.categories.length > 1 && (
            <span className="text-[10px] text-gray-500">+{channel.categories.length - 1}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
