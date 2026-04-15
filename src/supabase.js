import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uyedxihbnrodrybxnyvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5ZWR4aWhibnJvZHJ5YnhueXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTA2MjEsImV4cCI6MjA5MTgyNjYyMX0.jy3w-jlJ6zffwMKRr9Wp78Wcgadnm4oe5cze8FoCg_k';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// パスワードをハッシュ化（簡易版 — デモ用）
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'rpg-platform-salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ========== ユーザー登録 ==========
export async function registerPlayer(nickname, password) {
  const passwordHash = await hashPassword(password);

  // ニックネームの重複チェック
  const { data: existing } = await supabase
    .from('players')
    .select('id')
    .eq('nickname', nickname)
    .maybeSingle();

  if (existing) {
    return { error: 'この名前はもう使われています' };
  }

  // プレイヤー作成
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({ nickname, password_hash: passwordHash })
    .select()
    .single();

  if (playerError) {
    return { error: '登録に失敗しました' };
  }

  // 進捗データ作成
  const { error: progressError } = await supabase
    .from('progress')
    .insert({ player_id: player.id });

  if (progressError) {
    return { error: '進捗データの作成に失敗しました' };
  }

  return { player };
}

// ========== ログイン ==========
export async function loginPlayer(nickname, password) {
  const passwordHash = await hashPassword(password);

  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .eq('nickname', nickname)
    .eq('password_hash', passwordHash)
    .maybeSingle();

  if (!player) {
    return { error: '名前かパスワードが違います' };
  }

  return { player };
}

// ========== 進捗読み込み ==========
export async function loadProgress(playerId) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('player_id', playerId)
    .single();

  if (error || !data) {
    return { level: 1, exp: 0, clearedQuests: [] };
  }

  return {
    level: data.level,
    exp: data.exp,
    clearedQuests: data.cleared_quests || [],
  };
}

// ========== 進捗保存 ==========
export async function saveProgress(playerId, level, exp, clearedQuests) {
  const { error } = await supabase
    .from('progress')
    .update({
      level,
      exp,
      cleared_quests: clearedQuests,
      updated_at: new Date().toISOString(),
    })
    .eq('player_id', playerId);

  return { error };
}
