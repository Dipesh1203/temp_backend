import natural from 'natural';

// Initialize the sentiment analyzer
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
const tokenizer = new natural.WordTokenizer();

// Define emotion keywords
const emotionKeywords = {
  happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'glad', 'pleased', 'delighted', 'cheerful', 'content', 'thrilled', 'grateful', 'blessed'],
  sad: ['sad', 'unhappy', 'depressed', 'miserable', 'disappointed', 'grief', 'sorrow', 'heartbroken', 'gloomy', 'down', 'blue', 'upset', 'hurt', 'regret', 'lonely'],
  angry: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated', 'rage', 'hate', 'outraged', 'bitter', 'resentful', 'enraged', 'irate', 'hostile', 'livid'],
  fear: ['afraid', 'scared', 'fearful', 'terrified', 'anxious', 'worried', 'nervous', 'panic', 'dread', 'horror', 'frightened', 'uneasy', 'insecure', 'apprehensive', 'alarmed'],
  surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'startled', 'stunned', 'unexpected', 'wonder', 'disbelief', 'awe', 'bewildered', 'speechless', 'dumbfounded', 'staggered', 'flabbergasted'],
  neutral: ['okay', 'fine', 'neutral', 'average', 'normal', 'balanced', 'moderate', 'standard', 'regular', 'ordinary', 'common', 'usual', 'typical', 'routine', 'conventional']
};

// Function to analyze text and determine emotion
export const analyzeEmotion = (text) => {
  // Convert to lowercase for better matching
  const lowercaseText = text.toLowerCase();
  const tokens = tokenizer.tokenize(lowercaseText);
  
  // Count emotion matches
  const emotionCounts = {
    happy: 0, sad: 0, angry: 0, fear: 0, surprise: 0, neutral: 0
  };
  
  // Check each token for emotion keywords
  tokens.forEach(token => {
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.includes(token)) {
        emotionCounts[emotion]++;
      }
    }
  });
  
  // Get sentiment score
  const sentimentScore = analyzer.getSentiment(tokens);
  
  // Determine dominant emotion based on keyword count
  let dominantEmotion = 'neutral';
  let maxCount = 0;
  
  for (const [emotion, count] of Object.entries(emotionCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantEmotion = emotion;
    }
  }
  
  // If no dominant emotion found, use sentiment score
  if (maxCount === 0) {
    if (sentimentScore > 0.3) {
      dominantEmotion = 'happy';
    } else if (sentimentScore < -0.3) {
      dominantEmotion = 'sad';
    } else {
      dominantEmotion = 'neutral';
    }
  }
  
  return dominantEmotion;
};