import { useState, useEffect, useCallback } from 'react';
import { CURRICULUM, generateSequence } from '../constants/curriculum';

export const useGameEngine = (isActive = true, language = 'en') => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakeState, setMistakeState] = useState(false);

  // Performance tracking state
  const [mistakesInAttempt, setMistakesInAttempt] = useState(0);
  const [levelProgress, setLevelProgress] = useState({ en: {}, ko: {} });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    const levelData = CURRICULUM[currentLevel];
    setSequence(generateSequence(levelData.keys, 10));
    setCurrentIndex(0);
    setMistakeState(false);
    setMistakesInAttempt(0);
  }, [currentLevel]);

  const handleNextLevel = useCallback(() => {
    setShowSuccessModal(false);
    if (currentLevel + 1 < CURRICULUM.length) {
      setCurrentLevel((prev) => prev + 1);
    }
  }, [currentLevel]);

  const handleKeyDown = useCallback((e) => {
    if (!isActive) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    
    // Prevent default scrolling when space is pressed
    if (e.key === ' ') {
      e.preventDefault();
    }
    
    if (e.key.length > 1) return;

    if (mistakeState) {
      setMistakeState(false);
    }

    const targetKey = sequence[currentIndex];
    
    if (e.key === targetKey) {
      if (currentIndex + 1 >= sequence.length) {
        // Sequence completed! Evaluate accuracy
        const result = mistakesInAttempt < 2 ? 'success' : 'fail';
        
        setLevelProgress((prev) => {
          const currentLanguageProgress = prev[language] || {};
          const currentProgress = currentLanguageProgress[currentLevel] || [];
          
          const history = Array.isArray(currentProgress) ? currentProgress : Array(currentProgress).fill('success');
          
          const newHistory = [...history, result];
          const lastThree = newHistory.slice(-3);
          
          if (lastThree.length === 3 && lastThree.every(r => r === 'success') && history.length < newHistory.length) {
             const oldLastThree = history.slice(-3);
             const oldWasSuccess = oldLastThree.length === 3 && oldLastThree.every(r => r === 'success');
             if (!oldWasSuccess) {
               setShowSuccessModal(true);
             }
          }
          return {
            ...prev,
            [language]: {
              ...currentLanguageProgress,
              [currentLevel]: lastThree
            }
          };
        });
        
        const levelData = CURRICULUM[currentLevel];
        setSequence(generateSequence(levelData.keys, 10));
        setCurrentIndex(0);
        setMistakesInAttempt(0);
        setAttemptCount(prev => prev + 1);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } else {
      setMistakeState(true);
      setMistakesInAttempt((prev) => prev + 1);
    }
  }, [isActive, language, currentIndex, sequence, mistakeState, currentLevel, mistakesInAttempt]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentScore = sequence.length > 0 ? {
    correct: Math.max(0, sequence.length - mistakesInAttempt),
    total: sequence.length
  } : null;

  return {
    currentLevel,
    setCurrentLevel,
    sequence,
    currentIndex,
    mistakeState,
    targetKey: sequence[currentIndex],
    levels: CURRICULUM,
    levelProgress,
    setLevelProgress,
    showSuccessModal,
    handleNextLevel,
    currentScore,
    attemptCount
  };
};
