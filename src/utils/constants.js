// ---- Display ----
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// ---- Terrain ----
export const TERRAIN = {
  LENGTH: 8000,
  STEP: 40,
  BASE_Y: 500,
};

// ---- Truck Physics ----
export const TRUCK = {
  CHASSIS_WIDTH: 120,
  CHASSIS_HEIGHT: 30,
  CHASSIS_DENSITY: 0.003,
  WHEEL_RADIUS: 22,
  WHEEL_DENSITY: 0.002,
  WHEEL_FRICTION: 1.2,
  WHEEL_OFFSET_X: 46,
  SUSPENSION_REST_LENGTH: 12,
  SUSPENSION_STIFFNESS: 0.6,
  SUSPENSION_DAMPING: 0.15,
  WHEEL_SPEED: 0.12,
  MAX_WHEEL_SPEED: 0.4,
  DRIVE_FORCE: 0.008,
  LEAN_TORQUE: 0.18,
  BOOST_MULTIPLIER: 2.0,
  JUMP_VELOCITY: 10,
  JUMP_FUEL_COST: 10,
  JUMP_COOLDOWN: 500,
};

// ---- Destructible Types ----
export const DESTRUCTIBLE_TYPES = {
  CRATE:     { texture: 'crate',      width: 28, height: 28, health: 1, points: 10,  explosion: 'quick',  nitroRefill: 3 },
  BARREL:    { texture: 'barrel',     width: 22, height: 30, health: 1, points: 25,  explosion: 'small',  nitroRefill: 5 },
  ROCK_PILE: { texture: 'rock-pile',  width: 36, height: 28, health: 2, points: 50,  explosion: 'medium', nitroRefill: 8 },
  VEHICLE:   { texture: 'vehicle-1',  width: 64, height: 36, health: 2, points: 75,  explosion: 'medium', nitroRefill: 12 },
  TANK:      { texture: 'tank-wreck', width: 72, height: 44, health: 4, points: 150, explosion: 'large',  nitroRefill: 25 },
  CRYSTAL:   { texture: 'crystal',    width: 18, height: 30, health: 1, points: 35,  explosion: 'quick',  nitroRefill: 4 },
  PLANT:     { texture: 'plant',      width: 24, height: 28, health: 1, points: 15,  explosion: 'quick',  nitroRefill: 2 },
};

// ---- Combo System ----
export const COMBO = {
  TIMEOUT: 2000,
  MULTIPLIER_STEP: 2,
  MAX_MULTIPLIER: 8,
};

// ---- Colors per level ----
export const COLORS = {
  SKY_TOP: { r: 15, g: 10, b: 50 },
  SKY_BOTTOM: { r: 40, g: 35, b: 90 },
  GROUND_FILL: 0x4a3728,
  GROUND_DARK: 0x3a2718,
  GROUND_SURFACE: 0x6b8c42,
  GROUND_DETAIL: 0x5a7a35,
  GROUND_DEEP: 0x2a1a10,
  ROCK: 0x5a5a5a,
  // Junkyard (Level 1)
  JUNK_GROUND: 0x3d3025,
  JUNK_SURFACE: 0x5a5040,
  JUNK_DARK: 0x2a2018,
  JUNK_DEEP: 0x1a1510,
  JUNK_DETAIL: 0x4a4030,
};

export const LEVEL_COLORS = {
  1: {
    sky: { top: { r: 15, g: 10, b: 50 }, bottom: { r: 40, g: 35, b: 90 } },
    ground: { fill: 0x3d3025, surface: 0x5a5040, dark: 0x2a2018, deep: 0x1a1510, detail: 0x4a4030 },
  },
  2: {
    sky: { top: { r: 20, g: 12, b: 55 }, bottom: { r: 70, g: 40, b: 80 } },
    ground: { fill: 0x5a4a3a, surface: 0x7a6a50, dark: 0x3a3028, deep: 0x2a2018, detail: 0x6a5a45 },
  },
  3: {
    sky: { top: { r: 60, g: 120, b: 200 }, bottom: { r: 150, g: 190, b: 230 } },
    ground: { fill: 0x4a4a4a, surface: 0x6a6a6a, dark: 0x3a3a3a, deep: 0x2a2a2a, detail: 0x5a5a5a },
  },
};

// ---- Parallax Layer Config ----
export const PARALLAX_LAYERS = {
  MOUNTAIN: [
    { key: 'bg-sky',            scrollFactor: 0,    depth: -100 },
    { key: 'bg-far-clouds',     scrollFactor: 0.03, depth: -95 },
    { key: 'bg-far-mountains',  scrollFactor: 0.06, depth: -90 },
    { key: 'bg-mountains',      scrollFactor: 0.12, depth: -85 },
    { key: 'bg-near-clouds',    scrollFactor: 0.08, depth: -80 },
    { key: 'bg-trees',          scrollFactor: 0.25, depth: -75 },
  ],
  JUNKYARD: [
    { key: 'junk-back',   scrollFactor: 0.05, depth: -95 },
    { key: 'junk-middle', scrollFactor: 0.12, depth: -85 },
    { key: 'junk-near',   scrollFactor: 0.25, depth: -75 },
  ],
  ROCKY_PASS: [
    { key: 'rocky-back',   scrollFactor: 0.04, depth: -95 },
    { key: 'rocky-middle', scrollFactor: 0.10, depth: -85 },
    { key: 'rocky-near',   scrollFactor: 0.22, depth: -75 },
  ],
  CANYON: [
    { key: 'canyon-sky',      scrollFactor: 0,    depth: -100 },
    { key: 'canyon-far-mtn',  scrollFactor: 0.05, depth: -95 },
    { key: 'canyon-clouds',   scrollFactor: 0.03, depth: -92 },
    { key: 'canyon-wall',     scrollFactor: 0.15, depth: -85 },
    { key: 'canyon-front',    scrollFactor: 0.28, depth: -75 },
  ],
  URBAN: [
    { key: 'urban-sky',       scrollFactor: 0,    depth: -100 },
    { key: 'urban-clouds',    scrollFactor: 0.03, depth: -95 },
    { key: 'urban-buildings', scrollFactor: 0.08, depth: -88 },
    { key: 'urban-trees',     scrollFactor: 0.18, depth: -78 },
  ],
};

// ---- Score Stars (per level) ----
export const SCORE_STARS = {
  1: { ONE_STAR: 2000, TWO_STARS: 6000, THREE_STARS: 12000 },
  2: { ONE_STAR: 3000, TWO_STARS: 8000, THREE_STARS: 15000 },
  3: { ONE_STAR: 4000, TWO_STARS: 10000, THREE_STARS: 20000 },
};

// ---- Difficulty per level ----
export const DIFFICULTY = {
  1: { landingDamageThreshold: 20, landingDamageMul: 0.8, maxLandingDamage: 15, objectDensity: 1.0, gapFrequency: 0.0 },
  2: { landingDamageThreshold: 18, landingDamageMul: 1.0, maxLandingDamage: 20, objectDensity: 1.2, gapFrequency: 0.1 },
  3: { landingDamageThreshold: 16, landingDamageMul: 1.2, maxLandingDamage: 25, objectDensity: 1.4, gapFrequency: 0.15 },
};

// ---- Hazard Types (Boos that hurt the truck) ----
export const HAZARD_TYPES = {
  SPIKE_STRIP: { texture: 'hazard-spikes', width: 48, height: 14, damage: 12, cooldown: 800, explosion: null, label: 'SPIKES!' },
  MINE:        { texture: 'hazard-mine',   width: 22, height: 18, damage: 22, cooldown: 0,   explosion: 'medium', label: 'BOOM!' },
  TNT:         { texture: 'hazard-tnt',    width: 26, height: 30, damage: 28, cooldown: 0,   explosion: 'large',  label: 'TNT!' },
  FIRE_PIT:    { texture: 'hazard-fire',   width: 50, height: 20, damage: 0.4, cooldown: 50, explosion: null, label: '' },
  OIL_SLICK:   { texture: 'hazard-oil',    width: 60, height: 10, damage: 5,  cooldown: 600, explosion: null, label: 'SLIP!' },
};

// ---- Truck Palettes ----
export const PALETTES = {
  DEFAULT:      { name: 'Classic Red',    bodyTint: 0xffffff, wheelTint: 0xffffff, boostTint: 0xff8866, locked: false },
  MIDNIGHT:     { name: 'Midnight Blue',  bodyTint: 0x4466ff, wheelTint: 0x8899cc, boostTint: 0x44aaff, locked: true },
  TOXIC:        { name: 'Toxic Green',    bodyTint: 0x44ff44, wheelTint: 0x88cc88, boostTint: 0x88ff44, locked: true },
  GOLDEN:       { name: 'Gold Rush',      bodyTint: 0xffcc00, wheelTint: 0xddaa44, boostTint: 0xffee66, locked: true },
  NEON_PURPLE:  { name: 'Neon Purple',    bodyTint: 0xcc44ff, wheelTint: 0x9966cc, boostTint: 0xee66ff, locked: true },
  ICE:          { name: 'Ice Storm',      bodyTint: 0x88eeff, wheelTint: 0xaaddee, boostTint: 0xccffff, locked: true },
  INFERNO:      { name: 'Inferno',        bodyTint: 0xff6600, wheelTint: 0xcc5500, boostTint: 0xff2200, locked: true },
  SHADOW:       { name: 'Shadow',         bodyTint: 0x444444, wheelTint: 0x333333, boostTint: 0x666666, locked: true },
  CANDY:        { name: 'Candy Pink',     bodyTint: 0xff66aa, wheelTint: 0xcc5588, boostTint: 0xff88cc, locked: true },
  CHROME:       { name: 'Chrome',         bodyTint: 0xcccccc, wheelTint: 0xeeeeee, boostTint: 0xffffff, locked: true },
};

// ---- Challenge Definitions ----
export const CHALLENGE_DEFS = [
  { id: 'destroy_objects',  text: 'Destroy {n} objects',         stat: 'objectsDestroyed', minN: 8,  maxN: 20, palette: 'MIDNIGHT' },
  { id: 'collect_gems',     text: 'Collect {n} gems',            stat: 'gemsCollected',    minN: 5,  maxN: 12, palette: 'TOXIC' },
  { id: 'reach_combo',      text: 'Reach x{n} combo',            stat: 'maxCombo',         minN: 3,  maxN: 5,  palette: 'GOLDEN' },
  { id: 'do_flips',         text: 'Land {n} flips',              stat: 'totalFlips',       minN: 2,  maxN: 5,  palette: 'NEON_PURPLE' },
  { id: 'air_time',         text: 'Get {n}s total air time',     stat: 'totalAirTime',     minN: 5,  maxN: 12, palette: 'ICE' },
  { id: 'score_points',     text: 'Score {n} points',            stat: 'score',            minN: 2000, maxN: 6000, palette: 'INFERNO' },
  { id: 'finish_health',    text: 'Finish with {n}+ health',     stat: 'finishHealth',     minN: 30, maxN: 60, palette: 'SHADOW' },
  { id: 'destroy_vehicles', text: 'Destroy {n} vehicles',        stat: 'vehiclesDestroyed', minN: 3, maxN: 6,  palette: 'CANDY' },
  { id: 'survive_hazards',  text: 'Hit {n} hazards and survive', stat: 'hazardsHit',       minN: 3,  maxN: 6,  palette: 'CHROME' },
];

// ---- localStorage keys ----
export const STORAGE_KEYS = {
  BEST_SCORES: 'mtm-best-scores',
  UNLOCKED_LEVELS: 'mtm-unlocked',
  UNLOCKED_PALETTES: 'mtm-palettes',
  SELECTED_PALETTE: 'mtm-palette-selected',
  COMPLETED_CHALLENGES: 'mtm-challenges',
};
