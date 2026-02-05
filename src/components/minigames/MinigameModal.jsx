import { useState, useEffect } from 'react';
import MemoryMinigame from './MemoryMinigame';
import QuizMinigame from './QuizMinigame';
import SortingMinigame from './SortingMinigame';

const MINIGAME_TIME_LIMIT = 60; // 60 seconds

export default function MinigameModal({ 
  isOpen, 
  onSuccess, 
  onFail,
  timeLimit = MINIGAME_TIME_LIMIT
}) {
  const [currentMinigameId] = useState(() => {
    const availableMinigames = ['memory', 'quiz', 'sorting'];
    return availableMinigames[Math.floor(Math.random() * availableMinigames.length)];
  });
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  // Timer effect
  useEffect(() => {
    if (!isOpen) return;

    // Reset time when modal opens
    let currentTime = timeLimit;
    setTimeLeft(currentTime);

    const timer = setInterval(() => {
      currentTime -= 1;
      if (currentTime <= 0) {
        onFail();
        setTimeLeft(0);
      } else {
        setTimeLeft(currentTime);
      }
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, timeLimit]);

  if (!isOpen) return null;

  const handleComplete = () => {
    onSuccess();
  };

  const handleGiveUp = () => {
    onFail();
  };

  const renderMinigame = () => {
    switch (currentMinigameId) {
      case 'memory':
        return <MemoryMinigame onComplete={handleComplete} />;
      case 'quiz':
        return <QuizMinigame onComplete={handleComplete} />;
      case 'sorting':
        return <SortingMinigame onComplete={handleComplete} />;
      default:
        return <MemoryMinigame onComplete={handleComplete} />;
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isWarning = timeLeft <= 15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay - prevent closing by clicking outside */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="game-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                🎮 Minigame Challenge!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Voltooi de minigame binnen 1 minuut om een tweede kans te krijgen
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-center gap-3 ${
            isWarning 
              ? 'bg-destructive/10 border-2 border-destructive/40' 
              : 'bg-primary/10 border-2 border-primary/40'
          }`}>
            <span className="text-2xl">{isWarning ? '⏰' : '⏱️'}</span>
            <span className={`font-mono font-bold text-2xl ${
              isWarning ? 'text-destructive' : 'text-primary'
            }`}>
              {timeDisplay}
            </span>
          </div>

          {/* Game Content */}
          <div className="min-h-[300px] mb-6">
            {renderMinigame()}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                💡 Lukt het je om de minigame af te ronden?
              </p>
              <button
                onClick={handleGiveUp}
                className="px-4 py-2 text-sm text-foreground bg-muted hover:bg-muted/70 rounded-lg transition-colors"
              >
                Opgeven
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
