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

1. Очищує `dist/`
2. Копіює статичні файли з `src/`
3. Оптимізує картинки (jpg/png → webp)
4. Генерує `events.js` та `events.json` з YAML
5. Створює сторінки подій (`/events/{id}/`)
6. Генерує `sitemap.xml`

## Додавання нової події

1. Створи файл `src/events/YYYY-MM-DD-event-name.yaml`:

```yaml
id: event-name-YYYY-MM-DD
name: Назва події
date: "YYYY-MM-DD"
time: "19:00"
location: Назва локації
locationForCalendar: Повна адреса
linkToMaps: https://maps.google.com/...
category: concert  # concert | open-mic | workshop
image: img/poster.webp
description: |
  Опис події.
  Може бути багаторядковим.
ticketLink: https://...
```

2. Додай постер в `src/img/` (jpg/png автоматично конвертується в webp)

3. Запусти `npm run build`

## Деплой

Автоматичний через GitHub Actions при push в `main`.

Workflow:
1. `npm ci`
2. `npm run build`
3. Deploy `dist/` на GitHub Pages

## Технології

- Vanilla JS + Bootstrap 5.3.3
- Node.js для build-скриптів
- Sharp для оптимізації картинок
- GitHub Pages для хостингу
