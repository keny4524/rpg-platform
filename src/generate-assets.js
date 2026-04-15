/**
 * ドット絵素材をCanvas APIで動的生成するユーティリティ
 * 外部画像ファイル不要 — すべてコードで描画
 */

export function generateTileset(scene) {
  // --- 草タイル (16x16) ---
  const grassGfx = scene.make.graphics({ x: 0, y: 0, add: false });
  grassGfx.fillStyle(0x4a7c59);
  grassGfx.fillRect(0, 0, 16, 16);
  // 草のディテール
  grassGfx.fillStyle(0x5a9c69);
  grassGfx.fillRect(2, 3, 2, 2);
  grassGfx.fillRect(8, 7, 2, 2);
  grassGfx.fillRect(12, 2, 2, 2);
  grassGfx.fillRect(5, 12, 2, 2);
  grassGfx.fillRect(11, 11, 2, 2);
  grassGfx.generateTexture('grass', 16, 16);
  grassGfx.destroy();

  // --- 道タイル (16x16) ---
  const pathGfx = scene.make.graphics({ x: 0, y: 0, add: false });
  pathGfx.fillStyle(0xc4a882);
  pathGfx.fillRect(0, 0, 16, 16);
  pathGfx.fillStyle(0xb89b74);
  pathGfx.fillRect(3, 5, 2, 2);
  pathGfx.fillRect(10, 9, 2, 2);
  pathGfx.fillRect(7, 2, 1, 1);
  pathGfx.generateTexture('path', 16, 16);
  pathGfx.destroy();

  // --- 水タイル (16x16) ---
  const waterGfx = scene.make.graphics({ x: 0, y: 0, add: false });
  waterGfx.fillStyle(0x3a6ea5);
  waterGfx.fillRect(0, 0, 16, 16);
  waterGfx.fillStyle(0x4a8ec5);
  waterGfx.fillRect(2, 4, 4, 1);
  waterGfx.fillRect(9, 8, 5, 1);
  waterGfx.fillRect(4, 12, 3, 1);
  waterGfx.generateTexture('water', 16, 16);
  waterGfx.destroy();

  // --- 壁/木タイル (16x16) ---
  const wallGfx = scene.make.graphics({ x: 0, y: 0, add: false });
  wallGfx.fillStyle(0x2d5a1e);
  wallGfx.fillRect(0, 0, 16, 16);
  wallGfx.fillStyle(0x1e4a0f);
  wallGfx.fillRect(3, 0, 10, 12);
  wallGfx.fillStyle(0x3d7a2e);
  wallGfx.fillRect(5, 2, 6, 8);
  wallGfx.fillStyle(0x6b4226);
  wallGfx.fillRect(6, 12, 4, 4);
  wallGfx.generateTexture('wall', 16, 16);
  wallGfx.destroy();

  // --- 花タイル (16x16) ---
  const flowerGfx = scene.make.graphics({ x: 0, y: 0, add: false });
  flowerGfx.fillStyle(0x4a7c59);
  flowerGfx.fillRect(0, 0, 16, 16);
  flowerGfx.fillStyle(0xff6b8a);
  flowerGfx.fillRect(3, 4, 3, 3);
  flowerGfx.fillRect(10, 8, 3, 3);
  flowerGfx.fillStyle(0xffd93d);
  flowerGfx.fillRect(4, 5, 1, 1);
  flowerGfx.fillRect(11, 9, 1, 1);
  flowerGfx.generateTexture('flower', 16, 16);
  flowerGfx.destroy();

  // --- 建物タイル (16x16) ---
  const buildingGfx = scene.make.graphics({ x: 0, y: 0, add: false });
  buildingGfx.fillStyle(0x8b7355);
  buildingGfx.fillRect(0, 0, 16, 16);
  buildingGfx.fillStyle(0xa0522d);
  buildingGfx.fillRect(1, 1, 14, 14);
  buildingGfx.fillStyle(0xdeb887);
  buildingGfx.fillRect(5, 8, 6, 7);
  buildingGfx.fillStyle(0x4a90d9);
  buildingGfx.fillRect(3, 3, 4, 4);
  buildingGfx.fillRect(9, 3, 4, 4);
  buildingGfx.generateTexture('building', 16, 16);
  buildingGfx.destroy();
}

export function generateCharacter(scene) {
  // --- プレイヤーキャラ (16x24) 下向き ---
  const charDown = scene.make.graphics({ x: 0, y: 0, add: false });
  // 髪
  charDown.fillStyle(0x2c1810);
  charDown.fillRect(4, 0, 8, 4);
  // 顔
  charDown.fillStyle(0xffcc99);
  charDown.fillRect(4, 3, 8, 6);
  // 目
  charDown.fillStyle(0x1a1a1a);
  charDown.fillRect(5, 5, 2, 2);
  charDown.fillRect(9, 5, 2, 2);
  // 体（服）
  charDown.fillStyle(0x4169e1);
  charDown.fillRect(3, 9, 10, 8);
  // 足
  charDown.fillStyle(0x8b4513);
  charDown.fillRect(4, 17, 3, 4);
  charDown.fillRect(9, 17, 3, 4);
  // 腕
  charDown.fillStyle(0x4169e1);
  charDown.fillRect(2, 10, 2, 6);
  charDown.fillRect(12, 10, 2, 6);
  charDown.generateTexture('player_down', 16, 24);
  charDown.destroy();

  // 歩きアニメ用フレーム (左足前)
  const charDown2 = scene.make.graphics({ x: 0, y: 0, add: false });
  charDown2.fillStyle(0x2c1810);
  charDown2.fillRect(4, 0, 8, 4);
  charDown2.fillStyle(0xffcc99);
  charDown2.fillRect(4, 3, 8, 6);
  charDown2.fillStyle(0x1a1a1a);
  charDown2.fillRect(5, 5, 2, 2);
  charDown2.fillRect(9, 5, 2, 2);
  charDown2.fillStyle(0x4169e1);
  charDown2.fillRect(3, 9, 10, 8);
  charDown2.fillStyle(0x8b4513);
  charDown2.fillRect(3, 17, 3, 5);
  charDown2.fillRect(10, 17, 3, 3);
  charDown2.fillStyle(0x4169e1);
  charDown2.fillRect(2, 10, 2, 6);
  charDown2.fillRect(12, 10, 2, 6);
  charDown2.generateTexture('player_down_walk', 16, 24);
  charDown2.destroy();

  // --- 上向き ---
  const charUp = scene.make.graphics({ x: 0, y: 0, add: false });
  charUp.fillStyle(0x2c1810);
  charUp.fillRect(4, 0, 8, 6);
  charUp.fillStyle(0x4169e1);
  charUp.fillRect(3, 9, 10, 8);
  charUp.fillStyle(0x8b4513);
  charUp.fillRect(4, 17, 3, 4);
  charUp.fillRect(9, 17, 3, 4);
  charUp.fillStyle(0x4169e1);
  charUp.fillRect(2, 10, 2, 6);
  charUp.fillRect(12, 10, 2, 6);
  charUp.generateTexture('player_up', 16, 24);
  charUp.destroy();

  // --- 左向き ---
  const charLeft = scene.make.graphics({ x: 0, y: 0, add: false });
  charLeft.fillStyle(0x2c1810);
  charLeft.fillRect(4, 0, 8, 4);
  charLeft.fillStyle(0xffcc99);
  charLeft.fillRect(4, 3, 7, 6);
  charLeft.fillStyle(0x1a1a1a);
  charLeft.fillRect(5, 5, 2, 2);
  charLeft.fillStyle(0x4169e1);
  charLeft.fillRect(3, 9, 9, 8);
  charLeft.fillStyle(0x8b4513);
  charLeft.fillRect(4, 17, 3, 4);
  charLeft.fillRect(8, 17, 3, 4);
  charLeft.fillStyle(0x4169e1);
  charLeft.fillRect(2, 10, 2, 6);
  charLeft.generateTexture('player_left', 16, 24);
  charLeft.destroy();

  // --- 右向き ---
  const charRight = scene.make.graphics({ x: 0, y: 0, add: false });
  charRight.fillStyle(0x2c1810);
  charRight.fillRect(4, 0, 8, 4);
  charRight.fillStyle(0xffcc99);
  charRight.fillRect(5, 3, 7, 6);
  charRight.fillStyle(0x1a1a1a);
  charRight.fillRect(9, 5, 2, 2);
  charRight.fillStyle(0x4169e1);
  charRight.fillRect(4, 9, 9, 8);
  charRight.fillStyle(0x8b4513);
  charRight.fillRect(5, 17, 3, 4);
  charRight.fillRect(9, 17, 3, 4);
  charRight.fillStyle(0x4169e1);
  charRight.fillRect(12, 10, 2, 6);
  charRight.generateTexture('player_right', 16, 24);
  charRight.destroy();
}

export function generateQuestBoard(scene) {
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
  // 支柱
  gfx.fillStyle(0x6b4226);
  gfx.fillRect(7, 16, 2, 16);
  // 看板本体
  gfx.fillStyle(0x8b6914);
  gfx.fillRect(0, 0, 16, 18);
  // 枠
  gfx.fillStyle(0x6b4226);
  gfx.lineStyle(1, 0x5a3a1a);
  gfx.fillRect(0, 0, 16, 2);
  gfx.fillRect(0, 16, 16, 2);
  gfx.fillRect(0, 0, 2, 18);
  gfx.fillRect(14, 0, 2, 18);
  // 紙（クエスト）
  gfx.fillStyle(0xf5f5dc);
  gfx.fillRect(3, 3, 5, 5);
  gfx.fillRect(9, 3, 5, 5);
  gfx.fillRect(3, 10, 5, 5);
  gfx.fillRect(9, 10, 5, 5);
  // 紙の文字っぽい線
  gfx.fillStyle(0x333333);
  gfx.fillRect(4, 4, 3, 1);
  gfx.fillRect(4, 6, 2, 1);
  gfx.fillRect(10, 4, 3, 1);
  gfx.fillRect(10, 6, 2, 1);
  gfx.fillRect(4, 11, 3, 1);
  gfx.fillRect(4, 13, 2, 1);
  gfx.fillRect(10, 11, 3, 1);
  gfx.fillRect(10, 13, 2, 1);
  gfx.generateTexture('quest_board', 16, 32);
  gfx.destroy();
}

export function generateNPC(scene) {
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
  // 髪
  gfx.fillStyle(0xc0392b);
  gfx.fillRect(4, 0, 8, 4);
  // 顔
  gfx.fillStyle(0xffcc99);
  gfx.fillRect(4, 3, 8, 6);
  // 目
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(5, 5, 2, 2);
  gfx.fillRect(9, 5, 2, 2);
  // 体（緑の服）
  gfx.fillStyle(0x27ae60);
  gfx.fillRect(3, 9, 10, 8);
  // 足
  gfx.fillStyle(0x8b4513);
  gfx.fillRect(4, 17, 3, 4);
  gfx.fillRect(9, 17, 3, 4);
  // 腕
  gfx.fillStyle(0x27ae60);
  gfx.fillRect(2, 10, 2, 6);
  gfx.fillRect(12, 10, 2, 6);
  gfx.generateTexture('npc', 16, 24);
  gfx.destroy();
}

export function generateExclamationMark(scene) {
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
  gfx.fillStyle(0xffd700);
  // ！マーク
  gfx.fillRect(3, 0, 4, 7);
  gfx.fillRect(3, 9, 4, 3);
  gfx.generateTexture('exclamation', 10, 12);
  gfx.destroy();
}
