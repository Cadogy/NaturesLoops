'use client';

import { useState, useCallback, useEffect } from 'react';
import { Instagram, Maximize2, Minimize2, Home, Info, Youtube } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useYouTubePlayer } from '../contexts/YouTubePlayerContext';
import { Room } from '../utils/roomsData';
import { YouTubeVideo } from '../utils/youtubeService';
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
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
        ERROR: number;
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
  const [lastTap, setLastTap] = useState(0);
  const [lastShake, setLastShake] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const {
    currentVideo,
    handleReady: onPlayerReady,
    handleStateChange: onPlayerStateChange,
    setRoom: setPlayerRoom,
    togglePlay,
    playNext,
  } = useYouTubePlayer();

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle shake detection
  useEffect(() => {
    if (!isMobile) return;

    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;
    const SHAKE_THRESHOLD = 15;
    const SHAKE_TIMEOUT = 1000; // ms between shakes

    const handleShake = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration || !acceleration.x || !acceleration.y || !acceleration.z) return;

      if (lastX === null) {
        lastX = acceleration.x;
        lastY = acceleration.y;
        lastZ = acceleration.z;
        return;
      }

      const deltaX = Math.abs(acceleration.x - lastX);
      const deltaY = Math.abs(acceleration.y - (lastY ?? 0));
      const deltaZ = Math.abs(acceleration.z - (lastZ ?? 0));

      if ((deltaX > SHAKE_THRESHOLD && deltaY > SHAKE_THRESHOLD) || 
          (deltaX > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD) || 
          (deltaY > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD)) {
        const now = Date.now();
        if (now - lastShake > SHAKE_TIMEOUT) {
          playNext();
          setLastShake(now);
        }
      }

      lastX = acceleration.x;
      lastY = acceleration.y;
      lastZ = acceleration.z;
    };

    window.addEventListener('devicemotion', handleShake);
    return () => window.removeEventListener('devicemotion', handleShake);
  }, [isMobile, playNext, lastShake]);

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

  // Ensure video plays on page load/refresh and handle errors
  const handlePlayerReady = useCallback((event: YouTubeEvent) => {
    try {
      // Force playback to start
      event.target.playVideo();
      
      // Check if video is actually playable
      const playerState = (event.target.getPlayerState() as unknown) as number;
      if (playerState === -1) { // UNSTARTED = -1
        setTimeout(() => {
          const newState = (event.target.getPlayerState() as unknown) as number;
          if (newState === -1) { // Still UNSTARTED
            // Video still unstarted after delay, likely unavailable
            console.warn('Video appears to be unavailable, skipping to next track');
            playNext();
            return;
          }
        }, 2000); // Give it 2 seconds to start
      }
      
      onPlayerReady(event);
    } catch (error) {
      console.error('Error during player ready:', error);
      playNext();
    }
  }, [onPlayerReady, playNext]);

  const handlePlayerStateChange = useCallback((event: YouTubeEvent) => {
    // If video ends or is unstarted, try to play it
    if (event.data === window.YT?.PlayerState?.ENDED || 
        event.data === window.YT?.PlayerState?.UNSTARTED) {
      event.target.playVideo();
    }
    // Handle video errors (unavailable, deleted, etc.)
    else if (event.data === window.YT?.PlayerState?.ERROR) {
      console.warn('Video unavailable or error occurred, skipping to next track');
      playNext();
    }
    onPlayerStateChange(event);
  }, [onPlayerStateChange, playNext]);

  // Handle double tap for mobile play/pause and room switching
  const handleDoubleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // ms
    const target = e.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const edgeThreshold = rect.width * 0.2; // 20% of width for edge detection
    
    if (lastTap && (now - lastTap) < DOUBLE_TAP_DELAY) {
      if (x < edgeThreshold) {
        // Double tap on left edge
        const currentIndex = allRooms.findIndex(r => r.id === room.id);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : allRooms.length - 1;
        handleChannelChange(allRooms[prevIndex]);
      } else if (x > rect.width - edgeThreshold) {
        // Double tap on right edge
        const currentIndex = allRooms.findIndex(r => r.id === room.id);
        const nextIndex = currentIndex < allRooms.length - 1 ? currentIndex + 1 : 0;
        handleChannelChange(allRooms[nextIndex]);
      } else {
        // Double tap in center
        togglePlay();
      }
      setLastTap(0);
    } else {
      setLastTap(now);
    }
  };

  const handleChannelChange = useCallback(async (newRoom: Room) => {
    if (newRoom.id === room.id) return;
    onChannelChange(newRoom);
  }, [room.id, onChannelChange]);

  return (
    <Tooltip.Provider delayDuration={300}>
      <Dialog.Root>
        <div className="fixed inset-0 bg-black">
          {/* Main TV Screen */}
          <div className="absolute inset-0">
            {/* CRT and Scanline Effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 animate-scanline z-30" />
              <div className="bg-scanlines" />
            </div>

            {/* YouTube Player Container */}
            <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
              {currentVideo && (
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
                  {/* Overlay to prevent YouTube UI from showing and handle double tap */}
                  <div 
                    className="absolute inset-0 z-10 bg-black/10" 
                    onContextMenu={(e) => e.preventDefault()}
                    onClick={handleDoubleTap}
                  />
                </div>
              )}
            </div>

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
                className="fixed z-[101] bottom-[10rem] sm:bottom-4 left-4 flex items-center gap-4 p-3 rounded-lg 
                          bg-black/0 backdrop-blur-sm hover:bg-black/60 transition-colors
                          focus:outline-none focus:ring-0 focus:ring-white/20"
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
            {currentVideo && (
              <AudioPlayer room={room} />
            )}
          </div>
        </div>
      </Dialog.Root>
    </Tooltip.Provider>
  );
} 