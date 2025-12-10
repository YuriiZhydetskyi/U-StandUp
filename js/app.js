/**
 * Main application script for У Стендап website
 */

import events from './events.js';
import { initHeader } from './components/header.js';
import { initFooter } from './components/footer.js';
import { renderEventCard, createGoogleCalendarLink, formatDateFull, getCategoryLabel } from './components/event-card.js';

let icsModule = null;
let currentFilter = 'all';
let showPastEvents = false;
let upcomingEvents = [];
let pastEvents = [];

/**
 * URL state management - read/write filter state to URL
 */
function getFilterFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        category: params.get('category') || 'all',
        showPast: params.get('past') === 'true'
    };
}

function updateURL(category, showPast) {
    const params = new URLSearchParams();
    if (category && category !== 'all') {
        params.set('category', category);
    }
    if (showPast) {
        params.set('past', 'true');
    }
    const newURL = params.toString()
        ? `${window.location.pathname}?${params.toString()}${window.location.hash}`
        : `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, '', newURL);
}

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
    const eventsToCount = showPastEvents ? [...upcomingEvents, ...pastEvents] : upcomingEvents;

    const counts = {
        all: eventsToCount.length,
        concert: eventsToCount.filter(e => e.category === 'concert').length,
        'open-mic': eventsToCount.filter(e => e.category === 'open-mic').length,
        workshop: eventsToCount.filter(e => e.category === 'workshop').length
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
    const eventsContainer = document.getElementById('upcoming-events-list');
    const noEventsMessage = document.getElementById('no-events-message');

    if (!eventsContainer) return;

    // Combine upcoming and past events if checkbox is checked
    // Upcoming events first (sorted by date ascending), then past events (sorted by date descending)
    let allEvents = [...upcomingEvents];
    if (showPastEvents) {
        allEvents = [...upcomingEvents, ...pastEvents];
    }

    // Apply category filter
    const filteredEvents = filter === 'all'
        ? allEvents
        : allEvents.filter(e => e.category === filter);

    // Render cards
    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = '';
        noEventsMessage.style.display = 'block';
    } else {
        eventsContainer.innerHTML = filteredEvents.map(event => renderEventCard(event)).join('');
        noEventsMessage.style.display = 'none';
    }
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

            // Update URL
            updateURL(currentFilter, showPastEvents);
        });
    });
}

/**
 * Set active filter chip based on category
 */
function setActiveFilterChip(category) {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
        if (chip.dataset.filter === category) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
}

/**
 * Categorize events into upcoming and past
 */
function categorizeEvents() {
    const now = new Date();

    // Sort by date ascending for upcoming
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

    upcomingEvents = [];
    pastEvents = [];

    sortedEvents.forEach(event => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        if (eventDate >= now) {
            upcomingEvents.push(event);
        } else {
            pastEvents.push(event);
        }
    });

    // Sort past events newest first (most recent past event first)
    pastEvents.reverse();
}

/**
 * Initialize past events toggle
 */
function initPastEventsToggle() {
    const checkbox = document.getElementById('show-past-events');

    if (!checkbox) return;

    checkbox.addEventListener('change', () => {
        showPastEvents = checkbox.checked;
        updateFilterCounts();
        displayEvents(currentFilter);

        // Update URL
        updateURL(currentFilter, showPastEvents);
    });
}

function init() {
    // Initialize components
    initHeader('home');
    initFooter();

    // Categorize events
    categorizeEvents();

    // Read filter state from URL
    const urlState = getFilterFromURL();
    currentFilter = urlState.category;
    showPastEvents = urlState.showPast;

    // Set checkbox state from URL
    const checkbox = document.getElementById('show-past-events');
    if (checkbox) {
        checkbox.checked = showPastEvents;
    }

    // Display hero event
    displayHeroEvent();

    // Update filter counts
    updateFilterCounts();

    // Initialize filter chips and set active state from URL
    initFilterChips();
    setActiveFilterChip(currentFilter);

    // Initialize past events toggle
    initPastEventsToggle();

    // Display events with filter from URL
    displayEvents(currentFilter);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
