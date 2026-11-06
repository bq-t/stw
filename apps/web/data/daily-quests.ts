/**
 * Daily Quests reference data (project plan: "JSON в репозитории, без админки").
 *
 * Content (names, objectives, tips) lives here with both languages side by side, so TypeScript
 * refuses a quest without a Russian text. UI chrome (headings, labels) stays in messages/*.json.
 *
 * Sources: quest titles and counts from the Fortnite wiki "Daily Quests" page and
 * freethevbucks.com/daily-quests (checked 2026-11-04). Rewards after v37.50: 100 V-Bucks,
 * 150 for tier-3 quests. Russian quest names are our translation until checked in game.
 *
 * Screenshots are not listed here: drop them into public/images/quests/<quest id>/ (see ICONS.md)
 * and they appear in the quest card. `captions` adds a caption to a file by its name.
 */

export type L = { en: string; ru: string };

export type QuestCategoryId = 'destroy' | 'discovery' | 'husks' | 'missions' | 'other';

/** where: map/zone/building to go to · mission: a mission type that suits · tip: anything else. */
export type TipKind = 'where' | 'mission' | 'tip';

export interface QuestTip {
  kind: TipKind;
  text: L;
  /** Mission type keys (MissionType.* in messages), shown as icons next to the tip. */
  missions?: string[];
  /** Link to a page of this site, e.g. the tracker with a filter. */
  href?: string;
}

export interface DailyQuest {
  /** URL anchor and screenshot folder name. */
  id: string;
  category: QuestCategoryId;
  /** Icon name in public/icons/quests/; the category icon when missing. */
  icon?: string;
  name: L;
  objective: L;
  vbucks: 100 | 150;
  tips?: QuestTip[];
  /** Screenshot captions by file name without extension ("1", "2"...). */
  captions?: Record<string, L>;
}

export interface QuestCategory {
  id: QuestCategoryId;
  name: L;
  icon: string;
  /** Rules that apply to every quest of the category. */
  notes: QuestTip[];
}

export const QUESTS_CHECKED = '2026-11-04';

const VBUCKS_ALERTS = '/?alert=vbucks';

export const QUEST_CATEGORIES: QuestCategory[] = [
  {
    id: 'destroy',
    icon: 'destroy',
    name: { en: 'Daily Destroy', ru: 'Ежедневное уничтожение' },
    notes: [
      {
        kind: 'tip',
        text: {
          en: 'Objects broken by teammates count too: tell the squad what to smash at the start.',
          ru: 'Объекты, сломанные напарниками, тоже засчитываются: скажите отряду в начале, что ломать.',
        },
      },
      {
        kind: 'tip',
        text: {
          en: 'Quest objects nearby get a yellow outline and a yellow ! on the minimap.',
          ru: 'Нужные объекты рядом подсвечиваются жёлтым контуром и жёлтым «!» на миникарте.',
        },
      },
      {
        kind: 'tip',
        text: {
          en: 'To see the object in game, select the quest and press Replay Intro.',
          ru: 'Чтобы увидеть объект в игре, выберите квест и нажмите «Повторить вступление».',
        },
      },
      {
        kind: 'where',
        text: {
          en: 'Skip Forest and Grasslands maps: they have very few of these objects.',
          ru: 'Не берите карты в лесу и на равнинах: там таких объектов почти нет.',
        },
      },
    ],
  },
  {
    id: 'discovery',
    icon: 'discovery',
    name: { en: 'Daily Discovery', ru: 'Ежедневная разведка' },
    notes: [
      {
        kind: 'tip',
        text: {
          en: 'You have to enter the location yourself: places found by teammates do not count.',
          ru: 'В локацию нужно зайти самому: найденные напарниками места не засчитываются.',
        },
      },
    ],
  },
  {
    id: 'husks',
    icon: 'exterminate',
    name: { en: 'Husk Extermination', ru: 'Истребление хасков' },
    notes: [
      {
        kind: 'tip',
        text: {
          en: 'A husk you damaged counts even if a teammate finishes it.',
          ru: 'Хаск, которого вы ранили, засчитывается, даже если добил напарник.',
        },
      },
      {
        kind: 'tip',
        text: {
          en: 'Any difficulty and any zone works, Storm Shield Defense included.',
          ru: 'Подходит любая сложность и любая зона, включая защиту штормового щита.',
        },
      },
      {
        kind: 'mission',
        missions: ['fight-the-storm', 'ride-the-lightning', 'launch-the-rocket'],
        text: {
          en: 'Missions with husk waves give the most kills.',
          ru: 'Больше всего хасков в миссиях с волнами.',
        },
      },
    ],
  },
  {
    id: 'missions',
    icon: 'missions',
    name: { en: 'Mission Specialist', ru: 'Специалист по заданиям' },
    notes: [
      {
        kind: 'tip',
        text: {
          en: 'Any difficulty counts: pick short missions in a low-level zone.',
          ru: 'Подходит любая сложность: берите короткие миссии в зоне пониже.',
        },
      },
      {
        kind: 'tip',
        href: VBUCKS_ALERTS,
        text: {
          en: "Play today's V-Bucks alerts: the quest and the alert pay out together.",
          ru: 'Играйте сегодняшние миссии с В-баксами: квест и награда за алерт выдаются вместе.',
        },
      },
    ],
  },
  {
    id: 'other',
    icon: 'daily',
    name: { en: 'Other', ru: 'Другие' },
    notes: [],
  },
];

// Shared tips --------------------------------------------------------------------------------

const commanderTip = (cls: L): QuestTip => ({
  kind: 'tip',
  text: {
    en: `The class is set by your commander: put a ${cls.en} in the commander slot before the mission.`,
    ru: `Класс определяет командир: до начала миссии поставьте в слот командира героя класса «${cls.ru}».`,
  },
});

const CLASSES = {
  constructor: { en: 'Constructor', ru: 'Конструктор' },
  ninja: { en: 'Ninja', ru: 'Ниндзя' },
  outlander: { en: 'Outlander', ru: 'Исследователь' },
  soldier: { en: 'Soldier', ru: 'Солдат' },
} as const satisfies Record<string, L>;

type HeroClass = keyof typeof CLASSES;
const CLASS_IDS = Object.keys(CLASSES) as HeroClass[];

/** "a Constructor" / "an Outlander". */
const article = (cls: HeroClass) => (cls === 'outlander' ? 'an' : 'a');

const lower = (l: L): L => ({ en: l.en, ru: l.ru.toLowerCase() });

// Quests -------------------------------------------------------------------------------------

const destroy = (id: string, title: L, objective: L, tips: QuestTip[]): DailyQuest => ({
  id: `destroy-${id}`,
  category: 'destroy',
  name: {
    en: `Daily Destroy (${title.en})`,
    ru: `Ежедневное уничтожение (${title.ru})`,
  },
  objective,
  vbucks: 100,
  tips,
});

const discovery = (id: string, title: L, objective: L, tips: QuestTip[] = []): DailyQuest => ({
  id: `discovery-${id}`,
  category: 'discovery',
  name: { en: `Daily Scouting ${title.en}`, ru: `Ежедневная разведка: ${title.ru}` },
  objective,
  vbucks: 100,
  tips,
});

const WEAPONS = [
  {
    id: 'assault-rifle',
    title: { en: 'Assault Rifle', ru: 'штурмовая винтовка' },
    with: { en: 'assault rifles', ru: 'из штурмовых винтовок' },
  },
  {
    id: 'smg',
    title: { en: 'SMG', ru: 'ПП' },
    with: { en: 'SMGs', ru: 'из пистолетов-пулемётов' },
  },
  {
    id: 'shotgun',
    title: { en: 'Shotgun', ru: 'дробовик' },
    with: { en: 'shotguns', ru: 'из дробовиков' },
  },
  {
    id: 'pistol',
    title: { en: 'Pistol', ru: 'пистолет' },
    with: { en: 'pistols', ru: 'из пистолетов' },
  },
  {
    id: 'sniper-rifle',
    title: { en: 'Sniper Rifle', ru: 'снайперская винтовка' },
    with: { en: 'sniper rifles', ru: 'из снайперских винтовок' },
  },
  {
    id: 'melee',
    title: { en: 'Melee', ru: 'ближний бой' },
    with: { en: 'melee weapons', ru: 'оружием ближнего боя' },
    tips: [
      {
        kind: 'tip',
        text: {
          en: 'Ninjas are built for melee: their abilities and perks boost it.',
          ru: 'Ниндзя заточены под ближний бой: их способности и перки его усиливают.',
        },
      },
    ] satisfies QuestTip[],
  },
] as const;

export const DAILY_QUESTS: DailyQuest[] = [
  // Daily Destroy
  destroy(
    'transformers',
    { en: 'Transformers', ru: 'трансформаторы' },
    {
      en: 'Destroy 2 Industrial Power Transformers in successful missions (often found in Industrial zones)',
      ru: 'Уничтожьте 2 промышленных трансформатора в успешных миссиях (часто встречаются в промзонах)',
    },
    [
      {
        kind: 'where',
        text: {
          en: 'Industrial Park maps. Only 2 are needed, so one industrial map is usually enough.',
          ru: 'Карты с промзоной. Нужно всего 2, обычно хватает одной такой карты.',
        },
      },
    ],
  ),
  destroy(
    'garden-gnomes',
    { en: 'Garden Gnomes', ru: 'садовые гномы' },
    {
      en: 'Destroy 3 Garden Gnomes in successful missions (often found hidden in every zone)',
      ru: 'Уничтожьте 3 садовых гнома в успешных миссиях (часто спрятаны в любой зоне)',
    },
    [
      {
        kind: 'where',
        text: {
          en: 'Gnomes are hidden on every map type, often in odd spots. They are small: watch for the yellow outline.',
          ru: 'Гномы спрятаны на картах любого типа, часто в неожиданных местах. Они маленькие: ищите жёлтый контур.',
        },
      },
    ],
  ),
  destroy(
    'propane-tanks',
    { en: 'Propane Tanks', ru: 'баллоны с пропаном' },
    {
      en: 'Destroy 10 Propane Tanks in successful missions (often found in Industrial zones)',
      ru: 'Уничтожьте 10 баллонов с пропаном в успешных миссиях (часто встречаются в промзонах)',
    },
    [
      {
        kind: 'where',
        text: {
          en: 'Industrial Park maps. Tanks often stand in groups.',
          ru: 'Карты с промзоной. Баллоны часто стоят группами.',
        },
      },
    ],
  ),
  destroy(
    'park-seesaws',
    { en: 'Park Seesaws', ru: 'качели в парке' },
    {
      en: 'Destroy 6 Park Seesaws in successful missions (often found in Suburban zones)',
      ru: 'Уничтожьте 6 качелей в парке в успешных миссиях (часто встречаются в пригородах)',
    },
    [
      {
        kind: 'where',
        text: {
          en: 'Suburbs maps: look for playgrounds in parks.',
          ru: 'Карты с пригородом: ищите детские площадки в парках.',
        },
      },
    ],
  ),
  destroy(
    'tvs',
    { en: 'TVs', ru: 'телевизоры' },
    {
      en: 'Destroy 20 TVs in successful missions (often found in Suburban zones)',
      ru: 'Уничтожьте 20 телевизоров в успешных миссиях (часто встречаются в пригородах)',
    },
    [
      {
        kind: 'where',
        text: {
          en: 'Inside suburban houses. 20 is a lot: clear whole houses and ask teammates to break TVs too.',
          ru: 'В домах пригорода. 20 штук это много: обходите дома целиком и попросите напарников тоже ломать телевизоры.',
        },
      },
    ],
  ),
  destroy(
    'fire-trucks',
    { en: 'Fire Trucks', ru: 'пожарные машины' },
    {
      en: 'Destroy 3 Fire Trucks in successful missions (often found in City zones)',
      ru: 'Уничтожьте 3 пожарные машины в успешных миссиях (часто встречаются в городе)',
    },
    [
      {
        kind: 'where',
        text: {
          en: 'City maps, near fire stations.',
          ru: 'Карты с городом, рядом с пожарными станциями.',
        },
      },
    ],
  ),
  destroy(
    'arcade-machines',
    { en: 'Arcade Machines', ru: 'игровые автоматы' },
    {
      en: 'Destroy 3 Arcade Machines in successful missions (often found in City zones)',
      ru: 'Уничтожьте 3 игровых автомата в успешных миссиях (часто встречаются в городе)',
    },
    [
      {
        kind: 'where',
        text: {
          en: 'City maps, inside buildings.',
          ru: 'Карты с городом, внутри зданий.',
        },
      },
    ],
  ),
  destroy(
    'server-racks',
    { en: 'Server Racks', ru: 'серверные стойки' },
    {
      en: 'Destroy 4 Server Racks in successful missions (often found in Bunkers and Shelters)',
      ru: 'Уничтожьте 4 серверные стойки в успешных миссиях (часто встречаются в бункерах и убежищах)',
    },
    [
      {
        kind: 'mission',
        missions: ['repair-the-shelter', 'evacuate-the-shelter'],
        text: {
          en: 'Shelter missions take you right to a shelter.',
          ru: 'Миссии с убежищем сразу приводят вас в убежище.',
        },
      },
    ],
  ),
  destroy(
    'teddy-bears',
    { en: 'Teddy Bears', ru: 'плюшевые медведи' },
    {
      en: 'Destroy 8 Teddy Bears in successful missions (often found in Suburban zones)',
      ru: 'Уничтожьте 8 плюшевых медведей в успешных миссиях (часто встречаются в пригородах)',
    },
    [
      {
        kind: 'where',
        text: {
          en: "Suburban houses, mostly kids' rooms. Expect it to take several missions.",
          ru: 'Дома в пригороде, чаще всего детские комнаты. Скорее всего, понадобится несколько миссий.',
        },
      },
    ],
  ),

  // Daily Discovery
  discovery(
    'rural',
    { en: 'Rural', ru: 'сельская местность' },
    {
      en: 'Discover 3 Rural Locations, Bunkers, Shacks and Ruined Houses (found in Forests and Grasslands)',
      ru: 'Найдите 3 сельские локации: бункеры, хижины и разрушенные дома (встречаются в лесах и на равнинах)',
    },
    [
      {
        kind: 'where',
        text: { en: 'Forest and Grasslands maps.', ru: 'Карты с лесом и равнинами.' },
      },
    ],
  ),
  discovery(
    'cities',
    { en: 'Cities', ru: 'города' },
    {
      en: 'Discover 8 City Locations, Police Stations, Fire Stations, Hospitals, Parking Lots and Decks',
      ru: 'Найдите 8 городских локаций: полицейские и пожарные станции, больницы, парковки и многоярусные стоянки',
    },
    [{ kind: 'where', text: { en: 'City maps.', ru: 'Карты с городом.' } }],
  ),
  discovery(
    'shelters',
    { en: 'Shelters', ru: 'убежища' },
    {
      en: 'Discover 4 Outdoor Survivor Shelters (found in all zones)',
      ru: 'Найдите 4 наружных убежища выживших (встречаются во всех зонах)',
    },
    [
      {
        kind: 'where',
        text: { en: 'Any map type.', ru: 'Карта любого типа.' },
      },
    ],
  ),
  discovery(
    'suburbia',
    { en: 'Suburbia', ru: 'пригород' },
    {
      en: 'Discover 10 Suburbia Locations, Parks and Restaurants',
      ru: 'Найдите 10 локаций пригорода: парки и рестораны',
    },
    [
      {
        kind: 'where',
        text: {
          en: 'Suburbs maps. 10 sounds like a lot, but suburbs are dense.',
          ru: 'Карты с пригородом. 10 звучит много, но в пригороде локации стоят плотно.',
        },
      },
    ],
  ),
  discovery(
    'industrial-construction',
    { en: 'Industrial Construction', ru: 'стройплощадки' },
    {
      en: 'Discover 3 Industrial Construction Sites',
      ru: 'Найдите 3 промышленные стройплощадки',
    },
    [{ kind: 'where', text: { en: 'Industrial Park maps.', ru: 'Карты с промзоной.' } }],
  ),
  {
    id: 'exploration-party',
    category: 'discovery',
    icon: 'world-explorer',
    name: { en: 'Exploration Party', ru: 'Исследовательский отряд' },
    objective: {
      en: 'Fully explore 3 zones in successful missions',
      ru: 'Полностью исследуйте 3 зоны в успешных миссиях',
    },
    vbucks: 100,
  },

  // Husk Extermination
  {
    id: 'husks-any-hero',
    category: 'husks',
    name: { en: 'Husk Extermination (Any Hero)', ru: 'Истребление хасков (любой герой)' },
    objective: {
      en: 'Eliminate 500 Husks in successful missions',
      ru: 'Уничтожьте 500 хасков в успешных миссиях',
    },
    vbucks: 100,
  },
  ...CLASS_IDS.map((cls): DailyQuest => ({
    id: `husks-${cls}`,
    category: 'husks',
    icon: cls,
    name: {
      en: `Husk Extermination (${CLASSES[cls].en})`,
      ru: `Истребление хасков (${lower(CLASSES[cls]).ru})`,
    },
    objective: {
      en: `Eliminate 300 Husks in successful missions as ${article(cls)} ${CLASSES[cls].en}`,
      ru: `Уничтожьте 300 хасков в успешных миссиях за героя класса «${CLASSES[cls].ru}»`,
    },
    vbucks: 100,
    tips: [commanderTip(CLASSES[cls])],
  })),
  ...WEAPONS.map((w): DailyQuest => ({
    id: `husks-${w.id}`,
    category: 'husks',
    icon: w.id,
    name: {
      en: `Husk Extermination (${w.title.en})`,
      ru: `Истребление хасков (${w.title.ru})`,
    },
    objective: {
      en: `Eliminate 300 Husks with ${w.with.en} in successful missions`,
      ru: `Уничтожьте 300 хасков ${w.with.ru} в успешных миссиях`,
    },
    vbucks: 100,
    tips: 'tips' in w ? [...w.tips] : undefined,
  })),
  {
    id: 'husks-trap',
    category: 'husks',
    icon: 'trap',
    name: { en: 'Husk Extermination (Trap)', ru: 'Истребление хасков (ловушки)' },
    objective: {
      en: 'Eliminate 150 Husks with traps in successful missions',
      ru: 'Уничтожьте 150 хасков ловушками в успешных миссиях',
    },
    vbucks: 100,
    tips: [
      {
        kind: 'mission',
        missions: ['fight-the-storm', 'storm-shield-defense'],
        text: {
          en: 'Defence missions where husks walk set paths: build a trap tunnel on their way to the objective.',
          ru: 'Миссии на оборону, где хаски идут по одним и тем же путям: постройте туннель с ловушками на подходе к цели.',
        },
      },
    ],
  },

  // Mission Specialist
  {
    id: 'missions-any-hero',
    category: 'missions',
    name: { en: 'Mission Specialist (Any Hero)', ru: 'Специалист по заданиям (любой герой)' },
    objective: { en: 'Complete 3 missions', ru: 'Выполните 3 миссии' },
    vbucks: 100,
  },
  {
    id: 'missions-veteran',
    category: 'missions',
    name: { en: 'Mission Veteran (Any Hero)', ru: 'Ветеран заданий (любой герой)' },
    objective: { en: 'Complete 5 missions', ru: 'Выполните 5 миссий' },
    vbucks: 150,
  },
  ...CLASS_IDS.map((cls): DailyQuest => ({
    id: `missions-${cls}`,
    category: 'missions',
    icon: cls,
    name: {
      en: `Mission Specialist (${CLASSES[cls].en})`,
      ru: `Специалист по заданиям (${lower(CLASSES[cls]).ru})`,
    },
    objective: {
      en: `Complete 3 missions as ${article(cls)} ${CLASSES[cls].en}`,
      ru: `Выполните 3 миссии за героя класса «${CLASSES[cls].ru}»`,
    },
    vbucks: 100,
    tips: [commanderTip(CLASSES[cls])],
  })),

  // Other
  {
    id: 'party-of-25',
    category: 'other',
    icon: 'survivors',
    name: { en: 'Party of 25', ru: 'Компания из 25' },
    objective: {
      en: 'Save 25 Survivors in successful missions',
      ru: 'Спасите 25 выживших в успешных миссиях',
    },
    vbucks: 100,
    tips: [
      {
        kind: 'mission',
        missions: ['evacuate-the-survivors'],
        text: {
          en: 'Survivor rescue missions are built around this. Survivors you find on any map count too.',
          ru: 'Миссии по спасению выживших построены ровно на этом. Выжившие, найденные на любой карте, тоже засчитываются.',
        },
      },
    ],
  },
  {
    id: 'all-together-now',
    category: 'other',
    icon: 'survivors',
    name: { en: 'All Together Now', ru: 'Все вместе' },
    objective: {
      en: 'Save 50 Survivors in successful missions',
      ru: 'Спасите 50 выживших в успешных миссиях',
    },
    vbucks: 150,
    tips: [
      {
        kind: 'mission',
        missions: ['evacuate-the-survivors'],
        text: {
          en: 'Survivor rescue missions are built around this. Survivors you find on any map count too.',
          ru: 'Миссии по спасению выживших построены ровно на этом. Выжившие, найденные на любой карте, тоже засчитываются.',
        },
      },
    ],
  },
  {
    id: 'build-the-radar-tower',
    category: 'other',
    icon: 'radar',
    name: { en: 'Build the Radar Tower', ru: 'Постройте радарную вышку' },
    objective: {
      en: 'Build 4 Radar Towers in successful missions',
      ru: 'Постройте 4 радарные вышки в успешных миссиях',
    },
    vbucks: 100,
    tips: [
      {
        kind: 'mission',
        missions: ['build-the-radar-grid'],
        text: {
          en: 'Build the Radar Grid missions consist of exactly this.',
          ru: 'Миссии «Построить радарную сеть» состоят ровно из этого.',
        },
      },
    ],
  },
  {
    id: 'playing-it-safe',
    category: 'other',
    icon: 'safe',
    name: { en: 'Playing It Safe', ru: 'Надёжно и безопасно' },
    objective: {
      en: 'Loot a Safe in a successful mission',
      ru: 'Вскройте сейф в успешной миссии',
    },
    vbucks: 100,
    tips: [
      {
        kind: 'where',
        text: {
          en: 'Safes are inside buildings, most often on City and Suburbs maps.',
          ru: 'Сейфы стоят внутри зданий, чаще всего на картах с городом и пригородом.',
        },
      },
    ],
  },
  {
    id: 'lost-treasures',
    category: 'other',
    icon: 'treasure',
    name: { en: 'Lost Treasures', ru: 'Потерянные сокровища' },
    objective: {
      en: 'Loot 5 Treasure Chests in successful missions',
      ru: 'Откройте 5 сундуков с сокровищами в успешных миссиях',
    },
    vbucks: 100,
    tips: [
      {
        kind: 'where',
        text: {
          en: 'Treasure chests are on every map type: open every one you pass.',
          ru: 'Сундуки есть на картах любого типа: открывайте каждый по пути.',
        },
      },
    ],
  },
];

export function questsOf(category: QuestCategoryId): DailyQuest[] {
  return DAILY_QUESTS.filter((q) => q.category === category);
}
