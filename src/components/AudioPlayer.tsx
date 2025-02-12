'use client';

import { useEffect, useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { Volume2, VolumeX, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import type { Room } from '../utils/roomsData';
import { useYouTubePlayer } from '../contexts/YouTubePlayerContext';
import { formatTime } from '../utils/formatTime';

interface AudioPlayerProps {
  room: Room;
}

export default function AudioPlayer({ room }: AudioPlayerProps) {
  const [progress, setProgress] = useState(0);
  const {
    isReady,
    currentVideo,
    playerState,
    togglePlay,
    setVolume,
    toggleMute,
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

  return (
    <div className="fixed z-[100] bottom-0 left-0 right-0 bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border-t border-gray-200/0 dark:border-gray-800/0 p-2 sm:p-4">
      <div className="container mx-auto">
        {/* Mobile Layout (stacked) */}
        <div className="block sm:hidden">
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{formatTime(playerState.currentTime)}</span>
              <span>{formatTime(playerState.duration)}</span>
            </div>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[progress]}
              onValueChange={(newValue) => {
                if (!isReady) return;
                const time = (newValue[0] / 100) * playerState.duration;
                seekTo(time);
                setProgress(newValue[0]);
              }}
              max={100}
              step={0.1}
              aria-label="Progress"
              disabled={!isReady}
            >
              <Slider.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-1">
                <Slider.Range className="absolute bg-primary rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-3 h-3 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                aria-label="Progress"
              />
            </Slider.Root>
          </div>

          {/* Controls and Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={playPrevious}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Previous track"
                disabled={!isReady}
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
                disabled={!isReady}
              >
                {playerState.isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Next track"
                disabled={!isReady}
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 mx-4 truncate">
              <div className="text-sm font-medium truncate">{currentVideo?.title || room.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{room.category}</div>
            </div>

            <div className="flex items-center">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={playerState.isMuted ? 'Unmute' : 'Mute'}
                disabled={!isReady}
              >
                {playerState.isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout (horizontal) */}
        <div className="hidden sm:flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={playPrevious}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Previous track"
                disabled={!isReady}
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
                disabled={!isReady}
              >
                {playerState.isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Next track"
                disabled={!isReady}
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col">
              <span className="font-medium truncate max-w-[200px] lg:max-w-[300px]">{currentVideo?.title || room.name}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{room.category}</span>
            </div>
          </div>

          <div className="flex-1 mx-8">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{formatTime(playerState.currentTime)}</span>
              <span>{formatTime(playerState.duration)}</span>
            </div>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[progress]}
              onValueChange={(newValue) => {
                if (!isReady) return;
                const time = (newValue[0] / 100) * playerState.duration;
                seekTo(time);
                setProgress(newValue[0]);
              }}
              max={100}
              step={0.1}
              aria-label="Progress"
              disabled={!isReady}
            >
              <Slider.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-1">
                <Slider.Range className="absolute bg-primary rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-3 h-3 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                aria-label="Progress"
              />
            </Slider.Root>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={playerState.isMuted ? 'Unmute' : 'Mute'}
              disabled={!isReady}
            >
              {playerState.isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            
            <div className="w-24">
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[playerState.isMuted ? 0 : playerState.volume]}
                onValueChange={(newValue) => {
                  const volume = newValue[0];
                  setVolume(volume);
                  if (volume === 0) {
                    toggleMute();
                  } else if (playerState.isMuted) {
                    toggleMute();
                  }
                }}
                max={100}
                step={1}
                aria-label="Volume"
                disabled={!isReady}
              >
                <Slider.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-1">
                  <Slider.Range className="absolute bg-primary rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-3 h-3 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                  aria-label="Volume"
                />
              </Slider.Root>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
