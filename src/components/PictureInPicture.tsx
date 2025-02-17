'use client'

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, Maximize2, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useYouTubePlayer } from '../contexts/YouTubePlayerContext';
import YouTube from 'react-youtube';

const SNAP_THRESHOLD = 50; // Distance in pixels from edge to trigger snap
const EDGE_MARGIN = 20; // Margin from the edge of the screen

export function PictureInPicture() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const {
    currentRoom,
    currentVideo,
    playerState,
    handleReady,
    handleStateChange,
    togglePlay,
    toggleMute,
  } = useYouTubePlayer();

  // Function to calculate snapped position
  const getSnappedPosition = (x: number, y: number) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const pipWidth = 320;
    const pipHeight = 180;

    // Calculate distances to edges
    const distanceToLeft = x;
    const distanceToRight = windowWidth - (x + pipWidth);
    const distanceToTop = y;
    const distanceToBottom = windowHeight - (y + pipHeight);

    let snappedX = x;
    let snappedY = y;

    // Snap horizontally
    if (distanceToLeft < SNAP_THRESHOLD) {
      snappedX = EDGE_MARGIN;
    } else if (distanceToRight < SNAP_THRESHOLD) {
      snappedX = windowWidth - pipWidth - EDGE_MARGIN;
    }

    // Snap vertically
    if (distanceToTop < SNAP_THRESHOLD) {
      snappedY = EDGE_MARGIN;
    } else if (distanceToBottom < SNAP_THRESHOLD) {
      snappedY = windowHeight - pipHeight - EDGE_MARGIN;
    }

    return { x: snappedX, y: snappedY };
  };

  // Initialize position and check mobile on mount
  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Set initial position based on screen size
      if (mobile) {
        setPosition({
          x: 0,
          y: window.innerHeight - 150,
        });
      } else {
        // Start at bottom right for desktop
        setPosition({
          x: window.innerWidth - 320 - EDGE_MARGIN,
          y: window.innerHeight - 180 - EDGE_MARGIN,
        });
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show PIP when we have a current room/video and we're not on a room page
  const shouldShowPip = isMounted && currentRoom && currentVideo && !pathname.startsWith('/room/');

  // Handle window resize to keep PIP in bounds
  useEffect(() => {
    const handleResize = () => {
      const width = isMobile ? window.innerWidth : 320;
      const height = isMobile ? 150 : 180;
      setPosition(pos => {
        const newPos = {
          x: Math.min(pos.x, window.innerWidth - width - EDGE_MARGIN),
          y: Math.min(pos.y, window.innerHeight - height - EDGE_MARGIN),
        };
        return getSnappedPosition(newPos.x, newPos.y);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Navigate to room
  const handleMaximize = () => {
    if (currentRoom) {
      window.location.href = `/room/${currentRoom.id}`;
    }
  };

  if (!shouldShowPip) return null;

  const pipWidth = isMobile ? '100vw' : '320px';
  const pipHeight = isMobile ? '150px' : 'auto';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="pip-player"
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 100 }}
        transition={{ duration: 0.2 }}
        drag={!isMobile}
        dragMomentum={false}
        dragConstraints={{
          left: EDGE_MARGIN,
          right: window.innerWidth - 320 - EDGE_MARGIN,
          top: EDGE_MARGIN,
          bottom: window.innerHeight - 180 - EDGE_MARGIN,
        }}
        dragElastic={0.1} // Slight elasticity for better feel
        style={{
          position: 'fixed',
          x: isMobile ? 0 : position.x,
          y: position.y,
          width: pipWidth,
          height: pipHeight,
          zIndex: 9999,
        }}
        onDragEnd={(_, info) => {
          if (!isMobile) {
            const snappedPosition = getSnappedPosition(info.point.x, info.point.y);
            setPosition(snappedPosition);
          }
        }}
        className={`bg-black shadow-2xl overflow-hidden ${
          isMobile ? 'left-0 right-0 bottom-0 rounded-t-lg' : 'rounded-lg'
        }`}
      >
        {/* Video Container */}
        <div className={`relative w-full ${isMobile ? 'h-full' : 'pt-[56.25%]'}`}>
          <div className="absolute inset-0">
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
              onReady={handleReady}
              onStateChange={handleStateChange}
              className="w-full h-full"
              iframeClassName="w-full h-full pointer-events-none"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-2 bg-black/90">
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
            >
              {playerState.isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={toggleMute}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label={playerState.isMuted ? 'Unmute' : 'Mute'}
            >
              {playerState.isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
            <div className="text-white text-xs truncate max-w-[120px]">
              {currentRoom.name}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handleMaximize}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Maximize"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 