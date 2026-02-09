import Phaser from 'phaser';
import { TRUCK, PALETTES } from '../utils/constants.js';
import { ChallengeManager } from '../systems/ChallengeManager.js';

export class MonsterTruck {
  constructor(scene, x, y, difficulty = null) {
    this.difficulty = difficulty || { landingDamageThreshold: 20, landingDamageMul: 0.8, maxLandingDamage: 15 };
    this.scene = scene;

    // Load selected palette
    const paletteKey = ChallengeManager.getSelectedPalette();
    this.palette = PALETTES[paletteKey] || PALETTES.DEFAULT;

    const Matter = Phaser.Physics.Matter.Matter;
    const Bodies = Matter.Bodies;
    const Constraint = Matter.Constraint;
    const World = Matter.World;
    const world = scene.matter.world.engine.world;

    // ===== Physics Bodies =====
    this.chassis = Bodies.rectangle(x, y, TRUCK.CHASSIS_WIDTH, TRUCK.CHASSIS_HEIGHT, {
      label: 'chassis', density: TRUCK.CHASSIS_DENSITY,
      friction: 0.5, restitution: 0.1, collisionFilter: { group: -1 }
    });
    const wheelOpts = {
      label: 'wheel', density: TRUCK.WHEEL_DENSITY,
      friction: TRUCK.WHEEL_FRICTION, restitution: 0.05, collisionFilter: { group: -1 }
    };
    const wheelY = y + TRUCK.CHASSIS_HEIGHT / 2 + TRUCK.SUSPENSION_REST_LENGTH;
    this.frontWheel = Bodies.circle(x + TRUCK.WHEEL_OFFSET_X, wheelY, TRUCK.WHEEL_RADIUS, wheelOpts);
    this.rearWheel = Bodies.circle(x - TRUCK.WHEEL_OFFSET_X, wheelY, TRUCK.WHEEL_RADIUS, wheelOpts);
    World.add(world, [this.chassis, this.frontWheel, this.rearWheel]);

    // ===== Suspension =====
    const sp = { stiffness: TRUCK.SUSPENSION_STIFFNESS, damping: TRUCK.SUSPENSION_DAMPING, length: TRUCK.SUSPENSION_REST_LENGTH };
    this.frontSpring = Constraint.create({ bodyA: this.chassis, pointA: { x: TRUCK.WHEEL_OFFSET_X, y: TRUCK.CHASSIS_HEIGHT / 2 }, bodyB: this.frontWheel, pointB: { x: 0, y: 0 }, ...sp });
    this.rearSpring = Constraint.create({ bodyA: this.chassis, pointA: { x: -TRUCK.WHEEL_OFFSET_X, y: TRUCK.CHASSIS_HEIGHT / 2 }, bodyB: this.rearWheel, pointB: { x: 0, y: 0 }, ...sp });
    World.add(world, [this.frontSpring, this.rearSpring]);

    // ===== Sprites =====
    this.chassisSprite = scene.add.image(x, y, 'truck-body').setDepth(5).setOrigin(0.5);
    this.frontWheelSprite = scene.add.image(x + TRUCK.WHEEL_OFFSET_X, wheelY, 'truck-wheel').setDepth(6).setOrigin(0.5);
    this.rearWheelSprite = scene.add.image(x - TRUCK.WHEEL_OFFSET_X, wheelY, 'truck-wheel').setDepth(6).setOrigin(0.5);

    // Apply palette tint
    if (this.palette.bodyTint !== 0xffffff) {
      this.chassisSprite.setTint(this.palette.bodyTint);
    }
    if (this.palette.wheelTint !== 0xffffff) {
      this.frontWheelSprite.setTint(this.palette.wheelTint);
      this.rearWheelSprite.setTint(this.palette.wheelTint);
    }

    // ===== Exhaust Particles =====
    const pg = scene.make.graphics({ add: false });
    pg.fillStyle(0xffffff); pg.fillCircle(4, 4, 4);
    pg.generateTexture('exhaust-particle', 8, 8); pg.destroy();
    this.exhaustEmitter = scene.add.particles(0, 0, 'exhaust-particle', {
      speed: { min: 20, max: 80 }, angle: { min: 160, max: 200 },
      scale: { start: 0.5, end: 0 }, alpha: { start: 0.6, end: 0 },
      lifespan: { min: 200, max: 500 }, tint: [0xff4400, 0xff8800, 0xffaa00, 0x888888],
      frequency: -1, quantity: 3, depth: 4
    });

    // ===== State =====
    this.health = 100;
    this.maxHealth = 100;
    this.boostFuel = 100;
    this.maxBoostFuel = 100;
    this.isBoosting = false;
    this.isGrounded = false;
    this.airTime = 0;
    this.totalRotation = 0;
    this.lastAngle = this.chassis.angle;
    this.flipCount = 0;

    // Landing info (read by GameScene for scoring)
    this.justLanded = false;
    this.lastAirDuration = 0;
    this.lastFlipsDone = 0;

    // Jump state
    this.lastJumpTime = 0;
  }

  update(cursors, spacebar, delta, jumpKey) {
    const Body = Phaser.Physics.Matter.Matter.Body;

    // ===== Sync Sprites =====
    this.chassisSprite.setPosition(this.chassis.position.x, this.chassis.position.y).setRotation(this.chassis.angle);
    this.frontWheelSprite.setPosition(this.frontWheel.position.x, this.frontWheel.position.y).setRotation(this.frontWheel.angle);
    this.rearWheelSprite.setPosition(this.rearWheel.position.x, this.rearWheel.position.y).setRotation(this.rearWheel.angle);

    // ===== Ground Detection =====
    const wasGrounded = this.isGrounded;
    this.isGrounded = false;
    this.justLanded = false;
    const groundLabels = new Set(['terrain', 'destructible']);
    const pairs = this.scene.matter.world.engine.pairs.list;
    for (const pair of pairs) {
      if (!pair.isActive) continue;
      const a = pair.bodyA.label, b = pair.bodyB.label;
      if ((a === 'wheel' && groundLabels.has(b)) || (b === 'wheel' && groundLabels.has(a))) {
        this.isGrounded = true; break;
      }
    }

    // ===== Landing =====
    if (this.isGrounded && !wasGrounded) {
      this.justLanded = true;
      this.lastAirDuration = this.airTime;

      // Flip detection — generous: 120°+ counts as 1 flip
      const fullRots = Math.abs(this.totalRotation) / (Math.PI * 2);
      if (fullRots >= 0.33) {
        this.lastFlipsDone = Math.max(1, Math.round(fullRots));
      } else {
        this.lastFlipsDone = 0;
      }
      if (this.lastFlipsDone > 0) this.flipCount += this.lastFlipsDone;

      // Landing damage — difficulty-scaled
      const impact = Math.abs(this.chassis.velocity.y);
      const dif = this.difficulty;
      if (impact > dif.landingDamageThreshold) {
        const damage = Math.min(dif.maxLandingDamage, Math.floor((impact - dif.landingDamageThreshold) * dif.landingDamageMul));
        this.health = Math.max(0, this.health - damage);
        this.scene.cameras.main.shake(80, 0.004 * Math.min(impact - dif.landingDamageThreshold, 10));
      }
      this.airTime = 0;
      this.totalRotation = 0;
    }

    // ===== Air Time & Rotation =====
    if (!this.isGrounded) {
      this.airTime += delta / 1000;
      const diff = this.chassis.angle - this.lastAngle;
      this.totalRotation += Math.atan2(Math.sin(diff), Math.cos(diff));
    }
    this.lastAngle = this.chassis.angle;

    // ===== Controls =====
    const bm = this.isBoosting ? TRUCK.BOOST_MULTIPLIER : 1;

    if (cursors.right.isDown) {
      const as = TRUCK.WHEEL_SPEED * bm, ma = TRUCK.MAX_WHEEL_SPEED * bm;
      if (this.frontWheel.angularVelocity < ma) Body.setAngularVelocity(this.frontWheel, Math.min(this.frontWheel.angularVelocity + as, ma));
      if (this.rearWheel.angularVelocity < ma) Body.setAngularVelocity(this.rearWheel, Math.min(this.rearWheel.angularVelocity + as, ma));
      Body.applyForce(this.chassis, this.chassis.position, { x: TRUCK.DRIVE_FORCE * bm, y: 0 });
      if (this.exhaustEmitter) {
        const ex = this.chassis.position.x - 55 * Math.cos(this.chassis.angle);
        const ey = this.chassis.position.y - 55 * Math.sin(this.chassis.angle) - 10;
        this.exhaustEmitter.emitParticleAt(ex, ey, this.isBoosting ? 5 : 2);
      }
    }
    if (cursors.left.isDown) {
      Body.setAngularVelocity(this.frontWheel, this.frontWheel.angularVelocity * 0.92 - TRUCK.WHEEL_SPEED * 0.4);
      Body.setAngularVelocity(this.rearWheel, this.rearWheel.angularVelocity * 0.92 - TRUCK.WHEEL_SPEED * 0.4);
      Body.applyForce(this.chassis, this.chassis.position, { x: -TRUCK.DRIVE_FORCE * 0.5, y: 0 });
    }

    // Lean (stronger in air for flips)
    if (cursors.up.isDown) {
      const am = this.isGrounded ? 1 : 2.5;
      this.chassis.torque = -TRUCK.LEAN_TORQUE * am;
      if (!this.isGrounded) Body.setAngularVelocity(this.chassis, Math.max(this.chassis.angularVelocity - 0.02, -0.15));
    }
    if (cursors.down.isDown) {
      const am = this.isGrounded ? 1 : 2.5;
      this.chassis.torque = TRUCK.LEAN_TORQUE * am;
      if (!this.isGrounded) Body.setAngularVelocity(this.chassis, Math.min(this.chassis.angularVelocity + 0.02, 0.15));
    }

    // Boost
    this.isBoosting = spacebar.isDown && this.boostFuel > 0;
    if (this.isBoosting) this.boostFuel = Math.max(0, this.boostFuel - delta * 0.04);
    else this.boostFuel = Math.min(this.maxBoostFuel, this.boostFuel + delta * 0.008);

    this.chassisSprite.setTint(this.isBoosting ? this.palette.boostTint : (this.palette.bodyTint || 0xffffff));

    // Jump — direct velocity for an instant, satisfying hop
    if (jumpKey && jumpKey.isDown && this.isGrounded && this.boostFuel >= TRUCK.JUMP_FUEL_COST) {
      const now = this.scene.time.now;
      if (now - this.lastJumpTime >= TRUCK.JUMP_COOLDOWN) {
        this.lastJumpTime = now;
        this.boostFuel -= TRUCK.JUMP_FUEL_COST;
        const vx = this.chassis.velocity.x;
        Body.setVelocity(this.chassis, { x: vx, y: -TRUCK.JUMP_VELOCITY });
        Body.setVelocity(this.frontWheel, { x: vx, y: -TRUCK.JUMP_VELOCITY * 0.8 });
        Body.setVelocity(this.rearWheel, { x: vx, y: -TRUCK.JUMP_VELOCITY * 0.8 });

        // Dust poof at wheels
        if (this.scene.spawnDustPoof) {
          this.scene.spawnDustPoof(this.rearWheel.position.x, this.rearWheel.position.y + 10);
          this.scene.spawnDustPoof(this.frontWheel.position.x, this.frontWheel.position.y + 10);
        }
      }
    }

    // Speed cap
    const maxV = 22 * bm;
    if (Math.abs(this.chassis.velocity.x) > maxV)
      Body.setVelocity(this.chassis, { x: Math.sign(this.chassis.velocity.x) * maxV, y: this.chassis.velocity.y });
  }

  takeDamage(amount) {
    if (this.health <= 0) return; // Already dead, no more damage/shaking
    this.health = Math.max(0, this.health - amount);
    // Red flash
    if (amount >= 5) {
      this.chassisSprite.setTint(0xff0000);
      this.scene.time.delayedCall(150, () => {
        if (this.chassisSprite) {
          this.chassisSprite.setTint(this.palette.bodyTint || 0xffffff);
        }
      });
      this.scene.cameras.main.shake(80, 0.004 * Math.min(amount, 20));
    }
  }

  getPosition() { return { x: this.chassis.position.x, y: this.chassis.position.y }; }
  getVelocity() { return this.chassis.velocity; }
  getAngle() { return this.chassis.angle; }

  destroy() {
    const { World } = Phaser.Physics.Matter.Matter;
    const w = this.scene.matter.world.engine.world;
    World.remove(w, [this.chassis, this.frontWheel, this.rearWheel, this.frontSpring, this.rearSpring]);
    this.chassisSprite.destroy(); this.frontWheelSprite.destroy(); this.rearWheelSprite.destroy();
    if (this.exhaustEmitter) this.exhaustEmitter.destroy();
  }
}
