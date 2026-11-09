// Strings for Discord messages and the bot: apps/web/messages/*.json (sections Bot, Zone,
// MissionType, AlertKind, RewardCategory), so the site and the bot share one translation.

import en from '../../web/messages/en.json';
import ruJson from '../../web/messages/ru.json';

export type Locale = 'en' | 'ru';
export type Messages = typeof en;

const ru = ruJson as unknown as Messages;

export function messages(locale: Locale): Messages {
  return locale === 'ru' ? ru : en;
}

/** Discord user/guild locale ("ru", "en-US", "uk"…) → our locale. */
export function localeOf(discordLocale: string | null | undefined): Locale {
  return discordLocale?.startsWith('ru') ? 'ru' : 'en';
}

/** "{name}" placeholders. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (all, key: string) =>
    key in vars ? String(vars[key]) : all,
  );
}

type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

/** Plural forms object ({ one, few, many, other }) with "#" for the number. */
export function plural(forms: unknown, n: number, locale: Locale): string {
  const f = forms as PluralForms;
  const key = new Intl.PluralRules(locale).select(n);
  return (f[key] ?? f.other).replace('#', String(n));
}

/** Site path in the given locale: EN has no prefix, RU lives under /ru. */
export function sitePath(site: string, locale: Locale, path: string): string {
  const base = site.replace(/\/$/, '');
  if (locale === 'en') return `${base}${path}`;
  // "/" and "/?alert=vbucks" → "/ru", "/ru?alert=vbucks".
  return path === '/' || path.startsWith('/?') ? `${base}/ru${path.slice(1)}` : `${base}/ru${path}`;
}

/** Lookup in a { key: label } section, with a readable fallback for unknown keys. */
export function label(section: Record<string, string>, key: string): string {
  return (
    section[key] ??
    key
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}
