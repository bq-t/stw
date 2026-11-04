import { vbucksOf, type DaySnapshot, type Zone } from '@stw/shared';

const ZONE_NAMES: Record<Zone, string> = {
  stonewood: 'Stonewood',
  plankerton: 'Plankerton',
  'canny-valley': 'Canny Valley',
  'twine-peaks': 'Twine Peaks',
};

const VBUCKS_COLOR = 0x3fa9ff;

function titleCase(key: string): string {
  return key
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Posts today's V-Bucks missions to a Discord channel webhook. */
export async function notifyDiscord(
  webhookUrl: string,
  snapshot: DaySnapshot,
  siteUrl: string,
): Promise<void> {
  const missions = snapshot.missions
    .filter((m) => vbucksOf(m) > 0)
    .sort((a, b) => vbucksOf(b) - vbucksOf(a));
  if (missions.length === 0) return;

  const lines = missions.slice(0, 20).map((m) => {
    const pl = m.powerLevel > 0 ? `PL ${m.powerLevel}` : 'PL ?';
    return `**${vbucksOf(m)}** · ${ZONE_NAMES[m.zone]} · ${titleCase(m.missionType)} · ${pl}`;
  });

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: `${snapshot.vbucksTotal} V-Bucks today`,
          url: siteUrl,
          description: lines.join('\n'),
          color: VBUCKS_COLOR,
          footer: { text: 'V-Bucks alerts are for Founders only. Not affiliated with Epic Games.' },
          timestamp: snapshot.fetchedAt,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Discord webhook failed: HTTP ${res.status}`);
}
