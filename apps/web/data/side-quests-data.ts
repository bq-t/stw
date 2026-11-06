// Generated from the Fortnite wiki ("Side Quests", "Challenge Quests", 2026-11-04), then edited by hand.
// This file is the source of truth now: fix mistakes here, do not regenerate.
import { item, missions, res, text, unlock, vb } from './questline';
import type { ChallengeSeries, SideGroupId, SideQuest } from './side-quests';

export const SIDE_QUESTS: Record<SideGroupId, SideQuest[]> = {
  stonewood: [
    {
      id: 'ol-woody',
      name: "Ol' Woody",
      objectives: [
        text(
          'Complete Stonewood Storm Shield Defense 1',
          'Пройдите защиту штормового щита 1 в Камнелесье',
        ),
      ],
      rewards: [item('pickaxe', { name: "Ol' Woody", rarity: 'uncommon' })],
    },
    {
      id: 'basic-basher',
      name: 'Basic Basher',
      objectives: [
        text(
          'Complete the Before and After Science quest',
          'Выполните квест Before and After Science',
        ),
      ],
      rewards: [item('pickaxe', { name: 'Basic Basher', rarity: 'uncommon' })],
    },
    {
      id: 'tech-axe',
      name: 'Tech Axe',
      objectives: [
        text(
          'Earn the level 1 Pickaxe upgrade (Command → Upgrades → Tools)',
          'Получите улучшение кирки 1-го уровня (Командование → Улучшения → Инструменты)',
        ),
      ],
      rewards: [item('pickaxe', { name: 'Tech Axe', rarity: 'uncommon' })],
    },
    {
      id: 'hydraulic-wrecker',
      name: 'Hydraulic Wrecker',
      objectives: [
        text('Earn the level 2 Pickaxe upgrade', 'Получите улучшение кирки 2-го уровня'),
      ],
      rewards: [item('pickaxe', { name: 'Hydraulic Wrecker', rarity: 'uncommon' })],
    },
    {
      id: 'vindertech-elite',
      name: 'Vindertech Elite',
      objectives: [
        text('Earn the level 4 Pickaxe upgrade', 'Получите улучшение кирки 4-го уровня'),
      ],
      rewards: [item('pickaxe', { name: 'Vindertech Elite', rarity: 'uncommon' })],
    },
    {
      id: 'laser-pick',
      name: 'Laser Pick',
      objectives: [
        text('Earn the level 6 Pickaxe upgrade', 'Получите улучшение кирки 6-го уровня'),
      ],
      rewards: [item('pickaxe', { name: 'Laser Pick', rarity: 'uncommon' })],
    },
    {
      id: 'troll-thieves',
      name: 'Troll Thieves',
      objectives: [
        text(
          'Whack 2 Trolls in successful missions in a 5+ zone',
          'Отлупите 2 троллей в успешных миссиях в зоне 5+',
        ),
      ],
      rewards: [res('schematic-xp', 1500), item('melee')],
    },
    {
      id: 'group-effort',
      name: 'Group Effort',
      objectives: [
        text(
          'Complete 2 Play with Others missions in Stonewood',
          'Выполните 2 миссии в режиме «Играть с другими» в Камнелесье',
        ),
      ],
      rewards: [item('ranged', { name: 'Ranger' }), item('ranged', { name: 'Deathstalker' })],
    },
    {
      id: 'the-prestige',
      name: 'The Prestige',
      objectives: [text('Complete 3 missions in a 10+ zone', 'Выполните 3 миссии в зоне 10+')],
      rewards: [res('hero-xp', 2500), item('hero', { name: 'Survivalist Jonesy', rarity: 'rare' })],
    },
    {
      id: 'troll-key',
      name: 'Troll Key',
      objectives: [text('Find the Troll Key in a 10+ zone', 'Найдите ключ тролля в зоне 10+')],
      rewards: [res('schematic-xp', 2000), item('trap', { rarity: 'rare' })],
    },
    {
      id: 'epic-troll-stash',
      name: 'Epic Troll Stash',
      objectives: [
        text('Find the Troll Loot Stash in a 10+ zone', 'Найдите тайник тролля в зоне 10+'),
      ],
      rewards: [item('melee', { rarity: 'epic' }), item('ranged', { rarity: 'epic' })],
    },
    {
      id: 'stonewood-storm-shield-defense-7',
      name: 'Stonewood Storm Shield Defense 7',
      objectives: [
        text(
          'Complete Stonewood Storm Shield Defense 7',
          'Пройдите защиту штормового щита 7 в Камнелесье',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'stonewood-storm-shield-defense-8',
      name: 'Stonewood Storm Shield Defense 8',
      objectives: [
        text(
          'Complete Stonewood Storm Shield Defense 8',
          'Пройдите защиту штормового щита 8 в Камнелесье',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'stonewood-storm-shield-defense-9',
      name: 'Stonewood Storm Shield Defense 9',
      objectives: [
        text(
          'Complete Stonewood Storm Shield Defense 9',
          'Пройдите защиту штормового щита 9 в Камнелесье',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'stonewood-storm-shield-defense-10',
      name: 'Stonewood Storm Shield Defense 10',
      objectives: [
        text(
          'Complete Stonewood Storm Shield Defense 10',
          'Пройдите защиту штормового щита 10 в Камнелесье',
        ),
      ],
      rewards: [unlock('Hero Loadout', 'Новый набор героев'), vb(150)],
    },
    {
      id: 'stonewood-endurance-defense',
      name: 'Stonewood Endurance Defense',
      objectives: [
        text(
          'Complete wave 30 of Endurance Defense in Stonewood',
          'Пройдите 30-ю волну обороны на выносливость в Камнелесье',
        ),
      ],
      rewards: [res('upgrade-llama', 1), item('banner', { name: 'Stonewood Endurance Banner' })],
    },
  ],
  plankerton: [
    {
      id: 'save-the-world',
      name: 'Save the World',
      objectives: [
        text(
          'Save 100 Survivors in successful missions',
          'Спасите 100 выживших в успешных миссиях',
        ),
      ],
      rewards: [res('gold', 100)],
    },
    {
      id: 'husk-takedown',
      name: 'Husk Takedown',
      objectives: [
        text(
          'Eliminate 1,000 Husks in successful missions in a 40+ zone',
          'Уничтожьте 1 000 хасков в успешных миссиях в зоне 40+',
        ),
      ],
      rewards: [res('flux', 30, 'rare')],
    },
    {
      id: 'mist-monster-hunter',
      name: 'Mist Monster Hunter',
      objectives: [
        text(
          'Eliminate 100 Mist Monsters in successful missions in a 40+ zone',
          'Уничтожьте 100 туманных монстров в успешных миссиях в зоне 40+',
        ),
      ],
      rewards: [res('gold', 100)],
    },
    {
      id: 'portraits-of-someone-special',
      name: 'Portraits of Someone Special',
      objectives: [
        text(
          'Gather 10 portraits of Karolina in a 40+ zone',
          'Соберите 10 портретов Каролины в зоне 40+',
        ),
      ],
      rewards: [res('survivor-xp', 30000), item('survivor', { name: 'Karolina' })],
    },
    {
      id: 'joels-pub',
      name: "Joel's Pub",
      objectives: [
        text(
          "Visit Joel's Pub twice in a 40+ zone (found in City zones)",
          'Дважды посетите паб Джоэла в зоне 40+ (встречается в городе)',
        ),
      ],
      rewards: [res('survivor-xp', 30000), item('survivor', { name: 'Joel' })],
    },
    {
      id: 'plankerton-storm-shield-defense-7',
      name: 'Plankerton Storm Shield Defense 7',
      objectives: [
        text(
          'Complete Plankerton Storm Shield Defense 7',
          'Пройдите защиту штормового щита 7 в Планкертоне',
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
          'Пройдите защиту штормового щита 8 в Планкертоне',
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
          'Пройдите защиту штормового щита 9 в Планкертоне',
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
          'Пройдите защиту штормового щита 10 в Планкертоне',
        ),
      ],
      rewards: [unlock('Hero Loadout', 'Новый набор героев'), vb(150)],
    },
    {
      id: 'plankerton-endurance-defense',
      name: 'Plankerton Endurance Defense',
      objectives: [
        text(
          'Complete wave 30 of Endurance Defense in Plankerton',
          'Пройдите 30-ю волну обороны на выносливость в Планкертоне',
        ),
      ],
      rewards: [res('upgrade-llama', 1), item('banner', { name: 'Plankerton Endurance Banner' })],
    },
  ],
  'canny-valley': [
    {
      id: 'boots-on-the-ground',
      name: 'Boots on the Ground',
      objectives: [
        text(
          'Complete 2 Play with Others missions in Canny Valley',
          'Выполните 2 миссии в режиме «Играть с другими» в Вещей долине',
        ),
      ],
      rewards: [res('gold', 45)],
    },
    {
      id: 'smashing',
      name: 'Smashing!',
      objectives: [
        text(
          'Eliminate 15 Mist Monsters in successful missions in a 22+ zone',
          'Уничтожьте 15 туманных монстров в успешных миссиях в зоне 22+',
        ),
      ],
      rewards: [res('perk-up', 75, 'rare'), res('schematic-xp', 4000)],
    },
    {
      id: 'bring-them-home',
      name: 'Bring Them Home',
      objectives: [
        text('Save 15 Survivors in successful missions', 'Спасите 15 выживших в успешных миссиях'),
      ],
      rewards: [res('hero-xp', 4000), res('flux', 45, 'rare')],
    },
    {
      id: 'triple-threat',
      name: 'Triple Threat',
      objectives: [missions(2, ['fight-the-category-3-storm'], 22)],
      rewards: [res('gold', 45), res('schematic-xp', 4000)],
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
      rewards: [res('malachite-ore', 5), res('rotating-gizmo', 2)],
    },
    {
      id: 'all-husks-breaks-loose',
      name: 'All Husks Breaks Loose',
      objectives: [
        missions(3, ['evacuate-the-shelter', 'fight-the-storm', 'retrieve-the-data'], 22),
      ],
      rewards: [res('lightning-in-a-bottle', 10), res('schematic-xp', 4000)],
    },
    {
      id: 'better-safe-than-sorry',
      name: 'Better Safe Than Sorry',
      objectives: [
        missions(3, ['ride-the-lightning', 'fight-the-category-2-storm', 'repair-the-shelter'], 22),
      ],
      rewards: [res('re-perk', 200), res('schematic-xp', 4000)],
    },
    {
      id: 'no-pain-no-gain',
      name: 'No Pain, No Gain',
      objectives: [
        missions(2, ['deliver-the-bomb', 'retrieve-the-data', 'evacuate-the-shelter'], 22),
      ],
      rewards: [res('gold', 150)],
    },
    {
      id: 'something-suddenly-came-up',
      name: 'Something Suddenly Came Up',
      objectives: [
        missions(3, ['ride-the-lightning', 'deliver-the-bomb', 'fight-the-category-2-storm'], 22),
      ],
      rewards: [res('mini-llama', 2)],
    },
    {
      id: 'deal-with-it',
      name: 'Deal with It',
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'retrieve-the-data', 'repair-the-shelter'], 22),
      ],
      rewards: [res('flux', 45, 'rare'), res('schematic-xp', 4000)],
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
      rewards: [res('hero-xp', 4000), res('perk-up', 75, 'rare')],
    },
    {
      id: 'save-the-teddy-bears',
      name: 'Save the Teddy Bears!',
      objectives: [
        text(
          'Loot 5 Teddy Bears in successful missions in a 22+ zone',
          'Обыщите 5 плюшевых медведей в успешных миссиях в зоне 22+',
        ),
      ],
      rewards: [res('hero-xp', 4000), item('hero', { name: 'Ranger', rarity: 'rare' })],
    },
    {
      id: 'mission-redux',
      name: 'Mission Redux',
      objectives: [missions(3, ['deliver-the-bomb', 'retrieve-the-data', 'fight-the-storm'], 22)],
      rewards: [res('lightning-in-a-bottle', 10)],
    },
    {
      id: 'a-call-to-action',
      name: 'A Call to Action!',
      objectives: [
        missions(3, ['repair-the-shelter', 'fight-the-category-2-storm', 'ride-the-lightning'], 22),
      ],
      rewards: [res('schematic-xp', 4000), item('ranged', { weapon: 'sniper' })],
    },
    {
      id: 'quad-squad',
      name: 'Quad Squad',
      objectives: [missions(1, ['fight-the-category-4-storm'], 24)],
      rewards: [res('mini-llama', 2)],
    },
    {
      id: 'what-is-this-thing',
      name: 'What IS This Thing?',
      objectives: [
        text(
          'Smash 3 anomalies in successful missions in a 24+ zone',
          'Разбейте 3 аномалии в успешных миссиях в зоне 24+',
        ),
      ],
      rewards: [res('gold', 150)],
    },
    {
      id: 'decamp',
      name: 'Decamp',
      objectives: [
        text(
          'Clear 5 Husk encampments in successful missions in a 24+ zone',
          'Уничтожьте 5 лагерей хасков в успешных миссиях в зоне 24+',
        ),
      ],
      rewards: [res('survivor-xp', 54000), res('flux', 15, 'epic')],
    },
    {
      id: 'gimme-shelter',
      name: 'Gimme Shelter',
      objectives: [missions(3, ['repair-the-shelter'], 24)],
      rewards: [res('survivor-xp', 54000), item('lead-survivor')],
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
      rewards: [res('perk-up', 115, 'epic'), res('schematic-xp', 4500)],
    },
    {
      id: 'par-for-the-course',
      name: 'Par for the Course',
      objectives: [
        missions(2, ['ride-the-lightning', 'retrieve-the-data', 'deliver-the-bomb'], 24),
      ],
      rewards: [res('malachite-ore', 5), res('rotating-gizmo', 3)],
    },
    {
      id: 'a-shot-in-the-dark',
      name: 'A Shot in the Dark',
      objectives: [
        missions(2, ['fight-the-storm', 'fight-the-category-2-storm', 'repair-the-shelter'], 24),
      ],
      rewards: [res('hero-xp', 4500), res('eye-of-the-storm', 15)],
    },
    {
      id: 'to-husk-in-a-hand-basket',
      name: 'To Husk in a Hand Basket',
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-category-3-storm', 'ride-the-lightning'], 24),
      ],
      rewards: [res('training-manual', 200), res('trap-designs', 200), res('weapon-designs', 200)],
    },
    {
      id: 'back-to-square-one',
      name: 'Back to Square One',
      objectives: [
        missions(2, ['deliver-the-bomb', 'repair-the-shelter', 'evacuate-the-shelter'], 24),
      ],
      rewards: [res('gold', 150), res('schematic-xp', 4500)],
    },
    {
      id: 'mission-critical',
      name: 'Mission Critical',
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'ride-the-lightning', 'retrieve-the-data'], 24),
      ],
      rewards: [res('active-powercell', 3)],
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
      rewards: [res('re-perk', 200), res('schematic-xp', 4500)],
    },
    {
      id: 'setting-ground-rules',
      name: 'Setting Ground Rules',
      objectives: [
        missions(2, ['ride-the-lightning', 'fight-the-category-3-storm', 'fight-the-storm'], 24),
      ],
      rewards: [res('flux', 45, 'epic'), res('schematic-xp', 4500)],
    },
    {
      id: 'bring-it',
      name: 'Bring It',
      objectives: [
        missions(3, ['evacuate-the-shelter', 'deliver-the-bomb', 'fight-the-category-2-storm'], 24),
      ],
      rewards: [res('lightning-in-a-bottle', 15)],
    },
    {
      id: 'bear-down',
      name: 'Bear Down',
      objectives: [
        missions(3, ['deliver-the-bomb', 'repair-the-shelter', 'fight-the-category-3-storm'], 24),
      ],
      rewards: [res('survivor-xp', 54000), res('perk-up', 115, 'epic')],
    },
    {
      id: 'storms-are-brewin',
      name: "Storms Are Brewin'",
      objectives: [missions(2, ['fight-the-category-2-storm'], 24)],
      rewards: [res('hero-xp', 4500), item('hero', { name: 'Tank Penny', rarity: 'rare' })],
    },
    {
      id: 'help-wanted',
      name: 'Help Wanted!',
      objectives: [
        missions(3, ['evacuate-the-shelter', 'fight-the-storm', 'retrieve-the-data'], 24),
      ],
      rewards: [res('hero-xp', 4500), item('defender')],
    },
    {
      id: 'unexpected-meetings',
      name: 'Unexpected Meetings',
      objectives: [missions(2, ['evacuate-the-survivors'], 26)],
      rewards: [res('hero-xp', 5000), item('hero', { name: 'Survivalist Jonesy', rarity: 'epic' })],
    },
    {
      id: 'goods-and-services',
      name: 'Goods and Services',
      objectives: [missions(1, ['deliver-the-bomb'], 26)],
      rewards: [res('re-perk', 200)],
    },
    {
      id: 'far-flung',
      name: 'Far Flung',
      objectives: [
        text(
          'Eliminate 20 Mist Monsters in successful missions in a 26+ zone',
          'Уничтожьте 20 туманных монстров в успешных миссиях в зоне 26+',
        ),
      ],
      rewards: [res('schematic-xp', 5000), item('ranged')],
    },
    {
      id: 'blast-from-the-past',
      name: 'Blast from the Past',
      objectives: [missions(2, ['fight-the-category-4-storm'], 26)],
      rewards: [res('survivor-xp', 60000), item('lead-survivor')],
    },
    {
      id: 'history-repeats-itself',
      name: 'History Repeats Itself',
      objectives: [
        missions(3, ['retrieve-the-data', 'evacuate-the-shelter', 'ride-the-lightning'], 26),
      ],
      rewards: [res('schematic-xp', 5000), item('melee')],
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
      rewards: [res('hero-xp', 5000), item('defender')],
    },
    {
      id: 'time-and-again',
      name: 'Time and Again',
      objectives: [
        missions(2, ['retrieve-the-data', 'ride-the-lightning', 'fight-the-category-3-storm'], 26),
      ],
      rewards: [res('schematic-xp', 5000), item('schematic')],
    },
    {
      id: 'go-for-broke',
      name: 'Go for Broke',
      objectives: [missions(3, ['deliver-the-bomb', 'fight-the-storm', 'retrieve-the-data'], 26)],
      rewards: [res('training-manual', 200), res('trap-designs', 200), res('weapon-designs', 200)],
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
      rewards: [res('schematic-xp', 5000), item('trap')],
    },
    {
      id: 'business-at-hand',
      name: 'Business at Hand',
      objectives: [
        missions(2, ['ride-the-lightning', 'repair-the-shelter', 'retrieve-the-data'], 26),
      ],
      rewards: [res('survivor-xp', 60000), item('melee')],
    },
    {
      id: 'tooth-and-nail',
      name: 'Tooth and Nail',
      objectives: [missions(3, ['retrieve-the-data', 'deliver-the-bomb', 'fight-the-storm'], 26)],
      rewards: [res('mini-llama', 2)],
    },
    {
      id: 'live-and-learn',
      name: 'Live and Learn',
      objectives: [
        missions(2, ['repair-the-shelter', 'evacuate-the-shelter', 'ride-the-lightning'], 26),
      ],
      rewards: [res('active-powercell', 4)],
    },
    {
      id: 'up-the-ante',
      name: 'Up the Ante',
      objectives: [
        missions(3, ['fight-the-storm', 'retrieve-the-data', 'fight-the-category-2-storm'], 26),
      ],
      rewards: [res('schematic-xp', 5000), item('melee')],
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
      rewards: [res('survivor-xp', 60000), item('lead-survivor')],
    },
    {
      id: 'haste-makes-waste',
      name: 'Haste Makes Waste',
      objectives: [
        missions(2, ['fight-the-category-2-storm', 'fight-the-storm', 'deliver-the-bomb'], 26),
      ],
      rewards: [res('eye-of-the-storm', 5), item('lead-survivor')],
    },
    {
      id: 'safe-cracker',
      name: 'Safe Cracker',
      objectives: [
        text(
          'Loot 5 Safes in successful missions in a 26+ zone',
          'Вскройте 5 сейфов в успешных миссиях в зоне 26+',
        ),
      ],
      rewards: [res('hero-xp', 5000), item('hero', { name: 'Trailblazer Quinn', rarity: 'epic' })],
    },
    {
      id: 'all-heroes-are-welcome',
      name: 'All Heroes are Welcome!',
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'ride-the-lightning', 'fight-the-storm'], 26),
      ],
      rewards: [res('hero-xp', 5000), item('defender')],
    },
    {
      id: 'dangerous-assignments',
      name: 'Dangerous assignments',
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'ride-the-lightning', 'deliver-the-bomb'], 24),
      ],
      rewards: [res('schematic-xp', 4500), item('ranged', { weapon: 'pistol' })],
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
      rewards: [res('survivor-xp', 54000), item('survivor')],
    },
    {
      id: 'please-stand-up',
      name: 'Please Stand Up...',
      objectives: [
        text(
          'Destroy 2 Mimics in successful missions in a 28+ zone',
          'Уничтожьте 2 мимиков в успешных миссиях в зоне 28+',
        ),
      ],
      rewards: [res('schematic-xp', 6000), item('trap')],
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
      rewards: [item('ranged', { weapon: 'assault', rarity: 'epic' }), item('ranged')],
    },
    {
      id: 'takers-weepers',
      name: 'Takers Weepers',
      objectives: [
        text(
          'Eliminate 25 Mist Monsters in successful missions in a 28+ zone',
          'Уничтожьте 25 туманных монстров в успешных миссиях в зоне 28+',
        ),
      ],
      rewards: [res('hero-xp', 6000), item('hero', { name: 'Hype', rarity: 'epic' })],
    },
    {
      id: 'trololo',
      name: 'Trololo',
      objectives: [
        text(
          'Whack a Troll in a successful mission in a 28+ zone',
          'Отлупите тролля в успешной миссии в зоне 28+',
        ),
      ],
      rewards: [res('eye-of-the-storm', 10)],
    },
    {
      id: 'home-invasion',
      name: 'Home Invasion',
      objectives: [missions(3, ['destroy-the-encampments'], 28)],
      rewards: [res('survivor-xp', 72000), item('survivor')],
    },
    {
      id: 'operation-save-them-all',
      name: 'Operation: Save Them All!',
      objectives: [text('Complete 2 missions in a 28+ zone', 'Выполните 2 миссии в зоне 28+')],
      rewards: [res('schematic-xp', 6000)],
    },
    {
      id: 'the-road-less-traveled',
      name: 'The Road Less Traveled',
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'repair-the-shelter', 'deliver-the-bomb'], 28),
      ],
      rewards: [item('hero', { heroClass: 'soldier', rarity: 'epic' })],
    },
    {
      id: 'dont-look-back',
      name: "Don't Look Back",
      objectives: [missions(3, ['fight-the-storm', 'ride-the-lightning', 'retrieve-the-data'], 28)],
      rewards: [res('active-powercell', 5)],
    },
    {
      id: 'carry-the-team',
      name: 'Carry the Team',
      objectives: [
        missions(2, ['retrieve-the-data', 'fight-the-category-2-storm', 'ride-the-lightning'], 28),
      ],
      rewards: [res('survivor-xp', 72000), item('lead-survivor')],
    },
    {
      id: 'grasping-at-straws',
      name: 'Grasping at Straws',
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'evacuate-the-shelter', 'fight-the-storm'], 28),
      ],
      rewards: [item('hero', { heroClass: 'constructor', rarity: 'epic' }), item('ranged')],
    },
    {
      id: 'a-drop-in-the-bucket',
      name: 'A Drop in the Bucket',
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'ride-the-lightning', 'deliver-the-bomb'], 28),
      ],
      rewards: [res('schematic-xp', 6000)],
    },
    {
      id: 'survival-of-the-fittest',
      name: 'Survival of the Fittest',
      objectives: [
        missions(2, ['evacuate-the-shelter', 'retrieve-the-data', 'fight-the-storm'], 28),
      ],
      rewards: [res('training-manual', 200), res('trap-designs', 200), res('weapon-designs', 200)],
    },
    {
      id: 'the-big-picture',
      name: 'The Big Picture',
      objectives: [
        missions(3, ['ride-the-lightning', 'deliver-the-bomb', 'fight-the-category-2-storm'], 28),
      ],
      rewards: [item('hero', { heroClass: 'outlander', rarity: 'epic' })],
    },
    {
      id: 'the-husks-dont-stand-a-chance',
      name: "The Husks Don't Stand a Chance!",
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-storm', 'fight-the-category-3-storm'], 28),
      ],
      rewards: [res('mini-llama', 2)],
    },
    {
      id: 'hands-on',
      name: 'Hands On',
      objectives: [
        missions(3, ['evacuate-the-shelter', 'fight-the-category-2-storm', 'deliver-the-bomb'], 28),
      ],
      rewards: [item('hero', { heroClass: 'ninja', rarity: 'epic' })],
    },
    {
      id: 'second-wind',
      name: 'Second Wind',
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'retrieve-the-data', 'ride-the-lightning'], 28),
      ],
      rewards: [res('survivor-xp', 78000), item('survivor')],
    },
    {
      id: 'twin-blast',
      name: 'Twin Blast',
      objectives: [missions(3, ['fight-the-category-2-storm'], 28)],
      rewards: [res('hero-xp', 6500), item('hero', { name: 'Assassin Sarah', rarity: 'epic' })],
    },
    {
      id: 'the-storm-rages-on',
      name: 'The Storm Rages On',
      objectives: [missions(3, ['ride-the-lightning', 'deliver-the-bomb', 'fight-the-storm'], 28)],
      rewards: [res('hero-xp', 6500), item('defender')],
    },
    {
      id: 'turn-on-the-action',
      name: 'Turn on the Action',
      objectives: [
        missions(2, ['deliver-the-bomb', 'retrieve-the-data', 'fight-the-category-2-storm'], 26),
      ],
      rewards: [res('schematic-xp', 5000), item('schematic')],
    },
    {
      id: 'seeking-answers',
      name: 'Seeking Answers',
      objectives: [
        missions(3, ['evacuate-the-shelter', 'fight-the-storm', 'deliver-the-bomb'], 26),
      ],
      rewards: [item('survivor', { rarity: 'epic' })],
    },
    {
      id: 'the-missions-must-go-on',
      name: 'The Missions Must Go On',
      objectives: [
        missions(2, ['deliver-the-bomb', 'repair-the-shelter', 'evacuate-the-shelter'], 30),
      ],
      rewards: [res('schematic-xp', 7000), item('trap')],
    },
    {
      id: 'how-high',
      name: 'How High?',
      objectives: [text('Complete 3 missions in a 30+ zone', 'Выполните 3 миссии в зоне 30+')],
      rewards: [res('survivor-xp', 84000), item('survivor')],
    },
    {
      id: 'falling-down',
      name: 'Falling Down',
      objectives: [
        text(
          'Eliminate 30 Mist Monsters in successful missions in a 30+ zone',
          'Уничтожьте 30 туманных монстров в успешных миссиях в зоне 30+',
        ),
      ],
      rewards: [res('hero-xp', 7500), item('hero', { heroClass: 'soldier' })],
    },
    {
      id: 'need-more-bluglo',
      name: 'Need More BluGlo',
      objectives: [missions(2, ['refuel-the-homebase'], 30)],
      rewards: [res('active-powercell', 5)],
    },
    {
      id: 'revenge-of-the-trolls',
      name: 'Revenge of the Trolls',
      objectives: [
        text(
          'Whack a Troll in a successful mission in a 30+ zone',
          'Отлупите тролля в успешной миссии в зоне 30+',
        ),
      ],
      rewards: [res('hero-xp', 7500), item('hero', { heroClass: 'ninja' })],
    },
    {
      id: 'a-disturbance-in-the-valley',
      name: 'A Disturbance in the Valley',
      objectives: [
        text(
          'Smash 3 anomalies in successful missions in a 30+ zone',
          'Разбейте 3 аномалии в успешных миссиях в зоне 30+',
        ),
      ],
      rewards: [res('survivor-xp', 84000), item('lead-survivor')],
    },
    {
      id: 'leave-no-mission-unfinished',
      name: 'Leave No Mission Unfinished',
      objectives: [
        missions(2, ['fight-the-category-3-storm', 'deliver-the-bomb', 'ride-the-lightning'], 30),
      ],
      rewards: [res('schematic-xp', 7500), item('melee')],
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
      rewards: [res('survivor-xp', 90000), item('survivor')],
    },
    {
      id: 'just-around-the-bend',
      name: 'Just Around the Bend',
      objectives: [
        missions(2, ['evacuate-the-shelter', 'repair-the-shelter', 'ride-the-lightning'], 30),
      ],
      rewards: [res('mini-llama', 2)],
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
      rewards: [res('survivor-xp', 84000), item('lead-survivor')],
    },
    {
      id: 'go-against-the-grain',
      name: 'Go Against the Grain',
      objectives: [
        missions(3, ['deliver-the-bomb', 'fight-the-category-2-storm', 'retrieve-the-data'], 30),
      ],
      rewards: [res('schematic-xp', 7500), item('trap')],
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
      rewards: [res('hero-xp', 7500), item('defender')],
    },
    {
      id: 'high-hopes',
      name: 'High Hopes',
      objectives: [
        missions(2, ['retrieve-the-data', 'fight-the-category-2-storm', 'fight-the-storm'], 30),
      ],
      rewards: [res('hero-xp', 7500), item('hero', { heroClass: 'outlander' })],
    },
    {
      id: 'its-now-or-never',
      name: "It's Now or Never",
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'deliver-the-bomb', 'repair-the-shelter'], 30),
      ],
      rewards: [res('schematic-xp', 7500), item('ranged')],
    },
    {
      id: 'the-ends-justifies-the-means',
      name: 'The Ends Justifies the Means',
      objectives: [
        missions(3, ['fight-the-category-2-storm', 'ride-the-lightning', 'fight-the-storm'], 30),
      ],
      rewards: [res('training-manual', 200), res('trap-designs', 200), res('weapon-designs', 200)],
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
      rewards: [res('schematic-xp', 7500), item('melee')],
    },
    {
      id: 'cut-to-the-chase',
      name: 'Cut to the Chase',
      objectives: [
        missions(3, ['repair-the-shelter', 'retrieve-the-data', 'fight-the-category-2-storm'], 28),
      ],
      rewards: [res('hero-xp', 6500), item('hero')],
    },
    {
      id: 'desperate-times',
      name: 'Desperate Times',
      objectives: [
        missions(3, ['fight-the-storm', 'ride-the-lightning', 'fight-the-category-3-storm'], 28),
      ],
      rewards: [res('hero-xp', 6500), item('defender')],
    },
    {
      id: 'special-delivery',
      name: 'Special Delivery',
      objectives: [missions(1, ['deliver-the-bomb'], 30)],
      rewards: [item('ranged', { rarity: 'legendary' })],
    },
    {
      id: 'critical-objectives',
      name: 'Critical Objectives',
      objectives: [
        missions(3, ['fight-the-storm', 'repair-the-shelter', 'ride-the-lightning'], 30),
      ],
      rewards: [item('trap', { rarity: 'legendary' })],
    },
    {
      id: 'special-operations',
      name: 'Special Operations',
      objectives: [
        missions(3, ['deliver-the-bomb', 'evacuate-the-shelter', 'fight-the-category-3-storm'], 30),
      ],
      rewards: [item('survivor', { rarity: 'legendary' })],
    },
    {
      id: 'just-cause',
      name: 'Just Cause',
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-storm', 'fight-the-category-2-storm'], 30),
      ],
      rewards: [item('defender', { rarity: 'legendary' })],
    },
    {
      id: 'the-journey-continues',
      name: 'The Journey Continues',
      objectives: [
        missions(3, ['deliver-the-bomb', 'fight-the-category-3-storm', 'retrieve-the-data'], 30),
      ],
      rewards: [item('lead-survivor', { rarity: 'legendary' })],
    },
    {
      id: 'canny-valley-storm-shield-defense-7',
      name: 'Canny Valley Storm Shield Defense 7',
      objectives: [
        text(
          'Complete Canny Valley Storm Shield Defense 7',
          'Пройдите защиту штормового щита 7 в Вещей долине',
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
          'Пройдите защиту штормового щита 8 в Вещей долине',
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
          'Пройдите защиту штормового щита 9 в Вещей долине',
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
          'Пройдите защиту штормового щита 10 в Вещей долине',
        ),
      ],
      rewards: [unlock('Hero Loadout', 'Новый набор героев'), vb(150)],
    },
    {
      id: 'canny-valley-endurance-defense',
      name: 'Canny Valley Endurance Defense',
      objectives: [
        text(
          'Complete wave 30 of Endurance Defense in Canny Valley',
          'Пройдите 30-ю волну обороны на выносливость в Вещей долине',
        ),
      ],
      rewards: [res('upgrade-llama', 1), item('banner', { name: 'Canny Valley Endurance Banner' })],
    },
  ],
  'twine-peaks': [
    {
      id: 'tying-up-loose-ends',
      name: 'Tying Up Loose Ends',
      objectives: [
        missions(3, ['fight-the-category-3-storm', 'deliver-the-bomb', 'repair-the-shelter'], 32),
      ],
      rewards: [res('hero-xp', 7500), item('hero', { name: 'Shock Trooper Renegade' })],
    },
    {
      id: 'urgent-engagements',
      name: 'Urgent Engagements',
      objectives: [
        missions(3, ['fight-the-storm', 'fight-the-category-2-storm', 'ride-the-lightning'], 32),
      ],
      rewards: [res('survivor-xp', 120000), item('survivor')],
    },
    {
      id: 'all-in-a-days-work',
      name: "All in a Day's Work",
      objectives: [
        missions(3, ['ride-the-lightning', 'retrieve-the-data', 'deliver-the-bomb'], 34),
      ],
      rewards: [res('hero-xp', 8000), item('hero', { name: 'Trailblazer Quinn', rarity: 'rare' })],
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
      rewards: [res('hero-xp', 8000), item('defender')],
    },
    {
      id: 'secure-tomorrow',
      name: 'Secure Tomorrow',
      objectives: [
        missions(3, ['deliver-the-bomb', 'retrieve-the-data', 'ride-the-lightning'], 36),
      ],
      rewards: [res('hero-xp', 8500), item('defender')],
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
        res('hero-xp', 8500),
        item('hero', { name: 'Urban Assault Headhunter', rarity: 'epic' }),
      ],
    },
    {
      id: 'doubling-down',
      name: 'Doubling Down',
      objectives: [
        missions(2, ['fight-the-category-3-storm', 'retrieve-the-data', 'ride-the-lightning'], 38),
      ],
      rewards: [res('hero-xp', 9250), item('hero', { name: 'Deadly Blade Crash', rarity: 'epic' })],
    },
    {
      id: 'at-your-earliest-convenience',
      name: 'At Your Earliest Convenience',
      objectives: [
        missions(3, ['evacuate-the-shelter', 'deliver-the-bomb', 'repair-the-shelter'], 38),
      ],
      rewards: [res('hero-xp', 9250), item('defender')],
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
      rewards: [res('schematic-xp', 7500), item('melee')],
    },
    {
      id: 'threat-level-elevated',
      name: 'Threat Level Elevated',
      objectives: [
        missions(3, ['retrieve-the-data', 'fight-the-category-2-storm', 'deliver-the-bomb'], 34),
      ],
      rewards: [res('schematic-xp', 8000), item('ranged', { weapon: 'pistol' })],
    },
    {
      id: 'restore-hope',
      name: 'Restore Hope',
      objectives: [
        missions(3, ['repair-the-shelter', 'evacuate-the-shelter', 'fight-the-storm'], 34),
      ],
      rewards: [res('survivor-xp', 128000), item('survivor')],
    },
    {
      id: 'helping-hand',
      name: 'Helping Hand',
      objectives: [
        missions(2, ['ride-the-lightning', 'repair-the-shelter', 'fight-the-category-2-storm'], 36),
      ],
      rewards: [res('survivor-xp', 136000), item('survivor')],
    },
    {
      id: 'every-little-helps',
      name: 'Every Little Helps',
      objectives: [
        missions(3, ['fight-the-storm', 'evacuate-the-shelter', 'retrieve-the-data'], 36),
      ],
      rewards: [res('schematic-xp', 8500), item('schematic')],
    },
    {
      id: 'know-our-enemy',
      name: 'Know Our Enemy',
      objectives: [
        missions(2, ['fight-the-storm', 'ride-the-lightning', 'fight-the-category-3-storm'], 38),
      ],
      rewards: [res('storm-shard', 10)],
    },
    {
      id: 'turn-the-page',
      name: 'Turn the Page',
      objectives: [
        missions(3, ['repair-the-shelter', 'retrieve-the-data', 'fight-the-category-2-storm'], 38),
      ],
      rewards: [res('hero-xp', 9250), item('defender')],
    },
    {
      id: 'the-quiet-before-the-storm',
      name: 'The Quiet Before the Storm',
      objectives: [
        missions(3, ['retrieve-the-data', 'ride-the-lightning', 'deliver-the-bomb'], 40),
      ],
      rewards: [res('survivor-xp', 160000), item('lead-survivor')],
    },
    {
      id: 'day-of-reckoning',
      name: 'Day of Reckoning',
      objectives: [missions(3, ['fight-the-storm', 'repair-the-shelter', 'deliver-the-bomb'], 40)],
      rewards: [res('schematic-xp', 10000), item('ranged')],
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
      rewards: [res('hero-xp', 10000), item('hero')],
    },
    {
      id: 'proceed-with-caution',
      name: 'Proceed with Caution!',
      objectives: [
        missions(2, ['fight-the-category-2-storm', 'deliver-the-bomb', 'retrieve-the-data'], 40),
      ],
      rewards: [res('hero-xp', 10000), item('defender')],
    },
    {
      id: 'the-beginning-of-the-end',
      name: 'The Beginning of the End',
      objectives: [
        missions(3, ['repair-the-shelter', 'fight-the-storm', 'evacuate-the-shelter'], 40),
      ],
      rewards: [res('survivor-xp', 160000), item('survivor')],
    },
    {
      id: 'twine-peaks-storm-shield-defense-7',
      name: 'Twine Peaks Storm Shield Defense 7',
      objectives: [
        text(
          'Complete Twine Peaks Storm Shield Defense 7',
          'Пройдите защиту штормового щита 7 в Линч-Пиксе',
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
          'Пройдите защиту штормового щита 8 в Линч-Пиксе',
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
          'Пройдите защиту штормового щита 9 в Линч-Пиксе',
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
          'Пройдите защиту штормового щита 10 в Линч-Пиксе',
        ),
      ],
      rewards: [unlock('Hero Loadout', 'Новый набор героев'), vb(150)],
    },
    {
      id: 'twine-peaks-endurance-defense',
      name: 'Twine Peaks Endurance Defense',
      objectives: [
        text(
          'Complete wave 30 of Endurance Defense in Twine Peaks',
          'Пройдите 30-ю волну обороны на выносливость в Линч-Пиксе',
        ),
      ],
      rewards: [res('upgrade-llama', 1), item('banner', { name: 'Twine Peaks Endurance Banner' })],
    },
  ],
  lok: [
    {
      id: 'loks-book-of-monsters-floating-freaks',
      name: 'Lok’s Book of Monsters: Floating Freaks',
      objectives: [
        text(
          'Gather 20 pieces of Shielder data in successful missions',
          'Соберите 20 образцов данных о щитоносцах в успешных миссиях',
        ),
      ],
      rewards: [vb(100)],
    },
    {
      id: 'loks-monster-smashers',
      name: "Lok's Monster: Smashers",
      objectives: [
        text(
          'Gather 5 pieces of Smasher data in successful missions in a 7+ zone',
          'Соберите 5 образцов данных о громилах в успешных миссиях в зоне 7+',
        ),
      ],
      rewards: [res('schematic-xp', 1750), item('ranged', { weapon: 'assault' })],
    },
    {
      id: 'loks-monster-takers',
      name: "Lok's Monster: Takers",
      objectives: [
        text(
          'Gather 5 pieces of Taker data in successful missions in a 10+ zone',
          'Соберите 5 образцов данных о похитителях в успешных миссиях в зоне 10+',
        ),
      ],
      rewards: [res('schematic-xp', 2000), item('melee')],
    },
    {
      id: 'loks-monsters-on-blast',
      name: "Lok's Monsters: On Blast!",
      objectives: [
        text(
          'Gather 10 pieces of Blaster data in successful missions in a 12+ zone',
          'Соберите 10 образцов данных о бластерах в успешных миссиях в зоне 12+',
        ),
      ],
      rewards: [res('survivor-xp', 16000), item('survivor')],
    },
    {
      id: 'loks-monsters-bees',
      name: "Lok's Monsters: Bees!",
      objectives: [
        text(
          'Gather 10 pieces of Bee Lobber data in successful missions in a 14+ zone',
          'Соберите 10 образцов данных о пчеловодах в успешных миссиях в зоне 14+',
        ),
      ],
      rewards: [res('active-powercell', 3)],
    },
    {
      id: 'loks-monsters-flingers',
      name: "Lok's Monsters: Flingers",
      objectives: [
        text(
          'Gather 5 pieces of Flinger data in successful missions in a 14+ zone',
          'Соберите 5 образцов данных о метателях в успешных миссиях в зоне 14+',
        ),
      ],
      rewards: [res('silver-ore', 5), res('rotating-gizmo', 3)],
    },
    {
      id: 'loks-monsters-lightning',
      name: "Lok's Monsters: Lightning!",
      objectives: [
        text(
          'Gather 10 pieces of Lightning monster data in successful missions in a 16+ zone',
          'Соберите 10 образцов данных о грозовых монстрах в успешных миссиях в зоне 16+',
        ),
      ],
      rewards: [res('survivor-xp', 28000), item('survivor')],
    },
    {
      id: 'loks-monsters-fire-husks',
      name: "Lok's Monsters: Fire Husks",
      objectives: [
        text(
          'Gather 10 pieces of Fire monster data in successful missions in a 18+ zone',
          'Соберите 10 образцов данных об огненных монстрах в успешных миссиях в зоне 18+',
        ),
      ],
      rewards: [res('schematic-xp', 3250), item('ranged')],
    },
    {
      id: 'loks-monster-husky-elementals',
      name: "Lok's Monster: Husky Elementals",
      objectives: [
        text(
          'Gather 10 pieces of Elemental Husky data in successful missions in a 20+ zone',
          'Соберите 10 образцов данных о стихийных хасках-здоровяках в успешных миссиях в зоне 20+',
        ),
      ],
      rewards: [item('ranged', { rarity: 'rare' })],
    },
    {
      id: 'loks-monster-water',
      name: "Lok's Monster: Water",
      objectives: [
        text(
          'Gather 10 pieces of Water monster data in successful missions in a 20+ zone',
          'Соберите 10 образцов данных о водных монстрах в успешных миссиях в зоне 20+',
        ),
      ],
      rewards: [item('melee', { rarity: 'rare' })],
    },
  ],
  other: [
    {
      id: 'talented-builder',
      name: 'Talented Builder',
      objectives: [
        text(
          'Build 500,000 structures in successful missions',
          'Постройте 500 000 конструкций в успешных миссиях',
        ),
      ],
      rewards: [item('banner', { name: 'Talented Builder' })],
    },
    {
      id: 'go-gnome',
      name: 'Go Gnome!',
      objectives: [
        text(
          'Destroy 100 Garden Gnomes in successful missions',
          'Уничтожьте 100 садовых гномов в успешных миссиях',
        ),
      ],
      rewards: [item('banner', { name: 'Go Gnome!' })],
    },
    {
      id: 'world-explorer',
      name: 'World Explorer',
      objectives: [
        text(
          'Fully explore 1,500 zones in successful missions',
          'Полностью исследуйте 1 500 зон в успешных миссиях',
        ),
      ],
      rewards: [item('banner', { name: 'World Explorer' })],
    },
    {
      id: 'unspeakable-horrors',
      name: 'Unspeakable Horrors',
      objectives: [
        text(
          'Eliminate 20,000 Mist Monsters in successful missions',
          'Уничтожьте 20 000 туманных монстров в успешных миссиях',
        ),
      ],
      rewards: [item('banner', { name: 'Unspeakable Horrors' })],
    },
    {
      id: 'loot-legend',
      name: 'Loot Legend',
      objectives: [text('Loot 300 Treasure Chests', 'Откройте 300 сундуков с сокровищами')],
      rewards: [item('banner', { name: 'Loot Legend' })],
    },
    {
      id: 'plays-well-with-others',
      name: 'Plays Well with Others',
      objectives: [
        text(
          'Complete 1,000 Play with Others missions',
          'Выполните 1 000 миссий в режиме «Играть с другими»',
        ),
      ],
      rewards: [item('banner', { name: 'Plays Well with Others' })],
    },
    {
      id: 'guardian-angel',
      name: 'Guardian Angel',
      objectives: [
        text(
          'Complete 10,000 Play with Others missions',
          'Выполните 10 000 миссий в режиме «Играть с другими»',
        ),
      ],
      rewards: [item('banner', { name: 'Guardian Angel' })],
    },
    {
      id: 'collections',
      name: 'Collections',
      objectives: [
        text('Level up your Collection Book twice', 'Дважды повысьте уровень книги коллекций'),
      ],
      rewards: [res('schematic-xp', 1000)],
    },
    {
      id: 'hero-rarity-upgrade',
      name: 'Hero Rarity Upgrade',
      objectives: [text('Upgrade the rarity of a Hero', 'Повысьте редкость героя')],
      rewards: [res('training-manual', 75)],
    },
    {
      id: 'perk-replacement',
      name: 'Perk Replacement',
      objectives: [text('Replace a perk on a schematic', 'Замените перк на чертеже')],
      rewards: [res('re-perk', 1200)],
    },
    {
      id: 'perk-upgrade',
      name: 'Perk Upgrade',
      objectives: [text('Upgrade a perk on a schematic', 'Улучшите перк на чертеже')],
      rewards: [res('re-perk', 1200)],
    },
    {
      id: 'weapon-enhancement',
      name: 'Weapon Enhancement',
      objectives: [text('Level up a weapon', 'Повысьте уровень оружия')],
      rewards: [res('rusty-parts', 5)],
    },
    {
      id: 'weapon-trap-evolution',
      name: 'Weapon/Trap Evolution',
      objectives: [
        text(
          'Evolve a weapon or trap by 1 star',
          'Повысьте эволюцию оружия или ловушки на 1 звезду',
        ),
      ],
      rewards: [res('weapon-designs', 75)],
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
