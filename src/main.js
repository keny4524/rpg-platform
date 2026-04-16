import { AUTO, Scale, Scene, Game } from 'phaser';
import { preloadAssets, createAnimations, generateQuestBoard, generateExclamationMark } from './generate-assets.js';
import { mapData, MAP_WIDTH, MAP_HEIGHT, TILE_SIZE, SCALE, COLLISION_TILES, PLAYER_START, QUEST_BOARD_POS, NPC_POSITIONS, TILE_TEXTURES } from './map-data.js';
import { quests } from './quest-data.js';
import { registerPlayer, loginPlayer, loadProgress, saveProgress } from './supabase.js';

// ========== HTML要素の参照 ==========
const titleScreen = document.getElementById('title-screen');
const startBtn = document.getElementById('start-btn');
const loginScreen = document.getElementById('login-screen');
const authTitle = document.getElementById('auth-title');
const nicknameInput = document.getElementById('nickname-input');
const passwordInput = document.getElementById('password-input');
const authError = document.getElementById('auth-error');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authToggleBtn = document.getElementById('auth-toggle-btn');
const hud = document.getElementById('hud');
const uiOverlay = document.getElementById('ui-overlay');
const interactBtn = document.getElementById('interact-btn');
const controlsHint = document.getElementById('controls-hint');
const debugInfo = document.getElementById('debug-info');
const dialogBox = document.getElementById('dialog-box');
const dialogName = document.getElementById('dialog-name');
const dialogMessage = document.getElementById('dialog-message');
const questPanel = document.getElementById('quest-panel');
const questList = document.getElementById('quest-list');
const questDetail = document.getElementById('quest-detail');
const questDetailTitle = document.getElementById('quest-detail-title');
const questDetailContent = document.getElementById('quest-detail-content');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const questComplete = document.getElementById('quest-complete');
const questCompleteOverlay = document.getElementById('quest-complete-overlay');
const completeExpText = document.getElementById('complete-exp-text');
const completeCloseBtn = document.getElementById('complete-close-btn');
const expBar = document.getElementById('exp-bar');
const expLabel = document.getElementById('exp-label');
const questCleared = document.getElementById('quest-cleared');

// ========== ゲーム状態 ==========
let playerExp = 0;
let playerLevel = 1;
let clearedQuests = new Set();
let sceneRef = null;
let currentPlayerId = null;
let currentNickname = '';
let isRegisterMode = true;

// ========== タイトル画面の星を生成 ==========
const starsContainer = document.getElementById('stars-container');
for (let i = 0; i < 80; i++) {
  const star = document.createElement('div');
  star.className = 'star';
  star.style.left = Math.random() * 100 + '%';
  star.style.top = Math.random() * 100 + '%';
  star.style.animationDelay = Math.random() * 3 + 's';
  star.style.animationDuration = (2 + Math.random() * 3) + 's';
  starsContainer.appendChild(star);
}

// ========== UI関数 ==========
function updateHUD() {
  const expForLevel = playerLevel * 100;
  expBar.style.width = (playerExp / expForLevel * 100) + '%';
  expLabel.textContent = `EXP ${playerExp}/${expForLevel}`;
  questCleared.textContent = clearedQuests.size;
  document.querySelector('#hud .player-level').textContent = `Lv.${playerLevel}`;
}

function buildQuestList() {
  questList.innerHTML = '';
  quests.forEach((quest) => {
    const cleared = clearedQuests.has(quest.id);
    const item = document.createElement('div');
    item.className = 'quest-item';
    if (cleared) item.style.opacity = '0.5';
    item.innerHTML = `
      <div>
        <div class="quest-name">${cleared ? '✅ ' : ''}${quest.name}</div>
        <div class="quest-desc">${cleared ? 'クリア済み' : quest.desc}</div>
      </div>
      <div class="quest-level">${quest.level}</div>
    `;
    if (!cleared) {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        openQuestDetail(quest);
      });
    }
    questList.appendChild(item);
  });
}

function openQuestDetail(quest) {
  questPanel.style.display = 'none';
  questDetailTitle.textContent = quest.name;
  questDetailContent.textContent = quest.content;
  quizQuestion.textContent = '❓ ' + quest.quiz.question;
  quizOptions.innerHTML = '';
  quest.quiz.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleQuizAnswer(quest, i, btn));
    quizOptions.appendChild(btn);
  });
  questDetail.style.display = 'block';
}

function handleQuizAnswer(quest, selectedIndex, btnEl) {
  const buttons = quizOptions.querySelectorAll('.quiz-option');
  const isCorrect = selectedIndex === quest.quiz.correctIndex;

  // 全ボタンを無効化
  buttons.forEach((btn, i) => {
    btn.style.pointerEvents = 'none';
    if (i === quest.quiz.correctIndex) {
      btn.classList.add('correct');
    }
  });

  if (!isCorrect) {
    btnEl.classList.add('wrong');
  }

  // 1秒後にクリア演出 or リトライ
  setTimeout(() => {
    if (isCorrect) {
      questDetail.style.display = 'none';
      showQuestComplete(quest);
    } else {
      // リセットして再挑戦
      buttons.forEach(btn => {
        btn.classList.remove('correct', 'wrong');
        btn.style.pointerEvents = 'auto';
      });
    }
  }, 1000);
}

function showQuestComplete(quest) {
  clearedQuests.add(quest.id);
  playerExp += quest.exp;

  // レベルアップ判定
  const expForLevel = playerLevel * 100;
  if (playerExp >= expForLevel) {
    playerExp -= expForLevel;
    playerLevel++;
  }

  completeExpText.textContent = `+${quest.exp} EXP`;
  questCompleteOverlay.style.display = 'block';
  questComplete.style.display = 'block';
  updateHUD();

  // 進捗をサーバーに保存
  if (currentPlayerId) {
    saveProgress(currentPlayerId, playerLevel, playerExp, Array.from(clearedQuests));
  }
}

function closeAllUI() {
  dialogBox.style.display = 'none';
  questPanel.style.display = 'none';
  questDetail.style.display = 'none';
  questComplete.style.display = 'none';
  questCompleteOverlay.style.display = 'none';
  if (sceneRef) {
    sceneRef.isDialogOpen = false;
    sceneRef.isQuestUIOpen = false;
  }
}

// ========== イベントリスナー ==========
dialogBox.addEventListener('click', closeAllUI);
completeCloseBtn.addEventListener('click', closeAllUI);
questCompleteOverlay.addEventListener('click', closeAllUI);

document.getElementById('quest-close-hint').addEventListener('click', closeAllUI);

// ========== Phaser シーン ==========
class RPGScene extends Scene {
  constructor() {
    super({ key: 'RPGScene' });
    this.player = null;
    this.collisionMap = [];
    this.isMoving = false;
    this.moveProgress = 0;
    this.moveFrom = { x: 0, y: 0 };
    this.moveTo = { x: 0, y: 0 };
    this.moveDuration = 150;
    this.facing = 'down';
    this.isDialogOpen = false;
    this.isQuestUIOpen = false;
    this.npcs = [];
    this.keysDown = {};
  }

  preload() {
    preloadAssets(this);
  }

  create() {
    sceneRef = this;

    // アニメーション作成
    createAnimations(this);
    // プログラム生成素材
    generateQuestBoard(this);
    generateExclamationMark(this);

    this.drawMap();
    this.createPlayer();
    this.createQuestBoard();
    this.createNPCs();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(SCALE);
    this.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);

    // キーボード入力
    window.addEventListener('keydown', (e) => {
      this.keysDown[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'Space') {
        this.onInteract();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keysDown[e.code] = false;
    });
    window.addEventListener('blur', () => {
      this.keysDown = {};
    });

    // HTMLボタン
    interactBtn.addEventListener('click', () => this.onInteract());

    // 操作ヒントを5秒後にフェードアウト
    setTimeout(() => {
      controlsHint.style.opacity = '0';
      setTimeout(() => controlsHint.remove(), 1000);
    }, 5000);

    updateHUD();
  }

  drawMap() {
    this.collisionMap = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
      this.collisionMap[y] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tileType = mapData[y][x];
        const textureName = TILE_TEXTURES[tileType];
        this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, textureName).setDepth(0);
        this.collisionMap[y][x] = COLLISION_TILES.includes(tileType);
      }
    }
  }

  createPlayer() {
    const px = PLAYER_START.x * TILE_SIZE + TILE_SIZE / 2;
    const py = PLAYER_START.y * TILE_SIZE + TILE_SIZE / 2;
    this.player = this.add.sprite(px, py, 'hero', 18).setDepth(10); // frame 18 = standing down from walk sheet
    this.player.tileX = PLAYER_START.x;
    this.player.tileY = PLAYER_START.y;
  }

  createQuestBoard() {
    const qx = QUEST_BOARD_POS.x * TILE_SIZE + TILE_SIZE / 2;
    const qy = QUEST_BOARD_POS.y * TILE_SIZE + TILE_SIZE / 2;
    this.add.image(qx, qy, 'quest_board').setDepth(5);
    const excl = this.add.image(qx, qy - 20, 'exclamation').setDepth(15);
    this.tweens.add({ targets: excl, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
  }

  createNPCs() {
    NPC_POSITIONS.forEach((npcData) => {
      const nx = npcData.x * TILE_SIZE + TILE_SIZE / 2;
      const ny = npcData.y * TILE_SIZE + TILE_SIZE / 2;
      const npc = this.add.sprite(nx, ny, 'npc', 18).setDepth(5); // frame 18 = standing down
      npc.npcData = npcData;
      this.npcs.push(npc);
      this.collisionMap[npcData.y][npcData.x] = true;
    });
    this.collisionMap[QUEST_BOARD_POS.y][QUEST_BOARD_POS.x] = true;
  }

  update(time, delta) {
    if (this.isDialogOpen || this.isQuestUIOpen) return;

    if (this.isMoving) {
      this.moveProgress += delta / this.moveDuration;
      if (this.moveProgress >= 1) {
        this.isMoving = false;
        this.player.x = this.moveTo.x;
        this.player.y = this.moveTo.y;
        this.updatePlayerTexture();
      } else {
        this.player.x = this.moveFrom.x + (this.moveTo.x - this.moveFrom.x) * this.moveProgress;
        this.player.y = this.moveFrom.y + (this.moveTo.y - this.moveFrom.y) * this.moveProgress;
      }
      return;
    }

    const keys = this.keysDown;
    let dx = 0, dy = 0;

    if (keys['ArrowLeft'] || keys['KeyA']) { dx = -1; this.facing = 'left'; }
    else if (keys['ArrowRight'] || keys['KeyD']) { dx = 1; this.facing = 'right'; }
    else if (keys['ArrowUp'] || keys['KeyW']) { dy = -1; this.facing = 'up'; }
    else if (keys['ArrowDown'] || keys['KeyS']) { dy = 1; this.facing = 'down'; }

    this.updatePlayerTexture();
    if (dx !== 0 || dy !== 0) this.tryMove(dx, dy);
  }

  updatePlayerTexture() {
    // 移動中はアニメーション再生、停止中はアイドル
    if (this.isMoving) {
      const walkAnim = `hero-walk-${this.facing}`;
      if (this.player.anims.currentAnim?.key !== walkAnim) {
        this.player.play(walkAnim);
      }
    } else {
      const idleAnim = `hero-idle-${this.facing}`;
      if (this.player.anims.currentAnim?.key !== idleAnim) {
        this.player.play(idleAnim);
      }
    }
  }

  tryMove(dx, dy) {
    const nx = this.player.tileX + dx;
    const ny = this.player.tileY + dy;
    if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) return;
    if (this.collisionMap[ny][nx]) return;

    this.isMoving = true;
    this.moveProgress = 0;
    this.moveFrom.x = this.player.x;
    this.moveFrom.y = this.player.y;
    this.player.tileX = nx;
    this.player.tileY = ny;
    this.moveTo.x = nx * TILE_SIZE + TILE_SIZE / 2;
    this.moveTo.y = ny * TILE_SIZE + TILE_SIZE / 2;
  }

  onInteract() {
    if (this.isMoving) return;

    if (this.isDialogOpen || this.isQuestUIOpen) {
      closeAllUI();
      return;
    }

    const px = this.player.tileX;
    const py = this.player.tileY;

    // デバッグ
    debugInfo.textContent = `位置: (${px}, ${py})`;
    debugInfo.style.display = 'block';
    setTimeout(() => { debugInfo.style.display = 'none'; }, 2000);

    // 周囲チェック
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cx = px + dx;
        const cy = py + dy;

        if (cx === QUEST_BOARD_POS.x && cy === QUEST_BOARD_POS.y) {
          this.isQuestUIOpen = true;
          buildQuestList();
          questPanel.style.display = 'block';
          return;
        }

        for (const npc of this.npcs) {
          if (cx === npc.npcData.x && cy === npc.npcData.y) {
            this.isDialogOpen = true;
            dialogName.textContent = npc.npcData.name;
            dialogMessage.textContent = npc.npcData.message;
            dialogBox.style.display = 'block';
            return;
          }
        }
      }
    }
  }
}

// ========== ゲーム起動関数 ==========
function startGame() {
  loginScreen.style.display = 'none';
  hud.style.display = 'flex';
  uiOverlay.style.display = 'block';

  // HUDにプレイヤー名を表示
  document.querySelector('#hud .player-name').textContent = currentNickname;
  updateHUD();

  const config = {
    type: AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    pixelArt: true,
    backgroundColor: '#1a1a2e',
    scene: [RPGScene],
    scale: {
      mode: Scale.RESIZE,
      autoCenter: Scale.CENTER_BOTH,
    },
  };

  const game = new Game(config);
  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });
}

// ========== タイトル画面 → ログイン画面 ==========
startBtn.addEventListener('click', () => {
  titleScreen.style.opacity = '0';
  titleScreen.style.transition = 'opacity 0.5s';
  setTimeout(() => {
    titleScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
    nicknameInput.focus();
  }, 500);
});

// ========== 登録/ログイン切り替え ==========
authToggleBtn.addEventListener('click', () => {
  isRegisterMode = !isRegisterMode;
  authError.textContent = '';
  if (isRegisterMode) {
    authTitle.textContent = '冒険者登録';
    authSubmitBtn.textContent = '登録してはじめる';
    authToggleBtn.textContent = 'ログインする';
  } else {
    authTitle.textContent = 'おかえりなさい！';
    authSubmitBtn.textContent = 'ログイン';
    authToggleBtn.textContent = '新規登録する';
  }
});

// ========== 登録/ログイン実行 ==========
authSubmitBtn.addEventListener('click', async () => {
  const nickname = nicknameInput.value.trim();
  const password = passwordInput.value;

  // バリデーション
  if (!nickname) {
    authError.textContent = 'ニックネームを入力してください';
    return;
  }
  if (password.length < 4) {
    authError.textContent = 'パスワードは4文字以上にしてください';
    return;
  }

  authSubmitBtn.disabled = true;
  authSubmitBtn.textContent = '接続中...';
  authError.textContent = '';

  if (isRegisterMode) {
    // 新規登録
    const result = await registerPlayer(nickname, password);
    if (result.error) {
      authError.textContent = result.error;
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = '登録してはじめる';
      return;
    }
    currentPlayerId = result.player.id;
    currentNickname = nickname;
  } else {
    // ログイン
    const result = await loginPlayer(nickname, password);
    if (result.error) {
      authError.textContent = result.error;
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = 'ログイン';
      return;
    }
    currentPlayerId = result.player.id;
    currentNickname = nickname;

    // 進捗を読み込む
    const progress = await loadProgress(currentPlayerId);
    playerLevel = progress.level;
    playerExp = progress.exp;
    clearedQuests = new Set(progress.clearedQuests);
  }

  // ゲーム開始
  startGame();
});

// Enterキーでも送信
passwordInput.addEventListener('keydown', (e) => {
  if (e.code === 'Enter') authSubmitBtn.click();
});
nicknameInput.addEventListener('keydown', (e) => {
  if (e.code === 'Enter') passwordInput.focus();
});
