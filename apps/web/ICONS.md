# Game icons

Drop PNG/WebP/SVG files into `public/icons/<group>/` with these names (lowercase). A file that exists replaces the
placeholder icon automatically after `pnpm dev:web` / `pnpm --filter web build` restarts
(the list is rebuilt by `scripts/icons-manifest.mjs`). Square, transparent background,
128×128 or larger.

## missions/

fight-the-storm, retrieve-the-data, ride-the-lightning, repair-the-shelter,
evacuate-the-shelter, evacuate-the-survivors, deliver-the-bomb, destroy-the-encampments,
launch-the-rocket, launch-the-balloon, build-the-radar-grid, eliminate-and-collect,
refuel-the-homebase, resupply, deploy-the-probe

Category 2/3/4 storms use `fight-the-category-2-storm` etc. if present, otherwise
`fight-the-storm` with a number badge.

## alerts/

mini-boss, mega-alert, storm, elemental-fire, elemental-water, elemental-nature

## rewards/

By the item name after the colon in the Epic ID, e.g. `AccountResource:reagent_c_t01` →
`reagent_c_t01.png`:

- currency_mtxswap (V-Bucks), currency_xrayllama (X-Ray Tickets)
- campaign_event_currency, eventcurrency_scaling (event tickets)
- personnelxp, schematicxp, heroxp
- reagent_c_t01, reagent_c_t02, reagent_c_t03, reagent_c_t04 (evolution materials)
- reagent_alteration_upgrade_uc, \_r, \_vr, \_sr (PERK-UP), reagent_alteration_generic (RE-PERK),
  reagent_alteration_ele_fire, \_ele_water, \_ele_nature

Category fallbacks for items without their own icon: category-hero, category-survivor,
category-defender, category-schematic, category-perk, category-evo.

## ui/

power (power level), vbucks (V-Bucks badge)

## quests/

Daily Quest icons, by the names in `apps/web/data/daily-quests.ts`:
destroy, discovery, exterminate, missions, daily (category icons);
constructor, ninja, outlander, soldier; assault-rifle, smg, shotgun, pistol, sniper-rifle,
melee, trap; survivors, radar, safe, treasure, world-explorer.

# Daily Quest screenshots

Not icons: in-game screenshots of what to look for, shown when a quest card is opened.
Put them into `public/images/quests/<quest id>/` as `1.webp`, `2.webp`… (shown in that order;
png/jpg/avif also work). The quest id is the card's URL anchor, e.g. `/daily-quests#destroy-tvs`
→ `public/images/quests/destroy-tvs/`. 16:9, about 1280px wide, WebP. A caption is optional:
`captions: { '1': { en: '…', ru: '…' } }` on the quest in `data/daily-quests.ts`.
A quest without screenshots simply shows none (husk kills, hero class quests…).
