import React from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { TargetSequence } from './components/TargetSequence';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { TypingTest } from './components/TypingTest';
import { loadProgressFile, createNewSaveFile, saveProgressFile } from './utils/fileSystem';
import { EN_TO_KOR_MAP } from './utils/hangul';

const translateLevelName = (name, language) => {
  if (language === 'en') return name;
  
  let translated = name;
  translated = translated.replace('Top-Home Combo', '윗글쇠-기본 자리 혼합');
  translated = translated.replace('Bottom-Home Combo', '아래글쇠-기본 자리 혼합');
  translated = translated.replace('Top-Bottom Combo', '윗글쇠-아래글쇠 혼합');
  translated = translated.replace('Home Row Full', '기본 자리 전체');
  translated = translated.replace('Top Row Full', '윗글쇠 자리 전체');
  translated = translated.replace('Bottom Row Full', '아래글쇠 자리 전체');
  translated = translated.replace('Home Row', '기본 자리');
  translated = translated.replace('Top Row', '윗글쇠 자리');
  translated = translated.replace('Bottom Row', '아래글쇠 자리');
  translated = translated.replace('All Rows', '전체 자리');
  translated = translated.replace('Space', '띄어쓰기');
  translated = translated.replace('Left Top, Right Home', '왼손 윗글쇠, 오른손 기본 자리');
  translated = translated.replace('Left Home, Right Top', '왼손 기본 자리, 오른손 윗글쇠');
  translated = translated.replace('All Keys Top and Home', '윗글쇠, 기본 자리 전체');
  translated = translated.replace('Left Bottom, Right Home', '왼손 아래글쇠, 오른손 기본 자리');
  translated = translated.replace('Left Home, Right Bottom', '왼손 기본 자리, 오른손 아래글쇠');
  translated = translated.replace('All Keys Bottom and Home', '아래글쇠, 기본 자리 전체');
  translated = translated.replace('Left Bottom, Right Top', '왼손 아래글쇠, 오른손 윗글쇠');
  translated = translated.replace('Left Top, Right Bottom', '왼손 윗글쇠, 오른손 아래글쇠');
  translated = translated.replace('All Keys Top, Home and Bottom', '전체 자리');

  // Replace single uppercase English characters with mapped Korean characters
  translated = translated.replace(/[A-Z]/g, match => EN_TO_KOR_MAP[match.toLowerCase()] || match);

  return translated;
};

function App() {
  const [theme, setTheme] = React.useState('light');
  const [language, setLanguage] = React.useState('en');



  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ko' : 'en');
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const [currentMode, setCurrentMode] = React.useState('practice');
  const [bestScores, setBestScores] = React.useState({
    en: { play: { wpm: 0, perfect: 0 }, challenge: { wpm: 0, perfect: 0 } },
    ko: { play: { wpm: 0, perfect: 0 }, challenge: { wpm: 0, perfect: 0 } }
  });

  const {
    currentLevel,
    setCurrentLevel,
    sequence,
    currentIndex,
    mistakeState,
    targetKey,
    levels,
    levelProgress,
    setLevelProgress,
    showSuccessModal,
    handleNextLevel,
    currentScore,
    attemptCount
  } = useGameEngine(currentMode === 'practice', language);

  const [fileHandle, setFileHandle] = React.useState(null);
  const [userName, setUserName] = React.useState('');

  const handleLoad = async () => {
    const result = await loadProgressFile();
    if (result) {
      setFileHandle(result.fileHandle);
      setUserName(result.data.userName || 'User');
      if (result.data.levelProgress) {
        let migratedProgress = { en: {}, ko: {} };
        if (result.data.levelProgress.en || result.data.levelProgress.ko) {
          migratedProgress = { ...migratedProgress, ...result.data.levelProgress };
        } else {
          for (const [key, val] of Object.entries(result.data.levelProgress)) {
            migratedProgress.en[key] = Array.isArray(val) ? val : Array(val).fill('success');
          }
        }
        setLevelProgress(migratedProgress);
      }
      if (typeof result.data.currentLevel === 'number') {
        setCurrentLevel(result.data.currentLevel);
      }
      if (result.data.bestScores) {
        let migratedScores = {
          en: { play: { wpm: 0, perfect: 0 }, challenge: { wpm: 0, perfect: 0 } },
          ko: { play: { wpm: 0, perfect: 0 }, challenge: { wpm: 0, perfect: 0 } }
        };
        if (result.data.bestScores.en || result.data.bestScores.ko) {
          migratedScores = { ...migratedScores, ...result.data.bestScores };
        } else {
          migratedScores.en = result.data.bestScores;
        }
        setBestScores(migratedScores);
      }
    }
  };

  const handleSave = async () => {
    let handle = fileHandle;
    let name = userName;
    
    if (!handle) {
      name = window.prompt("Enter your name to save progress:", "Player");
      if (!name) return; // User cancelled
      
      handle = await createNewSaveFile(name);
      if (!handle) return; // Save picker cancelled
      
      setFileHandle(handle);
      setUserName(name);
    }
    
    await saveProgressFile(handle, {
      userName: name,
      currentLevel,
      levelProgress,
      bestScores
    });
  };

  const handleUpdateBestScore = (mode, wpm, accuracy) => {
    setBestScores(prev => {
      const languageStats = prev[language] || { play: { wpm: 0, perfect: 0 }, challenge: { wpm: 0, perfect: 0 } };
      const currentStats = languageStats[mode] || { wpm: 0, perfect: 0 };
      const newWpm = Math.max(currentStats.wpm, wpm);
      const newPerfect = Math.max(currentStats.perfect, accuracy === 100 ? wpm : 0);
      return {
        ...prev,
        [language]: {
          ...languageStats,
          [mode]: { wpm: newWpm, perfect: newPerfect }
        }
      };
    });
  };

  // Auto-save effect
  React.useEffect(() => {
    // Auto-save when attemptCount changes, IF we have a file handle
    if (fileHandle && attemptCount > 0) {
      saveProgressFile(fileHandle, {
        userName,
        currentLevel,
        levelProgress,
        bestScores
      }, true);
    }
  }, [attemptCount, currentLevel, levelProgress, bestScores, fileHandle, userName]);

  return (
    <div className="game-container">
      <header className="header">
        <div className="header-left">
          <h1>Tappy Typers</h1>
          <div className="mode-tabs">
            <button className={`mode-tab ${currentMode === 'practice' ? 'active' : ''}`} onClick={() => setCurrentMode('practice')}>Practice</button>
            <button className={`mode-tab ${currentMode === 'play' ? 'active' : ''}`} onClick={() => setCurrentMode('play')}>Play</button>
            <button className={`mode-tab ${currentMode === 'challenge' ? 'active' : ''}`} onClick={() => setCurrentMode('challenge')}>Challenge</button>
          </div>
        </div>
        <div className="header-controls">
          {userName && <span className="user-name">👤 {userName}</span>}
          <button className="control-btn" onClick={handleLoad}>📂 Load</button>
          <button className="control-btn" onClick={handleSave}>💾 Save</button>
          <button className="theme-toggle control-btn" onClick={toggleLanguage}>
            {language === 'en' ? '🇺🇸 EN' : '🇰🇷 KO'}
          </button>
          <button className="theme-toggle control-btn" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </header>
      
      {currentMode === 'practice' ? (
        <div className="main-content">
          <main className="game-board">
            <div className={`performance-banner ${currentScore ? 'visible' : ''}`}>
              {currentScore 
                ? `Score: ${currentScore.correct}/${currentScore.total}` 
                : 'Score: --'}
            </div>
            <TargetSequence 
              sequence={sequence} 
              currentIndex={currentIndex} 
              mistakeState={mistakeState} 
              language={language}
            />
            
            <VirtualKeyboard targetKey={targetKey} language={language} />
          </main>
          
          <aside className="level-sidebar">
            <h2>Select Level</h2>
            <div className="level-list">
              {Object.entries(
                levels.reduce((acc, lvl, idx) => {
                  const [groupName, levelName] = lvl.name.split(': ');
                  const group = levelName ? groupName : 'Other';
                  const display = levelName || lvl.name;
                  
                  const translatedGroup = translateLevelName(group, language);
                  const translatedDisplay = translateLevelName(display, language);
                  
                  if (!acc[translatedGroup]) acc[translatedGroup] = [];
                  acc[translatedGroup].push({ ...lvl, originalIndex: idx, display: translatedDisplay });
                  return acc;
                }, {})
              ).map(([group, groupLevels]) => (
                <div key={group} className="level-group">
                  <h3 className="level-group-title">{group}</h3>
                  <div className="level-group-buttons">
                    {groupLevels.map((lvl) => {
                      const history = levelProgress[language]?.[lvl.originalIndex] || [];
                      const safeHistory = Array.isArray(history) ? history : Array(history || 0).fill('success');
                      const lastThree = safeHistory.slice(-3);
                      return (
                        <button 
                          key={lvl.id} 
                          className={`level-btn ${currentLevel === lvl.originalIndex ? 'active' : ''}`}
                          onClick={() => setCurrentLevel(lvl.originalIndex)}
                        >
                          <span className="level-name">{lvl.display}</span>
                          {lastThree.length > 0 && (
                            <span className="level-checks">
                              {lastThree.map((res, i) => (
                                <span key={i} title={res}>{res === 'success' ? '✅' : '❌'}</span>
                              ))}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      ) : (
        <TypingTest 
          mode={currentMode}
          language={language}
          bestScore={bestScores[language]?.[currentMode]?.wpm}
          bestPerfectScore={bestScores[language]?.[currentMode]?.perfect}
          onUpdateBestScore={handleUpdateBestScore}
        />
      )}

      {showSuccessModal && currentMode === 'practice' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>🎉 Level Complete!</h2>
            <p>You've mastered this level. Keep up the great work!</p>
            <button className="modal-btn" onClick={handleNextLevel}>
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
