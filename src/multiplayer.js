import { supabase } from './supabase.js';

const CHANNEL_PREFIX = 'area';

function createSessionId() {
  return globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export class MultiplayerSession {
  constructor({
    playerId,
    nickname,
    getState,
    onPresenceSync,
    onPlayerState,
    onPlayerMove,
    onSocialMessage,
    onSessionReplaced,
    onStatusChange,
  }) {
    this.playerId = String(playerId);
    this.nickname = nickname;
    this.getState = getState;
    this.onPresenceSync = onPresenceSync;
    this.onPlayerState = onPlayerState;
    this.onPlayerMove = onPlayerMove;
    this.onSocialMessage = onSocialMessage;
    this.onSessionReplaced = onSessionReplaced;
    this.onStatusChange = onStatusChange;
    this.sessionId = createSessionId();
    this.startedAt = Date.now();
    this.areaId = null;
    this.channel = null;
    this.joinVersion = 0;
    this.replaced = false;
  }

  buildState() {
    return {
      ...this.getState(),
      playerId: this.playerId,
      nickname: this.nickname,
      sessionId: this.sessionId,
      areaId: this.areaId,
      onlineAt: this.startedAt,
    };
  }

  async joinArea(areaId) {
    if (this.replaced) return;

    const version = ++this.joinVersion;
    await this.leaveArea(false);
    if (version !== this.joinVersion || this.replaced) return;

    this.areaId = areaId;
    const channel = supabase.channel(`${CHANNEL_PREFIX}:${areaId}`, {
      config: {
        private: true,
        presence: { key: this.sessionId },
        broadcast: { self: false },
      },
    });
    this.channel = channel;

    channel
      .on('presence', { event: 'sync' }, () => this.handlePresenceSync(channel))
      .on('broadcast', { event: 'state-request' }, ({ payload }) => {
        if (payload?.requesterSessionId !== this.sessionId) this.announceState();
      })
      .on('broadcast', { event: 'player-state' }, ({ payload }) => {
        if (this.isOtherPlayer(payload)) this.onPlayerState?.(payload);
      })
      .on('broadcast', { event: 'player-move' }, ({ payload }) => {
        if (this.isOtherPlayer(payload)) this.onPlayerMove?.(payload);
      })
      .on('broadcast', { event: 'social-message' }, ({ payload }) => {
        if (this.isOtherPlayer(payload)) this.onSocialMessage?.(payload);
      })
      .on('broadcast', { event: 'session-claim' }, ({ payload }) => {
        this.handleSessionClaim(payload);
      })
      .subscribe(async (status) => {
        if (channel !== this.channel || version !== this.joinVersion) return;

        this.onStatusChange?.(status);
        if (status !== 'SUBSCRIBED') return;

        await channel.track(this.buildState());
        await this.send('session-claim', {
          playerId: this.playerId,
          sessionId: this.sessionId,
          claimedAt: Date.now(),
        });
        await this.send('state-request', { requesterSessionId: this.sessionId });
      });
  }

  handlePresenceSync(channel) {
    if (channel !== this.channel) return;

    const latestByPlayer = new Map();
    Object.values(channel.presenceState()).flat().forEach((presence) => {
      if (!presence?.playerId || presence.sessionId === this.sessionId) return;
      const playerId = String(presence.playerId);
      const previous = latestByPlayer.get(playerId);
      if (!previous || Number(presence.onlineAt) > Number(previous.onlineAt)) {
        latestByPlayer.set(playerId, presence);
      }
    });

    this.onPresenceSync?.([...latestByPlayer.values()]);
  }

  isOtherPlayer(payload) {
    return payload
      && payload.areaId === this.areaId
      && payload.sessionId !== this.sessionId
      && String(payload.playerId) !== this.playerId;
  }

  async handleSessionClaim(payload) {
    if (!payload
      || String(payload.playerId) !== this.playerId
      || payload.sessionId === this.sessionId
      || Number(payload.claimedAt) < this.startedAt) return;

    this.replaced = true;
    ++this.joinVersion;
    await this.leaveArea(false);
    this.onSessionReplaced?.();
  }

  async send(event, payload) {
    if (!this.channel || this.replaced) return;

    try {
      await this.channel.send({ type: 'broadcast', event, payload });
    } catch (error) {
      console.warn(`Realtime ${event} failed`, error);
    }
  }

  announceState() {
    return this.send('player-state', this.buildState());
  }

  sendMove(movement) {
    return this.send('player-move', { ...this.buildState(), ...movement });
  }

  sendSocialMessage(message) {
    return this.send('social-message', {
      ...this.buildState(),
      message,
      sentAt: Date.now(),
    });
  }

  async leaveArea(invalidate = true) {
    if (invalidate) ++this.joinVersion;
    const channel = this.channel;
    this.channel = null;
    this.areaId = null;
    if (channel) await supabase.removeChannel(channel);
  }

  destroy() {
    this.replaced = true;
    return this.leaveArea();
  }
}
