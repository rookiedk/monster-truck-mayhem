import { COMBO } from '../utils/constants.js';

export class ScoreManager {
  constructor() {
    this.score = 0;
    this.combo = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;

    this.objectsDestroyed = 0;
    this.vehiclesDestroyed = 0;
    this.totalFlips = 0;
    this.totalAirTime = 0;
    this.maxCombo = 0;
    this.gemsCollected = 0;
    this.destructionPoints = 0;
    this.flipPoints = 0;
    this.airTimePoints = 0;
    this.gemPoints = 0;
    this.hazardsHit = 0;
    this.finishHealth = 0;
  }

  addDestructionPoints(basePoints, type) {
    const points = Math.floor(basePoints * this.comboMultiplier);
    this.score += points;
    this.destructionPoints += points;
    this.objectsDestroyed++;
    if (type === 'VEHICLE' || type === 'TANK') this.vehiclesDestroyed++;
    this.combo++;
    this.comboMultiplier = Math.min(
      1 + Math.floor(this.combo / COMBO.MULTIPLIER_STEP),
      COMBO.MAX_MULTIPLIER
    );
    this.maxCombo = Math.max(this.maxCombo, this.comboMultiplier);
    this.comboTimer = COMBO.TIMEOUT;
    return points;
  }

  addHazardHit() {
    this.hazardsHit++;
  }

  addFlipPoints(flips) {
    const points = Math.floor(flips * 500 * this.comboMultiplier);
    this.score += points;
    this.flipPoints += points;
    this.totalFlips += flips;
    return points;
  }

  addAirTimePoints(seconds) {
    const points = Math.floor(seconds * 60);
    this.score += points;
    this.airTimePoints += points;
    this.totalAirTime += seconds;
    return points;
  }

  addGemPoints() {
    const points = Math.floor(100 * this.comboMultiplier);
    this.score += points;
    this.gemPoints += points;
    this.gemsCollected++;
    return points;
  }

  update(delta) {
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.comboMultiplier = 1;
        this.comboTimer = 0;
      }
    }
  }

  getStats() {
    return {
      score: this.score,
      objectsDestroyed: this.objectsDestroyed,
      vehiclesDestroyed: this.vehiclesDestroyed,
      totalFlips: this.totalFlips,
      totalAirTime: this.totalAirTime,
      maxCombo: this.maxCombo,
      gemsCollected: this.gemsCollected,
      destructionPoints: this.destructionPoints,
      flipPoints: this.flipPoints,
      airTimePoints: this.airTimePoints,
      gemPoints: this.gemPoints,
      hazardsHit: this.hazardsHit,
      finishHealth: this.finishHealth,
    };
  }
}
