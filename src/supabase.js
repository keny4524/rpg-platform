import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uyedxihbnrodrybxnyvl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5ZWR4aWhibnJvZHJ5YnhueXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTA2MjEsImV4cCI6MjA5MTgyNjYyMX0.jy3w-jlJ6zffwMKRr9Wp78Wcgadnm4oe5cze8FoCg_k';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function ensureAuthenticatedSession() {
  const { data: current } = await supabase.auth.getSession();
  let session = current.session;

  if (!session) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.session) {
      return { error: '安全な接続を開始できませんでした' };
    }
    session = data.session;
  }

  await supabase.realtime.setAuth(session.access_token);
  return { session };
}

// ========== ユーザー登録 ==========
export async function registerPlayer(nickname, password) {
  const auth = await ensureAuthenticatedSession();
  if (auth.error) return auth;

  const { data, error } = await supabase.rpc('register_player_secure', {
    p_nickname: nickname,
    p_password: password,
  });

  if (error) {
    const message = error.message?.includes('nickname_taken')
      ? 'この名前はもう使われています'
      : '登録に失敗しました';
    return { error: message };
  }

  return { player: data?.[0] };
}

// ========== ログイン ==========
export async function loginPlayer(nickname, password) {
  const auth = await ensureAuthenticatedSession();
  if (auth.error) return auth;

  const { data, error } = await supabase.rpc('login_player_secure', {
    p_nickname: nickname,
    p_password: password,
  });

  if (error || !data?.[0]) {
    return { error: '名前かパスワードが違います' };
  }

  return { player: data[0] };
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
