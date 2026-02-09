import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, STORAGE_KEYS, SCORE_STARS } from '../utils/constants.js';
import { LEVELS } from '../config/levels.js';

export class LevelSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'LevelSelectScene' }); }

  create() {
    // Background
    const g = this.add.graphics();
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const t = y / GAME_HEIGHT;
      g.fillStyle(Phaser.Display.Color.GetColor(
        Math.floor(8 + t * 10), Math.floor(5 + t * 12), Math.floor(25 + t * 30)
      ));
      g.fillRect(0, y, GAME_WIDTH, 1);
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 50, 'SELECT LEVEL', {
      fontFamily: 'monospace', fontSize: '36px', color: '#ffaa00',
      stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5);

    // Get saved data
    const unlocked = this.getUnlockedLevels();
    const bestScores = this.getBestScores();

    // Level cards
    const cardW = 320, cardH = 360, spacing = 40;
    const totalW = 3 * cardW + 2 * spacing;
    const startX = (GAME_WIDTH - totalW) / 2 + cardW / 2;
    const cardY = GAME_HEIGHT / 2 + 20;

    const levelColors = ['#ff3333', '#8844cc', '#44aaff'];
    const levelBgColors = [0x331111, 0x221133, 0x112233];
    const levelDescriptions = [
      'Wasteland junkyard.\nSmash crates, barrels,\nvehicles and tanks!',
      'Steep mountain canyons.\nNarrow paths, long jumps,\ncrystals and rocks!',
      'City streets chaos.\nOverpasses, construction,\nwrecking yards!'
    ];

    for (let i = 1; i <= 3; i++) {
      const x = startX + (i - 1) * (cardW + spacing);
      const isLocked = !unlocked.includes(i);
      const level = LEVELS[i];
      const stars = SCORE_STARS[i];
      const score = bestScores[i] || 0;

      // Card background
      const card = this.add.rectangle(x, cardY, cardW, cardH, levelBgColors[i - 1], 0.9)
        .setStrokeStyle(2, isLocked ? 0x444444 : Phaser.Display.Color.HexStringToColor(levelColors[i - 1]).color);

      // Level number
      this.add.text(x, cardY - cardH / 2 + 30, `LEVEL ${i}`, {
        fontFamily: 'monospace', fontSize: '16px', color: isLocked ? '#555' : levelColors[i - 1],
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5);

      // Level name
      this.add.text(x, cardY - cardH / 2 + 60, level.name, {
        fontFamily: 'monospace', fontSize: '20px', color: isLocked ? '#444' : '#ffffff',
        stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);

      // Description
      this.add.text(x, cardY - cardH / 2 + 115, levelDescriptions[i - 1], {
        fontFamily: 'monospace', fontSize: '12px', color: isLocked ? '#333' : '#aaa',
        stroke: '#000', strokeThickness: 1, align: 'center', lineSpacing: 4,
      }).setOrigin(0.5);

      // Difficulty indicator
      const diffLabel = i === 1 ? 'EASY' : i === 2 ? 'MEDIUM' : 'HARD';
      const diffColor = i === 1 ? '#44ff44' : i === 2 ? '#ffaa00' : '#ff4444';
      this.add.text(x, cardY - cardH / 2 + 175, diffLabel, {
        fontFamily: 'monospace', fontSize: '14px', color: isLocked ? '#333' : diffColor,
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5);

      if (isLocked) {
        // Lock icon
        this.add.text(x, cardY + 20, '🔒', { fontSize: '48px' }).setOrigin(0.5);
        this.add.text(x, cardY + 70, 'Complete previous\nlevel to unlock', {
          fontFamily: 'monospace', fontSize: '11px', color: '#555', align: 'center', lineSpacing: 2
        }).setOrigin(0.5);
      } else {
        // Stars
        const starY = cardY + 10;
        const starCount = score >= stars.THREE_STARS ? 3 : score >= stars.TWO_STARS ? 2 : score >= stars.ONE_STAR ? 1 : 0;
        for (let s = 0; s < 3; s++) {
          this.add.text(x + (s - 1) * 35, starY, '★', {
            fontFamily: 'serif', fontSize: '30px',
            color: s < starCount ? '#ffdd00' : '#333',
            stroke: '#000', strokeThickness: 2
          }).setOrigin(0.5);
        }

        // Best score
        if (score > 0) {
          this.add.text(x, starY + 35, `BEST: ${score}`, {
            fontFamily: 'monospace', fontSize: '14px', color: '#ffff00',
            stroke: '#000', strokeThickness: 2
          }).setOrigin(0.5);
        }

        // Play button
        const playBtn = this.add.rectangle(x, cardY + cardH / 2 - 40, 200, 44, 0x222222, 0.9)
          .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(levelColors[i - 1]).color)
          .setInteractive({ useHandCursor: true });

        const playLabel = this.add.text(x, cardY + cardH / 2 - 40, score > 0 ? 'REPLAY' : 'PLAY', {
          fontFamily: 'monospace', fontSize: '18px', color: levelColors[i - 1],
          stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);

        const lvl = i;
        playBtn.on('pointerover', () => { playBtn.setFillStyle(0x333333, 0.9); playLabel.setScale(1.05); });
        playBtn.on('pointerout', () => { playBtn.setFillStyle(0x222222, 0.9); playLabel.setScale(1); });
        playBtn.on('pointerdown', () => { this.scene.start('GameScene', { level: lvl }); });
      }
    }

    // Back button
    const backBtn = this.add.text(60, GAME_HEIGHT - 40, '< BACK', {
      fontFamily: 'monospace', fontSize: '18px', color: '#888',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setColor('#fff'));
    backBtn.on('pointerout', () => backBtn.setColor('#888'));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  getUnlockedLevels() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVELS);
      return raw ? JSON.parse(raw) : [1];
    } catch { return [1]; }
  }

  getBestScores() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BEST_SCORES);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }
}
