import { CHALLENGE_DEFS, STORAGE_KEYS, PALETTES } from '../utils/constants.js';

export class ChallengeManager {
  constructor(levelId) {
    this.levelId = levelId;
    this.challenges = [];
    this.completedThisRun = [];
    this.generateChallenges();
  }

  /**
   * Pick 3 random, achievable challenges (no duplicates).
   * Scale target values by level difficulty.
   */
  generateChallenges() {
    const scale = 0.7 + (this.levelId - 1) * 0.2; // L1=0.7, L2=0.9, L3=1.1
    const pool = [...CHALLENGE_DEFS];

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Pick 3 unique challenges
    const picked = pool.slice(0, 3);
    this.challenges = picked.map(def => {
      let n;
      if (def.minN >= 100) {
        // For large numbers (score), round to nearest 500
        n = Math.round((def.minN + Math.random() * (def.maxN - def.minN)) * scale / 500) * 500;
        n = Math.max(def.minN, n);
      } else if (Number.isInteger(def.minN)) {
        n = Math.round((def.minN + Math.random() * (def.maxN - def.minN)) * scale);
        n = Math.max(def.minN, n);
      } else {
        n = Math.round((def.minN + Math.random() * (def.maxN - def.minN)) * scale * 10) / 10;
        n = Math.max(def.minN, n);
      }

      return {
        id: def.id,
        text: def.text.replace('{n}', n),
        stat: def.stat,
        target: n,
        palette: def.palette,
        completed: false,
      };
    });
  }

  /**
   * Check all challenges against current stats. Returns newly completed ones.
   */
  checkProgress(stats) {
    const newlyCompleted = [];

    for (const ch of this.challenges) {
      if (ch.completed) continue;

      const current = stats[ch.stat] || 0;
      if (current >= ch.target) {
        ch.completed = true;
        newlyCompleted.push(ch);
        this.completedThisRun.push(ch);
      }
    }

    return newlyCompleted;
  }

  /**
   * Persist newly unlocked palettes to localStorage.
   */
  saveUnlocks() {
    if (this.completedThisRun.length === 0) return [];

    const unlocked = this.getUnlockedPalettes();
    const newUnlocks = [];

    for (const ch of this.completedThisRun) {
      if (!unlocked.includes(ch.palette)) {
        unlocked.push(ch.palette);
        newUnlocks.push(ch.palette);
      }
    }

    try {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_PALETTES, JSON.stringify(unlocked));
    } catch (e) { console.warn('Failed to save palette unlocks', e); }

    return newUnlocks;
  }

  static getUnlockedPalettes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_PALETTES);
      return raw ? JSON.parse(raw) : ['DEFAULT'];
    } catch { return ['DEFAULT']; }
  }

  getUnlockedPalettes() {
    return ChallengeManager.getUnlockedPalettes();
  }

  static getSelectedPalette() {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_PALETTE) || 'DEFAULT';
    } catch { return 'DEFAULT'; }
  }

  static setSelectedPalette(key) {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PALETTE, key);
    } catch (e) { console.warn('Failed to save palette selection', e); }
  }

  getChallenges() {
    return this.challenges;
  }

  getCompletedThisRun() {
    return this.completedThisRun;
  }
}
