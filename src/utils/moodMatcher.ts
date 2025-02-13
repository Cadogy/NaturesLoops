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
    primary: ['happy', 'energetic', 'positive', 'motivated', 'excited', 'cheerful', 'lively'],
    related: ['optimistic', 'bright', 'uplifting', 'fun', 'joyful', 'enthusiastic', 'inspired', 'pumped'],
    activities: ['dancing', 'exercising', 'running', 'working out', 'cleaning', 'cooking', 'creating'],
    locations: ['gym', 'park', 'studio', 'kitchen', 'office'],
    timeOfDay: ['morning', 'sunrise', 'noon', 'afternoon'],
    weather: ['sunny', 'clear', 'bright'],
    seasons: ['spring', 'summer'],
    intensity: 0.8
  },
  peaceful: {
    primary: ['serene', 'quiet', 'gentle', 'soothing', 'harmonious', 'meditative'],
    related: ['mindful', 'still', 'soft', 'calming', 'relaxing', 'contemplative', 'balanced', 'grounded'],
    activities: ['meditating', 'yoga', 'reading', 'journaling', 'painting', 'gardening', 'stargazing'],
    locations: ['garden', 'forest', 'beach', 'mountain', 'lake', 'temple', 'study'],
    timeOfDay: ['dawn', 'dusk', 'night', 'early morning'],
    weather: ['misty', 'foggy', 'light rain', 'cloudy'],
    seasons: ['autumn', 'spring'],
    intensity: 0.4
  },
  energetic: {
    primary: ['dynamic', 'active', 'vibrant', 'spirited', 'enthusiastic', 'powerful'],
    related: ['strong', 'determined', 'focused', 'driven', 'passionate', 'fierce', 'unstoppable', 'productive'],
    activities: ['working', 'studying', 'coding', 'writing', 'brainstorming', 'creating', 'designing'],
    locations: ['office', 'library', 'cafe', 'desk', 'studio'],
    timeOfDay: ['morning', 'afternoon', 'day'],
    weather: ['clear', 'sunny', 'energizing'],
    seasons: ['summer', 'spring'],
    intensity: 1.0
  },
  winter: {
    primary: ['cozy', 'warm', 'snug', 'comfortable', 'hygge', 'intimate'],
    related: ['peaceful', 'quiet', 'gentle', 'soft', 'calm', 'restful'],
    activities: ['drinking cocoa', 'drinking tea', 'reading', 'knitting', 'cuddling', 'watching snow'],
    locations: ['indoors', 'fireplace', 'cabin', 'home', 'blanket fort'],
    timeOfDay: ['evening', 'night', 'early morning'],
    weather: ['cold', 'snowy', 'frosty', 'chilly', 'icy', 'winter', 'freezing'],
    seasons: ['winter'],
    intensity: 0.7
  },
  rainy: {
    primary: ['peaceful', 'calm', 'relaxed', 'contemplative', 'cozy'],
    related: ['quiet', 'gentle', 'soft', 'soothing', 'tranquil'],
    activities: ['reading', 'writing', 'watching rain', 'napping', 'drinking tea'],
    locations: ['window', 'indoors', 'cafe', 'library', 'bed'],
    timeOfDay: ['morning', 'afternoon', 'evening'],
    weather: ['rain', 'rainy', 'drizzle', 'storm', 'thunder', 'cloudy', 'overcast'],
    seasons: ['autumn', 'spring'],
    intensity: 0.5
  },
  focus: {
    primary: ['focused', 'concentrated', 'productive', 'determined', 'efficient'],
    related: ['studying', 'working', 'learning', 'creating', 'developing'],
    activities: ['studying', 'working', 'coding', 'writing', 'reading', 'researching'],
    locations: ['library', 'office', 'desk', 'study room', 'cafe'],
    timeOfDay: ['morning', 'afternoon', 'late night'],
    weather: ['clear', 'neutral', 'calm'],
    seasons: ['any'],
    intensity: 0.9
  }
} as const;

// Enhanced opposites with context
const opposites = {
  chill: ['stressed', 'anxious', 'tense', 'nervous', 'restless', 'rushed', 'busy'],
  upbeat: ['sad', 'down', 'depressed', 'gloomy', 'negative', 'tired', 'exhausted'],
  peaceful: ['chaotic', 'noisy', 'turbulent', 'disturbed', 'agitated', 'loud', 'busy'],
  energetic: ['tired', 'exhausted', 'lazy', 'sluggish', 'fatigued', 'sleepy', 'drained'],
  winter: ['hot', 'sweaty', 'tropical', 'summery', 'sweltering'],
  rainy: ['dry', 'arid', 'sunny', 'clear', 'hot'],
  focus: ['distracted', 'scattered', 'unfocused', 'confused', 'tired']
};

// Expanded intensifiers with context modifiers
const intensifiers = {
  high: ['very', 'super', 'extremely', 'really', 'quite', 'so', 'totally', 'absolutely', 'incredibly'],
  medium: ['pretty', 'rather', 'fairly', 'somewhat', 'kind of', 'sort of'],
  low: ['slightly', 'a bit', 'a little', 'mildly'],
  negation: ['not', 'don\'t', 'cant', 'cannot', 'won\'t']
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
  ]
} as const;

// Add common word replacements for pattern matching
const wordReplacements = {
  drink: ['cocoa', 'chocolate', 'tea', 'coffee'],
  time: ['morning', 'afternoon', 'evening', 'night', 'day'],
  activity: ['vibes', 'mood', 'feeling', 'day'],
  item: ['blanket', 'sweater', 'scarf'],
  location: ['inside', 'indoors', 'home', 'room'],
  weather: ['rain', 'storm', 'thunder'],
  action: ['ing', 'y', ''],
  work: ['study', 'work', 'focus', 'concentrate', 'research', 'code', 'write'],
  project: ['homework', 'project', 'assignment', 'paper', 'code', 'thesis']
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

function checkForOpposites(input: string, moodType: keyof typeof moodContexts): number {
  const words = input.toLowerCase().split(/\s+/);
  const oppositeWords = opposites[moodType];
  
  const foundOpposites = words.some(word => 
    oppositeWords.some(opposite => calculateWordSimilarity(word, opposite) > 0.8)
  );
  
  return foundOpposites ? -0.5 : 0;
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

export function matchMoodToRoom(input: string, rooms: Room[]): Room | null {
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
          score += similarity * 1.2; // Primary keywords have highest weight
          matchedWords.push(keyword);
        }
      });
      
      // Check related keywords with lower weight
      context.related.forEach(keyword => {
        const similarity = calculateWordSimilarity(inputWord, keyword);
        if (similarity > 0.8) {
          score += similarity * 0.8; // Related keywords have lower weight
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
    
    // Check for opposites and apply penalty if found
    score += checkForOpposites(normalizedInput, moodType as keyof typeof moodContexts);
    
    // If there are negations, check if they apply to this mood
    if (negations.length > 0) {
      // Check if any of the matched words appear near negations
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
      // Log the match details for debugging
      console.log('Mood match details:', {
        input: normalizedInput,
        matchedMood: bestMatch.type,
        score: bestMatch.score,
        matchedWords: bestMatch.matchedWords,
        contextMatches: bestMatch.contextMatches,
        intensityMultiplier,
        availableRooms: matchingRooms.length
      });
      
      return matchingRooms[Math.floor(Math.random() * matchingRooms.length)];
    }
  }
  
  return null;
} 