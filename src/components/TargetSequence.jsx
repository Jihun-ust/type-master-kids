import React from 'react';

export const TargetSequence = ({ sequence, currentIndex, mistakeState }) => {
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

        return (
          <div key={index} className={className}>
            {char}
          </div>
        );
      })}
    </div>
  );
};
