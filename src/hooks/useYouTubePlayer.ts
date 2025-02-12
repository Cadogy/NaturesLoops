import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { YouTubeVideo } from '../utils/youtubeService';

export interface PlayerState {
  isReady: boolean;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  currentVideoIndex: number;
  playlistId: string;
}

interface UseYouTubePlayerOptions {
  playlistId: string;
  videos: YouTubeVideo[];
  onError?: (error: Error) => void;
}

const PLAYER_STATES = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

export function useYouTubePlayer({ playlistId, videos, onError }: UseYouTubePlayerOptions) {
  const queryClient = useQueryClient();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [playerState, setPlayerState] = useState<PlayerState>(() => {
    const savedState = localStorage.getItem(`playerState-${playlistId}`);
    return savedState ? JSON.parse(savedState) : {
      isReady: false,
      isPlaying: false,
      volume: 50,
      isMuted: false,
      currentTime: 0,
      duration: 0,
      currentVideoIndex: 0,
      playlistId,
    };
  });

  // Reset state when playlist changes
  useEffect(() => {
    setPlayerState(current => {
      if (current.playlistId === playlistId) return current;
      
      const savedState = localStorage.getItem(`playerState-${playlistId}`);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return { ...parsed, isReady: false };
      }

      return {
        isReady: false,
        isPlaying: false,
        volume: 50,
        isMuted: false,
        currentTime: 0,
        duration: 0,
        currentVideoIndex: 0,
        playlistId,
      };
    });
    setIsReady(false);
  }, [playlistId]);

  // Safe player operation wrapper
  const executePlayerOperation = useCallback(async <T,>(
    operation: (player: YouTubePlayer) => Promise<T> | T,
    errorMessage: string
  ): Promise<T | void> => {
    const player = playerRef.current;
    if (!player || !isReady) {
      console.warn('Player not ready for operation:', errorMessage);
      return;
    }

    try {
      return await operation(player);
    } catch (error) {
      console.error(errorMessage, error);
      onError?.(error as Error);
    }
  }, [isReady, onError]);

  // Save state to storage
  const saveState = useCallback((newState: Partial<PlayerState>) => {
    setPlayerState(current => {
      const updated = { ...current, ...newState };
      localStorage.setItem(`playerState-${playlistId}`, JSON.stringify(updated));
      queryClient.setQueryData(['playerState', playlistId], updated);
      return updated;
    });
  }, [playlistId, queryClient]);

  // Handle player ready
  const handleReady = useCallback((event: YouTubeEvent) => {
    const player = event.target;
    playerRef.current = player;

    executePlayerOperation(async (p) => {
      try {
        // Get video duration
        const duration = await p.getDuration();
        
        // Initialize volume
        await p.setVolume(playerState.volume);
        
        // Set mute state
        if (playerState.isMuted) {
          await p.mute();
        } else {
          await p.unMute();
        }

        // Set time position if it's the same playlist
        if (playerState.playlistId === playlistId && playerState.currentTime > 0) {
          await p.seekTo(playerState.currentTime, true);
        }

        setIsReady(true);
        saveState({ isReady: true, duration });

        // Start playback if needed
        if (playerState.isPlaying) {
          await p.playVideo();
        } else {
          await p.pauseVideo();
        }
      } catch (error) {
        console.error('Failed to initialize player:', error);
        onError?.(error as Error);
      }
    }, 'Failed to initialize player');
  }, [executePlayerOperation, playerState.volume, playerState.isMuted, playerState.playlistId, playerState.currentTime, playerState.isPlaying, playlistId, saveState, onError]);

  // Handle state changes
  const handleStateChange = useCallback((event: YouTubeEvent) => {
    const state = event.data;
    
    executePlayerOperation(async (player) => {
      if (state === PLAYER_STATES.ENDED) {
        if (videos.length > 0) {
          const nextIndex = (playerState.currentVideoIndex + 1) % videos.length;
          await player.loadVideoById(videos[nextIndex].id);
          saveState({ currentVideoIndex: nextIndex, currentTime: 0 });
        }
      } else if (state === PLAYER_STATES.PLAYING) {
        saveState({ isPlaying: true });
      } else if (state === PLAYER_STATES.PAUSED || state === PLAYER_STATES.UNSTARTED) {
        saveState({ isPlaying: false });
      }
    }, 'Failed to handle state change');
  }, [videos, playerState.currentVideoIndex, executePlayerOperation, saveState]);

  // Save current time periodically
  useEffect(() => {
    if (!isReady) return;

    const saveInterval = setInterval(() => {
      executePlayerOperation(async (player) => {
        const currentTime = await player.getCurrentTime();
        if (typeof currentTime === 'number') {
          saveState({ currentTime });
        }
      }, 'Failed to save current time');
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [isReady, executePlayerOperation, saveState]);

  // Player controls
  const controls = {
    play: () => executePlayerOperation(async (player) => {
      const currentState = await player.getPlayerState();
      if (currentState !== PLAYER_STATES.PLAYING) {
        await player.playVideo();
        saveState({ isPlaying: true });
      }
    }, 'Failed to play video'),

    pause: () => executePlayerOperation(async (player) => {
      const currentState = await player.getPlayerState();
      if (currentState === PLAYER_STATES.PLAYING) {
        await player.pauseVideo();
        saveState({ isPlaying: false });
      }
    }, 'Failed to pause video'),

    setVolume: (volume: number) => executePlayerOperation(async (player) => {
      await player.setVolume(volume);
      saveState({ volume });
    }, 'Failed to set volume'),

    mute: () => executePlayerOperation(async (player) => {
      await player.mute();
      saveState({ isMuted: true });
    }, 'Failed to mute'),

    unmute: () => executePlayerOperation(async (player) => {
      await player.unMute();
      saveState({ isMuted: false });
    }, 'Failed to unmute'),

    seekTo: (time: number) => executePlayerOperation(async (player) => {
      await player.seekTo(time, true);
      saveState({ currentTime: time });
    }, 'Failed to seek'),

    playVideoAt: (index: number) => {
      if (index < 0 || index >= videos.length) return;
      
      executePlayerOperation(async (player) => {
        await player.loadVideoById(videos[index].id);
        saveState({ currentVideoIndex: index, currentTime: 0 });
      }, 'Failed to play video at index');
    },
  };

  return {
    playerState,
    isReady,
    handleReady,
    handleStateChange,
    controls,
  };
} 