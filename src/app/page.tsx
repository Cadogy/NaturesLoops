'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [totalActiveUsers, setTotalActiveUsers] = useState(0);

  // Function to get active users count
  const updateActiveUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/active-users');
      if (!response.ok) {
        throw new Error('Failed to fetch active users');
      }
      const data = await response.json();
      setTotalActiveUsers(data.total);
    } catch (error) {
      console.error('Error updating active users:', error);
    }
  }, []);

  // Update active users count periodically
  useEffect(() => {
    // Initial update
    updateActiveUsers();

    // Set up polling interval
    const interval = setInterval(updateActiveUsers, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [updateActiveUsers]);

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
    <div className="relative min-h-[100dvh] bg-gradient-to-b from-gray-900 to-black">
      {/* Background Image */}
      <div className="fixed inset-0">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
          alt="Beautiful nature background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* CRT and Scanline Effects */}
      <div className="fixed inset-0 pointer-events-none bg-crt z-10" />
      <div className="bg-scanlines" />

      {/* Content */}
      <div className="relative z-40 min-h-[100dvh]">
        {/* Hero Section with Mood Matcher */}
        <div className="min-h-[100dvh] flex items-center justify-center py-6 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="backdrop-blur-md border border-white/20 rounded-xl p-6 sm:p-10">
              <div className="max-w-2xl mx-auto">
                <h1 className="font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
                  Nature&apos;s Loops
                </h1>
                <p className="text-white/90 text-sm sm:text-base md:text-lg mb-1 sm:mb-2 max-w-lg mx-auto font-mono">
                  the curated collection of lofi music.
                </p>
                <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-6 max-w-xl mx-auto font-mono">
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
          </div>
        </div>

        {/* Mission Section */}
        <section className="relative py-6 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="backdrop-blur-md border border-white/20 rounded-xl p-6 sm:p-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 font-poppins">Our Musical Mission</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white/90">Curated Experience</h3>
                  <p className="text-white/70 text-sm sm:text-base font-mono">
                    Carefully selected lofi music channels that perfectly blend with nature&apos;s ambiance.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white/90">Mood-Based Discovery</h3>
                  <p className="text-white/70 text-sm sm:text-base font-mono">
                    Our intelligent system matches your current mood with the perfect musical atmosphere.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white/90">Nature&apos;s Harmony</h3>
                  <p className="text-white/70 text-sm sm:text-base font-mono">
                    Each room is inspired by the natural world, creating a unique audio-visual experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-6 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="backdrop-blur-md border border-white/20 rounded-xl p-6 sm:p-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10 font-poppins">Why Nature&apos;s Loops?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    title: "Retro TV Interface",
                    description: "Experience music through our unique retro TV-inspired interface",
                    icon: "📺"
                  },
                  {
                    title: "24/7 Music Streams",
                    description: "Continuous lofi beats curated for every mood and moment",
                    icon: "🎵"
                  },
                  {
                    title: "Nature Themes",
                    description: "Visual environments inspired by the beauty of nature",
                    icon: "🌿"
                  },
                  {
                    title: "Mood Matching",
                    description: "AI-powered mood detection to find your perfect musical match",
                    icon: "🎯"
                  }
                ].map((feature, index) => (
                  <div key={index} className="text-center space-y-4">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white/90">{feature.title}</h3>
                    <p className="text-white/70 text-sm font-mono">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* YouTube Channel Showcase */}
        <section className="relative py-6 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="backdrop-blur-md border border-white/20 rounded-xl p-6 sm:p-10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-6">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-poppins">Join Our Community</h2>
                  <p className="text-white/70 text-sm sm:text-base font-mono leading-relaxed">
                    Subscribe to our YouTube channel for exclusive lofi mixes, nature soundscapes, and behind-the-scenes content.
                    Be part of a growing community of music and nature enthusiasts.
                  </p>
                  <div className="flex gap-4">
                    <a
                      href="https://www.youtube.com/@NaturesLoops/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 
                               text-white rounded-lg transition-colors font-mono text-sm"
                    >
                      <Youtube className="w-5 h-5" />
                      Subscribe
                    </a>
                    <a
                      href="https://instagram.com/NaturesLoops"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                               hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors font-mono text-sm"
                    >
                      <Instagram className="w-5 h-5" />
                      Follow
                    </a>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-white/20">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/videoseries?list=PLqvK6kPwq565pKOIxz1IJe2ua9g_X9P4K"
                      title="Nature's Loops YouTube Channel"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="relative py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="backdrop-blur-md border border-white/20 rounded-xl p-6 sm:p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { 
                    label: "Active Listeners", 
                    value: totalActiveUsers > 0 ? totalActiveUsers.toString() : "0"
                  },
                  { 
                    label: "Available Rooms", 
                    value: rooms.length.toString() 
                  },
                  { 
                    label: "Hours Streamed", 
                    value: "10,000+" 
                  },
                  { 
                    label: "Community Members", 
                    value: "5,000+" 
                  }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-white/70 text-sm font-mono">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
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
        <p className="text-white/40 text-[10px] sm:text-xs md:text-sm font-mono px-2 sm:px-4">
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