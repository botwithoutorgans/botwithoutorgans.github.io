import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Volume2, ExternalLink } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onCitationClick: (audioFile: string, letter: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onCitationClick 
}) => {
  const isUser = message.role === 'user';

  // Debug output for citations
  React.useEffect(() => {
    if (message.citations && message.citations.length > 0) {
      console.log(`Generated ${message.citations.length} citations for response:`, message.citations);
    }
  }, [message.citations]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-deleuze-accent' 
            : 'bg-gradient-to-br from-rhizome-purple to-rhizome-blue'
        }`}>
          {isUser ? (
            <User size={18} className="text-white" />
          ) : (
            <Bot size={18} className="text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`message-bubble ${isUser ? 'user-message' : 'ai-message'}`}>
          <div className="whitespace-pre-wrap">
            {message.content}
          </div>
          
          {message.citations && message.citations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-4 pt-3 border-t border-deleuze-gray/20"
            >
              <div className="text-xs text-deleuze-muted mb-2 flex items-center gap-1">
                <Volume2 size={12} />
                Sources from L'Abécédaire interviews:
              </div>
              <div className="space-y-2">
                {message.citations.map((citation, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => onCitationClick(citation.audioFile, citation.letter)}
                    className="citation-link w-full text-left"
                  >
                    <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-deleuze-gray/20 transition-colors">
                      <div className="flex-shrink-0 w-6 h-6 bg-deleuze-accent/20 rounded-full flex items-center justify-center text-xs font-semibold text-deleuze-accent">
                        {citation.letter}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {citation.letter} comme {citation.title}
                        </div>
                        <div className="text-xs text-deleuze-muted mt-1 line-clamp-2">
                          "{citation.excerpt}"
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-deleuze-muted">
                            Confidence: {Math.round(citation.confidence * 100)}%
                          </span>
                          <ExternalLink size={10} className="text-deleuze-muted" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          
          <div className="text-xs text-deleuze-muted mt-2">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 