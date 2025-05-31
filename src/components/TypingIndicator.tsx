import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-6"
    >
      <div className="flex gap-3 max-w-[85%]">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-rhizome-purple to-rhizome-blue">
          <Bot size={18} className="text-white" />
        </div>

        {/* Typing animation */}
        <div className="message-bubble ai-message">
          <div className="flex items-center gap-2">
            <span className="text-deleuze-muted text-sm">Deleuze is thinking</span>
            <div className="typing-indicator">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="typing-dot"
                  style={{ '--delay': index } as React.CSSProperties}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 