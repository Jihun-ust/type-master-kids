import React, { useState, useEffect } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { getRandomText } from '../constants/textPools';
import { decomposeToEnglishKeys, EN_TO_KOR_MAP, getKeystrokeRanges } from '../utils/hangul';

export function TypingTest({ mode, language, bestScore, bestPerfectScore, onUpdateBestScore }) {
  const [originalText, setOriginalText] = useState("");
  const [targetText, setTargetText] = useState("");

  // Initialize or change text when mode switches
  useEffect(() => {
    const text = getRandomText(mode === 'challenge' ? 'paragraph' : 'sentence', language);
    setOriginalText(text);
    setTargetText(language === 'ko' ? decomposeToEnglishKeys(text) : text);
  }, [mode, language]);

  const handleComplete = (stats) => {
    onUpdateBestScore(mode, stats.wpm, stats.accuracy);
  };

  const {
    currentIndex,
    typedResult,
    wpm,
    accuracy,
    timeElapsed,
    isFinished,
    reset
  } = useTypingEngine(targetText, handleComplete);

  const ranges = React.useMemo(() => {
    return language === 'ko' ? getKeystrokeRanges(originalText) : [];
  }, [originalText, language]);

  const handleNext = () => {
    const text = getRandomText(mode === 'challenge' ? 'paragraph' : 'sentence', language);
    setOriginalText(text);
    setTargetText(language === 'ko' ? decomposeToEnglishKeys(text) : text);
    reset();
  };

  // If text hasn't loaded yet
  if (!targetText) return null;

  return (
    <div className="typing-test-container">
      <div className="typing-stats-header">
        <div className="stat-box">
          <span className="stat-label">Speed</span>
          <span className="stat-value">{wpm} <small>WPM</small></span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Accuracy</span>
          <span className="stat-value">{accuracy}%</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Time</span>
          <span className="stat-value">{timeElapsed}s</span>
        </div>
      </div>

      <div className="typing-text-display">
        {language === 'ko' ? (
          ranges.map((range, index) => {
            let className = "char-untyped";
            
            if (currentIndex > range.endIndex) {
              const isCorrect = typedResult.slice(range.startIndex, range.endIndex + 1).every(res => res === 'correct');
              className = isCorrect ? "char-correct" : "char-wrong";
            } else if (currentIndex >= range.startIndex && currentIndex <= range.endIndex && !isFinished) {
              className = "char-current";
            }
            
            return (
              <span key={index} className={`typing-char ${className}`}>
                {range.char}
              </span>
            );
          })
        ) : (
          targetText.split('').map((char, index) => {
            let className = "char-untyped";
            if (index < currentIndex) {
              className = typedResult[index] === 'correct' ? "char-correct" : "char-wrong";
            } else if (index === currentIndex && !isFinished) {
              className = "char-current";
            }

            return (
              <span key={index} className={`typing-char ${className}`}>
                {char}
              </span>
            );
          })
        )}
      </div>

      <aside className="high-scores-badge">
        <h3>🏆 Best Scores</h3>
        <div className="score-item">
          <span className="score-label">Fastest</span>
          <span className="score-val">{bestScore || 0} WPM</span>
        </div>
        <div className="score-item perfect">
          <span className="score-label">Perfect 🌟</span>
          <span className="score-val">{bestPerfectScore || 0} WPM</span>
        </div>
      </aside>

      {isFinished && (
        <div className="typing-result-overlay">
          <div className="typing-result-card">
            <h2>{accuracy === 100 ? "🎉 Perfect!" : "Great Job!"}</h2>
            <p>You typed at <strong>{wpm} WPM</strong> with <strong>{accuracy}%</strong> accuracy!</p>
            
            <div className="best-scores-info">
               <p>Highest Speed: {Math.max(bestScore || 0, wpm)} WPM</p>
               <p>Highest Perfect: {Math.max(bestPerfectScore || 0, accuracy === 100 ? wpm : 0)} WPM</p>
            </div>
            
            <button className="control-btn play-again-btn" onClick={handleNext}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
