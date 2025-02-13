const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const CHANNEL_ID = 'UC2UhrbIufB22XF9l8OklzGw'; // Nature's Loops channel ID

// Cache for playlists and videos
let playlistsCache: YouTubePlaylist[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const videosCache: { [key: string]: YouTubeVideo[] } = {};

interface YouTubeSnippet {
  title: string;
  description: string;
  thumbnails: {
    default?: { url: string; };
    medium?: { url: string; };
    high?: { url: string; };
    standard?: { url: string; };
    maxres?: { url: string; };
  };
  resourceId?: {
    kind: string;
    videoId: string;
  };
}

interface YouTubePlaylistItem {
  kind: string;
  etag: string;
  id: string;
  snippet: YouTubeSnippet;
  contentDetails?: {
    itemCount?: number;
    videoId?: string;
    videoPublishedAt?: string;
  };
}

interface YouTubeApiResponse {
  kind: string;
  etag: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubePlaylistItem[];
  error?: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  videos: YouTubeVideo[];
}

export class YouTubeApiError extends Error {
  constructor(message: string, public code?: number) {
    super(message);
    this.name = 'YouTubeApiError';
  }
}

export const getChannelPlaylists = async (): Promise<YouTubePlaylist[]> => {
  try {
    // Check if cache is still valid
    const now = Date.now();
    if (playlistsCache && (now - lastFetchTime) < CACHE_DURATION) {
      return playlistsCache;
    }

    if (!YOUTUBE_API_KEY) {
      throw new YouTubeApiError('YouTube API key is not configured');
    }

    // Get all playlists from the channel
    const playlistResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${CHANNEL_ID}&maxResults=50&key=${YOUTUBE_API_KEY}`,
      { cache: 'no-store' } // Disable Next.js cache to always get fresh data
    );

    if (!playlistResponse.ok) {
      throw new YouTubeApiError(`Failed to fetch playlists: ${playlistResponse.status}`);
    }

    const data = await playlistResponse.json() as YouTubeApiResponse;

    if (data.error) {
      throw new YouTubeApiError(data.error.message, data.error.code);
    }

    if (!data.items || !Array.isArray(data.items)) {
      throw new YouTubeApiError('Invalid API response: no playlists found');
    }

    console.log('Found playlists:', data.items.length);

    playlistsCache = data.items.map((item: YouTubePlaylistItem) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || 
                item.snippet.thumbnails.medium?.url || 
                item.snippet.thumbnails.default?.url || '',
      videoCount: item.contentDetails?.itemCount || 0,
      videos: [],
    }));

    lastFetchTime = now;
    return playlistsCache;
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw error instanceof YouTubeApiError ? error : new YouTubeApiError('Failed to fetch playlists');
  }
};

export const getPlaylistVideos = async (playlistId: string): Promise<YouTubeVideo[]> => {
  try {
    // Check if cache is still valid
    const now = Date.now();
    if (videosCache[playlistId] && (now - lastFetchTime) < CACHE_DURATION) {
      return videosCache[playlistId];
    }

    if (!YOUTUBE_API_KEY) {
      throw new YouTubeApiError('YouTube API key is not configured');
    }

    console.log('Fetching playlist:', playlistId);

    // Get all videos from the playlist
    const apiUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(apiUrl, {
      cache: 'no-store' // Disable Next.js cache to always get fresh data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('YouTube API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new YouTubeApiError(
        `YouTube API Error: ${response.status} ${response.statusText}${
          errorData?.error?.message ? ` - ${errorData.error.message}` : ''
        }`
      );
    }

    const data = await response.json() as YouTubeApiResponse;

    if (data.error) {
      console.error('YouTube API Response Error:', data.error);
      throw new YouTubeApiError(data.error.message, data.error.code);
    }

    if (!data.items || !Array.isArray(data.items)) {
      console.warn('No videos found in playlist:', playlistId);
      return [];
    }

    const videos = data.items
      .filter(item => item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId)
      .map((item: YouTubePlaylistItem) => ({
        id: item.snippet.resourceId?.videoId || '',
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || 
                  item.snippet.thumbnails.medium?.url || 
                  item.snippet.thumbnails.default?.url || '',
      }))
      .filter(video => video.id); // Remove any videos without IDs

    console.log(`Found ${videos.length} videos in playlist:`, playlistId);
    
    // Cache the videos
    videosCache[playlistId] = videos;
    lastFetchTime = now;
    return videos;

  } catch (error) {
    console.error('Error fetching playlist videos:', {
      playlistId,
      error: error instanceof Error ? error.message : error
    });
    throw error instanceof YouTubeApiError ? error : new YouTubeApiError('Failed to fetch playlist videos');
  }
}; 