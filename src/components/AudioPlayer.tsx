import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, X, SkipBack, SkipForward } from 'lucide-react';

interface AudioPlayerProps {
  audioFile: string;
  title: string;
  letter: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioFile,
  title,
  letter,
  isOpen,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Audio URL - handle both local and GitHub Pages deployment
  const getAudioUrl = () => {
    const publicUrl = process.env.PUBLIC_URL || '';
    // For GitHub Pages deployment, always use PUBLIC_URL
    if (publicUrl) {
      return `${publicUrl}/audio/${audioFile}`;
    }
    // For local development, use relative path
    return `/audio/${audioFile}`;
  };
  
  const audioUrl = getAudioUrl();
  console.log('AudioPlayer: Loading audio from:', audioUrl);

  // Reset everything when modal closes
  useEffect(() => {
    if (!isOpen) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen]);

  // Simple event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isOpen) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setError(`Could not load audio: ${audioFile}`);
      setIsLoading(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // Load the audio
    audio.src = audioUrl;
    audio.load();

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, isOpen, audioFile]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        setError(`Playback failed: ${error.message}`);
      });
    }
  }, [isPlaying, isLoading]);

  const seekTo = useCallback((percentage: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (percentage / 100) * duration;
  }, [duration]);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  }, [duration]);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

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

          {/* Audio Player Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed max-w-md glass-effect rounded-2xl border z-50 p-6 flex flex-col overflow-hidden"
            style={{ 
              top: '2rem', 
              left: '50%', 
              transform: 'translateX(-50%)',
              width: 'calc(100% - 2rem)',
              maxWidth: '28rem',
              maxHeight: 'calc(100vh - 4rem)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-deleuze-accent rounded-full flex items-center justify-center text-white font-bold">
                  {letter}
                </div>
                <div>
                  <h3 className="font-semibold text-deleuze-text">{letter} comme {title}</h3>
                  <p className="text-xs text-deleuze-muted">L'Abécédaire Interview</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-deleuze-gray/30 rounded-lg transition-colors"
              >
                <X size={20} className="text-deleuze-muted" />
              </button>
            </div>

            {/* Simple Audio Element */}
            <audio ref={audioRef} preload="none" />

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
                <button 
                  onClick={() => {
                    setError(null);
                    const audio = audioRef.current;
                    if (audio) {
                      audio.src = audioUrl;
                      audio.load();
                    }
                  }}
                  className="text-red-200 text-xs underline mt-2"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-deleuze-muted mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div 
                className="w-full h-2 bg-deleuze-gray/30 rounded-full cursor-pointer"
                onClick={(e) => {
                  if (duration > 0) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                    seekTo(percentage);
                  }
                }}
              >
                <div 
                  className="h-full bg-deleuze-accent rounded-full transition-all duration-100"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => skip(-15)}
                disabled={isLoading || !duration}
                className="p-2 hover:bg-deleuze-gray/30 disabled:opacity-50 rounded-lg transition-colors"
                title="Skip back 15s"
              >
                <SkipBack size={20} className="text-deleuze-muted" />
              </button>

              <button
                onClick={togglePlayPause}
                disabled={isLoading}
                className="w-12 h-12 bg-deleuze-accent hover:bg-deleuze-accent/90 disabled:bg-deleuze-gray/50 rounded-full flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause size={24} className="text-white" />
                ) : (
                  <Play size={24} className="text-white ml-1" />
                )}
              </button>

              <button
                onClick={() => skip(15)}
                disabled={isLoading || !duration}
                className="p-2 hover:bg-deleuze-gray/30 disabled:opacity-50 rounded-lg transition-colors"
                title="Skip forward 15s"
              >
                <SkipForward size={20} className="text-deleuze-muted" />
              </button>
            </div>

            {/* Audio Info */}
            <div className="mt-4 pt-4 border-t border-deleuze-gray/30">
              <div className="flex items-center gap-2 text-xs text-deleuze-muted">
                <Volume2 size={12} />
                <span>French audio from L'Abécédaire de Gilles Deleuze</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 