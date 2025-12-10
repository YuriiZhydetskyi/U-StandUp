/**
 * Header component for all pages
 */

const SITE_CONFIG = {
    name: 'У Стендап',
    tagline: 'український стендап у Кельні',
    logo: '/img/logo.webp',
    social: {
        instagram: 'https://www.instagram.com/u_standup_cologne/',
        whatsapp: 'https://chat.whatsapp.com/BXBNeksXPrJ29btgeo9BZZ',
        facebook: '' // TODO: add Facebook URL
    }
};

export function renderHeader(activePage = 'home') {
    const nav = [
        { id: 'home', label: 'Головна', href: '/' },
        { id: 'all-events', label: 'Всі події', href: '/all-events.html' },
        { id: 'about', label: 'Про нас', href: '/#about-us' },
        { id: 'clubs', label: 'Інші клуби', href: '/other-clubs.html' }
    ];

    return `
    <header>
        <nav class="navbar navbar-expand-lg navbar-dark">
            <div class="container">
                <a class="navbar-brand" href="index.html">
                    <img src="${SITE_CONFIG.logo}" alt="${SITE_CONFIG.name}" width="120" height="50">
                    <span class="brand-tagline">${SITE_CONFIG.tagline}</span>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        ${nav.map(item => `
                            <li class="nav-item">
                                <a class="nav-link ${activePage === item.id ? 'active' : ''}" href="${item.href}">${item.label}</a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </nav>
    </header>`;
}

export function initHeader(activePage = 'home') {
    document.body.insertAdjacentHTML('afterbegin', renderHeader(activePage));
}

export { SITE_CONFIG };
