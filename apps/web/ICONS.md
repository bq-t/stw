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
