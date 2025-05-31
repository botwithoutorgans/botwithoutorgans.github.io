import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, X, Key, Info, ExternalLink, Bot, ChevronDown } from 'lucide-react';
import { chatService, GROQ_MODELS } from '../services/chatService';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyChange: (apiKey: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  isOpen, 
  onClose, 
  onApiKeyChange 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  useEffect(() => {
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('groq-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
    }

    // Load selected model
    const savedModel = localStorage.getItem('groq-model');
    if (savedModel) {
      setSelectedModel(savedModel);
      chatService.setModel(savedModel);
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    localStorage.setItem('groq-api-key', apiKey);
    onApiKeyChange(apiKey);
    onClose();
  };

  const handleClearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('groq-api-key');
    onApiKeyChange('');
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem('groq-model', modelId);
    chatService.setModel(modelId);
    setIsModelDropdownOpen(false);
  };

  const getCurrentModelInfo = () => {
    const allModels = [...GROQ_MODELS.production, ...GROQ_MODELS.preview];
    return allModels.find(model => model.id === selectedModel);
  };

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 sm:inset-6 md:inset-8 xl:inset-16 2xl:inset-24 max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] md:max-h-[calc(100vh-4rem)] xl:max-h-[calc(100vh-8rem)] 2xl:max-h-[calc(100vh-12rem)] mx-auto my-auto glass-effect rounded-2xl border z-50 flex flex-col overflow-hidden"
            style={{ 
              top: '1rem', 
              left: '50%', 
              transform: 'translateX(-50%)',
              width: 'calc(100% - 2rem)',
              maxWidth: '32rem'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-deleuze-gray/30 flex-shrink-0">
              <div className="flex items-center gap-3">
                <SettingsIcon size={24} className="text-deleuze-accent" />
                <h2 className="text-xl font-semibold text-deleuze-text">Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-deleuze-gray/30 rounded-lg transition-colors"
              >
                <X size={20} className="text-deleuze-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Model Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bot size={18} className="text-rhizome-purple" />
                  <h3 className="font-medium text-deleuze-text">AI Model</h3>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 bg-deleuze-gray/30 border border-deleuze-gray/50 rounded-lg hover:bg-deleuze-gray/40 transition-colors"
                  >
                    <div className="text-left">
                      <div className="text-deleuze-text font-medium">
                        {getCurrentModelInfo()?.name || selectedModel}
                      </div>
                      <div className="text-sm text-deleuze-muted">
                        {getCurrentModelInfo()?.description || 'Custom model'}
                      </div>
                    </div>
                    <ChevronDown 
                      size={20} 
                      className={`text-deleuze-muted transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isModelDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-deleuze-charcoal border border-deleuze-gray/50 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto"
                      >
                        {/* Production Models */}
                        <div className="p-3 border-b border-deleuze-gray/30">
                          <div className="text-xs font-semibold text-rhizome-green uppercase tracking-wide mb-2">
                            Production Models
                          </div>
                          {GROQ_MODELS.production.map((model) => (
                            <button
                              key={model.id}
                              onClick={() => handleModelChange(model.id)}
                              className={`w-full text-left p-2 rounded-md transition-colors ${
                                selectedModel === model.id
                                  ? 'bg-deleuze-accent/20 text-deleuze-accent'
                                  : 'hover:bg-deleuze-gray/30 text-deleuze-text'
                              }`}
                            >
                              <div className="font-medium text-sm">{model.name}</div>
                              <div className="text-xs text-deleuze-muted">{model.description}</div>
                            </button>
                          ))}
                        </div>

                        {/* Preview Models */}
                        <div className="p-3">
                          <div className="text-xs font-semibold text-rhizome-orange uppercase tracking-wide mb-2">
                            Preview Models
                          </div>
                          {GROQ_MODELS.preview.map((model) => (
                            <button
                              key={model.id}
                              onClick={() => handleModelChange(model.id)}
                              className={`w-full text-left p-2 rounded-md transition-colors ${
                                selectedModel === model.id
                                  ? 'bg-deleuze-accent/20 text-deleuze-accent'
                                  : 'hover:bg-deleuze-gray/30 text-deleuze-text'
                              }`}
                            >
                              <div className="font-medium text-sm">{model.name}</div>
                              <div className="text-xs text-deleuze-muted">{model.description}</div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* API Key Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Key size={18} className="text-rhizome-blue" />
                  <h3 className="font-medium text-deleuze-text">Groq API Key</h3>
                </div>
                
                <div className="bg-deleuze-charcoal/50 p-4 rounded-lg border border-deleuze-gray/30">
                  <div className="flex items-start gap-2 mb-3">
                    <Info size={16} className="text-rhizome-orange flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-deleuze-muted leading-relaxed">
                      <p>To use this chatbot, you need a Groq API key. Get one for free at:</p>
                      <a 
                        href="https://console.groq.com/keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-rhizome-blue hover:text-rhizome-purple transition-colors mt-1"
                      >
                        console.groq.com/keys
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Groq API key..."
                        className="w-full px-3 py-2 bg-deleuze-gray/30 border border-deleuze-gray/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-deleuze-accent focus:border-transparent text-deleuze-text placeholder-deleuze-muted"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-deleuze-muted hover:text-deleuze-text transition-colors text-sm"
                      >
                        {showKey ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveApiKey}
                        disabled={!apiKey.trim()}
                        className="flex-1 px-4 py-2 bg-deleuze-accent hover:bg-deleuze-accent/90 disabled:bg-deleuze-gray/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                      >
                        Save Settings
                      </button>
                      {apiKey && (
                        <button
                          onClick={handleClearApiKey}
                          className="px-4 py-2 border border-deleuze-gray/50 hover:bg-deleuze-gray/30 text-deleuze-text rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="space-y-3">
                <h3 className="font-medium text-deleuze-text">About This Project</h3>
                <div className="text-sm text-deleuze-muted leading-relaxed space-y-2">
                  <p>
                    This chatbot is based on Gilles Deleuze's famous L'Abécédaire interviews, 
                    where he discussed philosophical concepts from A to Z with Claire Parnet.
                  </p>
                  <p>
                    The AI draws on transcripts from these interviews to engage in philosophical 
                    dialogue in the spirit of Deleuze's thought, exploring concepts like rhizomes, 
                    assemblages, becoming, and difference.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 