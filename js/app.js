/**
 * Main application script for У Стендап website
 */

import events from './events.js';
import { initHeader } from './components/header.js';
import { initFooter } from './components/footer.js';
import { renderEventCard, renderPastEventItem, createGoogleCalendarLink, formatDateFull, getCategoryLabel } from './components/event-card.js';

let icsModule = null;
let currentFilter = 'all';
let upcomingEvents = [];
let pastEvents = [];

// Lightbox functions (global)
window.openLightbox = function(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    if (lightbox && lightboxImage) {
        lightboxImage.src = imageSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeLightbox = function() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Close lightbox on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeLightbox();
    }
});

// ICS generation for Apple Calendar
window.generateICS = async function(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    function createICSFile(ics) {
        const startDate = new Date(`${event.date}T${event.time}`);

        const icsEvent = {
            start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes()],
            duration: { hours: 2 },
            title: event.name,
            description: event.description?.replace(/<[^>]*>/g, '') || '',
            location: event.locationForCalendar || event.location,
            url: event.linkToMaps,
            status: 'CONFIRMED',
            busyStatus: 'BUSY',
            productId: 'u-standup/ics',
            alarms: [{ action: 'display', trigger: { hours: 2, before: true } }]
        };

        ics.createEvent(icsEvent, (error, value) => {
            if (error) {
                console.error(error);
                return;
            }

            const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${event.name}.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    if (icsModule) {
        createICSFile(icsModule);
    } else {
        const ics = await import('../ics-browserified.js');
        icsModule = ics.default || ics;
        createICSFile(icsModule);
    }
};

/**
 * Display the hero event (nearest featured upcoming event)
 */
function displayHeroEvent() {
    const heroSection = document.getElementById('hero-event');
    if (!heroSection || upcomingEvents.length === 0) return;

    // Find the nearest featured event, or just the nearest event
    const heroEvent = upcomingEvents.find(e => e.isFavorite && e.image) || upcomingEvents.find(e => e.image) || upcomingEvents[0];
    if (!heroEvent || !heroEvent.image) return;

    // Ensure image path is absolute
    const imageSrc = heroEvent.image.startsWith('/') ? heroEvent.image : `/${heroEvent.image}`;

    // Populate hero section
    document.getElementById('hero-event-image').src = imageSrc;
    document.getElementById('hero-event-image').alt = heroEvent.name;
    document.getElementById('hero-event-badge').textContent = getCategoryLabel(heroEvent.category) || 'Подія';
    document.getElementById('hero-event-title').textContent = heroEvent.name;
    document.getElementById('hero-event-date').textContent = formatDateFull(heroEvent.date);
    document.getElementById('hero-event-time').textContent = heroEvent.time;

    const locationEl = document.getElementById('hero-event-location');
    if (heroEvent.linkToMaps) {
        locationEl.innerHTML = `<a href="${heroEvent.linkToMaps}" target="_blank" rel="noopener" style="color: white;">${heroEvent.location}</a>`;
    } else {
        locationEl.textContent = heroEvent.location;
    }

    // Description (truncated)
    const descEl = document.getElementById('hero-event-description');
    if (heroEvent.description) {
        descEl.innerHTML = heroEvent.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
    }

    // Actions
    const actionsEl = document.getElementById('hero-event-actions');
    let actionsHtml = '';

    if (heroEvent.ticketLink || heroEvent.googleFormLink) {
        actionsHtml += `<a href="${heroEvent.ticketLink || heroEvent.googleFormLink}" target="_blank" class="btn btn-primary">Придбати квитки</a>`;
    }
    actionsHtml += `<a href="/events/${heroEvent.id}/" class="btn btn-outline-light">Дізнатися більше</a>`;

    actionsEl.innerHTML = actionsHtml;

    // Show the hero section
    heroSection.style.display = 'block';
}

/**
 * Update filter chip counts
 */
function updateFilterCounts() {
    const counts = {
        all: upcomingEvents.length,
        concert: upcomingEvents.filter(e => e.category === 'concert').length,
        'open-mic': upcomingEvents.filter(e => e.category === 'open-mic').length,
        workshop: upcomingEvents.filter(e => e.category === 'workshop').length
    };

    document.getElementById('count-all').textContent = counts.all;
    document.getElementById('count-concert').textContent = counts.concert;
    document.getElementById('count-open-mic').textContent = counts['open-mic'];
    document.getElementById('count-workshop').textContent = counts.workshop;
}

/**
 * Filter and display events
 */
function displayEvents(filter = 'all') {
    const upcomingContainer = document.getElementById('upcoming-events-list');
    const noEventsMessage = document.getElementById('no-events-message');

    if (!upcomingContainer) return;

    // Filter upcoming events
    const filteredEvents = filter === 'all'
        ? upcomingEvents
        : upcomingEvents.filter(e => e.category === filter);

    // Render cards
    if (filteredEvents.length === 0) {
        upcomingContainer.innerHTML = '';
        noEventsMessage.style.display = 'block';
    } else {
        upcomingContainer.innerHTML = filteredEvents.map(event => renderEventCard(event)).join('');
        noEventsMessage.style.display = 'none';
    }
}

/**
 * Display past events (only last 2 weeks)
 */
function displayPastEvents() {
    const pastContainer = document.getElementById('past-events-list');
    const pastSection = document.getElementById('past-events');

    if (!pastContainer || !pastSection) return;

    if (pastEvents.length === 0) {
        pastSection.style.display = 'none';
        return;
    }

    pastContainer.innerHTML = pastEvents.map(event => renderPastEventItem(event)).join('');
    pastSection.style.display = 'block';
}

/**
 * Initialize filter chips
 */
function initFilterChips() {
    const chips = document.querySelectorAll('.filter-chip');

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Update active state
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Filter events
            currentFilter = chip.dataset.filter;
            displayEvents(currentFilter);
        });
    });
}

/**
 * Categorize events into upcoming and past
 */
function categorizeEvents() {
    const now = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);

    // Sort by date ascending
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

    upcomingEvents = [];
    pastEvents = [];

    sortedEvents.forEach(event => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        if (eventDate >= now) {
            upcomingEvents.push(event);
        } else if (eventDate >= twoWeeksAgo) {
            // Only show past events from last 2 weeks
            pastEvents.push(event);
        }
    });

    // Sort past events newest first
    pastEvents.reverse();
}

function init() {
    // Initialize components
    initHeader('home');
    initFooter();

    // Categorize events
    categorizeEvents();

    // Display hero event
    displayHeroEvent();

    // Update filter counts
    updateFilterCounts();

    // Initialize filter chips
    initFilterChips();

    // Display events
    displayEvents();
    displayPastEvents();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
