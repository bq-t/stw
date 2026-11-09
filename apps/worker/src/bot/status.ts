// Fortnite server status from Epic's public Statuspage (status.epicgames.com, no auth).
// The cron checks it every 5 minutes; boards in Discord channels are edited only when
// the fingerprint (statuses, incidents, maintenances) changes.

import { fmt, messages, type Locale } from '../i18n';

const SUMMARY_URL = 'https://status.epicgames.com/api/v2/summary.json';
export const STATUS_PAGE_URL = 'https://status.epicgames.com/';
const GROUP_NAME = 'Fortnite';

export type Indicator = 'none' | 'minor' | 'major' | 'critical' | 'maintenance';
export type ComponentStatus =
  'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage' | 'under_maintenance';

export interface EpicStatus {
  indicator: Indicator;
  components: { name: string; status: ComponentStatus }[];
  incidents: {
    id: string;
    name: string;
    status: string;
    impact: string;
    updatedAt: string;
    url: string;
  }[];
  maintenances: {
    id: string;
    name: string;
    status: string;
    scheduledFor: string;
    scheduledUntil: string | null;
    url: string;
  }[];
}

// ---------- Statuspage → EpicStatus (pure, tested) ----------

interface RawComponent {
  id: string;
  name: string;
  status: string;
  group: boolean;
  group_id: string | null;
}
interface RawIncident {
  id: string;
  name: string;
  status: string;
  impact: string;
  updated_at: string;
  shortlink?: string;
  components?: { id: string }[];
}
interface RawMaintenance extends RawIncident {
  scheduled_for: string;
  scheduled_until: string | null;
}
export interface RawSummary {
  components: RawComponent[];
  incidents: RawIncident[];
  scheduled_maintenances: RawMaintenance[];
}

const SEVERITY: Record<ComponentStatus, number> = {
  operational: 0,
  under_maintenance: 1,
  degraded_performance: 2,
  partial_outage: 3,
  major_outage: 4,
};

function componentStatus(raw: string): ComponentStatus {
  return raw in SEVERITY ? (raw as ComponentStatus) : 'degraded_performance';
}

export function parseSummary(raw: RawSummary): EpicStatus {
  const group = raw.components.find((c) => c.group && c.name === GROUP_NAME);
  if (!group) throw new Error(`Statuspage: no "${GROUP_NAME}" component group`);
  const children = raw.components.filter((c) => c.group_id === group.id);
  const ids = new Set(children.map((c) => c.id));
  const ours = (i: RawIncident) => (i.components ?? []).some((c) => ids.has(c.id));

  const components = children.map((c) => ({ name: c.name, status: componentStatus(c.status) }));
  const incidents = raw.incidents
    .filter((i) => ours(i) && i.status !== 'resolved' && i.status !== 'postmortem')
    .map((i) => ({
      id: i.id,
      name: i.name,
      status: i.status,
      impact: i.impact,
      updatedAt: i.updated_at,
      url: i.shortlink ?? STATUS_PAGE_URL,
    }));
  const maintenances = raw.scheduled_maintenances
    .filter((m) => ours(m) && m.status !== 'completed')
    .sort((a, b) => a.scheduled_for.localeCompare(b.scheduled_for))
    .slice(0, 3)
    .map((m) => ({
      id: m.id,
      name: m.name,
      status: m.status,
      scheduledFor: m.scheduled_for,
      scheduledUntil: m.scheduled_until,
      url: m.shortlink ?? STATUS_PAGE_URL,
    }));

  const worst = components.reduce((w, c) => Math.max(w, SEVERITY[c.status]), 0);
  let indicator: Indicator =
    worst >= 4 ? 'major' : worst >= 2 ? 'minor' : worst === 1 ? 'maintenance' : 'none';
  if (incidents.some((i) => i.impact === 'critical')) indicator = 'critical';
  else if (indicator === 'none' && incidents.length) indicator = 'minor';
  if (maintenances.some((m) => m.status === 'in_progress') && indicator === 'none')
    indicator = 'maintenance';

  return { indicator, components, incidents, maintenances };
}

/** What a board shows, without timestamps that change on every check. */
export function statusFingerprint(s: EpicStatus): string {
  return JSON.stringify([
    s.indicator,
    s.components.map((c) => `${c.name}:${c.status}`),
    s.incidents.map((i) => `${i.id}:${i.status}`),
    s.maintenances.map((m) => `${m.id}:${m.status}`),
  ]);
}

export async function fetchEpicStatus(): Promise<EpicStatus> {
  const res = await fetch(SUMMARY_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Statuspage: HTTP ${res.status}`);
  return parseSummary((await res.json()) as RawSummary);
}

// ---------- board message ----------

const TEXT = 10;
const SEPARATOR = 14;
const CONTAINER = 17;
const ACTION_ROW = 1;
const BUTTON = 2;
const BUTTON_SECONDARY = 2;
const BUTTON_LINK = 5;
export const FLAG_COMPONENTS_V2 = 1 << 15;
export const STATUS_REFRESH_ID = 'status:refresh';

const ACCENT: Record<Indicator, number> = {
  none: 0x3fb950,
  minor: 0xf06c1e,
  major: 0xe5534b,
  critical: 0xe5534b,
  maintenance: 0x3fa9ff,
};

const unix = (iso: string | number) =>
  Math.floor((typeof iso === 'number' ? iso : Date.parse(iso)) / 1000);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');

export function buildStatusMessage(s: EpicStatus, changedAt: number, locale: Locale) {
  const t = messages(locale).Bot.status;
  const lines = s.components.map((c) => {
    const label = t.component[c.status];
    return c.status === 'operational' ? `${c.name}: ${label}` : `**${c.name}: ${label}**`;
  });
  const body: unknown[] = [
    { type: TEXT, content: `## ${t.title}\n### ${t.indicator[s.indicator]}` },
    { type: SEPARATOR, divider: true, spacing: 1 },
    { type: TEXT, content: lines.join('\n') },
  ];
  if (s.incidents.length) {
    body.push({
      type: TEXT,
      content: [
        `### ${t.incidents}`,
        ...s.incidents.map(
          (i) => `[${i.name}](${i.url})\n-# ${cap(i.status)} · <t:${unix(i.updatedAt)}:R>`,
        ),
      ].join('\n'),
    });
  }
  if (s.maintenances.length) {
    body.push({
      type: TEXT,
      content: [
        `### ${t.maintenance}`,
        ...s.maintenances.map(
          (m) =>
            `[${m.name}](${m.url})\n-# <t:${unix(m.scheduledFor)}:f>${
              m.scheduledUntil ? ` – <t:${unix(m.scheduledUntil)}:t>` : ''
            } · ${cap(m.status)}`,
        ),
      ].join('\n'),
    });
  }
  body.push(
    { type: SEPARATOR, divider: true, spacing: 1 },
    {
      type: TEXT,
      content: `-# ${fmt(t.changed, { time: `<t:${unix(changedAt)}:R>` })}\n-# ${t.source}`,
    },
    {
      type: ACTION_ROW,
      components: [
        { type: BUTTON, style: BUTTON_SECONDARY, label: t.refresh, custom_id: STATUS_REFRESH_ID },
        { type: BUTTON, style: BUTTON_LINK, label: t.statusPage, url: STATUS_PAGE_URL },
      ],
    },
  );
  return {
    flags: FLAG_COMPONENTS_V2,
    components: [{ type: CONTAINER, accent_color: ACCENT[s.indicator], components: body }],
    allowed_mentions: { parse: [] as never[] },
  };
}
