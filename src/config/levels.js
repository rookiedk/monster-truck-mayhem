import Phaser from 'phaser';
import { TERRAIN, LEVEL_COLORS, PARALLAX_LAYERS, DESTRUCTIBLE_TYPES, HAZARD_TYPES, SCORE_STARS, DIFFICULTY } from '../utils/constants.js';

// ====================================================================
//  TERRAIN PROFILE GENERATORS — each returns an array of {x, y} points
// ====================================================================

function terrainLevel1(baseY, step, len) {
  const pts = [];
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

function terrainLevel2(baseY, step, len) {
  // Mountain Mayhem — steep ramps, narrow canyons, long jumps, higher elevation changes
  const pts = [];
  for (let x = -200; x <= len + 200; x += step) {
    let y = baseY;
    if (x <= 350) y = baseY;
    // Gentle warmup hills
    else if (x <= 900) { const t = (x - 350) / 550; y = baseY - 30 * Math.sin(t * Math.PI * 2); }
    // First steep climb
    else if (x <= 1200) { const t = (x - 900) / 300; y = baseY - t * 160; }
    // Canyon ridge — flat top
    else if (x <= 1500) y = baseY - 160;
    // Steep drop into canyon
    else if (x <= 1750) { const t = (x - 1500) / 250; y = baseY - 160 + t * 230; }
    // Canyon floor — bumpy
    else if (x <= 2400) { const t = (x - 1750) / 650; y = baseY + 70 - 18 * Math.sin(t * Math.PI * 7); }
    // Launch ramp out of canyon
    else if (x <= 2650) { const t = (x - 2400) / 250; y = baseY + 70 - t * 250; }
    // Long air gap — no terrain (just a brief flat high)
    else if (x <= 2900) y = baseY - 180;
    // Drop down to mid
    else if (x <= 3200) { const t = (x - 2900) / 300; y = baseY - 180 + t * 150; }
    // Rolling rocky section
    else if (x <= 4200) { const t = (x - 3200) / 1000; y = baseY - 30 - 40 * Math.sin(t * Math.PI * 6) - 20 * Math.sin(t * Math.PI * 13); }
    // Staircase climb
    else if (x <= 5000) {
      const t = (x - 4200) / 800;
      const sp = t * 5, ss = Math.floor(sp), sf = sp - ss;
      y = baseY - ss * 30 - (sf < 0.35 ? sf / 0.35 * 30 : 30) + 30;
    }
    // Summit plateau
    else if (x <= 5400) y = baseY - 120;
    // Mega jump ramp
    else if (x <= 5650) { const t = (x - 5400) / 250; y = baseY - 120 - t * 80; }
    // Airborne gap
    else if (x <= 6100) { const t = (x - 5650) / 450; y = baseY - 200 + 250 * Math.sin(t * Math.PI * 0.5); }
    // Final descent — fast rolling
    else if (x <= 7200) { const t = (x - 6100) / 1100; y = baseY + 50 - 25 * Math.sin(t * Math.PI * 8) + t * 30; }
    // Flat finish
    else if (x <= 7500) { const t = (x - 7200) / 300; y = baseY + 80 - t * 80; }
    else y = baseY;
    pts.push({ x, y });
  }
  return pts;
}

function terrainLevel3(baseY, step, len) {
  // Urban Assault — roads with ramps, overpasses, construction zones, tighter gaps
  const pts = [];
  for (let x = -200; x <= len + 200; x += step) {
    let y = baseY;
    if (x <= 400) y = baseY;
    // Smooth road with speed bumps
    else if (x <= 1200) { const t = (x - 400) / 800; y = baseY - 12 * Math.sin(t * Math.PI * 8); }
    // Overpass ramp up
    else if (x <= 1500) { const t = (x - 1200) / 300; y = baseY - t * 130; }
    // Overpass top
    else if (x <= 1800) y = baseY - 130;
    // Overpass ramp down (steep!)
    else if (x <= 2000) { const t = (x - 1800) / 200; y = baseY - 130 + t * 180; }
    // Construction pit
    else if (x <= 2500) { const t = (x - 2000) / 500; y = baseY + 50 - 15 * Math.sin(t * Math.PI * 4); }
    // Launch ramp
    else if (x <= 2700) { const t = (x - 2500) / 200; y = baseY + 50 - t * 200; }
    // Airborne over gap
    else if (x <= 3000) y = baseY - 150;
    // Highway section — smooth with gentle dips
    else if (x <= 4000) { const t = (x - 3000) / 1000; y = baseY - 150 + t * 120 + 20 * Math.sin(t * Math.PI * 3); }
    // Parking garage ramps (tight zigzag)
    else if (x <= 4800) {
      const t = (x - 4000) / 800;
      const sp = t * 6, ss = Math.floor(sp), sf = sp - ss;
      const up = ss % 2 === 0;
      y = baseY - 30 + (up ? -sf * 40 : -(1 - sf) * 40) - ss * 12;
    }
    // Wrecking yard — lots of debris, rolling terrain
    else if (x <= 5800) { const t = (x - 4800) / 1000; y = baseY - 100 + 30 * Math.sin(t * Math.PI * 10) + 15 * Math.cos(t * Math.PI * 17); }
    // Final mega ramp
    else if (x <= 6100) { const t = (x - 5800) / 300; y = baseY - 70 - t * 130; }
    // Huge air gap
    else if (x <= 6600) { const t = (x - 6100) / 500; y = baseY - 200 + 280 * Math.sin(t * Math.PI * 0.5); }
    // Landing zone with small bumps
    else if (x <= 7300) { const t = (x - 6600) / 700; y = baseY + 80 - t * 80 - 10 * Math.sin(t * Math.PI * 5); }
    // Flat finish
    else y = baseY;
    pts.push({ x, y });
  }
  return pts;
}

// ====================================================================
//  DESTRUCTIBLE PLACEMENT GENERATORS — each returns an array of configs
// ====================================================================

function destructiblesLevel1(terrain, scene) {
  const rng = new Phaser.Math.RandomDataGenerator(['junkyard1']);
  const vTex = ['vehicle-1', 'vehicle-2', 'vehicle-3'].filter(t => scene.textures.exists(t));
  const hasTank = scene.textures.exists('tank-wreck');
  const items = [];

  for (let x = 500; x < TERRAIN.LENGTH - 500; x += rng.between(70, 160)) {
    const ty = terrain.getTerrainYAtX(x);
    const ty2 = terrain.getTerrainYAtX(x + 20);
    if (Math.abs(ty2 - ty) / 20 > 0.4) continue;
    if (ty > TERRAIN.BASE_Y + 80) continue;

    const r = rng.frac();
    let name = r < 0.30 ? 'CRATE' : r < 0.55 ? 'BARREL' : r < 0.72 ? 'ROCK_PILE' : r < 0.92 ? 'VEHICLE' : 'TANK';
    if (name === 'VEHICLE' && vTex.length === 0) name = 'CRATE';
    if (name === 'TANK' && !hasTank) name = 'ROCK_PILE';

    const cfg = { ...DESTRUCTIBLE_TYPES[name] };
    if (name === 'VEHICLE') cfg.texture = rng.pick(vTex);
    items.push({ x, y: ty - cfg.height / 2 - 2, type: name, cfg });
  }
  return items;
}

function destructiblesLevel2(terrain, scene) {
  const rng = new Phaser.Math.RandomDataGenerator(['mountain2']);
  const vTex = ['vehicle-1', 'vehicle-2', 'vehicle-3'].filter(t => scene.textures.exists(t));
  const hasTank = scene.textures.exists('tank-wreck');
  const hasCrystal = scene.textures.exists('crystal');
  const hasPlant = scene.textures.exists('plant');
  const items = [];

  for (let x = 400; x < TERRAIN.LENGTH - 500; x += rng.between(60, 140)) {
    const ty = terrain.getTerrainYAtX(x);
    const ty2 = terrain.getTerrainYAtX(x + 20);
    if (Math.abs(ty2 - ty) / 20 > 0.5) continue;
    if (ty > TERRAIN.BASE_Y + 100) continue;

    const r = rng.frac();
    let name;
    if (r < 0.20) name = hasCrystal ? 'CRYSTAL' : 'CRATE';
    else if (r < 0.35) name = hasPlant ? 'PLANT' : 'CRATE';
    else if (r < 0.55) name = 'ROCK_PILE';
    else if (r < 0.70) name = 'BARREL';
    else if (r < 0.88) name = 'VEHICLE';
    else name = 'TANK';

    if (name === 'VEHICLE' && vTex.length === 0) name = 'ROCK_PILE';
    if (name === 'TANK' && !hasTank) name = 'ROCK_PILE';

    const cfg = { ...DESTRUCTIBLE_TYPES[name] };
    if (name === 'VEHICLE') cfg.texture = rng.pick(vTex);
    items.push({ x, y: ty - cfg.height / 2 - 2, type: name, cfg });
  }
  return items;
}

function destructiblesLevel3(terrain, scene) {
  const rng = new Phaser.Math.RandomDataGenerator(['urban3']);
  const vTex = ['vehicle-1', 'vehicle-2', 'vehicle-3'].filter(t => scene.textures.exists(t));
  const hasTank = scene.textures.exists('tank-wreck');
  const items = [];

  // Urban has more vehicles and barrels (trash, construction)
  for (let x = 450; x < TERRAIN.LENGTH - 500; x += rng.between(50, 120)) {
    const ty = terrain.getTerrainYAtX(x);
    const ty2 = terrain.getTerrainYAtX(x + 20);
    if (Math.abs(ty2 - ty) / 20 > 0.5) continue;
    if (ty > TERRAIN.BASE_Y + 100) continue;

    const r = rng.frac();
    let name;
    if (r < 0.15) name = 'CRATE';
    else if (r < 0.35) name = 'BARREL';
    else if (r < 0.50) name = 'ROCK_PILE';
    else if (r < 0.80) name = 'VEHICLE';
    else name = 'TANK';

    if (name === 'VEHICLE' && vTex.length === 0) name = 'CRATE';
    if (name === 'TANK' && !hasTank) name = 'ROCK_PILE';

    const cfg = { ...DESTRUCTIBLE_TYPES[name] };
    if (name === 'VEHICLE') cfg.texture = rng.pick(vTex);
    items.push({ x, y: ty - cfg.height / 2 - 2, type: name, cfg });
  }
  return items;
}

// ====================================================================
//  GEM PLACEMENT
// ====================================================================

function gemsLevel1(terrain) {
  const rng = new Phaser.Math.RandomDataGenerator(['gems1']);
  const gems = [];
  for (let x = 400; x < TERRAIN.LENGTH - 400; x += rng.between(180, 350))
    gems.push({ x, y: terrain.getTerrainYAtX(x) - 30 - rng.between(10, 50) });
  // Arcs
  for (const gx of [1650,1700,1750,1800,1850, 3850,3900,3950,4000,4050, 6350,6400,6450,6500,6550,6600,6650,6700])
    gems.push({ x: gx, y: terrain.getTerrainYAtX(gx) - 80 - Math.random() * 60 });
  return gems;
}

function gemsLevel2(terrain) {
  const rng = new Phaser.Math.RandomDataGenerator(['gems2']);
  const gems = [];
  for (let x = 350; x < TERRAIN.LENGTH - 400; x += rng.between(150, 300))
    gems.push({ x, y: terrain.getTerrainYAtX(x) - 35 - rng.between(15, 70) });
  // Canyon floor bonus arc
  for (let gx = 1800; gx <= 2300; gx += 50)
    gems.push({ x: gx, y: terrain.getTerrainYAtX(gx) - 40 });
  // Summit arc
  for (let gx = 5100; gx <= 5350; gx += 50)
    gems.push({ x: gx, y: terrain.getTerrainYAtX(gx) - 90 });
  return gems;
}

function gemsLevel3(terrain) {
  const rng = new Phaser.Math.RandomDataGenerator(['gems3']);
  const gems = [];
  for (let x = 400; x < TERRAIN.LENGTH - 400; x += rng.between(120, 260))
    gems.push({ x, y: terrain.getTerrainYAtX(x) - 30 - rng.between(10, 60) });
  // Overpass arc
  for (let gx = 1300; gx <= 1700; gx += 40)
    gems.push({ x: gx, y: terrain.getTerrainYAtX(gx) - 60 });
  // Mega jump arc
  for (let gx = 6100; gx <= 6500; gx += 45)
    gems.push({ x: gx, y: TERRAIN.BASE_Y - 250 + Math.sin((gx - 6100) / 400 * Math.PI) * 80 });
  return gems;
}

// ====================================================================
//  HAZARD PLACEMENT GENERATORS — each returns array of {x, y, type, cfg}
// ====================================================================

function hazardsLevel1(terrain) {
  const rng = new Phaser.Math.RandomDataGenerator([Date.now().toString() + 'h1']);
  const items = [];
  // Level 1: Sparse hazards — introduce the concept
  for (let x = 800; x < TERRAIN.LENGTH - 600; x += rng.between(350, 700)) {
    const ty = terrain.getTerrainYAtX(x);
    const ty2 = terrain.getTerrainYAtX(x + 20);
    if (Math.abs(ty2 - ty) / 20 > 0.3) continue;
    if (ty > TERRAIN.BASE_Y + 80) continue;

    const r = rng.frac();
    let name;
    if (r < 0.40) name = 'SPIKE_STRIP';
    else if (r < 0.65) name = 'OIL_SLICK';
    else if (r < 0.85) name = 'MINE';
    else name = 'FIRE_PIT';

    const cfg = { ...HAZARD_TYPES[name] };
    items.push({ x, y: ty - cfg.height / 2 - 1, type: name, cfg });
  }
  return items;
}

function hazardsLevel2(terrain) {
  const rng = new Phaser.Math.RandomDataGenerator([Date.now().toString() + 'h2']);
  const items = [];
  // Level 2: More hazards, introduce TNT
  for (let x = 600; x < TERRAIN.LENGTH - 600; x += rng.between(280, 550)) {
    const ty = terrain.getTerrainYAtX(x);
    const ty2 = terrain.getTerrainYAtX(x + 20);
    if (Math.abs(ty2 - ty) / 20 > 0.4) continue;
    if (ty > TERRAIN.BASE_Y + 100) continue;

    const r = rng.frac();
    let name;
    if (r < 0.25) name = 'SPIKE_STRIP';
    else if (r < 0.40) name = 'OIL_SLICK';
    else if (r < 0.60) name = 'MINE';
    else if (r < 0.80) name = 'FIRE_PIT';
    else name = 'TNT';

    const cfg = { ...HAZARD_TYPES[name] };
    items.push({ x, y: ty - cfg.height / 2 - 1, type: name, cfg });
  }
  return items;
}

function hazardsLevel3(terrain) {
  const rng = new Phaser.Math.RandomDataGenerator([Date.now().toString() + 'h3']);
  const items = [];
  // Level 3: Moderate hazards with TNT — spaced enough to react & jump
  for (let x = 600; x < TERRAIN.LENGTH - 600; x += rng.between(320, 550)) {
    const ty = terrain.getTerrainYAtX(x);
    const ty2 = terrain.getTerrainYAtX(x + 20);
    if (Math.abs(ty2 - ty) / 20 > 0.5) continue;
    if (ty > TERRAIN.BASE_Y + 100) continue;

    const r = rng.frac();
    let name;
    if (r < 0.20) name = 'SPIKE_STRIP';
    else if (r < 0.35) name = 'OIL_SLICK';
    else if (r < 0.55) name = 'MINE';
    else if (r < 0.75) name = 'FIRE_PIT';
    else name = 'TNT';

    const cfg = { ...HAZARD_TYPES[name] };
    items.push({ x, y: ty - cfg.height / 2 - 1, type: name, cfg });
  }
  return items;
}

// ====================================================================
//  LEVEL DEFINITIONS
// ====================================================================

export const LEVELS = {
  1: {
    id: 1,
    name: 'JUNKYARD RAMPAGE',
    subtitle: 'Smash everything! Watch for hazards!',
    terrainProfile: terrainLevel1,
    colors: LEVEL_COLORS[1],
    parallaxPrimary: 'JUNKYARD',
    parallaxFallback: 'MOUNTAIN',
    getDestructibles: destructiblesLevel1,
    getHazards: hazardsLevel1,
    getGems: gemsLevel1,
    difficulty: DIFFICULTY[1],
    stars: SCORE_STARS[1],
    markers: [
      { x: 350, text: 'GO!' }, { x: 1400, text: 'RAMP' }, { x: 3000, text: 'DANGER' },
      { x: 3800, text: 'JUMP!' }, { x: 6200, text: 'MEGA RAMP' }, { x: 7500, text: 'FINISH >' },
    ],
    ambientBirds: false,
    dancerAtFinish: false,
    waterHazards: [],
  },
  2: {
    id: 2,
    name: 'MOUNTAIN MAYHEM',
    subtitle: 'Conquer the canyon! Avoid the traps!',
    terrainProfile: terrainLevel2,
    colors: LEVEL_COLORS[2],
    parallaxPrimary: 'CANYON',
    parallaxFallback: 'ROCKY_PASS',
    getDestructibles: destructiblesLevel2,
    getHazards: hazardsLevel2,
    getGems: gemsLevel2,
    difficulty: DIFFICULTY[2],
    stars: SCORE_STARS[2],
    markers: [
      { x: 350, text: 'GO!' }, { x: 900, text: 'CLIMB' }, { x: 1500, text: 'CANYON!' },
      { x: 2400, text: 'LAUNCH' }, { x: 4200, text: 'STAIRCASE' }, { x: 5400, text: 'SUMMIT' },
      { x: 5650, text: 'MEGA JUMP!' }, { x: 7200, text: 'FINISH >' },
    ],
    ambientBirds: true,
    dancerAtFinish: false,
    waterHazards: [],
  },
  3: {
    id: 3,
    name: 'URBAN ASSAULT',
    subtitle: 'Own the streets! Dodge the danger!',
    terrainProfile: terrainLevel3,
    colors: LEVEL_COLORS[3],
    parallaxPrimary: 'URBAN',
    parallaxFallback: 'MOUNTAIN',
    getDestructibles: destructiblesLevel3,
    getHazards: hazardsLevel3,
    getGems: gemsLevel3,
    difficulty: DIFFICULTY[3],
    stars: SCORE_STARS[3],
    markers: [
      { x: 350, text: 'GO!' }, { x: 1200, text: 'OVERPASS' }, { x: 2000, text: 'PIT!' },
      { x: 2500, text: 'LAUNCH' }, { x: 4000, text: 'GARAGE' }, { x: 4800, text: 'WRECKING YARD' },
      { x: 5800, text: 'MEGA RAMP' }, { x: 7000, text: 'FINISH >' },
    ],
    ambientBirds: false,
    dancerAtFinish: true,
    waterHazards: [{ x1: 2050, x2: 2450, depth: 30 }],
  },
};
