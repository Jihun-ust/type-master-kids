import { useState, useEffect, useCallback } from 'react';

export const useTypingEngine = (targetText, onComplete) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedResult, setTypedResult] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const handleKeyDown = useCallback((e) => {
    if (currentIndex >= targetText.length || endTime) return;

    // Ignore modifiers and non-character keys (like Shift, CapsLock, Tab, etc.)
    if (e.key.length !== 1) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    const expectedChar = targetText[currentIndex];
    const isCorrect = e.key === expectedChar;

    const newTypedResult = [...typedResult, isCorrect ? 'correct' : 'wrong'];
    setTypedResult(newTypedResult);
    
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);

    if (newIndex >= targetText.length) {
      const finishTime = Date.now();
      setEndTime(finishTime);
      
      const elapsedMinutes = (finishTime - (startTime || finishTime)) / 60000;
      const correctCount = newTypedResult.filter(r => r === 'correct').length;
      const finalWpm = Math.round((correctCount / 5) / (elapsedMinutes || 1));
      const finalAccuracy = Math.round((correctCount / newTypedResult.length) * 100) || 0;
      
      if (onComplete) {
        onComplete({
          wpm: finalWpm,
          accuracy: finalAccuracy,
          timeElapsed: Math.floor((finishTime - (startTime || finishTime)) / 1000)
        });
      }
    }
  }, [currentIndex, targetText, startTime, endTime, typedResult, onComplete]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Real-time stats update
  useEffect(() => {
    let interval;
    if (startTime && !endTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsedMinutes = (now - startTime) / 60000;
        const correctCount = typedResult.filter(r => r === 'correct').length;
        const currentWpm = Math.round((correctCount / 5) / elapsedMinutes);
        const currentAccuracy = Math.round((correctCount / typedResult.length) * 100) || 100;
        
        setWpm(currentWpm);
        setAccuracy(currentAccuracy);
        setTimeElapsed(Math.floor((now - startTime) / 1000));
      }, 500);
    } else if (endTime && startTime) {
       const elapsedMinutes = (endTime - startTime) / 60000;
       const correctCount = typedResult.filter(r => r === 'correct').length;
       const currentWpm = Math.round((correctCount / 5) / elapsedMinutes);
       const currentAccuracy = Math.round((correctCount / typedResult.length) * 100) || 100;
       
       setWpm(currentWpm);
       setAccuracy(currentAccuracy);
       setTimeElapsed(Math.floor((endTime - startTime) / 1000));
    }
    return () => clearInterval(interval);
  }, [startTime, endTime, typedResult]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setTypedResult([]);
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);
    setTimeElapsed(0);
  }, []);

  return {
    targetText,
    currentIndex,
    typedResult,
    wpm,
    accuracy,
    timeElapsed,
    isFinished: !!endTime,
    reset
  };
};
