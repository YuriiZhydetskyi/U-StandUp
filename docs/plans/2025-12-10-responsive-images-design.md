# Responsive Images Build Optimization

## Overview

Автоматична генерація responsive images під час білду для оптимізації PageSpeed.

## Рішення

### Підхід
- Парсимо HTML, знаходимо `<img>` теги з `width`/`height` атрибутами
- Генеруємо 2 розміри: 1x (display) та 2x (retina)
- Оновлюємо HTML з `srcset` атрибутами
- Зображення без розмірів → warning + копіюємо як є

### Трансформація

**Вхід (src/):**
```html
<img src="img/logo.webp" width="120" height="50" alt="Logo">
```

**Вихід (dist/):**
```html
<img src="img/logo-120.webp"
     srcset="img/logo-120.webp 1x, img/logo-240.webp 2x"
     width="120" height="50" alt="Logo">
```

### Іменування файлів
- Суфікс з шириною: `logo-120.webp`, `logo-240.webp`

### Edge Cases
- SVG → копіюємо як є
- Зовнішні URL → пропускаємо
- 2x > оригінал → тільки 1x
- Без width/height → warning + копіюємо оригінал
- CSS background-image → ігноруємо (поки що)

### Залежності
- `sharp` (вже є)
- `node-html-parser` (додати)

### Інтеграція
- Модифікуємо `scripts/build-dist.js`
- GitHub Actions працює без змін
