export const DEFAULT_CHARACTER_ID = 'warrior';

export const CHARACTERS = [
  {
    id: 'warrior',
    name: '剣士',
    epithet: '蒼き剣士',
    portrait: 'assets/characters/hd/warrior-portrait-hd.webp',
    textureKey: 'hero-warrior',
    spriteSheet: 'assets/characters/hd/warrior-walk-hd-natural-4f.png',
    idleTextureKey: 'hero-warrior-idle',
    idleSpriteSheet: 'assets/characters/hd/warrior-idle-hd.png',
    frameWidth: 192,
    frameHeight: 192,
    framesPerDirection: 4,
    walkFrameRate: 8,
    moveDuration: 280,
    displayWidth: 64,
    displayHeight: 64,
  },
  {
    id: 'mage',
    name: '魔法使い',
    epithet: '星詠みの魔導師',
    portrait: 'assets/characters/mage-portrait.webp',
    textureKey: 'hero-mage',
    spriteSheet: 'assets/characters/mage-walk.png',
  },
  {
    id: 'healer',
    name: '僧侶',
    epithet: '灯火の癒し手',
    portrait: 'assets/characters/healer-portrait.webp',
    textureKey: 'hero-healer',
    spriteSheet: 'assets/characters/healer-walk.png',
  },
  {
    id: 'archer',
    name: '弓使い',
    epithet: '翠風の射手',
    portrait: 'assets/characters/archer-portrait.webp',
    textureKey: 'hero-archer',
    spriteSheet: 'assets/characters/archer-walk.png',
  },
];

export function getCharacter(characterId) {
  return CHARACTERS.find((character) => character.id === characterId)
    || CHARACTERS.find((character) => character.id === DEFAULT_CHARACTER_ID);
}
