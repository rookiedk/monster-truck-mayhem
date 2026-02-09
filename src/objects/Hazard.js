export class Hazard {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = config;
    this.x = x;
    this.y = y;
    this.triggered = false;
    this.destroyed = false;
    this.lastHitTime = 0;

    // Visual
    this.sprite = scene.add.image(x, y, config.texture);
    this.sprite.setDisplaySize(config.width, config.height);
    this.sprite.setDepth(4);

    // Warning glow — pulsing red/orange to signal danger
    this.glow = scene.add.circle(x, y + 2, Math.max(config.width, config.height) * 0.5, 0xff2200, 0.08).setDepth(3);
    scene.tweens.add({
      targets: this.glow,
      scaleX: 1.4, scaleY: 1.4, alpha: 0.02,
      duration: 700, yoyo: true, repeat: -1,
    });

    // Fire pits get animated flames
    if (config.texture === 'hazard-fire') {
      this.flames = [];
      for (let i = 0; i < 5; i++) {
        const fx = x - config.width / 2 + Math.random() * config.width;
        const fy = y - 4;
        const flame = scene.add.circle(fx, fy, 3 + Math.random() * 3, 0xff4400, 0.6).setDepth(5);
        scene.tweens.add({
          targets: flame,
          y: fy - 10 - Math.random() * 8,
          alpha: 0,
          scaleX: 0.3, scaleY: 0.3,
          duration: 300 + Math.random() * 400,
          repeat: -1,
          delay: Math.random() * 300,
          onRepeat: () => {
            flame.setPosition(x - config.width / 2 + Math.random() * config.width, fy);
            flame.setAlpha(0.5 + Math.random() * 0.3);
            flame.setScale(1);
          }
        });
        this.flames.push(flame);
      }
    }

    // Physics body (static sensor for most, static solid for spikes)
    const isSensor = config.texture === 'hazard-fire' || config.texture === 'hazard-oil';
    this.body = scene.matter.add.rectangle(x, y, config.width, config.height, {
      isStatic: true,
      isSensor,
      label: 'hazard',
      friction: config.texture === 'hazard-oil' ? 0.01 : 0.5,
      restitution: 0.1,
    });
    this.body.hazardRef = this;
  }

  /**
   * Called when truck collides with this hazard.
   * Returns the damage dealt (0 if on cooldown).
   */
  hit(time) {
    if (this.destroyed) return 0;

    // Cooldown check (for repeating hazards like spikes, fire, oil)
    if (this.config.cooldown > 0 && time - this.lastHitTime < this.config.cooldown) return 0;
    this.lastHitTime = time;

    const damage = this.config.damage;

    // Flash red
    if (this.sprite) {
      this.sprite.setTint(0xff0000);
      this.scene.time.delayedCall(100, () => {
        if (!this.destroyed && this.sprite) this.sprite.clearTint();
      });
    }

    // One-shot hazards (mines, TNT) destroy themselves
    if (this.config.cooldown === 0) {
      this.destroy();
    }

    return damage;
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.body) this.scene.matter.world.remove(this.body);
    if (this.sprite) { this.sprite.destroy(); this.sprite = null; }
    if (this.glow) { this.glow.destroy(); this.glow = null; }
    if (this.flames) {
      this.flames.forEach(f => f.destroy());
      this.flames = null;
    }
  }
}
