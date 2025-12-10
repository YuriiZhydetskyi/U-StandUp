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
 * Render an event card for the grid
 */
export function renderEventCard(event) {
    const dateInfo = formatDateShort(event.date);
    const isPast = new Date(`${event.date}T${event.time}`) < new Date();
    const categoryLabel = getCategoryLabel(event.category);
    const eventUrl = `/events/${event.id}/`;
    // Ensure image path is absolute
    const imageSrc = event.image ? (event.image.startsWith('/') ? event.image : `/${event.image}`) : null;

    const imageHtml = imageSrc ? `
        <div class="event-card__image-wrapper">
            <img class="event-card__image" src="${imageSrc}" alt="${event.name}" loading="lazy" onclick="openLightbox('${imageSrc}')">
            <div class="event-card__date-badge">
                <span class="day">${dateInfo.day}</span>
                <span class="month">${dateInfo.month}</span>
            </div>
            ${event.category ? `<span class="event-card__category-badge">${categoryLabel}</span>` : ''}
        </div>
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
    <article class="event-card ${isPast ? 'event-card--past' : ''} ${event.isFavorite ? 'event-card--featured' : ''} ${!imageSrc ? 'event-card--no-image' : ''}"
             data-category="${event.category || ''}" id="${event.id}">
        <div class="event-card__inner">
            ${imageSrc ? imageHtml : `
                <div class="event-card__date-badge">
                    <span class="day">${dateInfo.day}</span>
                    <span class="month">${dateInfo.month}</span>
                </div>
            `}
            <div class="event-card__body">
                <h3 class="event-card__title">${event.name}</h3>
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
