import {
  BookOpen,
  Box,
  Coins,
  Cross,
  Crosshair,
  Flag,
  Flame,
  FlaskConical,
  Gem,
  Hammer,
  Map,
  Music,
  Package,
  Pickaxe,
  ScrollText,
  Search,
  Shield,
  ShieldHalf,
  Skull,
  Sparkles,
  Star,
  Sword,
  Users,
  User,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { ItemKind } from '@/data/questline';

/** Timeline node icons that are not mission types (those come from MISSION_ICONS). */
export const NODE_ICONS: Record<string, LucideIcon> = {
  ssd: Shield,
  story: BookOpen,
  quest: ScrollText,
  build: Hammer,
  exterminate: Skull,
  locate: Search,
  explore: Map,
  medic: Cross,
};

export const ITEM_ICONS: Record<ItemKind, LucideIcon> = {
  hero: User,
  survivor: Users,
  'lead-survivor': Star,
  defender: ShieldHalf,
  ranged: Crosshair,
  melee: Sword,
  trap: Zap,
  schematic: Wrench,
  pickaxe: Pickaxe,
  transform: Sparkles,
  cosmetic: Music,
  banner: Flag,
};

/** Reward icon names in public/icons/rewards/ for items without their own picture. */
export const ITEM_ICON_NAMES: Partial<Record<ItemKind, string[]>> = {
  hero: ['category-hero'],
  survivor: ['category-survivor'],
  'lead-survivor': ['category-survivor'],
  defender: ['category-defender'],
  ranged: ['category-schematic'],
  melee: ['category-schematic'],
  trap: ['category-schematic'],
  schematic: ['category-schematic'],
};

export const RESOURCE_FALLBACK: Record<string, LucideIcon> = {
  gold: Coins,
  flux: Flame,
  'mini-llama': Package,
  'upgrade-llama': Package,
  'research-points': FlaskConical,
  default: Gem,
  box: Box,
};
