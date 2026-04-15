/**
 * 原神風ファンタジー2Dドット絵素材
 * Canvas APIで動的生成 — 外部ファイル不要
 */

// ヘルパー: ピクセルを描く
function px(gfx, x, y, color, w = 1, h = 1) {
  gfx.fillStyle(color);
  gfx.fillRect(x, y, w, h);
}

// ========== タイルセット (32x32) ==========

export function generateTileset(scene) {
  // --- 草タイル ---
  const grass = scene.make.graphics({ add: false });
  // ベース
  px(grass, 0, 0, 0x3d8b37, 32, 32);
  // グラデーション風の色変化
  px(grass, 0, 0, 0x4a9e42, 32, 8);
  px(grass, 0, 8, 0x3d8b37, 32, 8);
  px(grass, 0, 16, 0x358030, 32, 8);
  px(grass, 0, 24, 0x3d8b37, 32, 8);
  // 草のディテール
  px(grass, 3, 5, 0x5cb85c, 2, 3);
  px(grass, 10, 3, 0x5cb85c, 1, 2);
  px(grass, 18, 7, 0x5cb85c, 2, 2);
  px(grass, 25, 4, 0x5cb85c, 1, 3);
  px(grass, 7, 14, 0x5cb85c, 2, 2);
  px(grass, 22, 18, 0x5cb85c, 1, 2);
  px(grass, 14, 22, 0x5cb85c, 2, 2);
  px(grass, 5, 26, 0x5cb85c, 1, 3);
  px(grass, 28, 12, 0x5cb85c, 2, 2);
  // 小さな花
  px(grass, 12, 10, 0xffd700, 1, 1);
  px(grass, 26, 24, 0xff9ff3, 1, 1);
  grass.generateTexture('grass', 32, 32);
  grass.destroy();

  // --- 道タイル（石畳風）---
  const path = scene.make.graphics({ add: false });
  px(path, 0, 0, 0xc4a97d, 32, 32);
  // 石畳パターン
  for (let y = 0; y < 32; y += 8) {
    for (let x = 0; x < 32; x += 10) {
      const offset = (y / 8 % 2) * 5;
      const shade = [0xd4b98e, 0xbfa273, 0xcbb488][Math.floor(Math.random() * 3)];
      px(path, (x + offset) % 32, y, shade, 8, 6);
      // 石の隙間
      px(path, (x + offset) % 32, y + 6, 0xa08560, 8, 2);
      px(path, (x + offset + 8) % 32, y, 0xa08560, 2, 6);
    }
  }
  // 少しランダムなディテール
  px(path, 5, 3, 0xd4b98e, 6, 4);
  px(path, 17, 3, 0xcbb488, 6, 4);
  px(path, 2, 11, 0xbfa273, 7, 4);
  px(path, 12, 11, 0xd4b98e, 7, 4);
  px(path, 24, 11, 0xcbb488, 6, 4);
  px(path, 7, 19, 0xd4b98e, 6, 4);
  px(path, 19, 19, 0xbfa273, 7, 4);
  px(path, 3, 27, 0xcbb488, 7, 4);
  px(path, 15, 27, 0xd4b98e, 6, 4);
  px(path, 26, 27, 0xbfa273, 5, 4);
  path.generateTexture('path', 32, 32);
  path.destroy();

  // --- 水タイル（クリスタルブルー）---
  const water = scene.make.graphics({ add: false });
  px(water, 0, 0, 0x2980b9, 32, 32);
  // 波のパターン
  px(water, 0, 0, 0x3498db, 32, 6);
  px(water, 0, 6, 0x2980b9, 32, 6);
  px(water, 0, 12, 0x2471a3, 32, 6);
  px(water, 0, 18, 0x2980b9, 32, 6);
  px(water, 0, 24, 0x3498db, 32, 8);
  // 光の反射
  px(water, 4, 2, 0x5dade2, 6, 2);
  px(water, 18, 8, 0x5dade2, 4, 1);
  px(water, 8, 16, 0x5dade2, 5, 1);
  px(water, 22, 22, 0x5dade2, 3, 2);
  px(water, 12, 26, 0x85c1e9, 2, 1);
  // 泡
  px(water, 6, 14, 0xaed6f1, 2, 2);
  px(water, 24, 6, 0xaed6f1, 1, 1);
  water.generateTexture('water', 32, 32);
  water.destroy();

  // --- 木/森タイル ---
  const wall = scene.make.graphics({ add: false });
  // 地面ベース
  px(wall, 0, 0, 0x2d5a1e, 32, 32);
  // 幹
  px(wall, 13, 20, 0x6b4226, 6, 12);
  px(wall, 14, 22, 0x7d4e2a, 4, 8);
  // 葉（大きな丸い木冠）
  px(wall, 6, 2, 0x27ae60, 20, 18);
  px(wall, 4, 5, 0x27ae60, 24, 14);
  px(wall, 8, 0, 0x2ecc71, 16, 6);
  // 葉のハイライト
  px(wall, 10, 3, 0x58d68d, 4, 3);
  px(wall, 18, 6, 0x58d68d, 3, 3);
  px(wall, 8, 10, 0x58d68d, 3, 2);
  px(wall, 20, 12, 0x52be80, 3, 2);
  // 葉の影
  px(wall, 6, 14, 0x1e8449, 6, 4);
  px(wall, 20, 14, 0x1e8449, 6, 4);
  px(wall, 10, 16, 0x1e8449, 12, 3);
  // 根っこ
  px(wall, 11, 30, 0x5d3a1a, 3, 2);
  px(wall, 18, 30, 0x5d3a1a, 3, 2);
  wall.generateTexture('wall', 32, 32);
  wall.destroy();

  // --- 花タイル ---
  const flower = scene.make.graphics({ add: false });
  // 草ベース
  px(flower, 0, 0, 0x3d8b37, 32, 32);
  px(flower, 0, 0, 0x4a9e42, 32, 10);
  px(flower, 0, 10, 0x3d8b37, 32, 12);
  px(flower, 0, 22, 0x358030, 32, 10);
  // 草ディテール
  px(flower, 6, 6, 0x5cb85c, 2, 2);
  px(flower, 22, 20, 0x5cb85c, 2, 2);
  // 花1（赤い花 - 原神のセシリアっぽく）
  px(flower, 6, 12, 0x2ecc71, 1, 4); // 茎
  px(flower, 4, 9, 0xe74c3c, 5, 4);
  px(flower, 5, 8, 0xe74c3c, 3, 1);
  px(flower, 5, 13, 0xe74c3c, 3, 1);
  px(flower, 6, 10, 0xf1c40f, 1, 2); // 花芯
  // 花2（青い花）
  px(flower, 20, 18, 0x2ecc71, 1, 4); // 茎
  px(flower, 18, 15, 0x3498db, 5, 4);
  px(flower, 19, 14, 0x3498db, 3, 1);
  px(flower, 19, 19, 0x3498db, 3, 1);
  px(flower, 20, 16, 0xf1c40f, 1, 2); // 花芯
  // 花3（紫の花）
  px(flower, 14, 25, 0x2ecc71, 1, 4);
  px(flower, 12, 22, 0x9b59b6, 5, 4);
  px(flower, 13, 21, 0x9b59b6, 3, 1);
  px(flower, 14, 23, 0xf1c40f, 1, 2);
  // 花4（ピンクの花）
  px(flower, 26, 6, 0x2ecc71, 1, 3);
  px(flower, 24, 3, 0xff6b9d, 5, 4);
  px(flower, 25, 2, 0xff6b9d, 3, 1);
  px(flower, 26, 4, 0xf1c40f, 1, 2);
  flower.generateTexture('flower', 32, 32);
  flower.destroy();

  // --- 建物タイル（ファンタジーハウス）---
  const building = scene.make.graphics({ add: false });
  // 地面
  px(building, 0, 0, 0x3d8b37, 32, 32);
  // 壁
  px(building, 3, 10, 0xf5e6ca, 26, 20);
  px(building, 4, 11, 0xfaf0dc, 24, 18);
  // 屋根（三角）
  px(building, 0, 10, 0xc0392b, 32, 4);
  px(building, 2, 7, 0xc0392b, 28, 3);
  px(building, 4, 5, 0xc0392b, 24, 2);
  px(building, 7, 3, 0xc0392b, 18, 2);
  px(building, 10, 1, 0xc0392b, 12, 2);
  px(building, 13, 0, 0xe74c3c, 6, 1);
  // 屋根のハイライト
  px(building, 3, 7, 0xe74c3c, 14, 2);
  px(building, 8, 3, 0xe74c3c, 8, 2);
  // ドア
  px(building, 13, 22, 0x6b4226, 6, 10);
  px(building, 14, 23, 0x8b5a2b, 4, 8);
  px(building, 17, 26, 0xf1c40f, 1, 1); // ドアノブ
  // 窓（左）
  px(building, 6, 16, 0x85c1e9, 4, 4);
  px(building, 7, 17, 0xaed6f1, 2, 2);
  px(building, 6, 16, 0x5d4e37, 4, 1);
  px(building, 6, 20, 0x5d4e37, 4, 1);
  px(building, 6, 16, 0x5d4e37, 1, 4);
  px(building, 10, 16, 0x5d4e37, 1, 4);
  // 窓（右）
  px(building, 22, 16, 0x85c1e9, 4, 4);
  px(building, 23, 17, 0xaed6f1, 2, 2);
  px(building, 22, 16, 0x5d4e37, 4, 1);
  px(building, 22, 20, 0x5d4e37, 4, 1);
  px(building, 22, 16, 0x5d4e37, 1, 4);
  px(building, 26, 16, 0x5d4e37, 1, 4);
  building.generateTexture('building', 32, 32);
  building.destroy();
}

// ========== プレイヤーキャラクター (20x32) — 原神風アニメキャラ ==========

export function generateCharacter(scene) {
  // --- 下向き ---
  const down = scene.make.graphics({ add: false });
  // 髪（青みがかった黒 — 原神の旅人風）
  px(down, 5, 0, 0x2c3e50, 10, 3);
  px(down, 4, 2, 0x2c3e50, 12, 3);
  px(down, 3, 4, 0x34495e, 14, 2);
  // 前髪
  px(down, 4, 5, 0x2c3e50, 4, 2);
  px(down, 12, 5, 0x2c3e50, 4, 2);
  // 顔
  px(down, 5, 5, 0xfdd9b5, 10, 6);
  px(down, 6, 6, 0xfdd9b5, 8, 5);
  // 目（大きめ — アニメ風）
  px(down, 6, 7, 0x2c3e50, 3, 3);
  px(down, 11, 7, 0x2c3e50, 3, 3);
  px(down, 7, 7, 0x3498db, 2, 2); // 瞳（青）
  px(down, 12, 7, 0x3498db, 2, 2);
  px(down, 7, 7, 0xffffff, 1, 1); // ハイライト
  px(down, 12, 7, 0xffffff, 1, 1);
  // 口
  px(down, 9, 10, 0xe88b7a, 2, 1);
  // 体（白と青のコート — 原神風衣装）
  px(down, 4, 12, 0xecf0f1, 12, 10);
  px(down, 5, 13, 0x3498db, 10, 8);
  // 衣装のディテール
  px(down, 9, 13, 0xf1c40f, 2, 1); // 金のアクセント
  px(down, 9, 14, 0xecf0f1, 2, 6); // 中央のライン
  // 腕
  px(down, 2, 13, 0xecf0f1, 3, 7);
  px(down, 15, 13, 0xecf0f1, 3, 7);
  px(down, 3, 14, 0x3498db, 2, 5);
  px(down, 15, 14, 0x3498db, 2, 5);
  // 手
  px(down, 3, 20, 0xfdd9b5, 2, 2);
  px(down, 15, 20, 0xfdd9b5, 2, 2);
  // ベルト
  px(down, 5, 21, 0x8b6914, 10, 1);
  px(down, 9, 21, 0xf1c40f, 2, 1);
  // 脚
  px(down, 5, 22, 0x2c3e50, 4, 6);
  px(down, 11, 22, 0x2c3e50, 4, 6);
  // ブーツ
  px(down, 5, 27, 0x6b4226, 4, 5);
  px(down, 11, 27, 0x6b4226, 4, 5);
  px(down, 5, 28, 0x7d4e2a, 3, 3);
  px(down, 12, 28, 0x7d4e2a, 3, 3);
  down.generateTexture('player_down', 20, 32);
  down.destroy();

  // --- 下向き歩き ---
  const downW = scene.make.graphics({ add: false });
  px(downW, 5, 0, 0x2c3e50, 10, 3);
  px(downW, 4, 2, 0x2c3e50, 12, 3);
  px(downW, 3, 4, 0x34495e, 14, 2);
  px(downW, 4, 5, 0x2c3e50, 4, 2);
  px(downW, 12, 5, 0x2c3e50, 4, 2);
  px(downW, 5, 5, 0xfdd9b5, 10, 6);
  px(downW, 6, 6, 0xfdd9b5, 8, 5);
  px(downW, 6, 7, 0x2c3e50, 3, 3);
  px(downW, 11, 7, 0x2c3e50, 3, 3);
  px(downW, 7, 7, 0x3498db, 2, 2);
  px(downW, 12, 7, 0x3498db, 2, 2);
  px(downW, 7, 7, 0xffffff, 1, 1);
  px(downW, 12, 7, 0xffffff, 1, 1);
  px(downW, 9, 10, 0xe88b7a, 2, 1);
  px(downW, 4, 12, 0xecf0f1, 12, 10);
  px(downW, 5, 13, 0x3498db, 10, 8);
  px(downW, 9, 13, 0xf1c40f, 2, 1);
  px(downW, 9, 14, 0xecf0f1, 2, 6);
  px(downW, 2, 13, 0xecf0f1, 3, 7);
  px(downW, 15, 13, 0xecf0f1, 3, 7);
  px(downW, 3, 14, 0x3498db, 2, 5);
  px(downW, 15, 14, 0x3498db, 2, 5);
  px(downW, 3, 20, 0xfdd9b5, 2, 2);
  px(downW, 15, 20, 0xfdd9b5, 2, 2);
  px(downW, 5, 21, 0x8b6914, 10, 1);
  px(downW, 9, 21, 0xf1c40f, 2, 1);
  // 歩きポーズ（足を交差）
  px(downW, 4, 22, 0x2c3e50, 4, 6);
  px(downW, 12, 22, 0x2c3e50, 4, 7);
  px(downW, 4, 27, 0x6b4226, 4, 5);
  px(downW, 12, 28, 0x6b4226, 4, 4);
  downW.generateTexture('player_down_walk', 20, 32);
  downW.destroy();

  // --- 上向き ---
  const up = scene.make.graphics({ add: false });
  px(up, 5, 0, 0x2c3e50, 10, 3);
  px(up, 4, 2, 0x2c3e50, 12, 5);
  px(up, 3, 4, 0x34495e, 14, 4);
  // 後ろ髪（長め）
  px(up, 6, 7, 0x2c3e50, 8, 5);
  px(up, 4, 12, 0xecf0f1, 12, 10);
  px(up, 5, 13, 0x3498db, 10, 8);
  px(up, 9, 14, 0xecf0f1, 2, 6);
  px(up, 2, 13, 0xecf0f1, 3, 7);
  px(up, 15, 13, 0xecf0f1, 3, 7);
  px(up, 3, 14, 0x3498db, 2, 5);
  px(up, 15, 14, 0x3498db, 2, 5);
  px(up, 5, 21, 0x8b6914, 10, 1);
  px(up, 5, 22, 0x2c3e50, 4, 6);
  px(up, 11, 22, 0x2c3e50, 4, 6);
  px(up, 5, 27, 0x6b4226, 4, 5);
  px(up, 11, 27, 0x6b4226, 4, 5);
  up.generateTexture('player_up', 20, 32);
  up.destroy();

  // --- 左向き ---
  const left = scene.make.graphics({ add: false });
  px(left, 5, 0, 0x2c3e50, 10, 3);
  px(left, 4, 2, 0x2c3e50, 11, 4);
  px(left, 3, 5, 0x34495e, 10, 2);
  px(left, 4, 5, 0xfdd9b5, 8, 6);
  px(left, 5, 7, 0x2c3e50, 3, 3);
  px(left, 6, 7, 0x3498db, 2, 2);
  px(left, 6, 7, 0xffffff, 1, 1);
  px(left, 9, 10, 0xe88b7a, 1, 1);
  px(left, 4, 12, 0xecf0f1, 10, 10);
  px(left, 5, 13, 0x3498db, 8, 8);
  px(left, 2, 13, 0xecf0f1, 3, 7);
  px(left, 3, 14, 0x3498db, 2, 5);
  px(left, 3, 20, 0xfdd9b5, 2, 2);
  px(left, 5, 21, 0x8b6914, 8, 1);
  px(left, 6, 22, 0x2c3e50, 4, 6);
  px(left, 10, 22, 0x2c3e50, 3, 6);
  px(left, 6, 27, 0x6b4226, 4, 5);
  px(left, 10, 27, 0x6b4226, 3, 5);
  left.generateTexture('player_left', 20, 32);
  left.destroy();

  // --- 右向き ---
  const right = scene.make.graphics({ add: false });
  px(right, 5, 0, 0x2c3e50, 10, 3);
  px(right, 5, 2, 0x2c3e50, 11, 4);
  px(right, 7, 5, 0x34495e, 10, 2);
  px(right, 8, 5, 0xfdd9b5, 8, 6);
  px(right, 12, 7, 0x2c3e50, 3, 3);
  px(right, 12, 7, 0x3498db, 2, 2);
  px(right, 13, 7, 0xffffff, 1, 1);
  px(right, 10, 10, 0xe88b7a, 1, 1);
  px(right, 6, 12, 0xecf0f1, 10, 10);
  px(right, 7, 13, 0x3498db, 8, 8);
  px(right, 15, 13, 0xecf0f1, 3, 7);
  px(right, 15, 14, 0x3498db, 2, 5);
  px(right, 15, 20, 0xfdd9b5, 2, 2);
  px(right, 7, 21, 0x8b6914, 8, 1);
  px(right, 7, 22, 0x2c3e50, 3, 6);
  px(right, 10, 22, 0x2c3e50, 4, 6);
  px(right, 7, 27, 0x6b4226, 3, 5);
  px(right, 10, 27, 0x6b4226, 4, 5);
  right.generateTexture('player_right', 20, 32);
  right.destroy();
}

// ========== クエストボード (32x48) ==========

export function generateQuestBoard(scene) {
  const g = scene.make.graphics({ add: false });
  // 支柱（2本）
  px(g, 6, 28, 0x5d3a1a, 4, 20);
  px(g, 22, 28, 0x5d3a1a, 4, 20);
  px(g, 7, 30, 0x6b4226, 2, 16);
  px(g, 23, 30, 0x6b4226, 2, 16);
  // 看板本体
  px(g, 2, 2, 0x8b6914, 28, 28);
  px(g, 3, 3, 0xa07828, 26, 26);
  // 枠
  px(g, 2, 2, 0x6b4226, 28, 3);
  px(g, 2, 27, 0x6b4226, 28, 3);
  px(g, 2, 2, 0x6b4226, 3, 28);
  px(g, 27, 2, 0x6b4226, 3, 28);
  // 角の装飾（金の飾り）
  px(g, 2, 2, 0xf1c40f, 3, 3);
  px(g, 27, 2, 0xf1c40f, 3, 3);
  px(g, 2, 27, 0xf1c40f, 3, 3);
  px(g, 27, 27, 0xf1c40f, 3, 3);
  // 貼り紙（クエスト）
  px(g, 6, 6, 0xfaf0dc, 9, 9);
  px(g, 17, 6, 0xfaf0dc, 9, 9);
  px(g, 6, 17, 0xfaf0dc, 9, 9);
  px(g, 17, 17, 0xe8dcc8, 9, 9);
  // 文字っぽい線
  px(g, 7, 8, 0x444, 6, 1);
  px(g, 7, 10, 0x444, 4, 1);
  px(g, 7, 12, 0x444, 5, 1);
  px(g, 18, 8, 0x444, 6, 1);
  px(g, 18, 10, 0x444, 5, 1);
  px(g, 7, 19, 0x444, 5, 1);
  px(g, 7, 21, 0x444, 6, 1);
  px(g, 18, 19, 0x444, 4, 1);
  px(g, 18, 21, 0x444, 6, 1);
  // ピン
  px(g, 10, 6, 0xe74c3c, 2, 2);
  px(g, 21, 6, 0x3498db, 2, 2);
  px(g, 10, 17, 0xf1c40f, 2, 2);
  px(g, 21, 17, 0x27ae60, 2, 2);
  g.generateTexture('quest_board', 32, 48);
  g.destroy();
}

// ========== NPC (20x32) — ファンタジーNPC ==========

export function generateNPC(scene) {
  const g = scene.make.graphics({ add: false });
  // 髪（赤 — 炎のような）
  px(g, 5, 0, 0xc0392b, 10, 3);
  px(g, 4, 2, 0xe74c3c, 12, 4);
  px(g, 3, 4, 0xc0392b, 14, 2);
  // 顔
  px(g, 5, 5, 0xfdd9b5, 10, 6);
  px(g, 6, 6, 0xfdd9b5, 8, 5);
  // 目
  px(g, 6, 7, 0x2c3e50, 3, 3);
  px(g, 11, 7, 0x2c3e50, 3, 3);
  px(g, 7, 7, 0x27ae60, 2, 2); // 緑の瞳
  px(g, 12, 7, 0x27ae60, 2, 2);
  px(g, 7, 7, 0xffffff, 1, 1);
  px(g, 12, 7, 0xffffff, 1, 1);
  // 口（微笑み）
  px(g, 8, 10, 0xe88b7a, 4, 1);
  // 体（緑のローブ — 魔法使い風）
  px(g, 3, 12, 0x27ae60, 14, 10);
  px(g, 4, 13, 0x2ecc71, 12, 8);
  // ローブのディテール
  px(g, 9, 13, 0xf1c40f, 2, 1); // 金のクラスプ
  px(g, 9, 14, 0x1e8449, 2, 7); // 中央の影
  // マント
  px(g, 2, 13, 0x1e8449, 2, 9);
  px(g, 16, 13, 0x1e8449, 2, 9);
  // 手
  px(g, 2, 19, 0xfdd9b5, 2, 2);
  px(g, 16, 19, 0xfdd9b5, 2, 2);
  // ベルト
  px(g, 4, 21, 0x8b6914, 12, 1);
  px(g, 9, 21, 0xf1c40f, 2, 1);
  // 脚
  px(g, 5, 22, 0x2c3e50, 4, 6);
  px(g, 11, 22, 0x2c3e50, 4, 6);
  // ブーツ
  px(g, 5, 27, 0x6b4226, 4, 5);
  px(g, 11, 27, 0x6b4226, 4, 5);
  g.generateTexture('npc', 20, 32);
  g.destroy();
}

// ========== ！マーク (16x20) ==========

export function generateExclamationMark(scene) {
  const g = scene.make.graphics({ add: false });
  // 光のエフェクト（背景）
  px(g, 4, 0, 0xffd700, 8, 16);
  px(g, 3, 1, 0xffd700, 10, 14);
  // メインの！
  px(g, 5, 1, 0xffffff, 6, 10);
  px(g, 6, 2, 0xffffff, 4, 8);
  // 下の点
  px(g, 5, 13, 0xffffff, 6, 4);
  px(g, 6, 14, 0xffffff, 4, 2);
  g.generateTexture('exclamation', 16, 20);
  g.destroy();
}
