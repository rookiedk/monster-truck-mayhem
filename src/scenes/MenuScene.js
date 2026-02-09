import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PALETTES, STORAGE_KEYS } from '../utils/constants.js';
import { ChallengeManager } from '../systems/ChallengeManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    // ===== Rich gradient sky — warm sunset to deep night =====
    const bg = this.add.graphics();
    const skyColors = [
      { r: 8, g: 4, b: 28 },    // top — deep space
      { r: 15, g: 8, b: 45 },    // mid-top
      { r: 45, g: 15, b: 55 },   // mid — purple haze
      { r: 80, g: 25, b: 40 },   // sunset band
      { r: 50, g: 18, b: 30 },   // lower
      { r: 18, g: 10, b: 20 },   // near ground
    ];
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const t = y / GAME_HEIGHT;
      const segCount = skyColors.length - 1;
      const seg = Math.min(Math.floor(t * segCount), segCount - 1);
      const segT = (t * segCount) - seg;
      const c1 = skyColors[seg], c2 = skyColors[seg + 1];
      bg.fillStyle(Phaser.Display.Color.GetColor(
        Math.floor(c1.r + segT * (c2.r - c1.r)),
        Math.floor(c1.g + segT * (c2.g - c1.g)),
        Math.floor(c1.b + segT * (c2.b - c1.b))
      ));
      bg.fillRect(0, y, GAME_WIDTH, 1);
    }

    // ===== Twinkling stars =====
    const rng = new Phaser.Math.RandomDataGenerator(['menustars']);
    for (let i = 0; i < 120; i++) {
      const sx = rng.between(0, GAME_WIDTH);
      const sy = rng.between(0, GAME_HEIGHT * 0.55);
      const size = rng.realInRange(0.5, 2.5);
      const baseAlpha = rng.realInRange(0.2, 0.9);
      const star = this.add.circle(sx, sy, size, 0xffffff, baseAlpha);
      this.tweens.add({
        targets: star,
        alpha: rng.realInRange(0.05, 0.3),
        duration: rng.between(800, 3000),
        yoyo: true, repeat: -1,
        delay: rng.between(0, 2000),
      });
    }

    // ===== Distant mountains silhouette =====
    const mtn1 = this.add.graphics();
    mtn1.fillStyle(0x1a0f25, 0.7);
    mtn1.beginPath(); mtn1.moveTo(-50, GAME_HEIGHT);
    for (let x = -50; x <= GAME_WIDTH + 50; x += 20)
      mtn1.lineTo(x, GAME_HEIGHT * 0.52 + Math.sin(x * 0.004) * 60 + Math.sin(x * 0.012) * 30);
    mtn1.lineTo(GAME_WIDTH + 50, GAME_HEIGHT); mtn1.closePath(); mtn1.fill();

    const mtn2 = this.add.graphics();
    mtn2.fillStyle(0x120a1a, 0.85);
    mtn2.beginPath(); mtn2.moveTo(-50, GAME_HEIGHT);
    for (let x = -50; x <= GAME_WIDTH + 50; x += 15)
      mtn2.lineTo(x, GAME_HEIGHT * 0.65 + Math.sin(x * 0.007 + 2) * 40 + Math.sin(x * 0.02) * 18);
    mtn2.lineTo(GAME_WIDTH + 50, GAME_HEIGHT); mtn2.closePath(); mtn2.fill();

    // ===== Textured ground with detail =====
    const ground = this.add.graphics();
    // Dark ground fill
    ground.fillStyle(0x1a1510, 1);
    ground.beginPath(); ground.moveTo(0, GAME_HEIGHT);
    for (let x = 0; x <= GAME_WIDTH; x += 12)
      ground.lineTo(x, GAME_HEIGHT - 75 + Math.sin(x * 0.008) * 20 + Math.sin(x * 0.025) * 10 + Math.sin(x * 0.06) * 4);
    ground.lineTo(GAME_WIDTH, GAME_HEIGHT); ground.closePath(); ground.fill();
    // Surface line highlight
    ground.lineStyle(2, 0x332a1a, 0.6);
    ground.beginPath(); ground.moveTo(0, GAME_HEIGHT - 74 + Math.sin(0) * 20);
    for (let x = 0; x <= GAME_WIDTH; x += 12)
      ground.lineTo(x, GAME_HEIGHT - 76 + Math.sin(x * 0.008) * 20 + Math.sin(x * 0.025) * 10 + Math.sin(x * 0.06) * 4);
    ground.strokePath();

    // ===== Animated rolling truck on the ground =====
    const truckY = GAME_HEIGHT - 108;
    this.menuTruck = this.add.graphics();
    this.drawDetailedTruck(this.menuTruck, 0, 0);
    this.menuTruck.setPosition(-150, truckY).setAlpha(0);

    // Truck drives in from the left, parks near center
    this.tweens.add({
      targets: this.menuTruck, x: GAME_WIDTH * 0.72, alpha: 1,
      duration: 2200, delay: 500, ease: 'Power2',
    });
    // Gentle idle bounce
    this.tweens.add({
      targets: this.menuTruck, y: truckY - 2,
      duration: 800, yoyo: true, repeat: -1, delay: 2800, ease: 'Sine.easeInOut',
    });

    // Exhaust / dust trail behind the truck
    this.time.addEvent({
      delay: 80, repeat: 25, startAt: 600,
      callback: () => {
        if (!this.menuTruck) return;
        const tx = this.menuTruck.x - 55;
        const ty = this.menuTruck.y + 34;
        const dust = this.add.circle(tx, ty, rng.between(2, 5),
          Phaser.Utils.Array.GetRandom([0x888888, 0x666644, 0xff6600, 0xff8800]), 0.4);
        this.tweens.add({
          targets: dust,
          x: tx - rng.between(30, 100), y: ty - rng.between(5, 25),
          alpha: 0, scaleX: 2, scaleY: 2,
          duration: rng.between(400, 900),
          onComplete: () => dust.destroy(),
        });
      }
    });

    // ===== Title — with glow effect =====
    // Glow behind title
    const titleGlow = this.add.graphics().setAlpha(0);
    titleGlow.fillStyle(0xff3300, 0.12);
    titleGlow.fillEllipse(GAME_WIDTH / 2, 175, 600, 120);
    titleGlow.fillStyle(0xff6600, 0.06);
    titleGlow.fillEllipse(GAME_WIDTH / 2, 175, 700, 160);
    this.tweens.add({ targets: titleGlow, alpha: 1, duration: 1000, delay: 200 });
    this.tweens.add({
      targets: titleGlow, scaleX: 1.04, scaleY: 1.06,
      duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    const title1 = this.add.text(GAME_WIDTH / 2, 140, 'MONSTER TRUCK', {
      fontFamily: 'monospace', fontSize: '56px', color: '#ff4444',
      stroke: '#220000', strokeThickness: 10,
    }).setOrigin(0.5).setAlpha(0);

    const title2 = this.add.text(GAME_WIDTH / 2, 205, 'MAYHEM', {
      fontFamily: 'monospace', fontSize: '76px', color: '#ffbb00',
      stroke: '#331100', strokeThickness: 10,
    }).setOrigin(0.5).setAlpha(0);

    // Subtitle
    const sub = this.add.text(GAME_WIDTH / 2, 265, 'SMASH  ·  JUMP  ·  SURVIVE', {
      fontFamily: 'monospace', fontSize: '15px', color: '#bb8866',
      stroke: '#000', strokeThickness: 2, letterSpacing: 4,
    }).setOrigin(0.5).setAlpha(0);

    // Animate title in with bounce
    this.tweens.add({ targets: title1, alpha: 1, y: 148, duration: 700, ease: 'Back.easeOut' });
    this.tweens.add({ targets: title2, alpha: 1, y: 212, duration: 700, delay: 180, ease: 'Back.easeOut' });
    this.tweens.add({ targets: sub, alpha: 1, duration: 500, delay: 500 });

    // Gentle title float
    this.tweens.add({ targets: title1, y: 145, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: title2, y: 209, duration: 3500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 500 });

    // ===== Menu buttons — cleaner with icons =====
    const btnY = 330;
    const btnSpacing = 58;

    this.createMenuButton(GAME_WIDTH / 2, btnY, 'PLAY', '#44ff44', '>>',  500, () => {
      this.scene.start('LevelSelectScene');
    });
    this.createMenuButton(GAME_WIDTH / 2, btnY + btnSpacing, 'QUICK START', '#44aaff', '>', 620, () => {
      this.scene.start('GameScene', { level: 1 });
    });
    this.createMenuButton(GAME_WIDTH / 2, btnY + btnSpacing * 2, 'GARAGE', '#cc66ff', '*', 740, () => {
      this.showGarage();
    });
    this.createMenuButton(GAME_WIDTH / 2, btnY + btnSpacing * 3, 'CONTROLS', '#ffaa44', '?', 860, () => {
      this.showControls();
    });

    // ===== Version tag =====
    this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 10, 'v1.1  |  Phaser 3 + Matter.js', {
      fontFamily: 'monospace', fontSize: '10px', color: '#332a22'
    }).setOrigin(1, 1);

    // ===== Floating embers & sparks =====
    this.spawnMenuParticles();

    // ===== Horizon glow line =====
    const horizonGlow = this.add.graphics();
    horizonGlow.fillStyle(0xff6622, 0.08);
    horizonGlow.fillRect(0, GAME_HEIGHT * 0.48, GAME_WIDTH, 4);
    horizonGlow.fillStyle(0xff4400, 0.04);
    horizonGlow.fillRect(0, GAME_HEIGHT * 0.47, GAME_WIDTH, 10);
  }

  createMenuButton(x, y, text, color, icon, delay, callback) {
    const colorHex = Phaser.Display.Color.HexStringToColor(color).color;

    // Button background — rounded feel with gradient
    const bg = this.add.rectangle(x, y, 300, 50, 0x0a0a12, 0.85)
      .setStrokeStyle(2, colorHex);

    // Left accent bar
    const accent = this.add.rectangle(x - 148, y, 4, 42, colorHex, 0.7);

    // Icon on left
    const iconText = this.add.text(x - 126, y, icon, {
      fontFamily: 'monospace', fontSize: '18px', color,
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);

    // Label
    const label = this.add.text(x + 10, y, text, {
      fontFamily: 'monospace', fontSize: '22px', color,
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    // Start hidden
    const elements = [bg, accent, iconText, label];
    elements.forEach(el => el.setAlpha(0));

    bg.setInteractive({ useHandCursor: true });

    // Fade in
    this.tweens.add({ targets: elements, alpha: 1, duration: 400, delay });

    bg.on('pointerover', () => {
      bg.setFillStyle(0x181828, 0.95);
      bg.setStrokeStyle(2, 0xffffff);
      label.setScale(1.06);
      accent.setFillStyle(0xffffff, 0.9);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x0a0a12, 0.85);
      bg.setStrokeStyle(2, colorHex);
      label.setScale(1);
      accent.setFillStyle(colorHex, 0.7);
    });
    bg.on('pointerdown', callback);
  }

  showControls() {
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.88).setDepth(100).setInteractive();
    const title = this.add.text(GAME_WIDTH / 2, 80, 'CONTROLS', {
      fontFamily: 'monospace', fontSize: '32px', color: '#ffaa00', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(101);

    const controls = [
      ['RIGHT ARROW', 'Accelerate', '#44ff44'],
      ['LEFT ARROW', 'Brake / Reverse', '#44ff44'],
      ['UP ARROW', 'Lean Back (Flip!)', '#44ff44'],
      ['DOWN ARROW', 'Lean Forward', '#44ff44'],
      ['W', 'Jump (costs Nitro)', '#44aaff'],
      ['SPACE', 'Boost / Nitro', '#ff8844'],
      ['R', 'Restart Level', '#888888'],
      ['ESC', 'Back to Menu', '#888888'],
    ];

    const startY = 150;
    const allEls = [overlay, title];
    controls.forEach(([key, desc, clr], i) => {
      const ky = this.add.text(GAME_WIDTH / 2 - 190, startY + i * 42, key, {
        fontFamily: 'monospace', fontSize: '16px', color: clr, stroke: '#000', strokeThickness: 2
      }).setDepth(101).setAlpha(0);
      const ds = this.add.text(GAME_WIDTH / 2 + 40, startY + i * 42, desc, {
        fontFamily: 'monospace', fontSize: '16px', color: '#cccccc', stroke: '#000', strokeThickness: 2
      }).setDepth(101).setAlpha(0);
      this.tweens.add({ targets: [ky, ds], alpha: 1, duration: 200, delay: 80 + i * 50 });
      allEls.push(ky, ds);
    });

    const tip = this.add.text(GAME_WIDTH / 2, startY + controls.length * 42 + 25, 'On mobile: Use on-screen buttons', {
      fontFamily: 'monospace', fontSize: '13px', color: '#666', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(101);
    allEls.push(tip);

    const closeBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '[ CLOSE ]', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ff4444', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });
    allEls.push(closeBtn);

    closeBtn.on('pointerdown', () => {
      allEls.forEach(el => el.destroy());
    });
  }

  showGarage() {
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.92).setDepth(100).setInteractive();
    const allElements = [overlay];

    const title = this.add.text(GAME_WIDTH / 2, 50, 'GARAGE - TRUCK PALETTES', {
      fontFamily: 'monospace', fontSize: '28px', color: '#cc44ff', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(101);
    allElements.push(title);

    const subtitle = this.add.text(GAME_WIDTH / 2, 82, 'Complete challenges to unlock new palettes!', {
      fontFamily: 'monospace', fontSize: '12px', color: '#888', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(101);
    allElements.push(subtitle);

    const unlocked = ChallengeManager.getUnlockedPalettes();
    const selectedKey = ChallengeManager.getSelectedPalette();
    const paletteKeys = Object.keys(PALETTES);

    const cols = 5;
    const cellW = 200, cellH = 72, gapX = 14, gapY = 12;
    const totalGridW = cols * cellW + (cols - 1) * gapX;
    const gridStartX = (GAME_WIDTH - totalGridW) / 2 + cellW / 2;
    const gridStartY = 120;

    paletteKeys.forEach((key, idx) => {
      const pal = PALETTES[key];
      const isUnlocked = unlocked.includes(key);
      const isSelected = key === selectedKey;
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = gridStartX + col * (cellW + gapX);
      const cy = gridStartY + row * (cellH + gapY);

      const bgColor = isUnlocked ? 0x1a1a2a : 0x111118;
      const borderColor = isSelected ? 0xcc44ff : isUnlocked ? 0x444466 : 0x222233;
      const cellBg = this.add.rectangle(cx, cy, cellW, cellH, bgColor, 0.95)
        .setStrokeStyle(2, borderColor).setDepth(101);
      allElements.push(cellBg);

      const nameText = this.add.text(cx, cy - 18, isUnlocked ? pal.name : '???', {
        fontFamily: 'monospace', fontSize: '12px',
        color: isUnlocked ? '#ffffff' : '#444',
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setDepth(102);
      allElements.push(nameText);

      if (isUnlocked) {
        const px = cx - 30, py = cy + 8;
        const bodyBox = this.add.rectangle(px, py, 36, 16, pal.bodyTint).setDepth(102);
        const wl = this.add.circle(px - 12, py + 12, 6, pal.wheelTint).setDepth(102);
        const wr = this.add.circle(px + 12, py + 12, 6, pal.wheelTint).setDepth(102);
        const boostBox = this.add.rectangle(px + 40, py + 4, 24, 10, pal.boostTint).setStrokeStyle(1, 0x333333).setDepth(102);
        const boostLabel = this.add.text(px + 40, py - 8, 'boost', { fontFamily: 'monospace', fontSize: '8px', color: '#666' }).setOrigin(0.5).setDepth(102);
        allElements.push(bodyBox, wl, wr, boostBox, boostLabel);
      } else {
        const lockText = this.add.text(cx, cy + 8, 'LOCKED', {
          fontFamily: 'monospace', fontSize: '10px', color: '#333', stroke: '#000', strokeThickness: 1
        }).setOrigin(0.5).setDepth(102);
        allElements.push(lockText);
      }

      if (isSelected) {
        const selText = this.add.text(cx + cellW / 2 - 8, cy - cellH / 2 + 8, 'EQUIPPED', {
          fontFamily: 'monospace', fontSize: '8px', color: '#cc44ff', stroke: '#000', strokeThickness: 1
        }).setOrigin(1, 0.5).setDepth(103);
        allElements.push(selText);
      }

      if (isUnlocked) {
        cellBg.setInteractive({ useHandCursor: true });
        cellBg.on('pointerover', () => {
          if (key !== ChallengeManager.getSelectedPalette()) cellBg.setStrokeStyle(2, 0x8844aa);
        });
        cellBg.on('pointerout', () => {
          const sel = ChallengeManager.getSelectedPalette();
          cellBg.setStrokeStyle(2, key === sel ? 0xcc44ff : 0x444466);
        });
        cellBg.on('pointerdown', () => {
          ChallengeManager.setSelectedPalette(key);
          allElements.forEach(el => el.destroy());
          this.showGarage();
        });
      }
    });

    const closeBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, '[ CLOSE ]', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ff4444', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });
    allElements.push(closeBtn);

    closeBtn.on('pointerdown', () => {
      allElements.forEach(el => el.destroy());
    });
  }

  drawDetailedTruck(g, x, y) {
    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(x + 60, y + 58, 120, 14);

    // Chassis / undercarriage
    g.fillStyle(0x222222, 0.9);
    g.fillRect(x + 10, y + 38, 100, 10);

    // Body
    g.fillStyle(0xdd2222, 0.9);
    g.fillRect(x + 15, y + 8, 90, 32);
    // Cab
    g.fillStyle(0xbb1a1a, 0.9);
    g.fillRect(x + 35, y, 42, 12);
    // Window
    g.fillStyle(0x5599cc, 0.7);
    g.fillRect(x + 68, y + 2, 14, 16);
    g.fillStyle(0x77bbee, 0.4);
    g.fillRect(x + 70, y + 3, 4, 13);
    // Stripe
    g.fillStyle(0xffaa00, 0.8);
    g.fillRect(x + 15, y + 24, 90, 3);
    g.fillStyle(0xff8800, 0.6);
    g.fillRect(x + 15, y + 29, 90, 2);
    // Headlight
    g.fillStyle(0xffff44, 0.9);
    g.fillRect(x + 102, y + 16, 6, 6);
    // Taillight
    g.fillStyle(0xff2200, 0.9);
    g.fillRect(x + 10, y + 18, 4, 5);

    // Roll bars
    g.fillStyle(0x444444, 0.8);
    g.fillRect(x + 18, y - 2, 5, 12);
    g.fillRect(x + 26, y, 5, 10);
    g.fillStyle(0x555555, 0.6);
    g.fillRect(x + 18, y - 4, 5, 3);
    g.fillRect(x + 26, y - 2, 5, 3);

    // Bumpers
    g.fillStyle(0x666666, 0.8);
    g.fillRect(x + 8, y + 14, 10, 24);
    g.fillRect(x + 102, y + 14, 10, 24);

    // Wheels — big with tread
    const drawWheel = (cx, cy) => {
      g.fillStyle(0x1a1a1a, 1);
      g.fillCircle(cx, cy, 19);
      g.fillStyle(0x2a2a2a, 0.8);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        g.fillRect(cx + Math.cos(a) * 15 - 2, cy + Math.sin(a) * 15 - 1.5, 5, 3);
      }
      g.fillStyle(0x222222, 1);
      g.fillCircle(cx, cy, 13);
      g.fillStyle(0x999999, 1);
      g.fillCircle(cx, cy, 10);
      g.fillStyle(0xaaaaaa, 0.8);
      g.fillCircle(cx, cy, 8);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        g.lineStyle(2, 0x777777, 0.7);
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * 2, cy + Math.sin(a) * 2);
        g.lineTo(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7);
        g.strokePath();
      }
      g.fillStyle(0x555555, 1);
      g.fillCircle(cx, cy, 3);
    };
    drawWheel(x + 25, y + 50);
    drawWheel(x + 95, y + 50);
  }

  spawnMenuParticles() {
    // Floating embers — more varied
    for (let i = 0; i < 25; i++) {
      const px = Phaser.Math.Between(30, GAME_WIDTH - 30);
      const py = Phaser.Math.Between(GAME_HEIGHT - 110, GAME_HEIGHT);
      const size = Phaser.Math.FloatBetween(1, 3.5);
      const color = Phaser.Utils.Array.GetRandom([0xff3300, 0xff5500, 0xff8800, 0xffaa00, 0xffcc44]);
      const ember = this.add.circle(px, py, size, color, Phaser.Math.FloatBetween(0.3, 0.6));
      this.tweens.add({
        targets: ember,
        y: Phaser.Math.Between(80, 350),
        x: px + Phaser.Math.Between(-120, 120),
        alpha: 0,
        duration: Phaser.Math.Between(2500, 5500),
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
        onRepeat: () => {
          ember.setPosition(Phaser.Math.Between(30, GAME_WIDTH - 30), GAME_HEIGHT);
          ember.setAlpha(Phaser.Math.FloatBetween(0.3, 0.6));
        },
      });
    }

    // Occasional spark bursts near ground
    this.time.addEvent({
      delay: 1500, repeat: -1,
      callback: () => {
        const sx = Phaser.Math.Between(100, GAME_WIDTH - 100);
        const sy = GAME_HEIGHT - Phaser.Math.Between(70, 85);
        for (let j = 0; j < 4; j++) {
          const sp = this.add.circle(sx, sy, Phaser.Math.Between(1, 2), 0xffcc00, 0.8);
          const angle = Math.random() * Math.PI;
          const dist = 20 + Math.random() * 40;
          this.tweens.add({
            targets: sp,
            x: sx + Math.cos(angle) * dist,
            y: sy - Math.sin(angle) * dist,
            alpha: 0,
            duration: 300 + Math.random() * 300,
            onComplete: () => sp.destroy(),
          });
        }
      }
    });
  }
}
