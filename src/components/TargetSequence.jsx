import React from 'react';
import { EN_TO_KOR_MAP } from '../utils/hangul';

export const TargetSequence = ({ sequence, currentIndex, mistakeState, language }) => {
  return (
    <div className="target-sequence">
      {sequence.map((char, index) => {
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex;
        
        let className = "target-box";
        if (isCurrent) {
          className += " current";
          if (mistakeState) className += " mistake shake";
        } else if (isPast) {
          className += " past";
        }

        const displayChar = (language === 'ko' && EN_TO_KOR_MAP[char]) ? EN_TO_KOR_MAP[char] : char;

        return (
          <div key={index} className={className}>
            {displayChar}
          </div>
        );
      })}
    </div>
  );
};
