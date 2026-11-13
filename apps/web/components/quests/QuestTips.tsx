import { Lightbulb, MapPin, Swords } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { QuestTip, TipKind } from '@/data/daily-quests';
import { Link } from '@/i18n/navigation';
import { GameIcon } from '@/components/missions/GameIcon';
import { FallbackMissionIcon, MISSION_ICONS } from '@/components/missions/icons';
import { cn } from '@/lib/utils';

const KIND_ICONS: Record<TipKind, typeof MapPin> = {
  where: MapPin,
  mission: Swords,
  tip: Lightbulb,
};

/** Tips list: kind icon · text · mission types that suit (icon + name). */
export function QuestTips({ tips, className }: { tips: QuestTip[]; className?: string }) {
  const locale = useLocale() as 'en' | 'ru';
  const t = useTranslations();

  return (
    <ul className={cn('flex flex-col gap-1.5', className)}>
      {tips.map((tip, i) => {
        const Icon = KIND_ICONS[tip.kind];
        const text = tip.text[locale];
        return (
          <li key={i} className="flex gap-2 text-sm leading-snug">
            <Icon
              aria-label={t(`DailyQuests.tipKind.${tip.kind}`)}
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
            <div className="flex min-w-0 flex-col gap-1">
              {tip.href ? (
                <Link href={tip.href} className="text-accent-ui underline-offset-2 hover:underline">
                  {text}
                </Link>
              ) : (
                <p>{text}</p>
              )}
              {tip.missions && (
                <ul className="flex flex-wrap gap-1.5">
                  {tip.missions.map((m) => (
                    <li
                      key={m}
                      className="skew-tab inline-flex items-center gap-1 bg-white px-2 py-0.5 text-xs font-semibold text-on-brand [&_img]:brightness-0"
                    >
                      <GameIcon
                        group="missions"
                        names={[m]}
                        fallback={MISSION_ICONS[m] ?? FallbackMissionIcon}
                        className="size-3.5 fill-current"
                      />
                      <span>{t.has(`MissionType.${m}`) ? t(`MissionType.${m}`) : m}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
