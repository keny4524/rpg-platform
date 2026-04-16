/**
 * LPC素材ベースのアセット読み込み
 */

export function preloadAssets(scene) {
  // タイルセット
  scene.load.image('grass', 'assets/tile-grass.png');
  scene.load.image('path', 'assets/tile-path.png');
  scene.load.image('water', 'assets/tile-water.png');
  scene.load.image('wall', 'assets/tile-tree.png');
  scene.load.image('flower', 'assets/tile-flower.png');
  scene.load.image('building', 'assets/tile-grass2.png');

  // プレイヤー walk spritesheet (576x256 = 9 cols x 4 rows, 64x64 per frame)
  scene.load.spritesheet('hero', 'assets/hero-walk.png', {
    frameWidth: 64,
    frameHeight: 64,
  });

  // NPC walk spritesheet
  scene.load.spritesheet('npc', 'assets/npc-mage-walk.png', {
    frameWidth: 64,
    frameHeight: 64,
  });
}

export function createAnimations(scene) {
  // LPC walk spritesheet layout (each row = direction, 9 frames):
  // Row 0 (frames 0-8): Up    — frame 0 is standing
  // Row 1 (frames 9-17): Left — frame 9 is standing
  // Row 2 (frames 18-26): Down — frame 18 is standing
  // Row 3 (frames 27-35): Right — frame 27 is standing

  // Hero walk animations (frames 1-8 for each direction = walking cycle)
  scene.anims.create({
    key: 'hero-walk-up',
    frames: scene.anims.generateFrameNumbers('hero', { start: 1, end: 8 }),
    frameRate: 10, repeat: -1,
  });
  scene.anims.create({
    key: 'hero-walk-left',
    frames: scene.anims.generateFrameNumbers('hero', { start: 10, end: 17 }),
    frameRate: 10, repeat: -1,
  });
  scene.anims.create({
    key: 'hero-walk-down',
    frames: scene.anims.generateFrameNumbers('hero', { start: 19, end: 26 }),
    frameRate: 10, repeat: -1,
  });
  scene.anims.create({
    key: 'hero-walk-right',
    frames: scene.anims.generateFrameNumbers('hero', { start: 28, end: 35 }),
    frameRate: 10, repeat: -1,
  });

  // Hero idle (single frame = standing pose from walk sheet)
  scene.anims.create({
    key: 'hero-idle-up',
    frames: [{ key: 'hero', frame: 0 }],
    frameRate: 1,
  });
  scene.anims.create({
    key: 'hero-idle-left',
    frames: [{ key: 'hero', frame: 9 }],
    frameRate: 1,
  });
  scene.anims.create({
    key: 'hero-idle-down',
    frames: [{ key: 'hero', frame: 18 }],
    frameRate: 1,
  });
  scene.anims.create({
    key: 'hero-idle-right',
    frames: [{ key: 'hero', frame: 27 }],
    frameRate: 1,
  });

  // NPC idle (down-facing standing)
  scene.anims.create({
    key: 'npc-idle-down',
    frames: [{ key: 'npc', frame: 18 }],
    frameRate: 1,
  });
}

// クエストボード
export function generateQuestBoard(scene) {
  const g = scene.make.graphics({ add: false });
  g.fillStyle(0x5d3a1a); g.fillRect(10, 28, 4, 20);
  g.fillStyle(0x5d3a1a); g.fillRect(30, 28, 4, 20);
  g.fillStyle(0x6b4226); g.fillRect(11, 30, 2, 16);
  g.fillStyle(0x6b4226); g.fillRect(31, 30, 2, 16);
  g.fillStyle(0xa07828); g.fillRect(4, 4, 36, 26);
  g.fillStyle(0x6b4226); g.fillRect(4, 4, 36, 3);
  g.fillStyle(0x6b4226); g.fillRect(4, 27, 36, 3);
  g.fillStyle(0x6b4226); g.fillRect(4, 4, 3, 26);
  g.fillStyle(0x6b4226); g.fillRect(37, 4, 3, 26);
  g.fillStyle(0xf1c40f); g.fillRect(4, 4, 3, 3);
  g.fillStyle(0xf1c40f); g.fillRect(37, 4, 3, 3);
  g.fillStyle(0xf1c40f); g.fillRect(4, 27, 3, 3);
  g.fillStyle(0xf1c40f); g.fillRect(37, 27, 3, 3);
  g.fillStyle(0xfaf0dc); g.fillRect(8, 8, 12, 8);
  g.fillStyle(0xfaf0dc); g.fillRect(24, 8, 12, 8);
  g.fillStyle(0xfaf0dc); g.fillRect(8, 18, 12, 8);
  g.fillStyle(0xe8dcc8); g.fillRect(24, 18, 12, 8);
  g.fillStyle(0xe74c3c); g.fillRect(13, 8, 2, 2);
  g.fillStyle(0x3498db); g.fillRect(29, 8, 2, 2);
  g.fillStyle(0xf1c40f); g.fillRect(13, 18, 2, 2);
  g.fillStyle(0x27ae60); g.fillRect(29, 18, 2, 2);
  g.generateTexture('quest_board', 44, 48);
  g.destroy();
}

export function generateExclamationMark(scene) {
  const g = scene.make.graphics({ add: false });
  g.fillStyle(0xffd700); g.fillRect(4, 0, 8, 16);
  g.fillStyle(0xffd700); g.fillRect(3, 1, 10, 14);
  g.fillStyle(0xffffff); g.fillRect(5, 1, 6, 10);
  g.fillStyle(0xffffff); g.fillRect(6, 2, 4, 8);
  g.fillStyle(0xffffff); g.fillRect(5, 13, 6, 4);
  g.fillStyle(0xffffff); g.fillRect(6, 14, 4, 2);
  g.generateTexture('exclamation', 16, 20);
  g.destroy();
}
