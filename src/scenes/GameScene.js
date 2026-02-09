import Phaser from 'phaser';
import { MonsterTruck } from '../objects/MonsterTruck.js';
import { Destructible } from '../objects/Destructible.js';
import { Collectible } from '../objects/Collectible.js';
import { Hazard } from '../objects/Hazard.js';
import { TerrainGenerator } from '../systems/TerrainGenerator.js';
import { ScoreManager } from '../systems/ScoreManager.js';
import { AudioManager } from '../systems/AudioManager.js';
import { ChallengeManager } from '../systems/ChallengeManager.js';
import { LEVELS } from '../config/levels.js';
import {
  GAME_WIDTH, GAME_HEIGHT, TERRAIN, PARALLAX_LAYERS, PALETTES, STORAGE_KEYS
} from '../utils/constants.js';

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  init(data) {
    this.levelId = data.level || 1;
    this.levelCfg = LEVELS[this.levelId];
  }

  create() {
    this.loadedAssets = this.registry.get('loadedAssets') || new Set();
    this.scoreManager = new ScoreManager();
    this.audioManager = new AudioManager();
    this.audioManager.startMusic(this.levelId);
    this.challengeManager = new ChallengeManager(this.levelId);

    const lc = this.levelCfg;

    // Background
    this.createGradientSky(lc.colors.sky);
    this.createParallaxBackground(lc.parallaxPrimary, lc.parallaxFallback);

    // Terrain
    this.terrain = new TerrainGenerator(this, lc.colors.ground, lc.terrainProfile, lc.markers);
    this.terrain.generate();

    const startPos = this.terrain.getStartPosition();
    this.truck = new MonsterTruck(this, startPos.x, startPos.y, lc.difficulty);

    // Destructibles
    this.destructibles = [];
    const destrItems = lc.getDestructibles(this.terrain, this);
    for (const d of destrItems) {
      this.destructibles.push(new Destructible(this, d.x, d.y, {
        ...d.cfg, type: d.type, onDestroy: (dd) => this.onDestroyed(dd),
      }));
    }

    // Hazards (Boos!)
    this.hazards = [];
    if (lc.getHazards) {
      const hazardItems = lc.getHazards(this.terrain);
      for (const h of hazardItems) {
        this.hazards.push(new Hazard(this, h.x, h.y, h.cfg));
      }
    }

    // Collectibles
    this.collectibles = [];
    const gemItems = lc.getGems(this.terrain);
    for (const g of gemItems) this.mkGem(g.x, g.y);

    // Water hazards
    this.waterZones = [];
    if (lc.waterHazards && lc.waterHazards.length > 0) {
      for (const wh of lc.waterHazards) this.createWaterHazard(wh);
    }

    // Ambient birds (Level 2)
    if (lc.ambientBirds) this.spawnAmbientBirds();

    // Dancer at finish (Level 3)
    if (lc.dancerAtFinish) this.spawnDancer();

    // Collision
    this.setupCollisions();

    // Camera
    this.cameras.main.setBounds(-300, -500, TERRAIN.LENGTH + 600, 1500);
    this.cameras.main.startFollow(this.truck.chassisSprite, true, 0.09, 0.09, -100, 50);
    this.cameras.main.setDeadzone(80, 40);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Touch controls
    this.createTouchControls();

    this.createHUD();
    this.createChallengeHUD();
    this.gameOver = false;
    this.levelComplete = false;
    this.paused = false;
    this.startX = startPos.x;
    this.showStartMessage();
    this.createFinishLine();
  }

  // ======================== BACKGROUND ========================
  createGradientSky(sky) {
    const g = this.add.graphics().setScrollFactor(0).setDepth(-200);
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const t = y / GAME_HEIGHT;
      g.fillStyle(Phaser.Display.Color.GetColor(
        Math.floor(sky.top.r + t * (sky.bottom.r - sky.top.r)),
        Math.floor(sky.top.g + t * (sky.bottom.g - sky.top.g)),
        Math.floor(sky.top.b + t * (sky.bottom.b - sky.top.b))
      )); g.fillRect(0, y, GAME_WIDTH, 1);
    }
    g.fillStyle(0xffffff, 0.6);
    const rng = new Phaser.Math.RandomDataGenerator(['stars']);
    for (let i = 0; i < 50; i++) g.fillRect(rng.between(0, GAME_WIDTH), rng.between(0, GAME_HEIGHT * 0.45), rng.between(1, 2), rng.between(1, 2));
  }

  createParallaxBackground(primaryKey, fallbackKey) {
    const primary = PARALLAX_LAYERS[primaryKey] || [];
    const fallback = PARALLAX_LAYERS[fallbackKey] || [];
    const hasPrimary = primary.some(l => this.loadedAssets.has(l.key));
    const layers = hasPrimary ? primary : fallback;

    for (const cfg of layers) {
      if (!this.loadedAssets.has(cfg.key)) continue;
      const src = this.textures.get(cfg.key).getSourceImage();
      if (src.width < 4) continue;
      const sc = GAME_HEIGHT / src.height;
      const sw = src.width * sc;
      const copies = Math.ceil((GAME_WIDTH + TERRAIN.LENGTH * cfg.scrollFactor) / sw) + 2;
      for (let i = -1; i < copies; i++)
        this.add.image(i * sw, 0, cfg.key).setOrigin(0, 0).setScale(sc).setScrollFactor(cfg.scrollFactor, 0).setDepth(cfg.depth);
    }

    if (!hasPrimary && !fallback.some(l => this.loadedAssets.has(l.key))) this.createProceduralMountains();
  }

  createProceduralMountains() {
    const w = GAME_WIDTH, h = GAME_HEIGHT;
    const far = this.add.graphics().setScrollFactor(0.06, 0).setDepth(-90);
    far.fillStyle(0x2a1f3d, 0.9); far.beginPath(); far.moveTo(-200, h);
    for (let x = -200; x <= w + 400; x += 50) far.lineTo(x, h * 0.35 + Math.sin(x * 0.006) * 70 + Math.sin(x * 0.015) * 35);
    far.lineTo(w + 400, h); far.closePath(); far.fill();
    const near = this.add.graphics().setScrollFactor(0.12, 0).setDepth(-85);
    near.fillStyle(0x1a1528, 0.95); near.beginPath(); near.moveTo(-200, h);
    for (let x = -200; x <= w + 400; x += 35) near.lineTo(x, h * 0.5 + Math.sin(x * 0.009 + 1) * 55 + Math.sin(x * 0.025) * 25);
    near.lineTo(w + 400, h); near.closePath(); near.fill();
  }

  // ======================== WATER HAZARDS ========================
  createWaterHazard(wh) {
    const y1 = this.terrain.getTerrainYAtX(wh.x1);
    const y2 = this.terrain.getTerrainYAtX(wh.x2);
    const wy = Math.max(y1, y2) + (wh.depth || 20);
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x2244aa, 0.5);
    g.fillRect(wh.x1, wy - 15, wh.x2 - wh.x1, 30);
    g.fillStyle(0x4488ff, 0.3);
    g.fillRect(wh.x1, wy - 18, wh.x2 - wh.x1, 6);
    // Ripple animation
    const ripple = this.add.graphics().setDepth(2);
    this.tweens.add({
      targets: { t: 0 }, t: 1, duration: 2000, repeat: -1,
      onUpdate: (tw) => {
        ripple.clear();
        ripple.lineStyle(1, 0x88ccff, 0.4);
        const phase = tw.getValue() * Math.PI * 2;
        ripple.beginPath();
        ripple.moveTo(wh.x1, wy - 12);
        for (let xx = wh.x1; xx <= wh.x2; xx += 8)
          ripple.lineTo(xx, wy - 12 + Math.sin(xx * 0.05 + phase) * 3);
        ripple.strokePath();
      }
    });
    this.waterZones.push({ x1: wh.x1, x2: wh.x2, y: wy });
  }

  // ======================== AMBIENT CHARACTERS ========================
  spawnAmbientBirds() {
    const rng = new Phaser.Math.RandomDataGenerator(['birds']);
    for (let i = 0; i < 8; i++) {
      const bx = rng.between(200, TERRAIN.LENGTH - 200);
      const by = rng.between(50, 200);
      const hasCrow = this.anims.exists('crow-fly');
      const hasBird = this.anims.exists('bird-fly');
      if (hasCrow && rng.frac() > 0.5) {
        const s = this.add.sprite(bx, by, 'crow-fly-ss', 0).setDepth(-60).setScale(2);
        s.play('crow-fly');
        this.tweens.add({ targets: s, x: bx + rng.between(200, 600), y: by + rng.between(-40, 40), duration: rng.between(4000, 8000), yoyo: true, repeat: -1 });
      } else if (hasBird) {
        const s = this.add.sprite(bx, by, 'bird-fly-ss', 0).setDepth(-60).setScale(1.5);
        s.play('bird-fly');
        this.tweens.add({ targets: s, x: bx + rng.between(300, 800), y: by + rng.between(-30, 30), duration: rng.between(5000, 10000), yoyo: true, repeat: -1 });
      }
    }
  }

  spawnDancer() {
    const fx = this.terrain.getFinishX();
    const fy = this.terrain.getTerrainYAtX(fx);
    if (this.anims.exists('dancer-dance')) {
      const s = this.add.sprite(fx + 50, fy - 30, 'dancer-ss', 0).setDepth(5).setScale(2);
      s.play('dancer-dance');
    }
  }

  // ======================== COLLECTIBLES ========================
  mkGem(x, y) {
    this.collectibles.push(new Collectible(this, x, y, {
      onCollect: (g) => {
        const p = this.scoreManager.addGemPoints();
        this.showPopup(g.x, g.y - 20, `+${p}`, '#44ffaa');
        this.audioManager.playCollect();
      }
    }));
  }

  // ======================== COLLISIONS ========================
  setupCollisions() {
    this.matter.world.on('collisionstart', (event) => {
      for (const pair of event.pairs) this.checkPair(pair.bodyA, pair.bodyB);
    });
    // Continuous collision for repeating hazards (fire pits, oil, spikes)
    this.matter.world.on('collisionactive', (event) => {
      if (this.gameOver) return;
      for (const pair of event.pairs) {
        const a = pair.bodyA, b = pair.bodyB;
        const tA = a.label === 'chassis' || a.label === 'wheel';
        const tB = b.label === 'chassis' || b.label === 'wheel';
        if (tA && b.label === 'hazard') this.hitHazard(b);
        else if (tB && a.label === 'hazard') this.hitHazard(a);
      }
    });
  }

  checkPair(a, b) {
    if (this.gameOver) return;
    const tA = a.label === 'chassis' || a.label === 'wheel';
    const tB = b.label === 'chassis' || b.label === 'wheel';
    if (tA && b.label === 'destructible') this.hitDestr(a, b);
    else if (tB && a.label === 'destructible') this.hitDestr(b, a);
    if (tA && b.label === 'collectible') this.hitColl(b);
    else if (tB && a.label === 'collectible') this.hitColl(a);
    if (tA && b.label === 'hazard') this.hitHazard(b);
    else if (tB && a.label === 'hazard') this.hitHazard(a);
  }

  hitDestr(truck, destr) {
    const d = destr.destructibleRef;
    if (!d || d.destroyed) return;
    const spd = Math.sqrt(truck.velocity.x ** 2 + truck.velocity.y ** 2);
    if (spd > 1.5) { d.damage(Math.ceil(spd / 2)); this.audioManager.playImpact(); }
  }

  hitColl(body) {
    const c = body.collectibleRef;
    if (c && !c.collected) c.collect();
  }

  hitHazard(body) {
    const h = body.hazardRef;
    if (!h || h.destroyed) return;
    const damage = h.hit(this.time.now);
    if (damage <= 0) return;

    this.truck.takeDamage(damage);
    this.scoreManager.addHazardHit();
    this.audioManager.playImpact();

    // Show damage label
    if (h.config.label) {
      this.showPopup(h.x, h.y - 30, h.config.label, '#ff2222');
    }
    this.showPopup(h.x + 20, h.y - 50, `-${Math.round(damage)} HP`, '#ff4444');

    // Explosion for mines/TNT
    if (h.config.explosion) {
      this.spawnExplosion(h.x, h.y, h.config.explosion);
      this.audioManager.playExplosion(h.config.explosion);
      const isLarge = h.config.explosion === 'large';
      this.cameras.main.shake(isLarge ? 150 : 80, isLarge ? 0.008 : 0.005);
      if (isLarge) {
        this.time.timeScale = 0.3;
        this.time.delayedCall(200, () => { this.time.timeScale = 1; });
      }
    }
  }

  onDestroyed(d) {
    const c = d.config;
    const pts = this.scoreManager.addDestructionPoints(c.points, c.type);
    this.showPopup(d.x, d.y - 30, `+${pts}`);
    if (this.scoreManager.comboMultiplier > 1) {
      this.showPopup(d.x, d.y - 55, `x${this.scoreManager.comboMultiplier} COMBO`, '#ff8800');
      if (this.scoreManager.combo % 3 === 0) this.audioManager.playCombo();
    }
    this.spawnExplosion(d.x, d.y, c.explosion || 'small');
    this.spawnHit(d.x, d.y);
    this.audioManager.playExplosion(c.explosion || 'small');
    this.truck.boostFuel = Math.min(this.truck.maxBoostFuel, this.truck.boostFuel + (c.nitroRefill || 5));

    // Screen shake + slow-mo for big explosions
    const isLarge = c.explosion === 'large';
    const isMedium = c.explosion === 'medium';
    const shakeAmt = isLarge ? 0.008 : isMedium ? 0.005 : 0.002;
    const shakeDur = isLarge ? 150 : isMedium ? 80 : 40;
    this.cameras.main.shake(shakeDur, shakeAmt);
    if (isLarge) {
      this.time.timeScale = 0.3;
      this.time.delayedCall(150, () => { this.time.timeScale = 1; });
    }
  }

  // ======================== EFFECTS ========================
  spawnExplosion(x, y, type) {
    const ak = `explosion-${type}`, sk = `explosion-${type}-ss`;
    if (this.anims.exists(ak) && this.textures.exists(sk)) {
      const s = this.add.sprite(x, y, sk, 0).setDepth(10);
      s.setScale({ quick: 1.5, small: 2, medium: 2.5, large: 3 }[type] || 2);
      s.play(ak); s.on('animationcomplete', () => s.destroy());
    } else {
      const sz = { quick: 15, small: 25, medium: 40, large: 60 }[type] || 25;
      const flash = this.add.circle(x, y, sz, 0xffaa00, 0.8).setDepth(10);
      this.tweens.add({ targets: flash, scaleX: 2.5, scaleY: 2.5, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
      const ring = this.add.circle(x, y, sz * 0.6, 0xff4400, 0.6).setDepth(11);
      this.tweens.add({ targets: ring, scaleX: 3, scaleY: 3, alpha: 0, duration: 250, onComplete: () => ring.destroy() });
    }
    // Debris particles
    this.spawnDebris(x, y, type);
  }

  spawnDebris(x, y, type) {
    const count = { quick: 3, small: 5, medium: 8, large: 12 }[type] || 5;
    for (let i = 0; i < count; i++) {
      const sz = Phaser.Math.Between(2, 6);
      const color = Phaser.Utils.Array.GetRandom([0x8b6914, 0xaa5522, 0x666666, 0x444444, 0xff4400]);
      const p = this.add.rectangle(x, y, sz, sz, color).setDepth(11);
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 200;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed + 60,
        alpha: 0, rotation: Math.random() * 6,
        duration: 400 + Math.random() * 400,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }

  spawnHit(x, y) {
    if (this.anims.exists('hit-effect')) {
      const h = this.add.sprite(x, y, 'hit-1').setDepth(11).setScale(2);
      h.play('hit-effect'); h.on('animationcomplete', () => h.destroy());
    }
  }

  spawnDustPoof(x, y) {
    if (this.anims.exists('dust-poof')) {
      const d = this.add.sprite(x, y, 'dust-poof-ss', 0).setDepth(8).setScale(1.5).setAlpha(0.7);
      d.play('dust-poof'); d.on('animationcomplete', () => d.destroy());
    } else {
      // Procedural dust
      for (let i = 0; i < 4; i++) {
        const c = this.add.circle(x + Phaser.Math.Between(-10, 10), y, Phaser.Math.Between(3, 8), 0x886644, 0.5).setDepth(8);
        this.tweens.add({ targets: c, y: y - 20, alpha: 0, scaleX: 2, scaleY: 2, duration: 400, onComplete: () => c.destroy() });
      }
    }
  }

  showPopup(x, y, text, color = '#ffff00') {
    const p = this.add.text(x, y, text, {
      fontFamily: 'monospace', fontSize: '16px', color, stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: p, y: y - 50, alpha: 0, scaleX: 1.2, scaleY: 1.2, duration: 800, ease: 'Power2', onComplete: () => p.destroy() });
  }

  // ======================== TOUCH CONTROLS ========================
  createTouchControls() {
    // Only show on touch-capable devices
    if (!this.sys.game.device.input.touch) return;

    const d = 120, btnAlpha = 0.25, btnSize = 60;
    const makeBtn = (x, y, text) => {
      const bg = this.add.circle(x, y, btnSize / 2, 0xffffff, btnAlpha).setScrollFactor(0).setDepth(200).setInteractive();
      this.add.text(x, y, text, { fontFamily: 'monospace', fontSize: '18px', color: '#fff' }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
      return bg;
    };

    this.touchState = { left: false, right: false, up: false, down: false, boost: false, jump: false };

    const leftBtn = makeBtn(70, GAME_HEIGHT - 70, '◄');
    const rightBtn = makeBtn(170, GAME_HEIGHT - 70, '►');
    const jumpBtn = makeBtn(120, GAME_HEIGHT - 140, 'J');
    const upBtn = makeBtn(GAME_WIDTH - 170, GAME_HEIGHT - 130, '▲');
    const downBtn = makeBtn(GAME_WIDTH - 170, GAME_HEIGHT - 50, '▼');
    const boostBtn = makeBtn(GAME_WIDTH - 70, GAME_HEIGHT - 90, 'N');

    const bind = (btn, key) => {
      btn.on('pointerdown', () => { this.touchState[key] = true; });
      btn.on('pointerup', () => { this.touchState[key] = false; });
      btn.on('pointerout', () => { this.touchState[key] = false; });
    };
    bind(leftBtn, 'left'); bind(rightBtn, 'right');
    bind(upBtn, 'up'); bind(downBtn, 'down');
    bind(boostBtn, 'boost'); bind(jumpBtn, 'jump');
  }

  // ======================== HUD ========================
  createHUD() {
    const d = 100;
    // Level name
    this.add.text(GAME_WIDTH / 2, 6, this.levelCfg.name, {
      fontFamily: 'monospace', fontSize: '13px', color: '#777', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(d + 2);

    this.add.text(22, 6, 'HEALTH', { fontFamily: 'monospace', fontSize: '11px', color: '#aaa', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(d + 2);
    this.healthBarBg = this.add.rectangle(22, 22, 200, 18, 0x333333).setOrigin(0, 0).setScrollFactor(0).setDepth(d);
    this.healthBarFill = this.add.rectangle(23, 23, 198, 16, 0x44ff44).setOrigin(0, 0).setScrollFactor(0).setDepth(d + 1);

    this.add.text(22, 46, 'NITRO', { fontFamily: 'monospace', fontSize: '11px', color: '#aaa', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(d + 2);
    this.boostBarBg = this.add.rectangle(22, 62, 200, 18, 0x333333).setOrigin(0, 0).setScrollFactor(0).setDepth(d);
    this.boostBarFill = this.add.rectangle(23, 63, 198, 16, 0x44aaff).setOrigin(0, 0).setScrollFactor(0).setDepth(d + 1);

    this.scoreText = this.add.text(GAME_WIDTH - 20, 14, 'SCORE: 0', { fontFamily: 'monospace', fontSize: '22px', color: '#ffff00', stroke: '#000', strokeThickness: 3 }).setOrigin(1, 0).setScrollFactor(0).setDepth(d + 2);
    this.destroyedText = this.add.text(GAME_WIDTH - 20, 42, 'DESTROYED: 0', { fontFamily: 'monospace', fontSize: '12px', color: '#ff8800', stroke: '#000', strokeThickness: 2 }).setOrigin(1, 0).setScrollFactor(0).setDepth(d + 2);
    this.distanceText = this.add.text(GAME_WIDTH - 20, 58, 'DISTANCE: 0m', { fontFamily: 'monospace', fontSize: '12px', color: '#ccc', stroke: '#000', strokeThickness: 2 }).setOrigin(1, 0).setScrollFactor(0).setDepth(d + 2);
    this.gemsText = this.add.text(22, 86, 'GEMS: 0', { fontFamily: 'monospace', fontSize: '12px', color: '#44ffaa', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(d + 2);

    this.comboText = this.add.text(GAME_WIDTH / 2, 50, '', { fontFamily: 'monospace', fontSize: '28px', color: '#ff8800', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 2).setAlpha(0);
    this.airTimeText = this.add.text(GAME_WIDTH / 2, 90, '', { fontFamily: 'monospace', fontSize: '26px', color: '#ff8844', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 2).setAlpha(0);
    this.flipText = this.add.text(GAME_WIDTH / 2, 130, '', { fontFamily: 'monospace', fontSize: '30px', color: '#ff4444', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 2).setAlpha(0);
    this.speedText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 28, '', { fontFamily: 'monospace', fontSize: '13px', color: '#999', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 2);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 10, 'ARROWS: Drive/Lean  |  W: Jump  |  SPACE: Boost  |  R: Restart  |  ESC: Menu', { fontFamily: 'monospace', fontSize: '10px', color: '#555' }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 2);
    this.progressBg = this.add.rectangle(GAME_WIDTH / 2, 26, 300, 6, 0x222222).setScrollFactor(0).setDepth(d);
    this.progressFill = this.add.rectangle(GAME_WIDTH / 2 - 149, 26, 2, 4, 0xff4444).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d + 1);
  }

  // ======================== UPDATE ========================
  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) { this.cleanUp(); this.scene.restart({ level: this.levelId }); return; }
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) { this.cleanUp(); this.scene.start('MenuScene'); return; }
    if (this.gameOver) return;
    this.audioManager.resume();

    // Merge touch with keyboard
    const cursors = this.getMergedInput();
    const virtualSpace = { isDown: this.spacebar.isDown || (this.touchState && this.touchState.boost) };
    const virtualJump = { isDown: this.jumpKey.isDown || (this.touchState && this.touchState.jump) };

    if (Phaser.Input.Keyboard.JustDown(this.spacebar) && this.truck.boostFuel > 0) this.audioManager.playBoost();

    this.truck.update(cursors, virtualSpace, delta, virtualJump);
    this.scoreManager.update(delta);
    this.handleTruckScoring();
    this.updateHUD(delta);
    this.checkWaterHazards();
    this.checkChallenges();

    const pos = this.truck.getPosition();
    if (pos.y > 850 || this.truck.health <= 0) this.triggerGameOver();
    if (pos.x >= this.terrain.getFinishX()) this.triggerLevelComplete();
  }

  getMergedInput() {
    const ts = this.touchState || {};
    return {
      left: { isDown: this.cursors.left.isDown || ts.left },
      right: { isDown: this.cursors.right.isDown || ts.right },
      up: { isDown: this.cursors.up.isDown || ts.up },
      down: { isDown: this.cursors.down.isDown || ts.down },
    };
  }

  handleTruckScoring() {
    const t = this.truck;
    if (t.justLanded && t.lastAirDuration > 0.3) {
      const ap = this.scoreManager.addAirTimePoints(t.lastAirDuration);
      // Dust on landing
      this.spawnDustPoof(t.getPosition().x, t.getPosition().y + 25);
      if (t.lastFlipsDone > 0) {
        const fp = this.scoreManager.addFlipPoints(t.lastFlipsDone);
        this.showPopup(t.getPosition().x, t.getPosition().y - 60, `${t.lastFlipsDone}x FLIP! +${fp}`, '#ff4444');
        this.audioManager.playFlip();
      } else if (t.lastAirDuration >= 1) {
        this.showPopup(t.getPosition().x, t.getPosition().y - 40, `AIR TIME! +${ap}`, '#44ccff');
      }
    }
  }

  checkWaterHazards() {
    const pos = this.truck.getPosition();
    for (const wz of this.waterZones) {
      if (pos.x >= wz.x1 && pos.x <= wz.x2 && pos.y >= wz.y - 20) {
        // Splash effect
        if (this.anims.exists('water-splash')) {
          const s = this.add.sprite(pos.x, wz.y - 10, 'splash-1').setDepth(12).setScale(2);
          s.play('water-splash'); s.on('animationcomplete', () => s.destroy());
        }
        this.truck.health -= 0.3; // Slow water damage
      }
    }
  }

  updateHUD(delta) {
    const t = this.truck, sm = this.scoreManager;
    const hp = t.health / t.maxHealth;
    this.healthBarFill.setDisplaySize(198 * hp, 16);
    this.healthBarFill.setFillStyle(hp > 0.5 ? 0x44ff44 : hp > 0.25 ? 0xffaa00 : 0xff4444);
    const bp = t.boostFuel / t.maxBoostFuel;
    this.boostBarFill.setDisplaySize(198 * bp, 16);
    this.boostBarFill.setFillStyle(t.isBoosting ? 0xff6600 : 0x44aaff);
    this.scoreText.setText(`SCORE: ${sm.score}`);
    this.destroyedText.setText(`DESTROYED: ${sm.objectsDestroyed}`);
    this.distanceText.setText(`DISTANCE: ${Math.max(0, Math.floor((t.getPosition().x - this.startX) / 10))}m`);
    this.gemsText.setText(`GEMS: ${sm.gemsCollected}`);
    this.progressFill.setDisplaySize(298 * Phaser.Math.Clamp((t.getPosition().x - this.startX) / (this.terrain.getFinishX() - this.startX), 0, 1), 4);

    if (sm.comboMultiplier > 1) {
      this.comboText.setText(`COMBO x${sm.comboMultiplier}`);
      this.comboText.setAlpha(1);
      this.comboText.setColor(sm.comboMultiplier >= 6 ? '#ff2222' : sm.comboMultiplier >= 4 ? '#ff8800' : '#ffaa00');
    } else {
      this.comboText.setAlpha(Math.max(0, this.comboText.alpha - delta * 0.004));
    }

    if (t.airTime > 0.5) { this.airTimeText.setText(`AIR: ${t.airTime.toFixed(1)}s`); this.airTimeText.setAlpha(1); }
    else this.airTimeText.setAlpha(Math.max(0, this.airTimeText.alpha - delta * 0.004));

    if (t.airTime > 0 && Math.abs(t.totalRotation) > Math.PI * 0.9) {
      const rots = Math.abs(t.totalRotation) / (Math.PI * 2);
      this.flipText.setText(rots >= 0.9 ? `${Math.floor(rots + 0.1)}x FLIP!` : 'FLIP!');
      this.flipText.setAlpha(1);
    } else if (t.airTime <= 0) this.flipText.setAlpha(Math.max(0, this.flipText.alpha - delta * 0.004));

    this.speedText.setText(`${Math.floor(Math.abs(t.getVelocity().x) * 15)} km/h`);
  }

  // ======================== CHALLENGES ========================
  createChallengeHUD() {
    const d = 100;
    const challenges = this.challengeManager.getChallenges();
    this.challengeTexts = [];
    const baseY = 108;

    this.add.text(22, baseY, 'CHALLENGES', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ff8800',
      stroke: '#000', strokeThickness: 2
    }).setScrollFactor(0).setDepth(d + 2);

    challenges.forEach((ch, i) => {
      const y = baseY + 14 + i * 16;
      const ct = this.add.text(22, y, `[ ] ${ch.text}`, {
        fontFamily: 'monospace', fontSize: '10px', color: '#888',
        stroke: '#000', strokeThickness: 1
      }).setScrollFactor(0).setDepth(d + 2);
      this.challengeTexts.push(ct);
    });
  }

  checkChallenges() {
    // Build live stats for challenge checking
    const stats = {
      ...this.scoreManager.getStats(),
      finishHealth: this.truck.health,
    };

    const newlyCompleted = this.challengeManager.checkProgress(stats);
    for (const ch of newlyCompleted) {
      // Flash the challenge text
      const idx = this.challengeManager.getChallenges().indexOf(ch);
      if (idx >= 0 && this.challengeTexts[idx]) {
        const ct = this.challengeTexts[idx];
        ct.setText(`[X] ${ch.text}`);
        ct.setColor('#44ff44');
        // Big popup
        const pos = this.truck.getPosition();
        this.showPopup(pos.x, pos.y - 80, 'CHALLENGE COMPLETE!', '#44ff44');

        // Palette unlock notification
        const paletteName = PALETTES[ch.palette] ? PALETTES[ch.palette].name : ch.palette;
        this.time.delayedCall(400, () => {
          this.showPopup(pos.x, pos.y - 100, `Unlocked: ${paletteName}`, '#ffaa00');
        });
      }
    }

    // Update uncompleted challenge text with progress
    const challenges = this.challengeManager.getChallenges();
    for (let i = 0; i < challenges.length; i++) {
      if (challenges[i].completed) continue;
      const current = stats[challenges[i].stat] || 0;
      const display = typeof current === 'number' && current % 1 !== 0
        ? current.toFixed(1) : Math.floor(current);
      this.challengeTexts[i].setText(`[ ] ${challenges[i].text}  (${display}/${challenges[i].target})`);
    }
  }

  // ======================== START / FINISH ========================
  showStartMessage() {
    const lc = this.levelCfg;
    const t1 = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 70, lc.name, {
      fontFamily: 'monospace', fontSize: '48px', color: '#ff3333', stroke: '#000', strokeThickness: 6, align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    const t2 = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, lc.subtitle, {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffaa00', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    const t3 = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'Press RIGHT ARROW to drive!', {
      fontFamily: 'monospace', fontSize: '18px', color: '#fff', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.tweens.add({ targets: t3, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
    this.input.keyboard.once('keydown', () => {
      this.tweens.add({ targets: [t1, t2, t3], alpha: 0, duration: 400, onComplete: () => { t1.destroy(); t2.destroy(); t3.destroy(); } });
    });
    // Also dismiss on touch
    this.input.once('pointerdown', () => {
      this.tweens.add({ targets: [t1, t2, t3], alpha: 0, duration: 400, onComplete: () => { t1.destroy(); t2.destroy(); t3.destroy(); } });
    });
  }

  createFinishLine() {
    const fx = this.terrain.getFinishX();
    const g = this.add.graphics().setDepth(1);
    const flagW = 30, flagH = 120, ts = 10;
    for (let r = 0; r < flagH / ts; r++)
      for (let c = 0; c < flagW / ts; c++) {
        g.fillStyle((r + c) % 2 === 0 ? 0xffffff : 0x111111);
        g.fillRect(fx + c * ts, TERRAIN.BASE_Y - flagH + r * ts, ts, ts);
      }
    g.fillStyle(0x888888); g.fillRect(fx - 2, TERRAIN.BASE_Y - flagH - 20, 4, flagH + 20);
    this.add.text(fx + 15, TERRAIN.BASE_Y - flagH - 30, 'FINISH', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffff00', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 1).setDepth(1);
  }

  // ======================== GAME OVER / COMPLETE ========================
  triggerGameOver() {
    this.gameOver = true;
    this.audioManager.playGameOver();
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5).setScrollFactor(0).setDepth(190);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'WRECKED!', {
      fontFamily: 'monospace', fontSize: '48px', color: '#ff2222', stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 15, `Score: ${this.scoreManager.score}  |  Destroyed: ${this.scoreManager.objectsDestroyed}`, {
      fontFamily: 'monospace', fontSize: '20px', color: '#fff', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 55, 'Press R to restart  |  ESC for menu', {
      fontFamily: 'monospace', fontSize: '16px', color: '#aaa', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
  }

  triggerLevelComplete() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.gameOver = true;
    this.audioManager.playLevelComplete();

    // Record finish health before saving
    this.scoreManager.finishHealth = this.truck.health;

    // Final challenge check with finish health
    const finalStats = {
      ...this.scoreManager.getStats(),
      finishHealth: this.truck.health,
    };
    this.challengeManager.checkProgress(finalStats);

    // Save score and challenge unlocks
    this.saveBestScore();
    const newPalettes = this.challengeManager.saveUnlocks();
    const allUnlocked = ChallengeManager.checkAllUnlocked();

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'LEVEL COMPLETE!', {
      fontFamily: 'monospace', fontSize: '44px', color: '#44ff44', stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    this.time.delayedCall(2000, () => {
      this.cleanUp();
      this.scene.start('ScoreScene', {
        stats: finalStats,
        levelName: this.levelCfg.name,
        levelId: this.levelId,
        stars: this.levelCfg.stars,
        challenges: this.challengeManager.getChallenges(),
        newPalettes,
        allUnlocked,
      });
    });
  }

  saveBestScore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BEST_SCORES);
      const scores = raw ? JSON.parse(raw) : {};
      const prev = scores[this.levelId] || 0;
      if (this.scoreManager.score > prev) scores[this.levelId] = this.scoreManager.score;
      localStorage.setItem(STORAGE_KEYS.BEST_SCORES, JSON.stringify(scores));

      // Unlock next level
      const raw2 = localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVELS);
      const unlocked = raw2 ? JSON.parse(raw2) : [1];
      const next = this.levelId + 1;
      if (next <= 3 && !unlocked.includes(next)) {
        unlocked.push(next);
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVELS, JSON.stringify(unlocked));
      }
    } catch (e) { console.warn('Failed to save score', e); }
  }

  cleanUp() {
    this.audioManager.destroy();
  }
}
