// Generated from the Fortnite wiki (Main Quests, 2026-11-04), then edited by hand.
// This file is the source of truth now: fix mistakes here, do not regenerate.
import {
  choice,
  item,
  missions,
  res,
  ssd,
  text,
  unlock,
  vb,
  type QuestlineQuest,
  type ZoneId,
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
        item('survivor', { rarity: 'uncommon', n: 2 }),
        item('hero', { name: 'B.A.S.E. Kyle', rarity: 'uncommon' }),
        unlock('Survivor squad: Scouting Party', 'Отряд выживших: Scouting Party'),
      ],
    },
    {
      id: 'before-and-after-science',
      name: 'Before and After Science',
      icon: 'fight-the-storm',
      pl: 1,
      objectives: [missions(1, ['fight-the-storm'])],
      rewards: [
        item('ranged', { rarity: 'rare' }),
        item('trap', { name: 'Wall Darts', rarity: 'uncommon' }),
        item('pickaxe', { name: 'Basic Basher', rarity: 'uncommon' }),
        item('ranged', { name: 'Automatic Sniper', rarity: 'uncommon' }),
        res('medium-bullets', 200),
      ],
    },
    {
      id: 'ride-the-lightning',
      name: 'Ride the Lightning',
      icon: 'ride-the-lightning',
      pl: 1,
      objectives: [missions(1, ['ride-the-lightning'])],
      rewards: [
        item('melee', { name: 'Handmade Ruler Sword', rarity: 'common' }),
        item('trap', { name: 'Healing Pad', rarity: 'common' }),
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
        item('lead-survivor', { name: 'Explorer', rarity: 'uncommon' }),
        item('lead-survivor', { name: 'Scouting Party Lead', rarity: 'uncommon' }),
        unlock('Hero Team Support 1', 'Слот поддержки в наборе героев 1'),
      ],
    },
    {
      id: 'gimme-three',
      name: 'Gimme Three',
      icon: 'evacuate-the-survivors',
      pl: 3,
      objectives: [
        text('Save 3 Survivors in successful missions', 'Спасите 3 выживших в успешных миссиях'),
        text('Complete a mission in a 3+ zone', 'Выполните миссию в зоне 3+'),
      ],
      rewards: [res('hero-xp', 1000), unlock('Level Up: Heroes', 'Прокачка героев')],
    },
    {
      id: 'retrieve-the-data',
      name: 'Retrieve the Data',
      icon: 'retrieve-the-data',
      pl: 3,
      objectives: [missions(1, ['retrieve-the-data'])],
      rewards: [
        item('trap', { name: 'Ceiling Gas Trap', rarity: 'uncommon' }),
        item('ranged', { rarity: 'uncommon' }),
        res('schematic-xp', 1000),
        unlock('Level Up: Weapon Schematics', 'Прокачка чертежей оружия'),
        unlock('Level Up: Trap Schematics', 'Прокачка чертежей ловушек'),
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
        res('upgrade-point', 1),
        item('trap', { rarity: 'rare' }),
        unlock('Survivor squad slots: Scouting Party 3', 'Слоты отряда выживших: Scouting Party 3'),
        unlock('Kevin, The Technologist', 'Кевин, технолог'),
      ],
    },
    {
      id: 'audition',
      name: 'Audition',
      icon: 'story',
      pl: 5,
      objectives: [
        text(
          'Collect Research Equipment in a 5+ City, Suburban or Industrial zone',
          'Соберите исследовательское оборудование в зоне 5+: город, пригород или промзона',
        ),
      ],
      rewards: [
        item('ranged', { name: 'Predator', rarity: 'rare' }),
        res('research-points', 500),
        unlock('Lars, the Scientist', 'Ларс, учёный: исследования'),
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
          'Пройдите миссию «Стройка» за конструктора',
        ),
      ],
      rewards: [
        res('copper-ore', 3),
        res('rotating-gizmo', 1),
        unlock('Hero Team Support 2', 'Слот поддержки в наборе героев 2'),
        unlock('Increase Building Upgrade', 'Новый уровень улучшения построек'),
      ],
    },
    {
      id: 'rescue-the-survivors',
      name: 'Rescue the Survivors',
      icon: 'evacuate-the-survivors',
      pl: 5,
      objectives: [missions(1, ['evacuate-the-survivors'], 5)],
      rewards: [
        item('melee', { name: 'Highlander', rarity: 'rare' }),
        item('trap', { name: 'Defender Post', rarity: 'rare' }),
        item('defender', { name: 'Bruiser', rarity: 'common' }),
        res('hero-xp', 1500),
        unlock('Hero Loadout', 'Новый набор героев'),
        unlock('Level Up: Defenders', 'Прокачка защитников'),
        unlock('Storm Shield Defender 1/5', 'Защитник на щите бури 1/5'),
        unlock('Mission Defender 1/3', 'Защитник в миссиях 1/3'),
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
        unlock('Hero Team Support 3', 'Слот поддержки в наборе героев 3'),
        unlock('Survivor squad: Fire Team Alpha', 'Отряд выживших: Fire Team Alpha'),
        unlock('Team Perks', 'Командные перки'),
      ],
    },
    {
      id: 'mandatory-minimalism',
      name: 'Mandatory Minimalism',
      icon: 'story',
      pl: 9,
      objectives: [
        text(
          'Search Garbage Cans for lost items in a 9+ City, Suburban or Industrial zone',
          'Обыщите мусорные баки в поисках пропавших вещей в зоне 9+: город, пригород или промзона',
        ),
      ],
      rewards: [
        res('mini-llama', 1),
        unlock('Recycling and Collection', 'Переработка и книга коллекций'),
      ],
    },
    {
      id: 'leave-only-footprints',
      name: 'Leave Only Footprints',
      icon: 'destroy-the-encampments',
      pl: 9,
      objectives: [
        text(
          'Clear 4 Encampments in successful missions in a 9+ zone',
          'Уничтожьте 4 лагеря в успешных миссиях в зоне 9+',
        ),
        text('Complete 2 missions in a 9+ zone', 'Выполните 2 миссии в зоне 9+'),
      ],
      rewards: [
        item('ranged', { name: 'Deathwing', rarity: 'epic' }),
        item('defender', { name: 'Sniper', rarity: 'common' }),
        res('hero-xp', 1750),
      ],
    },
    {
      id: 'build-off-2-reinforcement',
      name: 'Build Off 2: Reinforcement',
      icon: 'build',
      pl: 9,
      objectives: [
        text(
          'Build 50 Level 2 structures in successful missions in a 9+ zone',
          'Постройте 50 конструкций 2-го уровня в успешных миссиях в зоне 9+',
        ),
      ],
      rewards: [
        res('hero-xp', 1750),
        item('hero', { name: 'Controller Harper' }),
        unlock('Increase Building Upgrade', 'Новый уровень улучшения построек'),
      ],
    },
    {
      id: 'kicking-and-screaming',
      name: 'Kicking and Screaming',
      icon: 'story',
      pl: 9,
      objectives: [
        text(
          'Collect 5 Distress Transmissions in a 9+ City, Suburban or Industrial zone',
          'Соберите 5 сигналов бедствия в зоне 9+: город, пригород или промзона',
        ),
      ],
      rewards: [
        res('schematic-xp', 2000),
        item('trap', { name: 'Healing Pad', rarity: 'uncommon' }),
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
        item('survivor', { rarity: 'rare' }),
        item('survivor', { rarity: 'uncommon' }),
      ],
    },
    {
      id: 'recruit-training',
      name: 'Recruit Training',
      icon: 'exterminate',
      pl: 15,
      objectives: [
        text(
          'Eliminate 20 Husks with melee weapons in successful missions in a 15+ zone',
          'Уничтожьте 20 хасков оружием ближнего боя в успешных миссиях в зоне 15+',
        ),
        text(
          'Eliminate 20 Husks with ranged weapons in successful missions in a 15+ zone',
          'Уничтожьте 20 хасков огнестрельным оружием в успешных миссиях в зоне 15+',
        ),
        text(
          'Eliminate 20 Husks with traps in successful missions in a 15+ zone',
          'Уничтожьте 20 хасков ловушками в успешных миссиях в зоне 15+',
        ),
      ],
      rewards: [
        res('hero-xp', 2000),
        item('defender', { name: 'Shotgunner', rarity: 'common' }),
        unlock('Mission Defender 2/3', 'Защитник в миссиях 2/3'),
        item('ranged', { name: 'Bearcat', rarity: 'epic' }),
      ],
    },
    {
      id: 'supply-run',
      name: 'Supply Run',
      icon: 'quest',
      pl: 15,
      objectives: [
        text(
          'Recover 4 Supply Crates in successful missions in a 15+ zone',
          'Найдите 4 ящика с припасами в успешных миссиях в зоне 15+',
        ),
        text('Complete 2 missions in a 15+ zone', 'Выполните 2 миссии в зоне 15+'),
      ],
      rewards: [item('ranged', { name: 'Bazooka', rarity: 'epic' })],
    },
    {
      id: 'horrors-from-the-mist',
      name: 'Horrors from the Mist',
      icon: 'exterminate',
      pl: 15,
      objectives: [
        text(
          'Collect 5 Mist Monster data in a 15+ zone',
          'Соберите 5 данных о туманных монстрах в зоне 15+',
        ),
      ],
      rewards: [
        unlock('Hero Team Support 4', 'Слот поддержки в наборе героев 4'),
        item('melee', { name: 'Siegebreaker', rarity: 'epic' }),
      ],
    },
    {
      id: 'up-in-arms',
      name: 'Up in Arms',
      icon: 'story',
      pl: 15,
      objectives: [
        text(
          'Collect 7 Machine Parts in a 15+ Industrial zone',
          'Соберите 7 деталей машин в промзоне 15+',
        ),
      ],
      rewards: [
        item('survivor', { rarity: 'rare' }),
        unlock('Mission Defender 3/3', 'Защитник в миссиях 3/3'),
      ],
    },
    {
      id: 'triangulating-a-circle',
      name: 'Triangulating a Circle',
      icon: 'story',
      pl: 15,
      objectives: [text('Deploy 5 Scanners in a 15+ zone', 'Установите 5 сканеров в зоне 15+')],
      rewards: [item('melee', { name: 'Doomhammer', rarity: 'legendary' })],
    },
    {
      id: 'stonewood-storm-shield-defense-6',
      name: 'Stonewood Storm Shield Defense 6',
      icon: 'ssd',
      pl: 15,
      ssd: 6,
      objectives: [ssd()],
      rewards: [vb(100), item('survivor', { rarity: 'uncommon' })],
    },
    {
      id: 'a-new-direction',
      name: 'A New Direction',
      icon: 'story',
      pl: 15,
      objectives: [text('Deploy 5 Scanners in a 15+ zone', 'Установите 5 сканеров в зоне 15+')],
      rewards: [
        res('survivor-xp', 6000),
        item('lead-survivor', { rarity: 'rare' }),
        unlock('Level Up: Survivors', 'Прокачка выживших'),
      ],
    },
    {
      id: 'van-or-astro-van',
      name: 'Van or Astro-van?',
      icon: 'launch-the-rocket',
      pl: 15,
      objectives: [missions(1, ['launch-the-rocket'], 15)],
      rewards: [
        res('pure-drop-of-rain', 20),
        unlock('Expeditions: Dirtbike slot 1', 'Экспедиции: мотоцикл, слот 1'),
        unlock('Storm Shield Defender 2/5', 'Защитник на щите бури 2/5'),
        item('trap', { name: 'Player Jump Pad (Up)', rarity: 'rare' }),
        item('trap', { name: 'Player Jump Pad (Directional)', rarity: 'rare' }),
        unlock('Expeditions', 'Экспедиции'),
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
        unlock('Evolution', 'Эволюция'),
        unlock('Hero Loadout', 'Новый набор героев'),
        item('survivor', { rarity: 'uncommon' }),
        unlock('Increase Building Upgrade', 'Новый уровень улучшения построек'),
      ],
    },
    {
      id: 'two-swirls',
      name: 'Two Swirls',
      icon: 'fight-the-category-2-storm',
      pl: 19,
      objectives: [missions(1, ['fight-the-category-2-storm'], 19)],
      rewards: [item('hero', { name: 'Shock Specialist A.C', rarity: 'rare' })],
    },
    {
      id: 'no-robot-doctors',
      name: 'No. Robot. Doctors.',
      icon: 'evacuate-the-survivors',
      pl: 19,
      objectives: [missions(1, ['evacuate-the-survivors'], 19)],
      rewards: [res('schematic-xp', 2500)],
    },
    {
      id: 'cork-that-space-hole',
      name: 'Cork That Space Hole',
      icon: 'ride-the-lightning',
      pl: 19,
      objectives: [missions(1, ['ride-the-lightning'], 19)],
      rewards: [res('hero-xp', 2500)],
    },
    {
      id: 'while-screaming',
      name: '... While Screaming',
      icon: 'quest',
      pl: 19,
      objectives: [text('Find 3 Pop parts in a 19+ zone', 'Найдите 3 детали Попа в зоне 19+')],
      rewards: [res('mini-llama', 2)],
    },
    {
      id: 'rayreadme',
      name: 'Ray.README',
      icon: 'build-the-radar-grid',
      pl: 19,
      objectives: [missions(1, ['build-the-radar-grid'], 19)],
      rewards: [res('schematic-xp', 2500), item('ranged', { rarity: 'rare' })],
    },
    {
      id: 'a-fresh-start',
      name: 'A Fresh Start',
      icon: 'quest',
      pl: 19,
      objectives: [text('Fully explore a 19+ zone', 'Полностью исследуйте зону 19+')],
      rewards: [res('hero-xp', 2500), item('hero', { name: 'B.A.S.E. Kyle', rarity: 'rare' })],
    },
    {
      id: 'deeply-disturbing-simulations',
      name: 'Deeply Disturbing Simulations',
      icon: 'quest',
      pl: 19,
      objectives: [
        text(
          'Place 7 Vinderman lab transmitters in a 19+ zone',
          'Установите 7 передатчиков лаборатории Виндермана в зоне 19+',
        ),
      ],
      rewards: [],
    },
    {
      id: 'plankerton-storm-shield-defense-2',
      name: 'Plankerton Storm Shield Defense 2',
      icon: 'ssd',
      ssd: 2,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Hero Loadout', 'Новый набор героев'),
        res('re-perk', 1200),
        unlock('Perk Recombobulator', 'Перекомбинация перков'),
        item('survivor', { rarity: 'uncommon' }),
        unlock('Expeditions', 'Экспедиции'),
      ],
    },
    {
      id: 'six-minutes',
      name: 'Six Minutes',
      icon: 'repair-the-shelter',
      pl: 23,
      objectives: [missions(1, ['repair-the-shelter'], 23)],
      rewards: [
        res('hero-xp', 3000),
        item('hero', { name: 'Rescue Trooper Ramirez', rarity: 'rare' }),
      ],
    },
    {
      id: 'lightning-rich-environment',
      name: 'Lightning Rich Environment',
      icon: 'destroy-the-encampments',
      pl: 23,
      objectives: [missions(1, ['destroy-the-encampments'], 23)],
      rewards: [
        item('melee', { name: 'Spear', rarity: 'rare' }),
        item('melee', { name: 'Scythe', rarity: 'rare' }),
      ],
    },
    {
      id: 'see-yourself-out',
      name: 'SEE Yourself Out',
      icon: 'quest',
      pl: 23,
      objectives: [
        text(
          'Gather Rift data and place 3 scanning devices in a successful mission in a 23+ zone',
          'Соберите данные о разломах и установите 3 сканера в успешной миссии в зоне 23+',
        ),
      ],
      rewards: [res('survivor-xp', 20000), item('lead-survivor', { rarity: 'rare' })],
    },
    {
      id: 'clear',
      name: 'Clear!',
      icon: 'quest',
      pl: 23,
      objectives: [
        text(
          'Complete the Med-Bot objective in a successful mission in a 23+ zone',
          'Выполните задание с медботом в успешной миссии в зоне 23+',
        ),
      ],
      rewards: [res('survivor-xp', 20000), res('perk-up', 20, 'uncommon')],
    },
    {
      id: 'plankhattan-project',
      name: 'Plankhattan Project',
      icon: 'quest',
      pl: 23,
      objectives: [missions(1, ['refuel-the-homebase'], 23)],
      rewards: [res('hero-xp', 3000), item('defender', { rarity: 'rare' })],
    },
    {
      id: 'chopped-and-screwed',
      name: 'Chopped and Screwed',
      icon: 'destroy-the-encampments',
      pl: 23,
      objectives: [missions(2, ['destroy-the-encampments'], 23)],
      rewards: [res('schematic-xp', 3000), item('trap', { rarity: 'rare' })],
    },
    {
      id: 'radio-free-plankerton',
      name: 'Radio Free Plankerton',
      icon: 'quest',
      pl: 23,
      objectives: [
        text(
          'Find 5 pieces of broadcasting studio equipment in successful missions in a 23+ zone',
          'Найдите 5 частей оборудования радиостудии в успешных миссиях в зоне 23+',
        ),
      ],
      rewards: [res('schematic-xp', 3000), item('ranged', { rarity: 'rare' })],
    },
    {
      id: 'plankerton-storm-shield-defense-3',
      name: 'Plankerton Storm Shield Defense 3',
      icon: 'ssd',
      ssd: 3,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Survivor squad slots: Training Team 1', 'Слоты отряда выживших: Training Team 1'),
        unlock('Expeditions: Dirtbike slot 2', 'Экспедиции: мотоцикл, слот 2'),
        unlock('Expeditions: Row Boat slot 2', 'Экспедиции: лодка, слот 2'),
        unlock('Expeditions: Prop Plane slot 1', 'Экспедиции: винтовой самолёт, слот 1'),
        unlock('Level Up: Transformations', 'Прокачка трансформацию'),
      ],
    },
    {
      id: 'air-quotes',
      name: 'Air Quotes',
      icon: 'quest',
      pl: 28,
      objectives: [
        text(
          'Complete 1 Storm Chest in a successful mission in a 28+ zone',
          'Откройте 1 сундук бури в успешной миссии в зоне 28+',
        ),
      ],
      rewards: [res('hero-xp', 3250), item('hero', { name: 'Fleetfoot Ken', rarity: 'rare' })],
    },
    {
      id: 'rifty-business',
      name: 'Rifty Business',
      icon: 'deliver-the-bomb',
      pl: 28,
      objectives: [missions(1, ['deliver-the-bomb'], 28)],
      rewards: [res('hero-xp', 24000), res('gold', 100)],
    },
    {
      id: 'plankies-go-home',
      name: 'Plankies Go Home',
      icon: 'quest',
      pl: 28,
      objectives: [
        text(
          'Smash 2 anomalies in a successful mission in a 28+ zone',
          'Разбейте 2 аномалии в успешной миссии в зоне 28+',
        ),
      ],
      rewards: [res('mini-llama', 2)],
    },
    {
      id: 'wind-of-change',
      name: 'Wind of Change',
      icon: 'ride-the-lightning',
      pl: 28,
      objectives: [missions(1, ['ride-the-lightning'], 28)],
      rewards: [res('active-powercell', 3)],
    },
    {
      id: 'pump-up-the-volume',
      name: 'Pump Up the Volume',
      icon: 'quest',
      pl: 28,
      objectives: [
        text(
          'Rebuild 2 Survivor Relays in successful missions in a 28+ zone',
          'Восстановите 2 ретранслятора выживших в успешных миссиях в зоне 28+',
        ),
      ],
      rewards: [res('survivor-xp', 24000), res('flux', 30)],
    },
    {
      id: 'no-lost-causes',
      name: 'No Lost Causes',
      icon: 'repair-the-shelter',
      pl: 28,
      objectives: [
        text(
          'Save 15 Survivors and complete 1 Repair the Shelter mission in successful missions in 28+ zones',
          'Спасите 15 выживших и выполните 1 миссию «Починить убежище» в успешных миссиях в зонах 28+',
        ),
      ],
      rewards: [res('schematic-xp', 3250), res('flux', 30)],
    },
    {
      id: 'resist',
      name: 'Resist',
      icon: 'quest',
      pl: 28,
      objectives: [
        text(
          'Complete 3 Play with Others missions in a 28+ zone in Plankerton',
          'Выполните 3 миссии с режимом «Играть с другими» в зоне 28+ в Планкертоне',
        ),
      ],
      rewards: [res('hero-xp', 3250), res('perk-up', 50, 'uncommon')],
    },
    {
      id: 'plankerton-storm-shield-defense-4',
      name: 'Plankerton Storm Shield Defense 4',
      icon: 'ssd',
      ssd: 4,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Survivor squad: The Think Tank', 'Отряд выживших: The Think Tank'),
        unlock('Expeditions: Truck slot 1', 'Экспедиции: грузовик, слот 1'),
      ],
    },
    {
      id: 'shelter-skelter',
      name: 'Shelter Skelter',
      icon: 'evacuate-the-shelter',
      pl: 34,
      objectives: [missions(1, ['evacuate-the-shelter'], 34)],
      rewards: [res('schematic-xp', 3500), res('gold', 100)],
    },
    {
      id: 'from-husk-till-gone',
      name: 'From Husk Till Gone',
      icon: 'exterminate',
      pl: 34,
      objectives: [
        text(
          'Eliminate 500 Husks in successful missions in a 34+ zone',
          'Уничтожьте 500 хасков в успешных миссиях в зоне 34+',
        ),
      ],
      rewards: [
        choice(
          item('ranged', { weapon: 'assault', rarity: 'epic' }),
          item('ranged', { weapon: 'sniper', rarity: 'epic' }),
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
          'Gather 8 containers of food in successful missions in a 34+ zone',
          'Соберите 8 контейнеров с едой в успешных миссиях в зоне 34+',
        ),
      ],
      rewards: [res('training-manual', 3), res('trap-designs', 3), res('weapon-designs', 3)],
    },
    {
      id: 'deep-blu-somethings',
      name: 'Deep Blu Somethings',
      icon: 'quest',
      pl: 34,
      objectives: [
        text(
          'Activate a Build Pylon in a successful mission',
          'Активируйте пилон строительства в успешной миссии',
        ),
        text(
          'Activate a Health Pylon in a successful mission',
          'Активируйте пилон здоровья в успешной миссии',
        ),
        text(
          'Activate a Movement Pylon in a successful mission',
          'Активируйте пилон скорости в успешной миссии',
        ),
        text(
          'Activate a Shield Pylon in a successful mission',
          'Активируйте пилон щита в успешной миссии',
        ),
        text(
          'Activate an Energy Pylon in a successful mission',
          'Активируйте пилон энергии в успешной миссии',
        ),
      ],
      rewards: [res('survivor-xp', 28000), item('lead-survivor', { rarity: 'epic' })],
    },
    {
      id: 'whats-in-the-box',
      name: "What's in the Box?",
      icon: 'quest',
      pl: 34,
      objectives: [
        text(
          'Loot 3 Treasure Chests in successful missions in a 34+ zone',
          'Откройте 3 сундука с сокровищами в успешных миссиях в зоне 34+',
        ),
        text(
          'Eliminate a Mimic in a successful mission in a 34+ zone',
          'Уничтожьте мимика в успешной миссии в зоне 34+',
        ),
      ],
      rewards: [res('hero-xp', 3500), item('hero', { name: 'Pathfinder Jess', rarity: 'rare' })],
    },
    {
      id: 'plankerton-trail',
      name: 'Plankerton Trail',
      icon: 'retrieve-the-data',
      pl: 34,
      objectives: [missions(1, ['retrieve-the-data'], 34)],
      rewards: [res('lightning-in-a-bottle', 5)],
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
      rewards: [item('survivor', { rarity: 'epic' })],
    },
    {
      id: 'slay-misties-for-me',
      name: 'Slay Misties for Me',
      icon: 'exterminate',
      pl: 34,
      objectives: [
        text(
          'Eliminate 20 Mist Monsters in successful missions in a 34+ zone',
          'Уничтожьте 20 туманных монстров в успешных миссиях в зоне 34+',
        ),
      ],
      rewards: [item('melee', { rarity: 'epic' })],
    },
    {
      id: 'smooth-operator',
      name: 'Smooth Operator',
      icon: 'medic',
      pl: 34,
      objectives: [
        text(
          'Gather 4 crates of medical supplies in successful missions in a 34+ zone',
          'Соберите 4 ящика с медикаментами в успешных миссиях в зоне 34+',
        ),
      ],
      rewards: [res('schematic-xp', 3750)],
    },
    {
      id: 'agape',
      name: 'Agape',
      icon: 'deliver-the-bomb',
      pl: 34,
      objectives: [missions(1, ['deliver-the-bomb'], 34)],
      rewards: [item('survivor', { rarity: 'epic' })],
    },
    {
      id: 'smokey-eye',
      name: 'Smokey Eye',
      icon: 'repair-the-shelter',
      pl: 34,
      objectives: [missions(1, ['repair-the-shelter'], 34)],
      rewards: [res('hero-xp', 3750)],
    },
    {
      id: 'plankerton-storm-shield-defense-5',
      name: 'Plankerton Storm Shield Defense 5',
      icon: 'ssd',
      ssd: 5,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Expeditions: Prop Plane slot 2', 'Экспедиции: винтовой самолёт, слот 2'),
        unlock('Storm Shield Defender 3/5', 'Защитник на щите бури 3/5'),
        unlock(
          'Survivor squad slots: Gadgeteers and Close Assault 3',
          'Слоты отряда выживших: Gadgeteers и Close Assault 3',
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
          'Пройдите миссию «Освобождение Планк-Харбора»',
        ),
      ],
      rewards: [res('flux', 50)],
    },
    {
      id: 'safe-harbor',
      name: 'Safe Harbor',
      icon: 'evacuate-the-shelter',
      pl: 40,
      objectives: [
        text('Save 15 Survivors in successful missions', 'Спасите 15 выживших в успешных миссиях'),
        missions(1, ['evacuate-the-shelter'], 40),
      ],
      rewards: [res('schematic-xp', 3750)],
    },
    {
      id: 'foo-floater',
      name: 'Foo Floater',
      icon: 'retrieve-the-data',
      pl: 40,
      objectives: [missions(1, ['retrieve-the-data'], 40)],
      rewards: [res('active-powercell', 2)],
    },
    {
      id: 'rogue-balloon',
      name: 'Rogue Balloon',
      icon: 'build-the-radar-grid',
      pl: 40,
      objectives: [
        text(
          'Build 3 Radar Towers in successful missions in a 40+ zone',
          'Постройте 3 радарные вышки в успешных миссиях в зоне 40+',
        ),
      ],
      rewards: [res('survivor-xp', 30000)],
    },
    {
      id: 'jinx',
      name: 'Jinx',
      icon: 'ride-the-lightning',
      pl: 40,
      objectives: [missions(1, ['ride-the-lightning'], 40)],
      rewards: [res('mini-llama', 2)],
    },
    {
      id: 'im-probably-dead',
      name: "I'm Probably Dead",
      icon: 'quest',
      pl: 40,
      objectives: [
        text(
          'Complete the Vindertech Research Lab mission',
          'Пройдите миссию «Исследовательская лаборатория Vindertech»',
        ),
      ],
      rewards: [res('gold', 100), res('schematic-xp', 4000)],
    },
    {
      id: 'fight-on',
      name: 'Fight On',
      icon: 'quest',
      pl: 40,
      objectives: [
        text(
          'Rebuild 2 Survivor Relays in successful missions in a 40+ zone',
          'Восстановите 2 ретранслятора выживших в успешных миссиях в зоне 40+',
        ),
      ],
      rewards: [res('lightning-in-a-bottle', 10)],
    },
    {
      id: 'remains-to-be-seen',
      name: 'Remains To Be Seen?',
      icon: 'quest',
      pl: 40,
      objectives: [
        text(
          'Fully explore 2 40+ zones in successful missions',
          'Полностью исследуйте 2 зоны 40+ в успешных миссиях',
        ),
      ],
      rewards: [res('hero-xp', 3750), res('perk-up', 50, 'uncommon')],
    },
    {
      id: 'prophe-see',
      name: 'Prophe-SEE',
      icon: 'quest',
      pl: 40,
      objectives: [
        text(
          'Deploy 5 SEE-Bots in successful missions in a 40+ zone',
          'Установите 5 SEE-ботов в успешных миссиях в зоне 40+',
        ),
      ],
      rewards: [res('flux', 30), res('schematic-xp', 4000)],
    },
    {
      id: 'liner-notes',
      name: 'Liner Notes',
      icon: 'locate',
      pl: 40,
      objectives: [
        text(
          'Find 5 Steel Wool album records in a 40+ zone',
          'Найдите 5 пластинок группы Steel Wool в зоне 40+',
        ),
      ],
      rewards: [res('survivor-xp', 32000)],
    },
    {
      id: 'encore',
      name: 'Encore',
      icon: 'quest',
      pl: 40,
      objectives: [
        text(
          "Deploy 7 speakers and blast Steel Wool's greatest hits to repel the storm in a 40+ zone",
          'Установите 7 колонок и врубите хиты Steel Wool, чтобы отогнать бурю, в зоне 40+',
        ),
      ],
      rewards: [res('training-manual', 75), res('trap-designs', 75), res('weapon-designs', 75)],
    },
    {
      id: 'steel-icarus',
      name: 'Steel Icarus',
      icon: 'ride-the-lightning',
      pl: 40,
      objectives: [
        text('Launch Lars beyond the wall of clouds', 'Запустите Ларса за стену облаков'),
      ],
      rewards: [res('survivor-xp', 32000), item('survivor', { rarity: 'epic' })],
    },
    {
      id: 'plankerton-storm-shield-defense-6',
      name: 'Plankerton Storm Shield Defense 6',
      icon: 'ssd',
      ssd: 6,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Hero Loadout', 'Новый набор героев'),
        unlock('Expeditions: Dirtbike slot 3', 'Экспедиции: мотоцикл, слот 3'),
        unlock('Expeditions: Row Boat slot 3', 'Экспедиции: лодка, слот 3'),
        unlock('Expeditions: Truck slot 2', 'Экспедиции: грузовик, слот 2'),
        unlock(
          'Survivor squad slots: Training Team and The Think Tank 3',
          'Слоты отряда выживших: Training Team и The Think Tank 3',
        ),
      ],
    },
    {
      id: 'onward-to-canny-valley',
      name: 'Onward to Canny Valley!',
      icon: 'launch-the-rocket',
      objectives: [text('Complete the Plank Off! mission', 'Пройдите миссию «Plank Off!»')],
      rewards: [
        choice(
          item('hero', { heroClass: 'soldier', rarity: 'legendary' }),
          item('hero', { heroClass: 'constructor', rarity: 'legendary' }),
          item('hero', { heroClass: 'ninja', rarity: 'legendary' }),
          item('hero', { heroClass: 'outlander', rarity: 'legendary' }),
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
      rewards: [vb(100)],
    },
    {
      id: 'please-hold',
      name: 'Please Hold',
      icon: 'quest',
      pl: 46,
      objectives: [
        text('Discover a landmark in a 46+ zone', 'Найдите достопримечательность в зоне 46+'),
      ],
      rewards: [res('gold', 100)],
    },
    {
      id: 'road-trip',
      name: 'Road Trip',
      icon: 'story',
      pl: 46,
      objectives: [
        text('Visit a diner in a 46+ zone', 'Посетите закусочную в зоне 46+'),
        text('Visit a motel', 'Посетите мотель'),
        text('Visit a gas station', 'Посетите заправку'),
        text('Visit a truck stop', 'Посетите стоянку грузовиков'),
      ],
      rewards: [res('perk-up', 35, 'rare')],
    },
    {
      id: 'v',
      name: 'V',
      icon: 'quest',
      pl: 46,
      objectives: [text('Build a Memorial in a 46+ zone', 'Постройте мемориал в зоне 46+')],
      rewards: [res('schematic-xp', 1)],
    },
    {
      id: 'see-you-later',
      name: 'See You Later',
      icon: 'quest',
      pl: 46,
      objectives: [text('Update 5 SEE-Bots in a 46+ zone', 'Обновите 5 SEE-ботов в зоне 46+')],
      rewards: [res('flux', 45)],
    },
    {
      id: 'what-are-names',
      name: 'What Are Names?',
      icon: 'quest',
      pl: 46,
      objectives: [
        text(
          'Find 7 pieces of survey equipment in a 46+ zone',
          'Найдите 7 единиц геодезического оборудования в зоне 46+',
        ),
      ],
      rewards: [res('gold', 100)],
    },
    {
      id: 'canny-crude',
      name: 'Canny Crude!',
      icon: 'story',
      pl: 46,
      objectives: [
        text('Collect 5 oil samples in a 46+ zone', 'Соберите 5 образцов нефти в зоне 46+'),
      ],
      rewards: [
        choice(
          res('pure-drop-of-rain', 20),
          res('lightning-in-a-bottle', 10),
          res('eye-of-the-storm', 5),
        ),
      ],
    },
    {
      id: 'the-bones-collector',
      name: 'The Bones Collector',
      icon: 'story',
      pl: 46,
      objectives: [text('Collect 7 bones in a 46+ zone', 'Соберите 7 костей в зоне 46+')],
      rewards: [item('trap', { rarity: 'legendary' })],
    },
    {
      id: 'ready-to-rock',
      name: 'Ready To Rock',
      icon: 'story',
      pl: 46,
      objectives: [
        text(
          'Gather 17 rock samples in a 46+ zone',
          'Соберите 17 образцов горных пород в зоне 46+',
        ),
      ],
      rewards: [res('re-perk', 200)],
    },
    {
      id: 'concept-art',
      name: 'Concept Art',
      icon: 'quest',
      pl: 46,
      objectives: [text('Deploy 5 Scanners in a 46+ zone', 'Установите 5 сканеров в зоне 46+')],
      rewards: [
        choice(
          [item('hero', { heroClass: 'constructor', rarity: 'epic' }), res('hero-xp', 4000)],
          [item('hero', { heroClass: 'ninja', rarity: 'epic' }), res('hero-xp', 4000)],
          [item('hero', { heroClass: 'outlander', rarity: 'epic' }), res('hero-xp', 4000)],
          [item('hero', { heroClass: 'soldier', rarity: 'epic' }), res('hero-xp', 4000)],
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
        unlock(
          'Survivor squad slots: Fire Team Alpha 4, 5 and 6',
          'Слоты отряда выживших: Fire Team Alpha 4, 5 и 6',
        ),
        unlock('Expeditions: Row Boat slot 4', 'Экспедиции: лодка, слот 4'),
      ],
    },
    {
      id: 'band-probation',
      name: 'Band Probation',
      icon: 'locate',
      pl: 52,
      objectives: [text('Find 10 periscopes in a 52+ zone', 'Найдите 10 перископов в зоне 52+')],
      rewards: [res('gold', 100)],
    },
    {
      id: 'canny-underground',
      name: 'Canny Underground',
      icon: 'story',
      pl: 52,
      objectives: [text('Search 3 bunkers in a 52+ zone', 'Обыщите 3 бункера в зоне 52+')],
      rewards: [res('perk-up', 70, 'epic')],
    },
    {
      id: 'stalled-out',
      name: 'Stalled Out',
      icon: 'story',
      pl: 52,
      objectives: [text('Search 9 cars in a 52+ zone', 'Обыщите 9 машин в зоне 52+')],
      rewards: [res('flux', 15)],
    },
    {
      id: 'say-watt',
      name: 'Say Watt?',
      icon: 'story',
      pl: 52,
      objectives: [text('Search 6 servers in a 52+ zone', 'Обыщите 6 серверов в зоне 52+')],
      rewards: [
        choice(
          res('pure-drop-of-rain', 20),
          res('lightning-in-a-bottle', 10),
          res('eye-of-the-storm', 5),
        ),
      ],
    },
    {
      id: 'the-cyclone-of-your-love',
      name: 'The Cyclone Of Your Love',
      icon: 'locate',
      pl: 52,
      objectives: [text('Collect 7 songbooks in a 52+ zone', 'Соберите 7 песенников в зоне 52+')],
      rewards: [item('survivor', { rarity: 'legendary' }), res('survivor-xp', 54000)],
    },
    {
      id: 'a-harrowing-journey-of-drumming',
      name: 'A Harrowing Journey Of Drumming',
      icon: 'story',
      pl: 52,
      objectives: [
        text(
          'Gather 10 parts from destroyed jukeboxes in a 52+ zone',
          'Соберите 10 деталей из разбитых музыкальных автоматов в зоне 52+',
        ),
      ],
      rewards: [res('gold', 100)],
    },
    {
      id: 'its-showtime',
      name: "It's Showtime",
      icon: 'locate',
      pl: 52,
      objectives: [text('Find 7 tapes in 52+ zones', 'Найдите 7 кассет в зонах 52+')],
      rewards: [res('re-perk', 200)],
    },
    {
      id: 'my-dearest-sophie',
      name: 'My Dearest Sophie',
      icon: 'locate',
      pl: 52,
      objectives: [
        text(
          'Find 7 old diary pages in 52+ zones',
          'Найдите 7 старых страниц дневника в зонах 52+',
        ),
      ],
      rewards: [
        choice(
          [item('ranged', { rarity: 'legendary' }), res('schematic-xp', 4500)],
          [item('melee', { rarity: 'legendary' }), res('schematic-xp', 4500)],
        ),
      ],
    },
    {
      id: 'just-build',
      name: 'Just Build',
      icon: 'build',
      pl: 52,
      objectives: [
        text('Build 100 structures in a 52+ zone', 'Постройте 100 конструкций в зоне 52+'),
      ],
      rewards: [res('gold', 100)],
    },
    {
      id: 'thar-she-tumbles',
      name: 'Thar She Tumbles',
      icon: 'story',
      pl: 52,
      objectives: [
        text(
          'Collect 10 tumbleweed movement data in a 52+ zone',
          'Соберите 10 данных о движении перекати-поля в зоне 52+',
        ),
      ],
      rewards: [
        choice(
          res('pure-drop-of-rain', 20),
          res('lightning-in-a-bottle', 10),
          res('eye-of-the-storm', 5),
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
          'Battle the Legendary Gunslinger Husk and explore Gravestone in a 52+ zone',
          'Сразитесь с легендарным хаском-стрелком и исследуйте Грейвстоун в зоне 52+',
        ),
      ],
      rewards: [item('lead-survivor', { name: 'Steel Wool Syd' }), res('hero-xp', 4500)],
    },
    {
      id: 'canny-valley-storm-shield-defense-3',
      name: 'Canny Valley Storm Shield Defense 3',
      icon: 'ssd',
      ssd: 3,
      objectives: [ssd()],
      rewards: [vb(100)],
    },
    {
      id: 'the-big-picture',
      name: 'The Big Picture',
      icon: 'locate',
      pl: 58,
      objectives: [
        text(
          'Track down 5 weird radio transmissions in a 58+ zone',
          'Отследите 5 странных радиопередач в зоне 58+',
        ),
      ],
      rewards: [res('gold', 150)],
    },
    {
      id: 'blue-skies',
      name: 'Blue Skies',
      icon: 'explore',
      pl: 58,
      objectives: [
        text(
          'Fully explore a Ghost Town zone in a successful mission',
          'Полностью исследуйте город-призрак в успешной миссии',
        ),
      ],
      rewards: [res('perk-up', 115, 'epic')],
    },
    {
      id: 'celebrate-you-now',
      name: 'Celebrate You Now!',
      icon: 'locate',
      pl: 58,
      objectives: [
        text('Gather 7 spa pamphlets in a 58+ zone', 'Соберите 7 буклетов спа-салонов в зоне 58+'),
      ],
      rewards: [res('flux', 15)],
    },
    {
      id: 'retreat',
      name: 'Retreat!',
      icon: 'story',
      pl: 58,
      objectives: [
        text(
          'Visit 3 spas in a 58+ Ghost Town zone',
          'Посетите 3 спа-салона в городе-призраке 58+',
        ),
      ],
      rewards: [res('gold', 150)],
    },
    {
      id: 'seventeen',
      name: 'Seventeen',
      icon: 'locate',
      pl: 58,
      objectives: [
        text(
          'Search 7 coaches in a 58+ Ghost Town zone',
          'Обыщите 7 дилижансов в городе-призраке 58+',
        ),
      ],
      rewards: [res('survivor-xp', 60000)],
    },
    {
      id: 'ray-on-the-rooftop',
      name: 'Ray on the Rooftop',
      icon: 'story',
      pl: 58,
      objectives: [
        text(
          'Retrieve 15 listening devices in a 58+ Ghost Town or Thunder Route 99 zone',
          'Достаньте 15 подслушивающих устройств в зоне 58+: город-призрак или Шоссе 99',
        ),
      ],
      rewards: [
        choice(
          res('pure-drop-of-rain', 20),
          res('lightning-in-a-bottle', 10),
          res('eye-of-the-storm', 5),
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
          'Retrieve 7 oil lanterns in a 58+ Ghost Town zone',
          'Достаньте 7 керосиновых ламп в городе-призраке 58+',
        ),
      ],
      rewards: [res('re-perk', 200)],
    },
    {
      id: 'different-lies',
      name: 'Different Lies',
      icon: 'quest',
      pl: 58,
      objectives: [
        text(
          'Visit 5 outhouses in a 58+ Ghost Town zone',
          'Посетите 5 уличных туалетов в городе-призраке 58+',
        ),
      ],
      rewards: [item('trap', { rarity: 'legendary' }), res('schematic-xp', 5000)],
    },
    {
      id: 'automatons-of-olympus',
      name: 'Automatons Of Olympus',
      icon: 'locate',
      pl: 58,
      objectives: [
        text('Find 9 movies and records in a 58+ zone', 'Найдите 9 фильмов и пластинок в зоне 58+'),
      ],
      rewards: [
        choice(
          [item('hero', { heroClass: 'constructor', rarity: 'epic' }), res('hero-xp', 5000)],
          [item('hero', { heroClass: 'ninja', rarity: 'epic' }), res('hero-xp', 5000)],
          [item('hero', { heroClass: 'outlander', rarity: 'epic' }), res('hero-xp', 5000)],
          [item('hero', { heroClass: 'soldier', rarity: 'epic' }), res('hero-xp', 5000)],
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
          'Explore 3 forts in a 58+ Ghost Town zone',
          'Исследуйте 3 форта в городе-призраке 58+',
        ),
      ],
      rewards: [res('gold', 150)],
    },
    {
      id: 'in-through-the-out-rift',
      name: 'In Through The Out Rift',
      icon: 'quest',
      pl: 58,
      objectives: [text('Find 5 rifts in a 58+ zone', 'Найдите 5 разломов в зоне 58+')],
      rewards: [
        choice(
          res('pure-drop-of-rain', 20),
          res('lightning-in-a-bottle', 10),
          res('eye-of-the-storm', 5),
        ),
      ],
    },
    {
      id: 'canny-valley-storm-shield-defense-4',
      name: 'Canny Valley Storm Shield Defense 4',
      icon: 'ssd',
      ssd: 4,
      objectives: [ssd()],
      rewards: [vb(100)],
    },
    {
      id: 'lowered-expectations',
      name: 'Lowered Expectations',
      icon: 'story',
      pl: 64,
      objectives: [
        text(
          'Visit 5 stores in a 64+ Ghost Town zone',
          'Посетите 5 магазинов в городе-призраке 64+',
        ),
      ],
      rewards: [res('perk-up', 150, 'legendary')],
    },
    {
      id: 'eye-candy',
      name: 'Eye Candy',
      icon: 'quest',
      pl: 64,
      objectives: [
        text(
          'Set 5 SEE-Bot traps in a 64+ Ghost Town zone',
          'Поставьте 5 ловушек SEE-бота в городе-призраке 64+',
        ),
      ],
      rewards: [item('lead-survivor', { rarity: 'legendary' }), res('survivor-xp', 72000)],
    },
    {
      id: 'fool-and-his-gold',
      name: 'Fool And His Gold',
      icon: 'quest',
      pl: 64,
      objectives: [
        text(
          'Deploy 5 auto gold sieves in a 64+ Ghost Town zone',
          'Установите 5 автоматических золотых сит в городе-призраке 64+',
        ),
      ],
      rewards: [
        choice(
          res('pure-drop-of-rain', 20),
          res('lightning-in-a-bottle', 10),
          res('eye-of-the-storm', 5),
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
          'Help Carlos and Lars settle the score with a winner-takes-all game of Jefe',
          'Помогите Карлосу и Ларсу свести счёты в игре «Хефе», где победитель забирает всё',
        ),
      ],
      rewards: [res('gold', 150)],
    },
    {
      id: 'are-we-ready-to-rock',
      name: 'Are We Ready To Rock?',
      icon: 'quest',
      pl: 64,
      objectives: [
        text(
          'Explore 5 Old West music halls in a 64+ Ghost Town zone',
          'Исследуйте 5 салунов с музыкой Дикого Запада в городе-призраке 64+',
        ),
      ],
      rewards: [res('re-perk', 200)],
    },
    {
      id: 'evacuate-immediately',
      name: 'Evacuate Immediately!',
      icon: 'evacuate-the-shelter',
      pl: 64,
      objectives: [missions(1, ['evacuate-the-shelter'], 64)],
      rewards: [
        choice(
          [item('melee', { rarity: 'legendary' }), res('schematic-xp', 6000)],
          [item('ranged', { rarity: 'legendary' }), res('schematic-xp', 6000)],
        ),
      ],
    },
    {
      id: 'the-entertainer',
      name: 'The Entertainer',
      icon: 'story',
      pl: 64,
      objectives: [
        text(
          'Gather 5 player piano rolls in a 64+ Ghost Town zone',
          'Соберите 5 рулонов для механического пианино в городе-призраке 64+',
        ),
      ],
      rewards: [res('gold', 150)],
    },
    {
      id: 'eye-in-the-sky',
      name: 'Eye In The Sky',
      icon: 'quest',
      pl: 64,
      objectives: [text('Deploy 7 telescopes in a 64+ zone', 'Установите 7 телескопов в зоне 64+')],
      rewards: [
        choice(
          res('pure-drop-of-rain', 20),
          res('lightning-in-a-bottle', 10),
          res('eye-of-the-storm', 5),
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
          'Explore 4 train stations in a 64+ Ghost Town zone',
          'Исследуйте 4 вокзала в городе-призраке 64+',
        ),
      ],
      rewards: [item('lead-survivor', { name: 'Steel Wool Carlos' }), res('hero-xp', 6000)],
    },
    {
      id: 'canny-valley-storm-shield-defense-5',
      name: 'Canny Valley Storm Shield Defense 5',
      icon: 'ssd',
      ssd: 5,
      objectives: [ssd()],
      rewards: [vb(100)],
    },
    {
      id: 'remote-control',
      name: 'Remote Control',
      icon: 'quest',
      pl: 70,
      objectives: [
        text(
          'Test the new remote detonator by sending a probe through a rift',
          'Испытайте новый дистанционный детонатор: отправьте зонд через разлом',
        ),
      ],
      rewards: [res('re-perk', 200)],
    },
    {
      id: 'when-theres-a-will',
      name: "When There's A Will...",
      icon: 'story',
      pl: 70,
      objectives: [
        text(
          'Collect 50 clockworks in a 70+ Ghost Town zone',
          'Соберите 50 часовых механизмов в городе-призраке 70+',
        ),
      ],
      rewards: [res('gold', 150)],
    },
    {
      id: 'a-thousand-words',
      name: 'A Thousand Words',
      icon: 'quest',
      pl: 70,
      objectives: [
        text(
          'Collect 7 books for SEE-Bot in a 70+ Ghost Town zone',
          'Соберите 7 книг для SEE-бота в городе-призраке 70+',
        ),
      ],
      rewards: [
        choice(
          res('pure-drop-of-rain', 20),
          res('lightning-in-a-bottle', 10),
          res('eye-of-the-storm', 5),
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
          'Destroy 50 covered wagons in a 70+ Ghost Town zone',
          'Уничтожьте 50 крытых повозок в городе-призраке 70+',
        ),
      ],
      rewards: [
        choice(
          [item('melee', { rarity: 'legendary' }), res('schematic-xp', 7000)],
          [item('ranged', { rarity: 'legendary' }), res('schematic-xp', 7000)],
        ),
      ],
    },
    {
      id: 'smashasaurus',
      name: 'Smashasaurus',
      icon: 'story',
      pl: 70,
      objectives: [
        text(
          'Smash 5 dinosaurs in a 70+ Ghost Town zone',
          'Разбейте 5 динозавров в городе-призраке 70+',
        ),
      ],
      rewards: [res('flux', 15)],
    },
    {
      id: 'fridge-logic',
      name: 'Fridge Logic',
      icon: 'exterminate',
      pl: 70,
      objectives: [
        text(
          'Eliminate 15 Riot Shield Huskies in a 70+ zone',
          'Уничтожьте 15 хасков-громил с щитами в зоне 70+',
        ),
      ],
      rewards: [res('perk-up', 150, 'legendary')],
    },
    {
      id: 'power-to-the-people',
      name: 'Power To The People',
      icon: 'locate',
      pl: 70,
      objectives: [
        text(
          'Inspect 7 power transformers in a 70+ zone',
          'Осмотрите 7 трансформаторов в зоне 70+',
        ),
      ],
      rewards: [res('gold', 150)],
    },
    {
      id: 'have-you-tried-turning-it-on-and-off-again',
      name: 'Have You Tried Turning It On And Off Again?',
      icon: 'quest',
      pl: 70,
      objectives: [text('Activate the Vinderman AI', 'Активируйте ИИ Виндермана')],
      rewards: [item('lead-survivor', { rarity: 'legendary' }), res('survivor-xp', 84000)],
    },
    {
      id: 'bandwidth-issues',
      name: 'Bandwidth Issues',
      icon: 'story',
      pl: 70,
      objectives: [
        text(
          'Collect 30 circuit boards by destroying servers in a 70+ zone',
          'Соберите 30 микросхем, разбивая серверы, в зоне 70+',
        ),
      ],
      rewards: [
        choice(
          res('pure-drop-of-rain', 20),
          res('lightning-in-a-bottle', 10),
          res('eye-of-the-storm', 5),
        ),
      ],
    },
    {
      id: 'reverse-tinfoil-hats',
      name: 'Reverse Tinfoil Hats',
      icon: 'quest',
      pl: 70,
      objectives: [
        text(
          'Deploy 7 decoy hats in a 70+ Ghost Town zone',
          'Расставьте 7 шляп-приманок в городе-призраке 70+',
        ),
      ],
      rewards: [
        choice(
          [item('hero', { heroClass: 'constructor', rarity: 'epic' }), res('hero-xp', 7000)],
          [item('hero', { heroClass: 'ninja', rarity: 'epic' }), res('hero-xp', 7000)],
          [item('hero', { heroClass: 'outlander', rarity: 'epic' }), res('hero-xp', 7000)],
          [item('hero', { heroClass: 'soldier', rarity: 'epic' }), res('hero-xp', 7000)],
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
          'Collect 15 junk food in a 70+ Thunder Route 99 or Ghost Town zone',
          'Соберите 15 упаковок фастфуда в зоне 70+: Шоссе 99 или город-призрак',
        ),
      ],
      rewards: [res('gold', 150)],
    },
    {
      id: 'signal-strength',
      name: 'Signal Strength',
      icon: 'story',
      pl: 70,
      objectives: [
        text(
          'Search for the source of The Nothing in a 70+ Thunder Route 99 or Ghost Town zone',
          'Найдите источник Ничто в зоне 70+: Шоссе 99 или город-призрак',
        ),
      ],
      rewards: [res('re-perk', 200)],
    },
    {
      id: 'cannon-fodder',
      name: 'Cannon Fodder',
      icon: 'locate',
      pl: 70,
      objectives: [
        text(
          'Collect 7 cannons in a 70+ Ghost Town zone',
          'Соберите 7 пушек в городе-призраке 70+',
        ),
      ],
      rewards: [res('perk-up', 150, 'legendary')],
    },
    {
      id: 'while-youre-up',
      name: "While You're Up...",
      icon: 'locate',
      pl: 70,
      objectives: [
        text(
          'Collect 20 support beams in a 70+ Arid zone',
          'Соберите 20 опорных балок в засушливой зоне 70+',
        ),
      ],
      rewards: [res('gold', 150)],
    },
    {
      id: 'a-bonding-experience',
      name: 'A Bonding Experience',
      icon: 'story',
      pl: 70,
      objectives: [
        text(
          'Collect 7 motorcycles in a 70+ Thunder Route 99 zone',
          'Соберите 7 мотоциклов на Шоссе 99 в зоне 70+',
        ),
      ],
      rewards: [
        choice(
          [item('melee', { rarity: 'legendary' }), res('schematic-xp', 7000)],
          [item('ranged', { rarity: 'legendary' }), res('schematic-xp', 7000)],
        ),
      ],
    },
    {
      id: 'excalibur-20',
      name: 'Excalibur 2.0',
      icon: 'story',
      pl: 70,
      objectives: [
        text(
          'Collect 30 vacuum parts in a 70+ Thunder Route 99 zone',
          'Соберите 30 деталей пылесоса на Шоссе 99 в зоне 70+',
        ),
      ],
      rewards: [item('ranged', { name: 'Super Shredder' })],
    },
    {
      id: 'three-strikes',
      name: 'Three Strikes',
      icon: 'story',
      pl: 70,
      objectives: [text('Kill 3 mini-bosses in a 70+ zone', 'Убейте 3 мини-боссов в зоне 70+')],
      rewards: [res('gold', 150)],
    },
    {
      id: '20000-leagues',
      name: '20,000 Leagues',
      icon: 'quest',
      pl: 70,
      objectives: [
        text(
          'Inspect 7 SEA-Bots in a 70+ Ghost Town zone',
          'Осмотрите 7 SEA-ботов в городе-призраке 70+',
        ),
      ],
      rewards: [
        choice(
          res('pure-drop-of-rain', 20),
          res('lightning-in-a-bottle', 10),
          res('eye-of-the-storm', 5),
        ),
      ],
    },
    {
      id: 'battle-royal',
      name: 'Battle Royal',
      icon: 'quest',
      pl: 70,
      objectives: [
        text(
          'Enter the portal and deliver the ultimate bomb (defeat the Storm King)',
          'Войдите в портал и доставьте главную бомбу (победите Короля бури)',
        ),
      ],
      rewards: [
        choice(
          [
            item('melee', { name: 'Buzzcut' }),
            item('lead-survivor', { name: 'Steel Wool Anthony' }),
            res('re-perk', 250),
            res('perk-up', 225, 'epic'),
          ],
          [
            item('melee', { name: 'Head Clipper' }),
            item('lead-survivor', { name: 'Steel Wool Anthony' }),
            res('re-perk', 250),
            res('perk-up', 225, 'epic'),
          ],
          [
            item('melee', { name: 'Pressure Cutter' }),
            item('lead-survivor', { name: 'Steel Wool Anthony' }),
            res('re-perk', 250),
            res('perk-up', 225, 'epic'),
          ],
          [
            item('melee', { name: 'Pummeller' }),
            item('lead-survivor', { name: 'Steel Wool Anthony' }),
            res('re-perk', 250),
            res('perk-up', 225, 'epic'),
          ],
        ),
      ],
    },
    {
      id: 'how-i-wonder-what-you-are',
      name: 'How I Wonder What You Are',
      icon: 'quest',
      pl: 70,
      objectives: [
        text(
          'Take a look back, and a look at things to come',
          'Оглянитесь назад и загляните в будущее',
        ),
      ],
      rewards: [res('perk-up', 150, 'legendary')],
    },
    {
      id: 'stand-and-fight',
      name: 'Stand and Fight',
      icon: 'quest',
      pl: 70,
      objectives: [
        text(
          "Find Steel Wool's new demo tape in a 70+ zone",
          'Найдите новую демозапись Steel Wool в зоне 70+',
        ),
      ],
      rewards: [
        res('gold', 150),
        item('cosmetic', { name: 'Stand and Fight Lobby Music' }),
        item('cosmetic', { name: 'Stand and Fight (Remix) Jam Track' }),
      ],
    },
    {
      id: 'canny-valley-storm-shield-defense-6',
      name: 'Canny Valley Storm Shield Defense 6',
      icon: 'ssd',
      ssd: 6,
      objectives: [ssd()],
      rewards: [vb(100)],
    },
    {
      id: 'time-to-blast-off',
      name: 'Time To Blast Off',
      icon: 'launch-the-rocket',
      pl: 70,
      objectives: [text('Complete the Blasting Off mission', 'Пройдите миссию «Blasting Off»')],
      rewards: [item('transform')],
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
        unlock('Increase Building Resource Capacity', 'Больше места под стройматериалы'),
        unlock('Expeditions: Helicopter slot 2', 'Экспедиции: вертолёт, слот 2'),
        unlock(
          'Survivor squad slots: Gadgeteers 4, 5 and 6',
          'Слоты отряда выживших: Gadgeteers 4, 5 и 6',
        ),
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
      rewards: [res('gold', 200)],
    },
    {
      id: 'first-things-first',
      name: 'First Things First',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['fight-the-storm', 'ride-the-lightning', 'fight-the-category-3-storm'], 76),
      ],
      rewards: [res('eye-of-the-storm', 10), res('schematic-xp', 7500)],
    },
    {
      id: 'want-some-twine-course-ya-do',
      name: 'Want Some Twine? Course Ya Do!',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['ride-the-lightning', 'deliver-the-bomb', 'retrieve-the-data'], 76),
      ],
      rewards: [res('obsidian-ore', 5), res('rotating-gizmo', 2)],
    },
    {
      id: 'call-the-shots',
      name: 'Call The Shots',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(2, ['repair-the-shelter', 'fight-the-storm', 'fight-the-category-2-storm'], 76),
      ],
      rewards: [res('hero-xp', 7500), res('re-perk', 200)],
    },
    {
      id: 'take-it-to-the-limit',
      name: 'Take It To The Limit',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['deliver-the-bomb', 'retrieve-the-data', 'evacuate-the-shelter'], 76),
      ],
      rewards: [res('gold', 200), res('hero-xp', 7500)],
    },
    {
      id: 'know-where-you-stand',
      name: 'Know Where You Stand',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['repair-the-shelter', 'ride-the-lightning', 'fight-the-category-3-storm'], 76),
      ],
      rewards: [res('flux', 15), res('schematic-xp', 7500)],
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
      rewards: [res('eye-of-the-storm', 10)],
    },
    {
      id: 'hang-in-there',
      name: 'Hang In There',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['repair-the-shelter', 'fight-the-category-2-storm', 'deliver-the-bomb'], 76),
      ],
      rewards: [res('survivor-xp', 120000), res('perk-up', 115, 'epic')],
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
      rewards: [res('re-perk', 200), res('schematic-xp', 7500)],
    },
    {
      id: 'to-tame-a-land',
      name: 'To Tame A Land',
      icon: 'quest',
      pl: 76,
      objectives: [missions(3, ['fight-the-storm', 'retrieve-the-data', 'deliver-the-bomb'], 76)],
      rewards: [res('flux', 15), res('schematic-xp', 7500)],
    },
    {
      id: 'push-the-envelope',
      name: 'Push The Envelope',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['ride-the-lightning', 'fight-the-storm', 'fight-the-category-2-storm'], 76),
      ],
      rewards: [res('gold', 200), res('hero-xp', 7500)],
    },
    {
      id: 'twist-of-fate',
      name: 'Twist Of Fate',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'repair-the-shelter', 'retrieve-the-data'], 76),
      ],
      rewards: [res('active-powercell', 3)],
    },
    {
      id: 'round-and-round',
      name: 'Round And Round',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['ride-the-lightning', 'evacuate-the-shelter', 'deliver-the-bomb'], 76),
      ],
      rewards: [res('active-powercell', 10), res('schematic-xp', 7500)],
    },
    {
      id: 'glimmer-of-hope',
      name: 'Glimmer Of Hope',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-category-2-storm', 'ride-the-lightning'], 76),
      ],
      rewards: [res('re-perk', 200), res('schematic-xp', 7500)],
    },
    {
      id: 'circle-back',
      name: 'Circle Back',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(2, ['fight-the-category-3-storm', 'deliver-the-bomb', 'evacuate-the-shelter'], 76),
      ],
      rewards: [res('training-manual', 325), res('trap-designs', 325), res('weapon-designs', 325)],
    },
    {
      id: 'off-and-running',
      name: 'Off And Running',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(2, ['fight-the-category-2-storm', 'ride-the-lightning', 'repair-the-shelter'], 76),
      ],
      rewards: [res('mini-llama', 2)],
    },
    {
      id: 'anything-goes',
      name: 'Anything Goes',
      icon: 'quest',
      pl: 76,
      objectives: [
        missions(3, ['deliver-the-bomb', 'evacuate-the-shelter', 'fight-the-category-3-storm'], 76),
      ],
      rewards: [res('gold', 200), res('schematic-xp', 7500)],
    },
    {
      id: 'you-aint-seen-nothin-yet',
      name: "You Ain't Seen Nothin' Yet",
      icon: 'quest',
      pl: 76,
      objectives: [missions(3, ['fight-the-storm', 'retrieve-the-data', 'ride-the-lightning'], 76)],
      rewards: [res('perk-up', 115, 'epic'), res('schematic-xp', 7500)],
    },
    {
      id: 'twine-peaks-storm-shield-defense-2',
      name: 'Twine Peaks Storm Shield Defense 2',
      icon: 'ssd',
      ssd: 2,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Expeditions: Truck slot 4', 'Экспедиции: грузовик, слот 4'),
        unlock(
          'Survivor squad slots: Close Assault 4, 5 and 6',
          'Слоты отряда выживших: Close Assault 4, 5 и 6',
        ),
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
      rewards: [res('survivor-xp', 128000)],
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
      rewards: [res('gold', 200)],
    },
    {
      id: 'stranger-danger',
      name: 'Stranger Danger',
      icon: 'quest',
      pl: 82,
      objectives: [missions(3, ['ride-the-lightning', 'deliver-the-bomb', 'fight-the-storm'], 82)],
      rewards: [res('flux', 15), res('survivor-xp', 128000)],
    },
    {
      id: 'time-after-time',
      name: 'Time After Time',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'retrieve-the-data', 'repair-the-shelter'], 82),
      ],
      rewards: [res('mini-llama', 2)],
    },
    {
      id: 'area-defense',
      name: 'Area Defense',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'repair-the-shelter', 'ride-the-lightning'], 82),
      ],
      rewards: [res('eye-of-the-storm', 15)],
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
      rewards: [res('obsidian-ore', 15), res('rotating-gizmo', 3)],
    },
    {
      id: 'do-what-it-takes',
      name: 'Do What It Takes',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['fight-the-storm', 'fight-the-category-3-storm', 'repair-the-shelter'], 82),
      ],
      rewards: [res('hero-xp', 8000), res('re-perk', 200)],
    },
    {
      id: 'groundhog-day',
      name: 'Groundhog Day',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['ride-the-lightning', 'fight-the-category-2-storm', 'retrieve-the-data'], 82),
      ],
      rewards: [res('training-manual', 325), res('trap-designs', 325), res('weapon-designs', 325)],
    },
    {
      id: 'give-it-a-whirl',
      name: 'Give It A Whirl',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(2, ['fight-the-storm', 'evacuate-the-shelter', 'deliver-the-bomb'], 82),
      ],
      rewards: [res('gold', 200), res('schematic-xp', 8000)],
    },
    {
      id: 'a-no-brainer',
      name: 'A No Brainer',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['repair-the-shelter', 'retrieve-the-data', 'ride-the-lightning'], 82),
      ],
      rewards: [res('active-powercell', 3)],
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
      rewards: [res('active-powercell', 3), res('schematic-xp', 8000)],
    },
    {
      id: 'cookie-cutter',
      name: 'Cookie Cutter',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(2, ['deliver-the-bomb', 'evacuate-the-shelter', 'fight-the-category-2-storm'], 82),
      ],
      rewards: [res('eye-of-the-storm', 15), res('schematic-xp', 8000)],
    },
    {
      id: 'nothing-else-matters',
      name: 'Nothing Else Matters',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['fight-the-storm', 'fight-the-category-3-storm', 'repair-the-shelter'], 82),
      ],
      rewards: [res('re-perk', 200), res('schematic-xp', 8000)],
    },
    {
      id: 'follow-the-leader',
      name: 'Follow the Leader',
      icon: 'medic',
      pl: 82,
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'retrieve-the-data', 'ride-the-lightning'], 82),
      ],
      rewards: [res('survivor-xp', 128000), res('perk-up', 115, 'epic')],
    },
    {
      id: 'an-uphill-battle',
      name: 'An Uphill Battle',
      icon: 'medic',
      pl: 82,
      objectives: [
        missions(3, ['evacuate-the-shelter', 'fight-the-storm', 'repair-the-shelter'], 82),
      ],
      rewards: [res('gold', 200), res('hero-xp', 8000)],
    },
    {
      id: 'its-not-a-sprint',
      name: "It's Not A Sprint!",
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(2, ['retrieve-the-data', 'deliver-the-bomb', 'fight-the-category-3-storm'], 82),
      ],
      rewards: [res('flux', 15), res('schematic-xp', 8000)],
    },
    {
      id: 'to-the-victor-go-the-spoils',
      name: 'To the Victor Go the Spoils',
      icon: 'quest',
      pl: 82,
      objectives: [
        missions(3, ['ride-the-lightning', 'repair-the-shelter', 'evacuate-the-shelter'], 82),
      ],
      rewards: [res('perk-up', 115, 'epic'), res('schematic-xp', 8000)],
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
      rewards: [res('survivor-xp', 128000), item('survivor', { rarity: 'epic' })],
    },
    {
      id: 'twine-peaks-storm-shield-defense-3',
      name: 'Twine Peaks Storm Shield Defense 3',
      icon: 'ssd',
      ssd: 3,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Expeditions: Speed Boat slot 4', 'Экспедиции: катер, слот 4'),
        unlock(
          'Survivor squad slots: Training Team 4, 5 and 6',
          'Слоты отряда выживших: Training Team 4, 5 и 6',
        ),
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
      rewards: [res('hero-xp', 8500), item('hero', { name: 'Dim Mak Mari', rarity: 'epic' })],
    },
    {
      id: 'forever-and-a-day',
      name: 'Forever And A Day',
      icon: 'quest',
      pl: 88,
      objectives: [missions(3, ['fight-the-storm', 'deliver-the-bomb', 'retrieve-the-data'], 88)],
      rewards: [res('storm-shard', 5)],
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
      rewards: [res('schematic-xp', 8500), item('ranged', { rarity: 'epic' })],
    },
    {
      id: 'think-outside-the-box',
      name: 'Think Outside The Box',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(2, ['deliver-the-bomb', 'fight-the-storm', 'fight-the-category-3-storm'], 88),
      ],
      rewards: [res('survivor-xp', 136000), item('survivor', { rarity: 'epic' })],
    },
    {
      id: 'civic-duty',
      name: 'Civic Duty',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['fight-the-storm', 'fight-the-category-2-storm', 'retrieve-the-data'], 88),
      ],
      rewards: [res('schematic-xp', 8500), item('melee', { rarity: 'epic' })],
    },
    {
      id: 'hunker-down',
      name: 'Hunker Down',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['ride-the-lightning', 'fight-the-storm', 'repair-the-shelter'], 88),
      ],
      rewards: [res('hero-xp', 8500), item('defender', { rarity: 'epic' })],
    },
    {
      id: 'pick-up-the-pace',
      name: 'Pick Up The Pace',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(2, ['deliver-the-bomb', 'retrieve-the-data', 'fight-the-category-2-storm'], 88),
      ],
      rewards: [res('schematic-xp', 8500), item('schematic', { rarity: 'epic' })],
    },
    {
      id: 'come-husk-or-high-water',
      name: 'Come Husk Or High Water',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['evacuate-the-shelter', 'repair-the-shelter', 'retrieve-the-data'], 88),
      ],
      rewards: [res('training-manual', 325), res('trap-designs', 325)],
    },
    {
      id: 'point-of-no-return',
      name: 'Point of No Return',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['ride-the-lightning', 'fight-the-category-3-storm', 'fight-the-storm'], 88),
      ],
      rewards: [res('schematic-xp', 8500), item('trap', { rarity: 'epic' })],
    },
    {
      id: 'under-the-gun',
      name: 'Under The Gun',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(2, ['fight-the-category-2-storm', 'deliver-the-bomb', 'ride-the-lightning'], 88),
      ],
      rewards: [res('survivor-xp', 136000), item('survivor', { rarity: 'epic' })],
    },
    {
      id: 'the-extra-mile',
      name: 'The Extra Mile',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['repair-the-shelter', 'evacuate-the-shelter', 'retrieve-the-data'], 88),
      ],
      rewards: [res('mini-llama', 2)],
    },
    {
      id: 'to-the-bitter-end',
      name: 'To The Bitter End',
      icon: 'quest',
      pl: 88,
      objectives: [missions(2, ['deliver-the-bomb', 'ride-the-lightning', 'fight-the-storm'], 88)],
      rewards: [res('active-powercell', 4)],
    },
    {
      id: 'do-or-die',
      name: 'Do Or Die',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['fight-the-storm', 'fight-the-category-3-storm', 'repair-the-shelter'], 88),
      ],
      rewards: [res('schematic-xp', 8500), item('melee', { rarity: 'epic' })],
    },
    {
      id: 'no-holds-barred',
      name: 'No Holds Barred',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'evacuate-the-shelter', 'deliver-the-bomb'], 88),
      ],
      rewards: [res('survivor-xp', 136000), item('survivor', { rarity: 'epic' })],
    },
    {
      id: 'this-means-war',
      name: 'This Means War',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(2, ['repair-the-shelter', 'ride-the-lightning', 'retrieve-the-data'], 88),
      ],
      rewards: [res('hero-xp', 8500)],
    },
    {
      id: 'easy-as-pie',
      name: 'Easy As Pie',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['fight-the-storm', 'evacuate-the-shelter', 'fight-the-category-2-storm'], 88),
      ],
      rewards: [res('shadowshard-crystal', 8), res('rotating-gizmo', 4)],
    },
    {
      id: 'stay-tuned',
      name: 'Stay Tuned',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(2, ['retrieve-the-data', 'repair-the-shelter', 'fight-the-category-2-storm'], 88),
      ],
      rewards: [res('schematic-xp', 8500), item('schematic', { rarity: 'epic' })],
    },
    {
      id: 'about-face',
      name: 'About Face',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['deliver-the-bomb', 'fight-the-category-2-storm', 'ride-the-lightning'], 88),
      ],
      rewards: [res('survivor-xp', 136000), item('survivor', { rarity: 'epic' })],
    },
    {
      id: 'rhyme-or-reason',
      name: 'Rhyme or Reason',
      icon: 'quest',
      pl: 88,
      objectives: [
        missions(3, ['repair-the-shelter', 'fight-the-storm', 'evacuate-the-shelter'], 88),
      ],
      rewards: [
        res('survivor-xp', 8500),
        item('hero', { name: 'Shockblaster Buzz', rarity: 'epic' }),
      ],
    },
    {
      id: 'twine-peaks-storm-shield-defense-4',
      name: 'Twine Peaks Storm Shield Defense 4',
      icon: 'ssd',
      ssd: 4,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('5-Star Evolution', 'Эволюция до 5★'),
        unlock('Expeditions: Helicopter slot 3', 'Экспедиции: вертолёт, слот 3'),
        unlock(
          'Survivor squad slots: The Think Tank 4, 5 and 6',
          'Слоты отряда выживших: The Think Tank 4, 5 и 6',
        ),
      ],
    },
    {
      id: 'bite-the-bullet',
      name: 'Bite the Bullet',
      icon: 'quest',
      pl: 94,
      objectives: [missions(2, ['deliver-the-bomb', 'ride-the-lightning', 'fight-the-storm'], 94)],
      rewards: [res('schematic-xp', 9000), item('trap', { rarity: 'epic' })],
    },
    {
      id: 'fight-fire-with-fire',
      name: 'Fight Fire With Fire',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['retrieve-the-data', 'repair-the-shelter', 'fight-the-category-2-storm'], 94),
      ],
      rewards: [item('melee', { rarity: 'epic' }), item('ranged', { rarity: 'epic' })],
    },
    {
      id: 'when-it-rains-it-pours',
      name: 'When It Rains, It Pours',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['evacuate-the-shelter', 'deliver-the-bomb', 'repair-the-shelter'], 94),
      ],
      rewards: [res('hero-xp', 9000)],
    },
    {
      id: 'in-the-nick-of-time',
      name: 'In The Nick Of Time',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(2, ['fight-the-storm', 'ride-the-lightning', 'fight-the-category-3-storm'], 94),
      ],
      rewards: [res('storm-shard', 5)],
    },
    {
      id: 'go-your-own-way',
      name: 'Go Your Own Way',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-category-2-storm', 'repair-the-shelter'], 94),
      ],
      rewards: [res('survivor-xp', 144000), item('survivor', { rarity: 'epic' })],
    },
    {
      id: 'dont-sweat-it',
      name: "Don't Sweat It",
      icon: 'quest',
      pl: 94,
      objectives: [missions(2, ['ride-the-lightning', 'deliver-the-bomb', 'fight-the-storm'], 94)],
      rewards: [res('schematic-xp', 9000), item('schematic', { rarity: 'epic' })],
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
      rewards: [
        res('hero-xp', 9250),
        item('hero', { name: 'Power B.A.S.E. Knox', rarity: 'epic' }),
      ],
    },
    {
      id: 'rise-and-shine',
      name: 'Rise and Shine',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'ride-the-lightning', 'repair-the-shelter'], 94),
      ],
      rewards: [res('active-powercell', 5)],
    },
    {
      id: 'bragging-rights',
      name: 'Bragging Rights',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(2, ['retrieve-the-data', 'fight-the-category-2-storm', 'deliver-the-bomb'], 94),
      ],
      rewards: [res('schematic-xp', 9000), item('ranged', { rarity: 'epic' })],
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
      rewards: [res('survivor-xp', 144000), item('survivor', { rarity: 'epic' })],
    },
    {
      id: 'wing-it',
      name: 'Wing It',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['evacuate-the-shelter', 'retrieve-the-data', 'ride-the-lightning'], 94),
      ],
      rewards: [res('hero-xp', 9250)],
    },
    {
      id: 'play-the-field',
      name: 'Play the Field',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(2, ['fight-the-storm', 'fight-the-category-3-storm', 'deliver-the-bomb'], 94),
      ],
      rewards: [res('training-manual', 325), res('trap-designs', 325)],
    },
    {
      id: 'even-keel',
      name: 'Even Keel',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['retrieve-the-data', 'repair-the-shelter', 'fight-the-category-2-storm'], 94),
      ],
      rewards: [res('hero-xp', 9250)],
    },
    {
      id: 'no-strings-attached',
      name: 'No Strings Attached',
      icon: 'quest',
      pl: 94,
      objectives: [missions(2, ['deliver-the-bomb', 'fight-the-storm', 'ride-the-lightning'], 94)],
      rewards: [res('mini-llama', 2)],
    },
    {
      id: 'stick-to-your-guns',
      name: 'Stick To Your Guns',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['repair-the-shelter', 'retrieve-the-data', 'fight-the-category-2-storm'], 94),
      ],
      rewards: [res('hero-xp', 9250)],
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
      rewards: [res('survivor-xp', 148000)],
    },
    {
      id: 'the-sky-is-the-limit',
      name: 'The Sky Is The Limit',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'fight-the-storm', 'repair-the-shelter'], 94),
      ],
      rewards: [res('shadowshard-crystal', 8), res('rotating-gizmo', 4)],
    },
    {
      id: 'draw-the-line',
      name: 'Draw the Line',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['retrieve-the-data', 'ride-the-lightning', 'deliver-the-bomb'], 94),
      ],
      rewards: [res('survivor-xp', 144000)],
    },
    {
      id: 'its-not-a-problem-its-opportunity',
      name: "It's Not A Problem, It's Opportunity",
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(2, ['fight-the-category-3-storm', 'evacuate-the-shelter', 'fight-the-storm'], 94),
      ],
      rewards: [res('hero-xp', 9250)],
    },
    {
      id: 'road-to-nowhere',
      name: 'Road to Nowhere',
      icon: 'quest',
      pl: 94,
      objectives: [
        missions(3, ['ride-the-lightning', 'repair-the-shelter', 'deliver-the-bomb'], 94),
      ],
      rewards: [res('schematic-xp', 9250)],
    },
    {
      id: 'twine-peaks-storm-shield-defense-5',
      name: 'Twine Peaks Storm Shield Defense 5',
      icon: 'ssd',
      ssd: 5,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Expeditions: Truck slot 5', 'Экспедиции: грузовик, слот 5'),
        unlock('Storm Shield Defender 5/5', 'Защитник на щите бури 5/5'),
        unlock(
          'Survivor squad slots: Gadgeteers and Close Assault 7',
          'Слоты отряда выживших: Gadgeteers и Close Assault 7',
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
      rewards: [res('schematic-xp', 9500)],
    },
    {
      id: 'greener-pastures',
      name: 'Greener Pastures',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['fight-the-category-3-storm', 'repair-the-shelter', 'retrieve-the-data'], 100),
      ],
      rewards: [res('survivor-xp', 152000)],
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
      rewards: [res('schematic-xp', 9500)],
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
      rewards: [res('active-powercell', 5)],
    },
    {
      id: 'variety-is-the-spice-of-life',
      name: 'Variety is the Spice of Life',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(3, ['fight-the-storm', 'evacuate-the-shelter', 'deliver-the-bomb'], 100),
      ],
      rewards: [res('hero-xp', 9500)],
    },
    {
      id: 'bump-in-the-road',
      name: 'Bump in the Road',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['repair-the-shelter', 'retrieve-the-data', 'ride-the-lightning'], 100),
      ],
      rewards: [res('survivor-xp', 152000)],
    },
    {
      id: 'tried-and-true',
      name: 'Tried and True',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['deliver-the-bomb', 'fight-the-storm', 'fight-the-category-2-storm'], 100),
      ],
      rewards: [res('schematic-xp', 10000)],
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
      rewards: [res('survivor-xp', 160000)],
    },
    {
      id: 'so-close-you-can-taste-it',
      name: 'So Close You Can Taste It',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['fight-the-category-2-storm', 'repair-the-shelter', 'deliver-the-bomb'], 100),
      ],
      rewards: [res('mini-llama', 2)],
    },
    {
      id: 'figure-it-out',
      name: 'Figure It Out',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(3, ['evacuate-the-shelter', 'fight-the-storm', 'fight-the-category-3-storm'], 100),
      ],
      rewards: [res('hero-xp', 10000)],
    },
    {
      id: 'a-snails-pace',
      name: "A Snail's Pace",
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['retrieve-the-data', 'ride-the-lightning', 'fight-the-category-2-storm'], 100),
      ],
      rewards: [res('survivor-xp', 152000)],
    },
    {
      id: 'end-over-end',
      name: 'End Over End',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'deliver-the-bomb', 'repair-the-shelter'], 100),
      ],
      rewards: [item('survivor', { rarity: 'legendary' })],
    },
    {
      id: 'nip-it-in-the-bud',
      name: 'Nip It in the Bud',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['fight-the-category-2-storm', 'retrieve-the-data', 'fight-the-storm'], 100),
      ],
      rewards: [item('defender', { rarity: 'legendary' })],
    },
    {
      id: 'grin-and-bear-it',
      name: 'Grin and Bear It',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['deliver-the-bomb', 'fight-the-category-3-storm', 'repair-the-shelter'], 100),
      ],
      rewards: [res('hero-xp', 10000)],
    },
    {
      id: 'high-maintenance',
      name: 'High Maintenance',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(3, ['ride-the-lightning', 'retrieve-the-data', 'fight-the-storm'], 100),
      ],
      rewards: [item('ranged', { rarity: 'legendary' })],
    },
    {
      id: 'to-make-your-mark',
      name: 'To Make Your Mark',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['evacuate-the-shelter', 'deliver-the-bomb', 'repair-the-shelter'], 100),
      ],
      rewards: [res('training-manual', 325), res('trap-designs', 325)],
    },
    {
      id: 'its-not-over-until-its-over',
      name: "It's Not Over Until It's Over",
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-storm', 'ride-the-lightning'], 100),
      ],
      rewards: [item('melee', { rarity: 'legendary' })],
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
      rewards: [res('shadowshard-crystal', 11), res('rotating-gizmo', 5)],
    },
    {
      id: 'a-last-ditch-effort',
      name: 'A Last Ditch Effort',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(2, ['fight-the-category-2-storm', 'retrieve-the-data', 'deliver-the-bomb'], 100),
      ],
      rewards: [item('trap', { rarity: 'legendary' })],
    },
    {
      id: 'last-but-not-least',
      name: 'Last, But Not Least',
      icon: 'quest',
      pl: 100,
      objectives: [
        missions(3, ['ride-the-lightning', 'fight-the-storm', 'evacuate-the-shelter'], 100),
      ],
      rewards: [res('schematic-xp', 10000)],
    },
    {
      id: 'twine-peaks-storm-shield-defense-6',
      name: 'Twine Peaks Storm Shield Defense 6',
      icon: 'ssd',
      ssd: 6,
      objectives: [ssd()],
      rewards: [
        vb(100),
        unlock('Expeditions: Helicopter slot 4', 'Экспедиции: вертолёт, слот 4'),
        unlock('Expeditions: Speed Boat slot 5', 'Экспедиции: катер, слот 5'),
        unlock(
          'Survivor squad slots: Training Team and The Think Tank 7',
          'Слоты отряда выживших: Training Team и The Think Tank 7',
        ),
      ],
    },
  ],
};
