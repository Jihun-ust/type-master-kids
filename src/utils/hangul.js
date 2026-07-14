export const EN_TO_KOR_MAP = {
  'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ', 'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
  'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ', 'O': 'ㅒ', 'P': 'ㅖ',
  'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ', 'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
  'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ',
  ' ': ' '
};

const CHO_EN = ['r', 'R', 's', 'e', 'E', 'f', 'a', 'q', 'Q', 't', 'T', 'd', 'w', 'W', 'c', 'z', 'x', 'v', 'g'];
const JUNG_EN = ['k', 'o', 'i', 'O', 'j', 'p', 'u', 'P', 'h', 'hk', 'ho', 'hl', 'y', 'n', 'nj', 'np', 'nl', 'b', 'm', 'ml', 'l'];
const JONG_EN = ['', 'r', 'R', 'rt', 's', 'sw', 'sg', 'e', 'f', 'fr', 'fa', 'fq', 'ft', 'fx', 'fv', 'fg', 'a', 'q', 'qt', 't', 'T', 'd', 'w', 'c', 'z', 'x', 'v', 'g'];

export function decomposeToEnglishKeys(text) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    
    // Check if it's a Hangul syllable
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const offset = code - 0xAC00;
      const choIndex = Math.floor(offset / 588);
      const jungIndex = Math.floor((offset % 588) / 28);
      const jongIndex = offset % 28;
      
      result += CHO_EN[choIndex];
      result += JUNG_EN[jungIndex];
      if (jongIndex > 0) {
        result += JONG_EN[jongIndex];
      }
    } 
    // Check if it's already an English letter or punctuation we want to keep
    else {
      result += char;
    }
  }
  return result;
}

export function getKeystrokeRanges(text) {
  const ranges = [];
  let currentKeystrokeIndex = 0;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const decomposed = decomposeToEnglishKeys(char);
    const length = decomposed.length;
    
    ranges.push({
      char: char,
      startIndex: currentKeystrokeIndex,
      endIndex: currentKeystrokeIndex + length - 1,
      length: length
    });
    
    currentKeystrokeIndex += length;
  }
  
  return ranges;
}
