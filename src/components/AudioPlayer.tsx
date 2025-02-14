'use client';

import { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import type { Room } from '../utils/roomsData';
import { useYouTubePlayer } from '../contexts/YouTubePlayerContext';

interface AudioPlayerProps {
  room: Room;
}

export default function AudioPlayer({ room }: AudioPlayerProps) {
  const [progress, setProgress] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  const {
    playerState,
    currentVideo,
    togglePlay,
    toggleMute,
    setVolume,
    seekTo,
    playNext,
    playPrevious,
  } = useYouTubePlayer();

  // Update progress based on current time
  useEffect(() => {
    const progress = playerState.duration > 0 
      ? (playerState.currentTime / playerState.duration) * 100 
      : 0;
    setProgress(isNaN(progress) ? 0 : progress);
  }, [playerState.currentTime, playerState.duration]);

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const time = (percentage / 100) * playerState.duration;
    seekTo(time);
  };

  // Handle volume bar click
  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setVolume(percentage);
  };

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 
        bg-gradient-to-t from-black via-black/90 to-transparent 
        pt-16 pb-4 px-4 
        z-[90]
      `}
    >
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar */}
        <div 
          className="relative w-full h-1 bg-white/10 rounded-full mb-4 cursor-pointer group"
          onClick={handleProgressClick}
          ref={progressBarRef}
        >
          <div 
            className="absolute inset-y-0 left-0 bg-white/30 rounded-full 
                     group-hover:bg-white/40 transition-colors"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Room Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold truncate">
              {currentVideo?.title || room.name}
            </h2>
            <p className="text-white/60 text-sm truncate">{room.category}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            {/* Previous Track */}
            <button
              onClick={playPrevious}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-white/80 transition-colors"
              aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
            >
              {playerState.isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={playNext}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-white/60 hover:text-white transition-colors"
                aria-label={playerState.isMuted ? 'Unmute' : 'Mute'}
              >
                {playerState.isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <div 
                className="relative w-24 h-1 bg-white/10 rounded-full cursor-pointer"
                onClick={handleVolumeClick}
                ref={volumeBarRef}
              >
                <div 
                  className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
                  style={{ width: `${playerState.isMuted ? 0 : playerState.volume}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
