/// <reference lib="webworker" />

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;
  
  if (type === 'generate_word_search') {
    const { wordBank, config } = payload;
    const { grid, placedWords } = generateGrid(wordBank, config);
    self.postMessage({ success: true, type: 'word_search_ready', grid, placedWords });
  } else if (type === 'generate_crossword') {
    // Basic Crossword Stub
    self.postMessage({ success: true, type: 'crossword_ready', grid: [] });
  }
};

function generateGrid(words: string[], config: any) {
  const { width, height, difficulty } = config;
  const grid: string[][] = Array(height).fill(null).map(() => Array(width).fill(''));
  const placedWords: any[] = [];
  const dirs = difficulty === 'easy' ? [[1,0], [0,1], [1,1]] : [[1,0], [0,1], [1,1], [-1,0], [0,-1], [-1,-1], [1,-1], [-1,1]];
  
  const sortedWords = [...words].map(w => w.toUpperCase().replace(/[^A-Z]/g, '')).sort((a, b) => b.length - a.length);
  
  for (const word of sortedWords) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 300) {
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const startX = Math.floor(Math.random() * width);
      const startY = Math.floor(Math.random() * height);
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const x = startX + i * dir[0]; const y = startY + i * dir[1];
        if (x < 0 || x >= width || y < 0 || y >= height || (grid[y][x] !== '' && grid[y][x] !== word[i])) {
          canPlace = false; break;
        }
      }
      if (canPlace) {
        for (let i = 0; i < word.length; i++) grid[startY + i * dir[1]][startX + i * dir[0]] = word[i];
        placedWords.push({ word, startX, startY, dirX: dir[0], dirY: dir[1] });
        placed = true;
      }
      attempts++;
    }
  }
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === '') grid[y][x] = letters.charAt(Math.floor(Math.random() * letters.length));
    }
  }
  return { grid, placedWords };
}
