import type { DaySnapshot, VbucksHistory } from '@stw/shared';

// KV layout (see the tech plan, "KV-ключи"):
//   snapshot:current     DaySnapshot of the current day, overwritten daily
//   snapshot:YYYY-MM-DD  snapshot of a given day, TTL 31 days
//   history:vbucks       VbucksHistory, last 30 days
//   health               HealthState, written on every success and failure

const DAY_TTL_SECONDS = 31 * 24 * 60 * 60;

export interface HealthState {
  lastSuccessAt?: string;
  lastSnapshotDate?: string;
  lastErrorAt?: string;
  lastError?: string;
  /** Last run that found Epic had not rotated yet. */
  lastStaleAt?: string;
}

export class Store {
  constructor(private readonly kv: KVNamespace) {}

  getCurrent(): Promise<DaySnapshot | null> {
    return this.kv.get<DaySnapshot>('snapshot:current', 'json');
  }

  async hasDay(date: string): Promise<boolean> {
    // A plain read: the free tier allows 100k reads but only 1k list() calls a day.
    return (await this.kv.get(`snapshot:${date}`, 'stream')) !== null;
  }

  getHistory(): Promise<VbucksHistory | null> {
    return this.kv.get<VbucksHistory>('history:vbucks', 'json');
  }

  async getHealth(): Promise<HealthState> {
    return (await this.kv.get<HealthState>('health', 'json')) ?? {};
  }

  async saveDay(snapshot: DaySnapshot, history: VbucksHistory): Promise<void> {
    const json = JSON.stringify(snapshot);
    await Promise.all([
      this.kv.put(`snapshot:${snapshot.date}`, json, { expirationTtl: DAY_TTL_SECONDS }),
      this.kv.put('snapshot:current', json),
      this.kv.put('history:vbucks', JSON.stringify(history)),
    ]);
  }

  async updateHealth(patch: HealthState): Promise<void> {
    const current = await this.getHealth();
    await this.kv.put('health', JSON.stringify({ ...current, ...patch }));
  }
}
