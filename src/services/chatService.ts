import { Message, Citation, GroqResponse } from '../types';
import { interviewService } from './interviewService';

// Available Groq models as of January 2025
export const GROQ_MODELS = {
  production: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Recommended)', description: 'Most capable model for philosophical dialogue' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Fast)', description: 'Faster responses, good for quick conversations' },
    { id: 'llama3-70b-8192', name: 'Llama 3 70B', description: 'Alternative 70B model' },
    { id: 'llama3-8b-8192', name: 'Llama 3 8B', description: 'Lightweight option' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google\'s efficient model' },
  ],
  preview: [
    { id: 'qwen-qwq-32b', name: 'Qwen QwQ 32B', description: 'Advanced reasoning model' },
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill', description: 'Specialized reasoning model' },
    { id: 'mistral-saba-24b', name: 'Mistral Saba 24B', description: 'Multilingual capabilities' },
  ]
} as const;

class ChatService {
  private apiKey: string | null = null;
  private apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private selectedModel: string = 'llama-3.3-70b-versatile'; // Default to recommended model
  private interviewsLoaded = false;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  setModel(modelId: string) {
    this.selectedModel = modelId;
  }

  getSelectedModel(): string {
    return this.selectedModel;
  }

  getAvailableModels() {
    return GROQ_MODELS;
  }

  private async ensureInterviewsLoaded() {
    if (!this.interviewsLoaded) {
      await interviewService.loadInterviews();
      this.interviewsLoaded = true;
    }
  }

  async sendMessage(messages: Message[], userMessage: string): Promise<Message> {
    if (!this.apiKey) {
      throw new Error('Groq API key not set. Please add your API key in the settings.');
    }

    // Ensure interviews are loaded
    await this.ensureInterviewsLoaded();

    // Search for relevant interviews with improved matching
    const relevantInterviews = this.searchRelevantInterviews(userMessage, 3);
    
    // Create context from relevant interviews
    const context = relevantInterviews.length > 0 
      ? this.buildContext(relevantInterviews)
      : '';

    // Build the system prompt
    const systemPrompt = this.buildSystemPrompt(context, relevantInterviews);
    
    // Prepare messages for the API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.selectedModel,
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Check for specific model deprecation error
        if (errorData.error?.message?.includes('decommissioned') || 
            errorData.error?.message?.includes('deprecated')) {
          throw new Error(`The model "${this.selectedModel}" is no longer supported. Please select a different model in settings. Error: ${errorData.error?.message || 'Model deprecated'}`);
        }
        
        throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
      }

      const data: GroqResponse = await response.json();
      const assistantContent = data.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at the moment.';

      // Generate citations
      const citations = this.generateCitations(userMessage, relevantInterviews);

      return {
        id: crypto.randomUUID(),
        content: assistantContent,
        role: 'assistant',
        timestamp: new Date(),
        citations
      };
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }

  private searchRelevantInterviews(query: string, limit: number = 3): any[] {
    const lowerQuery = query.toLowerCase();
    
    // Get all interviews
    const allInterviews = interviewService.searchInterviews('', 100); // Get all
    
    // Enhanced scoring based on multiple factors
    const scoredInterviews = allInterviews.map(interview => {
      let score = 0;
      
      // Direct title match (highest priority)
      if (interview.title.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }
      
      // Topic match (high priority)
      interview.topics.forEach(topic => {
        if (topic.toLowerCase().includes(lowerQuery) || lowerQuery.includes(topic.toLowerCase())) {
          score += 5;
        }
      });
      
      // Content keyword matches
      const queryWords = lowerQuery.split(' ').filter(word => word.length > 2);
      queryWords.forEach(word => {
        const contentLower = interview.content.toLowerCase();
        const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
        score += matches * 0.1; // Lower weight for content matches to avoid noise
      });
      
      // Special boost for exact letter match (e.g., "what is culture" should prioritize "C")
      if (query.toLowerCase().includes('culture') && interview.letter === 'C') score += 15;
      if (query.toLowerCase().includes('desire') && interview.letter === 'D') score += 15;
      if (query.toLowerCase().includes('animal') && interview.letter === 'A') score += 15;
      if (query.toLowerCase().includes('philosophy') && interview.letter === 'H') score += 15;
      if (query.toLowerCase().includes('writing') && interview.letter === 'L') score += 15;
      
      return { ...interview, score };
    });
    
    // Sort by score and return top results
    return scoredInterviews
      .filter(interview => interview.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private buildSystemPrompt(context: string, interviews: any[]): string {
    const interviewReferences = interviews.length > 0 
      ? `\n\nDrawing from these L'Abécédaire interviews:\n${interviews.map(i => `- "${i.letter} comme ${i.title}" (${i.audioFilename})`).join('\n')}\n`
      : '';

    return `You are an intelligent assistant that provides information based on Gilles Deleuze's L'Abécédaire interviews with Claire Parnet. Your role is to synthesize and present philosophical insights from these interviews in response to user questions.

L'Abécédaire de Gilles Deleuze ("Gilles Deleuze's alphabet book") is a French television program produced by Pierre-André Boutang in 1988–1989, consisting of an eight-hour series of interviews between Gilles Deleuze and Claire Parnet.

Guidelines for responses:
- Present information as insights "from the interviews" rather than speaking as Deleuze
- Reference specific concepts and ideas that Deleuze discussed
- Maintain philosophical depth while being accessible
- Draw connections between different interview topics when relevant
- Use phrases like "In the interviews, Deleuze discusses..." or "According to the L'Abécédaire conversations..."
- Focus on Deleuze's key concepts: assemblages, rhizomes, becoming, multiplicity, difference, immanence
- Reference how these ideas connect to other philosophers he mentions (Spinoza, Nietzsche, Bergson, etc.)

${interviewReferences}${context ? `\n\nRelevant content from the interviews:\n${context}\n` : ''}

Provide thoughtful, philosophical responses that accurately reflect Deleuze's ideas as presented in the L'Abécédaire interviews. When appropriate, reference the specific interview letters and audio files where these concepts are discussed.`;
  }

  private buildContext(interviews: any[]): string {
    return interviews
      .map(interview => 
        `From "${interview.letter} comme ${interview.title}" (${interview.audioFilename}):\n"${interview.content.substring(0, 800)}..."`
      )
      .join('\n\n');
  }

  private generateCitations(query: string, interviews: any[]): Citation[] {
    return interviews.map(interview => ({
      source: `L'Abécédaire - ${interview.letter} comme ${interview.title}`,
      audioFile: interview.audioFilename,
      letter: interview.letter,
      title: interview.title,
      excerpt: interview.content.substring(0, 300) + '...',
      confidence: this.calculateRelevanceScore(query, interview)
    }));
  }

  private calculateRelevanceScore(query: string, interview: any): number {
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    const interviewText = (interview.title + ' ' + interview.topics.join(' ') + ' ' + interview.content).toLowerCase();
    
    const matches = queryWords.filter(word => 
      interviewText.includes(word)
    ).length;
    
    // Boost score if this is a direct topic match
    if (interview.title.toLowerCase().includes(query.toLowerCase()) || 
        interview.topics.some((topic: string) => query.toLowerCase().includes(topic.toLowerCase()))) {
      return Math.min(0.95, 0.6 + (matches / queryWords.length) * 0.35);
    }
    
    return Math.min(0.9, matches / queryWords.length);
  }

  // Method to get stats about loaded interviews
  async getInterviewStats() {
    await this.ensureInterviewsLoaded();
    return interviewService.getStats();
  }
}

export const chatService = new ChatService(); 