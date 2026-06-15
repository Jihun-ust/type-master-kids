import React from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { TargetSequence } from './components/TargetSequence';
import { VirtualKeyboard } from './components/VirtualKeyboard';

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
    levels
  } = useGameEngine();

  return (
    <div className="game-container">
      <header className="header">
        <h1>Type Master Kids</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </header>
      
      <div className="main-content">
        <main className="game-board">
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
                  {groupLevels.map((lvl) => (
                    <button 
                      key={lvl.id} 
                      className={`level-btn ${currentLevel === lvl.originalIndex ? 'active' : ''}`}
                      onClick={() => setCurrentLevel(lvl.originalIndex)}
                    >
                      {lvl.display}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
