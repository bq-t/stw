import type { AlertKind, RewardCategory } from '@stw/shared';
import {
  Antenna,
  CircleArrowUp,
  Coins,
  FlaskConical,
  ShieldHalf,
  Sparkles,
  Star,
  Swords,
  Ticket,
  Wrench,
  Bomb,
  CloudLightning,
  Crosshair,
  Database,
  Droplets,
  Flame,
  Fuel,
  Hammer,
  House,
  Leaf,
  MapPin,
  Package,
  Radar,
  Rocket,
  Skull,
  Tent,
  Tornado,
  Truck,
  Users,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react';

// Placeholder icons until the game icons are exported with FModel (stage 4).

export const MISSION_ICONS: Record<string, LucideIcon> = {
  'fight-the-storm': Tornado,
  'fight-the-category-2-storm': Tornado,
  'fight-the-category-3-storm': Tornado,
  'fight-the-category-4-storm': Tornado,
  'retrieve-the-data': Database,
  'ride-the-lightning': Truck,
  'repair-the-shelter': Hammer,
  'evacuate-the-shelter': House,
  'evacuate-the-survivors': Users,
  'deliver-the-bomb': Bomb,
  'destroy-the-encampments': Tent,
  'launch-the-rocket': Rocket,
  'launch-the-balloon': Wind,
  'build-the-radar-grid': Radar,
  'eliminate-and-collect': Crosshair,
  'refuel-the-homebase': Fuel,
  resupply: Package,
  'deploy-the-probe': Antenna,
};

/** Storm category shown next to the storm icon: "fight-the-category-3-storm" → 3. */
export function stormCategory(type: string): number | null {
  const m = type.match(/^fight-the-category-(\d)-storm$/);
  return m ? Number(m[1]) : null;
}

export const ALERT_ICONS: Partial<Record<AlertKind, LucideIcon>> = {
  'mini-boss': Skull,
  'mega-alert': Zap,
  storm: CloudLightning,
  'elemental-fire': Flame,
  'elemental-nature': Leaf,
  'elemental-water': Droplets,
};

/** Lucide fallbacks for reward categories. */
export const REWARD_ICONS: Record<RewardCategory, LucideIcon> = {
  vbucks: Coins,
  xray: Ticket,
  event: Star,
  gold: Coins,
  xp: Sparkles,
  evo: FlaskConical,
  perk: CircleArrowUp,
  schematic: Wrench,
  hero: Swords,
  survivor: Users,
  defender: ShieldHalf,
  other: Package,
};

/** Game icon names that represent a whole reward category (filter buttons). */
export const REWARD_CATEGORY_ICON_NAMES: Record<RewardCategory, string[]> = {
  vbucks: ['currency_mtxswap'],
  xray: ['currency_xrayllama'],
  event: ['campaign_event_currency'],
  gold: ['eventcurrency_scaling'],
  xp: ['heroxp'],
  evo: ['reagent_c_t04'],
  perk: ['reagent_alteration_upgrade_sr'],
  schematic: ['category-schematic'],
  hero: ['category-hero'],
  survivor: ['category-survivor'],
  defender: ['category-defender'],
  other: [],
};

export { MapPin as FallbackMissionIcon, Zap as PowerIcon };
