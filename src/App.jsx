import React from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { TargetSequence } from './components/TargetSequence';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { loadProgressFile, createNewSaveFile, saveProgressFile } from './utils/fileSystem';

function App() {
  const [theme, setTheme] = React.useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
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
  } = useGameEngine();

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
      levelProgress
    });
  };

  React.useEffect(() => {
    // Auto-save when attemptCount changes, IF we have a file handle
    if (fileHandle && attemptCount > 0) {
      saveProgressFile(fileHandle, {
        userName,
        currentLevel,
        levelProgress
      });
    }
  }, [attemptCount, currentLevel, levelProgress, fileHandle, userName]);

  return (
    <div className="game-container">
      <header className="header">
        <h1>Tappy Typers</h1>
        <div className="header-controls">
          {userName && <span className="user-name">👤 {userName}</span>}
          <button className="control-btn" onClick={handleLoad}>📂 Load</button>
          <button className="control-btn" onClick={handleSave}>💾 Save</button>
          <button className="theme-toggle control-btn" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </header>
      
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

      {showSuccessModal && (
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
