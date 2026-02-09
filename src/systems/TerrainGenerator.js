import Phaser from 'phaser';
import { TERRAIN, COLORS } from '../utils/constants.js';

export class TerrainGenerator {
  /**
   * @param {Phaser.Scene} scene
   * @param {object}  groundColors  - { fill, surface, dark, deep, detail }
   * @param {Function|null} profileFn - (baseY, step, len) => [{x,y}]  Custom terrain profile
   * @param {Array|null} markers - [{x, text}] terrain marker signs
   */
  constructor(scene, groundColors = null, profileFn = null, markers = null) {
    this.scene = scene;
    this.points = [];
    this.bodies = [];
    this.gc = groundColors || {
      fill: COLORS.GROUND_FILL, surface: COLORS.GROUND_SURFACE,
      dark: COLORS.GROUND_DARK, deep: COLORS.GROUND_DEEP, detail: COLORS.GROUND_DETAIL,
    };
    this.profileFn = profileFn;
    this.customMarkers = markers;
  }

  generate() {
    this.points = this.generatePoints();
    this.createPhysicsBodies();
    this.drawTerrain();
    this.addDecorations();
    return this.points;
  }

  generatePoints() {
    if (this.profileFn) {
      return this.profileFn(TERRAIN.BASE_Y, TERRAIN.STEP, TERRAIN.LENGTH);
    }
    // Default (Level 1 legacy fallback)
    const pts = [], baseY = TERRAIN.BASE_Y, step = TERRAIN.STEP, len = TERRAIN.LENGTH;
    for (let x = -200; x <= len + 200; x += step) {
      let y = baseY;
      if (x <= 400) y = baseY;
      else if (x <= 1400) { const t = (x - 400) / 1000; y = baseY - 35 * Math.sin(t * Math.PI * 2.5) - 15 * Math.sin(t * Math.PI * 6); }
      else if (x <= 1700) { const t = (x - 1400) / 300; y = baseY - 35 - t * 110; }
      else if (x <= 1950) y = baseY - 145;
      else if (x <= 2300) { const t = (x - 1950) / 350; y = baseY - 145 + t * 190; }
      else if (x <= 3000) { const t = (x - 2300) / 700; y = baseY + 45 - 20 * Math.sin(t * Math.PI * 5) - 8 * Math.cos(t * Math.PI * 11); }
      else if (x <= 3800) { const t = (x - 3000) / 800; const sp = t * 4, ss = Math.floor(sp), sf = sp - ss; y = baseY - ss * 35 - (sf < 0.3 ? sf / 0.3 * 35 : 35) + 35; }
      else if (x <= 4100) { const t = (x - 3800) / 300; y = baseY - 100 + 180 * Math.sin(t * Math.PI); }
      else if (x <= 4400) y = baseY - 100;
      else if (x <= 5200) { const t = (x - 4400) / 800; y = baseY - 100 + t * 150 + 25 * Math.sin(t * Math.PI * 6); }
      else if (x <= 6200) { const t = (x - 5200) / 1000; y = baseY + 50 - 30 * Math.sin(t * Math.PI * 10) - 15 * Math.sin(t * Math.PI * 18); }
      else if (x <= 6600) { const t = (x - 6200) / 400; y = baseY + 20 - t * 160; }
      else if (x <= 6900) y = baseY - 140;
      else if (x <= 7500) { const t = (x - 6900) / 600; y = baseY - 140 + t * 140; }
      else y = baseY;
      pts.push({ x, y });
    }
    return pts;
  }

  createPhysicsBodies() {
    const Matter = Phaser.Physics.Matter.Matter;
    const world = this.scene.matter.world.engine.world;
    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i], p2 = this.points[i + 1];
      const cx = (p1.x + p2.x) / 2, cy = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      const w = Math.sqrt(dx * dx + dy * dy) + 2, a = Math.atan2(dy, dx);
      const seg = Matter.Bodies.rectangle(cx, cy + 30, w, 60, { isStatic: true, angle: a, friction: 0.8, restitution: 0.02, label: 'terrain' });
      this.bodies.push(seg);
    }
    Matter.World.add(world, this.bodies);
    Matter.World.add(world, [
      Matter.Bodies.rectangle(-250, 400, 100, 1200, { isStatic: true, label: 'wall' }),
      Matter.Bodies.rectangle(TERRAIN.LENGTH / 2, 950, TERRAIN.LENGTH + 1000, 100, { isStatic: true, label: 'wall' }),
    ]);
  }

  drawTerrain() {
    const g = this.scene.add.graphics().setDepth(2);
    const c = this.gc, pts = this.points, last = pts[pts.length - 1];
    g.fillStyle(c.deep, 1); g.beginPath(); g.moveTo(pts[0].x, pts[0].y + 30);
    for (const p of pts) g.lineTo(p.x, p.y + 30);
    g.lineTo(last.x, 950); g.lineTo(pts[0].x, 950); g.closePath(); g.fill();
    g.fillStyle(c.dark, 1); g.beginPath(); g.moveTo(pts[0].x, pts[0].y + 10);
    for (const p of pts) g.lineTo(p.x, p.y + 10);
    g.lineTo(last.x, 950); g.lineTo(pts[0].x, 950); g.closePath(); g.fill();
    g.fillStyle(c.fill, 1); g.beginPath(); g.moveTo(pts[0].x, pts[0].y);
    for (const p of pts) g.lineTo(p.x, p.y);
    g.lineTo(last.x, 950); g.lineTo(pts[0].x, 950); g.closePath(); g.fill();
    g.lineStyle(4, c.surface, 1); g.beginPath(); g.moveTo(pts[0].x, pts[0].y);
    for (const p of pts) g.lineTo(p.x, p.y); g.strokePath();
    for (let l = 1; l <= 4; l++) {
      g.lineStyle(1, c.detail, 0.25); g.beginPath();
      g.moveTo(pts[0].x, pts[0].y + l * 18);
      for (const p of pts) g.lineTo(p.x, p.y + l * 18); g.strokePath();
    }
  }

  addDecorations() {
    const rng = new Phaser.Math.RandomDataGenerator(['deco']);
    for (let i = 0; i < this.points.length - 1; i++) {
      const p = this.points[i];
      if (rng.frac() > 0.55) {
        const t = this.scene.add.graphics().setDepth(3);
        for (let j = 0; j < rng.between(2, 4); j++) {
          const tx = p.x + rng.between(-8, 8), th = rng.between(4, 10);
          t.lineStyle(2, rng.frac() > 0.5 ? 0x5a8a30 : 0x4a7a25);
          t.beginPath(); t.moveTo(tx, p.y); t.lineTo(tx + rng.between(-3, 3), p.y - th); t.strokePath();
        }
      }
      if (rng.frac() > 0.85) {
        const r = this.scene.add.graphics().setDepth(3);
        const rw = rng.between(4, 10), rh = rng.between(3, 7);
        r.fillStyle(rng.frac() > 0.5 ? 0x6a6a6a : 0x5a5a5a);
        r.fillRect(p.x - rw / 2, p.y - rh, rw, rh);
        r.fillStyle(0x8a8a8a, 0.4); r.fillRect(p.x - rw / 2, p.y - rh, rw, 2);
      }
    }
    this.addTerrainMarkers();
  }

  addTerrainMarkers() {
    const markers = this.customMarkers || [
      { x: 350, text: 'GO!' }, { x: 1400, text: 'RAMP' }, { x: 3000, text: 'DANGER' },
      { x: 3800, text: 'JUMP!' }, { x: 6200, text: 'MEGA RAMP' }, { x: 7500, text: 'FINISH >' },
    ];
    for (const m of markers) {
      const ty = this.getTerrainYAtX(m.x);
      const g = this.scene.add.graphics().setDepth(1);
      g.fillStyle(0x666666); g.fillRect(m.x - 2, ty - 65, 4, 65);
      const tw = m.text.length * 8 + 16;
      g.fillStyle(0xddaa00); g.fillRect(m.x - tw / 2, ty - 80, tw, 22);
      g.fillStyle(0x222222); g.fillRect(m.x - tw / 2 + 2, ty - 78, tw - 4, 18);
      this.scene.add.text(m.x, ty - 69, m.text, {
        fontFamily: 'monospace', fontSize: '12px', color: '#ffdd00', stroke: '#000', strokeThickness: 1
      }).setOrigin(0.5).setDepth(1);
    }
  }

  getTerrainYAtX(x) {
    for (let i = 0; i < this.points.length - 1; i++) {
      if (this.points[i].x <= x && this.points[i + 1].x > x) {
        const t = (x - this.points[i].x) / (this.points[i + 1].x - this.points[i].x);
        return this.points[i].y + t * (this.points[i + 1].y - this.points[i].y);
      }
    }
    return TERRAIN.BASE_Y;
  }

  getStartPosition() { return { x: 150, y: TERRAIN.BASE_Y - 80 }; }
  getFinishX() { return TERRAIN.LENGTH - 300; }
}
