import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewStats?: {
    totalInterviews: number;
    totalWords: number;
  };
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  interviewStats
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Info Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 sm:inset-6 md:inset-8 xl:inset-16 2xl:inset-24 max-w-4xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] md:max-h-[calc(100vh-4rem)] xl:max-h-[calc(100vh-8rem)] 2xl:max-h-[calc(100vh-12rem)] mx-auto my-auto glass-effect rounded-2xl border z-50 flex flex-col overflow-hidden"
            style={{ 
              top: '1rem', 
              left: '50%', 
              transform: 'translateX(-50%)',
              width: 'calc(100% - 2rem)',
              maxWidth: '48rem'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-deleuze-gray/30 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-deleuze-accent rounded-full flex items-center justify-center">
                  <Info size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-deleuze-text">About Bot Without Organs</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-deleuze-gray/30 rounded-lg transition-colors"
              >
                <X size={20} className="text-deleuze-muted" />
              </button>
            </div>

            <div className="space-y-6 text-deleuze-text p-6 overflow-y-auto flex-1">
              {/* About Section */}
              <div>
                <h3 className="font-semibold text-deleuze-accent mb-2">About the Bot</h3>
                <p className="text-sm leading-relaxed text-deleuze-muted">
                  Bot Without Organs is an AI exploration of Gilles Deleuze's L'Abécédaire interviews. 
                  Like Deleuze & Guattari's "Body without Organs," this bot operates as a field of 
                  pure potential, connecting concepts across the 26 philosophical themes from A to Z. 
                  Originally produced by Pierre-André Boutang (1988–1989), these interviews between 
                  Deleuze and Claire Parnet form the foundation for philosophical dialogue.
                </p>
              </div>

              {/* Themes */}
              <div>
                <h3 className="font-semibold text-deleuze-accent mb-3">Available Themes (A-Z)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {[
                    { letter: 'A', theme: 'Animal' },
                    { letter: 'B', theme: 'Boisson (Drink)' },
                    { letter: 'C', theme: 'Culture' },
                    { letter: 'D', theme: 'Désir (Desire)' },
                    { letter: 'E', theme: 'Enfance (Childhood)' },
                    { letter: 'F', theme: 'Fidélité (Loyalty)' },
                    { letter: 'G', theme: 'Gauche (Left-wing politics)' },
                    { letter: 'H', theme: 'Histoire de la Philosophie (History of philosophy)' },
                    { letter: 'I', theme: 'Idée (Idea)' },
                    { letter: 'J', theme: 'Joie (Joy)' },
                    { letter: 'K', theme: 'Kant' },
                    { letter: 'L', theme: 'Littérature (Literature)' },
                    { letter: 'M', theme: 'Maladie (Disease)' },
                    { letter: 'N', theme: 'Neurologie (Neurology)' },
                    { letter: 'O', theme: 'Opéra (Opera)' },
                    { letter: 'P', theme: 'Professeur (Professor)' },
                    { letter: 'Q', theme: 'Question' },
                    { letter: 'R', theme: 'Résistance (Resistance)' },
                    { letter: 'S', theme: 'Style' },
                    { letter: 'T', theme: 'Tennis' },
                    { letter: 'U', theme: 'Un (One)' },
                    { letter: 'V', theme: 'Voyage (Travel)' },
                    { letter: 'W', theme: 'Wittgenstein' },
                    { letter: 'X', theme: 'Inconnues (Variables)' },
                    { letter: 'Y', theme: 'Inconnues (Variables)' },
                    { letter: 'Z', theme: 'Zig-zag' }
                  ].map(({ letter, theme }) => (
                    <div key={letter} className="flex items-center gap-2 text-deleuze-muted">
                      <span className="w-6 h-6 bg-deleuze-accent/20 rounded text-deleuze-accent text-xs font-bold flex items-center justify-center">
                        {letter}
                      </span>
                      <span>{theme}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              {interviewStats && (
                <div>
                  <h3 className="font-semibold text-deleuze-accent mb-2">Content Overview</h3>
                  <div className="bg-deleuze-charcoal/50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-deleuze-accent">{interviewStats.totalInterviews}</div>
                        <div className="text-xs text-deleuze-muted">Complete Interviews</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-deleuze-accent">{interviewStats.totalWords.toLocaleString()}</div>
                        <div className="text-xs text-deleuze-muted">Total Words</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div>
                <h3 className="font-semibold text-deleuze-accent mb-2">Features</h3>
                <ul className="space-y-1 text-sm text-deleuze-muted">
                  <li>• Click audio citations to hear original French interviews</li>
                  <li>• Right-click any text for Deleuzian concept definitions</li>
                  <li>• Ask about philosophical concepts and get insights from the interviews</li>
                  <li>• Explore connections between different themes and ideas</li>
                </ul>
              </div>

              {/* Attribution */}
              <div className="pt-4 border-t border-deleuze-gray/30">
                <p className="text-xs text-deleuze-muted text-center">
                  Made by{' '}
                  <a 
                    href="https://hamedyaghoobian.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-deleuze-accent hover:text-rhizome-blue transition-colors"
                  >
                    Hamed Yaghoobian
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 