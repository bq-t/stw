// Quest list from the Fortnite wiki ("Side Quests", "Challenge Quests", 2026-11-04); rewards and
// objectives of the side quests come from the game files (43.10) via tools/game-export/apply.mts.
// Challenge series were checked against the game (goals and V-Bucks match).
import { choice, game, item, missions, res, text, unlock, vb } from './questline';
import type { ChallengeSeries, SideGroupId, SideQuest } from './side-quests';

export const SIDE_QUESTS: Record<SideGroupId, SideQuest[]> = {
  stonewood: [
    {
      id: 'ol-woody',
      name: "Ol' Woody",
      objectives: [
        text(
          'Complete Homebase Storm Shield Defense 1',
          'Выполните миссию «Оборона щита главной базы #1»',
        ),
      ],
      rewards: [game('AthenaPickaxe:pickaxe_id_stw001_tier_1')],
    },
    {
      id: 'basic-basher',
      name: 'Basic Basher',
      objectives: [
        text('Complete Before and After Science', 'Выполните задание «До и после науки».'),
      ],
      rewards: [game('AthenaPickaxe:pickaxe_id_stw007_basic')],
    },
    {
      id: 'tech-axe',
      name: 'Tech Axe',
      objectives: [text('Reach Homebase Level 25', 'Достигните 25-го уровня базы')],
      rewards: [game('AthenaPickaxe:pickaxe_id_stw002_tier_3')],
    },
    {
      id: 'hydraulic-wrecker',
      name: 'Hydraulic Wrecker',
      objectives: [text('Earn Level 2 Pickaxe upgrade', 'Получите улучшение кирки 2-го уровня')],
      rewards: [game('AthenaPickaxe:pickaxe_id_stw003_tier_4')],
    },
    {
      id: 'vindertech-elite',
      name: 'Vindertech Elite',
      objectives: [text('Earn Level 4 Pickaxe upgrade', 'Получите улучшение кирки 4-го уровня')],
      rewards: [game('AthenaPickaxe:pickaxe_id_stw004_tier_5')],
    },
    {
      id: 'laser-pick',
      name: 'Laser Pick',
      objectives: [text('Earn Level 6 Pickaxe upgrade', 'Получите улучшение кирки 6-го уровня')],
      rewards: [game('AthenaPickaxe:pickaxe_id_stw005_tier_6')],
    },
    {
      id: 'troll-thieves',
      name: 'Troll Thieves',
      objectives: [
        text(
          'Whack 2 Trolls in successful missions in a 5+ zone',
          'Прихлопните 2 троллей в ходе успешно выполненных миссий (мощь Бури: 5+)',
        ),
      ],
      rewards: [game('AccountResource:schematicxp', 1000), game('CardPack:cardpack_melee_uc')],
    },
    {
      id: 'group-effort',
      name: 'Group Effort',
      objectives: [
        text(
          'Complete 2 Play with Others missions in Stonewood',
          'Завершите 2 совместных вылазки в Камнелесье',
        ),
      ],
      rewards: [
        choice(
          game('Weapon:wid_assault_doubleshot_vr_ore_t01'),
          game('Weapon:wid_assault_surgical_vr_ore_t01'),
        ),
      ],
    },
    {
      id: 'the-prestige',
      name: 'The Prestige',
      objectives: [
        text('Save 15 Survivors', 'Спасите 15 выживших'),
        text('Complete 3 missions in a 10+ zone', 'Выполните 3 миссии (мощь Бури: 10+)'),
      ],
      rewards: [game('AccountResource:peoplexp', 2500), game('Hero:hid_commando_guntough_r_t01')],
    },
    {
      id: 'troll-key',
      name: 'Troll Key',
      objectives: [
        text('Find the Troll Key in a 10+ zone', 'Найдите ключ тролля (мощь Бури: 10+)'),
      ],
      rewards: [game('AccountResource:schematicxp', 1700), game('CardPack:cardpack_trap_r')],
    },
    {
      id: 'epic-troll-stash',
      name: 'Epic Troll Stash',
      objectives: [
        text('Find the Troll Loot Stash in a 10+ zone', 'Найдите тайник тролля (мощь Бури: 10+)'),
      ],
      rewards: [choice(game('CardPack:cardpack_melee_vr'), game('CardPack:cardpack_ranged_vr'))],
    },
    {
      id: 'stonewood-storm-shield-defense-7',
      name: 'Stonewood Storm Shield Defense 7',
      objectives: [
        text(
          'Complete Homebase Storm Shield Defense 7',
          'Выполните миссию «Оборона щита главной базы #7»',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'stonewood-storm-shield-defense-8',
      name: 'Stonewood Storm Shield Defense 8',
      objectives: [
        text(
          'Complete Homebase Storm Shield Defense 8',
          'Выполните миссию «Оборона щита главной базы #8»',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'stonewood-storm-shield-defense-9',
      name: 'Stonewood Storm Shield Defense 9',
      objectives: [
        text(
          'Complete Homebase Storm Shield Defense 9',
          'Выполните миссию «Оборона щита главной базы #9»',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'stonewood-storm-shield-defense-10',
      name: 'Stonewood Storm Shield Defense 10',
      objectives: [
        text(
          'Complete Homebase Storm Shield Defense 10',
          'Выполните миссию «Оборона щита главной базы #10»',
        ),
      ],
      rewards: [vb(150), unlock('Hero Loadout', 'Раскладка героев')],
    },
    {
      id: 'stonewood-endurance-defense',
      name: 'Stonewood Endurance Defense',
      objectives: [
        text(
          'Complete Wave 30 of Endurance Defense in Stonewood',
          'Отбейте 30-ю волну во время испытания на прочность в Камнелесье',
        ),
      ],
      rewards: [
        game('AccountResource:voucher_cardpack_jackpot'),
        game('CardPack:cardpack_endurancewave30banner_theater01'),
      ],
    },
  ],
  plankerton: [
    {
      id: 'save-the-world',
      name: 'Save the World',
      objectives: [text('Save Survivors ×100', 'Спасите выживших ×100')],
      rewards: [game('AccountResource:eventcurrency_scaling', 100)],
    },
    {
      id: 'husk-takedown',
      name: 'Husk Takedown',
      objectives: [
        text('Eliminate Husks in a 40+ zone ×1000', 'Уничтожьте мозгляков (мощь Бури: 40+) ×1000'),
      ],
      rewards: [game('AccountResource:reagent_evolverarity_r', 30)],
    },
    {
      id: 'mist-monster-hunter',
      name: 'Mist Monster Hunter',
      objectives: [
        text(
          'Eliminate Mist Monsters in a 40+ zone ×100',
          'Уничтожьте туманных монстров (мощь Бури: 40+) ×100',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 100)],
    },
    {
      id: 'portraits-of-someone-special',
      name: 'Portraits of Someone Special',
      objectives: [
        text(
          'Gather Portraits of Karolina in a 40+ zone ×10',
          'Соберите портреты Каролины (мощь Бури: 40+) ×10',
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 13500), game('Worker:worker_karolina_ur_t01')],
    },
    {
      id: 'joels-pub',
      name: "Joel's Pub",
      objectives: [
        text(
          "Become a regular at Joel's Pub by visiting it on two occasions in a 40+ zone. Found in City zones. ×2",
          'Станьте завсегдатаем паба Джоэла, дважды посетив его в зоне с уровнем мощи 40+. Паб можно найти в городах. ×2',
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 13500), game('Worker:worker_joel_ur_t01')],
    },
    {
      id: 'plankerton-storm-shield-defense-7',
      name: 'Plankerton Storm Shield Defense 7',
      objectives: [
        text(
          'Complete Plankerton Storm Shield Defense 7',
          'Выполните миссию «Оборона щита в Планкертоне #7»',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'plankerton-storm-shield-defense-8',
      name: 'Plankerton Storm Shield Defense 8',
      objectives: [
        text(
          'Complete Plankerton Storm Shield Defense 8',
          'Выполните миссию «Оборона щита в Планкертоне #8»',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'plankerton-storm-shield-defense-9',
      name: 'Plankerton Storm Shield Defense 9',
      objectives: [
        text(
          'Complete Plankerton Storm Shield Defense 9',
          'Выполните миссию «Оборона щита в Планкертоне #9»',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'plankerton-storm-shield-defense-10',
      name: 'Plankerton Storm Shield Defense 10',
      objectives: [
        text(
          'Complete Plankerton Storm Shield Defense 10',
          'Выполните миссию «Оборона щита в Планкертоне #10»',
        ),
      ],
      rewards: [vb(150), unlock('Hero Loadout', 'Раскладка героев')],
    },
    {
      id: 'plankerton-endurance-defense',
      name: 'Plankerton Endurance Defense',
      objectives: [
        text(
          'Complete Wave 30 of Endurance Defense in Plankerton',
          'Отбейте 30-ю волну во время испытания на прочность в Планкертоне',
        ),
      ],
      rewards: [
        game('AccountResource:voucher_cardpack_jackpot'),
        game('CardPack:cardpack_endurancewave30banner_theater02'),
      ],
    },
  ],
  'canny-valley': [
    {
      id: 'boots-on-the-ground',
      name: 'Boots on the Ground',
      objectives: [
        text(
          'Complete 2 Play with Others missions in Canny Valley',
          'Завершите 2 совместных вылазки в Вещей долине',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'smashing',
      name: 'Smashing!',
      objectives: [
        text(
          'Eliminate 15 Mist Monsters in a 22+ zone',
          'Уничтожьте 15 туманных монстров (мощь Бури: 22+)',
        ),
      ],
      rewards: [
        game('AccountResource:reagent_alteration_upgrade_r', 75),
        game('AccountResource:schematicxp', 9400),
      ],
    },
    {
      id: 'bring-them-home',
      name: 'Bring Them Home',
      objectives: [
        text('Save 15 Survivors', 'Спасите 15 выживших'),
        text('Complete 3 missions in a zone', 'Выполните 3 миссии (мощь Бури: )'),
      ],
      rewards: [
        game('AccountResource:peoplexp', 18700),
        game('AccountResource:reagent_evolverarity_r', 45),
      ],
    },
    {
      id: 'triple-threat',
      name: 'Triple Threat',
      objectives: [missions(2, ['fight-the-category-3-storm'], 22)],
      rewards: [
        game('AccountResource:eventcurrency_scaling', 150),
        game('AccountResource:schematicxp', 9400),
      ],
    },
    {
      id: 'pressing-matters',
      name: 'Pressing Matters',
      objectives: [
        missions(
          3,
          ['fight-the-category-2-storm', 'fight-the-category-3-storm', 'deliver-the-bomb'],
          22,
        ),
      ],
      rewards: [
        game('Ingredient:ingredient_ore_malachite', 5),
        game('Ingredient:ingredient_rare_mechanism', 2),
      ],
    },
    {
      id: 'all-husks-breaks-loose',
      name: 'All Husks Breaks Loose',
      objectives: [
        missions(3, ['evacuate-the-shelter', 'fight-the-storm', 'retrieve-the-data'], 22),
      ],
      rewards: [
        game('AccountResource:reagent_c_t02', 10),
        game('AccountResource:schematicxp', 9400),
      ],
    },
    {
      id: 'better-safe-than-sorry',
      name: 'Better Safe Than Sorry',
      objectives: [
        missions(3, ['ride-the-lightning', 'fight-the-category-2-storm', 'repair-the-shelter'], 22),
      ],
      rewards: [
        game('AccountResource:reagent_alteration_generic', 200),
        game('AccountResource:schematicxp', 9400),
      ],
    },
    {
      id: 'no-pain-no-gain',
      name: 'No Pain, No Gain',
      objectives: [
        missions(2, ['deliver-the-bomb', 'retrieve-the-data', 'evacuate-the-shelter'], 22),
      ],
      rewards: [
        game('AccountResource:eventcurrency_scaling', 150),
        game('AccountResource:peoplexp', 18700),
      ],
    },
    {
      id: 'something-suddenly-came-up',
      name: 'Something Suddenly Came Up',
      objectives: [
        missions(3, ['ride-the-lightning', 'deliver-the-bomb', 'fight-the-category-2-storm'], 22),
      ],
      rewards: [game('AccountResource:voucher_basicpack', 2)],
    },
    {
      id: 'deal-with-it',
      name: 'Deal with It',
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'retrieve-the-data', 'repair-the-shelter'], 22),
      ],
      rewards: [
        game('AccountResource:reagent_evolverarity_r', 45),
        game('AccountResource:schematicxp', 9400),
      ],
    },
    {
      id: 'get-all-worked-up',
      name: 'Get All Worked Up',
      objectives: [
        missions(
          3,
          ['ride-the-lightning', 'evacuate-the-shelter', 'fight-the-category-3-storm'],
          22,
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 18700),
        game('AccountResource:reagent_alteration_upgrade_r', 75),
      ],
    },
    {
      id: 'save-the-teddy-bears',
      name: 'Save the Teddy Bears!',
      objectives: [
        text('Loot 5 Teddy Bears in a 22+ zone', 'Опустошите 5 плюшевых медведей (мощь Бури: 22+)'),
      ],
      rewards: [
        game('AccountResource:peoplexp', 18700),
        game('Hero:hid_outlander_zonepistol_r_t01'),
      ],
    },
    {
      id: 'mission-redux',
      name: 'Mission Redux',
      objectives: [missions(3, ['deliver-the-bomb', 'retrieve-the-data', 'fight-the-storm'], 22)],
      rewards: [game('AccountResource:reagent_c_t02', 10)],
    },
    {
      id: 'a-call-to-action',
      name: 'A Call to Action!',
      objectives: [
        missions(3, ['repair-the-shelter', 'fight-the-category-2-storm', 'ride-the-lightning'], 22),
      ],
      rewards: [
        game('AccountResource:schematicxp', 9400),
        game('CardPack:cardpack_ranged_sniper_r'),
      ],
    },
    {
      id: 'quad-squad',
      name: 'Quad Squad',
      objectives: [missions(1, ['fight-the-category-4-storm'], 24)],
      rewards: [game('AccountResource:voucher_basicpack', 2)],
    },
    {
      id: 'what-is-this-thing',
      name: 'What IS This Thing?',
      objectives: [
        text(
          'Smash 3 Anomalies in successful missions in a 24+ zone',
          'Уничтожьте 3 аномалии в ходе успешно выполненных миссий (мощь Бури: 24+)',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'decamp',
      name: 'Decamp',
      objectives: [
        text(
          'Clear 5 Husk Encampments in successful missions in a 24+ zone',
          'Зачистите 5 порталов мозгляков в ходе успешно выполненных миссий (мощь Бури: 24+)',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 26700),
        game('AccountResource:reagent_evolverarity_vr', 15),
      ],
    },
    {
      id: 'gimme-shelter',
      name: 'Gimme Shelter',
      objectives: [missions(3, ['repair-the-shelter'], 24)],
      rewards: [game('AccountResource:peoplexp', 26700), game('CardPack:cardpack_manager_r')],
    },
    {
      id: 'in-harms-way',
      name: "In Harm's Way",
      objectives: [
        missions(
          3,
          ['fight-the-category-3-storm', 'evacuate-the-shelter', 'fight-the-category-2-storm'],
          24,
        ),
      ],
      rewards: [
        game('AccountResource:reagent_alteration_upgrade_vr', 115),
        game('AccountResource:schematicxp', 10700),
      ],
    },
    {
      id: 'par-for-the-course',
      name: 'Par for the Course',
      objectives: [
        missions(2, ['ride-the-lightning', 'retrieve-the-data', 'deliver-the-bomb'], 24),
      ],
      rewards: [
        game('Ingredient:ingredient_ore_malachite', 5),
        game('Ingredient:ingredient_rare_mechanism', 3),
      ],
    },
    {
      id: 'a-shot-in-the-dark',
      name: 'A Shot in the Dark',
      objectives: [
        missions(2, ['fight-the-storm', 'fight-the-category-2-storm', 'repair-the-shelter'], 24),
      ],
      rewards: [game('AccountResource:peoplexp', 26700), game('AccountResource:reagent_c_t03', 15)],
    },
    {
      id: 'to-husk-in-a-hand-basket',
      name: 'To Husk in a Hand Basket',
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-category-3-storm', 'ride-the-lightning'], 24),
      ],
      rewards: [
        game('AccountResource:reagent_people', 200),
        game('AccountResource:reagent_schematic', 200),
      ],
    },
    {
      id: 'back-to-square-one',
      name: 'Back to Square One',
      objectives: [
        missions(2, ['deliver-the-bomb', 'repair-the-shelter', 'evacuate-the-shelter'], 24),
      ],
      rewards: [
        game('AccountResource:eventcurrency_scaling', 150),
        game('AccountResource:schematicxp', 10700),
      ],
    },
    {
      id: 'mission-critical',
      name: 'Mission Critical',
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'ride-the-lightning', 'retrieve-the-data'], 24),
      ],
      rewards: [game('Ingredient:ingredient_rare_powercell', 3)],
    },
    {
      id: 'raise-the-bar',
      name: 'Raise the Bar',
      objectives: [
        missions(
          3,
          ['repair-the-shelter', 'evacuate-the-shelter', 'fight-the-category-2-storm'],
          24,
        ),
      ],
      rewards: [
        game('AccountResource:reagent_alteration_generic', 200),
        game('AccountResource:schematicxp', 10700),
      ],
    },
    {
      id: 'setting-ground-rules',
      name: 'Setting Ground Rules',
      objectives: [
        missions(2, ['ride-the-lightning', 'fight-the-category-3-storm', 'fight-the-storm'], 24),
      ],
      rewards: [
        game('AccountResource:reagent_evolverarity_vr', 15),
        game('AccountResource:schematicxp', 10700),
      ],
    },
    {
      id: 'bring-it',
      name: 'Bring It',
      objectives: [
        missions(3, ['evacuate-the-shelter', 'deliver-the-bomb', 'fight-the-category-2-storm'], 24),
      ],
      rewards: [game('AccountResource:reagent_c_t02', 15)],
    },
    {
      id: 'bear-down',
      name: 'Bear Down',
      objectives: [
        missions(3, ['deliver-the-bomb', 'repair-the-shelter', 'fight-the-category-3-storm'], 24),
      ],
      rewards: [
        game('AccountResource:peoplexp', 26700),
        game('AccountResource:reagent_alteration_upgrade_vr', 115),
      ],
    },
    {
      id: 'storms-are-brewin',
      name: "Storms Are Brewin'",
      objectives: [missions(2, ['fight-the-category-2-storm'], 24)],
      rewards: [
        game('AccountResource:peoplexp', 26700),
        game('Hero:hid_constructor_hammertank_r_t01'),
      ],
    },
    {
      id: 'help-wanted',
      name: 'Help Wanted!',
      objectives: [
        missions(3, ['evacuate-the-shelter', 'fight-the-storm', 'retrieve-the-data'], 24),
      ],
      rewards: [game('AccountResource:peoplexp', 26700), game('CardPack:cardpack_defender_r')],
    },
    {
      id: 'unexpected-meetings',
      name: 'Unexpected Meetings',
      objectives: [missions(2, ['evacuate-the-survivors'], 26)],
      rewards: [game('AccountResource:peoplexp', 29900), game('Hero:hid_commando_guntough_vr_t01')],
    },
    {
      id: 'goods-and-services',
      name: 'Goods and Services',
      objectives: [
        text(
          'Complete a Refuel the Homebase mission in a zone',
          'Выполните миссию «Дозаправка главной базы» (мощь Бури: )',
        ),
        text(
          'Complete a Deliver the Bomb mission in a zone',
          'Выполните миссию «Доставка бомбы» (мощь Бури: )',
        ),
      ],
      rewards: [game('AccountResource:reagent_alteration_generic', 200)],
    },
    {
      id: 'far-flung',
      name: 'Far Flung',
      objectives: [
        text(
          'Eliminate 20 Mist Monsters in a 26+ zone',
          'Уничтожьте 20 туманных монстров (мощь Бури: 26+)',
        ),
      ],
      rewards: [game('AccountResource:schematicxp', 12000), game('CardPack:cardpack_ranged_vr')],
    },
    {
      id: 'blast-from-the-past',
      name: 'Blast from the Past',
      objectives: [missions(2, ['fight-the-category-4-storm'], 26)],
      rewards: [game('AccountResource:peoplexp', 29900), game('CardPack:cardpack_manager_r')],
    },
    {
      id: 'history-repeats-itself',
      name: 'History Repeats Itself',
      objectives: [
        missions(3, ['retrieve-the-data', 'evacuate-the-shelter', 'ride-the-lightning'], 26),
      ],
      rewards: [game('AccountResource:schematicxp', 12000), game('CardPack:cardpack_melee_vr')],
    },
    {
      id: 'keep-your-eyes-open',
      name: 'Keep Your Eyes Open',
      objectives: [
        missions(
          3,
          ['fight-the-storm', 'fight-the-category-2-storm', 'fight-the-category-3-storm'],
          26,
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 29900), game('CardPack:cardpack_defender_vr')],
    },
    {
      id: 'time-and-again',
      name: 'Time and Again',
      objectives: [
        missions(2, ['retrieve-the-data', 'ride-the-lightning', 'fight-the-category-3-storm'], 26),
      ],
      rewards: [game('AccountResource:schematicxp', 12000), game('CardPack:cardpack_schematic_vr')],
    },
    {
      id: 'go-for-broke',
      name: 'Go for Broke',
      objectives: [missions(3, ['deliver-the-bomb', 'fight-the-storm', 'retrieve-the-data'], 26)],
      rewards: [
        game('AccountResource:reagent_people', 200),
        game('AccountResource:reagent_schematic', 200),
      ],
    },
    {
      id: 'a-necessary-evil',
      name: 'A Necessary Evil',
      objectives: [
        missions(
          3,
          ['evacuate-the-shelter', 'fight-the-category-2-storm', 'fight-the-category-3-storm'],
          26,
        ),
      ],
      rewards: [game('AccountResource:schematicxp', 12000), game('CardPack:cardpack_trap_vr')],
    },
    {
      id: 'business-at-hand',
      name: 'Business at Hand',
      objectives: [
        missions(2, ['ride-the-lightning', 'repair-the-shelter', 'retrieve-the-data'], 26),
      ],
      rewards: [game('AccountResource:peoplexp', 29900), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'tooth-and-nail',
      name: 'Tooth and Nail',
      objectives: [missions(3, ['retrieve-the-data', 'deliver-the-bomb', 'fight-the-storm'], 26)],
      rewards: [game('AccountResource:voucher_basicpack', 2)],
    },
    {
      id: 'live-and-learn',
      name: 'Live and Learn',
      objectives: [
        missions(2, ['repair-the-shelter', 'evacuate-the-shelter', 'ride-the-lightning'], 26),
      ],
      rewards: [game('Ingredient:ingredient_rare_powercell', 4)],
    },
    {
      id: 'up-the-ante',
      name: 'Up the Ante',
      objectives: [
        missions(3, ['fight-the-storm', 'retrieve-the-data', 'fight-the-category-2-storm'], 26),
      ],
      rewards: [game('AccountResource:schematicxp', 12000), game('CardPack:cardpack_melee_vr')],
    },
    {
      id: 'get-to-the-bottom-of-it',
      name: 'Get to the Bottom of It',
      objectives: [
        missions(
          3,
          ['ride-the-lightning', 'evacuate-the-shelter', 'fight-the-category-3-storm'],
          26,
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 29900), game('CardPack:cardpack_manager_r')],
    },
    {
      id: 'haste-makes-waste',
      name: 'Haste Makes Waste',
      objectives: [
        missions(2, ['fight-the-category-2-storm', 'fight-the-storm', 'deliver-the-bomb'], 26),
      ],
      rewards: [game('AccountResource:reagent_c_t03', 5)],
    },
    {
      id: 'safe-cracker',
      name: 'Safe Cracker',
      objectives: [text('Loot 5 Safes in a 26+ zone', 'Опустошите 5 сейфов (мощь Бури: 26+)')],
      rewards: [
        game('AccountResource:peoplexp', 29900),
        game('Hero:hid_outlander_spherefragment_vr_t01'),
      ],
    },
    {
      id: 'all-heroes-are-welcome',
      name: 'All Heroes are Welcome!',
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'ride-the-lightning', 'fight-the-storm'], 26),
      ],
      rewards: [game('AccountResource:peoplexp', 29900), game('CardPack:cardpack_defender_vr')],
    },
    {
      id: 'dangerous-assignments',
      name: 'Dangerous assignments',
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'ride-the-lightning', 'deliver-the-bomb'], 24),
      ],
      rewards: [
        game('AccountResource:schematicxp', 10700),
        game('CardPack:cardpack_ranged_pistol_vr'),
      ],
    },
    {
      id: 'explore-build-and-defend',
      name: 'Explore, Build, and Defend',
      objectives: [
        missions(
          3,
          ['build-the-radar-grid', 'destroy-the-encampments', 'evacuate-the-survivors'],
          24,
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 26700), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'please-stand-up',
      name: 'Please Stand Up...',
      objectives: [
        text(
          'Destroy 2 Mimics in successful missions in a 28+ zone',
          'Уничтожьте 2 мимиков в ходе успешно выполненных миссий (мощь Бури: 28+)',
        ),
      ],
      rewards: [game('AccountResource:schematicxp', 13300), game('CardPack:cardpack_trap_vr')],
    },
    {
      id: 'you-threatening-me',
      name: 'You Threatening Me?',
      objectives: [
        missions(
          3,
          ['fight-the-category-3-storm', 'fight-the-category-2-storm', 'repair-the-shelter'],
          28,
        ),
      ],
      rewards: [
        choice(
          game('CardPack:cardpack_ranged_assault_vr'),
          game('CardPack:cardpack_ranged_shotgun_vr'),
        ),
      ],
    },
    {
      id: 'takers-weepers',
      name: 'Takers Weepers',
      objectives: [
        text(
          'Eliminate 25 Mist Monsters in a 28+ zone',
          'Уничтожьте 25 туманных монстров (мощь Бури: 28+)',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 33200),
        game('Hero:hid_constructor_rushbase_f_vr_t01'),
      ],
    },
    {
      id: 'trololo',
      name: 'Trololo',
      objectives: [
        text(
          'Whack a Troll in a successful mission in a 28+ zone',
          'Прихлопните тролля в ходе успешно выполненной миссии (мощь Бури: 28+)',
        ),
      ],
      rewards: [game('AccountResource:reagent_c_t03', 10)],
    },
    {
      id: 'home-invasion',
      name: 'Home Invasion',
      objectives: [missions(3, ['destroy-the-encampments'], 28)],
      rewards: [game('AccountResource:peoplexp', 33200), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'operation-save-them-all',
      name: 'Operation: Save Them All!',
      objectives: [
        text('Save 10 Survivors', 'Спасите 10 выживших'),
        text('Complete 2 missions in a 28+ zone', 'Выполните 2 миссии (мощь Бури: 28+)'),
      ],
      rewards: [
        game('AccountResource:schematicxp', 13300),
        game('Schematic:sid_floor_health_vr_t01'),
      ],
    },
    {
      id: 'the-road-less-traveled',
      name: 'The Road Less Traveled',
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'repair-the-shelter', 'deliver-the-bomb'], 28),
      ],
      rewards: [game('CardPack:cardpack_hero_commando_vr')],
    },
    {
      id: 'dont-look-back',
      name: "Don't Look Back",
      objectives: [missions(3, ['fight-the-storm', 'ride-the-lightning', 'retrieve-the-data'], 28)],
      rewards: [game('Ingredient:ingredient_rare_powercell', 5)],
    },
    {
      id: 'carry-the-team',
      name: 'Carry the Team',
      objectives: [
        missions(2, ['retrieve-the-data', 'fight-the-category-2-storm', 'ride-the-lightning'], 28),
      ],
      rewards: [game('AccountResource:peoplexp', 33200), game('CardPack:cardpack_manager_r')],
    },
    {
      id: 'grasping-at-straws',
      name: 'Grasping at Straws',
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'evacuate-the-shelter', 'fight-the-storm'], 28),
      ],
      rewards: [game('AccountResource:schematicxp', 13300), game('CardPack:cardpack_ranged_vr')],
    },
    {
      id: 'a-drop-in-the-bucket',
      name: 'A Drop in the Bucket',
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'ride-the-lightning', 'deliver-the-bomb'], 28),
      ],
      rewards: [game('CardPack:cardpack_hero_constructor_vr')],
    },
    {
      id: 'survival-of-the-fittest',
      name: 'Survival of the Fittest',
      objectives: [
        missions(2, ['evacuate-the-shelter', 'retrieve-the-data', 'fight-the-storm'], 28),
      ],
      rewards: [
        game('AccountResource:reagent_people', 200),
        game('AccountResource:reagent_schematic', 200),
      ],
    },
    {
      id: 'the-big-picture',
      name: 'The Big Picture',
      objectives: [
        missions(3, ['ride-the-lightning', 'deliver-the-bomb', 'fight-the-category-2-storm'], 28),
      ],
      rewards: [game('CardPack:cardpack_hero_outlander_vr')],
    },
    {
      id: 'the-husks-dont-stand-a-chance',
      name: "The Husks Don't Stand a Chance!",
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-storm', 'fight-the-category-3-storm'], 28),
      ],
      rewards: [game('AccountResource:voucher_basicpack', 2)],
    },
    {
      id: 'hands-on',
      name: 'Hands On',
      objectives: [
        missions(3, ['evacuate-the-shelter', 'fight-the-category-2-storm', 'deliver-the-bomb'], 28),
      ],
      rewards: [game('CardPack:cardpack_hero_ninja_vr')],
    },
    {
      id: 'second-wind',
      name: 'Second Wind',
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'retrieve-the-data', 'ride-the-lightning'], 28),
      ],
      rewards: [game('AccountResource:peoplexp', 33200), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'twin-blast',
      name: 'Twin Blast',
      objectives: [missions(3, ['fight-the-category-2-storm'], 28)],
      rewards: [
        game('AccountResource:peoplexp', 33200),
        game('Hero:hid_ninja_starsassassin_vr_t01'),
      ],
    },
    {
      id: 'the-storm-rages-on',
      name: 'The Storm Rages On',
      objectives: [missions(3, ['ride-the-lightning', 'deliver-the-bomb', 'fight-the-storm'], 28)],
      rewards: [game('AccountResource:peoplexp', 33200), game('CardPack:cardpack_defender_vr')],
    },
    {
      id: 'turn-on-the-action',
      name: 'Turn on the Action',
      objectives: [
        missions(2, ['deliver-the-bomb', 'retrieve-the-data', 'fight-the-category-2-storm'], 26),
      ],
      rewards: [game('AccountResource:schematicxp', 12000), game('CardPack:cardpack_schematic_vr')],
    },
    {
      id: 'seeking-answers',
      name: 'Seeking Answers',
      objectives: [
        missions(3, ['evacuate-the-shelter', 'fight-the-storm', 'deliver-the-bomb'], 26),
      ],
      rewards: [game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'the-missions-must-go-on',
      name: 'The Missions Must Go On',
      objectives: [
        missions(2, ['deliver-the-bomb', 'repair-the-shelter', 'evacuate-the-shelter'], 30),
      ],
      rewards: [game('AccountResource:schematicxp', 14600), game('CardPack:cardpack_trap_vr')],
    },
    {
      id: 'how-high',
      name: 'How High?',
      objectives: [
        text('Save 15 Survivors', 'Спасите 15 выживших'),
        text('Complete 3 missions in a 30+ zone', 'Выполните 3 миссии (мощь Бури: 30+)'),
      ],
      rewards: [game('AccountResource:peoplexp', 36400), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'falling-down',
      name: 'Falling Down',
      objectives: [
        text(
          'Eliminate 30 Mist Monsters in a 30+ zone',
          'Уничтожьте 30 туманных монстров (мощь Бури: 30+)',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 36400),
        game('CardPack:cardpack_hero_commando_vr'),
      ],
    },
    {
      id: 'need-more-bluglo',
      name: 'Need More BluGlo',
      objectives: [missions(2, ['refuel-the-homebase'], 30)],
      rewards: [game('Ingredient:ingredient_rare_powercell', 5)],
    },
    {
      id: 'revenge-of-the-trolls',
      name: 'Revenge of the Trolls',
      objectives: [
        text(
          'Whack a Troll in a successful mission in a 30+ zone',
          'Прихлопните тролля в ходе успешно выполненной миссии (мощь Бури: 30+)',
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 36400), game('CardPack:cardpack_hero_ninja_vr')],
    },
    {
      id: 'a-disturbance-in-the-valley',
      name: 'A Disturbance in the Valley',
      objectives: [
        text(
          'Smash 3 Anomalies in successful missions in a 30+ zone',
          'Уничтожьте 3 аномалии в ходе успешно выполненных миссий (мощь Бури: 30+)',
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 36400), game('CardPack:cardpack_manager_vr')],
    },
    {
      id: 'leave-no-mission-unfinished',
      name: 'Leave No Mission Unfinished',
      objectives: [
        missions(2, ['fight-the-category-3-storm', 'deliver-the-bomb', 'ride-the-lightning'], 30),
      ],
      rewards: [game('AccountResource:schematicxp', 14600), game('CardPack:cardpack_melee_vr')],
    },
    {
      id: 'cross-the-line',
      name: 'Cross the Line',
      objectives: [
        missions(
          3,
          ['fight-the-storm', 'fight-the-category-2-storm', 'fight-the-category-3-storm'],
          30,
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 36400), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'just-around-the-bend',
      name: 'Just Around the Bend',
      objectives: [
        missions(2, ['evacuate-the-shelter', 'repair-the-shelter', 'ride-the-lightning'], 30),
      ],
      rewards: [game('AccountResource:voucher_basicpack', 2)],
    },
    {
      id: 'trail-by-fire',
      name: 'Trail By Fire',
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'retrieve-the-data', 'deliver-the-bomb'], 30),
      ],
      rewards: [res('hero-xp', 7500), item('hero', { heroClass: 'constructor' })],
    },
    {
      id: 'soup-to-nuts',
      name: 'Soup to Nuts',
      objectives: [
        missions(3, ['fight-the-storm', 'repair-the-shelter', 'ride-the-lightning'], 30),
      ],
      rewards: [game('AccountResource:peoplexp', 36400), game('CardPack:cardpack_manager_vr')],
    },
    {
      id: 'go-against-the-grain',
      name: 'Go Against the Grain',
      objectives: [
        missions(3, ['deliver-the-bomb', 'fight-the-category-2-storm', 'retrieve-the-data'], 30),
      ],
      rewards: [game('AccountResource:schematicxp', 14600), game('CardPack:cardpack_trap_vr')],
    },
    {
      id: 'sounds-like-a-plan',
      name: 'Sounds Like a Plan',
      objectives: [
        missions(
          3,
          ['ride-the-lightning', 'evacuate-the-shelter', 'fight-the-category-3-storm'],
          30,
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 36400), game('CardPack:cardpack_defender_vr')],
    },
    {
      id: 'high-hopes',
      name: 'High Hopes',
      objectives: [
        missions(2, ['retrieve-the-data', 'fight-the-category-2-storm', 'fight-the-storm'], 30),
      ],
      rewards: [
        game('AccountResource:peoplexp', 36400),
        game('CardPack:cardpack_hero_outlander_vr'),
      ],
    },
    {
      id: 'its-now-or-never',
      name: "It's Now or Never",
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'deliver-the-bomb', 'repair-the-shelter'], 30),
      ],
      rewards: [game('AccountResource:schematicxp', 14600), game('CardPack:cardpack_ranged_vr')],
    },
    {
      id: 'the-ends-justifies-the-means',
      name: 'The Ends Justifies the Means',
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'ride-the-lightning', 'fight-the-storm'], 30),
      ],
      rewards: [
        game('AccountResource:reagent_people', 200),
        game('AccountResource:reagent_schematic', 200),
      ],
    },
    {
      id: 'just-one-more-thing',
      name: 'Just One More Thing',
      objectives: [
        missions(
          3,
          ['evacuate-the-shelter', 'fight-the-category-3-storm', 'retrieve-the-data'],
          30,
        ),
      ],
      rewards: [game('AccountResource:schematicxp', 14600), game('CardPack:cardpack_melee_vr')],
    },
    {
      id: 'cut-to-the-chase',
      name: 'Cut to the Chase',
      objectives: [
        missions(3, ['repair-the-shelter', 'retrieve-the-data', 'fight-the-category-2-storm'], 28),
      ],
      rewards: [game('AccountResource:peoplexp', 33200), game('CardPack:cardpack_hero_vr')],
    },
    {
      id: 'desperate-times',
      name: 'Desperate Times',
      objectives: [
        missions(3, ['fight-the-storm', 'ride-the-lightning', 'fight-the-category-3-storm'], 28),
      ],
      rewards: [game('AccountResource:peoplexp', 33200), game('CardPack:cardpack_defender_vr')],
    },
    {
      id: 'special-delivery',
      name: 'Special Delivery',
      objectives: [
        text(
          'Complete 2 Repair the Shelter missions in a zone',
          'Выполните 2 миссии «Ремонт убежища» (мощь Бури: )',
        ),
        text(
          'Complete a Deliver the Bomb mission in a zone',
          'Выполните миссию «Доставка бомбы» (мощь Бури: )',
        ),
      ],
      rewards: [game('CardPack:cardpack_weapon_sr')],
    },
    {
      id: 'critical-objectives',
      name: 'Critical Objectives',
      objectives: [
        missions(3, ['fight-the-storm', 'repair-the-shelter', 'ride-the-lightning'], 30),
      ],
      rewards: [game('CardPack:cardpack_trap_sr')],
    },
    {
      id: 'special-operations',
      name: 'Special Operations',
      objectives: [
        missions(3, ['deliver-the-bomb', 'evacuate-the-shelter', 'fight-the-category-3-storm'], 30),
      ],
      rewards: [game('CardPack:cardpack_worker_sr')],
    },
    {
      id: 'just-cause',
      name: 'Just Cause',
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-storm', 'fight-the-category-2-storm'], 30),
      ],
      rewards: [game('CardPack:cardpack_defender_sr')],
    },
    {
      id: 'the-journey-continues',
      name: 'The Journey Continues',
      objectives: [
        missions(3, ['deliver-the-bomb', 'fight-the-category-3-storm', 'retrieve-the-data'], 30),
      ],
      rewards: [game('CardPack:cardpack_manager_vr')],
    },
    {
      id: 'canny-valley-storm-shield-defense-7',
      name: 'Canny Valley Storm Shield Defense 7',
      objectives: [
        text(
          'Complete Canny Valley Storm Shield Defense 7',
          'Выполните миссию «Оборона щита в Вещей долине #7»',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'canny-valley-storm-shield-defense-8',
      name: 'Canny Valley Storm Shield Defense 8',
      objectives: [
        text(
          'Complete Canny Valley Storm Shield Defense 8',
          'Выполните миссию «Оборона щита в Вещей долине #8»',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'canny-valley-storm-shield-defense-9',
      name: 'Canny Valley Storm Shield Defense 9',
      objectives: [
        text(
          'Complete Canny Valley Storm Shield Defense 9',
          'Выполните миссию «Оборона щита в Вещей долине #9»',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'canny-valley-storm-shield-defense-10',
      name: 'Canny Valley Storm Shield Defense 10',
      objectives: [
        text(
          'Complete Canny Valley Storm Shield Defense 10',
          'Выполните миссию «Оборона щита в Вещей долине #10»',
        ),
      ],
      rewards: [vb(150), unlock('Hero Loadout', 'Раскладка героев')],
    },
    {
      id: 'canny-valley-endurance-defense',
      name: 'Canny Valley Endurance Defense',
      objectives: [
        text(
          'Complete Wave 30 of Endurance Defense in Canny Valley',
          'Отбейте 30-ю волну во время испытания на прочность в Вещей долине',
        ),
      ],
      rewards: [
        game('AccountResource:voucher_cardpack_jackpot'),
        game('CardPack:cardpack_endurancewave30banner_theater03'),
      ],
    },
  ],
  'twine-peaks': [
    {
      id: 'tying-up-loose-ends',
      name: 'Tying Up Loose Ends',
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'deliver-the-bomb', 'repair-the-shelter'], 32),
      ],
      rewards: [
        game('AccountResource:peoplexp', 51000),
        game('Hero:hid_commando_shockdamage_r_t01'),
      ],
    },
    {
      id: 'urgent-engagements',
      name: 'Urgent Engagements',
      objectives: [
        missions(3, ['fight-the-storm', 'fight-the-category-2-storm', 'ride-the-lightning'], 32),
      ],
      rewards: [game('AccountResource:peoplexp', 51000), game('CardPack:cardpack_worker_r')],
    },
    {
      id: 'all-in-a-days-work',
      name: "All in a Day's Work",
      objectives: [
        missions(3, ['ride-the-lightning', 'retrieve-the-data', 'deliver-the-bomb'], 34),
      ],
      rewards: [
        game('AccountResource:peoplexp', 71000),
        game('Hero:hid_outlander_spherefragment_r_t01'),
      ],
    },
    {
      id: 'test-your-mettle',
      name: 'Test Your Mettle',
      objectives: [
        missions(
          3,
          ['fight-the-category-3-storm', 'evacuate-the-shelter', 'repair-the-shelter'],
          34,
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 71000), game('CardPack:cardpack_defender_r')],
    },
    {
      id: 'secure-tomorrow',
      name: 'Secure Tomorrow',
      objectives: [
        missions(3, ['deliver-the-bomb', 'retrieve-the-data', 'ride-the-lightning'], 36),
      ],
      rewards: [game('AccountResource:peoplexp', 80700), game('CardPack:cardpack_defender_vr')],
    },
    {
      id: 'relentless-hunt',
      name: 'Relentless Hunt',
      objectives: [
        missions(
          3,
          ['fight-the-storm', 'fight-the-category-2-storm', 'fight-the-category-3-storm'],
          36,
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 80700),
        game('Hero:hid_commando_gunheadshot_vr_t01'),
      ],
    },
    {
      id: 'doubling-down',
      name: 'Doubling Down',
      objectives: [
        missions(2, ['fight-the-category-3-storm', 'retrieve-the-data', 'ride-the-lightning'], 38),
      ],
      rewards: [game('AccountResource:peoplexp', 90500), game('Hero:hid_ninja_010_f_vr_t01')],
    },
    {
      id: 'at-your-earliest-convenience',
      name: 'At Your Earliest Convenience',
      objectives: [
        missions(3, ['evacuate-the-shelter', 'deliver-the-bomb', 'repair-the-shelter'], 38),
      ],
      rewards: [game('AccountResource:peoplexp', 90500), game('CardPack:cardpack_defender_vr')],
    },
    {
      id: 'time-sensitive',
      name: 'Time Sensitive',
      objectives: [
        missions(
          3,
          ['build-the-radar-grid', 'destroy-the-encampments', 'evacuate-the-survivors'],
          32,
        ),
      ],
      rewards: [game('AccountResource:schematicxp', 20400), game('CardPack:cardpack_melee_r')],
    },
    {
      id: 'threat-level-elevated',
      name: 'Threat Level Elevated',
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-category-2-storm', 'deliver-the-bomb'], 34),
      ],
      rewards: [
        game('AccountResource:schematicxp', 23700),
        game('CardPack:cardpack_ranged_pistol_vr'),
      ],
    },
    {
      id: 'restore-hope',
      name: 'Restore Hope',
      objectives: [
        missions(3, ['repair-the-shelter', 'evacuate-the-shelter', 'fight-the-storm'], 34),
      ],
      rewards: [game('AccountResource:peoplexp', 71000), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'helping-hand',
      name: 'Helping Hand',
      objectives: [
        missions(2, ['ride-the-lightning', 'repair-the-shelter', 'fight-the-category-2-storm'], 36),
      ],
      rewards: [game('AccountResource:peoplexp', 80700), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'every-little-helps',
      name: 'Every Little Helps',
      objectives: [
        missions(3, ['fight-the-storm', 'evacuate-the-shelter', 'retrieve-the-data'], 36),
      ],
      rewards: [game('AccountResource:schematicxp', 26900), game('CardPack:cardpack_schematic_vr')],
    },
    {
      id: 'know-our-enemy',
      name: 'Know Our Enemy',
      objectives: [
        missions(2, ['fight-the-storm', 'ride-the-lightning', 'fight-the-category-3-storm'], 38),
      ],
      rewards: [game('AccountResource:reagent_c_t04', 10)],
    },
    {
      id: 'turn-the-page',
      name: 'Turn the Page',
      objectives: [
        missions(3, ['repair-the-shelter', 'retrieve-the-data', 'fight-the-category-2-storm'], 38),
      ],
      rewards: [game('AccountResource:peoplexp', 90500), game('CardPack:cardpack_defender_vr')],
    },
    {
      id: 'the-quiet-before-the-storm',
      name: 'The Quiet Before the Storm',
      objectives: [
        missions(3, ['retrieve-the-data', 'ride-the-lightning', 'deliver-the-bomb'], 40),
      ],
      rewards: [game('AccountResource:peoplexp', 100200), game('CardPack:cardpack_manager_vr')],
    },
    {
      id: 'day-of-reckoning',
      name: 'Day of Reckoning',
      objectives: [missions(3, ['fight-the-storm', 'repair-the-shelter', 'deliver-the-bomb'], 40)],
      rewards: [game('AccountResource:schematicxp', 33400), game('CardPack:cardpack_weapon_sr')],
    },
    {
      id: 'a-new-horizon',
      name: 'A New Horizon',
      objectives: [
        missions(
          3,
          ['fight-the-category-2-storm', 'evacuate-the-shelter', 'fight-the-category-3-storm'],
          40,
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 100200), game('CardPack:cardpack_hero_sr')],
    },
    {
      id: 'proceed-with-caution',
      name: 'Proceed with Caution!',
      objectives: [
        missions(2, ['fight-the-category-2-storm', 'deliver-the-bomb', 'retrieve-the-data'], 40),
      ],
      rewards: [game('AccountResource:peoplexp', 100200), game('CardPack:cardpack_defender_sr')],
    },
    {
      id: 'the-beginning-of-the-end',
      name: 'The Beginning of the End',
      objectives: [
        missions(3, ['repair-the-shelter', 'fight-the-storm', 'evacuate-the-shelter'], 40),
      ],
      rewards: [game('AccountResource:peoplexp', 100200), game('CardPack:cardpack_worker_sr')],
    },
    {
      id: 'twine-peaks-storm-shield-defense-7',
      name: 'Twine Peaks Storm Shield Defense 7',
      objectives: [
        text(
          'Complete Twine Peaks Storm Shield Defense 7',
          'Выполните миссию «Оборона щита в Линч-Пикс #7»',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'twine-peaks-storm-shield-defense-8',
      name: 'Twine Peaks Storm Shield Defense 8',
      objectives: [
        text(
          'Complete Twine Peaks Storm Shield Defense 8',
          'Выполните миссию «Оборона щита в Линч-Пикс #8»',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'twine-peaks-storm-shield-defense-9',
      name: 'Twine Peaks Storm Shield Defense 9',
      objectives: [
        text(
          'Complete Twine Peaks Storm Shield Defense 9',
          'Выполните миссию «Оборона щита в Линч-Пикс #9»',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'twine-peaks-storm-shield-defense-10',
      name: 'Twine Peaks Storm Shield Defense 10',
      objectives: [
        text(
          'Complete Twine Peaks Storm Shield Defense 10',
          'Выполните миссию «Оборона щита в Линч-Пикс #10»',
        ),
      ],
      rewards: [vb(150), unlock('Hero Loadout', 'Раскладка героев')],
    },
    {
      id: 'twine-peaks-endurance-defense',
      name: 'Twine Peaks Endurance Defense',
      objectives: [
        text(
          'Complete Wave 30 of Endurance Defense in Twine Peaks',
          'Отбейте 30-ю волну во время испытания на прочность в Линч-Пикс',
        ),
      ],
      rewards: [
        game('AccountResource:voucher_cardpack_jackpot'),
        game('CardPack:cardpack_endurancewave30banner_theater04'),
      ],
    },
  ],
  lok: [
    {
      id: 'loks-book-of-monsters-floating-freaks',
      name: 'Lok’s Book of Monsters: Floating Freaks',
      objectives: [
        text(
          'Gather 20 pieces of Shielder data',
          'Соберите 20 фрагментов данных о духах-хранителях',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'loks-monster-smashers',
      name: "Lok's Monster: Smashers",
      objectives: [
        text(
          'Gather 5 pieces of Smasher data in a 7+ zone',
          'Соберите 5 фрагментов данных о громилах (мощь Бури: 7+)',
        ),
      ],
      rewards: [
        game('AccountResource:schematicxp', 1400),
        game('CardPack:cardpack_ranged_assault_r'),
      ],
    },
    {
      id: 'loks-monster-takers',
      name: "Lok's Monster: Takers",
      objectives: [
        text(
          'Gather 5 pieces of Taker data in a 10+ zone',
          'Соберите 5 фрагментов данных о хищниках (мощь Бури: 10+)',
        ),
      ],
      rewards: [game('AccountResource:schematicxp', 1700), game('CardPack:cardpack_melee_sword_r')],
    },
    {
      id: 'loks-monsters-on-blast',
      name: "Lok's Monsters: On Blast!",
      objectives: [
        text(
          'Gather 10 pieces of Blaster enemy data in a 12+ zone',
          'Соберите 10 фрагментов данных о бластерах (мощь Бури: 12+)',
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 4700), game('CardPack:cardpack_worker_r')],
    },
    {
      id: 'loks-monsters-bees',
      name: "Lok's Monsters: Bees!",
      objectives: [
        text(
          'Gather 10 pieces of Bee Lobber enemy data in a 14+ zone',
          'Соберите 10 фрагментов данных о ядовитых кидалах (мощь Бури: 14+)',
        ),
      ],
      rewards: [game('Ingredient:ingredient_rare_powercell', 2)],
    },
    {
      id: 'loks-monsters-flingers',
      name: "Lok's Monsters: Flingers",
      objectives: [
        text(
          'Gather 5 pieces of Flinger enemy data in a 14+ zone',
          'Соберите 5 фрагментов данных о метателях (мощь Бури: 14+)',
        ),
      ],
      rewards: [
        game('Ingredient:ingredient_ore_silver', 5),
        game('Ingredient:ingredient_rare_mechanism', 3),
      ],
    },
    {
      id: 'loks-monsters-lightning',
      name: "Lok's Monsters: Lightning!",
      objectives: [
        text(
          'Gather 10 pieces of Lightning monster data in a 16+ zone',
          'Соберите 10 фрагментов данных об электрических монстрах (мощь Бури: 16+)',
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 11700), game('CardPack:cardpack_worker_r')],
    },
    {
      id: 'loks-monsters-fire-husks',
      name: "Lok's Monsters: Fire Husks",
      objectives: [
        text(
          'Gather 10 pieces of Fire monster data in a 18+ zone',
          'Соберите 10 фрагментов данных об огненных монстрах (мощь Бури: 18+)',
        ),
      ],
      rewards: [
        game('AccountResource:schematicxp', 4900),
        game('CardPack:cardpack_ranged_assault_r'),
      ],
    },
    {
      id: 'loks-monster-husky-elementals',
      name: "Lok's Monster: Husky Elementals",
      objectives: [
        text(
          'Gather 10 pieces of Elemental Husky Husk data in a 20+ zone',
          'Соберите 10 фрагментов данных о стихийных крепышах (мощь Бури: 20+)',
        ),
      ],
      rewards: [game('CardPack:cardpack_ranged_r')],
    },
    {
      id: 'loks-monster-water',
      name: "Lok's Monster: Water",
      objectives: [
        text(
          'Gather 10 pieces of Water monster data in a 20+ zone',
          'Соберите 10 фрагментов данных о водных монстрах (мощь Бури: 20+)',
        ),
      ],
      rewards: [game('CardPack:cardpack_melee_r')],
    },
  ],
  other: [
    {
      id: 'talented-builder',
      name: 'Talented Builder',
      objectives: [text('Build Structures ×500000', 'Постройте сооружения ×500000')],
      rewards: [game('CardPack:cardpack_achievement_banner_talentedbuilder')],
    },
    {
      id: 'go-gnome',
      name: 'Go Gnome!',
      objectives: [text('Destroy Garden Gnomes ×100', 'Уничтожьте садовых гномов ×100')],
      rewards: [game('CardPack:cardpack_achievement_banner_gognome')],
    },
    {
      id: 'world-explorer',
      name: 'World Explorer',
      objectives: [
        text(
          'Fully explore zones in successful missions ×1500',
          'Полностью исследуйте зоны в ходе успешно выполненных миссий. ×1500',
        ),
      ],
      rewards: [game('CardPack:cardpack_achievement_banner_worldexplorer')],
    },
    {
      id: 'unspeakable-horrors',
      name: 'Unspeakable Horrors',
      objectives: [text('Eliminate Mist Monsters ×20000', 'Уничтожьте туманных монстров ×20000')],
      rewards: [game('CardPack:cardpack_achievement_banner_unspeakablehorrors')],
    },
    {
      id: 'loot-legend',
      name: 'Loot Legend',
      objectives: [text('Loot Treasure Chests ×300', 'Опустошите сундуки с сокровищами ×300')],
      rewards: [game('CardPack:cardpack_achievement_banner_lootlegend')],
    },
    {
      id: 'plays-well-with-others',
      name: 'Plays Well with Others',
      objectives: [
        text('Complete Play With Others missions ×1000', 'Выполните совместные миссии. ×1000'),
      ],
      rewards: [game('CardPack:cardpack_achievement_banner_playswellwithothers')],
    },
    {
      id: 'guardian-angel',
      name: 'Guardian Angel',
      objectives: [text('Save Survivors ×10000', 'Спасите выживших ×10000')],
      rewards: [game('CardPack:cardpack_achievement_banner_guardianangel')],
    },
    {
      id: 'collections',
      name: 'Collections',
      objectives: [text('Level Up Your Collection Book ×2', 'Повысьте уровень книги коллекций ×2')],
      rewards: [game('AccountResource:schematicxp', 700)],
    },
    {
      id: 'hero-rarity-upgrade',
      name: 'Hero Rarity Upgrade',
      objectives: [text('Upgrade the Rarity of a Hero', 'Повысьте редкость героя')],
      rewards: [game('AccountResource:reagent_people', 75)],
    },
    {
      id: 'perk-replacement',
      name: 'Perk Replacement',
      objectives: [text('Replace a Perk', 'Замените любое свойство')],
      rewards: [
        game('AccountResource:reagent_alteration_generic', 1200),
        game('AccountResource:reagent_alteration_upgrade_r', 150),
        game('AccountResource:reagent_alteration_upgrade_uc', 100),
        game('AccountResource:reagent_alteration_upgrade_vr', 225),
      ],
    },
    {
      id: 'perk-upgrade',
      name: 'Perk Upgrade',
      objectives: [text('Upgrade a Perk', 'Улучшите любое свойство')],
      rewards: [
        game('AccountResource:reagent_alteration_generic', 1200),
        game('AccountResource:reagent_alteration_upgrade_r', 150),
        game('AccountResource:reagent_alteration_upgrade_sr', 345),
        game('AccountResource:reagent_alteration_upgrade_uc', 100),
        game('AccountResource:reagent_alteration_upgrade_vr', 225),
      ],
    },
    {
      id: 'weapon-enhancement',
      name: 'Weapon Enhancement',
      objectives: [text('Level Up a Weapon', 'Повысьте уровень оружия')],
      rewards: [
        game('Ingredient:ingredient_mechanical_parts_t01', 5),
        game('Ingredient:ingredient_ore_copper', 3),
      ],
    },
    {
      id: 'weapon-trap-evolution',
      name: 'Weapon/Trap Evolution',
      objectives: [
        text('Evolve a Weapon or Trap by 1 Star', 'Развейте оружие или ловушку на 1 звезду'),
      ],
      rewards: [game('AccountResource:reagent_schematic', 75)],
    },
  ],
};

export const CHALLENGES: ChallengeSeries[] = [
  {
    id: 'mission-accomplished',
    name: 'Mission Accomplished!',
    stages: [
      { goal: 3, rewards: [vb(50)] },
      { goal: 3, rewards: [vb(50)] },
      { goal: 4, rewards: [vb(50)] },
      { goal: 4, rewards: [vb(50)] },
      { goal: 5, rewards: [vb(50)] },
      { goal: 5, rewards: [vb(50)] },
      { goal: 6, rewards: [vb(50)] },
      { goal: 6, rewards: [vb(50)] },
      { goal: 7, rewards: [vb(50)] },
      { goal: 7, rewards: [vb(50)] },
      { goal: 8, rewards: [vb(50)] },
      { goal: 8, rewards: [vb(50)] },
      { goal: 9, rewards: [vb(50)] },
      { goal: 9, rewards: [vb(50)] },
      { goal: 10, rewards: [vb(50)] },
      { goal: 10, rewards: [vb(50)] },
      { goal: 11, rewards: [vb(50)] },
      { goal: 11, rewards: [vb(50)] },
      { goal: 12, rewards: [vb(50)] },
      { goal: 12, rewards: [vb(50)] },
    ],
  },
  {
    id: 'hold-the-door',
    name: 'Hold the Door!',
    stages: [
      { goal: 2, rewards: [vb(50)] },
      { goal: 2, rewards: [vb(50)] },
      { goal: 3, rewards: [vb(50)] },
      { goal: 3, rewards: [vb(50)] },
      { goal: 4, rewards: [vb(50)] },
      { goal: 4, rewards: [vb(50)] },
      { goal: 5, rewards: [vb(50)] },
      { goal: 5, rewards: [vb(50)] },
      { goal: 6, rewards: [vb(50)] },
      { goal: 6, rewards: [vb(50)] },
      { goal: 7, rewards: [vb(50)] },
      { goal: 7, rewards: [vb(50)] },
      { goal: 8, rewards: [vb(50)] },
      { goal: 8, rewards: [vb(50)] },
      { goal: 9, rewards: [vb(50)] },
      { goal: 9, rewards: [vb(50)] },
      { goal: 10, rewards: [vb(50)] },
      { goal: 10, rewards: [vb(50)] },
      { goal: 11, rewards: [vb(50)] },
      { goal: 11, rewards: [vb(50)] },
    ],
  },
  {
    id: 'toxic-treasures',
    name: 'Toxic Treasures',
    stages: [
      { goal: 2, rewards: [vb(50)] },
      { goal: 2, rewards: [vb(50)] },
      { goal: 3, rewards: [vb(50)] },
      { goal: 3, rewards: [vb(50)] },
      { goal: 4, rewards: [vb(50)] },
      { goal: 4, rewards: [vb(50)] },
      { goal: 5, rewards: [vb(50)] },
      { goal: 5, rewards: [vb(50)] },
      { goal: 6, rewards: [vb(50)] },
      { goal: 6, rewards: [vb(50)] },
      { goal: 7, rewards: [vb(50)] },
      { goal: 7, rewards: [vb(50)] },
      { goal: 8, rewards: [vb(50)] },
      { goal: 8, rewards: [vb(50)] },
      { goal: 9, rewards: [vb(50)] },
      { goal: 9, rewards: [vb(50)] },
      { goal: 10, rewards: [vb(50)] },
      { goal: 10, rewards: [vb(50)] },
      { goal: 11, rewards: [vb(50)] },
      { goal: 11, rewards: [vb(50)] },
    ],
  },
  {
    id: 'eldritch-abominations',
    name: 'Eldritch Abominations',
    stages: [
      { goal: 5, rewards: [res('active-powercell', 1)] },
      { goal: 10, rewards: [res('active-powercell', 1)] },
      { goal: 15, rewards: [res('active-powercell', 1)] },
      { goal: 20, rewards: [res('active-powercell', 1)] },
      { goal: 25, rewards: [res('active-powercell', 1)] },
      { goal: 30, rewards: [res('active-powercell', 1)] },
      { goal: 35, rewards: [res('active-powercell', 1)] },
      { goal: 40, rewards: [res('active-powercell', 1)] },
      { goal: 45, rewards: [res('active-powercell', 1)] },
      { goal: 50, rewards: [res('active-powercell', 1)] },
      { goal: 55, rewards: [res('active-powercell', 1)] },
      { goal: 60, rewards: [res('active-powercell', 1)] },
      { goal: 65, rewards: [res('active-powercell', 1)] },
      { goal: 70, rewards: [res('active-powercell', 1)] },
      { goal: 75, rewards: [res('active-powercell', 1)] },
      { goal: 80, rewards: [res('active-powercell', 1)] },
      { goal: 85, rewards: [res('active-powercell', 1)] },
      { goal: 90, rewards: [res('active-powercell', 1)] },
      { goal: 95, rewards: [res('active-powercell', 1)] },
      { goal: 100, rewards: [res('active-powercell', 1)] },
    ],
  },
  {
    id: 'leave-no-one-behind',
    name: 'Leave No One Behind',
    stages: [
      { goal: 20, rewards: [res('survivor-xp', 2000), res('bacon', 10)] },
      { goal: 25, rewards: [res('survivor-xp', 2000), res('bacon', 10)] },
      { goal: 30, rewards: [res('survivor-xp', 4000), res('bacon', 10)] },
      { goal: 35, rewards: [res('survivor-xp', 4000), res('bacon', 10)] },
      { goal: 40, rewards: [res('survivor-xp', 6000), res('bacon', 10)] },
      { goal: 45, rewards: [res('survivor-xp', 6000), res('bacon', 10)] },
      { goal: 50, rewards: [res('survivor-xp', 16000), res('bacon', 10)] },
      { goal: 55, rewards: [res('survivor-xp', 16000), res('bacon', 10)] },
      { goal: 60, rewards: [res('survivor-xp', 20000), res('bacon', 10)] },
      { goal: 70, rewards: [res('survivor-xp', 24000), res('bacon', 10)] },
      { goal: 75, rewards: [res('survivor-xp', 24000), res('bacon', 10)] },
      { goal: 80, rewards: [res('survivor-xp', 28000), res('bacon', 10)] },
      { goal: 85, rewards: [res('survivor-xp', 28000), res('bacon', 10)] },
      { goal: 90, rewards: [res('survivor-xp', 30000), res('bacon', 10)] },
      { goal: 95, rewards: [res('survivor-xp', 30000), res('bacon', 10)] },
      { goal: 100, rewards: [res('survivor-xp', 48000), res('bacon', 10)] },
      { goal: 105, rewards: [res('survivor-xp', 48000), res('bacon', 10)] },
      { goal: 110, rewards: [res('survivor-xp', 54000), res('bacon', 10)] },
      { goal: 115, rewards: [res('survivor-xp', 54000), res('bacon', 10)] },
      { goal: 120, rewards: [res('survivor-xp', 54000), res('bacon', 10)] },
    ],
  },
  {
    id: 'defender-training',
    name: 'Defender Training',
    stages: [
      {
        goal: 1,
        objective: text('Level up a Defender', 'Повысьте уровень защитника'),
        rewards: [res('hero-xp', 250)],
      },
      {
        goal: 1,
        objective: text('Evolve a Defender by 1 star', 'Повысьте эволюцию защитника на 1 звезду'),
        rewards: [res('trap-designs', 75)],
      },
    ],
  },
  {
    id: 'hero-training',
    name: 'Hero Training',
    stages: [
      {
        goal: 1,
        objective: text('Level up a Hero', 'Повысьте уровень героя'),
        rewards: [res('schematic-xp', 500)],
      },
      {
        goal: 1,
        objective: text('Evolve a Hero by 1 star', 'Повысьте эволюцию героя на 1 звезду'),
        rewards: [res('training-manual', 75)],
      },
    ],
  },
  {
    id: 'survivor-training',
    name: 'Survivor Training',
    stages: [
      {
        goal: 1,
        objective: text('Level up a Survivor', 'Повысьте уровень выжившего'),
        rewards: [res('survivor-xp', 400)],
      },
      {
        goal: 1,
        objective: text('Evolve a Survivor by 1 star', 'Повысьте эволюцию выжившего на 1 звезду'),
        rewards: [res('training-manual', 75)],
      },
    ],
  },
];
