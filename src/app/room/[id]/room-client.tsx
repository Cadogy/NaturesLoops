'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TVInterface } from '../../../components/TVInterface';
import { type Room } from '../../../utils/roomsData';
import { getPlaylistVideos, type YouTubeVideo } from '../../../utils/youtubeService';
import { useYouTubePlayer } from '../../../contexts/YouTubePlayerContext';
import { Loader2 } from 'lucide-react';

interface RoomClientProps {
  initialRoom: Room;
  allRooms: Room[];
}

export default function RoomClient({ initialRoom, allRooms }: RoomClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const { togglePlay, toggleMute } = useYouTubePlayer();

  // Track user presence in room
  useEffect(() => {
    // Add user to room
    const addUserToRoom = async () => {
      try {
        const response = await fetch('/api/active-users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: initialRoom.id,
            increment: 1
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update active users');
        }
      } catch (error) {
        console.error('Error adding user to room:', error);
      }
    };

    // Remove user from room
    const removeUserFromRoom = async () => {
      try {
        const response = await fetch('/api/active-users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: initialRoom.id,
            increment: -1
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update active users');
        }
      } catch (error) {
        console.error('Error removing user from room:', error);
      }
    };

    // Add user when entering room
    addUserToRoom();

    // Clean up when component unmounts or room changes
    return () => {
      removeUserFromRoom();
    };
  }, [initialRoom.id]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent handling if user is typing in an input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':  // Space
          event.preventDefault(); // Prevent page scroll
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'escape':
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => {
              console.error('Error exiting fullscreen:', err);
            });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay, toggleMute]);

  // Load initial videos
  useEffect(() => {
    let isMounted = true;

    const loadVideos = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        setError(null);

        // Try to get pre-loaded videos first
        const storedVideos = sessionStorage.getItem('roomVideos');
        
        if (storedVideos) {
          const parsedVideos = JSON.parse(storedVideos);
          sessionStorage.removeItem('roomVideos');
          if (isMounted) {
            setVideos(parsedVideos);
            setIsLoading(false);
          }
          return;
        }

        // If no pre-loaded videos, load them
        const roomVideos = await getPlaylistVideos(initialRoom.playlistId);
        if (!roomVideos || roomVideos.length === 0) {
          throw new Error('No videos available in this room');
        }

        if (isMounted) {
          setVideos(roomVideos);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading videos:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to load videos');
          setIsLoading(false);
        }
      }
    };

    loadVideos();
    return () => { isMounted = false; };
  }, [initialRoom.playlistId]);

  const handleChannelChange = async (newRoom: Room) => {
    try {
      setIsLoading(true);
      setError(null);
      const videos = await getPlaylistVideos(newRoom.playlistId);
      if (!videos || videos.length === 0) {
        throw new Error('No videos available in the selected room');
      }
      sessionStorage.setItem('selectedRoom', JSON.stringify(newRoom));
      sessionStorage.setItem('roomVideos', JSON.stringify(videos));
      router.push(`/room/${newRoom.id}`);
    } catch (error) {
      console.error('Error changing room:', error);
      setError(error instanceof Error ? error.message : 'Failed to change room');
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error</p>
          <p className="text-white">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm text-white"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !videos.length) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p>Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TVInterface
        room={initialRoom}
        onChannelChange={handleChannelChange}
        allRooms={allRooms}
        initialVideos={videos}
      />
    </div>
  );
} 