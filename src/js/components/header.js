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
        <nav class="navbar">
            <div class="container">
                <a class="navbar-brand" href="index.html">
                    <img src="${SITE_CONFIG.logo}" alt="${SITE_CONFIG.name}" width="120" height="50">
                    <span class="brand-tagline">${SITE_CONFIG.tagline}</span>
                </a>
                <button class="navbar-toggler" type="button" aria-label="Toggle navigation" onclick="toggleMenu()">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div class="navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
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

    // Add mobile menu toggle function to window
    window.toggleMenu = function() {
        const navCollapse = document.getElementById('navbarNav');
        if (navCollapse) {
            navCollapse.classList.toggle('show');
        }
    };

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const navCollapse = document.getElementById('navbarNav');
        const toggler = document.querySelector('.navbar-toggler');
        if (navCollapse && navCollapse.classList.contains('show')) {
            if (!navCollapse.contains(e.target) && !toggler.contains(e.target)) {
                navCollapse.classList.remove('show');
            }
        }
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const navCollapse = document.getElementById('navbarNav');
            if (navCollapse) {
                navCollapse.classList.remove('show');
            }
        });
    });
}

export { SITE_CONFIG };
