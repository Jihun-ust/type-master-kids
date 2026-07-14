import React from 'react';
import { HandsOverlay } from './HandsOverlay';
import { EN_TO_KOR_MAP } from '../utils/hangul';

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  [' ']
];

export const VirtualKeyboard = ({ targetKey, language }) => {
  return (
    <div className="virtual-keyboard-container">
      <div className="keyboard">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className={`keyboard-row row-${rowIndex}`}>
            {row.map((key) => {
              const isActive = key === targetKey;
              return (
                <div key={key} className={`key ${key === ' ' ? 'space-key' : ''} ${isActive ? 'active' : ''}`}>
                  {key === ' ' ? '' : (
                    language === 'ko' && EN_TO_KOR_MAP[key] ? (
                      <div className="key-labels">
                        <span className="ko-label">{EN_TO_KOR_MAP[key]}</span>
                        <span className="en-label">{key}</span>
                      </div>
                    ) : key
                  )}
                  {isActive && <div className="ripple-effect" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <HandsOverlay targetKey={targetKey} />
    </div>
  );
};
