# StW V-Bucks Guide — тех.план

Nov 4, 2026 · @Ivan

## Журнал решений

Сайт собирается один раз при деплое, а данные миссий страница забирает в браузере из JSON-эндпоинта. Пересборки при ежедневной ротации нет.

| # | Вопрос | Ответ | Следствие для кода |
| --- | --- | --- | --- |
| 1 | Хостинг | На мой выбор | Cloudflare: Pages для сайта, Worker для данных. Одна платформа, бесплатно |
| 2 | TypeScript | Да | `strict: true`, общие типы для сайта и Worker |
| 3 | Переводы | EN по умолчанию без `/en`, RU на `/ru` | Два набора статических страниц, rewrite в Cloudflare (см. «Фронтенд») |
| 4 | Стиль | Современный, тёмный, близко к Fortnite, без копирования | Дизайн-токены и шрифты в разделе «Фронтенд» |
| 5 | Фильтры в URL | Да | `useSearchParams` + чистые функции фильтрации |
| 6 | pnpm | Да | pnpm workspaces: `apps/web`, `apps/worker`, `packages/shared` |
| 7 | Данные без пересборки | Да | Worker по cron пишет JSON в KV, страница делает `fetch` к `/api/missions` |
| 8 | Репозиторий | Публичный, GitHub | Секреты только в Cloudflare Secrets, в репозитории `.dev.vars.example` |
| 9 | Отдельный аккаунт Epic | Ок | Device auth, разовая настройка вручную |
| 10 | Названия и иконки | Fortnite установлен | Разовый экспорт справочника через FModel в `packages/shared/items` |
| 11 | История | 30 дней | KV-ключ на день с TTL 31 день + сводка |
| 12 | Уведомления | Discord-бот и вебхук | Вебхук в MVP, бот со slash-командами после |
| 13 | Аналитика | Cloudflare Web Analytics | Один скрипт, без cookie-баннера |
| 14 | Реклама | Пока нет | Не закладываем |
| 15 | Тесты | Не сейчас | Только `tsc` и ESLint в CI |
| 16 | Агент | Claude Code в репозитории | `CLAUDE.md` и задачи по этапам в конце документа |

## Архитектура

&#91;embedded content: архитектура · сайт, Worker, KV, Epic, Discord\]

Сайт на Pages статический и обновляется только при пуше в `main`. Миссии каждый день приходят через Worker: он ходит в Epic, хранит снимки в KV и отдаёт их браузеру по `/api/missions`.

## Стек

Версии фиксируем на актуальные стабильные в день старта (`pnpm create next-app@latest`, `pnpm create cloudflare@latest`).

| Слой | Выбор | Зачем |
| --- | --- | --- |
| Фреймворк | Next.js, App Router, `output: 'export'` | Статический HTML для SEO, React для интерактива |
| Язык | TypeScript strict | Общие типы для сайта и Worker |
| Стили | Tailwind CSS | Токены темы в CSS-переменных |
| UI | shadcn/ui (Radix) | Tooltip, Popover, Select, Tabs, Toggle — код компонентов у нас, стиль свой |
| Иконки | lucide-react | Иконки интерфейса; игровые иконки свои из FModel |
| i18n | next-intl | Словари `messages/en.json`, `messages/ru.json` |
| Загрузка данных | TanStack Query | Кэш, повтор при ошибке, перезапрос после ротации |
| Даты | date-fns | Таймер до 00:00 UTC, форматирование под локаль |
| Данные | Cloudflare Worker + KV | Cron, хранение, JSON-эндпоинт |
| Валидация | zod | Проверка ответа Epic: если формат изменился, падаем громко, а не показываем мусор |
| Качество | ESLint, Prettier, `tsc --noEmit` | Проверка в GitHub Actions на каждый push |
| Деплой | Cloudflare Pages (Git-интеграция), Wrangler для Worker | Push в `main` выкатывает сайт; Worker через `wrangler deploy` из CI |

## Структура репозитория

Монорепо на pnpm workspaces. Парсер ответа Epic живёт в `packages/shared` и используется и Worker, и локальным скриптом для отладки.

```
stw-vbucks/
├─ apps/
│  ├─ web/                    # Next.js, статический экспорт
│  │  ├─ app/[locale]/        # en, ru
│  │  │  ├─ page.tsx          # трекер миссий
│  │  │  ├─ daily-quests/
│  │  │  ├─ questline/
│  │  │  ├─ side-quests/
│  │  │  ├─ guide/
│  │  │  └─ faq/
│  │  ├─ components/
│  │  │  ├─ ui/               # shadcn/ui
│  │  │  ├─ missions/         # MissionCard, ZoneSection, Filters, RotationTimer, VbucksStats
│  │  │  └─ layout/           # Header, Footer, LocaleSwitch, DiscordBadge
│  │  ├─ content/             # JSON справочников: квесты, квестлайн, челленджи
│  │  ├─ messages/            # en.json, ru.json
│  │  ├─ public/
│  │  │  ├─ icons/            # иконки наград и миссий из FModel
│  │  │  └─ _redirects        # rewrite для EN без /en
│  │  └─ next.config.ts
│  └─ worker/                 # Cloudflare Worker
│     ├─ src/
│     │  ├─ index.ts          # fetch (API) + scheduled (cron)
│     │  ├─ epic/auth.ts      # device auth → access token
│     │  ├─ epic/worldInfo.ts # запрос world/info
│     │  ├─ store.ts          # KV: текущие миссии, история
│     │  └─ notify/discord.ts # вебхук
│     ├─ wrangler.toml
│     └─ .dev.vars.example
├─ packages/
│  └─ shared/
│     ├─ types.ts             # Mission, Reward, DaySnapshot
│     ├─ parse.ts             # сырой world/info → Mission[]
│     ├─ schema.ts            # zod-схемы ответа Epic
│     └─ items/               # справочник ID → название EN/RU, редкость, иконка
├─ scripts/
│  ├─ fetch-world-info.ts     # локальный запуск парсера
│  └─ setup-device-auth.ts    # разовое получение device auth
├─ .github/workflows/ci.yml   # lint + typecheck + deploy worker
└─ CLAUDE.md
```

## Модель данных

Фронтенд работает только с нашими типами, сырой ответ Epic дальше `parse.ts` не уходит. Точные поля `world/info` сверяем на этапе 2 по реальному ответу; ниже целевая форма.

```ts
type Zone = 'stonewood' | 'plankerton' | 'canny-valley' | 'twine-peaks';
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
type AlertKind = 'mini-boss' | 'mega-alert' | 'storm-king' | 'storm' | 'elemental-fire' | 'elemental-nature' | 'elemental-water' | 'none';

interface Reward {
  itemId: string;          // внутренний ID Epic, ключ в справочнике items/
  quantity: number;
  rarity?: Rarity;
  isVbucks: boolean;       // для выделения и тултипа «только для фаундеров»
}

interface Mission {
  id: string;              // стабильный: зона + тайл + дата
  zone: Zone;
  missionType: string;     // ключ: 'ride-the-lightning', 'fight-the-storm', …
  biome: string;           // 'forest', 'suburbs', …
  powerLevel: number;      // 5…160
  alertKind: AlertKind;
  alertRewards: Reward[];  // бонус за алерт, разово
  baseRewards: Reward[];   // обычные награды миссии
  isGroup: boolean;
}

interface DaySnapshot {
  date: string;            // '2026-11-04', день ротации по UTC
  fetchedAt: string;       // ISO
  expiresAt: string;       // следующая ротация, 00:00 UTC
  missions: Mission[];
  vbucksTotal: number;     // сумма V-Bucks во всех алертах дня
}

interface VbucksHistory {
  days: { date: string; total: number; missions: number }[]; // последние 30 дней
}
```

Справочник предметов (`packages/shared/items/*.json`): `itemId → { name: { en, ru }, rarity, icon, category }`. Предмет, которого нет в справочнике, показываем с ID, приведённым к читаемому виду, и пишем предупреждение в лог Worker.

## Пайплайн данных

Один Worker делает всё: раз в сутки забирает миссии, хранит их в KV, отдаёт JSON сайту и шлёт уведомление в Discord.

**Авторизация (разово, вручную)**

1. Заводишь отдельный аккаунт Epic и один раз заходишь им в StW, чтобы аккаунт имел доступ к миру.
2. `scripts/setup-device-auth.ts`: логин через браузер → authorization code → обмен на токен → создание device auth. На выходе `accountId`, `deviceId`, `secret`.
3. Эти три значения кладём в `wrangler secret put`. Device auth не протухает сам, пока его не отзовут или не сменят пароль.
4. Endpoints и client credentials игрового клиента берём из [документации сообщества](https://github.com/LeleDerGrasshalmi/FortniteEndpointsDocumentation); актуальность сверяем на этапе 2.

**Ежедневный запуск (`scheduled`)**

1. Cron `*/15 0 * * *`: каждые 15 минут с 00:00 до 00:45 UTC. Если снимок за сегодня уже сохранён, запуск сразу выходит. Так переживаем задержку ротации на стороне Epic.
2. Device auth → access token (`grant_type=device_auth`).
3. `GET world/info` → zod-валидация → `parse()` → `DaySnapshot`.
4. Защита от вчерашних данных: если набор алертов совпадает со вчерашним, не сохраняем, ждём следующего запуска.
5. Запись в KV, затем вебхук в Discord, если в дне есть V-Bucks.

**KV-ключи**

| Ключ | Что лежит | TTL |
| --- | --- | --- |
| `snapshot:current` | `DaySnapshot` текущего дня | без TTL, перезаписывается |
| `snapshot:YYYY-MM-DD` | снимок конкретного дня | 31 день |
| `history:vbucks` | `VbucksHistory`, 30 последних дней | без TTL, пересчитывается при записи |

Запись 3 ключей в день при бесплатном лимите KV 1000 записей в сутки.

**API (`fetch`)**

| Маршрут | Ответ | Кэш |
| --- | --- | --- |
| `GET /api/missions` | `DaySnapshot` | `Cache-Control` до `expiresAt` + edge-кэш Cloudflare |
| `GET /api/history` | `VbucksHistory` | так же |
| `GET /api/health` | дата последнего снимка, ошибки | без кэша |

CORS открыт только для домена сайта и `localhost`.

**Discord**

- MVP: вебхук в твой канал. Embed с V-Bucks миссиями дня: зона, тип, power level, сумма, ссылка на сайт.
- После переезда: бот с командой `/missions` и подпиской сервера на канал. Работает через Discord Interactions на том же Worker, без постоянного процесса.

## Фронтенд

**Роутинг и i18n.** Без middleware, потому что статический экспорт его не поддерживает:

1. Страницы лежат в `app/[locale]`, `generateStaticParams` отдаёт `en` и `ru`. Билд кладёт файлы в `out/en/...` и `out/ru/...`.
2. next-intl с `localePrefix: 'as-needed'`: ссылки для EN без префикса, для RU с `/ru`.
3. `public/_redirects` на Cloudflare Pages:
   - `/ru/*` отдаётся как есть;
   - `/en/*` → 301 на путь без `/en`, чтобы не было дублей для поисковиков;
   - `/*` → rewrite 200 на `/en/:splat`.
4. В `<head>` `hreflang` для en и ru; переключатель языка сохраняет текущий путь и фильтры.
5. Проверить на этапе 3: клиентская навигация Next запрашивает RSC-файлы (`*.txt`) по тем же путям, rewrite должен их покрывать.

**Загрузка данных на странице.** HTML трекера статический: шапка, фильтры, скелетоны карточек. TanStack Query тянет `/api/missions`, а в момент `expiresAt` перезапрашивает данные сам. Пока Worker не обновился, показываем вчерашние данные с пометкой «обновляется».

**Дизайн-направление.** Узнаваемо «по-фортнайтовски», но без копирования ассетов и шрифта Burbank:

- Шрифты с кириллицей: заголовки Unbounded (жирный, широкий), текст Onest.
- Фон: глубокий тёмно-синий, а не чёрный; карточки на ступень светлее, без стекла и размытия.
- Цвета редкости как в игре: common серый, uncommon зелёный, rare синий, epic фиолетовый, legendary оранжевый, mythic золотой. Используются только как рамка или полоса предмета, не как фон.
- V-Bucks: единственный яркий акцент на странице. У карточки акцентная рамка, бейдж с суммой, тултип «только для фаундеров».
- Форма: скошенные табы и кнопки (лёгкий skew), крупные цифры power level, заголовки капсом. Это даёт игровой характер без иллюстраций.
- Чего избегаем: фиолетово-розовых градиентов, glassmorphism, эмодзи в интерфейсе, одинаковых скруглённых карточек с тенью.

**Ключевые компоненты трекера**

| Компонент | Что делает |
| --- | --- |
| `RotationTimer` | Обратный отсчёт до 00:00 UTC, время ротации в локальном часовом поясе в тултипе |
| `VbucksStats` | Сегодня / вчера / 7 / 30 дней из `/api/history` |
| `MissionFilters` | Зона, тип алерта, тип награды, диапазон power level; состояние в URL |
| `ZoneSection` | Заголовок зоны + сетка карточек; V-Bucks карточки идут первыми |
| `MissionCard` | Иконка типа, power level, биом, награды алерта и базовые награды |
| `RewardChip` | Иконка, количество, рамка редкости, тултип с названием и описанием |

## Задачи для агента

Каждый пункт — отдельная задача для Claude Code на одну сессию с понятным результатом. Номера этапов совпадают с проект-планом.

**4–5 ноября: этапы 2–3**

- [ ] Создать монорепо: pnpm workspaces, `apps/web`, `apps/worker`, `packages/shared`, общий `tsconfig`, ESLint, Prettier.
- [ ] Написать `CLAUDE.md`: структура, команды, правило «сырой ответ Epic не выходит за `parse.ts`», стиль кода, запрет коммитить секреты.
- [ ] `scripts/setup-device-auth.ts`: получить device auth для отдельного аккаунта. Запускаешь вручную ты.
- [ ] `scripts/fetch-world-info.ts`: скачать `world/info`, сохранить сырой ответ в `fixtures/` (в `.gitignore`).
- [ ] По реальному ответу описать zod-схему и `parse()` → `DaySnapshot`. **Контрольная точка:** если данные не получаются, останавливаемся и пересматриваем источник.
- [ ] Next.js-каркас: статический экспорт, next-intl, `[locale]`, `_redirects`, Tailwind, shadcn/ui, токены темы, шрифты.
- [ ] Подключить Cloudflare Pages к репозиторию, выкатить пустой сайт.

**6 ноября: этап 4**

- [ ] Экспорт справочника предметов и иконок через FModel. Делаешь ты, агент пишет скрипт конвертации в `items/*.json`.
- [ ] `MissionCard`, `RewardChip`, `ZoneSection` на данных из `fixtures/`.
- [ ] Выделение V-Bucks и тултип «только для фаундеров».
- [ ] `MissionFilters` с состоянием в URL; `RotationTimer`.
- [ ] Шапка, футер, переключатель EN/RU, плашка Discord.

**7 ноября: этап 5**

- [ ] Worker: `scheduled` с защитой от повторов и вчерашних данных, запись в KV, история за 30 дней.
- [ ] Worker: `/api/missions`, `/api/history`, `/api/health`, CORS, кэш.
- [ ] Секреты в Cloudflare, деплой Worker из GitHub Actions, CI с `tsc` и ESLint.
- [ ] Подключить фронтенд к API через TanStack Query; `VbucksStats`.
- [ ] Вебхук Discord.
- [ ] Cloudflare Web Analytics.

**После переезда: этапы 6–8 и фаза 2**

- [ ] Справочные страницы и их JSON: Daily Quests, квестлайн 4 зон, Side Quests, гайд, FAQ.
- [ ] Перевод всех текстов на RU.
- [ ] SEO: метаданные, sitemap, Open Graph-картинки.
- [ ] Тесты парсера на Vitest по сохранённым фикстурам.
- [ ] Discord-бот с `/missions` и подпиской серверов.
- [ ] Фаза 2: вход через Epic, личный учёт V-Bucks, чек-лист прогресса, магазины.

## Риски

Первым проверяем получение `world/info`: от него зависит всё остальное, и это единственный пункт, который нельзя решить кодом на нашей стороне.

| Риск | Признак | Что делаем |
| --- | --- | --- |
| Epic меняет auth или формат ответа | zod-валидация падает, `/api/health` показывает ошибку | Сайт показывает последний удачный снимок; правится только `parse.ts` и схема |
| Запросы с IP Cloudflare блокируются | 403 или 429 из Worker при работе локального скрипта | Запасной путь: GitHub Actions cron с тем же кодом из `packages/shared` пишет в KV через API Cloudflare |
| Rewrite без `/en` ломает клиентскую навигацию | 404 на `*.txt` при переходах | Проверяем на этапе 3; запасной вариант — EN тоже с префиксом `/en` и редирект с `/` |
| Справочник предметов неполный | В логах Worker неизвестные ID | Показываем ID в читаемом виде, дополняем справочник |
| Не успеваем к 7 ноября | Этап 4 не закрыт к вечеру 6-го | Урезаем визуал, но выкатываем Worker и API: данные начнут копиться в историю |

Ссылки: [эндпоинты StW](https://github.com/johngagefaulkner/Fortnite-STW), [документация эндпоинтов сообщества](https://github.com/LeleDerGrasshalmi/FortniteEndpointsDocumentation), [проект-план](https://claude.ai/artifact/VB6jDcTfZk74y6Cx6BsKRZ).
