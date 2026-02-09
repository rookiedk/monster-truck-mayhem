import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTES } from '../utils/constants.js';

export class ScoreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ScoreScene' });
  }

  init(data) {
    this.stats = data.stats || {};
    this.levelName = data.levelName || 'LEVEL 1';
    this.levelId = data.levelId || 1;
    this.starThresholds = data.stars || { ONE_STAR: 2000, TWO_STARS: 6000, THREE_STARS: 12000 };
    this.challenges = data.challenges || [];
    this.newPalettes = data.newPalettes || [];
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a15);

    // Title
    this.add.text(GAME_WIDTH / 2, 30, this.levelName + ' COMPLETE!', {
      fontFamily: 'monospace', fontSize: '30px', color: '#44ff44',
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5);

    const s = this.stats;
    const startY = 80;
    const lineH = 28;
    const leftX = GAME_WIDTH / 2 - 200;
    const rightX = GAME_WIDTH / 2 + 200;

    const lines = [
      { label: 'Objects Destroyed', value: s.objectsDestroyed || 0, pts: s.destructionPoints || 0, color: '#ff8800' },
      { label: 'Flips Landed',      value: s.totalFlips || 0,       pts: s.flipPoints || 0,        color: '#ff4444' },
      { label: 'Air Time',          value: `${(s.totalAirTime || 0).toFixed(1)}s`, pts: s.airTimePoints || 0, color: '#ff8844' },
      { label: 'Gems Collected',    value: s.gemsCollected || 0,    pts: s.gemPoints || 0,         color: '#44ffaa' },
      { label: 'Hazards Survived',  value: s.hazardsHit || 0,       pts: '',                       color: '#ff4444' },
      { label: 'Max Combo',         value: `x${s.maxCombo || 1}`,   pts: '',                       color: '#ffaa00' },
    ];

    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      const lbl = this.add.text(leftX, y, line.label, {
        fontFamily: 'monospace', fontSize: '13px', color: '#aaaaaa',
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0, 0.5).setAlpha(0);
      const val = this.add.text(GAME_WIDTH / 2 + 40, y, `${line.value}`, {
        fontFamily: 'monospace', fontSize: '13px', color: line.color,
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setAlpha(0);
      const pts = line.pts !== '' ? this.add.text(rightX, y, `+${line.pts}`, {
        fontFamily: 'monospace', fontSize: '13px', color: '#ffff00',
        stroke: '#000', strokeThickness: 2
      }).setOrigin(1, 0.5).setAlpha(0) : null;

      this.tweens.add({
        targets: [lbl, val, pts].filter(Boolean),
        alpha: 1, duration: 250, delay: 150 + i * 80,
      });
    });

    // Divider
    const divY = startY + lines.length * lineH + 6;
    const div = this.add.rectangle(GAME_WIDTH / 2, divY, 420, 2, 0x444444).setAlpha(0);
    const divDelay = 150 + lines.length * 80;
    this.tweens.add({ targets: div, alpha: 1, duration: 250, delay: divDelay });

    // Total
    const totalY = divY + 22;
    const totalDelay = divDelay + 150;
    const tl = this.add.text(leftX, totalY, 'TOTAL SCORE', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffffff',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0, 0.5).setAlpha(0);
    const tv = this.add.text(rightX, totalY, `${s.score || 0}`, {
      fontFamily: 'monospace', fontSize: '22px', color: '#ffff00',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(1, 0.5).setAlpha(0);
    this.tweens.add({ targets: [tl, tv], alpha: 1, duration: 400, delay: totalDelay });

    // Stars
    const starY = totalY + 40;
    const score = s.score || 0;
    const starCount = score >= this.starThresholds.THREE_STARS ? 3
      : score >= this.starThresholds.TWO_STARS ? 2
      : score >= this.starThresholds.ONE_STAR ? 1 : 0;

    for (let i = 0; i < 3; i++) {
      const star = this.add.text(GAME_WIDTH / 2 + (i - 1) * 50, starY, '★', {
        fontFamily: 'serif', fontSize: '36px',
        color: i < starCount ? '#ffdd00' : '#333333',
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setAlpha(0).setScale(0.3);
      this.tweens.add({
        targets: star, alpha: 1, scale: 1, duration: 350,
        delay: totalDelay + 200 + i * 150, ease: 'Back.easeOut',
      });
    }

    // ===== Challenge Results =====
    const challengeY = starY + 50;
    const challengeDelay = totalDelay + 700;

    if (this.challenges.length > 0) {
      const chTitle = this.add.text(GAME_WIDTH / 2, challengeY, 'CHALLENGES', {
        fontFamily: 'monospace', fontSize: '16px', color: '#ff8800',
        stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: chTitle, alpha: 1, duration: 300, delay: challengeDelay });

      this.challenges.forEach((ch, i) => {
        const cy = challengeY + 24 + i * 22;
        const icon = ch.completed ? '[X]' : '[ ]';
        const color = ch.completed ? '#44ff44' : '#666';
        const ct = this.add.text(leftX + 20, cy, `${icon} ${ch.text}`, {
          fontFamily: 'monospace', fontSize: '12px', color,
          stroke: '#000', strokeThickness: 1
        }).setOrigin(0, 0.5).setAlpha(0);
        this.tweens.add({ targets: ct, alpha: 1, duration: 250, delay: challengeDelay + 100 + i * 100 });

        // Show palette reward
        if (ch.completed && PALETTES[ch.palette]) {
          const palName = PALETTES[ch.palette].name;
          const isNew = this.newPalettes.includes(ch.palette);
          const rewardText = isNew ? `NEW! ${palName}` : palName;
          const rewardColor = isNew ? '#ffaa00' : '#666';
          const rt = this.add.text(rightX - 20, cy, rewardText, {
            fontFamily: 'monospace', fontSize: '11px', color: rewardColor,
            stroke: '#000', strokeThickness: 1
          }).setOrigin(1, 0.5).setAlpha(0);
          this.tweens.add({ targets: rt, alpha: 1, duration: 250, delay: challengeDelay + 200 + i * 100 });

          if (isNew) {
            this.tweens.add({
              targets: rt, scaleX: 1.1, scaleY: 1.1,
              duration: 400, yoyo: true, repeat: 2,
              delay: challengeDelay + 400 + i * 100,
            });
          }
        }
      });
    }

    // Buttons
    const btnY = GAME_HEIGHT - 60;
    const btnDelay = challengeDelay + 800;

    // Retry
    const retryBtn = this.add.text(GAME_WIDTH / 2 - 160, btnY, '[ RETRY ]', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ff4444',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });
    retryBtn.on('pointerover', () => retryBtn.setColor('#ff8888'));
    retryBtn.on('pointerout', () => retryBtn.setColor('#ff4444'));
    retryBtn.on('pointerdown', () => this.scene.start('GameScene', { level: this.levelId }));
    this.tweens.add({ targets: retryBtn, alpha: 1, duration: 400, delay: btnDelay });

    // Next level (if not last)
    if (this.levelId < 3) {
      const nextBtn = this.add.text(GAME_WIDTH / 2 + 60, btnY, '[ NEXT LEVEL >>> ]', {
        fontFamily: 'monospace', fontSize: '20px', color: '#44ff44',
        stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });
      nextBtn.on('pointerover', () => nextBtn.setColor('#88ff88'));
      nextBtn.on('pointerout', () => nextBtn.setColor('#44ff44'));
      nextBtn.on('pointerdown', () => this.scene.start('GameScene', { level: this.levelId + 1 }));
      this.tweens.add({ targets: nextBtn, alpha: 1, duration: 400, delay: btnDelay });
      this.tweens.add({ targets: nextBtn, scaleX: 1.05, scaleY: 1.05, duration: 500, yoyo: true, repeat: -1, delay: btnDelay + 400 });
    }

    // Menu
    const menuBtn = this.add.text(GAME_WIDTH / 2, btnY + 30, 'MENU', {
      fontFamily: 'monospace', fontSize: '14px', color: '#888',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerover', () => menuBtn.setColor('#ccc'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#888'));
    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    this.tweens.add({ targets: menuBtn, alpha: 1, duration: 400, delay: btnDelay + 200 });

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-R', () => this.scene.start('GameScene', { level: this.levelId }));
    this.input.keyboard.on('keydown-ENTER', () => {
      if (this.levelId < 3) this.scene.start('GameScene', { level: this.levelId + 1 });
      else this.scene.start('MenuScene');
    });
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));
  }
}
