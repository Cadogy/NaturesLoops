import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import type { YouTubePlayer, YouTubeEvent } from 'react-youtube';
import type { YouTubeVideo } from '../utils/youtubeService';
import type { Room } from '../utils/roomsData';

interface PlayerState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isReady: boolean;
}

interface YouTubePlayerContextType {
  player: YouTubePlayer | null;
  isReady: boolean;
  currentRoom: Room | null;
  currentVideo: YouTubeVideo | null;
  playerState: PlayerState;
  playlist: YouTubeVideo[];
  currentIndex: number;
  setRoom: (room: Room, videos: YouTubeVideo[]) => void;
  handleReady: (event: YouTubeEvent) => void;
  handleStateChange: (event: YouTubeEvent) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
}

const YouTubePlayerContext = createContext<YouTubePlayerContextType | null>(null);

const STORAGE_KEYS = {
  VOLUME: 'youtube-volume',
  MUTED: 'youtube-muted',
} as const;

const DEFAULT_VOLUME = 50;

export function YouTubePlayerProvider({ children }: { children: React.ReactNode }) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [playlist, setPlaylist] = useState<YouTubeVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    volume: Number(localStorage.getItem(STORAGE_KEYS.VOLUME)) || DEFAULT_VOLUME,
    isMuted: localStorage.getItem(STORAGE_KEYS.MUTED) === 'true',
    currentTime: 0,
    duration: 0,
    isReady: false,
  });

  // Update current time
  useEffect(() => {
    if (!isReady || !playerRef.current) return;

    const interval = setInterval(async () => {
      try {
        const currentTime = await playerRef.current?.getCurrentTime();
        const duration = await playerRef.current?.getDuration();
        setPlayerState(state => ({
          ...state,
          currentTime: currentTime || 0,
          duration: duration || 0,
        }));
      } catch (error) {
        console.error('Failed to update time:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isReady]);

  const handleReady = useCallback((event: YouTubeEvent) => {
    const player = event.target;
    playerRef.current = player;

    // Initialize player state
    player.setVolume(playerState.volume);
    if (playerState.isMuted) {
      player.mute();
    } else {
      player.unMute();
    }

    // Set highest quality available
    player.setPlaybackQuality('hd1080');

    setIsReady(true);
    setPlayerState(state => ({ ...state, isReady: true }));

    // Start playback immediately
    player.playVideo();
    setPlayerState(state => ({ ...state, isPlaying: true }));
  }, [playerState.volume, playerState.isMuted]);

  const handleStateChange = useCallback((event: YouTubeEvent) => {
    const player = event.target;
    const state = event.data;
    
    // Always try to set highest quality when video changes
    player.setPlaybackQuality('hd1080');
    
    switch (state) {
      case -1: // unstarted
        player.setPlaybackQuality('hd1080');
        player.playVideo(); // Try to start playback
        break;
      case 0: // ended
        if (playlist.length > 0) {
          const nextIndex = (currentIndex + 1) % playlist.length;
          player.loadVideoById(playlist[nextIndex].id);
          setCurrentIndex(nextIndex);
          player.setPlaybackQuality('hd1080');
        }
        break;
      case 1: // playing
        setPlayerState(state => ({ ...state, isPlaying: true }));
        break;
      case 2: // paused
        setPlayerState(state => ({ ...state, isPlaying: false }));
        break;
      case 3: // buffering
        player.setPlaybackQuality('hd1080');
        break;
      case 5: // video cued
        player.playVideo(); // Start playing when video is cued
        break;
    }
  }, [playlist, currentIndex, setCurrentIndex]);

  const play = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.playVideo();
  }, [isReady]);

  const pause = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.pauseVideo();
  }, [isReady]);

  const togglePlay = useCallback(() => {
    if (playerState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [playerState.isPlaying, play, pause]);

  const setVolume = useCallback((volume: number) => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.setVolume(volume);
    localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
    setPlayerState(state => ({ ...state, volume }));
  }, [isReady]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    
    if (playerState.isMuted) {
      playerRef.current.unMute();
      localStorage.setItem(STORAGE_KEYS.MUTED, 'false');
    } else {
      playerRef.current.mute();
      localStorage.setItem(STORAGE_KEYS.MUTED, 'true');
    }
    
    setPlayerState(state => ({ ...state, isMuted: !state.isMuted }));
  }, [isReady, playerState.isMuted]);

  const seekTo = useCallback((time: number) => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.seekTo(time, true);
  }, [isReady]);

  const playNext = useCallback(() => {
    if (!playerRef.current || !isReady || !playlist.length) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    playerRef.current.loadVideoById(playlist[nextIndex].id);
  }, [isReady, playlist, currentIndex]);

  const playPrevious = useCallback(() => {
    if (!playerRef.current || !isReady || !playlist.length) return;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    setCurrentIndex(prevIndex);
    playerRef.current.loadVideoById(playlist[prevIndex].id);
  }, [isReady, playlist, currentIndex]);

  const setRoom = useCallback((room: Room, videos: YouTubeVideo[]) => {
    setCurrentRoom(room);
    setPlaylist(videos);
    setCurrentIndex(0);
    setPlayerState(state => ({
      ...state,
      currentTime: 0,
      duration: 0,
    }));
  }, []);

  const currentVideo = playlist[currentIndex] ?? null;

  const value = {
    player: playerRef.current,
    isReady,
    currentRoom,
    currentVideo,
    playerState,
    playlist,
    currentIndex,
    setRoom,
    handleReady,
    handleStateChange,
    play,
    pause,
    togglePlay,
    setVolume,
    toggleMute,
    seekTo,
    playNext,
    playPrevious,
  };

  return (
    <YouTubePlayerContext.Provider value={value}>
      {children}
    </YouTubePlayerContext.Provider>
  );
}

export function useYouTubePlayer() {
  const context = useContext(YouTubePlayerContext);
  if (!context) {
    throw new Error('useYouTubePlayer must be used within a YouTubePlayerProvider');
  }
  return context;
} 