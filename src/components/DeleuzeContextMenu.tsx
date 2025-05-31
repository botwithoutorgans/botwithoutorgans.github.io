import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Loader2 } from 'lucide-react';
import { chatService } from '../services/chatService';

interface ContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  selectedText: string;
  onClose: () => void;
}

export const DeleuzeContextMenu: React.FC<ContextMenuProps> = ({
  isVisible,
  position,
  selectedText,
  onClose
}) => {
  const [definition, setDefinition] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchDefinition = useCallback(async () => {
    if (!selectedText.trim()) return;

    setIsLoading(true);
    setError(null);
    setDefinition(null);

    try {
      // Simplified prompt to avoid parsing issues
      const dictionaryPrompt = `Define the term "${selectedText}" in Gilles Deleuze's philosophy.

Please provide:
- A concise definition
- Key context in Deleuze's work
- Related concepts
- Brief example if applicable

Keep the response clear and avoid complex formatting or nested parentheses.`;

      const response = await chatService.sendMessage([], dictionaryPrompt);
      
      // Clean the response to avoid parsing issues
      const cleanedContent = response.content
        .replace(/\*\*/g, '') // Remove markdown bold
        .replace(/\*/g, '') // Remove markdown italic
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .trim();
      
      setDefinition(cleanedContent);
    } catch (err) {
      console.error('Dictionary error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch definition';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedText]);

  useEffect(() => {
    if (isVisible && selectedText) {
      fetchDefinition();
    }
  }, [isVisible, selectedText, fetchDefinition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="fixed z-50 bg-deleuze-dark/95 backdrop-blur-md border border-deleuze-gray/30 rounded-lg shadow-2xl max-w-sm"
        style={{
          left: Math.min(position.x, window.innerWidth - 400),
          top: Math.min(position.y, window.innerHeight - 300),
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-deleuze-gray/30">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-deleuze-accent" />
            <span className="text-sm font-medium text-deleuze-text">Deleuze Dictionary</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-deleuze-gray/30 rounded transition-colors"
          >
            <X size={14} className="text-deleuze-muted" />
          </button>
        </div>

        {/* Selected Text */}
        <div className="p-3 border-b border-deleuze-gray/30">
          <span className="text-xs text-deleuze-muted">Selected:</span>
          <div className="font-medium text-deleuze-accent text-sm mt-1">
            "{selectedText}"
          </div>
        </div>

        {/* Content */}
        <div className="p-3 max-h-64 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center gap-2 text-deleuze-muted">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Consulting Deleuze...</span>
            </div>
          )}

          {error && (
            <div className="text-red-300 text-sm">
              <div className="font-medium mb-1">Error:</div>
              <div className="mb-2">{error}</div>
              <button 
                onClick={fetchDefinition}
                className="px-2 py-1 bg-red-800/30 hover:bg-red-800/50 border border-red-700/50 rounded text-xs transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {definition && (
            <div className="text-deleuze-text text-sm space-y-2">
              {definition.split('\n').map((paragraph, index) => 
                paragraph.trim() && (
                  <p key={index} className="leading-relaxed">
                    {paragraph.trim()}
                  </p>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-deleuze-gray/30 text-xs text-deleuze-muted text-center">
          Right-click any text for Deleuzian definitions
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 