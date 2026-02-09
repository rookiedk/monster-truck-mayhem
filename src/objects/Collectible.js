export class Collectible {
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.collected = false;
    this.onCollect = config.onCollect || null;

    // Visual
    this.sprite = scene.add.image(x, y, 'gem').setDisplaySize(18, 18).setDepth(4);

    // Glow
    this.glow = scene.add.circle(x, y, 12, 0x44ffaa, 0.15).setDepth(3);
    scene.tweens.add({
      targets: this.glow,
      scaleX: 1.3, scaleY: 1.3, alpha: 0.05,
      duration: 600, yoyo: true, repeat: -1,
    });

    // Float
    scene.tweens.add({
      targets: [this.sprite, this.glow],
      y: y - 6, duration: 700,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Sensor body
    this.body = scene.matter.add.rectangle(x, y, 24, 24, {
      isStatic: true, isSensor: true, label: 'collectible',
    });
    this.body.collectibleRef = this;
  }

  collect() {
    if (this.collected) return;
    this.collected = true;
    if (this.onCollect) this.onCollect(this);
    this.scene.tweens.add({
      targets: [this.sprite, this.glow],
      y: this.y - 40, scaleX: 1.5, scaleY: 1.5, alpha: 0,
      duration: 300, ease: 'Power2',
      onComplete: () => {
        if (this.sprite) this.sprite.destroy();
        if (this.glow) this.glow.destroy();
      }
    });
    this.scene.matter.world.remove(this.body);
  }
}
