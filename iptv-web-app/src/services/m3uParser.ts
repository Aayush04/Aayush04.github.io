import type { Channel, Stream } from '../types';

interface M3UEntry {
  url: string;
  title?: string;
  logo?: string;
  groupTitle?: string;
  tvgId?: string;
  tvgName?: string;
  country?: string;
  language?: string;
}

/**
 * Parse M3U playlist format
 */
export function parseM3U(content: string): M3UEntry[] {
  const lines = content.split('\n').map(line => line.trim());
  const entries: M3UEntry[] = [];
  
  let currentEntry: Partial<M3UEntry> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines and comments (except EXTINF)
    if (!line || (line.startsWith('#') && !line.startsWith('#EXTINF'))) {
      continue;
    }
    
    // Parse EXTINF line
    if (line.startsWith('#EXTINF')) {
      // Example: #EXTINF:-1 tvg-id="ABC.us" tvg-logo="https://..." group-title="News",ABC News
      const attributes = parseAttributes(line);
      const titleMatch = line.match(/,(.+)$/);
      
      currentEntry = {
        tvgId: attributes['tvg-id'],
        tvgName: attributes['tvg-name'],
        logo: attributes['tvg-logo'],
        groupTitle: attributes['group-title'],
        title: titleMatch ? titleMatch[1].trim() : undefined,
      };
    }
    // Parse URL line
    else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentEntry.title || currentEntry.tvgName) {
        entries.push({
          url: line,
          title: currentEntry.title || currentEntry.tvgName,
          logo: currentEntry.logo,
          groupTitle: currentEntry.groupTitle,
          tvgId: currentEntry.tvgId,
          tvgName: currentEntry.tvgName,
        });
      }
      currentEntry = {};
    }
  }
  
  return entries;
}

/**
 * Parse attributes from EXTINF line
 */
function parseAttributes(line: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([a-z-]+)="([^"]*)"/gi;
  let match;
  
  while ((match = attrRegex.exec(line)) !== null) {
    attrs[match[1].toLowerCase()] = match[2];
  }
  
  return attrs;
}

/**
 * Convert M3U entries to Channel and Stream format
 */
export function m3uToChannelsAndStreams(entries: M3UEntry[]): { channels: Channel[], streams: Stream[] } {
  const channelsMap = new Map<string, Channel>();
  const streams: Stream[] = [];
  
  entries.forEach((entry, index) => {
    const channelId = entry.tvgId || `m3u-${index}`;
    const channelName = entry.title || entry.tvgName || `Channel ${index + 1}`;
    const category = entry.groupTitle || 'general';
    
    // Create or update channel
    if (!channelsMap.has(channelId)) {
      channelsMap.set(channelId, {
        id: channelId,
        name: channelName,
        network: undefined,
        country: entry.country || 'INT',
        subdivision: undefined,
        city: undefined,
        broadcast_area: [],
        languages: entry.language ? [entry.language] : [],
        categories: [category.toLowerCase()],
        is_nsfw: false,
        launched: undefined,
        closed: undefined,
        replaced_by: undefined,
        website: undefined,
        logo: entry.logo,
      });
    }
    
    // Add stream
    streams.push({
      channel: channelId,
      url: entry.url,
      title: channelName,
      quality: null,
      feed: null,
      http_referrer: undefined,
      referrer: null,
      user_agent: undefined,
      timeshift: undefined,
      status: undefined,
    });
  });
  
  return {
    channels: Array.from(channelsMap.values()),
    streams,
  };
}
