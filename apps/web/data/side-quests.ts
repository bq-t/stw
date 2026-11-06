/**
 * Side quests and challenges (freethevbucks.com/side-quests lists the ones with V-Bucks;
 * the full list comes from the Fortnite wiki "Side Quests" and "Challenge Quests", checked
 * 2026-11-04). Data is in side-quests-data.ts. Names stay in English, like the questline.
 */
import type { L, Objective, QReward } from './questline';
import { CHALLENGES, SIDE_QUESTS } from './side-quests-data';

export const SIDE_CHECKED = '2026-11-04';

export type SideGroupId =
  'stonewood' | 'plankerton' | 'canny-valley' | 'twine-peaks' | 'lok' | 'other';

export interface SideQuest {
  /** URL anchor; unique across the page. */
  id: string;
  name: string;
  objectives: Objective[];
  rewards: QReward[];
}

export interface ChallengeStage {
  /** What the stage asks for: missions, defenses, mimics... (see SideQuests.series.* messages). */
  goal: number;
  /** Own objective when the stages differ (training challenges). */
  objective?: Objective;
  rewards: QReward[];
}

export interface ChallengeSeries {
  id: string;
  name: string;
  stages: ChallengeStage[];
}

/** Groups in page order; zone groups take their title from Zone.* messages. */
export const SIDE_GROUPS: { id: SideGroupId; title?: L; note?: L }[] = [
  {
    id: 'stonewood',
    note: {
      en: 'Storm Shield Defenses 7–10 appear after the zone’s main questline.',
      ru: 'Защиты щита 7–10 появляются после сюжета зоны.',
    },
  },
  {
    id: 'plankerton',
    note: {
      en: 'Storm Shield Defenses 7–10 appear after the zone’s main questline.',
      ru: 'Защиты щита 7–10 появляются после сюжета зоны.',
    },
  },
  {
    id: 'canny-valley',
    note: {
      en: 'Storm Shield Defenses 7–10 appear after the zone’s main questline.',
      ru: 'Защиты щита 7–10 появляются после сюжета зоны.',
    },
  },
  {
    id: 'twine-peaks',
    note: {
      en: 'Storm Shield Defenses 7–10 appear after the zone’s main questline.',
      ru: 'Защиты щита 7–10 появляются после сюжета зоны.',
    },
  },
  {
    id: 'lok',
    title: { en: 'Lok’s Book of Monsters', ru: 'Книга монстров Лока' },
    note: {
      en: 'Gather data from a type of husk in successful missions.',
      ru: 'Собирайте данные о определённом типе хасков в успешных миссиях.',
    },
  },
  {
    id: 'other',
    title: { en: 'Banners and tutorials', ru: 'Баннеры и обучение' },
  },
];

/** Tips for a challenge series, by id. */
export const CHALLENGE_TIPS: Record<string, L> = {
  'mission-accomplished': {
    en: 'Any mission counts, in any zone and on any difficulty.',
    ru: 'Засчитывается любая миссия в любой зоне и на любой сложности.',
  },
  'hold-the-door': {
    en: 'Defenses on a friend’s Storm Shield count too: join other players’ defenses.',
    ru: 'Защиты щита у друзей тоже засчитываются: помогайте другим игрокам с их щитом.',
  },
  'toxic-treasures': {
    en: 'Mimics pretend to be treasure chests and attack when you open them.',
    ru: 'Мимики притворяются сундуками с сокровищами и нападают, когда их открываешь.',
  },
};

const vbucksOf = (rewards: QReward[]) =>
  rewards.reduce((s, r) => s + (r.t === 'vbucks' ? r.n : 0), 0);

export const questVbucks = (q: SideQuest) => vbucksOf(q.rewards);
export const stageVbucks = (s: ChallengeStage) => vbucksOf(s.rewards);
export const seriesVbucks = (c: ChallengeSeries) =>
  c.stages.reduce((s, st) => s + stageVbucks(st), 0);

export interface VbucksSource {
  /** Anchor on the page. */
  href: string;
  label: L;
  /** How the amount is earned, e.g. "4 × 100–150" or "20 stages × 50". */
  detail: L;
  vbucks: number;
}

/** Every side quest and challenge that pays V-Bucks, for the summary at the top. */
export function vbucksSources(zoneName: (id: SideGroupId) => L): VbucksSource[] {
  const out: VbucksSource[] = [];
  for (const c of CHALLENGES) {
    const total = seriesVbucks(c);
    if (!total) continue;
    const per = stageVbucks(c.stages[0]!);
    out.push({
      href: `#${c.id}`,
      label: { en: c.name, ru: c.name },
      detail: {
        en: `${c.stages.length} stages × ${per}`,
        ru: `${c.stages.length} этапов × ${per}`,
      },
      vbucks: total,
    });
  }
  for (const g of ['stonewood', 'plankerton', 'canny-valley', 'twine-peaks'] as const) {
    const ssd = SIDE_QUESTS[g].filter((q) => questVbucks(q) > 0);
    if (!ssd.length) continue;
    const zone = zoneName(g);
    out.push({
      href: `#${ssd[0]!.id}`,
      label: {
        en: `${zone.en}: Storm Shield Defenses 7–10`,
        ru: `${zone.ru}: защиты щита 7–10`,
      },
      detail: {
        en: ssd.map((q) => questVbucks(q)).join(' + '),
        ru: ssd.map((q) => questVbucks(q)).join(' + '),
      },
      vbucks: ssd.reduce((s, q) => s + questVbucks(q), 0),
    });
  }
  for (const q of SIDE_QUESTS.lok.filter((q) => questVbucks(q) > 0)) {
    out.push({
      href: `#${q.id}`,
      label: { en: q.name, ru: q.name },
      detail: { en: 'one quest', ru: 'один квест' },
      vbucks: questVbucks(q),
    });
  }
  return out;
}

export { CHALLENGES, SIDE_QUESTS };
