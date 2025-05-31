import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, RotateCcw, Volume2, Github, Info } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { Settings } from './components/Settings';
import { AudioPlayer } from './components/AudioPlayer';
import { DeleuzeContextMenu } from './components/DeleuzeContextMenu';
import { InfoModal } from './components/InfoModal';
import { Message } from './types';
import { chatService } from './services/chatService';
import { interviewService } from './services/interviewService';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [interviewsLoading, setInterviewsLoading] = useState(true);
  const [interviewStats, setInterviewStats] = useState<any>(null);
  const [audioPlayer, setAudioPlayer] = useState<{
    isOpen: boolean;
    audioFile: string;
    title: string;
    letter: string;
  }>({
    isOpen: false,
    audioFile: '',
    title: '',
    letter: ''
  });
  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
    selectedText: string;
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    selectedText: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize services
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Loading interview data...');
        await interviewService.loadInterviews();
        const stats = await chatService.getInterviewStats();
        setInterviewStats(stats);
        console.log('Interview data loaded:', stats);
        setInterviewsLoading(false);
      } catch (error) {
        console.error('Failed to load interview data:', error);
        setInterviewsLoading(false);
      }
    };

    initializeApp();
    
    // Check for existing API key
    const savedApiKey = localStorage.getItem('groq-api-key');
    if (savedApiKey) {
      chatService.setApiKey(savedApiKey);
      setHasApiKey(true);
    }
  }, []);

  // Add context menu handlers
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      
      if (selectedText && selectedText.length > 0) {
        setContextMenu({
          isVisible: true,
          position: { x: e.clientX, y: e.clientY },
          selectedText
        });
      }
    };

    const handleClick = () => {
      setContextMenu(prev => ({ ...prev, isVisible: false }));
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Simple welcome message
  useEffect(() => {
    if (messages.length === 0 && !interviewsLoading && interviewStats) {
      const welcomeMessage: Message = {
        id: crypto.randomUUID(),
        content: `Welcome to L'Abécédaire de Gilles Deleuze! This system provides insights from ${interviewStats.totalInterviews} complete interviews (${interviewStats.totalWords.toLocaleString()} words) covering philosophical concepts from A to Z.

Ask me about any philosophical concept - desire, assemblages, rhizomes, becoming, multiplicity, or any topic from Deleuze's work. Click the info button above to learn more about the available themes and features.

What would you like to explore?`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, interviewsLoading, interviewStats]);

  const handleSendMessage = async (content: string) => {
    if (!hasApiKey) {
      setIsSettingsOpen(true);
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(messages, content);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      const errorResponse: Message = {
        id: crypto.randomUUID(),
        content: `I apologize, but I cannot respond at the moment: ${errorMessage}`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyChange = (apiKey: string) => {
    if (apiKey) {
      chatService.setApiKey(apiKey);
      setHasApiKey(true);
    } else {
      setHasApiKey(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleCitationClick = (audioFile: string, letter: string) => {
    console.log('Citation clicked:', { audioFile, letter });
    
    // Extract title from filename for display
    let title = audioFile;
    
    // Handle different filename formats
    if (audioFile.includes('_-_')) {
      // Already simplified format like "C_-_Culture.m4a"
      title = audioFile.split('_-_')[1]?.replace(/\.m4a$/, '') || 'Unknown';
    } else {
      // Complex format like "L'Abécédaire de GILLES DELEUZE - C comme Culture (HD).m4a"
      title = audioFile
        .replace(/L'Abécédaire de GILLES DELEUZE\s*-?\s*/, '')
        .replace(/\s*comme\s*/i, '')
        .replace(/\s*\(HD\)/, '')
        .replace(/\.m4a$/, '')
        .replace(/^[A-Z]\s*/, '') // Remove letter prefix
        .trim();
    }
    
    console.log('Opening audio player with:', { audioFile, title, letter });
    
    setAudioPlayer({
      isOpen: true,
      audioFile,
      title: title || 'Unknown',
      letter
    });
  };

  const closeAudioPlayer = () => {
    setAudioPlayer(prev => ({ ...prev, isOpen: false }));
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="min-h-screen bg-deleuze-dark rhizome-bg">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 glass-effect border-b border-deleuze-gray/30"
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className="w-10 h-10 bg-gradient-to-br from-rhizome-purple to-rhizome-blue rounded-xl flex items-center justify-center"
            >
              <Volume2 size={20} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-deleuze-text">
                Bot Without Organs
              </h1>
              <p className="text-sm text-deleuze-muted">
                {interviewsLoading 
                  ? 'Loading interview data...' 
                  : interviewStats 
                    ? `${interviewStats.totalInterviews} interviews • ${interviewStats.totalWords.toLocaleString()} words`
                    : 'A Deleuzian AI exploring L\'Abécédaire'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsInfoOpen(true)}
              className="p-2 hover:bg-deleuze-gray/30 rounded-lg transition-colors"
              title="About L'Abécédaire"
            >
              <Info size={18} className="text-deleuze-muted" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearChat}
              className="p-2 hover:bg-deleuze-gray/30 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <RotateCcw size={18} className="text-deleuze-muted" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-deleuze-gray/30 rounded-lg transition-colors"
              title="Settings"
            >
              <SettingsIcon size={18} className="text-deleuze-muted" />
            </motion.button>
            
            <motion.a
              href="https://github.com/hamedyaghoobian/Bot-Without-Organs"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-deleuze-gray/30 rounded-lg transition-colors"
              title="View on GitHub"
            >
              <Github size={18} className="text-deleuze-muted" />
            </motion.a>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 flex flex-col h-[calc(100vh-80px)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-1">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onCitationClick={handleCitationClick}
            />
          ))}
          
          {isLoading && <TypingIndicator />}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-md p-4 bg-red-900/20 border border-red-800/30 rounded-lg"
            >
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="py-4">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            disabled={!hasApiKey}
          />
          
          {!hasApiKey && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-deleuze-muted text-sm mt-3"
            >
              Please configure your Groq API key in settings to start the conversation
            </motion.p>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onApiKeyChange={handleApiKeyChange}
      />

      {/* Info Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        interviewStats={interviewStats}
      />

      {/* Deleuze Context Menu */}
      <DeleuzeContextMenu
        isVisible={contextMenu.isVisible}
        position={contextMenu.position}
        selectedText={contextMenu.selectedText}
        onClose={closeContextMenu}
      />

      {/* Audio Player */}
      <AudioPlayer
        audioFile={audioPlayer.audioFile}
        title={audioPlayer.title}
        letter={audioPlayer.letter}
        isOpen={audioPlayer.isOpen}
        onClose={closeAudioPlayer}
      />
    </div>
  );
}

export default App; 