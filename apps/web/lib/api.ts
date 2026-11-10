import {
  rotationDay,
  type BrShop,
  type DaySnapshot,
  type GameEvent,
  type Tournament,
  type TournamentName,
  type TournamentRegion,
  type StwLlama,
  type StwShop,
  type SubscriptionFilter,
  type VbucksHistory,
} from '@stw/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/** No API configured → the tracker runs on generated demo data (lib/demo.ts). */
export const IS_DEMO = API_URL === '';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchMissions(): Promise<DaySnapshot> {
  if (IS_DEMO) return (await import('@stw/shared/demo')).demoSnapshot();
  return get<DaySnapshot>('/api/missions');
}

export async function fetchHistory(): Promise<VbucksHistory> {
  if (IS_DEMO) return (await import('@stw/shared/demo')).demoHistory();
  return get<VbucksHistory>('/api/history');
}

// ---------- account (Discord login, handled by the Worker) ----------

export interface Me {
  user: { id: string; name: string; avatarUrl: string; locale: string | null } | null;
  /** False until the Worker has the Discord app configured: the header hides the button. */
  loginEnabled: boolean;
}

export async function fetchMe(): Promise<Me> {
  if (IS_DEMO) return { user: null, loginEnabled: false };
  const res = await fetch(`${API_URL}/api/me`, { credentials: 'include' });
  if (!res.ok) throw new Error(`/api/me: HTTP ${res.status}`);
  return (await res.json()) as Me;
}

/** Full-page navigation to Discord; the Worker sends the user back to `returnTo`. */
export function loginUrl(returnTo: string): string {
  return `${API_URL}/api/auth/discord/login?return=${encodeURIComponent(returnTo)}`;
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
}

// ---------- personal subscriptions (Notifications page) ----------

export interface SubscriptionItem {
  id: number;
  filter: SubscriptionFilter | null;
  /** Filter described by the Worker in the requested language. */
  summary: string;
  lastSentAt: number | null;
  lastError: string | null;
}

export interface SubscriptionsResponse {
  subscriptions: SubscriptionItem[];
  max: number;
  /** Adds Fishstick to the user's Discord account, so it can DM them. */
  installUrl: string;
}

/** Error code from the Worker ("limit", "cannot dm", "too soon", …) or "http". */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    /** Extra fields of the error body (e.g. installUrl for "cannot dm"). */
    readonly data: Record<string, unknown> = {},
  ) {
    super(code);
  }
}

async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new ApiError(data.error ?? 'http', data as Record<string, unknown>);
  return data;
}

export function fetchSubscriptions(locale: string): Promise<SubscriptionsResponse> {
  return send('GET', `/api/subscriptions?locale=${locale}`);
}

export function createSubscription(
  filter: SubscriptionFilter,
  locale: string,
): Promise<SubscriptionsResponse> {
  return send('POST', '/api/subscriptions', { filter, locale });
}

export function deleteSubscription(id: number, locale: string): Promise<SubscriptionsResponse> {
  return send('DELETE', `/api/subscriptions/${id}?locale=${locale}`);
}

/** Bot DMs the user a sample notification for the filter right now (once a minute). */
export function testSubscription(
  filter: SubscriptionFilter,
  locale: string,
): Promise<{ ok: true; found: number }> {
  return send('POST', '/api/subscriptions/test', { filter, locale });
}

// ---------- Epic link ----------

export type EpicLinkStatus =
  | { status: 'none' }
  | { status: 'pending'; verificationUrl: string; expiresAt: number }
  | { status: 'expired' }
  | { status: 'linked'; displayName: string };

export function fetchEpicLink(): Promise<EpicLinkStatus> {
  return send('GET', '/api/epic');
}

/** Starts (or resumes) linking: open `verificationUrl`, then poll. */
export function startEpicLink(): Promise<EpicLinkStatus & { status: 'pending' }> {
  return send('POST', '/api/epic/link');
}

export function pollEpicLink(): Promise<EpicLinkStatus> {
  return send('POST', '/api/epic/link/poll');
}

export function unlinkEpic(): Promise<EpicLinkStatus> {
  return send('DELETE', '/api/epic');
}

// ---------- shops ----------

export function fetchBrShop(locale: string): Promise<BrShop> {
  return get<BrShop>(`/api/shop/br?lang=${locale === 'ru' ? 'ru' : 'en'}`);
}

export function fetchStwShop(): Promise<StwShop> {
  return get<StwShop>('/api/shop/stw');
}

/** X-ray llama contents of the logged-in user (Epic link needed: ApiError "not linked"). */
export function fetchLlamas(): Promise<{ llamas: StwLlama[] }> {
  return send('GET', '/api/shop/llamas');
}

// ---------- tournaments, events, reminders ----------

export interface TournamentsResponse {
  region: TournamentRegion;
  tournaments: Tournament[];
  names: Record<string, TournamentName>;
}

export function fetchTournaments(region: TournamentRegion, locale: string) {
  return get<TournamentsResponse>(
    `/api/tournaments?region=${region}&lang=${locale === 'ru' ? 'ru' : 'en'}`,
  );
}

export function fetchEvents() {
  return get<{ events: GameEvent[] }>('/api/events');
}

export interface ReminderItem {
  id: number;
  region: TournamentRegion;
  windowId: string;
  displayId: string;
  beginAt: number;
  offset: number;
}

export interface RemindersResponse {
  reminders: ReminderItem[];
  max: number;
  installUrl: string;
}

export function fetchReminders(): Promise<RemindersResponse> {
  return send('GET', '/api/reminders');
}

export function addReminder(r: {
  region: TournamentRegion;
  windowId: string;
  offset: number;
  all: boolean;
  locale: string;
}): Promise<RemindersResponse> {
  return send('POST', '/api/reminders', r);
}

export function deleteReminder(id: number): Promise<RemindersResponse> {
  return send('DELETE', `/api/reminders/${id}`);
}

/** The Worker has not saved today's snapshot yet: the page shows yesterday's with a note. */
export function isStale(snapshot: DaySnapshot, now: Date = new Date()): boolean {
  return snapshot.date !== rotationDay(now);
}

/**
 * When to refetch: right after the rotation (+1 min for the Worker),
 * or every 5 minutes while the snapshot is stale.
 */
export function refetchDelay(snapshot: DaySnapshot | undefined, now: Date = new Date()): number {
  const FIVE_MIN = 5 * 60 * 1000;
  if (!snapshot || isStale(snapshot, now)) return FIVE_MIN;
  return Math.max(FIVE_MIN / 5, Date.parse(snapshot.expiresAt) - now.getTime() + 60 * 1000);
}
