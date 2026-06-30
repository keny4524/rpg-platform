import { AUTO, Scale, Scene, Game } from 'phaser';
import { preloadAssets, createAnimations, generateQuestBoard, generateExclamationMark } from './generate-assets.js';
import { TILE_SIZE, SCALE, COLLISION_TILES, TILE_TEXTURES, areas, DEFAULT_AREA } from './map-data.js';
import { quests } from './quest-data.js';
import { registerPlayer, loginPlayer, loadProgress, saveProgress } from './supabase.js';
import { CHARACTERS, DEFAULT_CHARACTER_ID, getCharacter } from './character-data.js';
import { MultiplayerSession } from './multiplayer.js';

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
const characterScreen = document.getElementById('character-screen');
const characterSelectTitle = document.getElementById('character-select-title');
const characterSelectName = document.getElementById('character-select-name');
const characterList = document.getElementById('character-list');
const characterConfirmBtn = document.getElementById('character-confirm-btn');
const characterCancelBtn = document.getElementById('character-cancel-btn');
const hud = document.getElementById('hud');
const uiOverlay = document.getElementById('ui-overlay');
const interactBtn = document.getElementById('interact-btn');
const socialBtn = document.getElementById('social-btn');
const socialMenu = document.getElementById('social-menu');
const socialOptions = document.querySelectorAll('.social-option');
const mobileMoveButtons = document.querySelectorAll('.mobile-move-btn');
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
const playerAvatar = document.getElementById('player-avatar');
const playerClass = document.getElementById('player-class');
const sessionReplacedPanel = document.getElementById('session-replaced-panel');
const sessionReloadBtn = document.getElementById('session-reload-btn');

// ========== ゲーム状態 ==========
let playerExp = 0;
let playerLevel = 1;
let clearedQuests = new Set();
let sceneRef = null;
let currentPlayerId = null;
let currentNickname = '';
let isRegisterMode = true;
let currentAreaId = DEFAULT_AREA;
let currentCharacterId = DEFAULT_CHARACTER_ID;
let pendingCharacterId = DEFAULT_CHARACTER_ID;
let canCancelCharacterSelection = false;
let gameInstance = null;

// ========== タイトル画面の星 ==========
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

function getCharacterStorageKey() {
  return `rpg-platform:character:${currentPlayerId}`;
}

function loadSavedCharacter() {
  if (!currentPlayerId) return null;
  const savedId = localStorage.getItem(getCharacterStorageKey());
  return CHARACTERS.some((character) => character.id === savedId) ? savedId : null;
}

function saveCurrentCharacter() {
  if (currentPlayerId) {
    localStorage.setItem(getCharacterStorageKey(), currentCharacterId);
  }
}

function updateCharacterHUD() {
  const character = getCharacter(currentCharacterId);
  playerAvatar.src = character.portrait;
  playerAvatar.alt = character.name;
  playerClass.textContent = character.name;
}

function renderCharacterCards() {
  characterList.innerHTML = '';
  CHARACTERS.forEach((character) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'character-card';
    card.classList.toggle('selected', character.id === pendingCharacterId);
    card.setAttribute('aria-pressed', String(character.id === pendingCharacterId));
    card.innerHTML = `
      <img src="${character.portrait}" alt="${character.epithet}">
      <span class="character-card-info">
        <span class="character-card-role">${character.name}</span>
        <span class="character-card-epithet">${character.epithet}</span>
      </span>
    `;
    card.addEventListener('click', () => {
      pendingCharacterId = character.id;
      renderCharacterCards();
    });
    characterList.appendChild(card);
  });
}

function openCharacterSelection({ canCancel = false } = {}) {
  pendingCharacterId = currentCharacterId;
  canCancelCharacterSelection = canCancel;
  characterSelectTitle.textContent = canCancel ? '冒険者の姿を変更' : '冒険者を選ぶ';
  characterSelectName.textContent = currentNickname;
  characterCancelBtn.style.display = canCancel ? 'block' : 'none';
  loginScreen.style.display = 'none';
  characterScreen.style.display = 'block';
  renderCharacterCards();

  if (sceneRef) {
    sceneRef.keysDown = {};
    sceneRef.isCharacterSelectOpen = true;
  }
}

function closeCharacterSelection() {
  characterScreen.style.display = 'none';
  if (sceneRef) {
    sceneRef.keysDown = {};
    sceneRef.isCharacterSelectOpen = false;
  }
}

function updateAreaName(name) {
  const el = document.getElementById('area-name');
  if (el) {
    el.textContent = name;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0.7'; }, 2000);
  }
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

  buttons.forEach((btn, i) => {
    btn.style.pointerEvents = 'none';
    if (i === quest.quiz.correctIndex) btn.classList.add('correct');
  });
  if (!isCorrect) btnEl.classList.add('wrong');

  setTimeout(() => {
    if (isCorrect) {
      questDetail.style.display = 'none';
      showQuestComplete(quest);
    } else {
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
  const expForLevel = playerLevel * 100;
  if (playerExp >= expForLevel) {
    playerExp -= expForLevel;
    playerLevel++;
  }
  completeExpText.textContent = `+${quest.exp} EXP`;
  questCompleteOverlay.style.display = 'block';
  questComplete.style.display = 'block';
  updateHUD();
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
  socialMenu.classList.remove('is-open');
  if (sceneRef) {
    sceneRef.isDialogOpen = false;
    sceneRef.isQuestUIOpen = false;
    sceneRef.isSocialMenuOpen = false;
  }
}

// ========== イベントリスナー ==========
dialogBox.addEventListener('click', closeAllUI);
completeCloseBtn.addEventListener('click', closeAllUI);
questCompleteOverlay.addEventListener('click', closeAllUI);
document.getElementById('quest-close-hint').addEventListener('click', closeAllUI);
socialBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  const willOpen = !socialMenu.classList.contains('is-open');
  socialMenu.classList.toggle('is-open', willOpen);
  socialBtn.setAttribute('aria-expanded', String(willOpen));
  if (sceneRef) {
    sceneRef.keysDown = {};
    sceneRef.isSocialMenuOpen = willOpen;
  }
});
socialOptions.forEach((option) => {
  option.addEventListener('click', () => {
    sceneRef?.sendSocialMessage(option.dataset.message);
    socialMenu.classList.remove('is-open');
    socialBtn.setAttribute('aria-expanded', 'false');
    if (sceneRef) sceneRef.isSocialMenuOpen = false;
  });
});
document.addEventListener('click', (event) => {
  if (!socialMenu.contains(event.target) && event.target !== socialBtn) {
    socialMenu.classList.remove('is-open');
    socialBtn.setAttribute('aria-expanded', 'false');
    if (sceneRef) sceneRef.isSocialMenuOpen = false;
  }
});
sessionReloadBtn.addEventListener('click', () => window.location.reload());

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
    this.moveDuration = getCharacter(currentCharacterId).moveDuration || 150;
    this.facing = 'down';
    this.isDialogOpen = false;
    this.isQuestUIOpen = false;
    this.npcs = [];
    this.keysDown = {};
    this.currentArea = null;
    this.mapSprites = [];
    this.npcSprites = [];
    this.portalTiles = [];
    this.questBoardSprite = null;
    this.questExclamation = null;
    this.isTransitioning = false;
    this.isCharacterSelectOpen = false;
    this.isSocialMenuOpen = false;
    this.sessionReplaced = false;
    this.multiplayer = null;
    this.remotePlayers = new Map();
    this.localNameLabel = null;
    this.localBubble = null;
  }

  preload() {
    preloadAssets(this);
  }

  create() {
    sceneRef = this;
    createAnimations(this);
    generateQuestBoard(this);
    generateExclamationMark(this);

    // エリアをロード
    this.loadArea(currentAreaId);
    this.localNameLabel = this.createNameLabel(currentNickname);
    this.localBubble = this.createSpeechBubble();

    this.multiplayer = new MultiplayerSession({
      playerId: currentPlayerId,
      nickname: currentNickname,
      getState: () => this.getNetworkState(),
      onPresenceSync: players => this.reconcileRemotePlayers(players),
      onPlayerState: player => this.upsertRemotePlayer(player),
      onPlayerMove: movement => this.moveRemotePlayer(movement),
      onSocialMessage: payload => this.showRemoteMessage(payload),
      onSessionReplaced: () => this.handleSessionReplaced(),
      onStatusChange: status => socialBtn?.classList.toggle('is-offline', status !== 'SUBSCRIBED'),
    });
    this.multiplayer.joinArea(currentAreaId);

    const clearMovementInput = () => {
      this.keysDown = {};
      mobileMoveButtons.forEach(button => button.classList.remove('is-pressed'));
    };

    // キーボード入力
    window.addEventListener('keydown', (e) => {
      this.keysDown[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'Space') this.onInteract();
    });
    window.addEventListener('keyup', (e) => {
      this.keysDown[e.code] = false;
    });
    window.addEventListener('blur', clearMovementInput);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearMovementInput();
    });

    mobileMoveButtons.forEach((button) => {
      const keyCode = button.dataset.key;
      const release = (event) => {
        event.preventDefault();
        this.keysDown[keyCode] = false;
        button.classList.remove('is-pressed');
      };

      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        this.keysDown[keyCode] = true;
        button.classList.add('is-pressed');
      });
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
      button.addEventListener('contextmenu', event => event.preventDefault());
    });

    interactBtn.addEventListener('click', () => this.onInteract());
    window.addEventListener('beforeunload', () => this.multiplayer?.destroy(), { once: true });

    setTimeout(() => {
      controlsHint.style.opacity = '0';
      setTimeout(() => { if (controlsHint.parentNode) controlsHint.remove(); }, 1000);
    }, 5000);

    updateHUD();
  }

  loadArea(areaId, spawnX, spawnY) {
    this.isTransitioning = true;
    const area = areas[areaId];
    if (!area) return;

    currentAreaId = areaId;
    this.currentArea = area;
    this.clearRemotePlayers();

    // 既存スプライトをクリア
    this.mapSprites.forEach(s => s.destroy());
    this.mapSprites = [];
    this.npcSprites.forEach(s => s.destroy());
    this.npcSprites = [];
    if (this.questBoardSprite) { this.questBoardSprite.destroy(); this.questBoardSprite = null; }
    if (this.questExclamation) { this.questExclamation.destroy(); this.questExclamation = null; }

    // マップ描画
    this.collisionMap = [];
    this.portalTiles = [];
    for (let y = 0; y < area.height; y++) {
      this.collisionMap[y] = [];
      for (let x = 0; x < area.width; x++) {
        const tileType = area.map[y][x];
        const textureName = area.tileTextures?.[tileType] || TILE_TEXTURES[tileType];
        const tile = this.add.image(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          textureName
        )
          .setDepth(0)
          .setDisplaySize(TILE_SIZE, TILE_SIZE);
        this.mapSprites.push(tile);
        this.collisionMap[y][x] = COLLISION_TILES.includes(tileType);
      }
    }

    // ポータルタイルは通行可能にする
    if (area.portals) {
      area.portals.forEach(p => {
        if (p.y >= 0 && p.y < area.height && p.x >= 0 && p.x < area.width) {
          this.collisionMap[p.y][p.x] = false;
        }
        this.portalTiles.push(p);
      });
    }

    // プレイヤー配置
    const startX = spawnX !== undefined ? spawnX : area.playerStart.x;
    const startY = spawnY !== undefined ? spawnY : area.playerStart.y;

    if (!this.player) {
      const selectedCharacter = getCharacter(currentCharacterId);
      this.player = this.add.sprite(
        startX * TILE_SIZE + TILE_SIZE / 2,
        startY * TILE_SIZE + TILE_SIZE / 2,
        selectedCharacter.textureKey, 0
      )
        .setDepth(10)
        .setDisplaySize(selectedCharacter.displayWidth || 64, selectedCharacter.displayHeight || 64);
    } else {
      this.player.x = startX * TILE_SIZE + TILE_SIZE / 2;
      this.player.y = startY * TILE_SIZE + TILE_SIZE / 2;
    }
    this.player.tileX = startX;
    this.player.tileY = startY;

    // カメラ
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(SCALE);
    this.cameras.main.setBounds(0, 0, area.width * TILE_SIZE, area.height * TILE_SIZE);

    // クエストボード
    if (area.questBoard) {
      const qx = area.questBoard.x * TILE_SIZE + TILE_SIZE / 2;
      const qy = area.questBoard.y * TILE_SIZE + TILE_SIZE / 2;
      this.questBoardSprite = this.add.image(qx, qy, 'quest_board').setDepth(5);
      this.questExclamation = this.add.image(qx, qy - 24, 'exclamation').setDepth(15);
      this.tweens.add({ targets: this.questExclamation, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
      this.collisionMap[area.questBoard.y][area.questBoard.x] = true;
    }

    // NPC配置
    this.npcs = [];
    if (area.npcs) {
      area.npcs.forEach((npcData) => {
        const nx = npcData.x * TILE_SIZE + TILE_SIZE / 2;
        const ny = npcData.y * TILE_SIZE + TILE_SIZE / 2;
        const npc = this.add.sprite(nx, ny, 'npc', 18).setDepth(5);
        npc.npcData = npcData;
        this.npcs.push(npc);
        this.npcSprites.push(npc);
        this.collisionMap[npcData.y][npcData.x] = true;
      });
    }

    // エリア名表示
    updateAreaName(area.name);

    // トランジション完了
    this.isTransitioning = false;
    this.isMoving = false;
    this.updatePlayerTexture();
    if (this.multiplayer) this.multiplayer.joinArea(areaId);
  }

  update(time, delta) {
    this.updateMultiplayerVisuals();
    if (this.sessionReplaced || this.isDialogOpen || this.isQuestUIOpen
      || this.isCharacterSelectOpen || this.isSocialMenuOpen || this.isTransitioning) return;

    if (this.isMoving) {
      this.moveProgress += delta / this.moveDuration;
      if (this.moveProgress >= 1) {
        this.isMoving = false;
        this.player.x = this.moveTo.x;
        this.player.y = this.moveTo.y;
        // ポータルチェック
        this.checkPortal();
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

    if (dx !== 0 || dy !== 0) {
      this.tryMove(dx, dy);
    } else {
      this.updatePlayerTexture();
    }
  }

  updatePlayerTexture() {
    if (this.isMoving) {
      const walkAnim = `${currentCharacterId}-walk-${this.facing}`;
      if (this.player.anims.currentAnim?.key !== walkAnim) {
        this.player.play(walkAnim);
      }
    } else {
      const idleAnim = `${currentCharacterId}-idle-${this.facing}`;
      if (this.player.anims.currentAnim?.key !== idleAnim) {
        this.player.play(idleAnim);
      }
    }
  }

  applyCharacter() {
    if (!this.player) return;
    const selectedCharacter = getCharacter(currentCharacterId);
    this.player.stop();
    this.player.setTexture(selectedCharacter.textureKey, 0);
    this.player.setDisplaySize(selectedCharacter.displayWidth || 64, selectedCharacter.displayHeight || 64);
    this.moveDuration = selectedCharacter.moveDuration || 150;
    this.updatePlayerTexture();
    this.multiplayer?.announceState();
  }

  tryMove(dx, dy) {
    const area = this.currentArea;
    const nx = this.player.tileX + dx;
    const ny = this.player.tileY + dy;

    // ポータルの場合は範囲外でもOK（マップ端のポータル）
    const portal = this.portalTiles.find(p => p.x === nx && p.y === ny);
    if (portal) {
      // ポータルに向かって移動 → 到達後にエリア切り替え
      this.isMoving = true;
      this.moveProgress = 0;
      this.moveFrom.x = this.player.x;
      this.moveFrom.y = this.player.y;
      this.player.tileX = nx;
      this.player.tileY = ny;
      this.moveTo.x = nx * TILE_SIZE + TILE_SIZE / 2;
      this.moveTo.y = ny * TILE_SIZE + TILE_SIZE / 2;
      this.updatePlayerTexture();
      this.broadcastMovement();
      return;
    }

    if (nx < 0 || nx >= area.width || ny < 0 || ny >= area.height) return;
    if (this.collisionMap[ny][nx]) return;

    this.isMoving = true;
    this.moveProgress = 0;
    this.moveFrom.x = this.player.x;
    this.moveFrom.y = this.player.y;
    this.player.tileX = nx;
    this.player.tileY = ny;
    this.moveTo.x = nx * TILE_SIZE + TILE_SIZE / 2;
    this.moveTo.y = ny * TILE_SIZE + TILE_SIZE / 2;
    this.updatePlayerTexture();
    this.broadcastMovement();
  }

  getNetworkState() {
    return {
      characterId: currentCharacterId,
      x: this.player?.x ?? 0,
      y: this.player?.y ?? 0,
      tileX: this.player?.tileX ?? 0,
      tileY: this.player?.tileY ?? 0,
      facing: this.facing,
    };
  }

  broadcastMovement() {
    this.multiplayer?.sendMove({
      characterId: currentCharacterId,
      fromX: this.moveFrom.x,
      fromY: this.moveFrom.y,
      toX: this.moveTo.x,
      toY: this.moveTo.y,
      tileX: this.player.tileX,
      tileY: this.player.tileY,
      facing: this.facing,
      duration: this.moveDuration,
    });
  }

  createNameLabel(nickname) {
    return this.add.text(0, 0, nickname, {
      fontFamily: 'Noto Sans JP, sans-serif',
      fontSize: '10px',
      color: '#ffffff',
      stroke: '#111827',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5, 1).setDepth(31);
  }

  createSpeechBubble() {
    const background = this.add.graphics();
    const text = this.add.text(0, 0, '', {
      fontFamily: 'Noto Sans JP, sans-serif',
      fontSize: '11px',
      color: '#17202a',
      align: 'center',
      wordWrap: { width: 132, useAdvancedWrap: true },
    }).setOrigin(0.5, 1);
    const container = this.add.container(0, 0, [background, text])
      .setDepth(40)
      .setVisible(false);

    return { background, text, container, timer: null };
  }

  setSpeechBubble(bubble, message) {
    if (!bubble) return;
    bubble.timer?.remove(false);
    bubble.text.setText(message);

    const width = bubble.text.width + 18;
    const height = bubble.text.height + 12;
    bubble.background.clear();
    bubble.background.fillStyle(0xffffff, 0.96);
    bubble.background.lineStyle(1.5, 0x243449, 0.8);
    bubble.background.fillRoundedRect(-width / 2, -height, width, height, 6);
    bubble.background.strokeRoundedRect(-width / 2, -height, width, height, 6);
    bubble.background.fillTriangle(-5, 0, 5, 0, 0, 7);
    bubble.container.setVisible(true);
    bubble.timer = this.time.delayedCall(10000, () => {
      bubble.container.setVisible(false);
      bubble.timer = null;
    });
  }

  upsertRemotePlayer(state, { preservePosition = false } = {}) {
    const playerId = String(state.playerId);
    if (!playerId || playerId === String(currentPlayerId)) return null;

    const character = getCharacter(state.characterId);
    let entry = this.remotePlayers.get(playerId);
    if (entry && entry.characterId !== character.id) {
      this.removeRemotePlayer(playerId);
      entry = null;
    }

    if (!entry) {
      const sprite = this.add.sprite(
        Number(state.x) || 0,
        Number(state.y) || 0,
        character.textureKey,
        0
      )
        .setDepth(9)
        .setDisplaySize(character.displayWidth || 64, character.displayHeight || 64);
      entry = {
        playerId,
        characterId: character.id,
        sprite,
        nameLabel: this.createNameLabel(state.nickname || '冒険者'),
        bubble: this.createSpeechBubble(),
        moveTween: null,
        facing: state.facing || 'down',
      };
      this.remotePlayers.set(playerId, entry);
    } else {
      entry.nameLabel.setText(state.nickname || '冒険者');
      if (!preservePosition && Number.isFinite(Number(state.x)) && Number.isFinite(Number(state.y))) {
        entry.moveTween?.stop();
        entry.sprite.setPosition(Number(state.x), Number(state.y));
      }
    }

    entry.sprite.tileX = Number(state.tileX) || 0;
    entry.sprite.tileY = Number(state.tileY) || 0;
    entry.facing = state.facing || entry.facing;
    if (!entry.moveTween?.isPlaying()) this.playRemoteIdle(entry);
    return entry;
  }

  reconcileRemotePlayers(players) {
    const activeIds = new Set(players.map(player => String(player.playerId)));
    players.forEach(player => this.upsertRemotePlayer(player, { preservePosition: true }));
    [...this.remotePlayers.keys()].forEach((playerId) => {
      if (!activeIds.has(playerId)) this.removeRemotePlayer(playerId);
    });
  }

  moveRemotePlayer(movement) {
    const entry = this.upsertRemotePlayer({
      ...movement,
      x: movement.fromX,
      y: movement.fromY,
    }, { preservePosition: true });
    if (!entry) return;

    entry.moveTween?.stop();
    entry.facing = movement.facing || entry.facing;
    entry.sprite.tileX = Number(movement.tileX) || 0;
    entry.sprite.tileY = Number(movement.tileY) || 0;
    const walkAnimation = `${entry.characterId}-walk-${entry.facing}`;
    if (this.anims.exists(walkAnimation)) entry.sprite.play(walkAnimation, true);

    const tween = this.tweens.add({
      targets: entry.sprite,
      x: Number(movement.toX),
      y: Number(movement.toY),
      duration: Math.max(80, Number(movement.duration) || 280),
      ease: 'Linear',
      onComplete: () => {
        if (entry.moveTween !== tween) return;
        entry.moveTween = null;
        this.playRemoteIdle(entry);
      },
    });
    entry.moveTween = tween;
  }

  playRemoteIdle(entry) {
    const idleAnimation = `${entry.characterId}-idle-${entry.facing}`;
    if (this.anims.exists(idleAnimation)) entry.sprite.play(idleAnimation, true);
  }

  showRemoteMessage(payload) {
    const entry = this.upsertRemotePlayer(payload, { preservePosition: true });
    if (entry) this.setSpeechBubble(entry.bubble, payload.message);
  }

  sendSocialMessage(message) {
    if (!message || this.sessionReplaced) return;
    this.setSpeechBubble(this.localBubble, message);
    this.multiplayer?.sendSocialMessage(message);
  }

  updateMultiplayerVisuals() {
    if (this.player && this.localNameLabel) {
      const character = getCharacter(currentCharacterId);
      const offset = (character.displayHeight || 64) / 2;
      this.localNameLabel.setPosition(this.player.x, this.player.y - offset - 2);
      this.localBubble?.container.setPosition(this.player.x, this.player.y - offset - 22);
    }

    this.remotePlayers.forEach((entry) => {
      const character = getCharacter(entry.characterId);
      const offset = (character.displayHeight || 64) / 2;
      entry.nameLabel.setPosition(entry.sprite.x, entry.sprite.y - offset - 2);
      entry.bubble.container.setPosition(entry.sprite.x, entry.sprite.y - offset - 22);
    });
  }

  removeRemotePlayer(playerId) {
    const entry = this.remotePlayers.get(String(playerId));
    if (!entry) return;
    entry.moveTween?.stop();
    entry.bubble.timer?.remove(false);
    entry.sprite.destroy();
    entry.nameLabel.destroy();
    entry.bubble.container.destroy(true);
    this.remotePlayers.delete(String(playerId));
  }

  clearRemotePlayers() {
    [...this.remotePlayers.keys()].forEach(playerId => this.removeRemotePlayer(playerId));
  }

  handleSessionReplaced() {
    this.sessionReplaced = true;
    this.keysDown = {};
    this.isSocialMenuOpen = false;
    socialMenu.classList.remove('is-open');
    socialBtn.setAttribute('aria-expanded', 'false');
    this.clearRemotePlayers();
    sessionReplacedPanel.style.display = 'flex';
  }

  checkPortal() {
    const px = this.player.tileX;
    const py = this.player.tileY;
    const portal = this.portalTiles.find(p => p.x === px && p.y === py);
    if (portal) {
      this.loadArea(portal.target, portal.spawnX, portal.spawnY);
    }
  }

  onInteract() {
    if (this.isMoving || this.isTransitioning) return;

    if (this.isDialogOpen || this.isQuestUIOpen) {
      closeAllUI();
      return;
    }

    const px = this.player.tileX;
    const py = this.player.tileY;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cx = px + dx;
        const cy = py + dy;

        // クエストボード
        if (this.currentArea.questBoard &&
            cx === this.currentArea.questBoard.x &&
            cy === this.currentArea.questBoard.y) {
          this.isQuestUIOpen = true;
          buildQuestList();
          questPanel.style.display = 'block';
          return;
        }

        // NPC
        for (const npc of this.npcs) {
          if (cx === npc.npcData.x && cy === npc.npcData.y) {
            if (npc.npcData.action === 'change-character') {
              openCharacterSelection({ canCancel: true });
              return;
            }
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

// ========== ゲーム起動 ==========
function startGame() {
  loginScreen.style.display = 'none';
  characterScreen.style.display = 'none';
  hud.style.display = 'flex';
  uiOverlay.style.display = 'block';
  document.querySelector('#hud .player-name').textContent = currentNickname;
  updateCharacterHUD();
  updateHUD();

  if (gameInstance) return;

  const config = {
    type: AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    pixelArt: false,
    backgroundColor: '#1a1a2e',
    scene: [RPGScene],
    scale: { mode: Scale.RESIZE, autoCenter: Scale.CENTER_BOTH },
  };

  gameInstance = new Game(config);
  window.addEventListener('resize', () => {
    gameInstance.scale.resize(window.innerWidth, window.innerHeight);
  });
}

characterConfirmBtn.addEventListener('click', () => {
  currentCharacterId = pendingCharacterId;
  saveCurrentCharacter();
  updateCharacterHUD();

  if (gameInstance) {
    sceneRef?.applyCharacter();
    closeCharacterSelection();
  } else {
    closeCharacterSelection();
    startGame();
  }
});

characterCancelBtn.addEventListener('click', () => {
  if (canCancelCharacterSelection) closeCharacterSelection();
});

// ========== タイトル → ログイン ==========
startBtn.addEventListener('click', () => {
  titleScreen.style.opacity = '0';
  titleScreen.style.transition = 'opacity 0.5s';
  setTimeout(() => {
    titleScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
    nicknameInput.focus();
  }, 500);
});

// ========== 登録/ログイン ==========
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

authSubmitBtn.addEventListener('click', async () => {
  const nickname = nicknameInput.value.trim();
  const password = passwordInput.value;

  if (!nickname) { authError.textContent = 'ニックネームを入力してください'; return; }
  const minimumPasswordLength = isRegisterMode ? 8 : 4;
  if (password.length < minimumPasswordLength) {
    authError.textContent = `パスワードは${minimumPasswordLength}文字以上にしてください`;
    return;
  }

  authSubmitBtn.disabled = true;
  authSubmitBtn.textContent = '接続中...';
  authError.textContent = '';

  if (isRegisterMode) {
    const result = await registerPlayer(nickname, password);
    if (result.error) {
      authError.textContent = result.error;
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = '登録してはじめる';
      return;
    }
    currentPlayerId = result.player.id;
    currentNickname = nickname;
    currentCharacterId = DEFAULT_CHARACTER_ID;
    openCharacterSelection();
    return;
  } else {
    const result = await loginPlayer(nickname, password);
    if (result.error) {
      authError.textContent = result.error;
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = 'ログイン';
      return;
    }
    currentPlayerId = result.player.id;
    currentNickname = nickname;
    const progress = await loadProgress(currentPlayerId);
    playerLevel = progress.level;
    playerExp = progress.exp;
    clearedQuests = new Set(progress.clearedQuests);

    const savedCharacter = loadSavedCharacter();
    if (!savedCharacter) {
      currentCharacterId = DEFAULT_CHARACTER_ID;
      openCharacterSelection();
      return;
    }
    currentCharacterId = savedCharacter;
  }

  startGame();
});

passwordInput.addEventListener('keydown', (e) => { if (e.code === 'Enter') authSubmitBtn.click(); });
nicknameInput.addEventListener('keydown', (e) => { if (e.code === 'Enter') passwordInput.focus(); });
