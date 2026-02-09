export class Destructible {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.config = config;
    this.x = x;
    this.y = y;
    this.destroyed = false;
    this.health = config.health || 1;
    this.onDestroy = config.onDestroy || null;

    // Visual
    this.sprite = scene.add.image(x, y, config.texture);
    this.sprite.setDisplaySize(config.width, config.height);
    this.sprite.setDepth(4);

    // Physics body (static rectangle)
    this.body = scene.matter.add.rectangle(x, y, config.width, config.height, {
      isStatic: true,
      label: 'destructible',
      friction: 0.5,
      restitution: 0.1,
    });
    this.body.destructibleRef = this;
  }

  damage(amount = 1) {
    if (this.destroyed) return;
    this.health -= amount;

    // Flash white
    if (this.sprite) {
      this.sprite.setTint(0xffffff);
      this.scene.time.delayedCall(60, () => {
        if (!this.destroyed && this.sprite) this.sprite.clearTint();
      });
    }

    if (this.health <= 0) this.destroy();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.onDestroy) this.onDestroy(this);
    if (this.body) this.scene.matter.world.remove(this.body);
    if (this.sprite) { this.sprite.destroy(); this.sprite = null; }
  }
}
