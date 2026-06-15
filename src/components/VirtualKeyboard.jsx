import React from 'react';
import { HandsOverlay } from './HandsOverlay';

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  [' ']
];

export const VirtualKeyboard = ({ targetKey }) => {
  return (
    <div className="virtual-keyboard-container">
      <div className="keyboard">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className={`keyboard-row row-${rowIndex}`}>
            {row.map((key) => {
              const isActive = key === targetKey;
              return (
                <div key={key} className={`key ${key === ' ' ? 'space-key' : ''} ${isActive ? 'active' : ''}`}>
                  {key === ' ' ? '' : key}
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
