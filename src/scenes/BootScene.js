import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const { width, height } = this.cameras.main;
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'LOADING...', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ff4444'
    }).setOrigin(0.5);

    this.load.on('progress', (v) => {
      progressBar.clear(); progressBar.fillStyle(0xff4444, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * v, 30);
    });
    this.load.on('complete', () => { progressBar.destroy(); progressBox.destroy(); loadingText.destroy(); });

    this.loadedAssets = new Set();
    this.load.on('filecomplete', (key) => this.loadedAssets.add(key));

    // ========== LEVEL 1: Junkyard ==========
    this.load.image('junk-back', 'assets/environments/level1/back.png');
    this.load.image('junk-middle', 'assets/environments/level1/middle.png');
    this.load.image('junk-near', 'assets/environments/level1/near.png');
    this.load.image('junk-tileset', 'assets/environments/level1/tileset.png');

    // ========== LEVEL 2: Mountain / Rocky Pass / Canyon ==========
    this.load.image('rocky-back', 'assets/environments/level2/back.png');
    this.load.image('rocky-middle', 'assets/environments/level2/middle.png');
    this.load.image('rocky-near', 'assets/environments/level2/near.png');
    this.load.image('rocky-tileset', 'assets/environments/level2/tileset.png');
    // Canyon (Mountain Dusk Version C)
    this.load.image('canyon-sky', 'assets/environments/level2/canyon/sky.png');
    this.load.image('canyon-far-mtn', 'assets/environments/level2/canyon/far-mountains.png');
    this.load.image('canyon-clouds', 'assets/environments/level2/canyon/clouds.png');
    this.load.image('canyon-wall', 'assets/environments/level2/canyon/canyon.png');
    this.load.image('canyon-front', 'assets/environments/level2/canyon/front.png');
    // Props
    this.load.image('crystal-1', 'assets/environments/level2/props/crystal-1.png');
    this.load.image('crystal-2', 'assets/environments/level2/props/crystal-2.png');
    this.load.image('plant-1', 'assets/environments/level2/props/plant-1.png');
    this.load.image('plant-2', 'assets/environments/level2/props/plant-2.png');

    // ========== LEVEL 3: Urban ==========
    this.load.image('urban-sky', 'assets/environments/level3/sky.png');
    this.load.image('urban-buildings', 'assets/environments/level3/buildings.png');
    this.load.image('urban-clouds', 'assets/environments/level3/clouds.png');
    this.load.image('urban-trees', 'assets/environments/level3/trees.png');
    this.load.image('urban-tileset', 'assets/environments/level3/tileset.png');
    this.load.image('country-back', 'assets/environments/level3/country/back.png');
    this.load.image('country-forest', 'assets/environments/level3/country/forest.png');
    this.load.image('country-tileset', 'assets/environments/level3/country/tileset.png');
    this.load.image('colorful-tileset', 'assets/environments/level3/colorful-tileset.png');

    // ========== Parallax: Mountain Dusk (Version A, shared) ==========
    this.load.image('bg-sky', 'assets/environments/parallax/sky.png');
    this.load.image('bg-far-clouds', 'assets/environments/parallax/far-clouds.png');
    this.load.image('bg-far-mountains', 'assets/environments/parallax/far-mountains.png');
    this.load.image('bg-mountains', 'assets/environments/parallax/mountains.png');
    this.load.image('bg-near-clouds', 'assets/environments/parallax/near-clouds.png');
    this.load.image('bg-trees', 'assets/environments/parallax/trees.png');

    // ========== Tilesets (shared) ==========
    this.load.image('tileset-modular', 'assets/environments/tilesets/modular-tileset.png');
    this.load.image('rocks', 'assets/sprites/obstacles/all-rock-tiles.png');

    // ========== Explosions ==========
    this.load.image('explosion-small-img', 'assets/sprites/explosions/explosion-small.png');
    this.load.image('explosion-medium-img', 'assets/sprites/explosions/explosion-medium.png');
    this.load.image('explosion-large-img', 'assets/sprites/explosions/explosion-large.png');
    this.load.image('explosion-quick-img', 'assets/sprites/explosions/explosion-quick.png');

    // ========== Hit & Effects ==========
    this.load.image('hit-1', 'assets/sprites/effects/hit/hit1.png');
    this.load.image('hit-2', 'assets/sprites/effects/hit/hit2.png');
    this.load.image('hit-3', 'assets/sprites/effects/hit/hit3.png');
    this.load.image('spark-img', 'assets/sprites/effects/spark.png');
    // Water splash
    this.load.image('splash-1', 'assets/sprites/effects/water-splash/frame1.png');
    this.load.image('splash-2', 'assets/sprites/effects/water-splash/frame2.png');
    this.load.image('splash-3', 'assets/sprites/effects/water-splash/frame3.png');
    // Grotto FX
    this.load.image('dust-poof-img', 'assets/sprites/effects/grotto/dust-poof.png');
    this.load.image('impact-smack-img', 'assets/sprites/effects/grotto/impact-smack.png');

    // ========== Vehicles ==========
    this.load.image('vehicle-1', 'assets/sprites/vehicles/vehicle-1.png');
    this.load.image('vehicle-2', 'assets/sprites/vehicles/vehicle-2.png');
    this.load.image('vehicle-3', 'assets/sprites/vehicles/vehicle-3.png');
    this.load.image('tank-wreck', 'assets/sprites/vehicles/tank.png');

    // ========== Characters ==========
    this.load.image('crow-fly-img', 'assets/sprites/characters/crow/crow-fly.png');
    this.load.image('bird-fly-img', 'assets/sprites/characters/bird/flying-bird.png');
    this.load.image('dancer-img', 'assets/sprites/characters/dancer/dancer.png');

    // ========== Collectibles ==========
    this.load.image('gems-img', 'assets/sprites/collectibles/gems.png');

    // ========== Truck ==========
    this.load.image('truck-body-file', 'assets/sprites/truck/truck-body.png');
    this.load.image('truck-wheel-file', 'assets/sprites/truck/truck-wheel.png');
  }

  create() {
    this.registry.set('loadedAssets', this.loadedAssets);
    this.createTruckBodyTexture();
    this.createWheelTexture();
    this.createObjectTextures();
    this.createHazardTextures();
    this.createExplosionAnimations();
    this.createHitAnimation();
    this.createSplashAnimation();
    this.createCharacterAnimations();
    this.createDustAnimation();
    this.scene.start('MenuScene');
  }

  // ====================== EXPLOSION ANIMATIONS ======================
  createExplosionAnimations() {
    const configs = [
      { name: 'quick',  src: 'explosion-quick-img',  frames: 7,  rate: 18 },
      { name: 'small',  src: 'explosion-small-img',  frames: 8,  rate: 16 },
      { name: 'medium', src: 'explosion-medium-img', frames: 10, rate: 14 },
      { name: 'large',  src: 'explosion-large-img',  frames: 12, rate: 12 },
    ];
    for (const c of configs) {
      if (!this.loadedAssets.has(c.src)) continue;
      try {
        const img = this.textures.get(c.src).getSourceImage();
        const fw = Math.floor(img.width / c.frames);
        const fh = img.height;
        const ssKey = `explosion-${c.name}-ss`;
        this.textures.addSpriteSheet(ssKey, img, { frameWidth: fw, frameHeight: fh });
        this.anims.create({
          key: `explosion-${c.name}`,
          frames: this.anims.generateFrameNumbers(ssKey, { start: 0, end: c.frames - 1 }),
          frameRate: c.rate, repeat: 0,
        });
      } catch (e) { console.warn(`Explosion ${c.name} anim failed`, e); }
    }
  }

  createHitAnimation() {
    if (['hit-1', 'hit-2', 'hit-3'].every(k => this.loadedAssets.has(k))) {
      this.anims.create({
        key: 'hit-effect',
        frames: [{ key: 'hit-1' }, { key: 'hit-2' }, { key: 'hit-3' }],
        frameRate: 15, repeat: 0,
      });
    }
  }

  createSplashAnimation() {
    if (['splash-1', 'splash-2', 'splash-3'].every(k => this.loadedAssets.has(k))) {
      this.anims.create({
        key: 'water-splash',
        frames: [{ key: 'splash-1' }, { key: 'splash-2' }, { key: 'splash-3' }],
        frameRate: 10, repeat: 0,
      });
    }
  }

  createCharacterAnimations() {
    // Crow fly — spritesheet
    if (this.loadedAssets.has('crow-fly-img')) {
      try {
        const img = this.textures.get('crow-fly-img').getSourceImage();
        const frames = 2;
        this.textures.addSpriteSheet('crow-fly-ss', img, { frameWidth: Math.floor(img.width / frames), frameHeight: img.height });
        this.anims.create({ key: 'crow-fly', frames: this.anims.generateFrameNumbers('crow-fly-ss', { start: 0, end: frames - 1 }), frameRate: 6, repeat: -1 });
      } catch (e) { console.warn('Crow anim failed', e); }
    }

    // Flying bird — spritesheet (7 frames)
    if (this.loadedAssets.has('bird-fly-img')) {
      try {
        const img = this.textures.get('bird-fly-img').getSourceImage();
        const frames = 7;
        this.textures.addSpriteSheet('bird-fly-ss', img, { frameWidth: Math.floor(img.width / frames), frameHeight: img.height });
        this.anims.create({ key: 'bird-fly', frames: this.anims.generateFrameNumbers('bird-fly-ss', { start: 0, end: frames - 1 }), frameRate: 10, repeat: -1 });
      } catch (e) { console.warn('Bird anim failed', e); }
    }

    // Dancer — spritesheet (8 frames)
    if (this.loadedAssets.has('dancer-img')) {
      try {
        const img = this.textures.get('dancer-img').getSourceImage();
        const frames = 8;
        this.textures.addSpriteSheet('dancer-ss', img, { frameWidth: Math.floor(img.width / frames), frameHeight: img.height });
        this.anims.create({ key: 'dancer-dance', frames: this.anims.generateFrameNumbers('dancer-ss', { start: 0, end: frames - 1 }), frameRate: 8, repeat: -1 });
      } catch (e) { console.warn('Dancer anim failed', e); }
    }
  }

  createDustAnimation() {
    // Dust poof — enemy-death spritesheet (8 frames)
    if (this.loadedAssets.has('dust-poof-img')) {
      try {
        const img = this.textures.get('dust-poof-img').getSourceImage();
        const frames = 8;
        this.textures.addSpriteSheet('dust-poof-ss', img, { frameWidth: Math.floor(img.width / frames), frameHeight: img.height });
        this.anims.create({ key: 'dust-poof', frames: this.anims.generateFrameNumbers('dust-poof-ss', { start: 0, end: frames - 1 }), frameRate: 14, repeat: 0 });
      } catch (e) { console.warn('Dust poof anim failed', e); }
    }
  }

  // ====================== PROCEDURAL TEXTURES ======================
  createObjectTextures() {
    // Crate
    let g = this.make.graphics({ add: false });
    g.fillStyle(0x8b6914); g.fillRect(0, 0, 28, 28);
    g.fillStyle(0x9b7924); g.fillRect(2, 2, 24, 24);
    g.lineStyle(2, 0x6b4904);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(28, 28); g.moveTo(28, 0); g.lineTo(0, 28); g.strokePath();
    g.fillStyle(0xcccccc); g.fillRect(2, 2, 2, 2); g.fillRect(24, 2, 2, 2); g.fillRect(2, 24, 2, 2); g.fillRect(24, 24, 2, 2);
    g.lineStyle(1, 0x5b3900); g.strokeRect(0, 0, 28, 28);
    g.generateTexture('crate', 28, 28); g.destroy();

    // Barrel
    g = this.make.graphics({ add: false });
    g.fillStyle(0xcc3333); g.fillRoundedRect(1, 0, 20, 30, 3);
    g.fillStyle(0x888888); g.fillRect(0, 4, 22, 3); g.fillRect(0, 23, 22, 3);
    g.fillStyle(0xdd5555); g.fillRect(4, 8, 4, 14);
    g.fillStyle(0xffaa00); g.fillRect(8, 12, 6, 6);
    g.fillStyle(0x222222); g.fillRect(9, 13, 4, 4);
    g.generateTexture('barrel', 22, 30); g.destroy();

    // Rock pile
    g = this.make.graphics({ add: false });
    g.fillStyle(0x6a6a6a); g.fillCircle(10, 20, 10); g.fillCircle(26, 22, 8); g.fillCircle(18, 16, 9);
    g.fillStyle(0x8a8a8a); g.fillCircle(8, 18, 4); g.fillCircle(24, 20, 3); g.fillCircle(16, 8, 6);
    g.fillStyle(0x5a5a5a); g.fillCircle(16, 8, 5);
    g.generateTexture('rock-pile', 36, 28); g.destroy();

    // Gem
    g = this.make.graphics({ add: false });
    const s = 18;
    g.fillStyle(0x44ffaa);
    g.beginPath(); g.moveTo(s/2,0); g.lineTo(s,s/2); g.lineTo(s/2,s); g.lineTo(0,s/2); g.closePath(); g.fill();
    g.fillStyle(0xaaffdd);
    g.beginPath(); g.moveTo(s/2,3); g.lineTo(s/2+3,s/2); g.lineTo(s/2,s/2+2); g.lineTo(s/2-2,s/2); g.closePath(); g.fill();
    g.lineStyle(1, 0x22aa77);
    g.beginPath(); g.moveTo(s/2,0); g.lineTo(s,s/2); g.lineTo(s/2,s); g.lineTo(0,s/2); g.closePath(); g.strokePath();
    g.generateTexture('gem', s, s); g.destroy();

    // Crystal (Level 2 prop)
    g = this.make.graphics({ add: false });
    g.fillStyle(0x8844cc);
    g.beginPath(); g.moveTo(9, 0); g.lineTo(18, 15); g.lineTo(14, 30); g.lineTo(4, 30); g.lineTo(0, 15); g.closePath(); g.fill();
    g.fillStyle(0xaa66ee);
    g.beginPath(); g.moveTo(9, 2); g.lineTo(14, 12); g.lineTo(9, 18); g.lineTo(4, 12); g.closePath(); g.fill();
    g.lineStyle(1, 0x6622aa);
    g.beginPath(); g.moveTo(9, 0); g.lineTo(18, 15); g.lineTo(14, 30); g.lineTo(4, 30); g.lineTo(0, 15); g.closePath(); g.strokePath();
    if (!this.textures.exists('crystal')) g.generateTexture('crystal', 18, 30);
    g.destroy();

    // Plant (Level 2 prop)
    g = this.make.graphics({ add: false });
    g.fillStyle(0x44aa44);
    g.fillEllipse(12, 18, 20, 22);
    g.fillStyle(0x338833);
    g.fillEllipse(8, 12, 10, 14);
    g.fillStyle(0x55cc55);
    g.fillEllipse(16, 10, 8, 12);
    g.fillStyle(0x664422);
    g.fillRect(10, 24, 4, 6);
    if (!this.textures.exists('plant')) g.generateTexture('plant', 24, 28);
    g.destroy();
  }

  // ====================== HAZARD TEXTURES ======================
  createHazardTextures() {
    // Spike strip — metallic spikes
    let g = this.make.graphics({ add: false });
    g.fillStyle(0x555555); g.fillRect(0, 6, 48, 8);
    g.fillStyle(0x888888);
    for (let i = 0; i < 8; i++) {
      const sx = 3 + i * 6;
      g.beginPath(); g.moveTo(sx, 6); g.lineTo(sx + 3, 0); g.lineTo(sx + 6, 6); g.closePath(); g.fill();
    }
    g.fillStyle(0xffaa00); g.fillRect(0, 0, 2, 14); g.fillRect(46, 0, 2, 14);
    g.generateTexture('hazard-spikes', 48, 14); g.destroy();

    // Mine — dark disc with red indicator
    g = this.make.graphics({ add: false });
    g.fillStyle(0x333333); g.fillCircle(11, 11, 10);
    g.fillStyle(0x444444); g.fillCircle(11, 9, 8);
    g.fillStyle(0xff0000); g.fillCircle(11, 9, 3);
    g.fillStyle(0xff4444); g.fillCircle(11, 8, 1);
    g.lineStyle(1, 0x222222); g.strokeCircle(11, 11, 10);
    g.generateTexture('hazard-mine', 22, 18); g.destroy();

    // TNT — red crate with TNT label
    g = this.make.graphics({ add: false });
    g.fillStyle(0xcc0000); g.fillRect(0, 0, 26, 30);
    g.fillStyle(0xdd2222); g.fillRect(2, 2, 22, 26);
    g.fillStyle(0xffcc00); g.fillRect(4, 10, 18, 10);
    g.fillStyle(0xcc0000); g.fillRect(6, 12, 14, 6);
    // T-N-T letters approximation
    g.fillStyle(0xffffff);
    g.fillRect(7, 13, 4, 1); g.fillRect(8, 13, 2, 4); // T
    g.fillRect(13, 13, 1, 4); g.fillRect(13, 13, 3, 1); g.fillRect(16, 13, 1, 4); g.fillRect(13, 15, 3, 1); // N approx
    // Fuse
    g.fillStyle(0x886644); g.fillRect(12, 0, 2, 4);
    g.fillStyle(0xff8800); g.fillCircle(13, 0, 2);
    g.lineStyle(1, 0x990000); g.strokeRect(0, 0, 26, 30);
    g.generateTexture('hazard-tnt', 26, 30); g.destroy();

    // Fire pit — orange/red glow base
    g = this.make.graphics({ add: false });
    g.fillStyle(0x331100); g.fillRect(0, 8, 50, 12);
    g.fillStyle(0xff4400, 0.6);
    g.fillEllipse(25, 10, 46, 14);
    g.fillStyle(0xff8800, 0.4);
    g.fillEllipse(25, 8, 36, 10);
    g.fillStyle(0xffcc00, 0.3);
    g.fillEllipse(25, 7, 20, 6);
    g.generateTexture('hazard-fire', 50, 20); g.destroy();

    // Oil slick — dark puddle
    g = this.make.graphics({ add: false });
    g.fillStyle(0x111122, 0.8);
    g.fillEllipse(30, 5, 58, 10);
    g.fillStyle(0x222244, 0.4);
    g.fillEllipse(30, 5, 40, 7);
    g.fillStyle(0x4444aa, 0.2);
    g.fillEllipse(22, 4, 12, 4);
    g.generateTexture('hazard-oil', 60, 10); g.destroy();
  }

  createTruckBodyTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x2a2a2a); g.fillRect(12, 44, 106, 10);
    g.fillStyle(0x555555); g.fillRect(22, 48, 6, 12); g.fillRect(102, 48, 6, 12);
    g.fillStyle(0xdd2222); g.fillRect(18, 14, 94, 32);
    g.fillStyle(0xbb1a1a); g.fillRect(40, 4, 46, 14);
    g.fillStyle(0x5588cc); g.fillRect(78, 6, 16, 18);
    g.fillStyle(0x77aaee); g.fillRect(80, 8, 4, 14);
    g.fillStyle(0x4477aa); g.fillRect(44, 6, 12, 12);
    g.fillStyle(0x888888); g.fillRect(108, 20, 14, 24);
    g.fillStyle(0x999999); g.fillRect(110, 22, 10, 20);
    g.fillStyle(0x888888); g.fillRect(8, 20, 12, 24);
    g.fillStyle(0xffff44); g.fillRect(118, 24, 6, 6);
    g.fillStyle(0xffdd22); g.fillRect(118, 34, 6, 6);
    g.fillStyle(0xff2200); g.fillRect(8, 24, 4, 6);
    g.fillStyle(0xff4400); g.fillRect(8, 34, 4, 6);
    g.fillStyle(0x444444); g.fillRect(14, 2, 6, 14);
    g.fillStyle(0x3a3a3a); g.fillRect(22, 4, 6, 12);
    g.fillStyle(0x666666); g.fillRect(14, 0, 6, 4); g.fillRect(22, 2, 6, 4);
    g.fillStyle(0xffaa00); g.fillRect(18, 28, 94, 3);
    g.fillStyle(0xff8800); g.fillRect(18, 33, 94, 2);
    g.fillStyle(0x1a0000); g.fillRect(18, 45, 94, 2);
    g.fillStyle(0xaa1818); g.fillRect(10, 38, 28, 8); g.fillRect(92, 38, 28, 8);
    g.lineStyle(1, 0x991111); g.beginPath(); g.moveTo(65, 14); g.lineTo(65, 44); g.strokePath();
    g.fillStyle(0xffffff); g.fillRect(50, 18, 12, 10);
    g.fillStyle(0xdd2222); g.fillRect(52, 20, 8, 6);
    g.generateTexture('truck-body', 130, 60); g.destroy();
  }

  createWheelTexture() {
    const g = this.make.graphics({ add: false });
    const cx = 22, cy = 22;
    g.fillStyle(0x1a1a1a); g.fillCircle(cx, cy, 21);
    g.fillStyle(0x2a2a2a);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      g.fillRect(cx + Math.cos(a) * 17 - 3, cy + Math.sin(a) * 17 - 2, 6, 4);
    }
    g.fillStyle(0x222222); g.fillCircle(cx, cy, 15);
    g.fillStyle(0xaaaaaa); g.fillCircle(cx, cy, 12);
    g.fillStyle(0xbbbbbb); g.fillCircle(cx, cy, 10);
    g.lineStyle(2, 0x888888);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      g.beginPath(); g.moveTo(cx + Math.cos(a) * 3, cy + Math.sin(a) * 3);
      g.lineTo(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9); g.strokePath();
    }
    g.fillStyle(0x555555); g.fillCircle(cx, cy, 4);
    g.fillStyle(0x777777); g.fillCircle(cx, cy, 2);
    g.generateTexture('truck-wheel', 44, 44); g.destroy();
  }
}
