/**
 * Build script to generate static HTML pages for each event
 * This helps SEO by creating individual pages with proper meta tags
 *
 * Usage: npm run build-pages
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const EVENTS_JSON = path.join(SRC_DIR, 'data', 'events.json');
const EVENTS_DIR = path.join(SRC_DIR, 'events');
const OUTPUT_DIR = path.join(EVENTS_DIR);

// Load shared constants
const constants = require('../src/data/constants.json');
const SITE_URL = constants.SITE_URL;
const categoryLabels = constants.CATEGORY_LABELS;
const MONTHS_FULL = constants.MONTHS_FULL;

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getDate()} ${MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDateISO(dateString, time) {
    return `${dateString}T${time}:00`;
}

function stripHtml(html) {
    return (html || '').replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim().substring(0, 200);
}

function generateEventPage(event) {
    const eventUrl = `${SITE_URL}/events/${event.id}/`;
    const imageUrl = event.image ? `${SITE_URL}/${event.image}` : `${SITE_URL}/img/og-image.webp`;
    const categoryLabel = categoryLabels[event.category] || 'Подія';
    const description = stripHtml(event.description || '');
    const startDateTime = formatDateISO(event.date, event.time);
    const endDateTime = formatDateISO(event.date,
        `${(parseInt(event.time.split(':')[0]) + 2).toString().padStart(2, '0')}:${event.time.split(':')[1]}`);

    return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- SEO -->
    <title>${event.name} | У Стендап</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${eventUrl}">

    <!-- Open Graph -->
    <meta property="og:type" content="event">
    <meta property="og:url" content="${eventUrl}">
    <meta property="og:title" content="${event.name}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:locale" content="uk_UA">
    <meta property="event:start_time" content="${startDateTime}">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${event.name}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">

    <!-- Geo -->
    <meta name="geo.region" content="DE-NW">
    <meta name="geo.placename" content="Köln">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="../../img/favicon.svg">

    <!-- Styles -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../../css/style.css">
    <style>
        .event-page {
            padding: 2rem 0;
        }
        .event-page__header {
            margin-bottom: 2rem;
        }
        .event-page__category {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: var(--color-accent);
            color: var(--color-primary);
            border-radius: var(--radius-sm);
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        .event-page__title {
            font-size: 2rem;
            font-weight: 700;
            color: var(--color-primary);
            margin-bottom: 1rem;
        }
        .event-page__meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            margin-bottom: 2rem;
            font-size: 1.1rem;
        }
        .event-page__meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .event-page__image {
            width: 100%;
            max-width: 600px;
            border-radius: var(--radius-lg);
            margin-bottom: 2rem;
            cursor: pointer;
        }
        .event-page__description {
            font-size: 1.1rem;
            line-height: 1.8;
            white-space: pre-line;
            margin-bottom: 2rem;
        }
        .event-page__actions {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 3rem;
        }
        .event-page__back {
            margin-top: 2rem;
        }

        /* Lightbox */
        .lightbox {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 9999;
            cursor: pointer;
            justify-content: center;
            align-items: center;
        }
        .lightbox.active {
            display: flex;
        }
        .lightbox img {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
        }
        .lightbox__close {
            position: absolute;
            top: 20px;
            right: 30px;
            color: white;
            font-size: 2rem;
            cursor: pointer;
        }

        @media (min-width: 768px) {
            .event-page__title {
                font-size: 2.5rem;
            }
        }
    </style>

    <!-- Schema.org Event -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": "${event.name.replace(/"/g, '\\"')}",
        "description": "${description.replace(/"/g, '\\"')}",
        "startDate": "${startDateTime}",
        "endDate": "${endDateTime}",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": {
            "@type": "Place",
            "name": "${(event.location || '').replace(/"/g, '\\"')}",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "${(event.locationForCalendar || event.location || '').replace(/"/g, '\\"')}",
                "addressLocality": "Köln",
                "addressCountry": "DE"
            }
        },
        "organizer": {
            "@type": "Organization",
            "name": "У Стендап",
            "url": "${SITE_URL}"
        },
        "image": "${imageUrl}"${event.ticketLink ? `,
        "offers": {
            "@type": "Offer",
            "url": "${event.ticketLink}",
            "availability": "https://schema.org/InStock"
        }` : ''}
    }
    </script>
</head>
<body>
    <!-- Header -->
    <header>
        <nav class="navbar navbar-expand-lg navbar-dark">
            <div class="container">
                <a class="navbar-brand" href="/">
                    <img src="/img/logo.webp" alt="У Стендап" width="120" height="50">
                    <span class="brand-tagline">український стендап у Кельні</span>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item"><a class="nav-link" href="/">Головна</a></li>
                        <li class="nav-item"><a class="nav-link active" href="/all-events.html">Всі події</a></li>
                        <li class="nav-item"><a class="nav-link" href="/#about-us">Про нас</a></li>
                        <li class="nav-item"><a class="nav-link" href="/other-clubs.html">Інші клуби</a></li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>

    <article class="event-page">
        <div class="container">
            <div class="event-page__header">
                <span class="event-page__category">${categoryLabel}</span>
                <h1 class="event-page__title">${event.name}</h1>
                <div class="event-page__meta">
                    <div class="event-page__meta-item">
                        <strong>📅</strong> ${formatDate(event.date)}
                    </div>
                    <div class="event-page__meta-item">
                        <strong>🕐</strong> ${event.time}
                    </div>
                    <div class="event-page__meta-item">
                        <strong>📍</strong> ${event.linkToMaps
                            ? `<a href="${event.linkToMaps}" target="_blank" rel="noopener">${event.location}</a>`
                            : event.location}
                    </div>
                </div>
            </div>

            ${event.image ? `
            <img src="../../${event.image}" alt="${event.name}" class="event-page__image" onclick="openLightbox(this.src)">
            ` : ''}

            <div class="event-page__description">
${event.description || ''}
            </div>

            <div class="event-page__actions">
                ${event.ticketLink ? `<a href="${event.ticketLink}" target="_blank" class="btn btn-primary btn-lg">Купити квитки</a>` : ''}
                <a href="${createGoogleCalendarLink(event)}" target="_blank" class="btn btn-outline-secondary">Google Calendar</a>
                <button onclick="generateICS()" class="btn btn-outline-secondary">Apple Calendar</button>
            </div>

            <a href="../../" class="event-page__back">&larr; Назад до всіх подій</a>
        </div>
    </article>

    <!-- Lightbox -->
    <div class="lightbox" id="lightbox" onclick="closeLightbox()">
        <span class="lightbox__close">&times;</span>
        <img src="" alt="" id="lightbox-img">
    </div>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-info">
                    <p class="footer-copyright">&copy; ${new Date().getFullYear()} У Стендап. Усі права захищені.</p>
                    <p class="footer-location">Köln, Deutschland</p>
                </div>
                <div class="footer-social">
                    <a href="https://www.instagram.com/u_standup_cologne/" target="_blank" rel="noopener" aria-label="Instagram">
                        <img src="/img/instagram-icon.svg" alt="Instagram" width="32" height="32">
                    </a>
                    <a href="https://chat.whatsapp.com/BXBNeksXPrJ29btgeo9BZZ" target="_blank" rel="noopener" aria-label="WhatsApp">
                        <img src="/img/whatsapp-icon.svg" alt="WhatsApp" width="32" height="32">
                    </a>
                </div>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function openLightbox(src) {
            document.getElementById('lightbox-img').src = src;
            document.getElementById('lightbox').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            document.getElementById('lightbox').classList.remove('active');
            document.body.style.overflow = '';
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });

        async function generateICS() {
            const event = ${JSON.stringify({
                id: event.id,
                name: event.name,
                date: event.date,
                time: event.time,
                description: stripHtml(event.description || ''),
                location: event.locationForCalendar || event.location,
                linkToMaps: event.linkToMaps
            })};

            const ics = await import('../../ics-browserified.js');
            const icsModule = ics.default || ics;

            const startDate = new Date(event.date + 'T' + event.time);
            const icsEvent = {
                start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes()],
                duration: { hours: 2 },
                title: event.name,
                description: event.description,
                location: event.location,
                url: event.linkToMaps,
                status: 'CONFIRMED',
                busyStatus: 'BUSY',
                productId: 'u-standup/ics',
                alarms: [{ action: 'display', trigger: { hours: 2, before: true } }]
            };

            icsModule.createEvent(icsEvent, (error, value) => {
                if (error) { console.error(error); return; }
                const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = event.name + '.ics';
                link.click();
            });
        }
    </script>

    <!-- Analytics -->
    <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "e9e3d01d906d4f06946bb1f72ba15410"}'></script>
    <script src="/js/analytics.js"></script>
</body>
</html>`;
}

function createGoogleCalendarLink(event) {
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const encodedName = encodeURIComponent(event.name);
    const encodedDescription = encodeURIComponent(stripHtml(event.description || ''));
    const encodedLocation = encodeURIComponent(event.locationForCalendar || event.location);

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedName}&dates=${startDate.toISOString().replace(/-|:|\.\d\d\d/g, '')}/${endDate.toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodedDescription}&location=${encodedLocation}`;
}

/**
 * Generate sitemap.xml with all pages
 */
function generateSitemap(events) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Categorize events
    const upcomingEvents = events.filter(e => new Date(`${e.date}T${e.time}`) >= now);
    const pastEvents = events.filter(e => new Date(`${e.date}T${e.time}`) < now);

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Main Pages -->
    <url>
        <loc>${SITE_URL}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${SITE_URL}/all-events.html</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${SITE_URL}/other-clubs.html</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
`;

    // Upcoming events (higher priority)
    if (upcomingEvents.length > 0) {
        sitemap += `
    <!-- Upcoming Events -->`;
        for (const event of upcomingEvents) {
            sitemap += `
    <url>
        <loc>${SITE_URL}/events/${event.id}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
        }
    }

    // Past events (lower priority)
    if (pastEvents.length > 0) {
        sitemap += `

    <!-- Past Events -->`;
        for (const event of pastEvents) {
            sitemap += `
    <url>
        <loc>${SITE_URL}/events/${event.id}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.4</priority>
    </url>`;
        }
    }

    sitemap += `

    <!-- Resources -->
    <url>
        <loc>${SITE_URL}/data/events.json</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.5</priority>
    </url>
</urlset>
`;

    return sitemap;
}

function buildEventPages() {
    console.log('Building event pages...\n');

    const events = JSON.parse(fs.readFileSync(EVENTS_JSON, 'utf8'));

    for (const event of events) {
        const eventDir = path.join(OUTPUT_DIR, event.id);

        // Create directory if it doesn't exist
        if (!fs.existsSync(eventDir)) {
            fs.mkdirSync(eventDir, { recursive: true });
        }

        const html = generateEventPage(event);
        const outputPath = path.join(eventDir, 'index.html');
        fs.writeFileSync(outputPath, html, 'utf8');

        console.log(`✓ events/${event.id}/index.html`);
    }

    console.log(`\nGenerated ${events.length} event pages`);

    // Generate sitemap
    console.log('\nGenerating sitemap.xml...');
    const sitemap = generateSitemap(events);
    const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log('✓ sitemap.xml');
}

buildEventPages();
