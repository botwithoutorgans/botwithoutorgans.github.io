import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const PHILOSOPHICAL_PLACEHOLDERS = [
  "Ask about desire and the machines of the unconscious...",
  "Explore the concept of rhizome and multiplicity...",
  "Discuss the relationship between art and philosophy...",
  "Question the nature of becoming and difference...",
  "Inquire about joy, affects, and Spinoza's ethics...",
  "What is an assemblage? How does it function?",
  "Tell me about your encounters with other philosophers...",
  "How does philosophy relate to life and politics?",
];

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [placeholder, setPlaceholder] = useState(PHILOSOPHICAL_PLACEHOLDERS[0]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cycle through placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(prev => {
        const currentIndex = PHILOSOPHICAL_PLACEHOLDERS.indexOf(prev);
        const nextIndex = (currentIndex + 1) % PHILOSOPHICAL_PLACEHOLDERS.length;
        return PHILOSOPHICAL_PLACEHOLDERS[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="flex items-end gap-3 p-4 glass-effect rounded-2xl border"
    >
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="w-full resize-none bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-deleuze-muted text-deleuze-text font-serif leading-relaxed min-h-[20px] max-h-32 scrollbar-thin scrollbar-thumb-deleuze-gray scrollbar-track-transparent"
          style={{ fontSize: '16px' }} // Prevent zoom on iOS
        />
      </div>
      
      <motion.button
        type="submit"
        disabled={!message.trim() || isLoading || disabled}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.05 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
        className={`flex-shrink-0 p-3 rounded-xl transition-all duration-200 ${
          message.trim() && !isLoading && !disabled
            ? 'bg-deleuze-accent hover:bg-deleuze-accent/90 text-white shadow-lg shadow-deleuze-accent/25'
            : 'bg-deleuze-gray/50 text-deleuze-muted cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Send size={18} />
        )}
      </motion.button>
    </motion.form>
  );
}; 