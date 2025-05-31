import { InterviewData } from '../types';
import interviewsData from '../data/interviews-data.json';

interface ProcessedData {
  metadata: {
    totalInterviews: number;
    processedAt: string;
    totalWords: number;
  };
  interviews: InterviewData[];
}

class InterviewService {
  private interviews: InterviewData[] = [];
  private loaded = false;

  async loadInterviews(): Promise<InterviewData[]> {
    if (this.loaded) {
      return this.interviews;
    }

    try {
      // Try to use imported data first
      if (interviewsData && interviewsData.interviews && interviewsData.metadata) {
        const data = interviewsData as ProcessedData;
        this.interviews = data.interviews;
        console.log(`🎉 Loaded ${data.metadata.totalInterviews} interviews with ${data.metadata.totalWords.toLocaleString()} total words from imported data`);
        console.log('📚 Interview letters:', this.interviews.map(i => i.letter).join(', '));
        this.loaded = true;
        return this.interviews;
      }

      // Fallback to HTTP fetch if import doesn't work
      console.log('📡 Fallback to HTTP fetch...');
      
      // Try multiple paths to load the data
      const possiblePaths = [
        '/interviews-data.json',
        './interviews-data.json',
        `${process.env.PUBLIC_URL}/interviews-data.json`,
        '/Deleuzebot/interviews-data.json'
      ];

      let data: ProcessedData | null = null;
      let lastError: Error | null = null;

      for (const path of possiblePaths) {
        try {
          console.log(`Attempting to fetch interviews from: ${path}`);
          const response = await fetch(path);
          
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              data = await response.json();
              console.log(`✅ Successfully loaded from: ${path}`);
              break;
            } else {
              console.warn(`⚠️ Content-Type not JSON from ${path}: ${contentType}`);
              // Check if the response is HTML (React dev server fallback)
              const text = await response.text();
              if (text.includes('<!DOCTYPE html>')) {
                console.warn(`❌ ${path} returned HTML instead of JSON (dev server issue)`);
                continue;
              }
            }
          } else {
            console.warn(`❌ Failed to load from ${path}: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          lastError = error as Error;
          console.warn(`❌ Error fetching from ${path}:`, error);
        }
      }

      if (data && data.interviews && data.metadata) {
        this.interviews = data.interviews;
        console.log(`🎉 Loaded ${data.metadata.totalInterviews} interviews with ${data.metadata.totalWords.toLocaleString()} total words`);
        console.log('📚 Interview letters:', this.interviews.map(i => i.letter).join(', '));
      } else {
        console.error('⚠️ Failed to load interview data from all paths, using fallback data...');
        if (lastError) {
          console.error('Last error:', lastError);
        }
        this.interviews = this.createFallbackData();
      }
    } catch (error) {
      console.error('💥 Critical error loading interview data, using fallback:', error);
      this.interviews = this.createFallbackData();
    }

    this.loaded = true;
    return this.interviews;
  }

  private createFallbackData(): InterviewData[] {
    // Fallback data structure with sample content from your Culture interview
    const fallbackInterviews: InterviewData[] = [
      {
        letter: 'C',
        title: 'Culture',
        filename: "L'Abécédaire de GILLES DELEUZE  - C comme Culture  (HD).m4a.txt",
        audioFilename: "Culture.mp3",
        content: `We're going to spend enough, so it's vast. It's expensive. It's like culture. Yes, I don't think so. So there you are, it's someone who tells you you're not cultured. That is to say that you say that you read, you only see films or you watch things for precise knowledge, the one you need for a precise defined work, which is the one you are doing. But at the same time, he is a person who, every Saturday at an exhibition, will have a film from the great cultural domain. One has the impression that there is a practice, a kind of effort in the culture, that you systematize and that you have a cultural practice...`,
        topics: ['culture', 'intellectuals', 'knowledge', 'education']
      },
      {
        letter: 'D',
        title: 'Désir',
        filename: "L'Abécédaire de GILLES DELEUZE  - D comme Désir  (HD).m4a.txt",
        audioFilename: "Desire.mp3",
        content: "Desire is not lack but assemblage...",
        topics: ['desire', 'psychoanalysis', 'assemblage']
      }
    ];

    return fallbackInterviews;
  }

  searchInterviews(query: string, limit: number = 3): InterviewData[] {
    const lowerQuery = query.toLowerCase();
    
    return this.interviews
      .filter(interview => 
        interview.title.toLowerCase().includes(lowerQuery) ||
        interview.topics.some(topic => topic.toLowerCase().includes(lowerQuery)) ||
        interview.content.toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit);
  }

  getInterviewByLetter(letter: string): InterviewData | undefined {
    return this.interviews.find(interview => interview.letter === letter);
  }

  getAllLetters(): string[] {
    return this.interviews.map(interview => interview.letter).sort();
  }

  getStats() {
    const totalWords = this.interviews.reduce((sum, interview) => {
      return sum + (interview.content?.split(/\s+/).length || 0);
    }, 0);

    return {
      totalInterviews: this.interviews.length,
      totalWords,
      availableLetters: this.getAllLetters()
    };
  }

  // Generate simplified audio filename for serving
  private generateSimplifiedAudioFilename(originalFilename: string): string {
    // Extract letter from filename
    const match = originalFilename.match(/([A-Z]) comme (.+?)(?:\s*\(HD\))?\.m4a$/i);
    if (match) {
      const [, letter, title] = match;
      return `${letter}_-_${title.trim().replace(/\s+/g, '_')}.m4a`;
    }
    return originalFilename.replace(/\s+/g, '_');
  }
}

export const interviewService = new InterviewService(); 