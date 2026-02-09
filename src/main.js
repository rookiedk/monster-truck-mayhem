import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ScoreScene } from './scenes/ScoreScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './utils/constants.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0a0a15',
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 1.8 },
      debug: false,
      enableSleeping: false
    }
  },
  scene: [BootScene, MenuScene, LevelSelectScene, GameScene, ScoreScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true
  }
};

new Phaser.Game(config);
