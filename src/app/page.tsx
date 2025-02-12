'use client';

import { useState, useEffect } from 'react';
import { getRooms, initializeRooms } from '../utils/roomsData';
import { useRouter } from 'next/navigation';
import { Instagram, Loader2, Info } from 'lucide-react';
import { AboutDialog } from '../components/AboutDialog';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Awaited<ReturnType<typeof getRooms>>>([]);
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Initialize rooms from YouTube playlists
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const initializedRooms = await initializeRooms();
        if (initializedRooms.length === 0) {
          throw new Error('No rooms available');
        }
        setRooms(initializedRooms);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading rooms:', error);
        setError(error instanceof Error ? error.message : 'Failed to load rooms');
        setIsLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleTeleport = async () => {
    try {
      setIsTeleporting(true);
      if (rooms.length === 0) {
        throw new Error('No rooms available for teleport');
      }
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
      if (!randomRoom) {
        throw new Error('Failed to select a random room');
      }
      router.push(`/room/${randomRoom.id}`);
    } catch (error) {
      console.error('Teleport error:', error);
      setError(error instanceof Error ? error.message : 'Failed to teleport to a random room');
      setIsTeleporting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
          alt="Beautiful nature background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* CRT and Scanline Effects */}
      <div className="absolute inset-0 pointer-events-none bg-crt z-30" />
      <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-50 z-30" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 animate-scanline z-30" />
      </div>

      {/* Content */}
      <div className="relative z-40 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Logo */}
        <div className="text-center">
          <h1 className="font-poppins text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Nature&apos;s Loops
          </h1>
          <p className="text-white/90 text-lg sm:text-xl mb-4 max-w-lg mx-auto font-mono">
            Welcome to a curated collection of lofi music.
          </p>
          <p className="text-white/70 text-sm sm:text-base mb-12 max-w-lg mx-auto font-mono">
            Each room offers a unique atmosphere for studying, working, or relaxing.
            Press the button below to start your journey.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-8 text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Teleport Button */}
          <button
            onClick={handleTeleport}
            disabled={isLoading || isTeleporting}
            className="group relative px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-mono rounded-lg 
                     border border-white/20 transition-all duration-300 
                     hover:scale-105 disabled:opacity-50 disabled:hover:scale-100
                     overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading Channels...
                </>
              ) : isTeleporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing Room...
                </>
              ) : (
                'TELEPORT TO RANDOM ROOM'
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 
                          transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>

          {/* Room Count */}
          {!isLoading && (
            <div className="mt-8 text-white/60 font-mono text-sm">
              {rooms.length} rooms available
            </div>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="absolute top-4 right-4 flex items-center gap-4 text-white/60 z-50">
        <a 
          href="https://instagram.com/@NaturesLoops" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-white transition-colors p-2"
        >
          <Instagram className="w-5 h-5" />
        </a>
        <button
          onClick={() => setShowAbout(true)}
          className="hover:text-white transition-colors p-2"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* About Dialog */}
      <AboutDialog isOpen={showAbout} onClose={() => setShowAbout(false)} />

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-50">
        <p className="text-white/40 text-sm font-mono">
          Press ESC to exit fullscreen • Space to play/pause • M to mute
        </p>
      </div>
    </div>
  );
}
