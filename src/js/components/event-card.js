/**
 * Event card component - new design with larger images and filter support
 */

import {
    getCategoryLabel,
    formatDate,
    formatDateShort,
    formatDateFull,
    createGoogleCalendarLink
} from '../utils/constants.js';

// Re-export utilities for backward compatibility
export { getCategoryLabel, formatDate, formatDateShort, formatDateFull, createGoogleCalendarLink };

/**
 * Get responsive image attributes for event cards
 * Returns src, srcset and sizes for optimal loading
 */
export function getResponsiveImageAttrs(imagePath, responsiveSizes) {
    if (!imagePath) return null;
    const basePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    const pathWithoutExt = basePath.replace(/\.(webp|gif|jpg|jpeg|png)$/, '');

    // Use actual generated sizes from build, fallback to default set
    const sizes = responsiveSizes || [300, 400, 600, 800, 1000];

    return {
        src: `${pathWithoutExt}-400.webp`,
        srcset: sizes.map(s => `${pathWithoutExt}-${s}.webp ${s}w`).join(', '),
        // Unified sizes with hero section to enable browser caching
        // When same image appears in hero and card, browser downloads once
        sizes: '(min-width: 768px) 400px, min(450px, 100vw)'
    };
}

/**
 * Render an event card for the grid
 */
export function renderEventCard(event) {
    const dateInfo = formatDateShort(event.date);
    const isPast = new Date(`${event.date}T${event.time}`) < new Date();
    const categoryLabel = getCategoryLabel(event.category);
    const eventUrl = `/events/${event.id}/`;
    // Get responsive image attributes
    const imgAttrs = getResponsiveImageAttrs(event.image, event.responsiveSizes);

    const imageHtml = imgAttrs ? `
        <a href="${eventUrl}" class="event-card__image-wrapper">
            <img class="event-card__image" src="${imgAttrs.src}" srcset="${imgAttrs.srcset}" sizes="${imgAttrs.sizes}" alt="${event.name}" loading="lazy" width="350" height="220">
            <div class="event-card__date-badge">
                <span class="day">${dateInfo.day}</span>
                <span class="month">${dateInfo.month}</span>
            </div>
            ${event.category ? `<span class="event-card__category-badge">${categoryLabel}</span>` : ''}
        </a>
    ` : '';

    const locationHtml = event.linkToMaps
        ? `<a href="${event.linkToMaps}" target="_blank" rel="noopener">${event.location}</a>`
        : event.location;

    const ticketButton = (event.ticketLink || event.googleFormLink) && !isPast
        ? `<a href="${event.ticketLink || event.googleFormLink}" target="_blank" class="btn btn-primary btn-sm">Квитки</a>`
        : '';

    const descriptionHtml = event.description
        ? `<div class="event-card__description">${event.description.replace(/<[^>]*>/g, '')}</div>`
        : '';

    return `
    <article class="event-card ${isPast ? 'event-card--past' : ''} ${event.isFavorite ? 'event-card--featured' : ''} ${!imgAttrs ? 'event-card--no-image' : ''}"
             data-category="${event.category || ''}" id="${event.id}">
        <div class="event-card__inner">
            ${imgAttrs ? imageHtml : `
                <div class="event-card__date-badge">
                    <span class="day">${dateInfo.day}</span>
                    <span class="month">${dateInfo.month}</span>
                </div>
            `}
            <div class="event-card__body">
                <h3 class="event-card__title"><a href="${eventUrl}">${event.name}</a></h3>
                <div class="event-card__meta">
                    <span>${event.time}</span>
                    <span>${locationHtml}</span>
                </div>
                ${descriptionHtml}
                <div class="event-card__actions">
                    ${ticketButton}
                    <a href="${eventUrl}" class="btn btn-link">Дізнатися більше →</a>
                </div>
            </div>
        </div>
    </article>`;
}

/**
 * Render a compact past event item
 */
export function renderPastEventItem(event) {
    const dateInfo = formatDateShort(event.date);
    const eventUrl = `/events/${event.id}/`;

    return `
    <article class="past-event-item" id="${event.id}">
        <div class="past-event-item__date">
            <span class="past-event-item__day">${dateInfo.day}</span>
            <span class="past-event-item__month">${dateInfo.month}</span>
        </div>
        <div class="past-event-item__info">
            <h3 class="past-event-item__title">${event.name}</h3>
            <p class="past-event-item__meta">${event.time} · ${event.location}</p>
        </div>
        <a href="${eventUrl}" class="btn btn-link btn-sm">Деталі</a>
    </article>`;
}

export function renderEventList(events, container, options = {}) {
    const html = events.map(event => renderEventCard(event, options)).join('');
    if (typeof container === 'string') {
        document.getElementById(container).innerHTML = html;
    } else {
        container.innerHTML = html;
    }
}
