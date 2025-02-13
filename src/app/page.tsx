'use client';

import { useState, useEffect } from 'react';
import { getRooms, initializeRooms } from '../utils/roomsData';
import { useRouter } from 'next/navigation';
import { Instagram, Loader2, Info, Youtube, Search } from 'lucide-react';
import { AboutDialog } from '../components/AboutDialog';
import { motion } from 'framer-motion';
import { matchMoodToRoom } from '../utils/moodMatcher';

// Expanded suggestion pools - we'll randomly select from these on each load
const suggestionPools = {
  feelings: [
    'relaxed', 'focused', 'energetic', 'peaceful', 'cozy',
    'motivated', 'calm', 'tranquil', 'inspired', 'creative',
    'happy', 'serene', 'balanced', 'mindful', 'zen',
    'productive', 'cheerful', 'mellow', 'content', 'harmonious'
  ] as string[],
  activities: [
    'studying', 'coding', 'reading', 'meditating',
    'writing', 'working', 'brainstorming', 'designing',
    'learning', 'researching', 'creating', 'planning',
    'journaling', 'drawing', 'thinking', 'developing'
  ] as string[],
  weather: [
    'rainy day', 'snowy evening', 'sunny morning',
    'foggy afternoon', 'stormy night', 'misty dawn',
    'winter vibes', 'autumn breeze', 'spring morning',
    'cozy winter', 'gentle rain', 'thunder outside'
  ] as string[],
  situations: [
    'drinking tea', 'late night work', 'morning coffee',
    'by the fireplace', 'watching rain', 'early sunrise',
    'sunset vibes', 'midnight focus', 'weekend study',
    'coffee shop work', 'library session', 'home office'
  ] as string[]
};

// Function to get random items from an array
function getRandomItems(array: string[], count: number): string[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Component for suggestion pills
function SuggestionPill({ 
  suggestion, 
  isSelected, 
  onClick 
}: { 
  suggestion: string; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-sm font-mono transition-all
        transform hover:scale-105 active:scale-95
        ${isSelected 
          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
          : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
        }
      `}
    >
      {suggestion}
    </button>
  );
}

// Adjust the number of suggestions based on screen size
function getResponsiveSuggestionCount(category: string, isMobile: boolean): number {
  if (isMobile) {
    switch (category) {
      case 'feelings': return 4;
      case 'activities': return 3;
      case 'weather': return 2;
      case 'situations': return 2;
      default: return 2;
    }
  }
  return {
    feelings: 6,
    activities: 5,
    weather: 4,
    situations: 4
  }[category] || 4;
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Awaited<ReturnType<typeof getRooms>>>([]);
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [moodInputValue, setMoodInputValue] = useState('');
  const [searchingMessage, setSearchingMessage] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [isMobile, setIsMobile] = useState(false);

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

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize suggestions with responsive counts
  useEffect(() => {
    const initialSuggestions = {
      feelings: getRandomItems(suggestionPools.feelings, getResponsiveSuggestionCount('feelings', isMobile)),
      activities: getRandomItems(suggestionPools.activities, getResponsiveSuggestionCount('activities', isMobile)),
      weather: getRandomItems(suggestionPools.weather, getResponsiveSuggestionCount('weather', isMobile)),
      situations: getRandomItems(suggestionPools.situations, getResponsiveSuggestionCount('situations', isMobile))
    };
    setSuggestions(initialSuggestions);
  }, [isMobile]);

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moodInputValue.trim()) return;

    try {
      setIsTeleporting(true);
      setSearchingMessage('Reading your mood...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (rooms.length === 0) {
        throw new Error('No rooms available for teleport');
      }

      // Try to match the mood to a room
      setSearchingMessage('Finding the perfect room for you...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const matchedRoom = await matchMoodToRoom(moodInputValue, rooms);
      
      if (matchedRoom) {
        setSearchingMessage(`Perfect match! Taking you to ${matchedRoom.name}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push(`/room/${matchedRoom.id}`);
      } else {
        setSearchingMessage('Choosing a special room for you...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
        if (!randomRoom) {
          throw new Error('Failed to select a random room');
        }
        router.push(`/room/${randomRoom.id}`);
      }
    } catch (error) {
      console.error('Teleport error:', error);
      setError(error instanceof Error ? error.message : 'Failed to teleport to a random room');
      setIsTeleporting(false);
      setSearchingMessage('');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden">
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
        {/* Logo and Content Container */}
        <div className="text-center p-6 sm:p-10 backdrop-blur-md border border-white/20 rounded-xl w-full max-w-lg mx-auto">
          <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Nature&apos;s Loops
          </h1>
          <p className="text-white/90 text-base sm:text-lg mb-2 sm:mb-4 max-w-lg mx-auto font-mono">
            the curated collection of lofi music.
          </p>
          <p className="text-white/70 text-xs sm:text-sm mb-6 sm:mb-8 max-w-xl mx-auto font-mono">
            Each room offers a unique atmosphere for studying, working, or relaxing.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 text-red-500 bg-red-500/10 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Mood Input Section */}
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleMoodSubmit}
            className="w-full max-w-md mx-auto space-y-4 sm:space-y-6"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center space-y-1 sm:space-y-2"
            >
              <motion.h2 
                className="text-xl sm:text-2xl font-bold text-white"
              >
                How are you feeling?
              </motion.h2>
              <motion.p 
                className="text-white/70 text-sm"
              >
                Describe your mood and we&apos;ll find the perfect room
              </motion.p>
            </motion.div>

            <div className="space-y-4">
              {/* Input with inline button */}
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={moodInputValue}
                    onChange={(e) => {
                      setMoodInputValue(e.target.value);
                      setSelectedSuggestion(null);
                    }}
                    placeholder={isMobile ? "How are you feeling?" : "e.g., relaxed, energetic, peaceful..."}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/20 rounded-lg 
                             text-white placeholder-white/50 focus:outline-none focus:ring-2 
                             focus:ring-primary transition-all text-sm sm:text-base"
                    disabled={isTeleporting}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isTeleporting}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary/80 
                           text-white rounded-lg transition-colors font-mono text-sm sm:text-base
                           disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                >
                  {isTeleporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-6 h-6" />
                    </>
                  )}
                </button>
              </div>

              {/* Mood suggestions */}
              {!isTeleporting && !searchingMessage && (
                <div className="space-y-3">
                  {Object.entries(suggestions).map(([category, items]) => (
                    <div key={category} className="space-y-1.5">
                      <h3 className="text-white/50 text-xs font-mono uppercase tracking-wider pl-1">
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {items.map((suggestion) => (
                          <SuggestionPill
                            key={suggestion}
                            suggestion={suggestion}
                            isSelected={selectedSuggestion === suggestion}
                            onClick={() => {
                              setMoodInputValue(suggestion);
                              setSelectedSuggestion(suggestion);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {searchingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-white/90 font-mono text-sm"
              >
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                {searchingMessage}
              </motion.div>
            )}
          </motion.form>

          {/* Room Count */}
          {!isLoading && (
            <div className="mt-4 sm:mt-6 text-white/60 font-mono text-xs sm:text-sm">
              {rooms.length} rooms available
            </div>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center gap-2 sm:gap-4 text-white/60 z-50">
        <a 
          href="https://instagram.com/@NaturesLoops" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-white transition-colors p-1.5 sm:p-2"
        >
          <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
        </a>
        <a 
          href="https://www.youtube.com/@NaturesLoops/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-white transition-colors p-1.5 sm:p-2"
        >
          <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
        </a>
        <button
          onClick={() => setShowAbout(true)}
          className="hover:text-white transition-colors p-1.5 sm:p-2"
        >
          <Info className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* About Dialog */}
      <AboutDialog isOpen={showAbout} onClose={() => setShowAbout(false)} />

      {/* Footer */}
      <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 text-center z-50">
        <p className="text-white/40 text-xs sm:text-sm font-mono px-4">
          {isMobile ? (
            "Tap screen edges to exit • Space to play/pause"
          ) : (
            "Press ESC to exit fullscreen • Space to play/pause • M to mute"
          )}
        </p>
      </div>
    </div>
  );
}
