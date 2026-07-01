import React from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { TargetSequence } from './components/TargetSequence';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { TypingTest } from './components/TypingTest';
import { loadProgressFile, createNewSaveFile, saveProgressFile } from './utils/fileSystem';

function App() {
  const [theme, setTheme] = React.useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const [currentMode, setCurrentMode] = React.useState('practice');
  const [bestScores, setBestScores] = React.useState({
    play: { wpm: 0, perfect: 0 },
    challenge: { wpm: 0, perfect: 0 }
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
  } = useGameEngine(currentMode === 'practice');

  const [fileHandle, setFileHandle] = React.useState(null);
  const [userName, setUserName] = React.useState('');

  const handleLoad = async () => {
    const result = await loadProgressFile();
    if (result) {
      setFileHandle(result.fileHandle);
      setUserName(result.data.userName || 'User');
      if (result.data.levelProgress) {
        // Migration logic: convert old number-based progress to arrays
        const migratedProgress = {};
        for (const [key, val] of Object.entries(result.data.levelProgress)) {
          migratedProgress[key] = Array.isArray(val) ? val : Array(val).fill('success');
        }
        setLevelProgress(migratedProgress);
      }
      if (typeof result.data.currentLevel === 'number') {
        setCurrentLevel(result.data.currentLevel);
      }
      if (result.data.bestScores) {
        setBestScores(result.data.bestScores);
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
      const currentStats = prev[mode];
      const newWpm = Math.max(currentStats.wpm, wpm);
      const newPerfect = Math.max(currentStats.perfect, accuracy === 100 ? wpm : 0);
      return {
        ...prev,
        [mode]: { wpm: newWpm, perfect: newPerfect }
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
      });
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
            />
            
            <VirtualKeyboard targetKey={targetKey} />
          </main>
          
          <aside className="level-sidebar">
            <h2>Select Level</h2>
            <div className="level-list">
              {Object.entries(
                levels.reduce((acc, lvl, idx) => {
                  const [groupName, levelName] = lvl.name.split(': ');
                  const group = levelName ? groupName : 'Other';
                  const display = levelName || lvl.name;
                  if (!acc[group]) acc[group] = [];
                  acc[group].push({ ...lvl, originalIndex: idx, display });
                  return acc;
                }, {})
              ).map(([group, groupLevels]) => (
                <div key={group} className="level-group">
                  <h3 className="level-group-title">{group}</h3>
                  <div className="level-group-buttons">
                    {groupLevels.map((lvl) => {
                      const history = levelProgress[lvl.originalIndex];
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
          bestScore={bestScores[currentMode]?.wpm}
          bestPerfectScore={bestScores[currentMode]?.perfect}
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
