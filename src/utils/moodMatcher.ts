import { Room } from './roomsData';

// Define comprehensive mood and context categories
const moodContexts = {
  chill: {
    primary: ['relaxed', 'calm', 'peaceful', 'mellow', 'zen', 'tranquil', 'laid-back', 'easy-going'],
    related: ['comfortable', 'content', 'cozy', 'restful', 'casual', 'light', 'steady', 'balanced', 'cool'],
    activities: ['reading', 'napping', 'lounging', 'chilling', 'resting', 'breathing', 'meditating'],
    locations: ['couch', 'bed', 'hammock', 'garden', 'patio', 'balcony'],
    timeOfDay: ['evening', 'sunset', 'dusk', 'night'],
    weather: ['mild', 'warm', 'sunny', 'breezy'],
    seasons: ['spring', 'summer'],
    intensity: 0.6
  },
  upbeat: {
    primary: ['happy', 'energetic', 'positive', 'motivated', 'excited', 'cheerful', 'lively', 'upbeat'],
    related: ['optimistic', 'bright', 'uplifting', 'fun', 'joyful', 'enthusiastic', 'inspired', 'pumped'],
    activities: ['dancing', 'exercising', 'running', 'working out', 'cleaning', 'cooking', 'creating'],
    locations: ['gym', 'park', 'studio', 'kitchen', 'office'],
    timeOfDay: ['morning', 'sunrise', 'noon', 'afternoon'],
    weather: ['sunny', 'clear', 'bright'],
    seasons: ['spring', 'summer'],
    intensity: 0.8
  },
  peaceful: {
    primary: ['serene', 'quiet', 'gentle', 'soothing', 'harmonious', 'meditative', 'peaceful'],
    related: ['mindful', 'still', 'soft', 'calming', 'relaxing', 'contemplative', 'balanced', 'grounded'],
    activities: ['meditating', 'yoga', 'reading', 'journaling', 'painting', 'gardening', 'stargazing'],
    locations: ['garden', 'forest', 'beach', 'mountain', 'lake', 'temple', 'study'],
    timeOfDay: ['dawn', 'dusk', 'night', 'early morning'],
    weather: ['misty', 'foggy', 'light rain', 'cloudy'],
    seasons: ['autumn', 'spring'],
    intensity: 0.4
  },
  energetic: {
    primary: ['dynamic', 'active', 'vibrant', 'spirited', 'enthusiastic', 'powerful', 'energetic'],
    related: ['strong', 'determined', 'focused', 'driven', 'passionate', 'fierce', 'unstoppable', 'productive'],
    activities: ['working', 'studying', 'coding', 'writing', 'brainstorming', 'creating', 'designing'],
    locations: ['office', 'library', 'cafe', 'desk', 'studio'],
    timeOfDay: ['morning', 'afternoon', 'day'],
    weather: ['clear', 'sunny', 'energizing'],
    seasons: ['summer', 'spring'],
    intensity: 1.0
  },
  winter: {
    primary: ['cozy', 'warm', 'snug', 'comfortable', 'hygge', 'intimate', 'winter'],
    related: ['peaceful', 'quiet', 'gentle', 'soft', 'calm', 'restful', 'cold', 'chilly'],
    activities: ['drinking cocoa', 'drinking tea', 'reading', 'knitting', 'cuddling', 'watching snow'],
    locations: ['indoors', 'fireplace', 'cabin', 'home', 'blanket fort'],
    timeOfDay: ['evening', 'night', 'early morning'],
    weather: ['cold', 'snowy', 'frosty', 'chilly', 'icy', 'winter', 'freezing'],
    seasons: ['winter'],
    intensity: 0.7
  },
  rainy: {
    primary: ['peaceful', 'calm', 'relaxed', 'contemplative', 'cozy', 'rainy'],
    related: ['quiet', 'gentle', 'soft', 'soothing', 'tranquil', 'wet', 'damp'],
    activities: ['reading', 'writing', 'watching rain', 'napping', 'drinking tea'],
    locations: ['window', 'indoors', 'cafe', 'library', 'bed'],
    timeOfDay: ['morning', 'afternoon', 'evening'],
    weather: ['rain', 'rainy', 'drizzle', 'storm', 'thunder', 'cloudy', 'overcast'],
    seasons: ['autumn', 'spring'],
    intensity: 0.5
  },
  focus: {
    primary: ['focused', 'concentrated', 'productive', 'determined', 'efficient', 'studious'],
    related: ['studying', 'working', 'learning', 'creating', 'developing', 'attentive'],
    activities: ['studying', 'working', 'coding', 'writing', 'reading', 'researching'],
    locations: ['library', 'office', 'desk', 'study room', 'cafe'],
    timeOfDay: ['morning', 'afternoon', 'late night'],
    weather: ['clear', 'neutral', 'calm'],
    seasons: ['any'],
    intensity: 0.9
  },
  sad: {
    primary: ['sad', 'melancholic', 'nostalgic', 'emotional', 'reflective', 'sentimental'],
    related: ['down', 'blue', 'gloomy', 'pensive', 'thoughtful', 'wistful', 'yearning'],
    activities: ['reflecting', 'thinking', 'remembering', 'writing', 'listening'],
    locations: ['bedroom', 'quiet place', 'window', 'alone'],
    timeOfDay: ['night', 'evening', 'late hours'],
    weather: ['rainy', 'cloudy', 'gloomy', 'misty'],
    seasons: ['autumn', 'winter'],
    intensity: 0.6
  },
  autumn: {
    primary: ['autumn', 'fall', 'harvest', 'pumpkin', 'cozy', 'crisp'],
    related: ['golden', 'leaves', 'amber', 'rustic', 'warm', 'earthy', 'mellow'],
    activities: ['reading', 'walking', 'drinking tea', 'baking', 'studying', 'reflecting'],
    locations: ['porch', 'garden', 'park', 'cafe', 'library', 'home'],
    timeOfDay: ['morning', 'afternoon', 'evening', 'dusk'],
    weather: ['crisp', 'cool', 'breezy', 'cloudy', 'misty'],
    seasons: ['autumn', 'fall'],
    intensity: 0.7
  }
} as const;

// Enhanced intensifiers with context modifiers
const intensifiers = {
  high: ['very', 'super', 'extremely', 'really', 'quite', 'so', 'totally', 'absolutely', 'incredibly'],
  medium: ['pretty', 'rather', 'fairly', 'somewhat', 'kind of', 'sort of'],
  low: ['slightly', 'a bit', 'a little', 'mildly'],
  negation: ['not', 'dont', 'cant', 'cannot', 'won\'t']
};

// Add sentence patterns for better matching
const sentencePatterns = {
  winter: [
    'drinking hot {drink}',
    'cold {time}',
    'snowy {time}',
    'winter {activity}',
    'by the fireplace',
    'wrapped in {item}',
    'staying warm',
    'cozy {location}'
  ],
  rainy: [
    'watching the rain',
    'rainy {time}',
    'listening to {weather}',
    'thunder{action}',
    'under the rain',
    '{action} by the window'
  ],
  focus: [
    'need to {work}',
    'have to {work}',
    'time to {work}',
    'getting some {work} done',
    'working on {project}',
    '{work} session',
    'deep {work}'
  ],
  autumn: [
    'fall {time}',
    'autumn {activity}',
    'pumpkin {drink}',
    'harvest {time}',
    'falling leaves',
    'cozy autumn'
  ]
} as const;

// Add common word replacements for pattern matching
const wordReplacements = {
  drink: ['cocoa', 'chocolate', 'tea', 'coffee', 'cider', 'latte', 'spice'],
  time: ['morning', 'afternoon', 'evening', 'night', 'day', 'season', 'vibes'],
  activity: ['vibes', 'mood', 'feeling', 'day', 'study', 'reading', 'walk'],
  item: ['blanket', 'sweater', 'scarf'],
  location: ['inside', 'indoors', 'home', 'room'],
  weather: ['rain', 'storm', 'thunder'],
  action: ['ing', 'y', ''],
  work: ['study', 'work', 'focus', 'concentrate', 'research', 'code', 'write'],
  project: ['homework', 'project', 'assignment', 'paper', 'code', 'thesis'],
  season: ['spring', 'summer', 'autumn', 'fall']
} as const;

// Add common phrases that indicate mood
const moodPhrases = {
  chill: [
    'want to relax',
    'need to chill',
    'time to unwind',
    'taking it easy',
    'winding down',
    'relaxation time'
  ],
  upbeat: [
    'feeling good',
    'in a good mood',
    'ready to',
    'excited to',
    'lets go',
    'pumped up'
  ],
  peaceful: [
    'need peace',
    'want quiet',
    'some silence',
    'calm environment',
    'peaceful setting',
    'tranquil space'
  ],
  energetic: [
    'ready to work',
    'lets do this',
    'time to hustle',
    'getting started',
    'full of energy',
    'feeling productive'
  ]
} as const;

interface MoodScore {
  type: keyof typeof moodContexts;
  score: number;
  matchedWords: string[];
  contextMatches: {
    activities: string[];
    locations: string[];
    weather: string[];
    timeOfDay: string[];
    seasons: string[];
  };
}

// Add interface for YouTube API response
interface YouTubePlaylistItem {
  snippet: {
    title: string;
    description: string;
    resourceId: {
      videoId: string;
    };
  };
}

interface YouTubePlaylistResponse {
  items: YouTubePlaylistItem[];
}

function calculateWordSimilarity(word1: string, word2: string): number {
  const shorter = word1.length <= word2.length ? word1 : word2;
  const longer = word1.length <= word2.length ? word2 : word1;
  
  if (shorter === longer) return 1.0;
  if (shorter.length === 0) return 0.0;
  
  // Check if one word contains the other
  if (longer.includes(shorter)) return 0.8;
  
  // Calculate Levenshtein distance
  const matrix = Array(shorter.length + 1).fill(null).map(() => 
    Array(longer.length + 1).fill(null)
  );

  for (let i = 0; i <= shorter.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= longer.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= shorter.length; i++) {
    for (let j = 1; j <= longer.length; j++) {
      const cost = shorter[i - 1] === longer[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[shorter.length][longer.length];
  const maxLength = Math.max(shorter.length, longer.length);
  const similarity = 1 - distance / maxLength;
  
  return similarity;
}

function findIntensifiers(input: string): number {
  let intensityMultiplier = 1;
  const words = input.toLowerCase().split(/\s+/);
  
  // Check for high intensifiers
  const highCount = words.filter(word => 
    intensifiers.high.includes(word)
  ).length;
  
  // Check for medium intensifiers
  const mediumCount = words.filter(word => 
    intensifiers.medium.includes(word)
  ).length;
  
  // Check for low intensifiers
  const lowCount = words.filter(word => 
    intensifiers.low.includes(word)
  ).length;
  
  // Apply weighted multipliers
  intensityMultiplier += (highCount * 0.3) + (mediumCount * 0.15) + (lowCount * 0.05);
  
  // Check for negations
  const hasNegation = words.some(word => 
    intensifiers.negation.includes(word)
  );
  
  return hasNegation ? -intensityMultiplier : intensityMultiplier;
}

function findContextualMatches(input: string, context: typeof moodContexts[keyof typeof moodContexts]): {
  score: number;
  matches: {
    activities: string[];
    locations: string[];
    weather: string[];
    timeOfDay: string[];
    seasons: string[];
  };
} {
  const words = input.toLowerCase().split(/\s+/);
  let contextScore = 0;
  const matches = {
    activities: [] as string[],
    locations: [] as string[],
    weather: [] as string[],
    timeOfDay: [] as string[],
    seasons: [] as string[]
  };

  // Helper function to check matches in a category
  const checkCategory = (category: readonly string[], words: string[], weight: number) => {
    const categoryMatches: string[] = [];
    words.forEach(word => {
      category.forEach(item => {
        const similarity = calculateWordSimilarity(word, item);
        if (similarity > 0.8) {
          contextScore += similarity * weight;
          categoryMatches.push(item);
        }
      });
    });
    return categoryMatches;
  };

  // Check each context category with different weights
  matches.activities = checkCategory([...context.activities], words, 1.0);
  matches.locations = checkCategory([...context.locations], words, 0.8);
  matches.weather = checkCategory([...context.weather], words, 1.2);
  matches.timeOfDay = checkCategory([...context.timeOfDay], words, 0.6);
  matches.seasons = checkCategory([...context.seasons], words, 1.5);

  return { score: contextScore, matches };
}

function matchSentencePatterns(input: string): { type: keyof typeof moodContexts; score: number }[] {
  const matches: { type: keyof typeof moodContexts; score: number }[] = [];
  const normalizedInput = input.toLowerCase();

  // Helper function to check if input matches a pattern
  const checkPattern = (pattern: string): boolean => {
    const parts = pattern.split(/[{}]/);
    let regexStr = '^';
    
    parts.forEach((part, i) => {
      if (i % 2 === 0) {
        // Regular text
        regexStr += part.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      } else {
        // Replacement placeholder
        const replacements = wordReplacements[part as keyof typeof wordReplacements];
        regexStr += `(${replacements.join('|')})`;
      }
    });
    
    regexStr += '$';
    return new RegExp(regexStr).test(normalizedInput);
  };

  // Check each mood's patterns
  Object.entries(sentencePatterns).forEach(([mood, patterns]) => {
    patterns.forEach(pattern => {
      if (checkPattern(pattern)) {
        matches.push({
          type: mood as keyof typeof moodContexts,
          score: 1.5 // Sentence patterns have higher weight
        });
      }
    });
  });

  // Check mood phrases
  Object.entries(moodPhrases).forEach(([mood, phrases]) => {
    phrases.forEach(phrase => {
      if (normalizedInput.includes(phrase)) {
        matches.push({
          type: mood as keyof typeof moodContexts,
          score: 1.2 // Phrases have medium-high weight
        });
      }
    });
  });

  return matches;
}

function findNegations(input: string): string[] {
  const negationWords = ['not', 'dont', 'can\'t', 'cannot', 'no', 'never'];
  const words = input.toLowerCase().split(/\s+/);
  return words.filter(word => negationWords.includes(word));
}

export async function matchMoodToRoom(input: string, rooms: Room[]): Promise<Room | null> {
  const normalizedInput = input.toLowerCase().trim();
  const words = normalizedInput.split(/\s+/);
  const intensityMultiplier = findIntensifiers(normalizedInput);
  const negations = findNegations(normalizedInput);
  
  // Get sentence pattern matches
  const patternMatches = matchSentencePatterns(normalizedInput);
  
  // Calculate scores for each mood type
  const moodScores: MoodScore[] = Object.entries(moodContexts).map(([moodType, context]) => {
    let score = 0;
    const matchedWords: string[] = [];
    
    // Add scores from sentence pattern matches
    const patterns = patternMatches.filter(m => m.type === moodType);
    patterns.forEach(p => {
      score += p.score;
    });
    
    // Check each word in the input against keywords
    words.forEach(inputWord => {
      // Skip negation words when checking keywords
      if (negations.includes(inputWord)) return;
      
      // Check primary keywords with full weight
      context.primary.forEach(keyword => {
        const similarity = calculateWordSimilarity(inputWord, keyword);
        if (similarity > 0.8) {
          score += similarity * 1.5; // Increased weight for primary keywords
          matchedWords.push(keyword);
        }
      });
      
      // Check related keywords with lower weight
      context.related.forEach(keyword => {
        const similarity = calculateWordSimilarity(inputWord, keyword);
        if (similarity > 0.8) {
          score += similarity * 0.8;
          matchedWords.push(keyword);
        }
      });
    });
    
    // Find contextual matches
    const contextual = findContextualMatches(normalizedInput, context);
    score += contextual.score;
    
    // Apply mood-specific intensity
    score *= context.intensity;
    
    // Apply intensity multiplier from intensifiers
    score *= Math.abs(intensityMultiplier);
    
    // If there are negations, invert the score for this mood
    if (negations.length > 0) {
      const hasNegatedMatch = matchedWords.some(word => {
        const wordIndex = words.indexOf(word);
        return wordIndex !== -1 && negations.some(neg => {
          const negIndex = words.indexOf(neg);
          return negIndex !== -1 && Math.abs(wordIndex - negIndex) <= 2;
        });
      });
      
      if (hasNegatedMatch) {
        score *= -1;
      }
    }
    
    return {
      type: moodType as keyof typeof moodContexts,
      score,
      matchedWords,
      contextMatches: contextual.matches
    };
  });
  
  // Sort by score and get the best match
  const bestMatch = moodScores
    .filter(score => score.score > 0)
    .sort((a, b) => b.score - a.score)[0];
  
  if (bestMatch) {
    // Get rooms matching the best mood
    const matchingRooms = rooms.filter(room => room.mood === bestMatch.type);
    if (matchingRooms.length > 0) {
      // Score each matching room based on contextual relevance
      const roomScores = await Promise.all(matchingRooms.map(async room => {
        let roomScore = bestMatch.score;
        const roomNameLower = room.name.toLowerCase();
        const playlistIdLower = room.playlistId?.toLowerCase() || '';
        
        // Helper function to check word matches in a string
        const checkWordMatches = (text: string, multiplier: number) => {
          const textWords = text.split(/\s+/);
          words.forEach(inputWord => {
            textWords.forEach(textWord => {
              const similarity = calculateWordSimilarity(inputWord, textWord);
              if (similarity > 0.8) {
                roomScore *= multiplier;
              }
            });
          });
        };

        // Try to get playlist track titles for additional context
        try {
          const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${room.playlistId}&key=${process.env.YOUTUBE_API_KEY}`);
          if (response.ok) {
            const data = await response.json() as YouTubePlaylistResponse;
            const trackTitles = data.items.map(item => item.snippet.title.toLowerCase());
            
            // Check track titles for mood-specific keywords
            trackTitles.forEach((title: string) => {
              // Check primary keywords
              moodContexts[bestMatch.type].primary.forEach(keyword => {
                if (title.includes(keyword.toLowerCase())) {
                  roomScore *= 1.4; // High boost for primary keyword in track title
                }
              });

              // Check related keywords
              moodContexts[bestMatch.type].related.forEach(keyword => {
                if (title.includes(keyword.toLowerCase())) {
                  roomScore *= 1.2; // Medium boost for related keyword in track title
                }
              });

              // Check seasonal terms
              moodContexts[bestMatch.type].seasons.forEach(season => {
                if (title.includes(season.toLowerCase())) {
                  roomScore *= 1.3; // Good boost for seasonal match in track title
                }
              });

              // Check weather terms
              moodContexts[bestMatch.type].weather.forEach(weather => {
                if (title.includes(weather.toLowerCase())) {
                  roomScore *= 1.25; // Weather context boost in track title
                }
              });

              // Direct word matches in track titles
              checkWordMatches(title, 1.35);
            });
          }
        } catch (error) {
          console.warn('Could not fetch playlist items:', error);
        }

        // Boost score based on matched context in room name and playlist ID
        if (bestMatch.contextMatches.weather.length > 0) {
          const weatherMatches = bestMatch.contextMatches.weather.some(weather => 
            roomNameLower.includes(weather) || playlistIdLower.includes(weather)
          );
          if (weatherMatches) roomScore *= 1.2;
        }

        if (bestMatch.contextMatches.timeOfDay.length > 0) {
          const timeMatches = bestMatch.contextMatches.timeOfDay.some(time => 
            roomNameLower.includes(time) || playlistIdLower.includes(time)
          );
          if (timeMatches) roomScore *= 1.2;
        }

        if (bestMatch.contextMatches.activities.length > 0) {
          const activityMatches = bestMatch.contextMatches.activities.some(activity =>
            roomNameLower.includes(activity) || playlistIdLower.includes(activity)
          );
          if (activityMatches) roomScore *= 1.3;
        }

        if (bestMatch.contextMatches.seasons.length > 0) {
          const seasonMatches = bestMatch.contextMatches.seasons.some(season =>
            roomNameLower.includes(season) || playlistIdLower.includes(season)
          );
          if (seasonMatches) roomScore *= 1.4;
        }

        // Check for mood-specific keywords in playlist ID
        const moodContext = moodContexts[bestMatch.type];
        const playlistHasPrimaryKeywords = moodContext.primary.some(keyword =>
          playlistIdLower.includes(keyword)
        );
        if (playlistHasPrimaryKeywords) roomScore *= 1.3;

        const playlistHasRelatedKeywords = moodContext.related.some(keyword =>
          playlistIdLower.includes(keyword)
        );
        if (playlistHasRelatedKeywords) roomScore *= 1.2;

        // Score matches in room name (higher weight)
        checkWordMatches(roomNameLower, 1.5);
        
        // Score matches in playlist ID (medium weight)
        if (playlistIdLower) {
          checkWordMatches(playlistIdLower, 1.3);
        }

        // Additional context scoring from playlist ID
        if (playlistIdLower) {
          // Check for study/work context
          if (input.includes('study') || input.includes('work')) {
            if (playlistIdLower.includes('study') || playlistIdLower.includes('work')) {
              roomScore *= 1.4;
            }
          }

          // Check for time of day context
          ['morning', 'afternoon', 'evening', 'night'].forEach(time => {
            if (input.includes(time) && playlistIdLower.includes(time)) {
              roomScore *= 1.3;
            }
          });

          // Check for weather context
          ['rain', 'snow', 'storm', 'sunny', 'cloudy'].forEach(weather => {
            if (input.includes(weather) && playlistIdLower.includes(weather)) {
              roomScore *= 1.3;
            }
          });
        }

        return {
          room,
          score: roomScore,
          debug: {
            roomName: room.name,
            playlistId: room.playlistId,
            finalScore: roomScore
          }
        };
      }));

      // Sort rooms by score and get the best match
      const bestRoom = roomScores.sort((a, b) => b.score - a.score)[0].room;

      // Enhanced debug logging
      console.log('Mood match details:', {
        input: normalizedInput,
        matchedMood: bestMatch.type,
        score: bestMatch.score,
        matchedWords: bestMatch.matchedWords,
        contextMatches: bestMatch.contextMatches,
        intensityMultiplier,
        availableRooms: matchingRooms.length,
        selectedRoom: bestRoom.name,
        playlistId: bestRoom.playlistId,
        allRoomScores: roomScores.map(rs => rs.debug)
      });
      
      return bestRoom;
    }
  }
  
  return null;
} 