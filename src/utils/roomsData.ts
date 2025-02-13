import { getChannelPlaylists } from './youtubeService';

export interface Room {
  id: string;
  name: string;
  description: string;
  image: string;
  playlistId: string;
  category: 'study' | 'work' | 'relax' | 'focus';
  mood: 'chill' | 'upbeat' | 'peaceful' | 'energetic';
  color: string;
  channelNumber: number;
  currentVideo?: {
    id: string;
    title: string;
  };
}

// Default room images as fallbacks
const roomDefaults = {
  study: {
    image: '/images/cafe.jpg',
    color: 'bg-amber-500',
    mood: 'chill' as const,
  },
  work: {
    image: '/images/city.jpg',
    color: 'bg-purple-600',
    mood: 'peaceful' as const,
  },
  relax: {
    image: '/images/garden.jpg',
    color: 'bg-green-500',
    mood: 'peaceful' as const,
  },
  focus: {
    image: '/images/coding.jpg',
    color: 'bg-blue-600',
    mood: 'upbeat' as const,
  },
};

// Initialize rooms array
let rooms: Room[] = [];
let isInitialized = false;
let lastInitTime = 0;
const INIT_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds

// Function to initialize rooms from YouTube playlists
export const initializeRooms = async () => {
  try {
    const now = Date.now();
    // Only return cached rooms if they were initialized recently
    if (isInitialized && rooms.length > 0 && (now - lastInitTime) < INIT_COOLDOWN) {
      return rooms;
    }

    const playlists = await getChannelPlaylists();
    console.log('Fetched playlists:', playlists);

    // Filter out any invalid playlists (e.g., deleted or private)
    const validPlaylists = playlists.filter(playlist => 
      playlist.id && 
      playlist.title && 
      playlist.videoCount > 0
    );

    rooms = validPlaylists.map((playlist, index) => {
      // Determine category based on playlist name or index
      const category = determineCategory(playlist.title, index);
      const defaults = roomDefaults[category];

      return {
        id: playlist.id,
        name: playlist.title,
        description: playlist.description || `Enjoy the vibes of ${playlist.title}`,
        image: playlist.thumbnail || defaults.image,
        playlistId: playlist.id,
        category,
        mood: defaults.mood,
        color: defaults.color,
        channelNumber: index + 1,
      };
    });

    isInitialized = true;
    lastInitTime = now;
    console.log('Initialized rooms:', rooms);
    return rooms;
  } catch (error) {
    console.error('Error initializing rooms:', error);
    // If there's an error, clear the cache to force a refresh next time
    isInitialized = false;
    rooms = [];
    return [];
  }
};

// Helper function to determine room category
const determineCategory = (title: string, index: number): Room['category'] => {
  title = title.toLowerCase();
  if (title.includes('study') || title.includes('cafe') || title.includes('coffee')) {
    return 'study';
  }
  if (title.includes('work') || title.includes('focus') || title.includes('productivity')) {
    return 'work';
  }
  if (title.includes('relax') || title.includes('chill') || title.includes('ambient')) {
    return 'relax';
  }
  // Default to categories in rotation if no match
  const categories: Room['category'][] = ['study', 'work', 'relax', 'focus'];
  return categories[index % categories.length];
};

// Export current rooms
export const getRooms = async () => {
  if (!isInitialized || rooms.length === 0) {
    return initializeRooms();
  }
  return rooms;
};

// Get room by ID
export const getRoom = async (id: string): Promise<Room | undefined> => {
  const currentRooms = await getRooms();
  return currentRooms.find(room => room.id === id);
};

// Get rooms by category
export const getRoomsByCategory = async (category: Room['category']): Promise<Room[]> => {
  const currentRooms = await getRooms();
  return currentRooms.filter(room => room.category === category);
};

// Get rooms by mood
export const getRoomsByMood = async (mood: Room['mood']): Promise<Room[]> => {
  const currentRooms = await getRooms();
  return currentRooms.filter(room => room.mood === mood);
};
