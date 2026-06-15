import { useState, useEffect, useCallback } from 'react';
import { CURRICULUM, generateSequence } from '../constants/curriculum';

export const useGameEngine = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakeState, setMistakeState] = useState(false);

  useEffect(() => {
    const levelData = CURRICULUM[currentLevel];
    setSequence(generateSequence(levelData.keys, 10));
    setCurrentIndex(0);
    setMistakeState(false);
  }, [currentLevel]);

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length > 1) return;

    if (mistakeState) {
      setMistakeState(false);
    }

    const targetKey = sequence[currentIndex];
    
    if (e.key === targetKey) {
      if (currentIndex + 1 >= sequence.length) {
        const levelData = CURRICULUM[currentLevel];
        setSequence(generateSequence(levelData.keys, 10));
        setCurrentIndex(0);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } else {
      setMistakeState(true);
    }
  }, [currentIndex, sequence, mistakeState, currentLevel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    currentLevel,
    setCurrentLevel,
    sequence,
    currentIndex,
    mistakeState,
    targetKey: sequence[currentIndex],
    levels: CURRICULUM
  };
};
