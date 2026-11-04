import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameIcon } from './GameIcon';

/** The game's V-Bucks coin; used everywhere V-Bucks are mentioned. */
export function VbucksIcon({ className, label }: { className?: string; label?: string }) {
  return (
    <GameIcon
      group="ui"
      names={['vbucks']}
      fallback={Coins}
      label={label}
      className={cn('size-4 shrink-0 text-vbucks', className)}
    />
  );
}
