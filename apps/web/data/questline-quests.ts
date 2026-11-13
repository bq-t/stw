// Quest list and order from the Fortnite wiki (Main Quests, 2026-11-04); rewards and objectives
// come from the game files (43.10) via tools/game-export/apply.mts, which rewrites them here.
// Edit names, icons and PL by hand; re-run apply.mts after a patch instead of editing rewards.
import {
  choice,
  game,
  missions,
  ssd,
  text,
  type QuestlineQuest,
  type ZoneId,
  unlock,
  vb,
} from './questline';

export const QUESTS: Record<ZoneId, QuestlineQuest[]> = {
  stonewood: [
    {
      id: 'stonewood-storm-shield-defense-1',
      name: 'Stonewood Storm Shield Defense 1',
      icon: 'ssd',
      pl: 1,
      ssd: 1,
      objectives: [ssd()],
      rewards: [
        vb(100),
        game('CardPack:cardpack_worker_c', 2),
        game('Hero:hid_constructor_rushbase_uc_t01'),
        game('Schematic:sid_pistol_semiauto_c_ore_t00'),
        game('Schematic:sid_assault_semiauto_c_ore_t00'),
        game('Schematic:sid_floor_spikes_wood_c_t01'),
        game('AccountResource:voucher_basicpack'),
      ],
    },
    {
      id: 'before-and-after-science',
      name: 'Before and After Science',
      icon: 'fight-the-storm',
      pl: 1,
      objectives: [missions(1, ['fight-the-storm'])],
      rewards: [
        game('Ammo:ammodatabulletsmedium', 200),
        game('CardPack:cardpack_trapwalldarts_uc'),
        game('Weapon:wid_sniper_auto_uc_ore_t01'),
        game('CardPack:cardpack_ranged_r'),
        game('Ammo:ammodatabulletslight', 200),
        game('WorldItem:stoneitemdata', 100),
        unlock('Squad: Scouting Party', 'Отряд: разведгруппа'),
        unlock('Pickaxe Upgrade', 'Улучшение кирки'),
      ],
    },
    {
      id: 'ride-the-lightning',
      name: 'Ride the Lightning',
      icon: 'ride-the-lightning',
      pl: 1,
      objectives: [missions(1, ['ride-the-lightning'])],
      rewards: [
        game('Schematic:sid_edged_sword_medium_c_ore_t00'),
        game('Schematic:sid_floor_health_c_t00'),
      ],
    },
    {
      id: 'stonewood-storm-shield-defense-2',
      name: 'Stonewood Storm Shield Defense 2',
      icon: 'ssd',
      pl: 3,
      ssd: 2,
      objectives: [ssd()],
      rewards: [
        vb(100),
        game('CardPack:cardpack_manager_explorer_c'),
        unlock('Hero Team Support 1', '1-й боец поддержки в команде героя'),
        unlock('Scouting Party Lead', 'Командир разведгруппы'),
      ],
    },
    {
      id: 'gimme-three',
      name: 'Gimme Three',
      icon: 'evacuate-the-survivors',
      pl: 3,
      objectives: [text('Save 3 Survivors', 'Спасите 3 выживших')],
      rewards: [
        game('AccountResource:peoplexp', 700),
        game('AccountResource:voucher_cardpack_bronze', 2),
        unlock('Level Up: Heroes', 'Новый уровень: герои'),
      ],
    },
    {
      id: 'retrieve-the-data',
      name: 'Retrieve the Data',
      icon: 'retrieve-the-data',
      pl: 3,
      objectives: [missions(1, ['retrieve-the-data'])],
      rewards: [
        game('AccountResource:schematicxp', 700),
        game('CardPack:cardpack_ranged_uc'),
        game('CardPack:cardpack_trapceilinggas_uc'),
        unlock('Level Up: Trap Schematics', 'Новый уровень: чертежи ловушек'),
        unlock('Level Up: Weapon Schematics', 'Повысить уровень: чертёж оружия'),
      ],
    },
    {
      id: 'stonewood-storm-shield-defense-3',
      name: 'Stonewood Storm Shield Defense 3',
      icon: 'ssd',
      pl: 5,
      ssd: 3,
      objectives: [ssd()],
      rewards: [
        vb(100),
        game('CardPack:cardpack_trap_r'),
        unlock('Scouting Party Slot 3', 'Ячейка 3 разведгруппы'),
        unlock('Adrenaline Rush', 'Прилив адреналина'),
        unlock('Air Strike', 'Бомбардировка'),
      ],
    },
    {
      id: 'audition',
      name: 'Audition',
      icon: 'story',
      pl: 5,
      objectives: [
        text(
          'Collect Research Equipment in a 5+ City, Suburban, or Industrial zone ×5',
          'Соберите научное оборудование в городе, пригороде или промзоне (мощь Бури: 5+) ×5',
        ),
      ],
      rewards: [
        game('Weapon:wid_assault_semiauto_r_ore_t01'),
        game('CardPack:cardpack_ranged_r'),
        game('AccountResource:currency_xrayllama', 100),
      ],
    },
    {
      id: 'build-off',
      name: 'Build Off!',
      icon: 'quest',
      pl: 5,
      objectives: [
        text(
          'Complete the Constructor Build Off mission',
          'Выполните миссию «Строительное состязание конструкторов»',
        ),
      ],
      rewards: [
        game('Ingredient:ingredient_ore_copper', 3),
        game('Ingredient:ingredient_rare_mechanism'),
        game('AccountResource:voucher_basicpack'),
        unlock('Increase Building Upgrade Level', 'Увеличить уровень улучшения постройки'),
        unlock('Hero Team Support 2', '2-й боец поддержки в команде героя'),
      ],
    },
    {
      id: 'rescue-the-survivors',
      name: 'Rescue the Survivors',
      icon: 'evacuate-the-survivors',
      pl: 5,
      objectives: [missions(1, ['evacuate-the-survivors'], 5)],
      rewards: [
        game('AccountResource:peoplexp', 1600),
        game('CardPack:cardpack_defendermelee_c'),
        game('Defender:did_defenderassault_basic_c_t00'),
        game('Weapon:wid_edged_sword_heavy_r_ore_t01'),
        unlock('Level Up: Defenders', 'Новый уровень: защитники'),
        unlock('Mission Defender 1/3', 'Защитник в отряде 1/3'),
      ],
    },
    {
      id: 'stonewood-storm-shield-defense-4',
      name: 'Stonewood Storm Shield Defense 4',
      icon: 'ssd',
      pl: 9,
      ssd: 4,
      objectives: [ssd()],
      rewards: [
        vb(100),
        game('CardPack:cardpack_trap_r'),
        unlock('Hero Team Support 3', '3-й боец поддержки в команде героя'),
        unlock('Squad: Fire Team Alpha', 'Отряд: огневая группа «Альфа»'),
        unlock('Team Perk', 'Командное умение'),
        unlock('Dim Mak', 'Кулак смерти'),
        unlock('Keep Out!!!', 'Держись подальше!'),
        unlock('Long Arm of the Law', 'Длинная рука закона'),
        unlock('Recycling', 'Утилизация'),
      ],
    },
    {
      id: 'mandatory-minimalism',
      name: 'Mandatory Minimalism',
      icon: 'story',
      pl: 9,
      objectives: [
        text(
          'Search Garbage Cans for lost items in a 9+ City, Suburban, or Industrial zone ×5',
          'Обыщите мусорные баки в городе, пригороде или промзоне (мощь Бури: 9+) ×5',
        ),
      ],
      rewards: [
        game('AccountResource:voucher_basicpack'),
        game('CardPack:cardpack_melee_r'),
        game('AccountResource:currency_xrayllama', 200),
        unlock('Recycling and Collection', 'Утилизация и коллекционирование'),
      ],
    },
    {
      id: 'leave-only-footprints',
      name: 'Leave Only Footprints',
      icon: 'destroy-the-encampments',
      pl: 9,
      objectives: [
        text(
          'Clear 4 Husk Encampments in successful missions in a 9+ zone',
          'Зачистите 4 портала мозгляков в ходе успешно выполненных миссий (мощь Бури: 9+)',
        ),
        text('Complete 2 missions in a 9+ zone', 'Выполните 2 миссии (мощь Бури: 9+)'),
      ],
      rewards: [
        game('AccountResource:peoplexp', 2100),
        game('CardPack:cardpack_defendersniper_c'),
        game('Weapon:wid_sniper_auto_vr_ore_t01'),
      ],
    },
    {
      id: 'build-off-2-reinforcement',
      name: 'Build Off 2: Reinforcement',
      icon: 'build',
      pl: 9,
      objectives: [
        text(
          'Build Level 2 Structures in a 9+ zone ×50',
          'Постройте здания 2-го уровня (мощь Бури: 9+) ×50',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 2100),
        game('Hero:hid_constructor_007_uc_t01'),
        unlock('Increase Building Upgrade Level', 'Увеличить уровень улучшения постройки'),
      ],
    },
    {
      id: 'kicking-and-screaming',
      name: 'Kicking and Screaming',
      icon: 'story',
      pl: 9,
      objectives: [
        text(
          'Collect Distress Transmissions in a 9+ City, Suburban, or Industrial zone ×5',
          'Обыщите коробки в городе, пригороде или промзоне (мощь Бури: 9+) ×5',
        ),
      ],
      rewards: [
        game('AccountResource:schematicxp', 1400),
        game('Schematic:sid_floor_health_uc_t01'),
      ],
    },
    {
      id: 'stonewood-storm-shield-defense-5',
      name: 'Stonewood Storm Shield Defense 5',
      icon: 'ssd',
      pl: 15,
      ssd: 5,
      objectives: [ssd()],
      rewards: [
        vb(100),
        game('CardPack:cardpack_worker_r'),
        unlock('Squad: EMT Squad', 'Отряд: отряд военврачей'),
      ],
    },
    {
      id: 'recruit-training',
      name: 'Recruit Training',
      icon: 'exterminate',
      pl: 15,
      objectives: [
        text(
          'Eliminate Husks with Melee Weapons in a 15+ zone in Stonewood ×20',
          'Уничтожьте мозгляков с помощью холодного оружия в Камнелесье (мощь Бури: 15+) ×20',
        ),
        text(
          'Eliminate Husks with Ranged Weapons in a 15+ zone in Stonewood ×20',
          'Уничтожьте мозгляков с помощью стрелкового оружия в Камнелесье (мощь Бури: 15+) ×20',
        ),
        text(
          'Eliminate Husks with Traps in a 15+ zone in Stonewood ×20',
          'Уничтожьте мозгляков с помощью ловушек в Камнелесье (мощь Бури: 15+) ×20',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 2500),
        game('CardPack:cardpack_defendershotgun_c'),
        game('Weapon:wid_shotgun_auto_vr_ore_t01'),
        unlock('Mission Defender 2/3', 'Защитник в отряде 2/3'),
      ],
    },
    {
      id: 'supply-run',
      name: 'Supply Run',
      icon: 'quest',
      pl: 15,
      objectives: [
        text(
          'Recover 4 Supply Crates in a 15+ zone',
          'Найдите 4 ящика с припасами (мощь Бури: 15+)',
        ),
        text('Complete 2 missions in a 15+ zone', 'Выполните 2 миссии (мощь Бури: 15+)'),
      ],
      rewards: [
        game('Weapon:wid_launcher_rocket_vr_ore_t01'),
        game('AccountResource:currency_xrayllama', 300),
        game('Schematic:sid_pistol_firecracker_r_ore_t01'),
      ],
    },
    {
      id: 'horrors-from-the-mist',
      name: 'Horrors from the Mist',
      icon: 'exterminate',
      pl: 15,
      objectives: [
        text(
          'Collect Mist Monster data in a 15+ zone ×5',
          'Соберите данные о перемещении перекати-поле (мощь Бури: 15+) ×5',
        ),
      ],
      rewards: [
        game('Weapon:wid_assault_auto_vr_ore_t01'),
        game('CardPack:cardpack_ranged_r'),
        unlock('Hero Team Support 4', '4-й боец поддержки в команде героя'),
      ],
    },
    {
      id: 'up-in-arms',
      name: 'Up in Arms',
      icon: 'story',
      pl: 15,
      objectives: [
        text(
          'Collect Machine Parts in a 15+ Industrial zone ×7',
          'Собирайте детали механизмов в промзоне (мощь Бури: 15+) ×7',
        ),
      ],
      rewards: [
        game('CardPack:cardpack_worker_r'),
        game('AccountResource:voucher_basicpack', 2),
        unlock('Mission Defender 3/3', 'Защитник в отряде 3/3'),
      ],
    },
    {
      id: 'triangulating-a-circle',
      name: 'Triangulating a Circle',
      icon: 'story',
      pl: 15,
      objectives: [
        text('Deploy Scanners in a 15+ zone ×5', 'Установите сканеры (мощь Бури: 15+) ×5'),
      ],
      rewards: [
        game('Weapon:wid_blunt_hammer_heavy_sr_ore_t01'),
        game('CardPack:cardpack_melee_r'),
      ],
    },
    {
      id: 'stonewood-storm-shield-defense-6',
      name: 'Stonewood Storm Shield Defense 6',
      icon: 'ssd',
      pl: 15,
      ssd: 6,
      objectives: [ssd()],
      rewards: [
        vb(100),
        game('CardPack:cardpack_trap_r'),
        unlock('Squad: Corps of Engineering', 'Отряд: инженерный отряд'),
      ],
    },
    {
      id: 'a-new-direction',
      name: 'A New Direction',
      icon: 'story',
      pl: 15,
      objectives: [
        text(
          'Search Boxes in a 15+ City, Suburban, or Industrial zone ×5',
          'Обыщите коробки в городе, пригороде или промзоне (мощь Бури: 15+) ×5',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 2500),
        game('CardPack:cardpack_manager_uc'),
        game('AccountResource:currency_xrayllama', 400),
        unlock('Level Up: Survivors', 'Новый уровень: выжившие'),
      ],
    },
    {
      id: 'van-or-astro-van',
      name: 'Van or Astro-van?',
      icon: 'launch-the-rocket',
      pl: 15,
      objectives: [missions(1, ['launch-the-rocket'], 15)],
      rewards: [
        game('AccountResource:reagent_c_t01', 20),
        game('Schematic:sid_floor_player_jump_pad'),
        game('Schematic:sid_floor_player_jump_pad_free_direction'),
        unlock('Dirt Bike Slot 1', 'Ячейка мотоцикла 1'),
      ],
    },
  ],
  plankerton: [
    {
      id: 'plankerton-storm-shield-defense-1',
      name: 'Plankerton Storm Shield Defense 1',
      icon: 'ssd',
      ssd: 1,
      objectives: [ssd()],
      rewards: [
        vb(100),
        game('CardPack:cardpack_hero_r'),
        unlock(
          'Increase Building Resource Capacity',
          'Повышение вместимости строительных ресурсов',
        ),
        unlock('2-Star Evolution', 'Развитие до 2 звёзд'),
        unlock('Hero Team Support 5', '5-й боец поддержки в команде героя'),
        unlock('Squad: Gadgeteers', 'Отряд: техники'),
      ],
    },
    {
      id: 'two-swirls',
      name: 'Two Swirls',
      icon: 'fight-the-category-2-storm',
      pl: 19,
      objectives: [missions(1, ['fight-the-category-2-storm'], 19)],
      rewards: [
        game('AccountResource:peoplexp', 4700),
        game('Hero:hid_outlander_punchphase_r_t01'),
      ],
    },
    {
      id: 'no-robot-doctors',
      name: 'No. Robot. Doctors.',
      icon: 'evacuate-the-survivors',
      pl: 19,
      objectives: [missions(1, ['evacuate-the-survivors'], 19)],
      rewards: [game('AccountResource:schematicxp', 3100), game('CardPack:cardpack_melee_r')],
    },
    {
      id: 'cork-that-space-hole',
      name: 'Cork That Space Hole',
      icon: 'ride-the-lightning',
      pl: 19,
      objectives: [missions(1, ['ride-the-lightning'], 19)],
      rewards: [
        game('Ingredient:ingredient_ore_silver', 5),
        game('Ingredient:ingredient_rare_mechanism', 2),
        game('CardPack:cardpack_defender_r'),
      ],
    },
    {
      id: 'while-screaming',
      name: '... While Screaming',
      icon: 'quest',
      pl: 19,
      objectives: [
        text('Find 3 Pop parts in a 19+ zone', 'Добудьте 3 детали для Чпока (мощь Бури: 19+)'),
      ],
      rewards: [game('AccountResource:voucher_basicpack', 2), game('CardPack:cardpack_hero_vr')],
    },
    {
      id: 'rayreadme',
      name: 'Ray.README',
      icon: 'build-the-radar-grid',
      pl: 19,
      objectives: [missions(1, ['build-the-radar-grid'], 19)],
      rewards: [game('AccountResource:schematicxp', 3100), game('CardPack:cardpack_ranged_r')],
    },
    {
      id: 'a-fresh-start',
      name: 'A Fresh Start',
      icon: 'quest',
      pl: 19,
      objectives: [
        text(
          'Fully explore a 19+ zone in a successful mission',
          'Полностью исследуйте зону (мощь Бури: 19+) в ходе успешно выполненной миссии',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 4700),
        game('Hero:hid_constructor_rushbase_r_t01'),
      ],
    },
    {
      id: 'deeply-disturbing-simulations',
      name: 'Deeply Disturbing Simulations',
      icon: 'quest',
      pl: 19,
      objectives: [
        text(
          'Listen for the Vinderman Lab transmissions in a 19+ City, Suburban, or Industrial zone ×7',
          'Прослушайте сообщения лаборатории Виндермана в городе, пригороде или промзоне (мощь Бури: 19+) ×7',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 4700),
        game('CardPack:cardpack_worker_r'),
        game('CardPack:cardpack_manager_r'),
      ],
    },
    {
      id: 'plankerton-storm-shield-defense-2',
      name: 'Plankerton Storm Shield Defense 2',
      icon: 'ssd',
      ssd: 2,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Row Boat Slot 1', 'Ячейка шлюпки 1'),
        unlock('Hero Loadout', 'Раскладка героев'),
        unlock('Squad: Close Assault Squad', 'Отряд: штурмовой отряд'),
        unlock('Perk Recombobulation', 'Изменение свойств'),
      ],
    },
    {
      id: 'six-minutes',
      name: 'Six Minutes',
      icon: 'repair-the-shelter',
      pl: 23,
      objectives: [missions(1, ['repair-the-shelter'], 23)],
      rewards: [game('AccountResource:peoplexp', 8100), game('Hero:hid_commando_grenadegun_r_t01')],
    },
    {
      id: 'lightning-rich-environment',
      name: 'Lightning Rich Environment',
      icon: 'destroy-the-encampments',
      pl: 23,
      objectives: [missions(1, ['destroy-the-encampments'], 23)],
      rewards: [
        choice(game('CardPack:cardpack_melee_scythe_r'), game('CardPack:cardpack_melee_spear_r')),
      ],
    },
    {
      id: 'see-yourself-out',
      name: 'SEE Yourself Out',
      icon: 'quest',
      pl: 23,
      objectives: [
        text(
          'Gather Rift data and place the 3 scanning devices in a 23+ zone',
          'Соберите данные о разломах, установив 3 сканера (мощь Бури: 23+)',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 8100),
        game('CardPack:cardpack_manager_uc'),
        game('CardPack:cardpack_worker_vr'),
      ],
    },
    {
      id: 'clear',
      name: 'Clear!',
      icon: 'quest',
      pl: 23,
      objectives: [
        text(
          'Complete M*E*D*B*O*T in a successful mission in a 23+ zone',
          'Используя МЕДБОТов, спасите выживших в ходе успешно выполненной миссии (мощь Бури: 23+)',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 8100),
        game('AccountResource:reagent_alteration_upgrade_uc', 50),
      ],
    },
    {
      id: 'plankhattan-project',
      name: 'Plankhattan Project',
      icon: 'quest',
      pl: 23,
      objectives: [missions(1, ['refuel-the-homebase'], 23)],
      rewards: [game('AccountResource:peoplexp', 8100), game('CardPack:cardpack_defender_r')],
    },
    {
      id: 'chopped-and-screwed',
      name: 'Chopped and Screwed',
      icon: 'destroy-the-encampments',
      pl: 23,
      objectives: [missions(2, ['destroy-the-encampments'], 23)],
      rewards: [game('AccountResource:schematicxp', 4000), game('CardPack:cardpack_trap_r')],
    },
    {
      id: 'radio-free-plankerton',
      name: 'Radio Free Plankerton',
      icon: 'quest',
      pl: 23,
      objectives: [
        text(
          'Find 5 pieces of broadcasting studio equipment in a 23+ zone',
          'Найдите 5 деталей студийного оборудования для трансляций (мощь Бури: 23+)',
        ),
      ],
      rewards: [game('AccountResource:schematicxp', 4000), game('CardPack:cardpack_ranged_r')],
    },
    {
      id: 'plankerton-storm-shield-defense-3',
      name: 'Plankerton Storm Shield Defense 3',
      icon: 'ssd',
      ssd: 3,
      objectives: [ssd()],
      rewards: [
        vb(100),
        game('CardPack:cardpack_hero_sr'),
        unlock('Dirt Bike Slot 2', 'Ячейка мотоцикла 2'),
        unlock('Prop Plane Slot 1', 'Ячейка винтового самолёта 1'),
        unlock('Row Boat Slot 2', 'Ячейка шлюпки 2'),
        unlock('Squad: Training Team', 'Отряд: Тренировочная команда'),
      ],
    },
    {
      id: 'air-quotes',
      name: 'Air Quotes',
      icon: 'quest',
      pl: 28,
      objectives: [
        text('Complete a Storm Chest in a 28+ zone', 'Выполните «Сундук Бури» (мощь Бури: 28+)'),
      ],
      rewards: [game('AccountResource:peoplexp', 9900), game('Hero:hid_ninja_slashtail_r_t01')],
    },
    {
      id: 'rifty-business',
      name: 'Rifty Business',
      icon: 'deliver-the-bomb',
      pl: 28,
      objectives: [missions(1, ['deliver-the-bomb'], 28)],
      rewards: [
        game('AccountResource:eventcurrency_scaling', 100),
        game('AccountResource:peoplexp', 9900),
      ],
    },
    {
      id: 'plankies-go-home',
      name: 'Plankies Go Home',
      icon: 'quest',
      pl: 28,
      objectives: [
        text(
          'Smash an Anomaly in a successful mission in a 28+ zone',
          'Уничтожьте аномалию в ходе успешно выполненной миссии (мощь Бури: 28+)',
        ),
      ],
      rewards: [game('AccountResource:voucher_basicpack', 2)],
    },
    {
      id: 'wind-of-change',
      name: 'Wind of Change',
      icon: 'ride-the-lightning',
      pl: 28,
      objectives: [missions(1, ['ride-the-lightning'], 28)],
      rewards: [game('Ingredient:ingredient_rare_powercell', 3)],
    },
    {
      id: 'pump-up-the-volume',
      name: 'Pump Up the Volume',
      icon: 'quest',
      pl: 28,
      objectives: [
        text(
          'Rebuild 2 Survivor Relays in successful missions in a 28+ zone',
          'Почините 2 ретранслятора в ходе успешно выполненных миссий (мощь Бури: 28+)',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 9900),
        game('AccountResource:reagent_evolverarity_r', 30),
      ],
    },
    {
      id: 'no-lost-causes',
      name: 'No Lost Causes',
      icon: 'repair-the-shelter',
      pl: 28,
      objectives: [
        text('Save 9 Survivors', 'Спасите 9 выживших'),
        text(
          'Complete a Repair the Shelter mission in a 28+ zone',
          'Выполните миссию «Ремонт убежища» (мощь Бури: 28+)',
        ),
      ],
      rewards: [
        game('AccountResource:reagent_evolverarity_r', 30),
        game('AccountResource:schematicxp', 4900),
      ],
    },
    {
      id: 'resist',
      name: 'Resist',
      icon: 'quest',
      pl: 28,
      objectives: [
        text(
          'Complete a Play with Others mission in Plankerton',
          'Завершите совместную вылазку в Планкертоне',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 9900),
        game('AccountResource:reagent_alteration_upgrade_uc', 50),
      ],
    },
    {
      id: 'plankerton-storm-shield-defense-4',
      name: 'Plankerton Storm Shield Defense 4',
      icon: 'ssd',
      ssd: 4,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Truck Slot 1', 'Ячейка грузовика 1'),
        unlock('Squad: The Think Tank', 'Отряд: экспертная группа'),
      ],
    },
    {
      id: 'shelter-skelter',
      name: 'Shelter Skelter',
      icon: 'evacuate-the-shelter',
      pl: 34,
      objectives: [missions(1, ['evacuate-the-shelter'], 34)],
      rewards: [
        game('AccountResource:eventcurrency_scaling', 100),
        game('AccountResource:schematicxp', 5900),
      ],
    },
    {
      id: 'from-husk-till-gone',
      name: 'From Husk Till Gone',
      icon: 'exterminate',
      pl: 34,
      objectives: [
        text('Eliminate 500 Husks in a 34+ zone', 'Уничтожьте 500 мозгляков (мощь Бури: 34+)'),
      ],
      rewards: [
        choice(
          game('CardPack:cardpack_ranged_assault_vr'),
          game('CardPack:cardpack_ranged_sniper_vr'),
        ),
      ],
    },
    {
      id: 'durr',
      name: 'Durr',
      icon: 'quest',
      pl: 34,
      objectives: [
        text(
          'Gather 8 containers of food in a 34+ zone',
          'Соберите 8 контейнеров с едой (мощь Бури: 34+)',
        ),
      ],
      rewards: [
        game('AccountResource:reagent_people', 75),
        game('AccountResource:reagent_schematic', 75),
      ],
    },
    {
      id: 'deep-blu-somethings',
      name: 'Deep Blu Somethings',
      icon: 'quest',
      pl: 34,
      objectives: [
        text(
          'Activate a Build Pylon in a 34+ zone',
          'Активируйте строительный СГ-пилон (мощь Бури: 34+)',
        ),
        text(
          'Activate a Health Pylon in a 34+ zone',
          'Активируйте медицинский СГ-пилон (мощь Бури: 34+)',
        ),
        text(
          'Activate a Movement Pylon in a 34+ zone',
          'Активируйте атлетический СГ-пилон (мощь Бури: 34+)',
        ),
        text(
          'Activate a Shield Pylon in a 34+ zone',
          'Активируйте защитный СГ-пилон (мощь Бури: 34+)',
        ),
        text(
          'Activate an Energy Pylon in a 34+ zone',
          'Активируйте энергетический СГ-пилон (мощь Бури: 34+)',
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 11700), game('CardPack:cardpack_manager_r')],
    },
    {
      id: 'whats-in-the-box',
      name: "What's in the Box?",
      icon: 'quest',
      pl: 34,
      objectives: [
        text(
          'Loot 3 Treasure Chests in a 34+ zone',
          'Опустошите 3 сундука с сокровищами (мощь Бури: 34+)',
        ),
        text(
          'Eliminate a Mimic in a successful mission in a 34+ zone',
          'Уничтожьте мимика в ходе успешно выполненной миссии (мощь Бури: 34+)',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 11700),
        game('Hero:hid_outlander_zoneharvest_r_t01'),
      ],
    },
    {
      id: 'plankerton-trail',
      name: 'Plankerton Trail',
      icon: 'retrieve-the-data',
      pl: 34,
      objectives: [missions(1, ['retrieve-the-data'], 34)],
      rewards: [game('AccountResource:reagent_c_t02', 5)],
    },
    {
      id: 'sound-off',
      name: 'Sound Off!',
      icon: 'fight-the-category-2-storm',
      pl: 34,
      objectives: [
        missions(1, ['fight-the-storm'], 34),
        missions(1, ['fight-the-category-2-storm'], 34),
      ],
      rewards: [game('AccountResource:peoplexp', 11700), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'slay-misties-for-me',
      name: 'Slay Misties for Me',
      icon: 'exterminate',
      pl: 34,
      objectives: [
        text(
          'Eliminate 20 Mist Monsters in a Plankerton 34+ zone',
          'Уничтожьте 20 туманных монстров в Планкертоне (мощь Бури: 34+)',
        ),
      ],
      rewards: [game('AccountResource:schematicxp', 5900), game('CardPack:cardpack_melee_vr')],
    },
    {
      id: 'smooth-operator',
      name: 'Smooth Operator',
      icon: 'medic',
      pl: 34,
      objectives: [
        text(
          'Gather 4 crates of medical supplies in a 34+ zone',
          'Найдите 4 ящика с медицинскими припасами (мощь Бури: 34+)',
        ),
      ],
      rewards: [game('AccountResource:schematicxp', 5900), game('CardPack:cardpack_ranged_vr')],
    },
    {
      id: 'agape',
      name: 'Agape',
      icon: 'deliver-the-bomb',
      pl: 34,
      objectives: [missions(1, ['deliver-the-bomb'], 34)],
      rewards: [game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'smokey-eye',
      name: 'Smokey Eye',
      icon: 'repair-the-shelter',
      pl: 34,
      objectives: [missions(1, ['repair-the-shelter'], 34)],
      rewards: [game('AccountResource:peoplexp', 11700), game('CardPack:cardpack_defender_vr')],
    },
    {
      id: 'plankerton-storm-shield-defense-5',
      name: 'Plankerton Storm Shield Defense 5',
      icon: 'ssd',
      ssd: 5,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Prop Plane Slot 2', 'Ячейка винтового самолёта 2'),
        unlock(
          'Gadgeteers and Close Assault Squad Slot 3',
          'Ячейка 3 отряда техников и штурмового отряда',
        ),
      ],
    },
    {
      id: 'the-battle-of-plank-harbor',
      name: 'The Battle of Plank Harbor',
      icon: 'fight-the-category-3-storm',
      pl: 40,
      objectives: [
        text(
          'Complete the Liberate Plank Harbor mission',
          'Выполните миссию «Освободите Планк-Харбор»',
        ),
      ],
      rewards: [game('AccountResource:reagent_evolverarity_r', 30)],
    },
    {
      id: 'safe-harbor',
      name: 'Safe Harbor',
      icon: 'evacuate-the-shelter',
      pl: 40,
      objectives: [
        text('Save 15 Survivors', 'Спасите 15 выживших'),
        text(
          'Complete an Evacuate the Shelter mission in a 40+ zone',
          'Выполните миссию «Эвакуация убежища» (мощь Бури: 40+)',
        ),
      ],
      rewards: [game('AccountResource:schematicxp', 6800), game('Schematic:sid_floor_ward_uc_t01')],
    },
    {
      id: 'foo-floater',
      name: 'Foo Floater',
      icon: 'retrieve-the-data',
      pl: 40,
      objectives: [missions(1, ['retrieve-the-data'], 40)],
      rewards: [game('Ingredient:ingredient_rare_powercell', 2)],
    },
    {
      id: 'rogue-balloon',
      name: 'Rogue Balloon',
      icon: 'build-the-radar-grid',
      pl: 40,
      objectives: [
        text(
          'Build 3 Radar Towers in successful missions in a 40+ zone',
          'Постройте 3 радарных вышки в ходе успешно выполненных миссий (мощь Бури: 40+)',
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 13500), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'jinx',
      name: 'Jinx',
      icon: 'ride-the-lightning',
      pl: 40,
      objectives: [missions(1, ['ride-the-lightning'], 40)],
      rewards: [game('AccountResource:voucher_basicpack', 2)],
    },
    {
      id: 'im-probably-dead',
      name: "I'm Probably Dead",
      icon: 'quest',
      pl: 40,
      objectives: [
        text(
          'Complete the Vindertech Research Lab mission',
          'Выполните миссию «Лаборатория «Виндертех»',
        ),
      ],
      rewards: [
        game('AccountResource:eventcurrency_scaling', 100),
        game('AccountResource:schematicxp', 6800),
      ],
    },
    {
      id: 'fight-on',
      name: 'Fight On',
      icon: 'quest',
      pl: 40,
      objectives: [
        text(
          'Rebuild 2 Survivor Relays in successful missions in a 40+ zone',
          'Почините 2 ретранслятора в ходе успешно выполненных миссий (мощь Бури: 40+)',
        ),
      ],
      rewards: [game('AccountResource:reagent_c_t02', 10)],
    },
    {
      id: 'remains-to-be-seen',
      name: 'Remains To Be Seen?',
      icon: 'quest',
      pl: 40,
      objectives: [
        text(
          'Fully explore 2 40+ zones in successful missions',
          'Полностью исследуйте 2 зоны (мощь Бури: 40+) в ходе успешно выполненных миссий',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 13500),
        game('AccountResource:reagent_alteration_upgrade_uc', 50),
      ],
    },
    {
      id: 'prophe-see',
      name: 'Prophe-SEE',
      icon: 'quest',
      pl: 40,
      objectives: [
        text('Deploy 5 SeeBots in a 40+ zone', 'Разместите 5 ВИДИТ-ботов (мощь Бури: 40+)'),
      ],
      rewards: [
        game('AccountResource:reagent_evolverarity_r', 30),
        game('AccountResource:schematicxp', 6800),
      ],
    },
    {
      id: 'liner-notes',
      name: 'Liner Notes',
      icon: 'locate',
      pl: 40,
      objectives: [
        text(
          'Look for Steel Wool album records in a 40+ zone ×5',
          'Найдите альбомы «Стальной шерсти» (мощь Бури: 40+) ×5',
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 13500), game('CardPack:cardpack_manager_r')],
    },
    {
      id: 'encore',
      name: 'Encore',
      icon: 'quest',
      pl: 40,
      objectives: [
        text(
          "Deploy speakers and blast Steel Wool's greatest hits to repel the storm in a 40+ zone ×7",
          'Расставьте колонки и рубаните бессмертными хитами «Стальной шерсти» по наглой Буре (мощь Бури: 40+) ×7',
        ),
      ],
      rewards: [
        game('AccountResource:reagent_people', 75),
        game('AccountResource:reagent_schematic', 75),
      ],
    },
    {
      id: 'steel-icarus',
      name: 'Steel Icarus',
      icon: 'ride-the-lightning',
      pl: 40,
      objectives: [text('Launch Lars beyond the wall of clouds', 'Отправьте Ларса за стену туч')],
      rewards: [game('AccountResource:peoplexp', 13500), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'plankerton-storm-shield-defense-6',
      name: 'Plankerton Storm Shield Defense 6',
      icon: 'ssd',
      ssd: 6,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Dirt Bike Slot 3', 'Ячейка мотоцикла 3'),
        unlock('Prop Plane Slot 3', 'Ячейка винтового самолёта 3'),
        unlock('Row Boat Slot 3', 'Ячейка шлюпки 3'),
        unlock('Truck Slot 2', 'Ячейка грузовика 2'),
        unlock('Hero Loadout', 'Раскладка героев'),
        unlock(
          'Training Team and The Think Tank Slot 3',
          'Ячейка 3 тренировочной и экспертной групп',
        ),
      ],
    },
    {
      id: 'onward-to-canny-valley',
      name: 'Onward to Canny Valley!',
      icon: 'launch-the-rocket',
      objectives: [text('Complete Plank Off!', 'Выполните «Прощай, Планкертон!»')],
      rewards: [
        choice(
          game('CardPack:cardpack_hero_commando_sr'),
          game('CardPack:cardpack_hero_constructor_sr'),
          game('CardPack:cardpack_hero_ninja_sr'),
          game('CardPack:cardpack_hero_outlander_sr'),
        ),
      ],
    },
  ],
  'canny-valley': [
    {
      id: 'canny-valley-storm-shield-defense-1',
      name: 'Canny Valley Storm Shield Defense 1',
      icon: 'ssd',
      ssd: 1,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock(
          'Increase Building Resource Capacity',
          'Повышение вместимости строительных ресурсов',
        ),
        unlock('Scouting Party Slots 4, 5 and 6', 'Ячейки 4, 5 и 6 разведгруппы'),
        unlock('3-Star Evolution', 'Развитие до 3 звёзд'),
        unlock('Speed Boat Slot 1', 'Ячейка моторной лодки 1'),
      ],
    },
    {
      id: 'please-hold',
      name: 'Please Hold',
      icon: 'quest',
      pl: 46,
      objectives: [
        text('Discover Landmark in a 46+ zone', 'Найдите достопримечательность (мощь Бури: 46+)'),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'road-trip',
      name: 'Road Trip',
      icon: 'story',
      pl: 46,
      objectives: [
        text('Visit a diner in a 46+ zone', 'Посетите забегаловку (мощь Бури: 46+)'),
        text('Visit a motel in a 46+ zone', 'Посетите мотель (мощь Бури: 46+)'),
        text('Visit a gas station in a 46+ zone', 'Посетите заправку (мощь Бури: 46+)'),
        text('Visit a truck stop in a 46+ zone', 'Посетите придорожное кафе (мощь Бури: 46+)'),
      ],
      rewards: [game('AccountResource:reagent_alteration_upgrade_r', 75)],
    },
    {
      id: 'v',
      name: 'V',
      icon: 'quest',
      pl: 46,
      objectives: [text('Build a Memorial in a 46+ zone', 'Постройте памятник (мощь Бури: 46+)')],
      rewards: [
        game('AccountResource:schematicxp', 9400),
        choice(game('CardPack:cardpack_melee_vr'), game('CardPack:cardpack_ranged_vr')),
      ],
    },
    {
      id: 'see-you-later',
      name: 'See You Later',
      icon: 'quest',
      pl: 46,
      objectives: [
        text('Update SEE-bot in a 46+ zone ×5', 'Обновите ВИДИТ-бота (мощь Бури: 46+) ×5'),
      ],
      rewards: [game('AccountResource:reagent_evolverarity_r', 45)],
    },
    {
      id: 'what-are-names',
      name: 'What Are Names?',
      icon: 'quest',
      pl: 46,
      objectives: [
        text(
          'Find Survey Equipment in a 46+ zone ×7',
          'Найдите исследовательскую аппаратуру (мощь Бури: 46+) ×7',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'canny-crude',
      name: 'Canny Crude!',
      icon: 'story',
      pl: 46,
      objectives: [
        text('Collect Oil Samples in a 46+ zone ×5', 'Соберите образцы нефти (мощь Бури: 46+) ×5'),
      ],
      rewards: [
        choice(
          game('AccountResource:reagent_c_t01', 20),
          game('AccountResource:reagent_c_t02', 10),
          game('AccountResource:reagent_c_t03', 5),
        ),
      ],
    },
    {
      id: 'the-bones-collector',
      name: 'The Bones Collector',
      icon: 'story',
      pl: 46,
      objectives: [text('Collect Bones in a 46+ zone ×7', 'Соберите кости (мощь Бури: 46+) ×7')],
      rewards: [game('AccountResource:schematicxp', 9400), game('CardPack:cardpack_trap_sr')],
    },
    {
      id: 'ready-to-rock',
      name: 'Ready To Rock',
      icon: 'story',
      pl: 46,
      objectives: [
        text(
          'Gather Rock Samples in a 46+ zone ×17',
          'Соберите образцы камней (мощь Бури: 46+) ×17',
        ),
      ],
      rewards: [game('AccountResource:reagent_alteration_generic', 200)],
    },
    {
      id: 'concept-art',
      name: 'Concept Art',
      icon: 'quest',
      pl: 46,
      objectives: [
        text('Deploy Scanners in a 46+ zone ×5', 'Установите сканеры (мощь Бури: 46+) ×5'),
      ],
      rewards: [
        game('AccountResource:peoplexp', 18700),
        choice(
          game('CardPack:cardpack_hero_commando_vr'),
          game('CardPack:cardpack_hero_constructor_vr'),
          game('CardPack:cardpack_hero_ninja_vr'),
          game('CardPack:cardpack_hero_outlander_vr'),
        ),
      ],
    },
    {
      id: 'canny-valley-storm-shield-defense-2',
      name: 'Canny Valley Storm Shield Defense 2',
      icon: 'ssd',
      ssd: 2,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Fire Team Alpha Slots 4, 5 and 6', 'Ячейки 4, 5 и 6 огневой группы «Альфа»'),
        unlock('Row Boat Slot 4', 'Ячейка шлюпки 4'),
      ],
    },
    {
      id: 'band-probation',
      name: 'Band Probation',
      icon: 'locate',
      pl: 52,
      objectives: [
        text('Find Periscopes in a 52+ zone ×10', 'Найдите перископы (мощь Бури: 52+) ×10'),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'canny-underground',
      name: 'Canny Underground',
      icon: 'story',
      pl: 52,
      objectives: [text('Search Bunkers in a 52+ zone ×3', 'Обыщите бункеры (мощь Бури: 52+) ×3')],
      rewards: [game('AccountResource:reagent_alteration_upgrade_vr', 115)],
    },
    {
      id: 'stalled-out',
      name: 'Stalled Out',
      icon: 'story',
      pl: 52,
      objectives: [
        text('Search Cars in a 52+ zone ×9', 'Осмотрите автомобили (мощь Бури: 52+) ×9'),
      ],
      rewards: [game('AccountResource:reagent_evolverarity_vr', 15)],
    },
    {
      id: 'say-watt',
      name: 'Say Watt?',
      icon: 'story',
      pl: 52,
      objectives: [
        text('Search Servers in a 52+ zone ×6', 'Осмотрите серверы (мощь Бури: 52+) ×6'),
      ],
      rewards: [
        choice(
          game('AccountResource:reagent_c_t01', 20),
          game('AccountResource:reagent_c_t02', 10),
          game('AccountResource:reagent_c_t03', 5),
        ),
      ],
    },
    {
      id: 'the-cyclone-of-your-love',
      name: 'The Cyclone Of Your Love',
      icon: 'locate',
      pl: 52,
      objectives: [
        text('Collect Songbooks in a 52+ zone ×7', 'Соберите сборники песен (мощь Бури: 52+) ×7'),
      ],
      rewards: [game('AccountResource:peoplexp', 26700), game('CardPack:cardpack_worker_sr')],
    },
    {
      id: 'a-harrowing-journey-of-drumming',
      name: 'A Harrowing Journey Of Drumming',
      icon: 'story',
      pl: 52,
      objectives: [
        text(
          'Gather parts from destroyed jukeboxes in a 52+ zone ×10',
          'Собирайте детали из сломанных радиоприёмников (мощь Бури: 52+) ×10',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'its-showtime',
      name: "It's Showtime",
      icon: 'locate',
      pl: 52,
      objectives: [
        text('Find Trail Posts in a 52+ zone ×7', 'Найдите путевые столбы (мощью Бури: 52+) ×7'),
      ],
      rewards: [game('AccountResource:reagent_alteration_generic', 200)],
    },
    {
      id: 'my-dearest-sophie',
      name: 'My Dearest Sophie',
      icon: 'locate',
      pl: 52,
      objectives: [
        text(
          'Find Old Diary Pages in a 52+ zone ×7',
          'Найдите страницы старого дневника (мощь Бури: 52+) ×7',
        ),
      ],
      rewards: [
        game('AccountResource:schematicxp', 10700),
        choice(game('CardPack:cardpack_melee_sr'), game('CardPack:cardpack_ranged_sr')),
      ],
    },
    {
      id: 'just-build',
      name: 'Just Build',
      icon: 'build',
      pl: 52,
      objectives: [
        text('Build Structures in a 52+ zone ×50', 'Постройте сооружения (мощь Бури: 52+). ×50'),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'thar-she-tumbles',
      name: 'Thar She Tumbles',
      icon: 'story',
      pl: 52,
      objectives: [
        text(
          'Collect Tumbleweed Movement Data in a 52+ zone ×10',
          'Соберите данные о перемещении перекати-поле (мощь Бури: 52+) ×10',
        ),
      ],
      rewards: [
        choice(
          game('AccountResource:reagent_c_t01', 20),
          game('AccountResource:reagent_c_t02', 10),
          game('AccountResource:reagent_c_t03', 5),
        ),
      ],
    },
    {
      id: 'gravestone',
      name: 'Gravestone',
      icon: 'quest',
      pl: 52,
      objectives: [
        text(
          'Battle Legendary Gunslinger Husk in a 52+ zone, and explore Gravestone.',
          'Сразитесь с легендарным стрелком-мозгляком (мощь Бури: 52+) и исследуйте Могильник.',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 26700),
        game('Hero:hid_constructor_myth02_sr_t01'),
      ],
    },
    {
      id: 'canny-valley-storm-shield-defense-3',
      name: 'Canny Valley Storm Shield Defense 3',
      icon: 'ssd',
      ssd: 3,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('EMT Squad Slots 4, 5 and 6', 'Ячейки 4, 5 и 6 отряда военврачей'),
        unlock('Speed Boat Slot 2', 'Ячейка моторной лодки 2'),
      ],
    },
    {
      id: 'the-big-picture',
      name: 'The Big Picture',
      icon: 'locate',
      pl: 58,
      objectives: [
        text(
          'Track down weird radio transmissions in a 58+ zone ×5',
          'Отследите странные вызовы по рации (мощь Бури: 58+). ×5',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'blue-skies',
      name: 'Blue Skies',
      icon: 'explore',
      pl: 58,
      objectives: [
        text(
          'Fully explore a 58+ Ghost Town zone in a successful mission',
          'Полностью исследуйте зону города-призрака (мощь Бури: 58+) в ходе успешно выполненной миссии',
        ),
      ],
      rewards: [game('AccountResource:reagent_alteration_upgrade_vr', 115)],
    },
    {
      id: 'celebrate-you-now',
      name: 'Celebrate You Now!',
      icon: 'locate',
      pl: 58,
      objectives: [
        text(
          'Gather pamphlets of spa options in a 58+ zone ×7',
          'Соберите рекламные буклеты санатория (мощь Бури: 58+) ×7',
        ),
      ],
      rewards: [game('AccountResource:reagent_evolverarity_vr', 15)],
    },
    {
      id: 'retreat',
      name: 'Retreat!',
      icon: 'story',
      pl: 58,
      objectives: [
        text(
          'Visit spas in a 58+ Ghost Town zone ×3',
          'Посетите санатории в зоне 58+ города-призрака ×3',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'seventeen',
      name: 'Seventeen',
      icon: 'locate',
      pl: 58,
      objectives: [
        text(
          'Search for coaches in a 58+ Ghost Town zone ×7',
          'Ищите повозки в городе-призраке (мощь Бури: 58+) ×7',
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 29900), game('CardPack:cardpack_worker_sr')],
    },
    {
      id: 'ray-on-the-rooftop',
      name: 'Ray on the Rooftop',
      icon: 'story',
      pl: 58,
      objectives: [
        text(
          'Retrieve listening devices in a 58+ Ghost Town or Thunder Route 99 zone ×15',
          'Найдите подслушивающие устройства в городе-призраке или на Громовой трассе 99 (мощь Бури: 58+) ×15',
        ),
      ],
      rewards: [
        choice(
          game('AccountResource:reagent_c_t01', 20),
          game('AccountResource:reagent_c_t02', 10),
          game('AccountResource:reagent_c_t03', 5),
        ),
      ],
    },
    {
      id: 'midnight-oil',
      name: 'Midnight Oil',
      icon: 'story',
      pl: 58,
      objectives: [
        text(
          'Retrieve oil lanterns in a 58+ zone ×7',
          'Добудьте масляные лампы (мощь Бури: 58+) ×7',
        ),
      ],
      rewards: [game('AccountResource:reagent_alteration_generic', 200)],
    },
    {
      id: 'different-lies',
      name: 'Different Lies',
      icon: 'quest',
      pl: 58,
      objectives: [
        text(
          'Visit outhouses in a 58+ Ghost Town zone ×5',
          'Посетите уличные туалеты в городе-призраке (мощь Бури: 58+) ×5',
        ),
      ],
      rewards: [game('AccountResource:schematicxp', 12000), game('CardPack:cardpack_trap_sr')],
    },
    {
      id: 'automatons-of-olympus',
      name: 'Automatons Of Olympus',
      icon: 'locate',
      pl: 58,
      objectives: [
        text(
          'Find movies and records in a 58+ zone ×9',
          'Найдите фильмы и записи (мощь Бури: 58+) ×9',
        ),
      ],
      rewards: [
        game('AccountResource:peoplexp', 29900),
        choice(
          game('CardPack:cardpack_hero_commando_vr'),
          game('CardPack:cardpack_hero_constructor_vr'),
          game('CardPack:cardpack_hero_ninja_vr'),
          game('CardPack:cardpack_hero_outlander_vr'),
        ),
      ],
    },
    {
      id: 'mercerado',
      name: 'Mercerado!',
      icon: 'story',
      pl: 58,
      objectives: [
        text(
          'Explore forts in a 58+ Ghost Town zone ×3',
          'Исследуйте форты в зоне 58+ города-призрака ×3',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'in-through-the-out-rift',
      name: 'In Through The Out Rift',
      icon: 'quest',
      pl: 58,
      objectives: [
        text('Find Beta Rifts in a 58+ zone ×5', 'Найдите бета-разломы (мощь Бури: 58+) ×5'),
      ],
      rewards: [
        choice(
          game('AccountResource:reagent_c_t01', 20),
          game('AccountResource:reagent_c_t02', 10),
          game('AccountResource:reagent_c_t03', 5),
        ),
      ],
    },
    {
      id: 'canny-valley-storm-shield-defense-4',
      name: 'Canny Valley Storm Shield Defense 4',
      icon: 'ssd',
      ssd: 4,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Corps of Engineering Slots 4, 5 and 6', 'Ячейки 4, 5 и 6 инженерного отряда'),
        unlock('Helicopter Slot 1', 'Ячейка вертолёта 1'),
        unlock('Hero Loadout', 'Раскладка героев'),
      ],
    },
    {
      id: 'lowered-expectations',
      name: 'Lowered Expectations',
      icon: 'story',
      pl: 64,
      objectives: [
        text(
          'Visit stores in a 64+ Ghost Town zone ×5',
          'Посетите магазины в зоне 64+ города-призрака ×5',
        ),
      ],
      rewards: [game('AccountResource:reagent_alteration_upgrade_sr', 150)],
    },
    {
      id: 'eye-candy',
      name: 'Eye Candy',
      icon: 'quest',
      pl: 64,
      objectives: [
        text(
          'Set SEE-Bot traps in a 64+ Ghost Town zone ×5',
          'Посетите ловушки ВИДИТ-бот в зоне 64+ города-призрака ×5',
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 33200), game('CardPack:cardpack_manager_vr')],
    },
    {
      id: 'fool-and-his-gold',
      name: 'Fool And His Gold',
      icon: 'quest',
      pl: 64,
      objectives: [
        text(
          'Deploy auto-gold-sieves in a 64+ Ghost Town zone ×5',
          'Установите автоматические сита для золота в городе-призраке (мощь Бури: 64+) ×5',
        ),
      ],
      rewards: [
        choice(
          game('AccountResource:reagent_c_t01', 20),
          game('AccountResource:reagent_c_t02', 10),
          game('AccountResource:reagent_c_t03', 5),
        ),
      ],
    },
    {
      id: 'el-jefe',
      name: 'El Jefe',
      icon: 'story',
      pl: 64,
      objectives: [
        text(
          'Gather cards in a 64+ Ghost Town zone ×15',
          'Соберите карты в зоне 64+ города-призрака ×15',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'are-we-ready-to-rock',
      name: 'Are We Ready To Rock?',
      icon: 'quest',
      pl: 64,
      objectives: [
        text(
          'Explore Old West Music Halls in a 64+ Ghost Town zone ×5',
          'Посетите концертные залы Дикого Запада в городе-призраке (мощь Бури: 64+) ×5',
        ),
      ],
      rewards: [game('AccountResource:reagent_alteration_generic', 200)],
    },
    {
      id: 'evacuate-immediately',
      name: 'Evacuate Immediately!',
      icon: 'evacuate-the-shelter',
      pl: 64,
      objectives: [missions(1, ['evacuate-the-shelter'], 64)],
      rewards: [
        game('AccountResource:schematicxp', 13300),
        choice(game('CardPack:cardpack_melee_sr'), game('CardPack:cardpack_ranged_sr')),
      ],
    },
    {
      id: 'the-entertainer',
      name: 'The Entertainer',
      icon: 'story',
      pl: 64,
      objectives: [
        text(
          'Gather player piano rolls in a 64+ Ghost Town zone ×5',
          'Собирайте валики для механического пианино в городе-призраке (мощь Бури: 64+) ×5',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'eye-in-the-sky',
      name: 'Eye In The Sky',
      icon: 'quest',
      pl: 64,
      objectives: [
        text('Deploy telescopes in a 64+ zone ×7', 'Установите телескопы (мощь Бури: 64+) ×7'),
      ],
      rewards: [
        choice(
          game('AccountResource:reagent_c_t01', 20),
          game('AccountResource:reagent_c_t02', 10),
          game('AccountResource:reagent_c_t03', 5),
        ),
      ],
    },
    {
      id: 'train-in-vain',
      name: 'Train In Vain',
      icon: 'locate',
      pl: 64,
      objectives: [
        text(
          'Explore train stations in a 64+ Ghost Town zone ×4',
          'Исследуйте вокзалы в городе-призраке (мощь Бури: 64+) ×4',
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 33200), game('Hero:hid_commando_019_sr_t01')],
    },
    {
      id: 'canny-valley-storm-shield-defense-5',
      name: 'Canny Valley Storm Shield Defense 5',
      icon: 'ssd',
      ssd: 5,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock(
          'Scouting Party and Fire Team Alpha Slot 7',
          'Ячейка 7 разведгруппы и огневой группы «Альфа»',
        ),
        unlock('Truck Slot 3', 'Ячейка грузовика 3'),
      ],
    },
    {
      id: 'remote-control',
      name: 'Remote Control',
      icon: 'quest',
      pl: 70,
      objectives: [text('Deploy the probe', 'Запустите зонд')],
      rewards: [game('AccountResource:reagent_alteration_generic', 200)],
    },
    {
      id: 'when-theres-a-will',
      name: "When There's A Will...",
      icon: 'story',
      pl: 70,
      objectives: [
        text(
          'Collect clock parts in a 70+ zone ×35',
          'Собирайте детали часов (мощь Бури: 70+) ×35',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'a-thousand-words',
      name: 'A Thousand Words',
      icon: 'quest',
      pl: 70,
      objectives: [
        text(
          'Collect books for SEE-bot in a 70+ zone ×7',
          'Собирайте книги для ВИДИТ-бота (мощь Бури: 70+) ×7',
        ),
      ],
      rewards: [
        choice(
          game('AccountResource:reagent_c_t01', 20),
          game('AccountResource:reagent_c_t02', 10),
          game('AccountResource:reagent_c_t03', 5),
        ),
      ],
    },
    {
      id: 'x-marks-the-spot',
      name: 'X Marks The Spot',
      icon: 'quest',
      pl: 70,
      objectives: [
        text(
          'Destroy covered wagons in a 70+ Ghost Town zone ×35',
          'Уничтожьте крытые повозки в городе-призраке (мощь Бури: 70+) ×35',
        ),
      ],
      rewards: [
        game('AccountResource:schematicxp', 14600),
        choice(game('CardPack:cardpack_melee_sr'), game('CardPack:cardpack_ranged_sr')),
      ],
    },
    {
      id: 'smashasaurus',
      name: 'Smashasaurus',
      icon: 'story',
      pl: 70,
      objectives: [
        text(
          'Smash Dinosaurs in a 70+ Ghost Town zone ×5',
          'Уничтожайте динозавров в городе-призраке (мощь Бури: 70+) ×5',
        ),
      ],
      rewards: [game('AccountResource:reagent_evolverarity_vr', 15)],
    },
    {
      id: 'fridge-logic',
      name: 'Fridge Logic',
      icon: 'exterminate',
      pl: 70,
      objectives: [
        text(
          'Eliminate Riot Shield Huskies in a 70+ zone ×15',
          'Уничтожьте подавителей (мощь Бури: 70+) ×15',
        ),
      ],
      rewards: [game('AccountResource:reagent_alteration_upgrade_sr', 150)],
    },
    {
      id: 'power-to-the-people',
      name: 'Power To The People',
      icon: 'locate',
      pl: 70,
      objectives: [
        text(
          'Inspect Power Transformers in a 70+ zone ×7',
          'Осмотрите силовые трансформаторы (мощь Бури: 70+) ×7',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'have-you-tried-turning-it-on-and-off-again',
      name: 'Have You Tried Turning It On And Off Again?',
      icon: 'quest',
      pl: 70,
      objectives: [text('Activate the Vinderman AI', 'Активируйте ИИ Виндермана')],
      rewards: [game('AccountResource:peoplexp', 36400), game('CardPack:cardpack_manager_vr')],
    },
    {
      id: 'bandwidth-issues',
      name: 'Bandwidth Issues',
      icon: 'story',
      pl: 70,
      objectives: [
        text(
          'Collect Circuit Boards by destroying servers in a 70+ zone ×18',
          'Собирайте микросхемы, уничтожая серверы (мощь Бури: 70+) ×18',
        ),
      ],
      rewards: [
        choice(
          game('AccountResource:reagent_c_t01', 20),
          game('AccountResource:reagent_c_t02', 10),
          game('AccountResource:reagent_c_t03', 5),
        ),
      ],
    },
    {
      id: 'reverse-tinfoil-hats',
      name: 'Reverse Tinfoil Hats',
      icon: 'quest',
      pl: 70,
      objectives: [
        text('Deploy decoy hats in a 70+ zones ×7', 'Установите шляпы-обманки (мощь Бури: 70+) ×7'),
      ],
      rewards: [
        game('AccountResource:peoplexp', 36400),
        choice(
          game('CardPack:cardpack_hero_commando_vr'),
          game('CardPack:cardpack_hero_constructor_vr'),
          game('CardPack:cardpack_hero_ninja_vr'),
          game('CardPack:cardpack_hero_outlander_vr'),
        ),
      ],
    },
    {
      id: 'comfort-food',
      name: 'Comfort Food',
      icon: 'locate',
      pl: 70,
      objectives: [
        text(
          'Collect junk food in a 70+ Thunder Route 99 or Ghost Town zone ×15',
          'Собирайте нездоровую пищу в городе-призраке или на Громовой трассе 99 (мощь Бури: 70+) ×15',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'signal-strength',
      name: 'Signal Strength',
      icon: 'story',
      pl: 70,
      objectives: [
        text(
          'Search for the source of The Nothing in a 70+ Thunder Route 99 or Ghost Town zone ×7',
          'Ищите источник «Ничего» в городе-призраке или на Громовой трассе 99 (мощь Бури: 70+) ×7',
        ),
      ],
      rewards: [game('AccountResource:reagent_alteration_generic', 200)],
    },
    {
      id: 'cannon-fodder',
      name: 'Cannon Fodder',
      icon: 'locate',
      pl: 70,
      objectives: [
        text(
          'Collect cannons in a 70+ Ghost Town zone ×7',
          'Соберите пушки в городе-призраке (мощь Бури: 70+) ×7',
        ),
      ],
      rewards: [game('AccountResource:reagent_alteration_upgrade_sr', 150)],
    },
    {
      id: 'while-youre-up',
      name: "While You're Up...",
      icon: 'locate',
      pl: 70,
      objectives: [
        text(
          'Collect support beams in a 70+ Arid zone ×20',
          'Собирайте опорные балки в засушливой местности (сложность 70+) ×20',
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: 'a-bonding-experience',
      name: 'A Bonding Experience',
      icon: 'story',
      pl: 70,
      objectives: [
        text(
          'Collect motorcycles in a 70+ Thunder Route 99 zone ×7',
          'Соберите мотоциклы на Громовой трассе 99 (мощь Бури: 70+) ×7',
        ),
      ],
      rewards: [
        game('AccountResource:schematicxp', 14600),
        choice(game('CardPack:cardpack_melee_sr'), game('CardPack:cardpack_ranged_sr')),
      ],
    },
    {
      id: 'excalibur-20',
      name: 'Excalibur 2.0',
      icon: 'story',
      pl: 70,
      objectives: [
        text(
          'Collect Vacuum Parts in a 70+ Thunder Route 99 zone ×18',
          'Найдите детали пылесоса на Громовой трассе 99 (мощь Бури: 70+) ×18',
        ),
      ],
      rewards: [game('Schematic:sid_sniper_shredder_sr_ore_t01')],
    },
    {
      id: 'three-strikes',
      name: 'Three Strikes',
      icon: 'story',
      pl: 70,
      objectives: [
        text('Eliminate minibosses in a 70+ zone ×3', 'Уничтожьте мини-боссов (мощь Бури: 70+) ×3'),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 150)],
    },
    {
      id: '20000-leagues',
      name: '20,000 Leagues',
      icon: 'quest',
      pl: 70,
      objectives: [
        text(
          'Inspect SEA-Bots in a 70+ Ghost Town zone ×7',
          'Осмотрите ВОД-ботов в городе-призраке (мощь Бури: 70+) ×7',
        ),
      ],
      rewards: [
        choice(
          game('AccountResource:reagent_c_t01', 20),
          game('AccountResource:reagent_c_t02', 10),
          game('AccountResource:reagent_c_t03', 5),
        ),
      ],
    },
    {
      id: 'battle-royal',
      name: 'Battle Royal',
      icon: 'quest',
      pl: 70,
      objectives: [text('Enter the Portal', 'Пройдите через портал')],
      rewards: [
        game('AccountResource:reagent_alteration_generic', 250),
        game('AccountResource:reagent_alteration_upgrade_vr', 225),
        game('Hero:hid_outlander_024_sr_t01'),
        choice(
          game('Schematic:sid_assault_scavenger_sr_ore_t01'),
          game('Schematic:sid_edged_sword_hydraulic_sr_ore_t01'),
          game('Schematic:sid_piercing_spear_scavenger_sr_ore_t01'),
          game('Schematic:sid_shotgun_hydraulic_sr_ore_t01'),
        ),
      ],
    },
    {
      id: 'how-i-wonder-what-you-are',
      name: 'How I Wonder What You Are',
      icon: 'quest',
      pl: 70,
      objectives: [
        text('Deploy telescopes in a 70+ zone ×6', 'Установите телескопы (мощь Бури: 70+) ×6'),
      ],
      rewards: [game('AccountResource:reagent_alteration_upgrade_sr', 150)],
    },
    {
      id: 'stand-and-fight',
      name: 'Stand and Fight',
      icon: 'quest',
      pl: 70,
      objectives: [
        text(
          "Find Steel Wool's new demo tape in a 70+ zone",
          'Найдите кассету с новой демозаписью «Стальной шерсти» (мощь Бури: 70+)',
        ),
      ],
      rewards: [
        game('AccountResource:eventcurrency_scaling', 150),
        game('SparksSong:sid_placeholder_745'),
        game('AthenaMusicPack:musicpack_stw001_cannyvalley'),
      ],
    },
    {
      id: 'canny-valley-storm-shield-defense-6',
      name: 'Canny Valley Storm Shield Defense 6',
      icon: 'ssd',
      ssd: 6,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock(
          'EMT Squad and Corps of Engineering Slot 7',
          'Ячейка 7 отряда военврачей и инженерного отряда',
        ),
        unlock('4-Star Evolution', 'Развитие до 4 звёзд'),
        unlock('Speed Boat Slot 3', 'Ячейка моторной лодки 3'),
      ],
    },
    {
      id: 'time-to-blast-off',
      name: 'Time To Blast Off',
      icon: 'launch-the-rocket',
      pl: 70,
      objectives: [text('Complete Blasting Off', 'Выполните задание «Ключ на старт»')],
      rewards: [
        choice(
          game('CardPack:cardpack_hero_commando_sr'),
          game('CardPack:cardpack_hero_constructor_sr'),
          game('CardPack:cardpack_hero_ninja_sr'),
          game('CardPack:cardpack_hero_outlander_sr'),
        ),
      ],
    },
  ],
  'twine-peaks': [
    {
      id: 'twine-peaks-storm-shield-defense-1',
      name: 'Twine Peaks Storm Shield Defense 1',
      icon: 'ssd',
      ssd: 1,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock(
          'Increase Building Resource Capacity',
          'Повышение вместимости строительных ресурсов',
        ),
        unlock('Helicopter Slot 2', 'Ячейка вертолёта 2'),
        unlock('Gadgeteers Slots 4, 5 and 6', 'Ячейки 4, 5 и 6 отряда техников'),
      ],
    },
    {
      id: 'its-time-for-twine',
      name: "It's Time for Twine",
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(
          2,
          ['fight-the-category-2-storm', 'retrieve-the-data', 'evacuate-the-shelter'],
          76,
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 200)],
    },
    {
      id: 'first-things-first',
      name: 'First Things First',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['fight-the-storm', 'ride-the-lightning', 'fight-the-category-3-storm'], 76),
      ],
      rewards: [
        game('AccountResource:reagent_c_t03', 10),
        game('AccountResource:schematicxp', 20400),
      ],
    },
    {
      id: 'want-some-twine-course-ya-do',
      name: 'Want Some Twine? Course Ya Do!',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['ride-the-lightning', 'deliver-the-bomb', 'retrieve-the-data'], 76),
      ],
      rewards: [
        game('Ingredient:ingredient_ore_obsidian', 5),
        game('Ingredient:ingredient_rare_mechanism', 2),
      ],
    },
    {
      id: 'call-the-shots',
      name: 'Call The Shots',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(2, ['repair-the-shelter', 'fight-the-storm', 'fight-the-category-2-storm'], 76),
      ],
      rewards: [
        game('AccountResource:peoplexp', 51000),
        game('AccountResource:reagent_alteration_generic', 200),
      ],
    },
    {
      id: 'take-it-to-the-limit',
      name: 'Take It To The Limit',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['deliver-the-bomb', 'retrieve-the-data', 'evacuate-the-shelter'], 76),
      ],
      rewards: [
        game('AccountResource:eventcurrency_scaling', 200),
        game('AccountResource:peoplexp', 51000),
      ],
    },
    {
      id: 'know-where-you-stand',
      name: 'Know Where You Stand',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['repair-the-shelter', 'ride-the-lightning', 'fight-the-category-3-storm'], 76),
      ],
      rewards: [
        game('AccountResource:reagent_evolverarity_vr', 15),
        game('AccountResource:schematicxp', 20400),
      ],
    },
    {
      id: 'lock-stock-and-barrel',
      name: 'Lock, Stock, And Barrel',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(
          3,
          ['fight-the-category-2-storm', 'retrieve-the-data', 'evacuate-the-shelter'],
          76,
        ),
      ],
      rewards: [game('AccountResource:reagent_c_t03', 10)],
    },
    {
      id: 'hang-in-there',
      name: 'Hang In There',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['repair-the-shelter', 'fight-the-category-2-storm', 'deliver-the-bomb'], 76),
      ],
      rewards: [
        game('AccountResource:peoplexp', 51000),
        game('AccountResource:reagent_alteration_upgrade_vr', 115),
      ],
    },
    {
      id: 'a-long-ways-away',
      name: 'A Long Ways Away',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(
          2,
          ['fight-the-category-3-storm', 'evacuate-the-shelter', 'ride-the-lightning'],
          76,
        ),
      ],
      rewards: [
        game('AccountResource:reagent_alteration_generic', 200),
        game('AccountResource:schematicxp', 20400),
      ],
    },
    {
      id: 'to-tame-a-land',
      name: 'To Tame A Land',
      icon: 'quest',
      pl: 76,
      objectives: [missions(3, ['fight-the-storm', 'retrieve-the-data', 'deliver-the-bomb'], 76)],
      rewards: [
        game('AccountResource:reagent_evolverarity_vr', 15),
        game('AccountResource:schematicxp', 20400),
      ],
    },
    {
      id: 'push-the-envelope',
      name: 'Push The Envelope',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['ride-the-lightning', 'fight-the-storm', 'fight-the-category-2-storm'], 76),
      ],
      rewards: [
        game('AccountResource:eventcurrency_scaling', 200),
        game('AccountResource:peoplexp', 51000),
      ],
    },
    {
      id: 'twist-of-fate',
      name: 'Twist Of Fate',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'repair-the-shelter', 'retrieve-the-data'], 76),
      ],
      rewards: [game('Ingredient:ingredient_rare_powercell', 3)],
    },
    {
      id: 'round-and-round',
      name: 'Round And Round',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['ride-the-lightning', 'evacuate-the-shelter', 'deliver-the-bomb'], 76),
      ],
      rewards: [
        game('AccountResource:reagent_c_t03', 10),
        game('AccountResource:schematicxp', 20400),
      ],
    },
    {
      id: 'glimmer-of-hope',
      name: 'Glimmer Of Hope',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-category-2-storm', 'ride-the-lightning'], 76),
      ],
      rewards: [
        game('AccountResource:reagent_alteration_generic', 200),
        game('AccountResource:schematicxp', 20400),
      ],
    },
    {
      id: 'circle-back',
      name: 'Circle Back',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(2, ['fight-the-category-3-storm', 'deliver-the-bomb', 'evacuate-the-shelter'], 76),
      ],
      rewards: [
        game('AccountResource:reagent_people', 325),
        game('AccountResource:reagent_schematic', 325),
      ],
    },
    {
      id: 'off-and-running',
      name: 'Off And Running',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'ride-the-lightning', 'repair-the-shelter'], 76),
      ],
      rewards: [game('AccountResource:voucher_basicpack', 2)],
    },
    {
      id: 'anything-goes',
      name: 'Anything Goes',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['deliver-the-bomb', 'evacuate-the-shelter', 'fight-the-category-3-storm'], 76),
      ],
      rewards: [
        game('AccountResource:eventcurrency_scaling', 200),
        game('AccountResource:schematicxp', 20400),
      ],
    },
    {
      id: 'you-aint-seen-nothin-yet',
      name: "You Ain't Seen Nothin' Yet",
      icon: 'quest',
      pl: 76,
      objectives: [missions(3, ['fight-the-storm', 'retrieve-the-data', 'ride-the-lightning'], 76)],
      rewards: [
        game('AccountResource:reagent_alteration_upgrade_vr', 115),
        game('AccountResource:schematicxp', 20400),
      ],
    },
    {
      id: 'twine-peaks-storm-shield-defense-2',
      name: 'Twine Peaks Storm Shield Defense 2',
      icon: 'ssd',
      ssd: 2,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Truck Slot 4', 'Ячейка грузовика 4'),
        unlock('Close Assault Squad Slots 4, 5 and 6', 'Ячейки 4, 5 и 6 штурмового отряда'),
      ],
    },
    {
      id: 'running-free',
      name: 'Running Free',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(2, ['evacuate-the-shelter', 'deliver-the-bomb', 'retrieve-the-data'], 82),
      ],
      rewards: [game('AccountResource:peoplexp', 71000), game('CardPack:cardpack_manager_r')],
    },
    {
      id: 'get-over-the-hump',
      name: 'Get Over the Hump',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(
          3,
          ['fight-the-category-2-storm', 'repair-the-shelter', 'fight-the-category-3-storm'],
          82,
        ),
      ],
      rewards: [game('AccountResource:eventcurrency_scaling', 200)],
    },
    {
      id: 'stranger-danger',
      name: 'Stranger Danger',
      icon: 'quest',
      pl: 82,
      objectives: [missions(3, ['ride-the-lightning', 'deliver-the-bomb', 'fight-the-storm'], 82)],
      rewards: [
        game('AccountResource:peoplexp', 71000),
        game('AccountResource:reagent_evolverarity_vr', 15),
      ],
    },
    {
      id: 'time-after-time',
      name: 'Time After Time',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'retrieve-the-data', 'repair-the-shelter'], 82),
      ],
      rewards: [game('AccountResource:voucher_basicpack', 2)],
    },
    {
      id: 'area-defense',
      name: 'Area Defense',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'repair-the-shelter', 'ride-the-lightning'], 82),
      ],
      rewards: [game('AccountResource:reagent_c_t03', 15)],
    },
    {
      id: 'the-tempest',
      name: 'The Tempest',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(
          2,
          ['retrieve-the-data', 'evacuate-the-shelter', 'fight-the-category-2-storm'],
          82,
        ),
      ],
      rewards: [
        game('Ingredient:ingredient_ore_obsidian', 5),
        game('Ingredient:ingredient_rare_mechanism', 3),
      ],
    },
    {
      id: 'do-what-it-takes',
      name: 'Do What It Takes',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['fight-the-storm', 'fight-the-category-3-storm', 'repair-the-shelter'], 82),
      ],
      rewards: [
        game('AccountResource:peoplexp', 71000),
        game('AccountResource:reagent_alteration_generic', 200),
      ],
    },
    {
      id: 'groundhog-day',
      name: 'Groundhog Day',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['ride-the-lightning', 'fight-the-category-2-storm', 'retrieve-the-data'], 82),
      ],
      rewards: [
        game('AccountResource:reagent_people', 325),
        game('AccountResource:reagent_schematic', 325),
      ],
    },
    {
      id: 'give-it-a-whirl',
      name: 'Give It A Whirl',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(2, ['fight-the-storm', 'evacuate-the-shelter', 'deliver-the-bomb'], 82),
      ],
      rewards: [
        game('AccountResource:eventcurrency_scaling', 200),
        game('AccountResource:schematicxp', 23700),
      ],
    },
    {
      id: 'a-no-brainer',
      name: 'A No Brainer',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['repair-the-shelter', 'retrieve-the-data', 'ride-the-lightning'], 82),
      ],
      rewards: [game('Ingredient:ingredient_rare_powercell', 3)],
    },
    {
      id: 'mission-checkpoint',
      name: 'Mission Checkpoint',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(
          3,
          ['fight-the-storm', 'fight-the-category-2-storm', 'fight-the-category-3-storm'],
          82,
        ),
      ],
      rewards: [
        game('AccountResource:reagent_alteration_upgrade_vr', 115),
        game('AccountResource:schematicxp', 23700),
      ],
    },
    {
      id: 'cookie-cutter',
      name: 'Cookie Cutter',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(2, ['deliver-the-bomb', 'evacuate-the-shelter', 'fight-the-category-2-storm'], 82),
      ],
      rewards: [
        game('AccountResource:reagent_c_t03', 15),
        game('AccountResource:schematicxp', 23700),
      ],
    },
    {
      id: 'nothing-else-matters',
      name: 'Nothing Else Matters',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['fight-the-storm', 'fight-the-category-3-storm', 'repair-the-shelter'], 82),
      ],
      rewards: [
        game('AccountResource:reagent_alteration_generic', 200),
        game('AccountResource:schematicxp', 23700),
      ],
    },
    {
      id: 'follow-the-leader',
      name: 'Follow the Leader',
      icon: 'medic',
      pl: 82,
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'retrieve-the-data', 'ride-the-lightning'], 82),
      ],
      rewards: [
        game('AccountResource:peoplexp', 71000),
        game('AccountResource:reagent_alteration_upgrade_vr', 115),
      ],
    },
    {
      id: 'an-uphill-battle',
      name: 'An Uphill Battle',
      icon: 'medic',
      pl: 82,
      objectives: [
        missions(3, ['evacuate-the-shelter', 'fight-the-storm', 'repair-the-shelter'], 82),
      ],
      rewards: [
        game('AccountResource:eventcurrency_scaling', 200),
        game('AccountResource:peoplexp', 71000),
      ],
    },
    {
      id: 'its-not-a-sprint',
      name: "It's Not A Sprint!",
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(2, ['retrieve-the-data', 'deliver-the-bomb', 'fight-the-category-3-storm'], 82),
      ],
      rewards: [
        game('AccountResource:reagent_evolverarity_vr', 15),
        game('AccountResource:schematicxp', 23700),
      ],
    },
    {
      id: 'to-the-victor-go-the-spoils',
      name: 'To the Victor Go the Spoils',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['ride-the-lightning', 'repair-the-shelter', 'evacuate-the-shelter'], 82),
      ],
      rewards: [
        game('AccountResource:reagent_alteration_upgrade_vr', 115),
        game('AccountResource:schematicxp', 23700),
      ],
    },
    {
      id: 'put-it-through-its-paces',
      name: 'Put It Through Its Paces',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(
          3,
          [
            'fight-the-category-2-storm',
            'fight-the-category-3-storm',
            'fight-the-category-4-storm',
          ],
          82,
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 71000), game('CardPack:cardpack_manager_r')],
    },
    {
      id: 'twine-peaks-storm-shield-defense-3',
      name: 'Twine Peaks Storm Shield Defense 3',
      icon: 'ssd',
      ssd: 3,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Speed Boat Slot 4', 'Ячейка моторной лодки 4'),
        unlock('Training Team Slots 4, 5 and 6', 'Ячейки 4, 5 и 6 тренировочной группы'),
      ],
    },
    {
      id: 'defensive-position',
      name: 'Defensive Position',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(2, ['fight-the-category-2-storm', 'repair-the-shelter', 'ride-the-lightning'], 88),
      ],
      rewards: [game('AccountResource:peoplexp', 80700), game('Hero:hid_ninja_smokedimmak_vr_t01')],
    },
    {
      id: 'forever-and-a-day',
      name: 'Forever And A Day',
      icon: 'quest',
      pl: 88,
      objectives: [missions(3, ['fight-the-storm', 'deliver-the-bomb', 'retrieve-the-data'], 88)],
      rewards: [game('AccountResource:reagent_c_t04', 5)],
    },
    {
      id: 'damage-control',
      name: 'Damage Control',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(
          3,
          ['evacuate-the-shelter', 'ride-the-lightning', 'fight-the-category-2-storm'],
          88,
        ),
      ],
      rewards: [game('AccountResource:schematicxp', 26900), game('CardPack:cardpack_ranged_vr')],
    },
    {
      id: 'think-outside-the-box',
      name: 'Think Outside The Box',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(2, ['deliver-the-bomb', 'fight-the-storm', 'fight-the-category-3-storm'], 88),
      ],
      rewards: [game('AccountResource:peoplexp', 80700), game('CardPack:cardpack_manager_r')],
    },
    {
      id: 'civic-duty',
      name: 'Civic Duty',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['fight-the-storm', 'fight-the-category-2-storm', 'retrieve-the-data'], 88),
      ],
      rewards: [game('AccountResource:schematicxp', 26900), game('CardPack:cardpack_melee_vr')],
    },
    {
      id: 'hunker-down',
      name: 'Hunker Down',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['ride-the-lightning', 'fight-the-storm', 'repair-the-shelter'], 88),
      ],
      rewards: [game('AccountResource:peoplexp', 80700), game('CardPack:cardpack_defender_vr')],
    },
    {
      id: 'pick-up-the-pace',
      name: 'Pick Up The Pace',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(2, ['deliver-the-bomb', 'retrieve-the-data', 'fight-the-category-2-storm'], 88),
      ],
      rewards: [game('AccountResource:schematicxp', 26900), game('CardPack:cardpack_schematic_vr')],
    },
    {
      id: 'come-husk-or-high-water',
      name: 'Come Husk Or High Water',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['evacuate-the-shelter', 'repair-the-shelter', 'retrieve-the-data'], 88),
      ],
      rewards: [
        game('AccountResource:reagent_people', 325),
        game('AccountResource:reagent_schematic', 325),
      ],
    },
    {
      id: 'point-of-no-return',
      name: 'Point of No Return',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['ride-the-lightning', 'fight-the-category-3-storm', 'fight-the-storm'], 88),
      ],
      rewards: [game('AccountResource:schematicxp', 26900), game('CardPack:cardpack_trap_vr')],
    },
    {
      id: 'under-the-gun',
      name: 'Under The Gun',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(2, ['fight-the-category-2-storm', 'deliver-the-bomb', 'ride-the-lightning'], 88),
      ],
      rewards: [game('AccountResource:peoplexp', 80700), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'the-extra-mile',
      name: 'The Extra Mile',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['repair-the-shelter', 'evacuate-the-shelter', 'retrieve-the-data'], 88),
      ],
      rewards: [game('AccountResource:voucher_basicpack', 2)],
    },
    {
      id: 'to-the-bitter-end',
      name: 'To The Bitter End',
      icon: 'quest',
      pl: 88,
      objectives: [missions(2, ['deliver-the-bomb', 'ride-the-lightning', 'fight-the-storm'], 88)],
      rewards: [game('Ingredient:ingredient_rare_powercell', 4)],
    },
    {
      id: 'do-or-die',
      name: 'Do Or Die',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['fight-the-storm', 'fight-the-category-3-storm', 'repair-the-shelter'], 88),
      ],
      rewards: [game('AccountResource:schematicxp', 26900), game('CardPack:cardpack_melee_vr')],
    },
    {
      id: 'no-holds-barred',
      name: 'No Holds Barred',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'evacuate-the-shelter', 'deliver-the-bomb'], 88),
      ],
      rewards: [game('AccountResource:peoplexp', 80700), game('CardPack:cardpack_manager_r')],
    },
    {
      id: 'this-means-war',
      name: 'This Means War',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(2, ['repair-the-shelter', 'ride-the-lightning', 'retrieve-the-data'], 88),
      ],
      rewards: [game('AccountResource:peoplexp', 80700), game('CardPack:cardpack_hero_vr')],
    },
    {
      id: 'easy-as-pie',
      name: 'Easy As Pie',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['fight-the-storm', 'evacuate-the-shelter', 'fight-the-category-2-storm'], 88),
      ],
      rewards: [
        game('Ingredient:ingredient_crystal_shadowshard', 8),
        game('Ingredient:ingredient_rare_mechanism', 3),
      ],
    },
    {
      id: 'stay-tuned',
      name: 'Stay Tuned',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(2, ['retrieve-the-data', 'repair-the-shelter', 'fight-the-category-2-storm'], 88),
      ],
      rewards: [game('AccountResource:schematicxp', 26900), game('CardPack:cardpack_schematic_vr')],
    },
    {
      id: 'about-face',
      name: 'About Face',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['deliver-the-bomb', 'fight-the-category-2-storm', 'ride-the-lightning'], 88),
      ],
      rewards: [game('AccountResource:peoplexp', 80700), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'rhyme-or-reason',
      name: 'Rhyme or Reason',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['repair-the-shelter', 'fight-the-storm', 'evacuate-the-shelter'], 88),
      ],
      rewards: [game('AccountResource:peoplexp', 80700), game('Hero:hid_outlander_010_vr_t01')],
    },
    {
      id: 'twine-peaks-storm-shield-defense-4',
      name: 'Twine Peaks Storm Shield Defense 4',
      icon: 'ssd',
      ssd: 4,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('5-Star Evolution', 'Развитие до 5 звёзд'),
        unlock('Helicopter Slot 3', 'Ячейка вертолёта 3'),
        unlock('The Think Tank Slots 4, 5 and 6', 'Ячейки 4, 5 и 6 экспертной группы'),
      ],
    },
    {
      id: 'bite-the-bullet',
      name: 'Bite the Bullet',
      icon: 'quest',
      pl: 94,
      objectives: [missions(2, ['deliver-the-bomb', 'ride-the-lightning', 'fight-the-storm'], 94)],
      rewards: [game('AccountResource:schematicxp', 30200), game('CardPack:cardpack_trap_vr')],
    },
    {
      id: 'fight-fire-with-fire',
      name: 'Fight Fire With Fire',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['retrieve-the-data', 'repair-the-shelter', 'fight-the-category-2-storm'], 94),
      ],
      rewards: [
        choice(
          game('CardPack:cardpack_melee_sword_vr'),
          game('CardPack:cardpack_ranged_pistol_vr'),
        ),
      ],
    },
    {
      id: 'when-it-rains-it-pours',
      name: 'When It Rains, It Pours',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['evacuate-the-shelter', 'deliver-the-bomb', 'repair-the-shelter'], 94),
      ],
      rewards: [
        game('AccountResource:peoplexp', 90500),
        game('CardPack:cardpack_hero_outlander_vr'),
      ],
    },
    {
      id: 'in-the-nick-of-time',
      name: 'In The Nick Of Time',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(2, ['fight-the-storm', 'ride-the-lightning', 'fight-the-category-3-storm'], 94),
      ],
      rewards: [game('AccountResource:reagent_c_t04', 5)],
    },
    {
      id: 'go-your-own-way',
      name: 'Go Your Own Way',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-category-2-storm', 'repair-the-shelter'], 94),
      ],
      rewards: [game('AccountResource:peoplexp', 90500), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'dont-sweat-it',
      name: "Don't Sweat It",
      icon: 'quest',
      pl: 94,
      objectives: [missions(2, ['ride-the-lightning', 'deliver-the-bomb', 'fight-the-storm'], 94)],
      rewards: [game('AccountResource:schematicxp', 30200), game('CardPack:cardpack_schematic_vr')],
    },
    {
      id: 'nerves-of-steel',
      name: 'Nerves of Steel',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(
          3,
          ['fight-the-category-3-storm', 'evacuate-the-shelter', 'retrieve-the-data'],
          94,
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 90500), game('Hero:hid_constructor_008_vr_t01')],
    },
    {
      id: 'rise-and-shine',
      name: 'Rise and Shine',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'ride-the-lightning', 'repair-the-shelter'], 94),
      ],
      rewards: [game('Ingredient:ingredient_rare_powercell', 5)],
    },
    {
      id: 'bragging-rights',
      name: 'Bragging Rights',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(2, ['retrieve-the-data', 'fight-the-category-2-storm', 'deliver-the-bomb'], 94),
      ],
      rewards: [game('AccountResource:schematicxp', 30200), game('CardPack:cardpack_ranged_vr')],
    },
    {
      id: 'over-the-hill',
      name: 'Over the Hill',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(
          2,
          ['repair-the-shelter', 'fight-the-category-2-storm', 'fight-the-category-3-storm'],
          94,
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 90500), game('CardPack:cardpack_manager_vr')],
    },
    {
      id: 'wing-it',
      name: 'Wing It',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['evacuate-the-shelter', 'retrieve-the-data', 'ride-the-lightning'], 94),
      ],
      rewards: [game('AccountResource:peoplexp', 90500), game('CardPack:cardpack_hero_ninja_vr')],
    },
    {
      id: 'play-the-field',
      name: 'Play the Field',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(2, ['fight-the-storm', 'fight-the-category-3-storm', 'deliver-the-bomb'], 94),
      ],
      rewards: [
        game('AccountResource:reagent_people', 325),
        game('AccountResource:reagent_schematic', 325),
      ],
    },
    {
      id: 'even-keel',
      name: 'Even Keel',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['retrieve-the-data', 'repair-the-shelter', 'fight-the-category-2-storm'], 94),
      ],
      rewards: [
        game('AccountResource:peoplexp', 90500),
        game('CardPack:cardpack_hero_commando_vr'),
      ],
    },
    {
      id: 'no-strings-attached',
      name: 'No Strings Attached',
      icon: 'quest',
      pl: 94,
      objectives: [missions(2, ['deliver-the-bomb', 'fight-the-storm', 'ride-the-lightning'], 94)],
      rewards: [game('AccountResource:voucher_basicpack', 2)],
    },
    {
      id: 'stick-to-your-guns',
      name: 'Stick To Your Guns',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['repair-the-shelter', 'retrieve-the-data', 'fight-the-category-2-storm'], 94),
      ],
      rewards: [
        game('AccountResource:peoplexp', 90500),
        game('CardPack:cardpack_hero_constructor_vr'),
      ],
    },
    {
      id: 'weather-the-storm',
      name: 'Weather the Storm',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(
          2,
          ['evacuate-the-shelter', 'ride-the-lightning', 'fight-the-category-3-storm'],
          94,
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 90500), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'the-sky-is-the-limit',
      name: 'The Sky Is The Limit',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'fight-the-storm', 'repair-the-shelter'], 94),
      ],
      rewards: [
        game('Ingredient:ingredient_crystal_shadowshard', 8),
        game('Ingredient:ingredient_rare_mechanism', 4),
      ],
    },
    {
      id: 'draw-the-line',
      name: 'Draw the Line',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['retrieve-the-data', 'ride-the-lightning', 'deliver-the-bomb'], 94),
      ],
      rewards: [game('AccountResource:peoplexp', 90500), game('CardPack:cardpack_manager_vr')],
    },
    {
      id: 'its-not-a-problem-its-opportunity',
      name: "It's Not A Problem, It's Opportunity",
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(2, ['fight-the-category-3-storm', 'evacuate-the-shelter', 'fight-the-storm'], 94),
      ],
      rewards: [game('AccountResource:peoplexp', 90500), game('CardPack:cardpack_defender_vr')],
    },
    {
      id: 'road-to-nowhere',
      name: 'Road to Nowhere',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['ride-the-lightning', 'repair-the-shelter', 'deliver-the-bomb'], 94),
      ],
      rewards: [game('AccountResource:schematicxp', 30200), game('CardPack:cardpack_trap_vr')],
    },
    {
      id: 'twine-peaks-storm-shield-defense-5',
      name: 'Twine Peaks Storm Shield Defense 5',
      icon: 'ssd',
      ssd: 5,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Truck Slot 5', 'Ячейка грузовика 5'),
        unlock(
          'Gadgeteers and Close Assault Squad Slot 7',
          'Ячейка 7 отряда техников и штурмового отряда',
        ),
      ],
    },
    {
      id: 'world-of-trouble',
      name: 'World of Trouble',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['evacuate-the-shelter', 'ride-the-lightning', 'deliver-the-bomb'], 100),
      ],
      rewards: [game('AccountResource:schematicxp', 33400), game('CardPack:cardpack_trap_vr')],
    },
    {
      id: 'greener-pastures',
      name: 'Greener Pastures',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['fight-the-category-3-storm', 'repair-the-shelter', 'retrieve-the-data'], 100),
      ],
      rewards: [game('AccountResource:peoplexp', 100200), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'two-steps-forward-one-step-back',
      name: 'Two Steps Forward, One Step Back',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(
          3,
          ['evacuate-the-shelter', 'fight-the-category-2-storm', 'deliver-the-bomb'],
          100,
        ),
      ],
      rewards: [game('CardPack:cardpack_hero_commando_sr')],
    },
    {
      id: 'here-today-gone-tomorrow',
      name: 'Here Today, Gone Tomorrow',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(
          2,
          ['fight-the-category-3-storm', 'ride-the-lightning', 'repair-the-shelter'],
          100,
        ),
      ],
      rewards: [game('Ingredient:ingredient_rare_powercell', 5)],
    },
    {
      id: 'variety-is-the-spice-of-life',
      name: 'Variety is the Spice of Life',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(3, ['fight-the-storm', 'evacuate-the-shelter', 'deliver-the-bomb'], 100),
      ],
      rewards: [game('CardPack:cardpack_hero_ninja_sr')],
    },
    {
      id: 'bump-in-the-road',
      name: 'Bump in the Road',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['repair-the-shelter', 'retrieve-the-data', 'ride-the-lightning'], 100),
      ],
      rewards: [game('AccountResource:peoplexp', 100200), game('CardPack:cardpack_manager_vr')],
    },
    {
      id: 'tried-and-true',
      name: 'Tried and True',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['deliver-the-bomb', 'fight-the-storm', 'fight-the-category-2-storm'], 100),
      ],
      rewards: [game('AccountResource:schematicxp', 33400), game('CardPack:cardpack_melee_vr')],
    },
    {
      id: 'hope-springs-eternal',
      name: 'Hope Springs Eternal',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(
          3,
          ['ride-the-lightning', 'fight-the-category-3-storm', 'evacuate-the-shelter'],
          100,
        ),
      ],
      rewards: [game('AccountResource:peoplexp', 100200), game('CardPack:cardpack_worker_vr')],
    },
    {
      id: 'so-close-you-can-taste-it',
      name: 'So Close You Can Taste It',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['fight-the-category-2-storm', 'repair-the-shelter', 'deliver-the-bomb'], 100),
      ],
      rewards: [game('AccountResource:voucher_basicpack', 2)],
    },
    {
      id: 'figure-it-out',
      name: 'Figure It Out',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(3, ['evacuate-the-shelter', 'fight-the-storm', 'fight-the-category-3-storm'], 100),
      ],
      rewards: [game('CardPack:cardpack_hero_constructor_sr')],
    },
    {
      id: 'a-snails-pace',
      name: "A Snail's Pace",
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['retrieve-the-data', 'ride-the-lightning', 'fight-the-category-2-storm'], 100),
      ],
      rewards: [game('AccountResource:peoplexp', 100200), game('CardPack:cardpack_manager_vr')],
    },
    {
      id: 'end-over-end',
      name: 'End Over End',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'deliver-the-bomb', 'repair-the-shelter'], 100),
      ],
      rewards: [game('CardPack:cardpack_worker_sr')],
    },
    {
      id: 'nip-it-in-the-bud',
      name: 'Nip It in the Bud',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['fight-the-category-2-storm', 'retrieve-the-data', 'fight-the-storm'], 100),
      ],
      rewards: [game('CardPack:cardpack_defender_sr')],
    },
    {
      id: 'grin-and-bear-it',
      name: 'Grin and Bear It',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['deliver-the-bomb', 'fight-the-category-3-storm', 'repair-the-shelter'], 100),
      ],
      rewards: [game('CardPack:cardpack_hero_outlander_sr')],
    },
    {
      id: 'high-maintenance',
      name: 'High Maintenance',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(3, ['ride-the-lightning', 'retrieve-the-data', 'fight-the-storm'], 100),
      ],
      rewards: [game('CardPack:cardpack_ranged_sr')],
    },
    {
      id: 'to-make-your-mark',
      name: 'To Make Your Mark',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['evacuate-the-shelter', 'deliver-the-bomb', 'repair-the-shelter'], 100),
      ],
      rewards: [
        game('AccountResource:reagent_people', 325),
        game('AccountResource:reagent_schematic', 325),
      ],
    },
    {
      id: 'its-not-over-until-its-over',
      name: "It's Not Over Until It's Over",
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-storm', 'ride-the-lightning'], 100),
      ],
      rewards: [game('CardPack:cardpack_melee_sr')],
    },
    {
      id: 'bottom-line',
      name: 'Bottom Line',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(
          2,
          ['repair-the-shelter', 'fight-the-category-3-storm', 'evacuate-the-shelter'],
          100,
        ),
      ],
      rewards: [
        game('Ingredient:ingredient_crystal_shadowshard', 11),
        game('Ingredient:ingredient_rare_mechanism', 5),
      ],
    },
    {
      id: 'a-last-ditch-effort',
      name: 'A Last Ditch Effort',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'retrieve-the-data', 'deliver-the-bomb'], 100),
      ],
      rewards: [game('CardPack:cardpack_trap_sr')],
    },
    {
      id: 'last-but-not-least',
      name: 'Last, But Not Least',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(3, ['ride-the-lightning', 'fight-the-storm', 'evacuate-the-shelter'], 100),
      ],
      rewards: [game('AccountResource:schematicxp', 33400), game('CardPack:cardpack_schematic_vr')],
    },
    {
      id: 'twine-peaks-storm-shield-defense-6',
      name: 'Twine Peaks Storm Shield Defense 6',
      icon: 'ssd',
      ssd: 6,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Helicopter Slot 4', 'Ячейка вертолёта 4'),
        unlock('Speed Boat Slot 5', 'Ячейка моторной лодки 5'),
        unlock(
          'Training Team and The Think Tank Slot 7',
          'Ячейка 7 тренировочной и экспертной групп',
        ),
      ],
    },
  ],
};
