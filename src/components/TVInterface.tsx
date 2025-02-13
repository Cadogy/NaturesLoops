'use client';

import { useState, useCallback, useEffect } from 'react';
import { Instagram, Maximize2, Minimize2, Home, Info, Youtube } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useYouTubePlayer } from '../contexts/YouTubePlayerContext';
import { Room } from '../utils/roomsData';
import { YouTubeVideo, getPlaylistVideos, YouTubeApiError } from '../utils/youtubeService';
import YouTube from 'react-youtube';
import AudioPlayer from './AudioPlayer';
import { useRouter } from 'next/navigation';
import { AboutDialog } from './AboutDialog';
import type { YouTubeEvent } from 'react-youtube';

declare global {
  interface Window {
    YT: {
      PlayerState: {
        ENDED: number;
        UNSTARTED: number;
      };
    };
  }
}

interface TVInterfaceProps {
  room: Room;
  onChannelChange: (room: Room) => void;
  allRooms: Room[];
  initialVideos?: YouTubeVideo[];
}

export function TVInterface({ room, onChannelChange, allRooms, initialVideos }: TVInterfaceProps) {
  const [showChannelNumber, setShowChannelNumber] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const router = useRouter();

  const {
    currentVideo,
    handleReady: onPlayerReady,
    handleStateChange: onPlayerStateChange,
    setRoom: setPlayerRoom,
  } = useYouTubePlayer();

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  // Initialize with provided videos if available
  useEffect(() => {
    if (initialVideos?.length) {
      setPlayerRoom(room, initialVideos);
    }
  }, [room, initialVideos, setPlayerRoom]);

  // Ensure video plays on page load/refresh
  const handlePlayerReady = useCallback((event: YouTubeEvent) => {
    // Force playback to start
    event.target.playVideo();
    onPlayerReady(event);
  }, [onPlayerReady]);

  const handlePlayerStateChange = useCallback((event: YouTubeEvent) => {
    // If video ends or is unstarted, try to play it
    if (event.data === window.YT?.PlayerState?.ENDED || 
        event.data === window.YT?.PlayerState?.UNSTARTED) {
      event.target.playVideo();
    }
    onPlayerStateChange(event);
  }, [onPlayerStateChange]);

  const handleChannelChange = useCallback(async (newRoom: Room) => {
    if (isLoading || newRoom.id === room.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setShowChannelNumber(true);
      
      const videos = await getPlaylistVideos(newRoom.playlistId);
      
      if (videos.length === 0) {
        throw new Error('No videos found in this playlist');
      }
      
      setPlayerRoom(newRoom, videos);
      onChannelChange(newRoom);
    } catch (err) {
      const errorMessage = err instanceof YouTubeApiError 
        ? err.message 
        : 'Failed to load playlist videos';
      setError(errorMessage);
      console.error('Error loading playlist videos:', err);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setShowChannelNumber(false);
      }, 1500);
    }
  }, [isLoading, room.id, onChannelChange, setPlayerRoom]);

  return (
    <Tooltip.Provider delayDuration={300}>
      <Dialog.Root>
        <div className="fixed inset-0 bg-black">
          {/* Main TV Screen */}
          <div className="absolute inset-0">
            {/* CRT and Scanline Effects */}
            <div className="absolute inset-0 pointer-events-none bg-crt z-30" />
            <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-30 z-30" />
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 animate-scanline z-30" />
            </div>

            {/* Channel Number */}
            {showChannelNumber && (
              <div className="absolute top-4 right-4 bg-black/80 text-green-500 font-mono px-4 py-2 rounded-lg text-2xl z-40">
                CH {room.channelNumber}
              </div>
            )}

            {/* YouTube Player Container */}
            <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
              {currentVideo && !error && (
                <div className="relative w-full h-full transform scale-125">
                  <YouTube
                    videoId={currentVideo.id}
                    opts={{
                      width: '100%',
                      height: '100%',
                      playerVars: {
                        autoplay: 1,
                        controls: 0,
                        disablekb: 1,
                        enablejsapi: 1,
                        fs: 0,
                        modestbranding: 1,
                        playsinline: 1,
                        rel: 0,
                        origin: window.location.origin,
                        loop: 1,
                        iv_load_policy: 3,
                        cc_load_policy: 1,
                        playlist: currentVideo.id,
                      },
                    }}
                    onReady={handlePlayerReady}
                    onStateChange={handlePlayerStateChange}
                    className="w-full h-full"
                    iframeClassName="w-full h-full pointer-events-none !bg-black"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  />
                  {/* Overlay to prevent YouTube UI from showing */}
                  <div 
                    className="absolute inset-0 z-10 bg-black/10" 
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              )}
            </div>

            {/* Error and Loading States */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white z-10">
                <div className="text-center">
                  <p className="text-red-500 mb-2">Error</p>
                  <p>{error}</p>
                  <button
                    onClick={() => handleChannelChange(room)}
                    className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Social Links and Controls */}
            <div className="fixed z-[102] top-0 right-0 p-4 flex flex-col sm:flex-row items-end sm:items-center gap-4 text-white/60">
              <div className="flex items-center gap-4">
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => router.push('/')}
                      className="hover:text-white transition-colors p-2"
                    >
                      <Home className="w-5 h-5" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="bg-black/90 text-white text-xs px-2 py-1 rounded">
                      Return Home
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={toggleFullscreen}
                      className="hover:text-white transition-colors p-2"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-5 h-5" />
                      ) : (
                        <Maximize2 className="w-5 h-5" />
                      )}
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="bg-black/90 text-white text-xs px-2 py-1 rounded">
                      {isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen'}
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => setShowAbout(true)}
                      className="hover:text-white transition-colors p-2"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="bg-black/90 text-white text-xs px-2 py-1 rounded">
                      About Us
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>

              <div className="flex items-center gap-4">
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <a 
                      href="https://instagram.com/NaturesLoops" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-white transition-colors p-2"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="bg-black/90 text-white text-xs px-2 py-1 rounded">
                      Instagram
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <a 
                      href="https://www.youtube.com/@NaturesLoops/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-white transition-colors p-2"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="bg-black/90 text-white text-xs px-2 py-1 rounded">
                      YouTube
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
            </div>

            {/* About Dialog */}
            <AboutDialog isOpen={showAbout} onClose={() => setShowAbout(false)} />

            {/* Room Info - Dialog Trigger */}
            <Dialog.Trigger asChild>
              <button 
                className="fixed z-[101] bottom-28 sm:bottom-2 left-4 flex items-center gap-4 p-3 rounded-lg 
                          bg-black/0 backdrop-blur-sm hover:bg-black/60 transition-colors
                          focus:outline-none focus:ring-2 focus:ring-white/20"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Current room: ${room.name}`}
              >
                <div className="flex flex-col">
                  <span className="text-white/90 text-sm font-mono">{room.name}</span>
                  <span className="text-white/50 text-xs">{room.category}</span>
                </div>
              </button>
            </Dialog.Trigger>

            {/* Room Selector Dialog */}
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50" />
              <Dialog.Content 
                className="fixed inset-0 z-50 outline-none overflow-y-auto"
                onPointerDownOutside={(e) => e.preventDefault()}
              >
                <div className="min-h-full flex flex-col items-center px-4 py-6 sm:p-8">
                  {/* Close Button */}
                  <Dialog.Close asChild>
                    <button 
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 
                                transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                      aria-label="Close room selection"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Dialog.Close>

                  {/* Dialog Title */}
                  <Dialog.Title className="text-white text-xl font-bold mb-6">
                    Select a Room
                  </Dialog.Title>

                  {/* Room Grid */}
                  <div className="w-full max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {allRooms.map((r) => (
                        <Dialog.Close asChild key={r.id}>
                          <button
                            onClick={() => handleChannelChange(r)}
                            className="relative aspect-video group overflow-hidden rounded-lg 
                                     focus:outline-none focus:ring-2 focus:ring-white/20
                                     active:scale-95 transition-transform"
                            aria-label={`Switch to ${r.name}, Channel ${r.channelNumber}`}
                          >
                            <img
                              src={r.image}
                              alt=""
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent 
                                          flex items-end justify-start p-3
                                          opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <div className="text-left">
                                <h3 className="text-white font-bold text-sm sm:text-base">{r.name}</h3>
                                <span className="text-white/70 text-xs font-mono">CH {r.channelNumber}</span>
                              </div>
                            </div>
                          </button>
                        </Dialog.Close>
                      ))}
                    </div>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>

            {/* Audio Player */}
            {currentVideo && !error && (
              <AudioPlayer room={room} />
            )}
          </div>
        </div>
      </Dialog.Root>
    </Tooltip.Provider>
  );
} 