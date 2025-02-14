'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TVInterface } from '../../../components/TVInterface';
import { type Room } from '../../../utils/roomsData';
import { getPlaylistVideos, type YouTubeVideo } from '../../../utils/youtubeService';
import { useYouTubePlayer } from '../../../contexts/YouTubePlayerContext';
import { v4 as uuidv4 } from 'uuid';
import { TVStatic } from '../../../components/TVStatic';

interface RoomClientProps {
  initialRoom: Room;
  allRooms: Room[];
}

export default function RoomClient({ initialRoom, allRooms }: RoomClientProps) {
  const [sessionId] = useState(() => uuidv4()); // Generate unique session ID
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const { togglePlay, toggleMute, player, setVolume } = useYouTubePlayer();
  const [isMobile, setIsMobile] = useState(false);
  const [showStatic, setShowStatic] = useState(false);
  const [nextRoom, setNextRoom] = useState<Room | null>(null);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track user presence in room with enhanced session management
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
            increment: 1,
            sessionId
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
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: initialRoom.id,
            sessionId
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove user');
        }
      } catch (error) {
        console.error('Error removing user from room:', error);
      }
    };

    // Heartbeat to keep session alive
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/active-users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: initialRoom.id,
            increment: 0, // No increment, just update lastUpdated
            sessionId
          })
        });
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    };

    // Initialize presence
    addUserToRoom();

    // Set up heartbeat interval
    const heartbeatInterval = setInterval(sendHeartbeat, 30000); // Every 30 seconds

    // Clean up function
    const cleanup = () => {
      removeUserFromRoom();
      clearInterval(heartbeatInterval);
    };

    // Add event listeners for page visibility and unload
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        cleanup();
      } else {
        addUserToRoom();
      }
    };

    const handleBeforeUnload = () => {
      cleanup();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on component unmount
    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [initialRoom.id, sessionId]);

  const handleChannelChange = useCallback(async (newRoom: Room) => {
    if (showStatic || newRoom.id === initialRoom.id) return;
    
    try {
      // Show static first
      setShowStatic(true);
      setNextRoom(newRoom);
      
      // Pre-load the videos while static effect is playing
      const videos = await getPlaylistVideos(newRoom.playlistId);
      
      if (videos.length === 0) {
        throw new Error('No videos found in this playlist');
      }
      
      // Store the videos for the next room
      sessionStorage.setItem('selectedRoom', JSON.stringify(newRoom));
      sessionStorage.setItem('roomVideos', JSON.stringify(videos));

      // Wait for static effect (0.7s total for visual + sound)
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Now navigate
      router.push(`/room/${newRoom.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to load playlist videos';
      setError(errorMessage);
      console.error('Error loading playlist videos:', err);
      setShowStatic(false);
      setNextRoom(null);
    }
  }, [showStatic, initialRoom.id, router]);

  const handleStaticComplete = useCallback(() => {
    setShowStatic(false);
    setNextRoom(null);
  }, []);

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
        case 'arrowleft': {
          event.preventDefault();
          // Find current room index
          const currentIndex = allRooms.findIndex(room => room.id === initialRoom.id);
          // Get previous room (or wrap to end)
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : allRooms.length - 1;
          const prevRoom = allRooms[prevIndex];
          if (prevRoom) {
            handleChannelChange(prevRoom);
          }
          break;
        }
        case 'arrowright': {
          event.preventDefault();
          // Find current room index
          const currentIndex = allRooms.findIndex(room => room.id === initialRoom.id);
          // Get next room (or wrap to start)
          const nextIndex = currentIndex < allRooms.length - 1 ? currentIndex + 1 : 0;
          const nextRoom = allRooms[nextIndex];
          if (nextRoom) {
            handleChannelChange(nextRoom);
          }
          break;
        }
        case 'arrowup': {
          event.preventDefault();
          // Increase volume by 10%
          if (player) {
            const currentVolume = Number(player.getVolume());
            const newVolume = Math.min(100, currentVolume + 10);
            setVolume(newVolume);
          }
          break;
        }
        case 'arrowdown': {
          event.preventDefault();
          // Decrease volume by 10%
          if (player) {
            const currentVolume = Number(player.getVolume());
            const newVolume = Math.max(0, currentVolume - 10);
            setVolume(newVolume);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay, toggleMute, initialRoom.id, allRooms, handleChannelChange, player, setVolume]);

  // Load initial videos
  useEffect(() => {
    let isMounted = true;

    const loadVideos = async () => {
      try {
        if (!isMounted) return;
        setError(null);

        // Try to get pre-loaded videos first
        const storedVideos = sessionStorage.getItem('roomVideos');
        
        if (storedVideos) {
          const parsedVideos = JSON.parse(storedVideos);
          sessionStorage.removeItem('roomVideos');
          if (isMounted) {
            setVideos(parsedVideos);
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
        }
      } catch (error) {
        console.error('Error loading videos:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to load videos');
        }
      }
    };

    loadVideos();
    return () => { isMounted = false; };
  }, [initialRoom.playlistId]);

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

  if (!videos.length) return null;

  return (
    <div className="min-h-screen bg-black">
      {/* Static Effect - Place it first so it's behind everything */}
      <TVStatic isVisible={showStatic} onAnimationComplete={handleStaticComplete} />
      {/* Channel Number */}
      {showStatic && nextRoom && (
        <div className="fixed top-4 right-4 bg-black/80 text-green-500 font-mono px-4 py-2 rounded-lg text-2xl z-[70]">
          CH {nextRoom.channelNumber}
        </div>
      )}
      <TVInterface
        room={initialRoom}
        onChannelChange={handleChannelChange}
        allRooms={allRooms}
        initialVideos={videos}
      />
      {/* Footer */}
      <div className="fixed bottom-[6.3rem] sm:bottom-[5.8rem] bg-white dark:bg-gray-900/0 backdrop-blur-lg p-4 left-0 right-0 text-center z-50">
        <p className="text-white/40 text-[10px] sm:text-xs md:text-sm font-mono px-2 sm:px-4">
          {isMobile ? (
            "Double tap edges to change rooms • Double tap center to play/pause • Shake to shuffle"
          ) : (
            "ESC to exit • Space to play/pause • M to mute • ←/→ to change rooms • ↑/↓ to adjust volume"
          )}
        </p>
      </div>
    </div>
  );
} 