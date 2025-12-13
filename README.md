# У Стендап

Вебсайт українського стендап-клубу в Кельні.

**Live:** https://u-standup.de

## Швидкий старт

```bash
npm install        # Встановити залежності
npm run build      # Зібрати проєкт
npm start          # Запустити локальний сервер
```

Сайт буде доступний на http://localhost:3000

## Структура проєкту

```
U-StandUp/
├── src/                    # Вихідний код
│   ├── events/*.yaml       # Події (YAML)
│   ├── css/                # Стилі
│   ├── js/                 # JavaScript
│   ├── img/                # Картинки
│   ├── data/               # Дані (constants.json)
│   ├── index.html          # Головна сторінка
│   ├── all-events.html     # Всі події
│   └── other-clubs.html    # Інші клуби
├── dist/                   # Зібраний сайт (в .gitignore)
├── scripts/                # Build-скрипти
└── .github/workflows/      # GitHub Actions
```

## Скрипти

| Команда | Опис |
|---------|------|
| `npm run build` | Збирає проєкт в dist/ |
| `npm start` | Запускає локальний сервер з dist/ |
| `npm run optimize-images` | Конвертує jpg/png в webp |
| `npm run standardize-ids` | Стандартизує ID подій |
| `npm run standardize-ids:preview` | Попередній перегляд змін ID |

## Що робить build

Головний build-скрипт: `scripts/build-dist.js`

### Етапи збірки

```
npm run build
    ├── npm run generate-favicons    # Генерує favicon різних розмірів
    ├── node scripts/build-dist.js   # Основна збірка (детально нижче)
    └── npm run build:css            # Tailwind CSS → dist/css/style.css
```

### Детальний опис build-dist.js

#### 1. Парсинг HTML для розмірів картинок
```
parseHtmlForImageDimensions()
```
- Сканує всі `.html` та `.js` файли в `src/`
- Знаходить теги `<img>` з атрибутами `width` та `height`
- Парсить YAML події для знаходження шляхів до постерів (базовий розмір 400px)
- Парсить логотипи клубів з `other-clubs.html` (80x80)
- Зберігає карту `imagePath → { width, height }`

#### 2. Очищення dist/
```
cleanDist()
```
- Видаляє існуючу папку `dist/`
- Створює нову порожню папку

#### 3. Генерація responsive картинок
```
generateResponsiveImages()
```
- Читає карту розмірів з етапу 1
- Для кожної картинки генерує кілька розмірів:
  - **Великі картинки** (постери подій): `[300, 400, 600, 800, 1000, 1200]px`
  - **Маленькі картинки** (логотипи): `[80, 120, 160, 240]px`
- Конвертує в WebP з якістю 80%
- Іменування: `image-{width}.webp` (напр. `poster-400.webp`, `poster-800.webp`)
- Favicon-и копіюються без змін (PNG для сумісності)
- SVG, GIF, ICO копіюються як є

#### 4. Копіювання статичних файлів
```
copyStaticFiles()
```
- Копіює HTML файли з трансформацією `srcset`
- Копіює папки: `js/`, `data/`, `ThankYouPage/`
- Копіює файли: `robots.txt`, `llms.txt`, `CNAME`, тощо
- Створює папку `css/` для Tailwind

**Трансформація HTML:**
- Змінює `src` на responsive версію (`image.webp` → `image-400.webp`)
- Додає атрибут `srcset` для 1x/2x DPR

#### 5. Pre-rendering хедера
```
preRenderHeader()
```
- Замінює `<!-- Header is injected by JS -->` на готовий HTML хедера
- Додає responsive `srcset` для логотипу
- Обробляє: `index.html`, `all-events.html`, `other-clubs.html`

#### 6. Збірка подій з YAML
```
buildEvents()
```
- Читає всі `.yaml` файли з `src/events/`
- Сортує: спочатку `isFavorite`, потім за датою (новіші першими)
- Генерує:
  - `dist/js/events.js` — ES модуль для імпорту
  - `dist/data/events.json` — JSON API

**Поля YAML події:**
```yaml
id: event-id
name: Назва
date: "YYYY-MM-DD"
time: "HH:MM"
location: Коротка адреса
locationForCalendar: Повна адреса для календаря
linkToMaps: https://maps.google.com/...
category: concert | open-mic | workshop | meetup
image: img/poster.webp
isFavorite: true  # Показувати в hero секції
geo:
  region: DE-NW
  placename: Köln
seo:
  description: "SEO опис для meta тегів"
ticketLink: https://...
googleFormLink: https://...
performer:              # Schema.org performer (опціонально)
  "@type": Person
  name: Ім'я
  jobTitle: Стендап-комік
  sameAs:
    - https://instagram.com/...
  description: "Опис"
offers:                 # Schema.org offers (опціонально)
  "@type": Offer
  price: 0
  priceCurrency: EUR
  availability: https://schema.org/InStock
  description: "Вхід — будь-яка паперова купюра"
description: |
  Багаторядковий опис події.
  Може містити HTML.
```

#### 7. Pre-rendering hero секції
```
preRenderHeroSection(events)
```
- Знаходить найближчу майбутню подію з `isFavorite` та `image`
- Замінює приховану hero секцію на заповнену
- Додає `<link rel="preload">` для hero картинки
- Покращує LCP (Largest Contentful Paint)

#### 8. Генерація сторінок подій
```
buildEventPages(events)
```
- Створює `dist/events/{id}/index.html` для кожної події
- Включає:
  - SEO meta теги (OG, Twitter Cards)
  - Schema.org Event JSON-LD з `performer` та `offers`
  - Google Calendar та Apple Calendar інтеграція
  - Lightbox для перегляду постера
  - Responsive картинки з srcset

**Schema.org JSON-LD включає:**
- `@type`: Event
- `name`, `description`, `startDate`, `endDate`
- `location` з адресою
- `organizer`: У Стендап
- `image`
- `performer` (якщо вказано в YAML)
- `offers` (якщо вказано в YAML, або автоматично з ticketLink)

#### 9. Генерація sitemap
```
generateSitemap(events)
```
- `sitemap.xml` — XML формат для пошукових систем
- `sitemap.txt` — простий текстовий формат
- Пріоритети:
  - Головна: 1.0
  - Майбутні події: 0.8
  - Минулі події: 0.4

### Карта генерованих файлів

```
dist/
├── index.html              # Pre-rendered hero + header
├── all-events.html         # Pre-rendered header
├── other-clubs.html        # Pre-rendered header
├── events/
│   └── {event-id}/
│       └── index.html      # Сторінка події з JSON-LD
├── img/
│   ├── poster-300.webp     # Responsive варіанти
│   ├── poster-400.webp
│   ├── poster-600.webp
│   ├── poster-800.webp
│   ├── logo-80.webp
│   ├── logo-120.webp
│   └── ...
├── js/
│   ├── events.js           # ES модуль з подіями
│   └── ...
├── data/
│   └── events.json         # JSON API
├── css/
│   └── style.css           # Tailwind (мініфікований)
├── sitemap.xml
└── sitemap.txt
```

### Оптимізації

1. **Responsive Images** — браузер вибирає оптимальний розмір
2. **WebP формат** — до 90% економії розміру
3. **Pre-rendering** — швидший FCP та LCP
4. **Image preload** — hero картинка завантажується першою
5. **Srcset з w-дескрипторами** — підтримка різних DPR

## Додавання нової події

1. Створи файл `src/events/YYYY-MM-DD-event-name.yaml`:

```yaml
id: YYYY-MM-DD-event-name
name: Назва події
category: concert  # concert | open-mic | workshop | meetup
date: "YYYY-MM-DD"
time: "19:00"
location: Назва локації
locationForCalendar: Повна адреса для календаря
linkToMaps: https://maps.google.com/...
image: img/poster.webp
isFavorite: true  # (опціонально) показувати в hero секції
geo:
  region: DE-NW
  placename: Köln
seo:
  description: "Короткий SEO опис для пошукових систем"
# Для платних подій:
ticketLink: https://eventbrite.com/...
# Для open-mic з донатом:
offers:
  "@type": Offer
  price: 0
  priceCurrency: EUR
  availability: https://schema.org/InStock
  description: "Вхід — будь-яка паперова купюра"
# Для сольних концертів:
performer:
  "@type": Person
  name: Ім'я Виконавця
  jobTitle: Стендап-комік
  sameAs:
    - https://instagram.com/performer
  description: "Короткий опис виконавця"
description: |
  Опис події.
  Може бути багаторядковим.
  Може містити <a href="...">HTML посилання</a>.
```

2. Додай постер в `src/img/` (jpg/png автоматично конвертується в webp)

3. Запусти `npm run build`

### Типи подій та їх особливості

| Категорія | Опис | Особливості |
|-----------|------|-------------|
| `concert` | Великі концерти | Зазвичай мають `ticketLink` та `performer` |
| `open-mic` | Відкриті мікрофони | Зазвичай мають `offers` з "будь-яка паперова купюра" |
| `workshop` | Майстер-класи | Можуть мати `ticketLink` |
| `meetup` | Зустрічі клубу | Зазвичай без квитків |

## Деплой

Автоматичний через GitHub Actions при push в `main`.

Workflow:
1. `npm ci`
2. `npm run build`
3. Deploy `dist/` на GitHub Pages

## Технології

- **Frontend:** Vanilla JS + Tailwind CSS
- **Build:** Node.js
  - `sharp` — оптимізація та ресайз картинок
  - `js-yaml` — парсинг YAML подій
  - `node-html-parser` — трансформація HTML
  - `@tailwindcss/cli` — генерація CSS
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions
