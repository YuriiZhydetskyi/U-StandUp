/**
 * Shared constants for U-StandUp website
 * This module provides constants that are used across the application
 */

export const SITE_URL = 'https://www.ustandup.club';

export const CATEGORY_LABELS = {
    'concert': 'Концерт',
    'open-mic': 'Відкритий мікрофон',
    'workshop': 'Читка'
};

export const MONTHS_SHORT = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];

export const MONTHS_FULL = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

export const DAYS_FULL = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];

/**
 * Get category label in Ukrainian
 */
export function getCategoryLabel(category) {
    return CATEGORY_LABELS[category] || category;
}

/**
 * Format date as DD.MM.YYYY
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

/**
 * Format date as short format (day + month abbreviation)
 */
export function formatDateShort(dateString) {
    const date = new Date(dateString);
    return {
        day: date.getDate(),
        month: MONTHS_SHORT[date.getMonth()],
        year: date.getFullYear()
    };
}

/**
 * Format date as full Ukrainian format (e.g., "Понеділок, 15 грудня 2025")
 */
export function formatDateFull(dateString) {
    const date = new Date(dateString);
    return `${DAYS_FULL[date.getDay()]}, ${date.getDate()} ${MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format date for Schema.org (ISO format with time)
 */
export function formatDateISO(dateString, time) {
    return `${dateString}T${time}:00`;
}

/**
 * Strip HTML tags from string
 */
export function stripHtml(html) {
    return (html || '').replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim();
}

/**
 * Create Google Calendar link for an event
 */
export function createGoogleCalendarLink(event) {
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const encodedName = encodeURIComponent(event.name);
    const encodedDescription = encodeURIComponent(stripHtml(event.description));
    const encodedLocation = encodeURIComponent(event.locationForCalendar || event.location);

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedName}&dates=${startDate.toISOString().replace(/-|:|\.\d\d\d/g, '')}/${endDate.toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodedDescription}&location=${encodedLocation}`;
}
